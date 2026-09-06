import React, { useState, useEffect } from 'react';
import { FastForward, Sparkles, ArrowRight, X } from 'lucide-react';

export default function IntroModal({ lang, onClose }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [captionIndex, setCaptionIndex] = useState(0);

  const captions = [
    {
      en: "This is how dealing with trash feels like...",
      hi: "कचरे से जूझना ऐसा महसूस होता है..."
    },
    {
      en: "...Are you tired of it too?",
      hi: "...क्या आप भी इससे तंग आ चुके हैं?"
    },
    {
      en: "Let's fix it with SmartBin! ♻️",
      hi: "चलिए SmartBin के साथ इसे ठीक करते हैं! ♻️"
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev < captions.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [captions.length]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-300">
      
      {/* Full-bleed Video Background */}
      <video
        key={isMobile ? 'phone' : 'pc'}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src={isMobile ? '/assets/Video ProjectPhone.mp4' : '/assets/Video Projectpc.mp4'}
          type="video/mp4"
        />
        Your browser does not support HTML5 video.
      </video>

      {/* Subtle Ambient Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 pointer-events-none"></div>

      {/* Top Floating Skip Button & Badge */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center max-w-7xl mx-auto">
        <div className="bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>SMARTBIN CG</span>
        </div>

        <button
          onClick={onClose}
          className="bg-slate-900/80 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2 transition active:scale-95 backdrop-blur-md"
        >
          <span>{lang === 'hi' ? 'स्किप करें (Skip Intro)' : 'Skip Intro'}</span>
          <FastForward className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Direct Blended Moving Text Overlay directly ON video */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 flex flex-col items-center justify-center h-full">
        
        {/* Animated Subtitle with CSS Mix-Blend-Mode & Backdrop Filter */}
        <div key={captionIndex} className="space-y-4 animate-text-float transition-all duration-700">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mix-blend-difference backdrop-blur-[2px] tracking-tight leading-tight uppercase font-sans drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
            {captions[captionIndex][lang === 'hi' ? 'hi' : 'en']}
          </h1>

          {/* Glowing Indicator Dots */}
          <div className="flex justify-center gap-2 pt-4">
            {captions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  idx === captionIndex ? 'w-12 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]' : 'w-3 bg-white/40'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Big Action Button */}
        <div className="pt-6">
          <button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition active:scale-95 text-sm sm:text-base border-2 border-emerald-300 backdrop-blur-md"
          >
            <span>{lang === 'hi' ? 'स्मार्टबिन ऐप शुरू करें' : "Let's Fix It with SmartBin"}</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>

      </div>

    </div>
  );
}
