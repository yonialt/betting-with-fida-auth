import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const Header: React.FC = () => {
  const {
    user,
    setSettingsModalOpen,
    setDepositModalOpen,
    openAuthModal,
    logout,
    appMode,
    setAppMode,
    setActiveSport,
    setActiveSubTab,
    setActiveCenterView,
    setCasinoView,
    setCasinoCategory,
  } = useBetting();

  const [activeNavTab, setActiveNavTab] = useState<string>('live');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Phones: the category links live in an accordion behind a "Menu" button.
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const handleMenuEnter = (menuKey: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenMenu(menuKey);
  };

  const handleMenuLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 180);
  };

  const handlePopupEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Close any open category dropdown / the mobile menu when clicking outside
  useEffect(() => {
    if (!openMenu && !isMobileNavOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktopNav = navRef.current ? navRef.current.contains(target) : false;
      const insideMobileNav =
        (mobileNavRef.current ? mobileNavRef.current.contains(target) : false) ||
        (mobilePanelRef.current ? mobilePanelRef.current.contains(target) : false);
      if (!insideDesktopNav && !insideMobileNav) {
        setOpenMenu(null);
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [openMenu, isMobileNavOpen]);

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

  const toggleMenu = (key: string) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  // Bring the sportsbook matches grid into view with the chosen sport / time filters
  const openMatches = (sport: string, subTab: string, navKey: string) => {
    setActiveSport(sport as any);
    setActiveSubTab(subTab);
    setActiveCenterView('matches');
    setCasinoView('none');
    setActiveNavTab(navKey);
    setOpenMenu(null);
    setTimeout(() => {
      document
        .getElementById('huge-match-box')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Launch the Casino / Live Casino lobby overlay on a given category
  const openCasino = (mode: 'casino' | 'live-casino', category: string, navKey: string) => {
    setCasinoCategory(category);
    setCasinoView(mode);
    setActiveNavTab(navKey);
    setOpenMenu(null);
  };

  // ---- Dropdown datasets (Strictly NO EMOJIS - Clean & Professional Sportsbook UI) ----
  const quickViews = [
    { label: 'Bets on UFC', sport: 'martial-arts', subTab: 'matches' },
    { label: 'Bet on Your National Team', sport: 'football', subTab: 'matches' },
    { label: 'Matches of the Day', sport: 'all', subTab: 'matches' },
    { label: 'Live Events', sport: 'all', subTab: 'live' },
    { label: 'Today', sport: 'all', subTab: 'today' },
    { label: 'Tomorrow', sport: 'all', subTab: 'tomorrow' },
    { label: 'Top European Leagues', sport: 'football', subTab: 'matches' },
    { label: 'Premier League Specials', sport: 'football', subTab: 'matches' },
    { label: 'My Favorites', sport: 'all', subTab: 'recommended' },
  ];

  const sportsMenu = [
    { label: 'Bets on UFC', sport: 'martial-arts' },
    { label: 'Bet on Your National Team', sport: 'football' },
    { label: 'Football', sport: 'football' },
    { label: 'Tennis', sport: 'tennis' },
    { label: 'Basketball', sport: 'basketball' },
    { label: 'Ice Hockey', sport: 'ice-hockey' },
    { label: 'Volleyball', sport: 'volleyball' },
    { label: 'Table Tennis', sport: 'table-tennis' },
    { label: 'Cricket', sport: 'cricket' },
    { label: 'American Football', sport: 'rugby' },
    { label: 'All Sports', sport: 'all' },
  ];

  const liveMenu = [
    { label: 'Live Events (All Sports)', sport: 'all', subTab: 'live' },
    { label: 'Live Football', sport: 'football', subTab: 'live' },
    { label: 'Live Tennis', sport: 'tennis', subTab: 'live' },
    { label: 'Live Basketball', sport: 'basketball', subTab: 'live' },
    { label: 'Live Ice Hockey', sport: 'ice-hockey', subTab: 'live' },
    { label: 'Live In-Play Tracker', sport: 'all', subTab: 'live' },
    { label: 'Live Previews & Results', sport: 'all', subTab: 'live' },
  ];

  const esportsMenu = [
    { label: 'CS2 (Counter-Strike)', sport: 'esports' },
    { label: 'Dota 2', sport: 'esports' },
    { label: 'League of Legends', sport: 'esports' },
    { label: 'Valorant', sport: 'esports' },
    { label: 'eFootball / FIFA', sport: 'esports' },
    { label: 'NBA 2K', sport: 'esports' },
    { label: 'All Esports Tournaments', sport: 'esports' },
  ];

  // Multi-column Fast Games / Casino as shown in video frame 00:01
  const casinoColumns = [
    {
      title: 'Popular Slots',
      items: [
        { label: 'Western slot', category: 'slots' },
        { label: '21', category: 'blackjack' },
        { label: 'Classic 777', category: 'slots' },
        { label: 'Book of Gold', category: 'slots' },
        { label: 'European Roulette', category: 'roulette' },
      ],
    },
    {
      title: 'Instant & Crash',
      items: [
        { label: 'Crystal', category: 'crash' },
        { label: 'Burning Hot', category: 'slots' },
        { label: 'Aviator', category: 'crash' },
        { label: 'Mines', category: 'crash' },
        { label: 'Plinko', category: 'crash' },
      ],
    },
    {
      title: 'Jackpots & Wins',
      items: [
        { label: 'Apple Of Fortune', category: 'jackpots' },
        { label: 'Spin and Win', category: 'roulette' },
        { label: 'Mega Wheel', category: 'gameshows' },
        { label: 'Royal Jackpot', category: 'jackpots' },
        { label: 'All Casino Games', category: 'all' },
      ],
    },
  ];

  // Live Casino Providers & Tables as shown in video frame 00:02
  const liveCasinoProviders = [
    'WINFINITY',
    'Evolution',
    'AMUSNET',
    'PRAGMATIC PLAY',
    '888 Live',
    'Ezugi',
  ];

  const liveCasinoColumns = [
    {
      title: 'Live Roulette',
      items: [
        { label: 'European Live Roulette', category: 'roulette' },
        { label: 'Auto Roulette', category: 'roulette' },
        { label: 'Lightning Roulette', category: 'roulette' },
      ],
    },
    {
      title: 'Blackjack & Cards',
      items: [
        { label: 'Live Blackjack VIP', category: 'blackjack' },
        { label: 'Infinite Blackjack', category: 'blackjack' },
        { label: 'Speed Baccarat', category: 'baccarat' },
      ],
    },
    {
      title: 'Game Shows & Tables',
      items: [
        { label: 'Crazy Time', category: 'gameshows' },
        { label: 'Monopoly Live', category: 'gameshows' },
        { label: 'All Live Dealers', category: 'all' },
      ],
    },
  ];

  // Clean popup dropdown styling (No emojis, crisp white background, subtle border, shadow)
  const popupMenuClass =
    'absolute left-0 top-full mt-0.5 z-50 min-w-[210px] bg-white rounded-b-md border border-neutral-200/90 shadow-2xl py-1.5 animate-in fade-in-0 zoom-in-95 duration-75 text-neutral-800';

  const popupMultiColClass =
    'absolute left-0 top-full mt-0.5 z-50 bg-white rounded-b-md border border-neutral-200/90 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-75 text-neutral-800 overflow-hidden';

  const popupItemClass =
    'w-full block px-4 py-2 text-[12.5px] font-semibold text-neutral-700 hover:bg-neutral-100/90 hover:text-black transition-colors cursor-pointer text-left whitespace-nowrap';

  // ---- Mobile menu: the same categories as the desktop row, as an accordion.
  // The item lists reuse the dropdown datasets above so the two stay in sync.
  const mobileNavSections: {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    iconColor?: string;
    groups: { title: string; items: { label: string; onSelect: () => void }[] }[];
  }[] = [
    {
      key: 'top-events',
      label: 'TOP-EVENTS',
      icon: Flame,
      groups: [
        {
          title: '',
          items: quickViews.map((it) => ({
            label: it.label,
            onSelect: () => openMatches(it.sport, it.subTab, 'top-events'),
          })),
        },
      ],
    },
    {
      key: 'sports',
      label: 'SPORTS',
      icon: Zap,
      groups: [
        {
          title: '',
          items: sportsMenu.map((it) => ({
            label: it.label,
            onSelect: () => openMatches(it.sport, 'matches', 'sports'),
          })),
        },
      ],
    },
    {
      key: 'live',
      label: 'LIVE',
      icon: Radio,
      iconColor: '#ff0404',
      groups: [
        {
          title: '',
          items: liveMenu.map((it) => ({
            label: it.label,
            onSelect: () => openMatches(it.sport, it.subTab, 'live'),
          })),
        },
      ],
    },
    {
      key: 'esports',
      label: 'ESPORTS',
      icon: Gamepad2,
      groups: [
        {
          title: '',
          items: esportsMenu.map((it) => ({
            label: it.label,
            onSelect: () => openMatches(it.sport, 'matches', 'esports'),
          })),
        },
      ],
    },
    {
      key: 'casino',
      label: 'CASINO',
      icon: Spade,
      groups: casinoColumns.map((col) => ({
        title: col.title,
        items: col.items.map((it) => ({
          label: it.label,
          onSelect: () => openCasino('casino', it.category, 'casino'),
        })),
      })),
    },
    {
      key: 'live-casino',
      label: 'LIVE CASINO',
      icon: Tv,
      groups: [
        {
          title: 'Providers',
          items: liveCasinoProviders.map((provider) => ({
            label: provider,
            onSelect: () => openCasino('live-casino', 'all', 'live-casino'),
          })),
        },
        ...liveCasinoColumns.map((col) => ({
          title: col.title,
          items: col.items.map((it) => ({
            label: it.label,
            onSelect: () => openCasino('live-casino', it.category, 'live-casino'),
          })),
        })),
      ],
    },
  ];

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          width: '100%',
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
                {/* Balance Display (opens Deposit modal on click) */}
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(true)}
                  className="flex items-center gap-1.5 pl-2.5 pr-2 py-0.5 text-left cursor-pointer focus:outline-none"
                  title="Wallet balance — click to deposit"
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
                  <span className="hidden sm:inline">DEPOSIT</span>
                </button>
              </div>

              {/* Modern User Profile Capsule */}
              <div
                id="btn-user-profile"
                onClick={() => {
                  // Open the portfolio / predictions profile page
                  window.history.pushState({}, '', '/profile');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-gradient-to-r from-[#131f2d] to-[#0d1622] hover:from-[#192738] hover:to-[#121c2b] border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm group select-none"
                title="Account Profile & Settings"
              >
                {/* Modern Geometric / Monogram Avatar (No person photo or skin tone) */}
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs ring-1.5 ring-white/20 group-hover:ring-cyan-400/60 transition-all overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Profile picture"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : user.username ? (
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
        className="relative w-full bg-white border-b pl-[118px] sm:pl-[128px] lg:pl-[140px] pr-3 sm:pr-4 lg:pr-6 py-1.5"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#1b2838',
        }}
      >
        <nav
          className="w-full flex items-center justify-between gap-1 sm:gap-2 text-[12px] sm:text-[13px] font-extrabold"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Left Category Pillar Links (desktop / large screens) */}
          <div
            ref={navRef}
            className="hidden lg:flex items-center gap-1 sm:gap-1.5 lg:gap-2.5 flex-wrap"
          >
            {/* TOP-EVENTS ▾ — quick match views */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('top-events')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                id="nav-top-events"
                onClick={() => toggleMenu('top-events')}
                className={categoryLinkClass(isNavActive('top-events'))}
              >
                <Flame className={categoryIconClass(isNavActive('top-events'))} />
                <span>TOP-EVENTS</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openMenu === 'top-events' ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openMenu === 'top-events' && (
                <div
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handleMenuLeave}
                  className={popupMenuClass}
                >
                  {quickViews.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => openMatches(it.sport, it.subTab, 'top-events')}
                      className={popupItemClass}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SPORTS ▾ */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('sports')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                id="nav-sports"
                onClick={() => toggleMenu('sports')}
                className={categoryLinkClass(isNavActive('sports'))}
              >
                <Zap className={categoryIconClass(isNavActive('sports'))} />
                <span>SPORTS</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openMenu === 'sports' ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openMenu === 'sports' && (
                <div
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handleMenuLeave}
                  className={popupMenuClass}
                >
                  {sportsMenu.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => openMatches(it.sport, 'matches', 'sports')}
                      className={popupItemClass}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE ▾ — jumps straight to in-play matches & shows live menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('live')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                id="nav-live"
                onClick={() => {
                  toggleMenu('live');
                  openMatches('all', 'live', 'live');
                }}
                className={categoryLinkClass(isNavActive('live'))}
              >
                <Radio
                  className={categoryIconClass(isNavActive('live'))}
                  style={{ color: '#ff0404' }}
                />
                <span style={{ color: '#000000' }}>LIVE</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openMenu === 'live' ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openMenu === 'live' && (
                <div
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handleMenuLeave}
                  className={popupMenuClass}
                >
                  {liveMenu.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => openMatches(it.sport, it.subTab, 'live')}
                      className={popupItemClass}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ESPORTS ▾ — filters matches to esports & shows esports menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('esports')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                id="nav-esports"
                onClick={() => {
                  toggleMenu('esports');
                  openMatches('esports', 'matches', 'esports');
                }}
                className={categoryLinkClass(isNavActive('esports'))}
              >
                <Gamepad2 className={categoryIconClass(isNavActive('esports'))} />
                <span style={{ color: '#000000' }}>ESPORTS</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openMenu === 'esports' ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openMenu === 'esports' && (
                <div
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handleMenuLeave}
                  className={popupMenuClass}
                >
                  {esportsMenu.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => openMatches(it.sport, 'matches', 'esports')}
                      className={popupItemClass}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CASINO ▾ — opens the casino lobby (3-column layout) */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('casino')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                id="nav-casino"
                onClick={() => toggleMenu('casino')}
                className={categoryLinkClass(isNavActive('casino'))}
              >
                <Spade className={categoryIconClass(isNavActive('casino'))} />
                <span>CASINO</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openMenu === 'casino' ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openMenu === 'casino' && (
                <div
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handleMenuLeave}
                  className={popupMultiColClass}
                >
                  <div className="w-[490px] grid grid-cols-3 divide-x divide-neutral-100 p-1.5">
                    {casinoColumns.map((col) => (
                      <div key={col.title} className="flex flex-col">
                        <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 select-none">
                          {col.title}
                        </div>
                        {col.items.map((it) => (
                          <button
                            key={it.label}
                            onClick={() => openCasino('casino', it.category, 'casino')}
                            className={popupItemClass}
                          >
                            {it.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LIVE CASINO ▾ — opens the live-dealer lobby (providers row + 3 columns) */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('live-casino')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                id="nav-live-casino"
                onClick={() => toggleMenu('live-casino')}
                className={categoryLinkClass(isNavActive('live-casino'))}
              >
                <Tv className={categoryIconClass(isNavActive('live-casino'))} />
                <span>LIVE CASINO</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    openMenu === 'live-casino' ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openMenu === 'live-casino' && (
                <div
                  onMouseEnter={handlePopupEnter}
                  onMouseLeave={handleMenuLeave}
                  className={popupMultiColClass}
                >
                  <div className="w-[520px]">
                    {/* Top Providers Row */}
                    <div className="px-3 py-2 bg-neutral-50/90 border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto">
                      {liveCasinoProviders.map((provider) => (
                        <button
                          key={provider}
                          onClick={() => openCasino('live-casino', 'all', 'live-casino')}
                          className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-white border border-neutral-200 text-neutral-700 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 rounded transition-all cursor-pointer select-none whitespace-nowrap"
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                    {/* 3 Columns */}
                    <div className="grid grid-cols-3 divide-x divide-neutral-100 p-1.5">
                      {liveCasinoColumns.map((col) => (
                        <div key={col.title} className="flex flex-col">
                          <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 select-none">
                            {col.title}
                          </div>
                          {col.items.map((it) => (
                            <button
                              key={it.label}
                              onClick={() => openCasino('live-casino', it.category, 'live-casino')}
                              className={popupItemClass}
                            >
                              {it.label}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <span className="hidden sm:flex bg-[#ffc600] text-black text-[9px] px-1 py-0.2 rounded font-black tracking-wider items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              LIVE
            </span>
          </button>

          {/* Phones/tablets: single "Menu" button (three horizontal lines) that opens
              the category accordion — anchored to the right edge, between the
              POLYMARKET button and the screen edge */}
          <div ref={mobileNavRef} className="lg:hidden ml-1.5 sm:ml-2.5">
            <button
              id="btn-mobile-categories"
              onClick={() => {
                setIsMobileNavOpen((prev) => !prev);
                setOpenMenu(null);
              }}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-categories-panel"
              aria-label="Betting categories"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-700 hover:text-emerald-600 hover:border-emerald-600 transition-colors cursor-pointer text-xs font-extrabold uppercase tracking-wide active:scale-95"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </nav>

        {/* Phones/tablets: all categories, accordion (overlays the page, so the
            bar keeps its single-line height instead of wrapping into 6 rows) */}
        {isMobileNavOpen && (
          <div
            ref={mobilePanelRef}
            id="mobile-categories-panel"
            className="lg:hidden absolute left-0 right-0 top-full z-50 bg-white border-t border-neutral-200 shadow-2xl max-h-[70vh] overflow-y-auto"
          >
            {mobileNavSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = openMenu === section.key;

              return (
                <div key={section.key} className="border-b border-neutral-100 last:border-b-0">
                  <button
                    id={`mobile-cat-${section.key}`}
                    onClick={() => toggleMenu(section.key)}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center gap-2 px-3 py-3 text-left text-[13px] font-extrabold uppercase tracking-wide text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <Icon
                      className="w-4 h-4 shrink-0 text-slate-400"
                      style={section.iconColor ? { color: section.iconColor } : undefined}
                    />
                    <span className={isExpanded ? 'text-emerald-600' : ''}>{section.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-auto text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pb-2">
                      {section.groups.map((group) => (
                        <div key={group.title || section.key}>
                          {group.title && (
                            <div className="px-3 pt-1.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 select-none">
                              {group.title}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-0.5 px-2">
                            {group.items.map((item) => (
                              <button
                                key={item.label}
                                onClick={() => {
                                  item.onSelect();
                                  setIsMobileNavOpen(false);
                                }}
                                className="text-left px-2 py-2 rounded text-[12.5px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-black active:bg-neutral-200 transition-colors cursor-pointer"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
          onClick={handleLogoClick}
          className="absolute left-[15px] sm:left-[13px] lg:left-[11px] top-[42px] sm:top-[46px] lg:top-[50px] -translate-y-1/2 w-[86px] h-[86px] sm:w-[98px] sm:h-[98px] lg:w-[110px] lg:h-[110px] overflow-hidden flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95"
          style={{
            borderRadius: '192px',
            marginLeft: '-12px',
            marginRight: '7px',
            marginTop: '-3px',
            marginBottom: '-7px',
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
            <path d="M 88.66 0 A 52 52 0 0 1 109.85 46 L 9999 46 L 9999 0 Z" />
          </clipPath>
          <clipPath id="fender-cutout-sm" clipPathUnits="userSpaceOnUse">
            <path d="M 97.33 0 A 58 58 0 0 1 120 46 L 9999 46 L 9999 0 Z" />
          </clipPath>
          <clipPath id="fender-cutout-lg" clipPathUnits="userSpaceOnUse">
            <path d="M 107.53 0 A 65 65 0 0 1 130.93 47 L 9999 47 L 9999 0 Z" />
          </clipPath>
        </defs>
      </svg>
    </header>
  );
};
