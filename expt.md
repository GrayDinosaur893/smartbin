# 📋 SmartBin — Existing (Actual) State

> **Yeh file describe karti hai ki SmartBin abhi ACTUALLY kya kar sakta hai — code mein jo hai, jo kaam karta hai, aur jo incomplete/broken hai.**

---

## 🏗️ Tech Stack (Jo Actually Use Ho Raha Hai)

| Layer | Technology | Status |
|---|---|---|
| **Frontend** | React 18 + Vite + TailwindCSS + React Router | ✅ Built & Dist Available |
| **Backend** | Python Flask + SQLAlchemy + Flask-CORS | ✅ Working |
| **Database** | Neon PostgreSQL (Cloud) + SQLite fallback | ✅ Connected |
| **C++ Engine** | `smartbin_vrp.dll` compiled for Windows | ⚠️ Windows-only DLL |
| **AI Vision** | OpenCV / Pillow (Rule-based heuristics) | ⚠️ No real ML model |
| **SMS** | Free `sms:` + WhatsApp deep links (no paid API) | ⚠️ Not actual server-side SMS |
| **Deployment** | Vercel Serverless via `api/index.py` | ⚠️ Partially working |

---

## 👥 User Roles — Existing

### 1. 🏙️ Citizen
**Kya kar sakta hai (aaj):**
- Email/Password se login (`admin@smartbin.gov.in` / `citizen@smartbin.gov.in`)
- Mobile OTP login (OTP in-memory store mein hai, koi real SMS nahi jata)
- Waste photo upload kar ke report submit kar sakta hai
- GPS coordinates automatically detect hoti hain (browser geolocation)
- Report submit hone par `+100 Eco-Points` milte hain
- Eco-Points se sponsor voucher redeem kar sakta hai (1 baar per offer)
- Apna dashboard dekh sakta hai — reports, points, claimed vouchers
- Cleaning proof approve kar sakta hai (after driver cleans up)

**Kya NAHI kar sakta abhi:**
- Real SMS notification nahi milta (sirf deep links generate hote hain)
- Hindi/bilingual UI nahi hai (sirf English)
- Notification bell kaam nahi karti ("Coming Soon")
- Settings page nahi bana hai ("Coming Soon")

---

### 2. 🚛 Driver
**Kya kar sakta hai (aaj):**
- Email/password se login
- Driver dashboard — assigned tasks aur route dekh sakta hai
- Selfie se clock-in kar sakta hai (photo upload)
- Task complete karne par after-photo upload kar sakta hai
- GPS proximity verify hoti hai (driver 150m se paas hona chahiye)
- C++ VRP engine se optimized route milti hai (Windows par)
- Auto-reassignment hoti hai agar koi unassigned report padi ho

**Kya NAHI kar sakta abhi:**
- Real-time live GPS tracking nahi hai (no WebSocket/polling)
- Multiple vehicle support nahi hai (VRP single-driver)
- Clock-out functionality nahi hai (sirf clock-in)
- Notifications nahi milti jab naya task aata hai

---

### 3. 🏢 Admin (Municipal)
**Kya kar sakta hai (aaj):**
- Admin dashboard — KPIs, reports list, dustbin list, driver list
- Manually driver ko report assign kar sakta hai
- C++ VRP route optimize kar sakta hai ek driver ke liye
- Dustbin/garbage station add kar sakta hai
- `recommend-driver` API available hai (simple load-based selection)
- City filter se scoped data dekh sakta hai (Durg, Raipur, etc.)

**Kya NAHI kar sakta abhi:**
- Admin frontend mein C++ VRP button nahi hai (API hai par UI nahi)
- Real-time live dashboard nahi (manual refresh)
- Driver attendance history ek jagah nahi dikh rahi
- Dustbin fill-level sensor integration nahi hai

---

## 🤖 AI Vision System — Actual Working

### Kya actually hota hai image analysis mein:
1. **OpenCV available ho to:**
   - Skin tone detection (selfie detect karta hai, reject karta hai)
   - Edge density analysis (Canny edge detection)
   - Contour count (garbage heaps = many irregular contours)
   - Color std-deviation (chaotic = garbage)
   - **Rule-based heuristics hain — koi trained ML/Deep Learning model nahi**

2. **Pillow fallback (serverless env mein):**
   - Sirf grayscale std-deviation check hota hai
   - Confidence: `70 + std_dev`, max 96%

3. **Result output:**
   - `waste_detected: True/False`
   - `confidence_score`: 0-100
   - `is_illegal_dumping`: Agar nearest dustbin 50m se zyada door ho
   - `severity`: `low/medium/high`
   - `waste_type`: "Roadside Overflow Waste" ya "Illegal Dumping"

> ⚠️ **Important:** Koi real computer vision ML model (YOLO, ResNet, etc.) use nahi ho raha. Sirf mathematical image analysis hai.

---

## 🗺️ C++ VRP Engine — Actual Working

- **DLL**: `cpp_engine/smartbin_vrp.dll` compiled hai Windows ke liye
- **Algorithm**: Nearest Neighbor TSP heuristic
- **Urgency levels**: High-priority reports pehle collect hote hain
- **Fallback**: Agar DLL load na ho, Python-based simple ordering
- **Limitation**: Only Windows pe kaam karega; Vercel (Linux) par DLL load fail hoga

---

## 📱 SMS System — Actual Working

- **Actual SMS nahi jata** server se
- **Generate hote hain:** `sms:phone?body=message` URI links (client-side click required)
- **WhatsApp link:** `https://api.whatsapp.com/send?phone=91XXXXX&text=...`
- **OTP**: In-memory dictionary (`OTP_STORE`) — server restart par OTP lost
- **Admin target**: `8085668669` (env variable se)

---

## 🏆 Rewards & Voucher System — Actual Working

- **100 Points = ₹1.00** (1 pt = ₹0.01)
- Report submit → +100 points
- Cleaning proof approve → +50 points
- 100 verified reports milestone → +1000 bonus points
- Sponsor voucher redeem → points deduct, UUID voucher code generate
- **1-time redemption per offer enforced** ✅

---

## 🌐 Frontend Routes — Actual State

| Route | Component | Status |
|---|---|---|
| `/` | LandingPage | ✅ Working |
| `/login` | LoginPage | ✅ Working |
| `/dashboard` | DashboardMainPage | ✅ Working |
| `/dashboard/map` | MapPage (Leaflet) | ✅ Working |
| `/dashboard/report` | ReportWastePage | ✅ Working |
| `/dashboard/ai` | AIClassificationPage | ✅ Working |
| `/dashboard/bin/:id` | BinDetailsPage | ✅ Working |
| `/dashboard/analytics` | AnalyticsPage | ✅ Working |
| `/dashboard/profile` | ProfilePage | ✅ Working |
| `/dashboard/notifications` | Placeholder div | ❌ "Coming Soon" |
| `/dashboard/settings` | Placeholder div | ❌ "Coming Soon" |

> **Note:** `Home.jsx`, `CitizenDashboard.jsx`, `DriverDashboard.jsx`, `AdminDashboard.jsx`, `Sponsors.jsx` — ye sab `pages/` mein hain lekin **App.jsx mein import nahi ki gayi** (dead code).

---

## 🛢️ Database Tables

| Table | Description |
|---|---|
| `users` | Citizen, Driver, Admin — sab ek hi table |
| `driver_profiles` | Vehicle info, shift status |
| `dustbins` | Official garbage stations |
| `reports` | Citizen waste reports with GPS + AI analysis |
| `tasks` | Driver ke assigned cleanup tasks |
| `cleaning_proofs` | After-photos with GPS verification |
| `attendance` | Driver clock-in selfie records |
| `rewards_ledger` | Points earn/spend history |
| `municipal_zones` | 6 CG cities with depot coordinates |
| `sponsor_offers` | Corporate CSR voucher offers |
| `voucher_redemptions` | Citizen redemption records |
| `user_activity_logs` | Audit trail |

---

## 🐛 Known Bugs in Existing Code

1. **`report_waste_api()` NameError bug**: `api_routes.py` line 500 mein `file` variable use hua hai lekin `request.files.get(...)` se define nahi kiya — production mein crash hoga.

2. **C++ DLL Vercel par kaam nahi karega**: Linux serverless environment mein Windows `.dll` load nahi hota.

3. **In-memory OTP**: `OTP_STORE` RAM mein hai — multi-instance ya server restart pe OTP lost.

4. **Demo passwords hardcoded**: `demo_passwords` list production security risk hai.

5. **Dead frontend code**: `Sponsors.jsx`, `AdminDashboard.jsx`, `CitizenDashboard.jsx`, `DriverDashboard.jsx` App.jsx mein wire nahi hain — koi route nahi.

6. **Auto citizen approval bug**: `driver_submit_cleaning_api()` mein `citizen_approved=True` set ho jaata hai bina citizen ke approve kiye.

7. **DB credentials hardcoded**: `app/__init__.py` line 31 mein Neon DB password plain text mein hai.

---

## 📊 API Endpoints Summary

| Method | Endpoint | Status |
|---|---|---|
| POST | `/api/auth/login` | ✅ |
| POST | `/api/auth/register` | ✅ |
| POST | `/api/auth/send-otp` | ✅ (in-memory) |
| POST | `/api/auth/verify-otp` | ✅ (in-memory) |
| GET | `/api/public/waste-map` | ✅ |
| GET | `/api/public/municipal-zones` | ✅ |
| GET | `/api/public/sponsors` | ✅ |
| POST | `/api/public/test-sms` | ✅ (link-only) |
| GET | `/api/citizen/dashboard/<id>` | ✅ |
| GET | `/api/citizen/vouchers/<id>` | ✅ |
| POST | `/api/citizen/report-waste` | ⚠️ Bug (NameError) |
| POST | `/api/citizen/approve-cleaning/<id>` | ✅ |
| POST | `/api/citizen/redeem-voucher` | ✅ |
| GET | `/api/driver/dashboard/<id>` | ✅ |
| POST | `/api/driver/clock-in` | ✅ |
| POST | `/api/driver/submit-cleaning/<id>` | ✅ |
| GET | `/api/admin/dashboard` | ✅ |
| POST | `/api/admin/assign-driver` | ✅ |
| POST | `/api/admin/recommend-driver` | ✅ |
| POST | `/api/admin/add-dustbin` | ✅ |
| POST | `/api/admin/optimize-routes` | ✅ (Windows only) |
| POST | `/api/sponsors/apply` | ✅ |
| POST | `/api/sponsors/redeem` | ✅ |
