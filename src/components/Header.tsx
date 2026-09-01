import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Radio,
  Gamepad2,
  Spade,
  Tv,
  Video,
  Settings,
  Globe,
  ChevronDown,
  User,
  Wallet,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const Header: React.FC = () => {
  const {
    user,
    setLoginModalOpen,
    setSettingsModalOpen,
    setDepositModalOpen,
    setOnlyWithStreams,
    onlyWithStreams,
    setAppMode,
  } = useBetting();

  const [timeString, setTimeString] = useState<string>('02:50');
  const [activeNavTab, setActiveNavTab] = useState<string>('live');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeString(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="main-header" className="w-full bg-white border-b border-neutral-200 select-none sticky top-0 z-40 shadow-xs">
      {/* ========================================================
          NAVBAR 1 (TOP NAVBAR): Brand, Account & Utilities
         ======================================================== */}
      <div className="w-full bg-[#1b2838] text-white px-3 sm:px-4 py-2 flex items-center justify-between gap-3 border-b border-neutral-800">
        {/* Left: 1xBET Logo */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div
            id="brand-logo"
            className="flex items-center cursor-pointer transition-transform active:scale-95 select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/logo.png" alt="Fida Bet Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>

        {/* Right: Tools, Wallet, Login, Settings, Clock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Video Streams Filter */}
          <button
            id="btn-video-filter"
            onClick={() => setOnlyWithStreams((prev) => !prev)}
            title={onlyWithStreams ? "Showing only live streams" : "Show all / toggle stream filter"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              onlyWithStreams
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-[#101822] hover:bg-[#223042] text-neutral-300 border border-neutral-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Live Stream</span>
          </button>

          {/* User Account / LOG IN Button */}
          {user.isLoggedIn ? (
            <>
              <button
                id="btn-deposit"
                onClick={() => setDepositModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors cursor-pointer shadow-xs"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden md:inline">DEPOSIT</span>
              </button>
              <div
                id="btn-user-profile"
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 bg-[#101822] hover:bg-[#16202c] border border-neutral-700 rounded px-2.5 py-1 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                  <span className="font-mono text-emerald-400">{user.balance.toLocaleString()} {user.currency}</span>
                </div>
                <div className="w-px h-3.5 bg-neutral-700"></div>
                <div className="flex items-center">
                  <img src="/profile-avatar.png" alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                </div>
              </div>
            </>
          ) : (
            <button
              id="btn-login"
              onClick={() => setLoginModalOpen(true)}
              className="px-4 py-1.5 bg-[#ffc600] hover:bg-[#f0ba00] text-black text-xs font-black rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            >
              LOG IN
            </button>
          )}

          {/* Settings Gear */}
          <button
            id="btn-settings"
            onClick={() => setSettingsModalOpen(true)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            title="Betting Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Language & Time Display */}
          <div
            id="language-time-indicator"
            onClick={() => setSettingsModalOpen(true)}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-neutral-300 cursor-pointer hover:text-white px-1.5 py-1 rounded hover:bg-neutral-800 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-bold">EN</span>
            <span className="font-mono text-neutral-400 text-[11px]">{timeString}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          NAVBAR 2 (SECOND NAVBAR ON TOP OF EVERYTHING):
          Full Categories & Products Navigation Bar (In-Frame)
         ======================================================== */}
      <div className="w-full bg-white border-b border-neutral-200 px-3 sm:px-4 lg:px-6 py-1.5">
        <nav className="w-full flex items-center justify-between gap-1 sm:gap-2 text-[12px] sm:text-[13px] font-extrabold text-[#222]">
          {/* Left Category Pillar Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2.5 flex-wrap">
            {/* 1xBET Mini Brand Accent */}
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center pr-2.5 mr-1 border-r border-neutral-300 cursor-pointer select-none"
            >
              <img src="/logo.png" alt="Fida Bet" className="h-6 w-auto object-contain" />
            </div>

            {/* TOP-EVENTS */}
            <button
              id="nav-top-events"
              onClick={() => setActiveNavTab('top-events')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight cursor-pointer ${
                activeNavTab === 'top-events'
                  ? 'bg-neutral-100 text-[#ff5722]'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <Flame className="w-4 h-4 text-[#ff5722]" />
              <span>TOP-EVENTS</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* SPORTS */}
            <button
              id="nav-sports"
              onClick={() => setActiveNavTab('sports')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight cursor-pointer ${
                activeNavTab === 'sports'
                  ? 'bg-neutral-100 text-[#0091ff]'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <Zap className="w-4 h-4 text-[#0091ff]" />
              <span>SPORTS</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* LIVE (Highlighted Active Style with Pulsing Dot) */}
            <button
              id="nav-live"
              onClick={() => setActiveNavTab('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all uppercase tracking-tight font-black cursor-pointer ${
                activeNavTab === 'live'
                  ? 'bg-neutral-100 text-black shadow-2xs border border-neutral-200/80'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-red-600" />
              <span className="text-black font-black">LIVE</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* 1XGAMES */}
            <button
              id="nav-1xgames"
              onClick={() => setActiveNavTab('1xgames')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight cursor-pointer ${
                activeNavTab === '1xgames'
                  ? 'bg-neutral-100 text-emerald-600'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span>1XGAMES</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* CASINO */}
            <button
              id="nav-casino"
              onClick={() => setActiveNavTab('casino')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight cursor-pointer ${
                activeNavTab === 'casino'
                  ? 'bg-neutral-100 text-purple-600'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <Spade className="w-4 h-4 text-purple-600" />
              <span>CASINO</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* LIVE CASINO */}
            <button
              id="nav-live-casino"
              onClick={() => setActiveNavTab('live-casino')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight cursor-pointer ${
                activeNavTab === 'live-casino'
                  ? 'bg-neutral-100 text-pink-600'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <Tv className="w-4 h-4 text-pink-600" />
              <span>LIVE CASINO</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* ESPORTS */}
            <button
              id="nav-esports"
              onClick={() => setActiveNavTab('esports')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors uppercase tracking-tight cursor-pointer ${
                activeNavTab === 'esports'
                  ? 'bg-neutral-100 text-amber-600'
                  : 'text-[#222] hover:bg-neutral-100'
              }`}
            >
              <Tv className="w-4 h-4 text-amber-600" />
              <span>ESPORTS</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          {/* Right Anchored: POLYMARKET LIVE (Highlighted blue CTA badge button expanded to right edge) */}
          <button
            id="nav-polymarket"
            onClick={() => setAppMode('polymarket')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black hover:opacity-95 transition-all uppercase tracking-tight shadow-xs active:scale-95 cursor-pointer shrink-0 ml-auto"
          >
            <div className="w-4 h-4 rounded-xs bg-white text-blue-600 flex items-center justify-center text-[10px] font-black shadow-2xs">
              P
            </div>
            <span className="font-extrabold tracking-tight">POLYMARKET</span>
            <span className="bg-[#ffc600] text-black text-[9px] px-1 py-0.2 rounded font-black tracking-wider">
              LIVE
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

