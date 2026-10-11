import React, { useState } from 'react';
import { Camera, MapPin, Cpu, Truck, Gift, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

/**
 * StoryJourneySection:
 * Continuous scroll & tab driven storytelling walking through the complete SmartBin pipeline:
 * USER → WASTE → AI ANALYSIS → MUNICIPAL DISPATCH → C++ ROUTE VRP → ECO REWARDS
 */
export default function StoryJourneySection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      tag: "THE CITIZEN DISCOVERY",
      title: "Real-World Capture & Hardware Geolocation",
      desc: "A citizen encounters an overflowing dumpster or illegal street pile. Using high-accuracy hardware GPS, coordinates are locked within municipal bounds in milliseconds, paired with a live camera photograph.",
      icon: Camera,
      badge: "GPS ACCURACY: ±2.4m",
      stats: [
        { label: "Capture Time", val: "< 3.2s" },
        { label: "GPS Precision", val: "Hardware Direct" },
        { label: "Offline Buffer", val: "Local Cache" }
      ],
      terminalSnippet: `>> navigator.geolocation.watchPosition({ enableHighAccuracy: true })
>> LAT: 22.0797° N | LNG: 82.1391° E [BILASPUR SECTOR-4]
>> PHOTO_HASH: #SB_IMG_9941_GEOCHECK_PASSED`
    },
    {
      num: "02",
      tag: "THE MACHINE INTELLIGENCE",
      title: "4-Tier Neural & Spectral Classification",
      desc: "Our computer vision pipeline filters out AI/CGI art, selfies, and blank surfaces. Valid photos undergo multi-category spectral analysis: separating Organic Green Waste, Paper/Cardboard, Metal, and Plastics, determining fill severity.",
      icon: Cpu,
      badge: "NEURAL CONFIDENCE: 94.6%",
      stats: [
        { label: "Rejection Filter", val: "AI/CGI & Selfie Guard" },
        { label: "Inference Speed", val: "180ms Vercel Edge" },
        { label: "Classification", val: "Organic / Dry / Hazard" }
      ],
      terminalSnippet: `>> TIER 1: Texture & Edge Density: 0.381 (Camera Clutter Verified)
>> TIER 2: Spatial Color Distribution: Blue/Synthetic Dominant
>> RESULT: "Plastic & Beverage Wrappers" -> Assign Blue Bin #DryRecyclables
>> STATUS: VERIFIED (+100 ECO-POINTS ELIGIBLE)`
    },
    {
      num: "03",
      tag: "THE MUNICIPAL RESPONSE",
      title: "Real-Time Fleet Dispatch & Incident Mapping",
      desc: "The verified incident immediately pins onto the municipal command center dashboard. Ward supervisors monitor live fill levels, citizen reports, and automated priority queues without expensive smart sensors.",
      icon: ShieldCheck,
      badge: "DISPATCH LATENCY: 0.4s",
      stats: [
        { label: "Corporations", val: "6 CG Municipalities" },
        { label: "Admin Console", val: "Ward Command Live" },
        { label: "Hardware Cost", val: "Zero Sensor Overhaul" }
      ],
      terminalSnippet: `>> INCIDENT LOGGED: #SB-1049 [Nehru Chowk Ward #12]
>> GIS PROXIMITY: Closest SmartBin SB-204 (Distance: 18.2m)
>> ALERT_TYPE: "Roadside Illegal Dumping Detected"
>> STATUS: Task Created & Queued for Morning Shift`
    },
    {
      num: "04",
      tag: "THE LOGISTICS MATRIX",
      title: "C++ 17 Native VRP Route Optimization",
      desc: "Collection trucks cannot waste fuel navigating blindly. Our compiled C++ native DLL computes the optimal multi-vehicle Traveling Salesperson tour, minimizing diesel consumption and traffic congestion.",
      icon: Truck,
      badge: "OPTIMIZATION SAVINGS: 28% FUEL",
      stats: [
        { label: "VRP Engine", val: "Compiled C++ 17 DLL" },
        { label: "Route Solve Time", val: "12ms (50 Nodes)" },
        { label: "CO2 Reduction", val: "-340 kg / Week" }
      ],
      terminalSnippet: `>> [C++ VRP Engine] Loaded DLL: cpp_engine/smartbin_vrp.dll
>> SOLVING: 18 Waypoints across Bilaspur Municipal Zone...
>> OPTIMAL TOUR FOUND: Depot -> Stop #3 -> Stop #7 -> SB-1049 -> Depot
>> TRUCK CG-10-G-2080: Route dispatched via Driver Portal`
    },
    {
      num: "05",
      tag: "THE COMMUNITY REWARD",
      title: "Corporate CSR Sponsoring & Citizen Vouchers",
      desc: "Civic cleanliness creates tangible value. Local businesses and corporate CSR funds sponsor reward vouchers. Clean citizens redeem Eco-Points for discounts at nearby stores, closing the circular sustainability loop.",
      icon: Gift,
      badge: "CSR SUBSIDY: 100% COMMUNITY IMPACT",
      stats: [
        { label: "Citizen Reward", val: "+100 Eco-Points / Report" },
        { label: "Sponsor Portal", val: "Local Merchant Backed" },
        { label: "Verified Cleanup", val: "Dual-Proof Verification" }
      ],
      terminalSnippet: `>> DRIVER ACTION: Cleanup Proof Photo Uploaded
>> CITIZEN CONFIRMATION: Verified Resolved
>> REWARD DEPOSITED: +100 Eco-Points added to Citizen Wallet
>> SPONSOR VOUCHER: ₹50 Kirana / Green Grocery Coupon Unlocked!`
    }
  ];

  const current = steps[activeStep];

  return (
    <section className="relative bg-[#080b0e] text-white py-24 md:py-36 px-6 lg:px-16 border-t border-white/10 overflow-hidden">
      {/* Background Grid Pattern & Radial Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e2fd00]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with TBWA Style Numbering & Typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div className="flex items-center gap-3 font-mono-code text-xs md:text-sm text-[#e2fd00] uppercase tracking-widest mb-3">
              <span>/// 02 — THE ARCHITECTURE</span>
              <span className="w-8 h-[1px] bg-[#e2fd00]/50" />
              <span>END-TO-END PIPELINE</span>
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.95]">
              METAMORPHOSIS<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-[#e2fd00]">
                IN ACTION.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-slate-400 font-sans text-sm md:text-base leading-relaxed">
            Witness how an unmanaged waste heap transforms into clean streets, optimized municipal routes, and tangible citizen rewards through 5 coordinated stages.
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 border-[#e2fd00] shadow-lg shadow-[#e2fd00]/10' 
                    : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono-code text-xs font-bold ${isActive ? 'text-[#e2fd00]' : 'text-slate-500'}`}>
                    {s.num}
                  </span>
                  <Icon size={18} className={isActive ? 'text-[#e2fd00]' : 'text-slate-400 group-hover:text-white'} />
                </div>
                <p className="font-display font-bold text-xs sm:text-sm uppercase tracking-tight line-clamp-1">
                  {s.tag}
                </p>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#e2fd00] to-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Active Stage Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/10 rounded-2xl md:rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden backdrop-blur-xl">
          {/* Left Narrative Column */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2fd00]/10 border border-[#e2fd00]/30 font-mono-code text-xs font-semibold text-[#e2fd00] mb-6">
                <Zap size={12} />
                {current.badge}
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4 leading-tight">
                {current.title}
              </h3>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                {current.desc}
              </p>

              {/* Dynamic Metric Badges */}
              <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-6 mb-8">
                {current.stats.map((st, i) => (
                  <div key={i}>
                    <p className="font-mono-code text-xs text-slate-400 uppercase mb-1">{st.label}</p>
                    <p className="font-display font-bold text-lg sm:text-2xl text-white tracking-tight">{st.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Next / Prev buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
                className="px-5 py-2.5 rounded-lg border border-white/20 hover:border-white/40 text-xs font-mono-code uppercase font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                ← PREV STAGE
              </button>
              <button
                onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
                className="px-6 py-2.5 rounded-lg bg-[#e2fd00] hover:bg-[#c8e200] text-black text-xs font-mono-code uppercase font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-[#e2fd00]/20 cursor-pointer"
              >
                <span>NEXT STAGE</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Live Terminal Simulation Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="w-full bg-black/80 rounded-xl border border-white/15 p-5 sm:p-6 font-mono-code text-xs text-emerald-400 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-bold text-slate-300">smartbin_kernel.sh</span>
                </div>
                <span className="text-[#e2fd00]">LIVE RUNTIME</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-[11px] sm:text-xs overflow-x-auto text-emerald-300 selection:bg-emerald-800">
                {current.terminalSnippet}
              </pre>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
                <span>STAGE: {current.num} / 05</span>
                <span className="animate-pulse text-[#e2fd00]">● EXECUTING THREAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
