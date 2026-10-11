import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Trash2, 
  Scan, 
  MapPin, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Play, 
  Menu, 
  X,
  Compass,
  Sparkles
} from 'lucide-react';
import WasteTransformationCanvas from '../components/WasteTransformationCanvas';
import TextMarquee from '../components/TextMarquee';
import StoryJourneySection from '../components/StoryJourneySection';

/**
 * Immersive Redesigned Landing Page:
 * Fusing TBWA\HAKUHODO's brutalist oversized typography, repeating marquees, and slash aesthetics
 * with CRYSTALLIZE's interactive 3D WebGL crystal metamorphosis centerpiece.
 */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090b] text-slate-100 font-sans selection:bg-[#e2fd00] selection:text-black overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
          1. FLOATING MINIMALIST HEADER & SLANTED NAV BAR
          ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 backdrop-blur-xl bg-black/60 border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo with TBWA Style Monospace Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#e2fd00] flex items-center justify-center text-black font-black text-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
              <Trash2 size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-[#e2fd00] transition-colors">
                  SMARTBIN
                </span>
                <span className="font-mono-code text-[11px] px-1.5 py-0.2 rounded bg-white/10 text-emerald-400 font-bold">
                  AI 2.0
                </span>
              </div>
              <p className="font-mono-code text-[9px] uppercase tracking-widest text-slate-400 -mt-0.5">
                URBAN METAMORPHOSIS
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono-code text-xs uppercase tracking-wider text-slate-300">
            <a href="#problem" className="hover:text-[#e2fd00] transition-colors">01 // The Problem</a>
            <a href="#pipeline" className="hover:text-[#e2fd00] transition-colors">02 // Pipeline</a>
            <a href="#intelligence" className="hover:text-[#e2fd00] transition-colors">03 // AI Core</a>
            <a href="#impact" className="hover:text-[#e2fd00] transition-colors">04 // CSR Impact</a>
            <Link to="/dashboard/map" className="hover:text-[#e2fd00] transition-colors flex items-center gap-1 text-emerald-400">
              <Compass size={13} />
              Live Map
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 text-xs font-mono-code uppercase font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/dashboard"
              className="relative px-5 py-2.5 rounded-lg bg-[#e2fd00] hover:bg-[#cbf400] text-black font-mono-code text-xs uppercase font-extrabold flex items-center gap-2 transition-all hover:shadow-[0_0_25px_-5px_#e2fd00] hover:-translate-y-0.5"
            >
              <span>Explore Portal</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl pt-24 px-8 flex flex-col gap-6 md:hidden border-b border-white/10">
          <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-2xl uppercase text-slate-200">
            01 // The Problem
          </a>
          <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-2xl uppercase text-slate-200">
            02 // Story Pipeline
          </a>
          <a href="#intelligence" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-2xl uppercase text-slate-200">
            03 // AI Core
          </a>
          <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-2xl uppercase text-slate-200">
            04 // CSR Impact
          </a>
          <Link to="/dashboard/map" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-2xl uppercase text-emerald-400">
            Live City Map
          </Link>
          <hr className="border-white/10 my-2" />
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 rounded-xl bg-white/10 text-center font-mono-code uppercase font-bold text-sm">
            Sign In
          </Link>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 rounded-xl bg-[#e2fd00] text-black text-center font-mono-code uppercase font-extrabold text-sm">
            Launch Portal →
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION: TBWA TYPOGRAPHY + CRYSTALLIZE 3D OBJECT
          ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen pt-28 pb-16 px-6 lg:px-16 flex flex-col justify-between overflow-hidden">
        
        {/* Subtle Background Radial Gradients */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#e2fd00]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Tagline Grid */}
        <div className="max-w-7xl mx-auto w-full pt-4 md:pt-10">
          <div className="flex flex-wrap items-center gap-3 font-mono-code text-xs text-slate-400 uppercase tracking-widest mb-6">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              CIVIC INTELLIGENCE
            </span>
            <span>///</span>
            <span>NO EXPENSIVE SENSORS</span>
            <span>///</span>
            <span className="text-[#e2fd00]">CHHATTISGARH MUNICIPALITIES</span>
          </div>

          {/* Hero Main Grid: Massive Headline + 3D Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Bold Oversized Typography */}
            <div className="lg:col-span-7 flex flex-col items-start z-10">
              <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[5.5rem] tracking-tighter uppercase leading-[0.92] text-white">
                WASTE IS NOT<br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-slate-400">
                  DESTRUCTION.
                </span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e2fd00] via-emerald-400 to-teal-300">
                  IT’S CREATION.
                </span>
              </h1>

              <p className="mt-8 text-slate-300 text-base sm:text-xl font-sans max-w-xl leading-relaxed">
                Transforming unmanaged urban waste into intelligent data, optimized municipal truck routes, and citizen economic rewards without millions in proprietary bin hardware.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/dashboard/report"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#e2fd00] hover:bg-[#cbf400] text-black font-mono-code text-sm uppercase font-extrabold flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_35px_-5px_#e2fd00] hover:-translate-y-1"
                >
                  <Scan size={18} />
                  <span>Report Waste (+100 Pts)</span>
                </Link>

                <Link
                  to="/dashboard/ai"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white font-mono-code text-sm uppercase font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                >
                  <span>Test AI Vision</span>
                  <ArrowUpRight size={18} />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center gap-6 pt-6 border-t border-white/10 text-xs font-mono-code text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>6 CG Municipal Zones Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#e2fd00]" />
                  <span>Compiled C++ 17 VRP Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-emerald-400" />
                  <span>Corporate CSR Subsidized</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Metamorphic Crystal Scene */}
            <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[480px] lg:h-[580px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm -z-10" />
              <WasteTransformationCanvas className="rounded-3xl overflow-hidden" />
              
              {/* Floating Overlay Card (Crystallize Style Specimen Badge) */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel text-left pointer-events-none">
                <div className="flex items-center justify-between text-[11px] font-mono-code text-[#e2fd00] mb-1">
                  <span>METAMORPHIC CORE #01</span>
                  <span>INTERACTIVE 3D</span>
                </div>
                <p className="font-display font-bold text-sm text-white">
                  Organic & Synthetic Shards → Eco-Points Crystal
                </p>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Drag with mouse/touch to inspect the generative crystal geode lattice.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="max-w-7xl mx-auto w-full pt-12 flex items-center justify-between text-xs font-mono-code text-slate-500">
          <div className="flex items-center gap-2">
            <span>SCROLL TO EXPLORE THE CYCLE</span>
            <span className="animate-bounce">↓</span>
          </div>
          <span className="hidden sm:inline">SWACTHH BHARAT × COMPUTATIONAL LOGISTICS</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TBWA HAKUHODO STYLE OVERSIZED REPEATING MARQUEES
          ───────────────────────────────────────────────────────────── */}
      <TextMarquee 
        direction="left"
        speed="normal"
        items={[
          "CITIZEN REPORTING",
          "AI SPECTRAL CLASSIFICATION",
          "C++ VRP ROUTING",
          "CORPORATE CSR SUBSIDY",
          "ZERO SENSOR OVERHEAD",
          "100 ECO POINTS"
        ]}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. SECTION 01: THE URBAN PROBLEM (High Contrast Editorial)
          ───────────────────────────────────────────────────────────── */}
      <section id="problem" className="relative py-28 md:py-36 px-6 lg:px-16 bg-[#090d11] border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="font-mono-code text-xs text-[#e2fd00] uppercase tracking-widest block mb-4">
                /// 01 — THE CRISIS
              </span>
              <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight uppercase leading-[0.95] text-white">
                THE SENSOR<br />
                ILLUSION IN<br />
                <span className="text-rose-500">SMART CITIES.</span>
              </h2>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6 text-slate-300 text-base sm:text-lg leading-relaxed">
              <p className="text-xl sm:text-2xl font-light text-white leading-snug">
                Traditional smart cities try to put <span className="text-[#e2fd00] font-semibold">₹15,000 ultrasonic sensors</span> inside every metal dustbin. In developing urban landscapes, these get vandalized, battery-drained, or choked with rainwater within weeks.
              </p>
              <p>
                Meanwhile, illegal dump sites, roadside piles, and overflowing neighborhood bins remain completely invisible to city municipal dashboards.
              </p>
              <p className="font-mono-code text-xs sm:text-sm text-emerald-400 border-l-2 border-[#e2fd00] pl-4 py-1">
                SmartBin flips the paradigm: Every smartphone camera becomes a real-time computer vision sensor. Every verified citizen becomes an urban auditor.
              </p>

              {/* Stats Comparison Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 mt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-mono-code text-xs text-rose-400 uppercase mb-1">Traditional IoT</p>
                  <p className="font-display font-extrabold text-2xl text-white">₹15,000 / Bin</p>
                  <p className="text-[11px] text-slate-400 mt-1">High failure & battery cost</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-[#e2fd00]/30 shadow-lg shadow-[#e2fd00]/5">
                  <p className="font-mono-code text-xs text-[#e2fd00] uppercase mb-1">SmartBin AI</p>
                  <p className="font-display font-extrabold text-2xl text-white">₹0 Hardware</p>
                  <p className="text-[11px] text-slate-400 mt-1">Citizen crowdsourced vision</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-mono-code text-xs text-emerald-400 uppercase mb-1">Route Efficiency</p>
                  <p className="font-display font-extrabold text-2xl text-white">+28% Saved</p>
                  <p className="text-[11px] text-slate-400 mt-1">Compiled C++ VRP solver</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SECTION 02: THE 5-STAGE STORYTELLING PIPELINE
          ───────────────────────────────────────────────────────────── */}
      <div id="pipeline">
        <StoryJourneySection />
      </div>

      {/* Reverse Marquee */}
      <TextMarquee 
        direction="right"
        speed="fast"
        highlightColor="text-emerald-400"
        items={[
          "HAWKER & KIRANA SPONSORS",
          "HAWHERSINE GIS CODES",
          "BILASPUR MUNICIPAL DEPOT",
          "DURG BHILAI RAIPUR KORBA",
          "MOBILE 6-DIGIT OTP",
          "ZERO TRASH CITY"
        ]}
      />

      {/* ─────────────────────────────────────────────────────────────
          6. SECTION 03: THE AI INTELLIGENCE CORE
          ───────────────────────────────────────────────────────────── */}
      <section id="intelligence" className="relative py-28 md:py-36 px-6 lg:px-16 bg-[#07090c] border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono-code text-xs text-[#e2fd00] uppercase tracking-widest block mb-3">
              /// 03 — NEURAL SPECTRAL ENGINE
            </span>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white leading-tight">
              WHY OUR AI DOES NOT<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#e2fd00]">
                HALLUCINATE PLASTIC.
              </span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              We engineered a resilient multi-tier CV authenticator combining spatial color clustering, texture variance, and Vision LLM reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#e2fd00]/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#e2fd00]/10 border border-[#e2fd00]/30 flex items-center justify-center text-[#e2fd00] mb-6 group-hover:scale-110 transition-transform">
                <Scan size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                AI / CGI Rejection
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rejects anime wallpapers, digital sketches, and clean selfies before they ever pollute municipal cleanup queues.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                Multi-Category Bins
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Accurately segregates Organic Food Waste (Green Bin), Paper / Cardboard (Blue Bin), Metal Cans, and Hazardous items.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                GIS Haversine Engine
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Calculates precise distances to the nearest registered municipal dustbin code to determine if it is an illegal dump heap.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">
                Edge Pure Pillow Core
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Zero crash dependency on heavy 2GB PyTorch models on serverless edge functions. Executes in under 120ms with 99.9% uptime.
              </p>
            </div>

          </div>

          {/* Interactive AI Demo Card */}
          <div className="mt-12 p-8 md:p-10 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-slate-950/50 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-mono-code text-xs text-[#e2fd00] uppercase font-bold tracking-wider">
                TRY IT YOURSELF IN REAL TIME
              </span>
              <h4 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
                Upload any waste photo or non-waste illustration
              </h4>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                See instant classification, confidence percentage, recommended disposal bin, and strict rejection rules in action.
              </p>
            </div>

            <Link
              to="/dashboard/ai"
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-black font-mono-code text-xs uppercase font-extrabold flex items-center gap-2 shrink-0 transition-all hover:scale-105"
            >
              <span>Launch AI Playground</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. SECTION 04: CSR SPONSORS & ECONOMIC INCENTIVE
          ───────────────────────────────────────────────────────────── */}
      <section id="impact" className="relative py-28 md:py-36 px-6 lg:px-16 bg-[#080a0d] border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <span className="font-mono-code text-xs text-[#e2fd00] uppercase tracking-widest block mb-4">
                /// 04 — SUSTAINABLE ECONOMY
              </span>
              <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white leading-tight">
                CSR FUNDS<br />
                MEET REAL<br />
                <span className="text-[#e2fd00]">STREET METRICS.</span>
              </h2>

              <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
                Corporations need measurable ESG/CSR impact audits. Local grocery and retail stores want foot traffic from eco-conscious citizens.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-[#e2fd00]/20 text-[#e2fd00] flex items-center justify-center shrink-0 font-mono-code text-xs font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-white text-sm">Low-Cost Customer Acquisition</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Merchants sponsor ₹50 discount vouchers for ₹20 each, attracting verified clean citizens.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-mono-code text-xs font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-white text-sm">Quantifiable CSR Compliance</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Audit-ready certificates proving tons of waste collected, cleaned locations, and citizens mobilized.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/dashboard/rewards"
                  className="inline-flex items-center gap-2 font-mono-code text-xs uppercase font-bold text-[#e2fd00] hover:underline"
                >
                  <span>View Active Merchant Rewards & Vouchers</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Impact Metric Formula Badge */}
            <div className="lg:col-span-6 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-900/20 via-black to-[#e2fd00]/5 border border-white/15 relative overflow-hidden">
              <div className="font-mono-code text-xs text-slate-400 uppercase tracking-widest mb-6">
                PROVEN URBAN EQUATION
              </div>

              <div className="space-y-6 font-mono-code text-xs sm:text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                  <span>₹5,00,000 CSR ALLOCATED</span>
                  <span className="text-[#e2fd00] font-bold">FUND INFLOW</span>
                </div>
                <div className="text-center font-bold text-slate-500">↓ DRIVES ACTION</div>
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                  <span>18,420 CITIZENS MOBILIZED</span>
                  <span className="text-emerald-400 font-bold">+100 PTS / EACH</span>
                </div>
                <div className="text-center font-bold text-slate-500">↓ RESULTS IN</div>
                <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/30 flex items-center justify-between">
                  <span>12,400 CLEANED SITES</span>
                  <span className="text-emerald-400 font-bold">7,800 TONS RESOLVED</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CALL TO ACTION & FOOTER
          ───────────────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 px-6 lg:px-16 bg-black text-center overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#e2fd00]/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="font-mono-code text-xs text-[#e2fd00] uppercase tracking-widest block mb-4">
            START YOUR CITY’S METAMORPHOSIS
          </span>

          <h2 className="font-display font-black text-4xl sm:text-7xl uppercase tracking-tighter text-white leading-[0.95]">
            BECOME AN URBAN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#e2fd00]">
              ECO CHAMPION.
            </span>
          </h2>

          <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Log in with mobile OTP or explore the interactive municipal map. Join thousands of citizens making cities spotless today.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-[#e2fd00] hover:bg-[#cbf400] text-black font-mono-code text-sm uppercase font-extrabold flex items-center gap-2 transition-all hover:scale-105 shadow-xl hover:shadow-[#e2fd00]/30"
            >
              <span>Get Started Now</span>
              <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/dashboard/map"
              className="px-8 py-4 rounded-xl border border-white/20 hover:border-white/50 text-white font-mono-code text-sm uppercase font-bold flex items-center gap-2 transition-all hover:bg-white/5"
            >
              <span>Open Live GIS Map</span>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="max-w-7xl mx-auto mt-28 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-slate-500">
          <div>
            © 2026 SMARTBIN AI — SWACHH BHARAT MISSION URBAN. BILASPUR MUNICIPAL CORPORATION HQ.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">CITIZEN PORTAL</Link>
            <Link to="/login" className="hover:text-white transition-colors">DRIVER ROUTE</Link>
            <Link to="/login" className="hover:text-white transition-colors">ADMIN CONSOLE</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
