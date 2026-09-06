# ♻️ SmartBin AI — Solid Waste Management & Corporate CSR Platform
### *Empowering Chhattisgarh State Municipalities with AI, Real-time GPS, & CSR Sponsorships*

![SmartBin Banner](frontend/src/assets/hero.png)

---

## 📌 Executive Overview

**SmartBin AI** is an end-to-end intelligent solid waste management platform tailored for municipal corporations across **Chhattisgarh** (Headquartered at **Bilaspur Municipal Corporation, Station Road, Bilaspur, CG 495001**).

The system integrates **computer vision AI** for automated waste analysis, a **C++ VRP (Vehicle Routing Problem) engine** for optimal driver collection routes, a **Citizen Eco-Reward Points Engine**, and a **Corporate Sponsors Portal** connecting local businesses with municipal sustainability goals.

---

## ✨ Key Features & Capabilities

### 🏢 1. Corporate Sponsors & CSR Subsidies Portal (`/sponsors`)
A 3-way win ecosystem that connects local shops, corporations, and citizens:
- **Low-Cost Customer Acquisition**: Companies sponsor targeted ₹50 vouchers for ₹20–25 each to attract eco-conscious citizens directly to their stores.
- **Data-Driven CSR/ESG Impact**: Measurable city-cleaning metrics for corporate ESG audit compliance:
  $$\text{₹5,00,000 CSR Fund} \longrightarrow \text{18,420 Citizens Rewarded} \longrightarrow \text{32,000 Waste Reports} \longrightarrow \text{12,400 Cleaned Locations} \longrightarrow \text{7,800 Tons Processed}$$
- **Non-Irritating Brand Visibility**: *"Today's Eco Reward Powered by [ Brand Name ]"* civic recognition banners.
- **Eco Champion 100-Report Milestone**: Tiered rewards including sponsored food vouchers, grocery discounts, EV charging passes, and municipal tree planting drives.

---

### 📍 2. Dominos / Rapido Style Real-Time Hardware GPS
- Implements `navigator.geolocation.watchPosition` with `enableHighAccuracy: true` and `maximumAge: 0` for zero-lag hardware GPS precision.
- Prompts citizens for instant location access on page mount (`useEffect`) for effortless reporting.
- Restricts and validates coordinates strictly within Chhattisgarh municipal bounds (Durg, Bhilai, Raipur, Bilaspur, Korba, Rajnandgaon).

---

### 🤖 3. Computer Vision AI & C++ VRP Route Solver
- **AI Waste Classification**: Automatically identifies waste severity, estimates tonnage, and categorizes organic/inorganic/hazardous waste.
- **C++ Native VRP Solver Engine**: High-performance Compiled C++ DLL (`cpp_engine/smartbin_vrp.dll`) computing multi-vehicle traveling salesman collection routes for municipal waste pickup trucks.

---

### 📱 4. Mobile 6-Digit OTP Login & Free Cellular Alert Engine
- **Mobile OTP Authentication**: Secure 6-digit OTP verification (`/api/auth/send-otp` & `/api/auth/verify-otp`) designed for mobile users.
- **100% Free Cellular SMS Links**: Direct `sms:` & `WhatsApp` deep links enabling citizens to send dispatch alerts directly from their phone carrier without API costs.

---

### 🎨 5. Responsive Tactile Touch Feedback
- Micro-interactions with `.touch-card` elevation effects (`hover:-translate-y-1` and active state press feedback) for a smooth mobile app experience.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18, Vite 8, Tailwind CSS, Lucide React, Leaflet Maps |
| **Backend API** | Python 3.11, Flask, SQLAlchemy, Flask-Cors |
| **Database** | Neon Cloud Serverless PostgreSQL (`psycopg2-binary`) |
| **Routing Engine** | C++ 17, CMake, Native DLL (`cpp_engine`) |
| **Authentication** | Mobile 6-Digit OTP & Session Auth |
| **Deployment** | Vercel Serverless (`api/index.py`, `vercel.json`) |

---

## 📁 Repository Structure

```
SmartBin/
├── api/
│   └── index.py            # Vercel Serverless Entrypoint
├── app/
│   ├── models/             # SQLAlchemy Models (User, WasteReport, SponsorOffer, UserActivityLog)
│   ├── routes/             # API & Page Routes (Citizen, Driver, Admin, Sponsors, Auth)
│   ├── services/           # AI Waste Analyzer, C++ VRP Wrapper, SMS Engine
│   └── templates/          # Fallback HTML Templates
├── cpp_engine/             # C++ Vehicle Routing Problem Solver Source & CMake
│   ├── include/
│   ├── src/
│   └── smartbin_vrp.dll
├── frontend/               # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/     # Header, Footer, Maps, Modals
│   │   ├── pages/          # Home, ReportWaste, CitizenDashboard, Sponsors, Login
│   │   └── index.css       # Tailwind CSS & .touch-card Animations
├── .env.example            # Environment Variable Template
├── .gitignore              # Protected Secrets & Build Artifacts
├── requirements.txt        # Python Dependencies
├── run.py                  # Local Flask Server Runner
└── vercel.json             # Vercel Serverless Build Config
```

---

## 🚀 Quick Start (Local Setup)

### 1️⃣ Clone & Install Backend
```bash
git clone https://github.com/GrayDinosaur893/smartbin.git
cd smartbin

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # On Windows

# Install Python requirements
pip install -r requirements.txt
```

### 2️⃣ Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-muddy-glade...aws.neon.tech/neondb?sslmode=require
SECRET_KEY=smartbin_super_secret_cg_2026
TARGET_SMS_PHONE=8085668669
```

### 3️⃣ Run Backend Server
```bash
python run.py
# Backend running at http://127.0.0.1:5000
```

### 4️⃣ Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🌐 Vercel One-Click Deployment Guide

1. Push your changes to GitHub (ensuring `.env` is ignored).
2. Go to **[Vercel Dashboard](https://vercel.com/dashboard)** $\rightarrow$ **Add New Project**.
3. Import `GrayDinosaur893/smartbin`.
4. Add the following **Environment Variables** in Vercel:
   - `DATABASE_URL`: `postgresql://neondb_owner:...@ep-muddy-glade-ae3omptd-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - `SECRET_KEY`: `smartbin_cg_key_2026`
5. Click **Deploy**! 🚀

---

## 📍 Headquarters & Municipal Contact

**Bilaspur Municipal Corporation HQ**  
Station Road, Bilaspur, Chhattisgarh — 495001  
**Helpline**: 1800-233-0001 | **Control Room Email**: `clean@bilaspurmc.cg.gov.in`

---
*Built with ❤️ for a Cleaner & Greener Chhattisgarh.*
