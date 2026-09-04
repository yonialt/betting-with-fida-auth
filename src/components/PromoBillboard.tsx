import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface BillboardSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  badge?: string;
  partnerLogo?: string;
  bgGradient: string;
  accentColor: string;
  visualType: 'serie-a' | 'ucl' | 'welcome' | 'el-clasico';
}

const BILLBOARD_SLIDES: BillboardSlide[] = [
  {
    id: 'serie-a',
    title: '1XBET: THE OFFICIAL PARTNER OF SERIE A',
    subtitle: 'Feel the passion of Serie A by winning with 1xBet!',
    ctaText: 'FIND OUT MORE',
    badge: 'OFFICIAL PARTNER',
    bgGradient: 'from-[#050b14] via-[#091b36] to-[#04439c]',
    accentColor: '#76b82a',
    visualType: 'serie-a',
  },
  {
    id: 'champions-league',
    title: 'UEFA CHAMPIONS LEAGUE SUPREME ODDS',
    subtitle: 'Boosted odds up to +25% on every knockout stage match!',
    ctaText: 'BET NOW',
    badge: 'SUPER BOOST',
    bgGradient: 'from-[#030712] via-[#0b1d3a] to-[#1e3a8a]',
    accentColor: '#00e5ff',
    visualType: 'ucl',
  },
  {
    id: 'welcome-bonus',
    title: '300% WELCOME BONUS UP TO 10,000 ETB',
    subtitle: 'Register today and triple your first deposit instantly.',
    ctaText: 'CLAIM BONUS',
    badge: 'EXCLUSIVE',
    bgGradient: 'from-[#0f172a] via-[#1e1b4b] to-[#4338ca]',
    accentColor: '#ffc600',
    visualType: 'welcome',
  },
];

export const PromoBillboard: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setBonusesModalOpen } = useBetting();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % BILLBOARD_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentSlide = BILLBOARD_SLIDES[currentSlideIndex];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % BILLBOARD_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + BILLBOARD_SLIDES.length) % BILLBOARD_SLIDES.length);
  };

  return (
    <div id="promo-billboard-container" className="w-full bg-[#0a1118] select-none border-b border-neutral-800">
      {/* ========================================================
          MAIN HERO BILLBOARD CAROUSEL (Serie A / Promo Banner)
         ======================================================== */}
      <div
        className="relative w-full overflow-hidden min-h-[150px] sm:min-h-[180px] md:min-h-[210px] flex items-center justify-between"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Dynamic Background with futuristic geometric pattern & glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient} transition-all duration-700 ease-in-out`}>
          {/* Futuristic geometric grid overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 75% 50%, rgba(0, 145, 255, 0.45) 0%, transparent 65%), linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%)',
            }}
          />
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-black/40 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-xs border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Content Container */}
        <div className="relative z-10 max-w-[1920px] w-full mx-auto px-10 sm:px-16 md:px-20 py-4 sm:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left Text & CTA */}
          <div className="max-w-xl flex flex-col items-start gap-1.5 sm:gap-2.5">
            <h1 className="text-white font-black text-lg sm:text-2xl md:text-3xl lg:text-[28px] tracking-tight uppercase leading-tight drop-shadow-md">
              {currentSlide.title}
            </h1>
            <p className="text-neutral-200 text-xs sm:text-sm font-medium tracking-wide drop-shadow-xs">
              {currentSlide.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setBonusesModalOpen(true)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer hover:brightness-110 flex items-center gap-1.5"
                style={{ backgroundColor: currentSlide.accentColor }}
              >
                <span>{currentSlide.ctaText}</span>
              </button>
            </div>
          </div>

          {/* Right Partner & 3D Visual Artwork */}
          <div className="hidden md:flex items-center gap-4 relative shrink-0">
            {/* Serie A / Partner Badge Box */}
            <div className="bg-white/95 backdrop-blur-xs rounded px-3 py-1.5 flex items-center gap-3 shadow-lg border border-white/20">
              <div className="flex items-center gap-1">
                {/* Serie A Logo Glyph */}
                <div className="w-5 h-5 bg-[#003882] rounded-xs flex items-center justify-center text-white font-black text-[10px] tracking-tighter">
                  A
                </div>
                <span className="text-[10px] font-black text-[#003882] tracking-tighter uppercase leading-none">
                  SERIE A
                </span>
              </div>
              <div className="w-px h-4 bg-neutral-300"></div>
              <div className="flex items-center">
                <span className="text-[#0091ff] font-black italic text-xs tracking-tight">1x</span>
                <span className="text-[#ffb700] font-black italic text-xs tracking-tight">BET</span>
              </div>
            </div>

            {/* Futuristic 3D Serie A Crest Silhouette Graphic */}
            <div className="relative w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,145,255,0.7)] text-cyan-400">
                <polygon
                  points="50,5 90,25 90,75 50,95 10,75 10,25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-60"
                />
                <polygon
                  points="50,15 80,30 80,70 50,85 20,70 20,30"
                  fill="url(#crestGrad)"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                />
                {/* Stylized Serie A 'A' Letterform */}
                <text
                  x="50"
                  y="62"
                  fontSize="38"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  fill="#ffffff"
                  textAnchor="middle"
                  className="italic"
                >
                  A
                </text>
                <defs>
                  <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00c6ff" />
                    <stop offset="50%" stopColor="#0072ff" />
                    <stop offset="100%" stopColor="#003882" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-black/40 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-xs border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Slide Indicators (Dots & Active Pill) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {BILLBOARD_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-6 bg-white shadow-xs'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
          {/* Extended aesthetic indicator dots matching 1xBet style */}
          {[...Array(6)].map((_, i) => (
            <div key={`extra-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/20 hidden sm:block" />
          ))}
        </div>
      </div>
    </div>
  );
};
