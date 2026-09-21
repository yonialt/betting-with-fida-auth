import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronDown,
  LogOut,
  Wallet,
  Plus,
  User,
  Check,
  Settings,
} from 'lucide-react';
import { useBetting } from '../../context/BettingContext';
import { HowItWorksModal } from './HowItWorksModal';
import { PolymarketMoreMenu } from './PolymarketMoreMenu';
import {
  PolymarketSectionPopout,
  PolymarketSection,
} from './PolymarketSectionPopout';
import { t, translateMarketTitle } from '../../data/polymarketTranslations';
import {
  POLYMARKET_SEARCH_AUTOCOMPLETE,
  BTC_5M_MARKET,
  ETHIOPIA_PM_MARKET,
  POLYMARKET_ALL_MARKETS,
} from '../../data/polymarketData';
import { PolymarketMarket } from '../../types/polymarket';

interface PolymarketHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeViewTab: 'featured' | 'all';
  setActiveViewTab: (tab: 'featured' | 'all') => void;
  onToggleChat?: () => void;
  chatOpen?: boolean;
  onOpenMarketDetail?: (market: PolymarketMarket) => void;
  children?: React.ReactNode;
}

export const PolymarketHeader: React.FC<PolymarketHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeViewTab,
  setActiveViewTab,
  onToggleChat: _onToggleChat,
  chatOpen: _chatOpen,
  onOpenMarketDetail,
  children,
}) => {
  const {
    user,
    setAppMode,
    logout,
    language,
    setDepositModalOpen,
    openAuthModal,
    polymarketDarkMode,
    togglePolymarketDarkMode,
  } = useBetting();
  const isLight = !polymarketDarkMode;

  const [howItWorksOpen, setHowItWorksOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  // Section popout: each gear-menu entry opens its own content panel.
  const [activeSection, setActiveSection] = useState<PolymarketSection | null>(null);
  // Mobile: the search bar is collapsed to just a magnifier icon until tapped
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [searchTab, setSearchTab] = useState<'markets' | 'profiles'>('markets');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);

  // Focus the input when the mobile search icon expands into the full bar
  useEffect(() => {
    if (mobileSearchOpen) searchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchItem = (itemId: string, itemTitle: string) => {
    setSearchFocused(false);
    setSearchQuery('');

    if (itemId === 'pm-ethiopia-pm') {
      onOpenMarketDetail?.(ETHIOPIA_PM_MARKET);
      return;
    }
    if (itemId === 'pm-btc-5m') {
      onOpenMarketDetail?.(BTC_5M_MARKET);
      return;
    }
    const found = POLYMARKET_ALL_MARKETS.find((m) => m.id === itemId);
    if (found) {
      onOpenMarketDetail?.(found);
    } else {
      setSearchQuery(itemTitle);
      setActiveViewTab('all');
    }
  };

  const filteredSearchItems = POLYMARKET_SEARCH_AUTOCOMPLETE.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* Top Dark Navy Blue Navbar of Sportbetting with Polymarket Search + Second Navbar + Fender Arch Logo */}
      <header
        id="polymarket-main-header"
        className="relative w-full bg-white border-b select-none sticky top-0 z-40 shadow-xs"
        style={{
          backgroundColor: '#1b2838',
          borderColor: '#1b2838',
        }}
      >
        <div
          className="top-navbar-cutout w-full bg-[#1b2838] text-white pl-[100px] sm:pl-[120px] lg:pl-[138px] pr-3 sm:pr-4 h-[46px] flex items-center justify-between gap-2 sm:gap-3 border-b border-neutral-800"
          style={{
            marginLeft: '-2px',
            borderRadius: '0px',
            backgroundColor: '#1b2838',
            height: '46px',
            width: '100%',
            borderWidth: '1px',
          }}
        >
          {/* Middle: Search — icon-only on mobile (tap to expand), full bar on sm+ */}
          <div
            ref={searchContainerRef}
            className={`relative flex items-center min-w-0 mx-1 sm:mx-3 ${
              mobileSearchOpen ? 'flex-1 max-w-[540px]' : 'shrink-0 sm:flex-1 sm:max-w-[540px]'
            }`}
          >
            {/* Mobile: collapsed — just the magnifying glass icon */}
            {!mobileSearchOpen && (
              <button
                id="btn-mobile-search-open"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Search polymarkets"
                aria-expanded={mobileSearchOpen}
                className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-[#111c29] border border-[#25394f] text-[#72859e] hover:text-white hover:border-blue-500 transition-colors cursor-pointer active:scale-95 shrink-0"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* The search bar: hidden on mobile until the icon is tapped; always visible on sm+ */}
            <div className={`min-w-0 relative ${mobileSearchOpen ? 'block flex-1' : 'hidden sm:block sm:flex-1'}`}>
              <Search className="w-4 h-4 text-[#72859e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="polymarket-search-input"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', language, 'Search polymarkets...')}
                className="w-full h-[32px] sm:h-[34px] bg-[#111c29] hover:bg-[#142335] focus:bg-[#16273c] border border-[#25394f] focus:border-blue-500 rounded-lg pl-9 pr-8 text-xs sm:text-[13px] text-white placeholder-[#72859e] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile: collapse the search back to the icon */}
            {mobileSearchOpen && (
              <button
                id="btn-mobile-search-close"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery('');
                  setSearchFocused(false);
                }}
                aria-label="Close search"
                className="sm:hidden shrink-0 w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {searchFocused && (
              <div className={`absolute left-0 right-0 top-full mt-1.5 ${isLight ? 'pm-body bg-white' : 'bg-[#0e1622]'} border ${isLight ? 'border-neutral-200' : 'border-[#22354c]'} rounded-xl shadow-2xl z-50 overflow-hidden text-xs`}>
                {/* Tabs: Markets | Profiles */}
                <div className="flex items-center border-b border-[#1b2536] bg-[#0b1018] px-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSearchTab('markets')}
                    className={`pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                      searchTab === 'markets'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t('markets_tab', language, 'Markets')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab('profiles')}
                    className={`pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                      searchTab === 'profiles'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t('profiles_tab', language, 'Profiles')}
                  </button>
                </div>

                {/* List of Suggestions */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#17202f]">
                  {searchTab === 'markets' ? (
                    filteredSearchItems.length > 0 ? (
                      filteredSearchItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSearchItem(item.id, item.title)}
                          className="p-3 hover:bg-[#162132] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.flag ? (
                              <span className="text-xl leading-none shrink-0">{item.flag}</span>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-[#182335] text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                P
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate text-xs">
                                {translateMarketTitle(item.title, language)}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.date && (
                              <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
                                {item.date}
                              </span>
                            )}
                            {item.change && (
                              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                                {item.change}
                              </span>
                            )}
                            {item.prob !== undefined && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-xs border border-blue-500/20">
                                {item.prob}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-400 text-xs">
                        {t('no_matching_markets', language, 'No matching polymarkets found')}
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-center text-neutral-400 text-xs">
                      No user profiles found
                    </div>
                  )}
                </div>

                {/* See all results footer */}
                <div
                  onClick={() => {
                    setSearchFocused(false);
                    setActiveViewTab('all');
                  }}
                  className="p-2.5 bg-[#0b1018] border-t border-[#1b2536] text-center text-blue-400 hover:text-blue-300 font-semibold cursor-pointer text-xs"
                >
                  {t('see_all_results', language, 'See all results for')} "{searchQuery || 'markets'}" →
                </div>
              </div>
            )}
          </div>

          {/* Right: Sportbetting Top Navbar Account Utilities & Controls */}
          <div className={`flex items-center gap-2 sm:gap-2.5 shrink-0 ${mobileSearchOpen ? 'max-sm:hidden' : ''}`}>
            {user.isLoggedIn ? (
              <>
                {/* Connected Wallet & Balance Capsule */}
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

                  {/* Quick Deposit Button */}
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

                {/* User Profile Capsule */}
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

                {/* Log out button */}
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
                  className="px-3 sm:px-3.5 py-1 text-white text-[11px] font-black rounded uppercase tracking-wider transition-all cursor-pointer border border-neutral-600 hover:bg-neutral-800"
                >
                  LOG IN
                </button>
                <button
                  id="btn-signup"
                  onClick={() => openAuthModal('signup')}
                  className="px-3 sm:px-3.5 py-1 bg-[#ffc600] hover:bg-[#f0ba00] text-black text-[11px] font-black rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  SIGN UP
                </button>
              </>
            )}

            {/* How it works — desktop only (opens the explainer popout).
                Hidden on mobile to keep the navbar uncluttered. */}
            <button
              id="btn-polymarket-how-it-works"
              onClick={() => setHowItWorksOpen(true)}
              className="flex items-center gap-1.5 text-[11.5px] font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer px-1.5 py-1 lg:px-2 rounded-md hover:bg-white/5"
              title="How Polymarket Works"
            >
              <span className="w-3.5 h-3.5 rounded-full border border-neutral-500 flex items-center justify-center text-[9.5px] font-serif italic text-neutral-300 leading-none shrink-0">
                i
              </span>
              <span className="hidden lg:inline">{t('how_it_works', language, 'How it works')}</span>
            </button>

            {/* Settings Gear — opens the More pop-out (Dark mode toggle, Activity,
                Leaderboard, etc.). Visible on all breakpoints including mobile. */}
            <button
              ref={moreBtnRef}
              id="btn-settings"
              onClick={() => setMoreMenuOpen((v) => !v)}
              className="flex p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
              title="More"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* More pop-out — anchored to the gear icon */}
            <PolymarketMoreMenu
              isOpen={moreMenuOpen}
              onClose={() => setMoreMenuOpen(false)}
              isDarkMode={polymarketDarkMode}
              onToggleDarkMode={togglePolymarketDarkMode}
              onSelectOption={(option) => {
                if (
                  option === 'Rewards' ||
                  option === 'APIs' ||
                  option === 'Documentation' ||
                  option === 'Help Center' ||
                  option === 'Terms of Use'
                ) {
                  setActiveSection(option as PolymarketSection);
                }
              }}
              anchorRef={moreBtnRef}
            />
          </div>
        </div>

        {/* ========================================================
            NAVBAR 2 (SECOND NAVBAR): Polymarket Category Carousel
            Shifted right via pl-[118px] sm:pl-[128px] lg:pl-[140px]
            to ensure zero overlap with the circular logo.
           ======================================================== */}
        {children}

        {/* ========================================================
            LARGE WHITE LOGO AREA — spans the full header height on
            the left (same pure white as the sports betting fender logo).
            It holds a single large logo whose center sits exactly on the seam
            (the top navbar's bottom edge) — the "wheel" position the
            fender arch below is carved around.
           ======================================================== */}
        <div
          className="absolute inset-y-0 left-0 w-[88px] sm:w-[97px] lg:w-[107px] bg-white z-[6] flex items-center justify-center cursor-pointer select-none"
          style={{ borderRadius: '66px' }}
          onClick={() => {
            setAppMode('1xbet');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Return to ሃገራዊ Sportsbook"
        >
          <div
            id="brand-logo"
            className="absolute left-[15px] sm:left-[13px] lg:left-[11px] top-[42px] sm:top-[46px] lg:top-[50px] -translate-y-1/2 w-[86px] h-[86px] sm:w-[98px] sm:h-[98px] lg:w-[110px] lg:h-[110px] overflow-hidden flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95"
            style={{
              borderRadius: '192px',
              marginLeft: '-12px',
              marginRight: '7px',
              marginTop: '-3px',
              marginBottom: '-7px',
            }}
          >
            {/* Rasterized badge (square PNG with a transparent background) */}
            <img
              src="/hagerawi-logo.png"
              alt="Hagerawi Logo"
              className="absolute block select-none pointer-events-none"
              style={{ width: '89.7%', maxWidth: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>

        {/* Concentric circular arc clip paths for the fender cutout */}
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


      {/* How It Works Explainer Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        onOpenSignUp={() => openAuthModal('signup')}
      />

      {/* Section popout — each gear-menu entry opens its own content panel */}
      <PolymarketSectionPopout
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />
    </>
  );
};
