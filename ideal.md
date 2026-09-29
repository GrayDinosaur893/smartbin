# 🌟 SmartBin — Ideal (Expected) State

> **Yeh file describe karti hai ki SmartBin IDEALLY kya hona chahiye — production-grade, fully working, secure, scalable platform.**

---

## 🏗️ Ideal Tech Stack

| Layer | Technology | Ideal State |
|---|---|---|
| **Frontend** | React 18 + Vite + TailwindCSS + React Router | Role-based routing (Citizen/Driver/Admin dashboards alag) |
| **Backend** | Python Flask / FastAPI + SQLAlchemy | Fully secured, JWT auth, rate limiting |
| **Database** | PostgreSQL (Neon/Supabase) | Env variables only, no hardcoded creds |
| **C++ Engine** | Platform-agnostic `.so` + `.dll` (cross-compile) | Kaam kare Linux pe bhi (Vercel compatible) |
| **AI Vision** | Trained YOLO / MobileNet model | Real deep learning model for waste detection |
| **SMS** | Twilio / MSG91 / Fast2SMS paid API | Server-side actual SMS delivery |
| **Deployment** | Vercel + Railway / Render | Backend alag deploy ho, DLL bhi Linux-compatible |

---

## 👥 Ideal User Roles & Capabilities

### 1. 🏙️ Citizen — Ideal

**Authentication:**
- OTP se real SMS milta hai (Twilio/MSG91 integration)
- JWT token-based session (not in-memory)
- Bilingual login: English + Hindi

**Dashboard — Ideal:**
- Live feed of own reports + status updates
- Real-time push notifications (WebSocket ya Firebase FCM)
- Hindi + English bilingual toggle UI
- Points history aur cash wallet clearly shown
- QR code generate ho voucher ke liye (scannable at partner stores)

**Reporting — Ideal:**
- Waste photo upload → Real AI model se accurate classification
- Multiple photos ek report mein (before/after comparison)
- Location auto-detect + manual adjustment support
- Report tracking — live status: Pending → Verified → Assigned → En Route → Cleaned
- Citizen ko real SMS confirmation aata hai

**Rewards — Ideal:**
- Gamification: Leaderboard city-wise (Top 10 Citizens)
- Tiered rewards: Bronze/Silver/Gold/Platinum citizen levels
- QR voucher at store ka direct scan-to-redeem support
- Referral bonus: Friend ko refer karo → extra points
- Expiry management for points (e.g., 1 year validity)

---

### 2. 🚛 Driver — Ideal

**Authentication:**
- Face recognition clock-in (not just selfie upload)
- JWT-based session

**Dashboard — Ideal:**
- Live real-time GPS map of all assigned stops (Google Maps / OSM)
- Turn-by-turn navigation links (deep link to Google Maps)
- Real-time task notifications (FCM/WebSocket)
- Live route recalculation agar koi new high-priority report aaye

**Task Management — Ideal:**
- Before + After photo capture in-app
- GPS auto-verify with ±50m tolerance
- Clock-in AND Clock-out both implemented
- Attendance history with heatmap (which days worked)
- Earnings/incentive tracking

**VRP Route — Ideal:**
- C++ engine cross-platform (Linux .so bhi ho)
- Multi-vehicle support (10 trucks ke routes alag alag)
- Dynamic rerouting: Nayi report aate hi route update ho
- Fuel optimization mode (shortest distance vs. fastest time toggle)

---

### 3. 🏢 Admin (Municipal) — Ideal

**Dashboard — Ideal:**
- Real-time live updating dashboard (WebSocket)
- City heatmap: Waste concentration areas visualized
- Daily/Weekly/Monthly analytics reports (auto-generated PDF)
- Driver performance scorecards

**Operations — Ideal:**
- Bulk driver assignment with VRP (1-click all zones)
- C++ VRP button clearly visible in UI (not just API)
- Alert system: Akele high-priority illegal dumps admin ko SMS/email se alert kare
- Dustbin fill-level integration (IoT sensor data ingestion)
- Driver attendance calendar view
- Export reports as CSV/PDF with date filters

**Corporate Sponsors — Ideal:**
- Admin approval workflow for sponsor offers (not auto-approved)
- Sponsor analytics: Kitne citizens ne redemption kiya, ROI metrics
- Invoice generation for corporate CSR billing

---

## 🤖 Ideal AI Vision System

### What it should actually do:
1. **Trained ML Model:**
   - YOLO v8 / MobileNet fine-tuned on waste dataset
   - Categories: Plastic, Organic, E-waste, Construction Debris, Hazardous, Mixed
   - Trained on Indian waste imagery (not generic)
   - Confidence threshold: >85% for auto-verify

2. **Multi-photo support:**
   - Analyze multiple images per report
   - Aggregate confidence scores

3. **Fraud detection:**
   - Detect same image uploaded twice (perceptual hashing)
   - Detect GPS spoofing attempts
   - Detect stock photos / internet images

4. **Output — Ideal:**
   - Exact waste category (Plastic / Organic / Hazardous etc.)
   - Estimated tonnage (weight prediction)
   - Risk level: Health, Fire, Flood-blockage
   - Recommended disposal method

---

## 🗺️ Ideal C++ VRP Engine

- **Cross-platform**: Compile both `.dll` (Windows) + `.so` (Linux) from same CMake
- **Algorithm upgrade**: Implement OR-Tools (Google) for multi-vehicle, time-windowed routing
- **Inputs**: Vehicle capacity, fuel consumption, shift hours, driver breaks
- **Output**: Optimal route per vehicle with ETA per stop
- **Real-time**: Socket-based update when new report arrives mid-shift

---

## 📱 Ideal SMS / Notification System

- **Actual server-side SMS delivery** via Twilio / MSG91 / Fast2SMS
- **OTP stored in Redis** (not in-memory dict) — TTL 5 minutes
- **Push Notifications**: Firebase FCM for Android/iOS/PWA
- **Email alerts**: Admin ko daily digest email
- **WhatsApp Business API**: Official bot replies with report status
- **Notification center**: In-app notification history (not "Coming Soon")

---

## 🏆 Ideal Rewards & Voucher System

- **Points validity**: 1 year expiry with reminder notifications
- **Leaderboard**: City-wise monthly eco-champion rankings
- **100-report milestone**: Physical certificate + government recognition
- **Tiered vouchers**: Bronze (50 pts) → Silver (200 pts) → Gold (500 pts)
- **QR code vouchers**: Scannable at partner stores (not just text code)
- **Sponsored cashback**: Direct bank transfer (UPI) for top citizens
- **Anti-fraud**: Prevent fake report farming with AI verification

---

## 🌐 Ideal Frontend Architecture

| Route | Ideal Component | Notes |
|---|---|---|
| `/` | LandingPage | SEO optimized |
| `/login` | LoginPage (OTP + Password) | Real OTP SMS |
| `/citizen/dashboard` | CitizenDashboard | Dedicated citizen view |
| `/citizen/report` | ReportWaste | Multi-photo, real AI |
| `/citizen/rewards` | RewardsPage | Leaderboard + QR vouchers |
| `/driver/dashboard` | DriverDashboard | Live GPS map + tasks |
| `/driver/route` | RoutePage | Turn-by-turn navigation |
| `/admin/dashboard` | AdminDashboard | Real-time analytics |
| `/admin/vrp` | VRPOptimizePage | C++ route optimizer UI |
| `/admin/drivers` | DriversManagePage | Attendance + performance |
| `/sponsors` | SponsorsPage | CSR portal (properly routed) |
| `/notifications` | NotificationsPage | Full notification center |
| `/settings` | SettingsPage | Language, profile, password |

---

## 🛢️ Ideal Database Design

### Additions needed:
| Table | Purpose |
|---|---|
| `otp_records` | Redis ya DB-backed OTP (not in-memory) |
| `notifications` | In-app notification history |
| `report_images` | Multiple images per report |
| `driver_locations` | Live GPS coordinates (updated every 30s) |
| `iot_bin_readings` | Dustbin fill-level sensor data |
| `leaderboard_snapshots` | Monthly citizen rankings |
| `admin_alerts` | Auto-triggered admin notifications |
| `sessions` | JWT refresh token management |

### Security fixes:
- No hardcoded DB passwords — env-only
- Rotate SECRET_KEY periodically
- Parameterized queries only (SQLAlchemy already does this)
- Rate limiting on auth endpoints (5 OTP/hr per phone)

---

## 🔐 Ideal Security Model

| Issue | Ideal Fix |
|---|---|
| Hardcoded DB creds | `.env` only, rotated regularly |
| In-memory OTP | Redis with TTL |
| Demo passwords in code | Remove completely from production |
| No JWT | Implement JWT with refresh tokens |
| CORS `*` | Restrict to specific frontend domain |
| No rate limiting | Flask-Limiter on auth routes |
| `citizen_approved=True` auto-bug | Require explicit citizen action |

---

## 🐛 Bugs That Must Be Fixed

| Bug | Fix |
|---|---|
| `file` NameError in `report_waste_api()` | Add `file = request.files.get('image')` before use |
| C++ DLL fails on Linux | Cross-compile to `.so` or use platform check |
| OTP in-memory | Move to Redis |
| `citizen_approved=True` on driver submit | Remove, keep `False` until citizen approves |
| Dead code (unused JSX files) | Wire all pages in App.jsx or delete unused |
| DB password hardcoded | Use `os.environ.get()` only, no defaults with real creds |
| Demo passwords in prod auth | Remove demo password bypass in login |

---

## 📊 Ideal API Design

| Improvement | Details |
|---|---|
| JWT Auth headers | All private endpoints require `Authorization: Bearer <token>` |
| Pagination | All list endpoints support `?page=1&limit=20` |
| Versioning | `/api/v1/...` prefix |
| Error codes | Standardized error responses with error codes |
| WebSocket | `/ws/admin` + `/ws/driver/<id>` for live updates |
| Rate limiting | Auth endpoints: 5 req/min, Report: 10/hr per user |
| File validation | Only accept JPEG/PNG, max 5MB, virus scan |

---

## 🎯 Priority Fix Order (Roadmap)

### Phase 1 — Critical Bug Fixes (1 week)
1. Fix `file` NameError in `report_waste_api()`
2. Remove hardcoded DB password from code
3. Fix `citizen_approved=True` auto-bug
4. Wire all unused JSX pages in App.jsx

### Phase 2 — Security & Stability (2 weeks)
5. Replace in-memory OTP with Redis
6. Implement JWT auth
7. Add rate limiting
8. Restrict CORS to frontend domain

### Phase 3 — Feature Completion (1 month)
9. Real SMS integration (Fast2SMS / MSG91)
10. Notifications page (not "Coming Soon")
11. Settings page
12. Cross-platform C++ DLL (Linux .so)
13. Admin VRP UI button

### Phase 4 — Scale & Intelligence (3 months)
14. Trained YOLO model for waste classification
15. Firebase FCM push notifications
16. Leaderboard + gamification
17. Multi-vehicle VRP support
18. IoT dustbin fill-level integration
19. Daily PDF report generation for admin
