import React, { useState, useEffect } from 'react';
import { FastForward, Sparkles, ArrowRight, X, Play } from 'lucide-react';

export default function IntroModal({ lang, onClose }) {
  const [captionIndex, setCaptionIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

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

  // Video plays from 8s to 15s (7 seconds total loop)
  // Sync each caption evenly across the 7-second video loop (~2.33s each)
  useEffect(() => {
    // Start caption cycle immediately or once video loads
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % captions.length);
    }, 2350);
    return () => clearInterval(interval);
  }, [captions.length]);

  // Fallback safety to ensure text is visible even if onLoad event is delayed
  useEffect(() => {
    const timer = setTimeout(() => setVideoLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-300">
      
      {/* Centered Full-bleed YouTube Video Background (8s to 15s loop) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
        <iframe
          onLoad={() => setVideoLoaded(true)}
          className="w-[240vw] h-[240vh] min-w-full min-h-full object-cover pointer-events-none border-0 transition-opacity duration-700"
          src="https://www.youtube.com/embed/IKHLYEqWEUg?autoplay=1&mute=1&controls=0&loop=1&playlist=IKHLYEqWEUg&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&start=8&end=15"
          title="SmartBin Intro Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Ambient Vignette Overlay for High Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 pointer-events-none"></div>

      {/* Top Floating Skip Button & Badge */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center max-w-7xl mx-auto">
        <div className="bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 text-xs font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>SMARTBIN CG</span>
        </div>

        <button
          onClick={onClose}
          className="bg-slate-900/90 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2 transition active:scale-95 backdrop-blur-md"
        >
          <span>{lang === 'hi' ? 'स्किप करें (Skip Intro)' : 'Skip Intro'}</span>
          <FastForward className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Moving Text & Action Button Overlay synced directly to video */}
      <div className="absolute inset-0 z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center space-y-8">
        
        {/* Animated Subtitle with Instant Entry */}
        <div
          key={captionIndex}
          className={`space-y-4 animate-text-float transition-all duration-500 w-full flex flex-col items-center justify-center ${
            videoLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/20 px-6 sm:px-10 py-5 sm:py-6 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase font-sans drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
              {captions[captionIndex][lang === 'hi' ? 'hi' : 'en']}
            </h1>
          </div>

          {/* Glowing Indicator Progress Dots */}
          <div className="flex justify-center items-center gap-2 pt-3">
            {captions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === captionIndex
                    ? 'w-10 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]'
                    : 'w-2.5 bg-white/40'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Centered Launch Action Button */}
        <div className="pt-2 flex justify-center w-full">
          <button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition active:scale-95 text-sm sm:text-base border-2 border-emerald-300 backdrop-blur-md hover:scale-105"
          >
            <span>{lang === 'hi' ? 'स्मार्टबिन ऐप शुरू करें' : "Let's Fix It with SmartBin"}</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>

      </div>

    </div>
  );
}
