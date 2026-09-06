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

// ErrorBoundary component to prevent blank white screen on uncaught errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-2xl border border-emerald-400/40">
            ♻️
          </div>
          <h1 className="text-2xl font-black">SmartBin Chhattisgarh</h1>
          <p className="text-xs text-slate-300 max-w-md">
            Application session updated. Click below to refresh the page.
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-xl transition active:scale-95 text-xs"
          >
            🔄 Refresh SmartBin App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ConditionalFooter({ lang }) {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Footer lang={lang} />;
}

// Mobile Bottom Navigation Bar Component for Mobile Phones & Tablets
function MobileBottomNav({ user, lang }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex justify-around items-center lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <Link to="/" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath === '/' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
        <HomeIcon className="w-5 h-5" />
        <span>{lang === 'hi' ? 'होम' : 'Home'}</span>
      </Link>

      <Link to="/sponsors" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath === '/sponsors' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
        <Building2 className="w-5 h-5" />
        <span>{lang === 'hi' ? 'वाउचर' : 'Sponsors'}</span>
      </Link>

      <Link to="/report-waste" className="flex flex-col items-center gap-1 text-[10px] font-bold text-emerald-700 -mt-5 group">
        <div className="w-12 h-12 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transform active:scale-95 transition">
          <Camera className="w-6 h-6" />
        </div>
        <span className="font-extrabold">{lang === 'hi' ? 'रिपोर्ट' : 'Report'}</span>
      </Link>

      <Link to="/citizen/dashboard" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath.includes('citizen') ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
        <Gift className="w-5 h-5" />
        <span>{lang === 'hi' ? 'इनाम' : 'Rewards'}</span>
      </Link>

      {user ? (
        user.role === 'admin' ? (
          <Link to="/admin/dashboard" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath.includes('admin') ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
          </Link>
        ) : user.role === 'driver' ? (
          <Link to="/driver/dashboard" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath.includes('driver') ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
            <Truck className="w-5 h-5" />
            <span>{lang === 'hi' ? 'चालक' : 'Driver'}</span>
          </Link>
        ) : (
          <Link to="/citizen/dashboard" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath.includes('citizen') ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
            <User className="w-5 h-5" />
            <span>{lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
          </Link>
        )
      ) : (
        <Link to="/login" className={`flex flex-col items-center gap-1 text-[10px] font-bold ${currentPath === '/login' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
          <User className="w-5 h-5" />
          <span>{lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
        </Link>
      )}
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartbin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [lang, setLang] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('smartbin_intro_seen');
    } catch (e) {
      return false;
    }
  });

  const handleCloseIntro = () => {
    try {
      sessionStorage.setItem('smartbin_intro_seen', 'true');
    } catch (e) {}
    setShowIntro(false);
  };

  const logout = () => {
    try {
      localStorage.removeItem('smartbin_user');
    } catch (e) {}
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col pb-16 md:pb-0 selection:bg-emerald-500 selection:text-white">
          
          {/* Animated Intro Video Overlay */}
          {showIntro && (
            <IntroModal lang={lang} onClose={handleCloseIntro} />
          )}

          {/* Top Sticky Header */}
          <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md border-b border-emerald-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
              
              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-white group">
                <div className="w-10 h-10 bg-emerald-700 border border-emerald-500 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-emerald-600 transition">
                  <Trash2 className="w-6 h-6 text-emerald-200" />
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1">
                    SMARTBIN <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-700">PWA</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold tracking-normal leading-tight">Swachh Chhattisgarh</span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-2 font-bold text-xs">
                <Link to="/" className="hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5">
                  <HomeIcon className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'hi' ? 'होम' : 'Home'}</span>
                </Link>

                <Link to="/report-waste" className="bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/50 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                  <Camera className="w-4 h-4 text-emerald-200" />
                  <span>{lang === 'hi' ? '📷 कचरा रिपोर्ट करें' : '📷 Report Waste'}</span>
                </Link>

                <Link to="/citizen/dashboard" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'hi' ? '🎁 वाउचर व इनाम' : '🎁 Rewards'}</span>
                </Link>

                <Link to="/sponsors" className="hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'hi' ? '🏢 प्रायोजक कंपनी वाउचर' : '🏢 Sponsors'}</span>
                </Link>

                {user?.role === 'driver' && (
                  <Link to="/driver/dashboard" className="bg-blue-900/60 text-blue-200 hover:bg-blue-900 px-3.5 py-2 rounded-xl border border-blue-500/40 transition flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-300" />
                    <span>{lang === 'hi' ? '🚛 चालक पोर्टल' : '🚛 Driver'}</span>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="bg-purple-900/60 text-purple-200 hover:bg-purple-900 px-3.5 py-2 rounded-xl border border-purple-500/40 transition flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-purple-300" />
                    <span>{lang === 'hi' ? '🏛️ एडमिन' : '🏛️ Admin'}</span>
                  </Link>
                )}
              </nav>

              {/* Right Controls: Watch Intro, Language, Login/User */}
              <div className="flex items-center gap-2">
                
                {/* Watch Intro Re-trigger Button */}
                <button
                  onClick={() => setShowIntro(true)}
                  className="hidden sm:flex bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow transition active:scale-95 items-center gap-1"
                  title="Watch SmartBin Video Intro"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                  <span className="hidden lg:inline">{lang === 'hi' ? 'वीडियो इंट्रो देखें' : 'Watch Intro'}</span>
                </button>

                {/* Language Switcher */}
                <button
                  onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                  className="bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
                >
                  <Languages className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
                </button>

                {/* User Profile / Auth */}
                {user ? (
                  <div className="flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-600 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <User className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span className="hidden md:inline max-w-[120px] truncate">{user.full_name || user.name || 'User'} ({user.role})</span>
                    <span className="md:hidden capitalize text-[11px] text-emerald-200">{user.role}</span>
                    <button onClick={logout} className="hover:text-red-300 text-slate-300 transition ml-1" title="Logout">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/login"
                      className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow transition active:scale-95"
                    >
                      {lang === 'hi' ? 'लॉगिन' : 'Login'}
                    </Link>
                    <Link
                      to="/register"
                      className="hidden sm:inline-block bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow transition active:scale-95"
                    >
                      {lang === 'hi' ? 'साइन अप' : 'Register'}
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden bg-emerald-900 hover:bg-emerald-950 p-2 rounded-xl border border-emerald-600 text-white transition active:scale-95 shadow-sm flex items-center gap-1"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4 text-amber-300" /> : <Menu className="w-4 h-4 text-emerald-200" />}
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

                {!user && (
                  <div className="pt-2 flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-center py-2.5 rounded-xl shadow text-xs"
                    >
                      {lang === 'hi' ? 'लॉगिन' : 'Login'}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-center py-2.5 rounded-xl shadow text-xs"
                    >
                      {lang === 'hi' ? 'साइन अप' : 'Register'}
                    </Link>
                  </div>
                )}

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
          <main className="flex-grow pb-20 lg:pb-0">
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

          {/* Global Dark Black Footer with Corporate Sponsors Banner & Contact Us (Suppressed on Admin Dashboard) */}
          <ConditionalFooter lang={lang} />

          {/* Mobile Bottom Navigation Bar */}
          <MobileBottomNav user={user} lang={lang} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
