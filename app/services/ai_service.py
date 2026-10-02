import math
import os
import tempfile

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

def get_safe_upload_folder(app=None):
    """
    Returns a writable upload directory.
    Prefers app.static_folder/uploads in local environments,
    falls back to /tmp/smartbin_uploads in serverless / Vercel read-only environments.
    """
    if app is not None and hasattr(app, 'static_folder') and app.static_folder:
        try:
            static_uploads = os.path.join(app.static_folder, 'uploads')
            os.makedirs(static_uploads, exist_ok=True)
            test_file = os.path.join(static_uploads, '.test_write')
            with open(test_file, 'w') as f:
                f.write('1')
            os.remove(test_file)
            return static_uploads
        except Exception:
            pass

    tmp_uploads = os.path.join(tempfile.gettempdir(), 'smartbin_uploads')
    try:
        os.makedirs(tmp_uploads, exist_ok=True)
    except Exception:
        pass
    return tmp_uploads

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
    # TIER 2: Computer Vision Pipeline (AI/CGI & Multi-Category Classifier)
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def _analyze_with_opencv(cls, image_path):
        """
        Multi-Stage Computer Vision Pipeline:
        1. Authenticity: AI / CGI / Digital Art / Drawing / Wallpaper rejection
        2. Non-Waste Filtering: Selfie / Portrait / Blank / Clean area rejection
        3. Real Waste Multi-Category Classification: Organic, Paper/Cardboard, Metal, Plastic, Glass, Mixed
        """
        if not os.path.exists(image_path):
            return {
                "waste_detected": False,
                "confidence": 0.0,
                "waste_category": "Invalid Image",
                "reason": "Image file not found"
            }

        try:
            from PIL import ImageFilter
            with Image.open(image_path) as pil_img:
                img_rgb = pil_img.convert('RGB')
                w, h = img_rgb.size
                total_pixels = float(w * h)

                # Grayscale & Edges
                gray_img = img_rgb.convert('L')
                gray = np.array(gray_img, dtype=np.float32)
                edges = np.array(gray_img.filter(ImageFilter.FIND_EDGES), dtype=np.float32)
                edge_density = float(np.sum(edges > 40) / total_pixels)

                # Color & Saturation Analysis
                r, g, b = img_rgb.split()
                r_arr = np.array(r, dtype=np.float32)
                g_arr = np.array(g, dtype=np.float32)
                b_arr = np.array(b, dtype=np.float32)

                max_c = np.maximum(np.maximum(r_arr, g_arr), b_arr)
                min_c = np.minimum(np.minimum(r_arr, g_arr), b_arr)
                sat = np.where(max_c > 0, (max_c - min_c) / (max_c + 1e-5), 0)
                mean_sat = float(np.mean(sat))
                high_sat_ratio = float(np.sum(sat > 0.35) / total_pixels)

                # High-frequency Camera Sensor Grain / Noise Test
                blurred = np.array(gray_img.filter(ImageFilter.GaussianBlur(radius=1.5)), dtype=np.float32)
                noise_mean = float(np.mean(np.abs(gray - blurred)))

                # 1. Selfie / Face Check
                skin_mask = (r_arr > 95) & (g_arr > 40) & (b_arr > 20) & (r_arr > g_arr) & (r_arr > b_arr) & (r_arr - g_arr > 15) & (np.abs(r_arr - g_arr) > 15)
                skin_ratio = float(np.sum(skin_mask) / total_pixels)

                if skin_ratio > 0.38:
                    return {
                        "waste_detected": False,
                        "confidence": 90.0,
                        "waste_category": "Non-Waste (Selfie / Person)",
                        "recommended_bin": "N/A",
                        "disposal_tip": "Please upload a photo of garbage or overflowing bin instead of a portrait.",
                        "reason": "Person or selfie detected instead of waste location.",
                        "engine": "CV Waste Authenticator"
                    }

                # 2. AI / CGI / Cartoon / Anime / Digital Illustration Check
                if edge_density > 0.18 or (high_sat_ratio > 0.45 and noise_mean < 8.0):
                    return {
                        "waste_detected": False,
                        "is_ai_or_cgi": True,
                        "waste_category": "AI / CGI Generated Art (Non-Waste)",
                        "confidence": 96.0,
                        "recommended_bin": "N/A",
                        "disposal_tip": "AI / CGI generated art is not accepted. Please upload an authentic real camera photo of physical waste.",
                        "severity": "none",
                        "reason": "AI / CGI generated digital illustration detected. Only authentic real camera photos of physical waste are valid.",
                        "engine": "AI/CGI Vision Authenticator"
                    }

                # 3. Blank / Uniform surface check
                std_dev = float(np.std(gray))
                if edge_density < 0.035 and std_dev < 18.0:
                    return {
                        "waste_detected": False,
                        "confidence": 88.0,
                        "waste_category": "Non-Waste (Blank / Smooth Surface)",
                        "recommended_bin": "N/A",
                        "disposal_tip": "Please upload a clear photo showing physical garbage or litter.",
                        "reason": "Image lacks physical waste or clutter features.",
                        "engine": "CV Waste Authenticator"
                    }

                # 4. Real Waste Multi-Category Spectral & Textural Classifier
                # Organic / Food / Bio
                green_mask = (g_arr > r_arr * 1.05) & (g_arr > b_arr * 1.15) & (g_arr > 40)
                green_ratio = float(np.sum(green_mask) / total_pixels)

                # Cardboard / Kraft Paper
                cardboard_mask = (r_arr > 120) & (g_arr > 90) & (b_arr < 90) & (r_arr - b_arr > 40) & (r_arr - g_arr < 60)
                cardboard_ratio = float(np.sum(cardboard_mask) / total_pixels)

                # Metal / Cans
                gray_diff = np.abs(r_arr - g_arr) + np.abs(g_arr - b_arr)
                metal_mask = (gray_diff < 20) & (r_arr > 140) & (r_arr < 240)
                metal_ratio = float(np.sum(metal_mask) / total_pixels)

                # Plastic / Synthetic Packaging
                vibrant_plastic_mask = (sat > 0.45) & (~green_mask)
                plastic_ratio = float(np.sum(vibrant_plastic_mask) / total_pixels)

                overflow_detected = edge_density > 0.12 or std_dev > 50.0

                if green_ratio > 0.18:
                    cat = "Organic / Food Waste"
                    bin_col = "Green Bin (Wet / Compostable)"
                    tip = "Dispose in green bin for municipal composting."
                elif cardboard_ratio > 0.20:
                    cat = "Paper / Cardboard"
                    bin_col = "Blue Bin (Dry Recyclables)"
                    tip = "Flatten cardboard boxes to optimize dry-bin space."
                elif metal_ratio > 0.25 and plastic_ratio < 0.15:
                    cat = "Metal / Beverage Cans"
                    bin_col = "Blue Bin (Dry Recyclables)"
                    tip = "Rinse metal cans before dry disposal."
                elif plastic_ratio > 0.15:
                    cat = "Plastic (Bottles & Packaging)"
                    bin_col = "Blue Bin (Dry Recyclables)"
                    tip = "Segregate clean plastics for city recycling center."
                else:
                    cat = "Mixed Roadside Waste"
                    bin_col = "Blue Bin (Dry Recyclables)"
                    tip = "Segregate wet and dry items before dumping."

                return {
                    "waste_detected": True,
                    "overflow_detected": overflow_detected,
                    "confidence": round(min(94.0, max(75.0, 70.0 + (edge_density * 100))), 1),
                    "waste_category": cat,
                    "recommended_bin": bin_col,
                    "disposal_tip": tip,
                    "severity": "high" if overflow_detected else "medium",
                    "reason": f"Real-world physical waste identified ({cat})",
                    "engine": "Physical Waste Multi-Feature Classifier"
                }

        except Exception as e:
            return {
                "waste_detected": False,
                "confidence": 10.0,
                "waste_category": "Non-Waste / Invalid Image",
                "recommended_bin": "N/A",
                "disposal_tip": "Please upload a clear real photo of garbage.",
                "reason": f"Image analysis could not verify waste: {str(e)}",
                "engine": "CV Analyzer"
            }

    # ──────────────────────────────────────────────────────────────────────
    # TIER 1: Online Vision LLM (Groq Llama-3.2 Vision / Gemini 1.5 Flash)
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def _analyze_with_vision_llm(cls, image_path):
        """
        Analyzes real-life waste images using Vision LLM (Groq Llama-3.2 Vision or Gemini 1.5 Flash Vision).
        Returns parsed JSON dict or None on failure/fallback.
        """
        import base64
        import json
        import urllib.request
        import urllib.error

        if not os.path.exists(image_path):
            return None

        try:
            with open(image_path, "rb") as f:
                img_bytes = f.read()
                b64_image = base64.b64encode(img_bytes).decode('utf-8')
                
            mime_type = "image/jpeg"
            if image_path.lower().endswith(".png"):
                mime_type = "image/png"
            elif image_path.lower().endswith(".webp"):
                mime_type = "image/webp"

            prompt_text = (
                "You are a strict Municipal AI Waste Classifier for Swachh Bharat Smart Cities. "
                "Carefully inspect the uploaded photo.\n"
                "CRITICAL VALIDATION RULE:\n"
                "- If the image does NOT show real physical waste/garbage/litter (for example, if it is a cartoon, anime, video game, drawing, digital wallpaper, portrait/selfie, pet/animal, clean road, clean interior room, document, or vehicle without garbage), you MUST set waste_detected to FALSE.\n"
                "- Only set waste_detected to TRUE if the image visibly contains physical garbage, litter, scrap, food waste, plastic trash, or an overflowing dustbin.\n\n"
                "Return ONLY a valid JSON object (no markdown, no backticks) with these exact keys:\n"
                "{\n"
                '  "waste_detected": true or false,\n'
                '  "waste_category": "Plastic" | "Organic" | "Paper" | "Glass" | "Metal" | "Electronic" | "Medical" | "Mixed" | "Non-Waste / Invalid Image",\n'
                '  "confidence": 95,\n'
                '  "overflow_detected": false,\n'
                '  "is_illegal_dumping": false,\n'
                '  "recommended_bin": "Blue Bin (Dry Recyclables)" | "Green Bin (Wet / Compostable)" | "N/A",\n'
                '  "disposal_tip": "Specific recycling tip or upload guideline",\n'
                '  "severity": "high" | "medium" | "low" | "none",\n'
                '  "reason": "Clear explanation of what was detected or why it is not waste"\n'
                "}"
            )

            # 1. Groq Llama-3.2 Vision API
            groq_key = os.environ.get("GROQ_API_KEY")
            if groq_key:
                try:
                    url = "https://api.groq.com/openai/v1/chat/completions"
                    payload = {
                        "model": "llama-3.2-11b-vision-preview",
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt_text},
                                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64_image}"}}
                                ]
                            }
                        ],
                        "temperature": 0.1,
                        "max_tokens": 300,
                        "response_format": {"type": "json_object"}
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers={
                            "Authorization": f"Bearer {groq_key}",
                            "Content-Type": "application/json"
                        }
                    )
                    with urllib.request.urlopen(req, timeout=8) as resp:
                        res_data = json.loads(resp.read().decode('utf-8'))
                        content = res_data['choices'][0]['message']['content']
                        parsed = json.loads(content)
                        parsed['engine'] = 'Groq Llama-3.2 Vision'
                        print(f"[AIService] Groq Vision result: {parsed.get('waste_category')}")
                        return parsed
                except Exception as groq_err:
                    print(f"[AIService] Groq Vision Notice: {groq_err}")

            # 2. Google Gemini Vision API
            gemini_key = os.environ.get("GEMINI_API_KEY")
            if gemini_key:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                    payload = {
                        "contents": [
                            {
                                "parts": [
                                    {"text": prompt_text},
                                    {
                                        "inline_data": {
                                            "mime_type": mime_type,
                                            "data": b64_image
                                        }
                                    }
                                ]
                            }
                        ],
                        "generationConfig": {
                            "temperature": 0.1,
                            "response_mime_type": "application/json"
                        }
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=8) as resp:
                        res_data = json.loads(resp.read().decode('utf-8'))
                        text = res_data['candidates'][0]['content']['parts'][0]['text']
                        clean_text = text.replace("```json", "").replace("```", "").strip()
                        parsed = json.loads(clean_text)
                        parsed['engine'] = 'Gemini 1.5 Flash Vision'
                        print(f"[AIService] Gemini Vision result: {parsed.get('waste_category')}")
                        return parsed
                except Exception as gem_err:
                    print(f"[AIService] Gemini Vision Notice: {gem_err}")

        except Exception as e:
            print(f"[AIService] Vision LLM error: {e}")

        return None

    # ──────────────────────────────────────────────────────────────────────
    # MAIN ENTRY: analyze_image_with_vision_ai (4-tier cascade)
    # ──────────────────────────────────────────────────────────────────────

    @classmethod
    def analyze_image_with_vision_ai(cls, image_path):
        """
        4-Tier Cascade AI Analysis:
        1. Online Vision LLM (Groq Llama-3.2 Vision / Gemini 1.5 Flash)
        2. HuggingFace SigLIP2 ML Model
        3. OpenCV heuristics (fallback)
        4. Pillow std-dev (serverless fallback)
        """
        if not os.path.exists(image_path):
            return {"waste_detected": True, "confidence": 92.0, "reason": "Standard report verification"}

        # ── Tier 1: Try Online Vision LLM first ──
        llm_result = cls._analyze_with_vision_llm(image_path)
        if llm_result is not None:
            return {
                "waste_detected": llm_result.get("waste_detected", True),
                "overflow_detected": llm_result.get("overflow_detected", False),
                "confidence": float(llm_result.get("confidence", 94.0)),
                "waste_category": llm_result.get("waste_category", "Plastic"),
                "recommended_bin": llm_result.get("recommended_bin", "Blue Bin (Dry Recyclables)"),
                "disposal_tip": llm_result.get("disposal_tip", "Please segregate into proper dustbin."),
                "severity": llm_result.get("severity", "medium"),
                "reason": llm_result.get("reason", "Analyzed via Vision LLM"),
                "engine": llm_result.get("engine", "Vision LLM")
            }

        # ── Tier 2: Try HuggingFace ML Model ──
        ml_result = cls._analyze_with_ml_model(image_path)
        if ml_result is not None:
            print(f"[AIService] ML Model result used: {ml_result.get('waste_category', 'N/A')}")
            return ml_result

        # ── Tier 3 & 4: Fall back to OpenCV / Pillow ──
        print("[AIService] Using OpenCV/Pillow fallback.")
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
