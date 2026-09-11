import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface BillboardSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  badge: string;
  bgGradient: string;
  accentColor: string;
  ctaAction?: 'polymarket' | 'play2birr' | 'invite';
}

const BILLBOARD_SLIDES: BillboardSlide[] = [
  {
    id: 'two-birr-entry',
    title: 'BET & PREDICT FROM JUST 2 BIRR',
    subtitle: 'Get in the game with only 2 ETB — the smallest stake, the biggest thrills on ሃገራዊ.',
    ctaText: 'PLAY WITH 2 BIRR',
    badge: 'ONLY 2 BIRR',
    bgGradient: 'from-[#0a0f1c] via-[#10241a] to-[#15803d]',
    accentColor: '#ffc600',
    ctaAction: 'play2birr',
  },
  {
    id: 'prediction-market',
    title: 'ሃገራዊ PREDICTION MARKET IS LIVE',
    subtitle: 'Trade YES / NO on politics, sports & crypto outcomes — shares from only 2 Birr.',
    ctaText: 'EXPLORE MARKETS',
    badge: 'NEW',
    bgGradient: 'from-[#030712] via-[#0b1d3a] to-[#1e3a8a]',
    accentColor: '#00e5ff',
    ctaAction: 'polymarket',
  },
  {
    id: 'welcome-bonus',
    title: '300% WELCOME BONUS UP TO 10,000 ETB',
    subtitle: 'Register today and triple your very first deposit instantly.',
    ctaText: 'CLAIM BONUS',
    badge: 'EXCLUSIVE',
    bgGradient: 'from-[#0f172a] via-[#1e1b4b] to-[#4338ca]',
    accentColor: '#ffc600',
  },
  {
    id: 'world-football',
    title: 'ሃገራዊ — YOUR HOME FOR WORLD FOOTBALL',
    subtitle: 'Back the giants of Serie A, La Liga and the Premier League every matchday.',
    ctaText: 'FIND OUT MORE',
    badge: 'OFFICIAL PARTNER',
    bgGradient: 'from-[#050b14] via-[#091b36] to-[#04439c]',
    accentColor: '#76b82a',
  },
  {
    id: 'champions-league',
    title: 'UEFA CHAMPIONS LEAGUE SUPREME ODDS',
    subtitle: 'Boosted odds up to +25% on every knockout-stage match.',
    ctaText: 'BET NOW',
    badge: 'SUPER BOOST',
    bgGradient: 'from-[#030712] via-[#0b1d3a] to-[#1e3a8a]',
    accentColor: '#00e5ff',
  },
  {
    id: 'daily-jackpot',
    title: 'DAILY 2 BIRR JACKPOT PREDICTIONS',
    subtitle: 'Stake just 2 Birr on the daily jackpot and chase up to 500,000 ETB.',
    ctaText: 'ENTER JACKPOT',
    badge: 'DAILY 2 BIRR',
    bgGradient: 'from-[#0a0f1c] via-[#101f3e] to-[#1d4ed8]',
    accentColor: '#ffc600',
  },
  {
    id: 'crypto-5m',
    title: 'CRYPTO 5-MINUTE UP OR DOWN',
    subtitle: 'Predict Bitcoin every 5 minutes — enter from 2 Birr and cash out fast.',
    ctaText: 'TRADE NOW',
    badge: 'FAST MARKETS',
    bgGradient: 'from-[#030712] via-[#0a1a33] to-[#0369a1]',
    accentColor: '#38bdf8',
    ctaAction: 'polymarket',
  },
  {
    id: 'refer-friends',
    title: 'REFER FRIENDS, EARN 2 BIRR PER BET',
    subtitle: 'Invite friends to ሃገራዊ and earn 2 Birr cashback on every bet they place.',
    ctaText: 'INVITE & EARN',
    badge: 'REWARDS',
    bgGradient: 'from-[#04140a] via-[#0a2e1a] to-[#166534]',
    accentColor: '#22c55e',
    ctaAction: 'invite',
  },
];

export const PromoBillboard: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setBonusesModalOpen, setAppMode, user, openAuthModal, setSettingsModalOpen } = useBetting();

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
          MAIN HERO BILLBOARD CAROUSEL (ሃገራዊ Promo Banner)
         ======================================================== */}
      <div
        className="relative w-full overflow-hidden h-[192px] sm:h-[210px] md:h-[228px] flex items-center justify-between"
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
        <div className="relative z-10 max-w-[1920px] w-full mx-auto px-10 sm:px-16 md:px-20 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left Text & CTA */}
          <div className="max-w-xl flex flex-col items-start gap-2">
            <h1 className="text-white font-black text-lg sm:text-2xl md:text-3xl lg:text-[28px] tracking-tight uppercase leading-tight drop-shadow-md line-clamp-2">
              {currentSlide.title}
            </h1>
            <p className="text-neutral-200 text-xs sm:text-sm font-medium tracking-wide drop-shadow-xs line-clamp-2">
              {currentSlide.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  const action = currentSlide.ctaAction;
                  if (action === 'polymarket') {
                    // EXPLORE MARKETS / TRADE NOW → open the Polymarket prediction-market page
                    setAppMode('polymarket');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (action === 'play2birr') {
                    // PLAY WITH 2 BIRR → guests must log in first; players jump down to the matches
                    if (!user.isLoggedIn) {
                      openAuthModal('login');
                    } else {
                      document
                        .getElementById('huge-match-box')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  } else if (action === 'invite') {
                    // INVITE & EARN → guests log in first; players open Settings to grab their referral link
                    if (!user.isLoggedIn) {
                      openAuthModal('login');
                    } else {
                      setSettingsModalOpen(true);
                    }
                  } else {
                    setBonusesModalOpen(true);
                  }
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer hover:brightness-110 flex items-center gap-1.5"
                style={{ backgroundColor: currentSlide.accentColor }}
              >
                <span>{currentSlide.ctaText}</span>
              </button>
            </div>
          </div>

          {/* Right Brand — seamless flat Prediction Market button + glowing logo badge */}
          <div className="hidden md:flex items-center gap-4 relative shrink-0">
            {/* Prediction Market — borderless icon + text (+2px, nudged 4px left) */}
            <div className="flex items-center gap-2 -translate-x-[4px]">
              <TrendingUp
                className="w-[18px] h-[18px] shrink-0"
                strokeWidth={2.75}
                style={{ color: currentSlide.accentColor }}
              />
              <span className="text-[13px] font-black text-white tracking-tight leading-none drop-shadow-xs">
                ሃገራዊ
              </span>
              <span className="text-[12px] font-bold text-white/85 tracking-wide uppercase leading-none drop-shadow-xs">
                Prediction Market
              </span>
            </div>

            {/* Glowing brand emblem — the logo is already a finished circular badge,
                so it sits directly on the gradient with a soft, slide-tinted halo. */}
            <div className="relative w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center">
              <div
                className="absolute inset-2 rounded-full blur-2xl opacity-60 animate-pulse"
                style={{ backgroundColor: currentSlide.accentColor }}
              />
              {/* Capillary waves — two staggered ripple rings radiating from the logo */}
              <span
                className="hagerawi-ripple absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: currentSlide.accentColor }}
              />
              <span
                className="hagerawi-ripple hagerawi-ripple-delay absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: currentSlide.accentColor }}
              />
              <img
                src="/hagerawi-logo.png"
                alt="ሃገራዊ Logo"
                className="relative w-full h-full object-contain drop-shadow-[0_0_16px_rgba(0,0,0,0.45)] select-none pointer-events-none"
              />
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
        </div>
      </div>
    </div>
  );
};
