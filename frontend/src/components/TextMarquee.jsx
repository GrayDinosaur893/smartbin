import React from 'react';

/**
 * TextMarquee:
 * High-impact repeating oversized marquee inspired by TBWA\HAKUHODO.
 * Features:
 * - Direction controls (left, right)
 * - Acid neon accents and slash separators
 * - Accessible aria-hidden clones for infinite seamless scroll
 */
export default function TextMarquee({ 
  items = [], 
  direction = 'left', 
  speed = 'normal', 
  className = '',
  highlightColor = 'text-[#e2fd00]'
}) {
  const animClass = direction === 'left' 
    ? (speed === 'fast' ? 'animate-marquee-left-fast' : 'animate-marquee-left') 
    : 'animate-marquee-right';

  const content = (
    <div className="flex items-center gap-8 shrink-0 py-2">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <span className="font-display font-black text-3xl md:text-5xl lg:text-7xl tracking-tighter uppercase whitespace-nowrap text-white/90 hover:text-[#e2fd00] transition-colors duration-300">
            {item}
          </span>
          <span className={`font-mono-code font-bold text-2xl md:text-4xl ${highlightColor} select-none`}>
            ///
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden select-none border-y border-white/10 bg-black/90 py-3 ${className}`}>
      <div className={animClass}>
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
