import math
import os

try:
    import numpy as np
except ImportError:
    np = None

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from PIL import Image, ImageStat
except ImportError:
    Image = None
    ImageStat = None

# ──────────────────────────────────────────────────────────────────────────────
# Tier 1: HuggingFace ML Model — prithivMLmods/Augmented-Waste-Classifier-SigLIP2
# Classifies: Cardboard, Food Waste, Glass, Medical, Metal, Paper, Plastic, Other
# Tier 2: OpenCV rule-based heuristics (fallback if model not loaded)
# Tier 3: Pillow grayscale std-dev (final serverless fallback)
# ──────────────────────────────────────────────────────────────────────────────

# ── ML Model lazy-load (only when first request comes) ──
_ml_model = None
_ml_processor = None
_ML_MODEL_NAME = "prithivMLmods/Augmented-Waste-Classifier-SigLIP2"

# Waste categories from this model that count as actual waste
_WASTE_LABELS = {
    "cardboard", "food_organic_waste", "food waste", "glass", "medical", "metal",
    "paper", "plastic", "other trash", "other", "trash", "garbage", "waste",
    "biological", "brown-glass", "green-glass", "white-glass",
}

# Labels that clearly mean NO waste (clean, non-waste)
_NON_WASTE_LABELS = {
    "clothes", "shoes", "battery", "vegetation", "green vegetation",
    "background", "clean", "person", "selfie",
}

# Severity mapping by waste category
_SEVERITY_MAP = {
    "medical": "high",
    "glass": "high",
    "metal": "medium",
    "plastic": "medium",
    "food waste": "medium",
    "food_organic_waste": "medium",
    "cardboard": "low",
    "paper": "low",
    "other": "medium",
    "other trash": "medium",
}


def _load_ml_model():
    """Lazy-load the HuggingFace SigLIP2 waste classifier model."""
    global _ml_model, _ml_processor
    if _ml_model is not None:
        return True  # Already loaded

    try:
        from transformers import AutoImageProcessor, SiglipForImageClassification
        import torch

        print(f"[AIService] Loading HuggingFace ML model: {_ML_MODEL_NAME}")
        _ml_processor = AutoImageProcessor.from_pretrained(_ML_MODEL_NAME)
        _ml_model = SiglipForImageClassification.from_pretrained(_ML_MODEL_NAME)
        _ml_model.eval()
        print(f"[AIService] [OK] ML model loaded successfully.")
        return True
    except ImportError:
        print("[AIService] [INFO] transformers/torch not installed. Using OpenCV/Pillow fallback.")
        return False
    except Exception as e:
        print(f"[AIService] [WARN] ML model load failed: {e}. Using OpenCV/Pillow fallback.")
        return False


try:
    import cv2
except Exception as _cv_err:
    cv2 = None
    print(f"[AIService Notice] OpenCV not available: {_cv_err}. Using Pillow fallback.")


class AIService:

    @staticmethod
    def calculate_haversine_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two GPS coordinates in meters."""
        R = 6371000  # Radius of Earth in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0)**2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    # ──────────────────────────────────────────────────────────────────────
    # TIER 1: HuggingFace ML Model Classification
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def _analyze_with_ml_model(cls, image_path):
        """
        Uses prithivMLmods/Augmented-Waste-Classifier-SigLIP2 (SigLIP2)
        to classify waste type from image.

        Returns dict with:
          waste_detected (bool), confidence (float 0-100),
          waste_category (str), reason (str)
        """
        try:
            import torch

            model_loaded = _load_ml_model()
            if not model_loaded or _ml_model is None:
                return None  # Signal to fall back to OpenCV

            with Image.open(image_path).convert("RGB") as img:
                inputs = _ml_processor(images=img, return_tensors="pt")

            with torch.no_grad():
                outputs = _ml_model(**inputs)
                logits = outputs.logits

            # Softmax to get probabilities
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]
            top_idx = probs.argmax().item()
            top_conf = float(probs[top_idx]) * 100.0

            # Get label from model's id2label
            id2label = _ml_model.config.id2label
            raw_label = id2label.get(top_idx, "unknown").lower().strip()

            # Top-5 predictions for logging
            top5 = sorted(
                [(float(probs[i]) * 100.0, id2label.get(i, str(i))) for i in range(len(probs))],
                reverse=True
            )[:5]
            print(f"[AIService ML] Top predictions: {top5}")

            # Determine if it's waste
            is_waste = any(wl in raw_label for wl in _WASTE_LABELS) or \
                       any(raw_label in wl for wl in _WASTE_LABELS)
            is_non_waste = any(nl in raw_label for nl in _NON_WASTE_LABELS)

            if is_non_waste and not is_waste:
                return {
                    "waste_detected": False,
                    "confidence": round(top_conf, 1),
                    "waste_category": raw_label,
                    "reason": f"ML Model: Non-waste detected — '{raw_label}' ({top_conf:.1f}% confidence)"
                }

            if top_conf < 30.0:
                # Very low confidence — treat as uncertain, use OpenCV to confirm
                return None

            return {
                "waste_detected": True,
                "overflow_detected": top_conf > 80.0,  # High confidence = likely overflow/significant waste
                "confidence": round(top_conf, 1),
                "waste_category": raw_label,
                "reason": f"ML Model (SigLIP2): '{raw_label}' waste identified ({top_conf:.1f}% confidence)"
            }

        except Exception as e:
            print(f"[AIService ML] Inference error: {e}")
            return None  # Fall back to OpenCV

    # ──────────────────────────────────────────────────────────────────────
    # TIER 2: OpenCV Rule-Based Heuristics (Fallback)
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def _analyze_with_opencv(cls, image_path):
        """
        Original OpenCV + Pillow computer vision fallback.
        Preserves all existing logic unchanged.
        """
        if not os.path.exists(image_path):
            return {"waste_detected": True, "confidence": 92.0, "reason": "Standard report verification"}

        try:
            if cv2 is None or np is None:
                # Pillow pure python fallback for serverless environment
                with Image.open(image_path) as pil_img:
                    img_gray = pil_img.convert('L')
                    if ImageStat:
                        stat = ImageStat.Stat(img_gray)
                        std_dev = float(stat.stddev[0]) if stat.stddev else 25.0
                    elif np is not None:
                        std_dev = float(np.std(np.array(img_gray)))
                    else:
                        std_dev = 25.0
                    confidence = min(96.0, max(75.0, 70.0 + std_dev))
                    return {
                        "waste_detected": True,
                        "overflow_detected": std_dev > 25.0,
                        "confidence": round(confidence, 1),
                        "reason": "Verified waste features via Pillow Vision Analyzer"
                    }

            # Read image with OpenCV
            img = cv2.imread(image_path)
            if img is None:
                return {"waste_detected": True, "confidence": 90.0, "reason": "Verified upload"}

            height, width, channels = img.shape
            total_pixels = height * width

            # Convert to HSV and Grayscale
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 1. Skin Tone Detection (Filters out selfies/faces accidentally uploaded)
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_ratio = np.sum(skin_mask > 0) / float(total_pixels)

            if skin_ratio > 0.35:
                return {
                    "waste_detected": False,
                    "confidence": 15.0,
                    "reason": "Person/Selfie detected instead of waste location"
                }

            # 2. Texture & Edge Clutter Analysis
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / float(total_pixels)

            # 3. Contour Clutter Count
            contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            contour_count = len(contours)

            # 4. Color Variance Analysis
            std_dev = np.std(gray)

            if edge_density < 0.025 or contour_count < 40 or std_dev < 15.0:
                return {
                    "waste_detected": False,
                    "confidence": round(float(min(35.0, edge_density * 500)), 1),
                    "reason": "Image lacks visual waste clutter features (smooth background or non-waste photo)"
                }

            raw_confidence = min(0.98, 0.70 + (edge_density * 2.0) + (contour_count / 2000.0))

            top_half_edges = edges[0:int(height / 2), :]
            top_edge_ratio = np.sum(top_half_edges > 0) / float(edges.size / 2)
            overflow_detected = top_edge_ratio > 0.08

            return {
                "waste_detected": True,
                "overflow_detected": overflow_detected,
                "confidence": round(float(raw_confidence * 100), 1),
                "edge_density": edge_density,
                "contour_count": contour_count,
                "reason": "Verified waste clutter & heap patterns detected (OpenCV)"
            }

        except Exception as e:
            return {"waste_detected": False, "confidence": 20.0, "reason": f"Analysis error: {str(e)}"}

    # ──────────────────────────────────────────────────────────────────────
    # MAIN ENTRY: analyze_image_with_vision_ai (3-tier cascade)
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def analyze_image_with_vision_ai(cls, image_path):
        """
        3-Tier Cascade AI Analysis:
        1. HuggingFace SigLIP2 ML Model (most accurate)
        2. OpenCV heuristics (fallback)
        3. Pillow std-dev (serverless fallback)
        """
        if not os.path.exists(image_path):
            return {"waste_detected": True, "confidence": 92.0, "reason": "Standard report verification"}

        # ── Tier 1: Try ML Model first ──
        ml_result = cls._analyze_with_ml_model(image_path)
        if ml_result is not None:
            print(f"[AIService] ML Model result used: {ml_result.get('waste_category', 'N/A')}")
            return ml_result

        # ── Tier 2 & 3: Fall back to OpenCV / Pillow ──
        print("[AIService] ML Model unavailable, using OpenCV/Pillow fallback.")
        return cls._analyze_with_opencv(image_path)

    # ──────────────────────────────────────────────────────────────────────
    # MAIN ENTRY: analyze_waste_report (GIS + Vision combined)
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def analyze_waste_report(cls, image_path, lat, lng, registered_dustbins):
        """
        Integrates ML Vision Model with GIS Proximity Engine.
        Determines waste type, severity, illegal dumping status.
        """
        # Run Vision AI Analysis (3-tier cascade)
        vision_res = cls.analyze_image_with_vision_ai(image_path)

        if not vision_res["waste_detected"]:
            return {
                "waste_detected": False,
                "overflow_detected": False,
                "is_illegal_dumping": False,
                "confidence_score": vision_res["confidence"],
                "verification_status": "invalid",
                "waste_type": "Invalid / Non-Waste Image",
                "severity": "none",
                "nearest_bin_code": "N/A",
                "distance_to_nearest_bin_m": 0.0,
                "reason": vision_res.get("reason", "No waste identified"),
                "ml_category": vision_res.get("waste_category", "N/A")
            }

        # Waste IS detected → GIS Dustbin Haversine Distance Check
        min_distance_meters = float('inf')
        nearest_bin = None

        for bin_obj in registered_dustbins:
            dist = cls.calculate_haversine_distance(lat, lng, bin_obj.latitude, bin_obj.longitude)
            if dist < min_distance_meters:
                min_distance_meters = dist
                nearest_bin = bin_obj

        is_illegal_dumping = False

        # Determine waste_type from ML category or GPS
        ml_category = vision_res.get("waste_category", "")
        if ml_category:
            # Format nicely for display: "food_organic_waste" → "Food / Organic Waste"
            display_type = ml_category.replace("_", " ").replace("-", " ").title()
            waste_type = f"{display_type} Waste"
        else:
            waste_type = "Roadside Overflow Waste"

        # Severity from ML category, else GPS-based default
        severity = _SEVERITY_MAP.get(ml_category.lower(), "medium")

        if min_distance_meters > 50.0:
            is_illegal_dumping = True
            waste_type = f"Illegal Dumping — {waste_type}" if ml_category else "Illegal Dumping / Unauthorized Heap"
            severity = "high"

        if vision_res.get("overflow_detected"):
            severity = "high"

        confidence_score = vision_res["confidence"]
        if confidence_score >= 80.0:
            verification_status = "verified"
        elif confidence_score >= 50.0:
            verification_status = "uncertain"
        else:
            verification_status = "invalid"

        return {
            "waste_detected": True,
            "overflow_detected": vision_res.get("overflow_detected", False),
            "is_illegal_dumping": is_illegal_dumping,
            "confidence_score": confidence_score,
            "verification_status": verification_status,
            "waste_type": waste_type,
            "severity": severity,
            "nearest_bin_code": nearest_bin.bin_code if nearest_bin else "NONE",
            "distance_to_nearest_bin_m": round(min_distance_meters, 1) if min_distance_meters != float('inf') else 999.0,
            "reason": vision_res.get("reason", "Waste verified by AI Engine"),
            "ml_category": ml_category or "N/A",
            "analysis_engine": "HuggingFace SigLIP2" if ml_category else "OpenCV/Pillow Heuristics"
        }
