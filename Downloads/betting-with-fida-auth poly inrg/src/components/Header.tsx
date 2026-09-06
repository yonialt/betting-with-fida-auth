import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Radio,
  Gamepad2,
  Spade,
  Tv,
  Video,
  Settings,
  ChevronDown,
  User,
  Wallet,
  LogOut,
  Plus,
  Check,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const Header: React.FC = () => {
  const {
    user,
    setLoginModalOpen,
    setSettingsModalOpen,
    setDepositModalOpen,
    openAuthModal,
    logout,
    setAppMode,
  } = useBetting();

  const [activeNavTab, setActiveNavTab] = useState<string>('live');

  // Shared presentation for the top-level category items: uniform type,
  // single-color icons, one accent for active/hover (no per-category colors).
  const categoryLinkClass = (isActive: boolean) =>
    `group flex items-center gap-1 px-2 py-1.5 rounded-md uppercase tracking-wide transition-colors cursor-pointer text-xs sm:text-[13px] font-extrabold ${
      isActive
        ? 'text-emerald-600'
        : 'text-neutral-700 hover:text-emerald-600 hover:bg-neutral-100/70'
    }`;

  const categoryIconClass = (isActive: boolean) =>
    `w-4 h-4 transition-colors ${
      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
    }`;

  const isNavActive = (tab: string) => activeNavTab === tab;

  return (
    <header
      id="main-header"
      className="relative w-full bg-white border-b select-none sticky top-0 z-40 shadow-xs"
      style={{
        backgroundColor: '#1b2838',
        borderColor: '#1b2838',
      }}
    >
      {/* ========================================================
          NAVBAR 1 (TOP): dark navy bar. Account utilities sit at
          the right; the left stays plain navy — the white logo
          circle (below) is centered on the seam with this bar.
         ======================================================== */}
      <div
        className="top-navbar-cutout w-full bg-[#1b2838] text-white px-3 sm:px-4 flex items-center justify-end gap-3 border-b border-neutral-800"
        style={{
          marginLeft: '-2px',
          borderRadius: '0px',
          backgroundColor: '#1b2838',
          height: '46px',
          width: '1354px',
          borderWidth: '1px',
        }}
      >
        {/* Right: Tools, Wallet, Login, Settings, Clock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Account / LOG IN Button */}
          {user.isLoggedIn ? (
            <>
              {/* Modern Connected Wallet & Balance Capsule */}
              <div
                id="header-balance-wallet-pill"
                className="flex items-center rounded-full bg-[#0d1723]/90 hover:bg-[#121f2f] border border-neutral-700/70 hover:border-emerald-500/50 p-0.5 transition-all shadow-inner group"
              >
                {/* Balance Display (opens Wallet modal on click) */}
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center gap-1.5 pl-2.5 pr-2 py-0.5 text-left cursor-pointer focus:outline-none"
                  title="Wallet balance — click for details"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Wallet className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-extrabold text-[12.5px] text-white tracking-tight">
                      {user.balance.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">
                      {user.currency}
                    </span>
                  </div>
                </button>

                {/* Modern Quick Deposit Action Button */}
                <button
                  id="btn-deposit"
                  onClick={() => setDepositModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-[10.5px] font-extrabold rounded-full transition-all shadow-xs active:scale-95 cursor-pointer ml-0.5"
                  title="Deposit Funds"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span className="hidden md:inline">DEPOSIT</span>
                </button>
              </div>

              {/* Modern User Profile Capsule */}
              <div
                id="btn-user-profile"
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-gradient-to-r from-[#131f2d] to-[#0d1622] hover:from-[#192738] hover:to-[#121c2b] border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm group select-none"
                title="Account Profile & Settings"
              >
                {/* Modern Geometric / Monogram Avatar (No person photo or skin tone) */}
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs ring-1.5 ring-white/20 group-hover:ring-cyan-400/60 transition-all">
                    {user.username ? (
                      <span className="leading-none select-none tracking-tight font-mono">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-3.5 h-3.5 text-white stroke-[2.2]" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1622]" />
                </div>

                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[11.5px] font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate max-w-[90px]">
                    {user.username || 'Account'}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-0.5 text-[8.5px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 uppercase tracking-wide">
                      <Check className="w-2 h-2 stroke-[3]" />
                      Verified
                    </span>
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-white transition-transform group-hover:translate-y-0.5 shrink-0 ml-0.5" />
              </div>

              {/* Log out / switch account */}
              <button
                id="btn-logout"
                onClick={logout}
                title="Log out"
                className="p-1.5 text-neutral-400 hover:text-rose-300 hover:bg-neutral-800/90 rounded-full transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                id="btn-login"
                onClick={() => openAuthModal('login')}
                className="px-4 py-1.5 text-white text-xs font-black rounded uppercase tracking-wider transition-all cursor-pointer border border-neutral-600 hover:bg-neutral-800"
              >
                LOG IN
              </button>
              <button
                id="btn-signup"
                onClick={() => openAuthModal('signup')}
                className="px-4 py-1.5 bg-[#ffc600] hover:bg-[#f0ba00] text-black text-xs font-black rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                SIGN UP
              </button>
            </>
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
        </div>
      </div>

      {/* ========================================================
          NAVBAR 2 (SECOND NAVBAR): Full Categories & Products
          Navigation Bar (In-Frame) — light bar below the navy strip.
          Its left padding gives generous clearance past the logo
          fender arch so TOP-EVENTS and categories start cleanly to the right.
         ======================================================== */}
      <div
        className="w-full bg-white border-b pl-[118px] sm:pl-[128px] lg:pl-[140px] pr-3 sm:pr-4 lg:pr-6 py-1.5"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#1b2838',
        }}
      >
        <nav
          className="w-full flex items-center justify-between gap-1 sm:gap-2 text-[12px] sm:text-[13px] font-extrabold"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Left Category Pillar Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2.5 flex-wrap">
            {/* TOP-EVENTS */}
            <button
              id="nav-top-events"
              onClick={() => setActiveNavTab('top-events')}
              className={categoryLinkClass(isNavActive('top-events'))}
            >
              <Flame className={categoryIconClass(isNavActive('top-events'))} />
              <span>TOP-EVENTS</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* SPORTS */}
            <button
              id="nav-sports"
              onClick={() => setActiveNavTab('sports')}
              className={categoryLinkClass(isNavActive('sports'))}
            >
              <Zap className={categoryIconClass(isNavActive('sports'))} />
              <span>SPORTS</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* LIVE */}
            <button
              id="nav-live"
              onClick={() => setActiveNavTab('live')}
              className={categoryLinkClass(isNavActive('live'))}
            >
              <Radio
                className={categoryIconClass(isNavActive('live'))}
                style={{ color: '#ff0404' }}
              />
              <span style={{ color: '#000000' }}>LIVE</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* ESPORTS */}
            <button
              id="nav-esports"
              onClick={() => setActiveNavTab('esports')}
              className={categoryLinkClass(isNavActive('esports'))}
            >
              <Gamepad2 className={categoryIconClass(isNavActive('esports'))} />
              <span
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  borderColor: '#ffffff',
                }}
              >
                ESPORTS
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* CASINO */}
            <button
              id="nav-casino"
              onClick={() => setActiveNavTab('casino')}
              className={categoryLinkClass(isNavActive('casino'))}
            >
              <Spade className={categoryIconClass(isNavActive('casino'))} />
              <span>CASINO</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* LIVE CASINO */}
            <button
              id="nav-live-casino"
              onClick={() => setActiveNavTab('live-casino')}
              className={categoryLinkClass(isNavActive('live-casino'))}
            >
              <Tv className={categoryIconClass(isNavActive('live-casino'))} />
              <span>LIVE CASINO</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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

      {/* ========================================================
          LARGE WHITE LOGO AREA — spans the full header height on
          the left (same pure white as the second nav below, so the
          two read as one continuous white surface). It holds a
          single large logo whose center sits exactly on the seam
          (the top navbar's bottom edge) — the "wheel" position the
          fender arch below is carved around.
         ======================================================== */}
      <div
        className="absolute inset-y-0 left-0 w-[88px] sm:w-[97px] lg:w-[107px] bg-white z-[6] flex items-center justify-center"
        style={{ borderRadius: '66px' }}
      >
        <div
          id="brand-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute left-[15px] sm:left-[13px] lg:left-[11px] top-[42px] sm:top-[46px] lg:top-[50px] -translate-y-1/2 w-[86px] h-[86px] sm:w-[98px] sm:h-[98px] lg:w-[110px] lg:h-[110px] overflow-hidden flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95"
          style={{
            borderRadius: '192px',
            marginLeft: '-12px',
            marginRight: '7px',
            marginTop: '-3px',
            marginBottom: '-7px',
            height: '115px',
            width: '110px',
            paddingTop: '-10px',
            paddingLeft: '-12px',
            paddingRight: '-13px',
            paddingBottom: '-10px',
          }}
        >
          {/* Rasterized badge (square PNG with a transparent
              background). The badge circle fills ~91.2% of the
              image, so the image renders at ~89.7% of the box to
              keep the badge at exactly the size the SVG badge had,
              centered in the box. */}
          <img
            src="/hagerawi-logo.png"
            alt="Hagerawi Logo"
            className="absolute block select-none pointer-events-none"
            style={{ width: '89.7%', maxWidth: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        </div>
      </div>

      {/* ========================================================
          CURVED BOUNDARY — authentic car fender arch:
          Concentric circular arc clip paths for the fender cutout.
         ======================================================== */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="fender-cutout-mobile" clipPathUnits="userSpaceOnUse">
            <path d="M 88.66 0 A 52 52 0 0 1 109.65 36 L 9999 36 L 9999 0 Z" />
          </clipPath>
          <clipPath id="fender-cutout-sm" clipPathUnits="userSpaceOnUse">
            <path d="M 97.33 0 A 58 58 0 0 1 119.69 40 L 9999 40 L 9999 0 Z" />
          </clipPath>
          <clipPath id="fender-cutout-lg" clipPathUnits="userSpaceOnUse">
            <path d="M 107.53 0 A 65 65 0 0 1 130.93 47 L 9999 47 L 9999 0 Z" />
          </clipPath>
        </defs>
      </svg>
    </header>
  );
};
