import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  Menu, 
  X, 
  Sparkles, 
  Scan, 
  MapPin, 
  Award, 
  ShieldCheck, 
  Cpu, 
  Truck, 
  Gift, 
  ChevronRight 
} from 'lucide-react';
import WasteTransformationCanvas from '../components/WasteTransformationCanvas';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-slate-800">
      
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION (Restored Clean SmartBin Bar)
          ───────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm md:shadow-none">
        <Link to="/" className="flex items-center gap-2.5 text-emerald-800 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-800/20 group-hover:bg-emerald-800 transition-colors">
            <Trash2 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-emerald-950">SmartBin</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider ml-1">
            AI 2.0
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="text-emerald-700 font-semibold border-b-2 border-emerald-700 pb-1">Home</Link>
          <a href="#pipeline" className="hover:text-emerald-700 transition-colors">How It Works</a>
          <Link to="/dashboard/map" className="hover:text-emerald-700 transition-colors">Live Map</Link>
          <Link to="/dashboard/ai" className="hover:text-emerald-700 transition-colors">AI Scanner</Link>
          <Link to="/dashboard/rewards" className="hover:text-emerald-700 transition-colors">Rewards</Link>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm font-medium">
          <Link to="/login" className="text-slate-600 hover:text-emerald-700 px-3 py-2 transition-colors">
            Login
          </Link>
          <Link to="/login" className="bg-[#105a39] hover:bg-[#0b452a] text-white px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 font-semibold">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-600 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-white z-40 p-6 flex flex-col gap-5 shadow-2xl border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
          <Link to="/" className="text-emerald-700 font-semibold text-lg" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <a href="#pipeline" className="text-slate-700 font-semibold text-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <Link to="/dashboard/map" className="text-slate-700 font-semibold text-lg" onClick={() => setMobileMenuOpen(false)}>Live Map</Link>
          <Link to="/dashboard/ai" className="text-slate-700 font-semibold text-lg" onClick={() => setMobileMenuOpen(false)}>AI Scanner</Link>
          <Link to="/dashboard/rewards" className="text-slate-700 font-semibold text-lg" onClick={() => setMobileMenuOpen(false)}>Rewards</Link>
          <hr className="border-slate-100 my-1" />
          <Link to="/login" className="text-slate-600 font-semibold text-lg text-center py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          <Link to="/login" className="bg-[#105a39] text-white py-3 rounded-lg font-semibold text-lg text-center shadow-md" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION: ORIGINAL CLEAN THEME + CRYSTALLIZE 3D CORE
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row items-center px-6 lg:px-16 xl:px-24 py-10 lg:py-16 overflow-hidden relative max-w-7xl mx-auto w-full">
        
        {/* Left Content (Restored Brand Identity) */}
        <div className="w-full lg:w-1/2 z-10 flex flex-col items-start gap-6 pb-8 lg:pb-0">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Smart Solid Waste Management & Citizen Rewards</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
            Smarter Waste<br/>
            Management<br/>
            for a <span className="text-[#105a39]">Cleaner<br className="hidden sm:block"/>Tomorrow</span>
          </h1>
          
          <p className="text-slate-600 max-w-lg text-base sm:text-lg leading-relaxed">
            AI-powered smart bins, real-time camera reporting, and citizen engagement. Transform urban waste into clean cities and direct eco-rewards.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mt-2 w-full sm:w-auto">
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-[#105a39] hover:bg-[#0b452a] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </Link>

            <Link 
              to="/dashboard/ai" 
              className="w-full sm:w-auto border border-slate-200 hover:border-emerald-700 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-800 px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Scan size={18} className="text-emerald-700" />
              <span>Test AI Scanner</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-4 text-emerald-900 font-medium text-sm sm:text-base pt-4 border-t border-slate-100 w-full max-w-md">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-xl">🍃</span>
            </div>
            <div>
              <p className="leading-tight font-bold">Cleaner Cities</p>
              <p className="leading-tight text-slate-500 text-xs sm:text-sm">Happier Communities across Chhattisgarh</p>
            </div>
          </div>
        </div>

        {/* Right Area: Interactive Crystallize 3D Metamorphic Core */}
        <div className="w-full lg:w-1/2 mt-8 lg:mt-0 relative h-80 sm:h-96 lg:h-[520px] flex items-center justify-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-emerald-100/60 via-transparent to-transparent -z-10 rounded-full blur-2xl"></div>
          
          {/* Real-time 3D Crystal Interactive Canvas */}
          <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white/90 shadow-xl shadow-slate-200/50">
            <WasteTransformationCanvas className="w-full h-full" />
            
            {/* Minimal Floater Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-md flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">Transforming Waste into Value</p>
                <p className="text-slate-500 text-[11px]">Interactive 3D crystal geode model</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                Interactive
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. HOW IT WORKS / PIPELINE SECTION
          ───────────────────────────────────────────────────────────── */}
      <section id="pipeline" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/70 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
              Seamless 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              From Citizen Report to Clean City
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              SmartBin connects citizens, AI classification, and municipal drivers in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
                <Scan size={22} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1.5">1. Snap & Report</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a quick photo of overflowing garbage. Live GPS auto-detects your location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
                <Cpu size={22} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1.5">2. AI Verifies Waste</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our vision AI checks authenticity and categorizes into Plastic, Organic, or Paper bins.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
                <Truck size={22} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1.5">3. Route Dispatch</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Municipal collection trucks are assigned optimized cleanup routes via our C++ VRP engine.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg mb-4">
                <Gift size={22} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1.5">4. Earn Eco Rewards</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get +100 Eco-Points per verified report. Redeem for sponsored store vouchers and discounts.
              </p>
            </div>

          </div>

          {/* Quick CTA Banner */}
          <div className="mt-14 p-8 rounded-2xl bg-[#105a39] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-950/15">
            <div>
              <h3 className="text-2xl font-bold">Ready to make your neighborhood cleaner?</h3>
              <p className="text-emerald-100 text-sm mt-1">Join citizen reporters across Bilaspur, Durg, Bhilai & Raipur.</p>
            </div>
            <Link 
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-sm shrink-0 transition-colors shadow-md"
            >
              Launch SmartBin Portal
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 lg:px-16 border-t border-slate-800 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <Trash2 size={20} className="text-emerald-500" />
            <span>SmartBin AI</span>
            <span className="text-xs text-slate-500 font-normal ml-2">© 2026 Chhattisgarh Municipalities</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Citizen Login</Link>
            <Link to="/login" className="hover:text-white transition-colors">Driver Portal</Link>
            <Link to="/login" className="hover:text-white transition-colors">Admin Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
