import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Trash2, Camera, MapPin, Award, User, LogOut, ShieldAlert, Truck, Sparkles, CheckCircle2, AlertTriangle, FileText, Check, Navigation, Languages, Home as HomeIcon, LayoutDashboard, Gift, Menu, X, Building2 } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportWaste from './pages/ReportWaste';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Sponsors from './pages/Sponsors';
import Footer from './components/Footer';

import IntroModal from './components/IntroModal';
import { Play } from 'lucide-react';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Mobile Bottom Navigation Bar Component for Mobile Phones
function MobileBottomNav({ user, lang }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex justify-around items-center md:hidden shadow-2xl">
      <Link to="/" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${currentPath === '/' ? 'text-emerald-600' : 'text-slate-500'}`}>
        <HomeIcon className="w-5 h-5" />
        <span>{lang === 'hi' ? 'होम' : 'Home'}</span>
      </Link>

      <Link to="/report-waste" className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-600 -mt-5">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transform active:scale-95 transition">
          <Camera className="w-6 h-6" />
        </div>
        <span className="font-extrabold text-emerald-700">{lang === 'hi' ? 'रिपोर्ट' : 'Report'}</span>
      </Link>

      <Link to="/citizen/dashboard" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${currentPath.includes('citizen') ? 'text-emerald-600' : 'text-slate-500'}`}>
        <Gift className="w-5 h-5" />
        <span>{lang === 'hi' ? 'इनाम' : 'Rewards'}</span>
      </Link>

      {user ? (
        user.role === 'admin' ? (
          <Link to="/admin/dashboard" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${currentPath.includes('admin') ? 'text-emerald-600' : 'text-slate-500'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
          </Link>
        ) : user.role === 'driver' ? (
          <Link to="/driver/dashboard" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${currentPath.includes('driver') ? 'text-emerald-600' : 'text-slate-500'}`}>
            <Truck className="w-5 h-5" />
            <span>{lang === 'hi' ? 'चालक' : 'Driver'}</span>
          </Link>
        ) : (
          <Link to="/citizen/dashboard" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${currentPath.includes('citizen') ? 'text-emerald-600' : 'text-slate-500'}`}>
            <User className="w-5 h-5" />
            <span>{lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
          </Link>
        )
      ) : (
        <Link to="/login" className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${currentPath === '/login' ? 'text-emerald-600' : 'text-slate-500'}`}>
          <User className="w-5 h-5" />
          <span>{lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
        </Link>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartbin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [lang, setLang] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('smartbin_intro_seen');
  });

  const handleCloseIntro = () => {
    sessionStorage.setItem('smartbin_intro_seen', 'true');
    setShowIntro(false);
  };

  const logout = () => {
    localStorage.removeItem('smartbin_user');
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col pb-16 md:pb-0 selection:bg-emerald-500 selection:text-white">
        
        {/* Animated Intro Video Overlay */}
        {showIntro && (
          <IntroModal lang={lang} onClose={handleCloseIntro} />
        )}

        {/* Top Navbar Header */}
        <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-[9999]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 font-black text-xl tracking-tight">
              <div className="w-9 h-9 bg-emerald-800 rounded-xl flex items-center justify-center border border-emerald-500 shadow-sm">
                <Trash2 className="w-5 h-5 text-emerald-300" />
              </div>
              <span>SMARTBIN</span>
              <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-600 font-mono uppercase hidden xl:inline">PWA</span>
            </Link>

            {/* Desktop Navigation Links in Clean Uniform Box Shapes */}
            <div className="hidden lg:flex items-center gap-2.5 text-xs font-extrabold">
              <Link to="/" className="bg-emerald-800/60 hover:bg-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-600/60 flex items-center gap-1.5 transition shadow-sm">
                <HomeIcon className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? 'होम' : 'Home'}</span>
              </Link>

              <Link to="/report-waste" className="bg-emerald-800/60 hover:bg-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-600/60 flex items-center gap-1.5 transition shadow-sm">
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? 'कचरा रिपोर्ट' : 'Report Waste'}</span>
              </Link>

              <Link to="/citizen/dashboard" className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 px-3.5 py-2 rounded-xl border border-amber-400/40 flex items-center gap-1.5 transition shadow-sm">
                <Gift className="w-4 h-4 text-amber-300" />
                <span>{lang === 'hi' ? 'वाउचर व इनाम' : 'Rewards'}</span>
              </Link>

              <Link to="/sponsors" className="bg-emerald-800/60 hover:bg-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-600/60 flex items-center gap-1.5 transition shadow-sm">
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? 'प्रायोजक (CSR)' : 'Sponsors'}</span>
              </Link>

              {user?.role === 'driver' && (
                <Link to="/driver/dashboard" className="bg-emerald-800/60 hover:bg-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-600/60 flex items-center gap-1.5 transition shadow-sm">
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'hi' ? 'चालक पोर्टल' : 'Driver'}</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="bg-emerald-800/60 hover:bg-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-600/60 flex items-center gap-1.5 transition shadow-sm">
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
                </Link>
              )}
            </div>

            {/* Right Action Controls in Uniform Clean Boxes */}
            <div className="flex items-center gap-2 text-xs font-bold">
              {/* Play Intro Video Button */}
              <button 
                onClick={() => setShowIntro(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-2 rounded-xl border border-amber-300 flex items-center gap-1.5 transition shadow-sm active:scale-95 text-[11px]"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span className="hidden md:inline">{lang === 'hi' ? 'इंट्रो देखें' : 'Watch Intro'}</span>
              </button>

              {/* Language Switcher Box */}
              <button 
                onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
                className="bg-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded-xl border border-emerald-500 flex items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <Languages className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-800 px-3 py-2 rounded-xl border border-emerald-600 hidden sm:flex items-center gap-1.5 text-emerald-100 font-bold">
                    <User className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{user.name}</span>
                  </div>

                  <button onClick={logout} className="bg-emerald-900 hover:bg-emerald-950 px-3 py-2 rounded-xl border border-emerald-700 font-extrabold flex items-center gap-1.5 transition shadow-sm active:scale-95">
                    <LogOut className="w-4 h-4 text-emerald-300" />
                    <span className="hidden sm:inline">{lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="bg-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded-xl border border-emerald-600 text-white font-bold transition">
                    {lang === 'hi' ? 'लॉगिन' : 'Login'}
                  </Link>
                  <Link to="/register" className="bg-white text-emerald-800 font-extrabold px-3.5 py-2 rounded-xl shadow hover:bg-emerald-50 transition">
                    {lang === 'hi' ? 'रजिस्टर' : 'Register'}
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden bg-emerald-800 hover:bg-emerald-900 p-2 rounded-xl border border-emerald-600 text-white transition active:scale-95 shadow-sm"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown Drawer (Clean Rounded Boxes) */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-emerald-800 border-t border-emerald-600 p-4 space-y-2.5 text-xs font-extrabold shadow-2xl animate-in slide-in-from-top duration-200">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-emerald-900/80 hover:bg-emerald-900 p-3 rounded-xl border border-emerald-600 flex items-center gap-2.5 text-white transition shadow-sm"
              >
                <HomeIcon className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? 'होम पेज' : 'Home Page'}</span>
              </Link>

              <Link
                to="/report-waste"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-emerald-900/80 hover:bg-emerald-900 p-3 rounded-xl border border-emerald-600 flex items-center gap-2.5 text-white transition shadow-sm"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? '📷 कचरा रिपोर्ट करें' : '📷 Report Waste Now'}</span>
              </Link>

              <Link
                to="/citizen/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-amber-500/20 hover:bg-amber-500/30 p-3 rounded-xl border border-amber-400/50 flex items-center gap-2.5 text-amber-200 transition shadow-sm"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>{lang === 'hi' ? '🎁 वाउचर व इनाम (Rewards Store)' : '🎁 Rewards & Vouchers Store'}</span>
              </Link>

              <Link
                to="/sponsors"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-emerald-900/80 hover:bg-emerald-900 p-3 rounded-xl border border-emerald-600 flex items-center gap-2.5 text-white transition shadow-sm"
              >
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? '🏢 प्रायोजक कंपनी वाउचर (Sponsors & CSR)' : '🏢 Corporate Sponsors & Subsidies'}</span>
              </Link>

              {user?.role === 'driver' && (
                <Link
                  to="/driver/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-emerald-900/80 hover:bg-emerald-900 p-3 rounded-xl border border-emerald-600 flex items-center gap-2.5 text-white transition shadow-sm"
                >
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'hi' ? '🚛 चालक पोर्टल' : '🚛 Driver Portal'}</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-emerald-900/80 hover:bg-emerald-900 p-3 rounded-xl border border-emerald-600 flex items-center gap-2.5 text-white transition shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'hi' ? '🏛️ म्यूनिसिपल एडमिन' : '🏛️ Municipal Admin'}</span>
                </Link>
              )}
            </div>
          )}

        </header>

        {/* Main Views */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} lang={lang} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/citizen/dashboard" element={user ? <CitizenDashboard user={user} lang={lang} /> : <Navigate to="/login" />} />
            <Route path="/report-waste" element={<ReportWaste user={user} lang={lang} />} />
            <Route path="/sponsors" element={<Sponsors user={user} lang={lang} />} />
            <Route path="/driver/dashboard" element={user && user.role === 'driver' ? <DriverDashboard user={user} lang={lang} /> : <Navigate to="/login" />} />
            <Route path="/admin/dashboard" element={user && user.role === 'admin' ? <AdminDashboard user={user} lang={lang} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        {/* Global Dark Black Footer with Corporate Sponsors Banner & Contact Us */}
        <Footer lang={lang} />

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav user={user} lang={lang} />
      </div>
    </Router>
  );
}
