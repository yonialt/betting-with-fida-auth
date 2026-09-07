import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  LogOut,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Shield,
  HelpCircle,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { useBetting } from '../../context/BettingContext';
import { HowItWorksModal } from './HowItWorksModal';
import { PolymarketAuthModal } from './PolymarketAuthModal';
import { LanguageToggle } from '../LanguageToggle';
import { t, translateMarketTitle } from '../../data/polymarketTranslations';
import {
  POLYMARKET_SEARCH_AUTOCOMPLETE,
  ETHIOPIA_PM_MARKET,
  BTC_5M_MARKET,
  POLYMARKET_HERO,
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
}

export const PolymarketHeader: React.FC<PolymarketHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeViewTab,
  setActiveViewTab,
  onToggleChat,
  chatOpen,
  onOpenMarketDetail,
}) => {
  const { user, setAppMode, logout, language } = useBetting();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [searchTab, setSearchTab] = useState<'markets' | 'profiles'>('markets');
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
    if (itemId === 'pm-hero-fed-decision') {
      onOpenMarketDetail?.(POLYMARKET_HERO);
      return;
    }

    const found = POLYMARKET_ALL_MARKETS.find((m) => m.id === itemId);
    if (found) {
      onOpenMarketDetail?.(found);
    } else {
      // Filter by title
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
      <header
        id="polymarket-main-header"
        className="w-full bg-[#090d14] border-b border-[#181f2c] text-white select-none sticky top-0 z-40"
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Polymarket Logo & Search */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            {/* Logo Mark + Text */}
            <div
              onClick={() => {
                setActiveViewTab('featured');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 cursor-pointer shrink-0 transition-opacity hover:opacity-90"
              title="Polymarket Home"
            >
              {/* Exact Polymarket Isometric Wireframe Polyhedron Logo */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 shrink-0"
              >
                {/* Outer perimeter hexagon */}
                <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                {/* Vertical spine */}
                <path d="M12 2.5V21.5" />
                {/* Diagonals forming triangular facets */}
                <path d="M2.5 8L21.5 16" />
                <path d="M2.5 16L21.5 8" />
              </svg>

              <span className="font-bold text-[19px] tracking-[-0.025em] text-white select-none">
                Polymarket
              </span>
            </div>

            {/* Search Input Bar (matching screenshot layout & placeholder) */}
            <div ref={searchContainerRef} className="flex-1 max-w-[540px] relative hidden sm:block">
              <Search className="w-4 h-4 text-[#52637a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="polymarket-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', language, 'Search polymarkets...')}
                className="w-full h-[38px] bg-[#111622] hover:bg-[#141a28] focus:bg-[#161f30] border border-[#1e2738] focus:border-[#2b3a52] rounded-lg pl-10 pr-4 text-[13.5px] text-white placeholder-[#52637a] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-white rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {searchFocused && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#0e141f] border border-[#1e293b] rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
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
          </div>

          {/* Right: Actions (LanguageToggle, How it works, Log in, Sign up, Menu) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Toggle Button */}
            <LanguageToggle />

            {/* How it works Button */}
            <button
              id="btn-polymarket-how-it-works"
              onClick={() => setHowItWorksOpen(true)}
              className="flex items-center gap-1.5 text-[13.5px] font-semibold text-white hover:text-neutral-200 transition-colors cursor-pointer px-2 py-1.5 rounded-md hover:bg-[#141b27]"
              title="How Polymarket Works"
            >
              {/* Circle 'i' glyph matching screenshot */}
              <span className="w-4 h-4 rounded-full border border-[#52637a] flex items-center justify-center text-[10.5px] font-serif italic text-[#94a3b8] leading-none shrink-0">
                i
              </span>
              <span className="hidden md:inline">{t('how_it_works', language, 'How it works')}</span>
            </button>

            {/* Auth Buttons */}
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* User chip */}
                <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-lg bg-[#111722] border border-[#1f293a]">
                  <div className="w-6 h-6 rounded-md bg-[#0066ff] text-white flex items-center justify-center text-[11px] font-bold uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <span className="text-[13px] font-semibold text-neutral-200 max-w-[90px] truncate">
                    {user.username}
                  </span>
                </div>

                <button
                  id="btn-polymarket-header-logout"
                  onClick={logout}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-[#161e2c] rounded-lg transition-colors cursor-pointer"
                  title={t('logout', language, 'Log out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Log in Button */}
                <button
                  id="btn-polymarket-login"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-[36px] px-3.5 sm:px-4 rounded-lg bg-transparent hover:bg-[#161e2c] border border-[#263346] text-white text-[13.5px] font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  {t('login', language, 'Log in')}
                </button>

                {/* Sign up Button */}
                <button
                  id="btn-polymarket-signup"
                  onClick={() => setAuthModalOpen(true)}
                  className="h-[36px] px-4 sm:px-4.5 rounded-lg bg-[#0066ff] hover:bg-[#1a75ff] text-white text-[13.5px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-98"
                >
                  {t('signup', language, 'Sign up')}
                </button>
              </div>
            )}

            {/* Two-Bar Hamburger Menu Icon matching screenshot */}
            <button
              id="btn-polymarket-hamburger"
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] text-white hover:text-neutral-300 rounded-lg hover:bg-[#161e2c] transition-colors cursor-pointer shrink-0 ml-0.5"
              title="Open Navigation Menu"
            >
              <span className="w-[18px] h-[2px] bg-white rounded-full transition-all"></span>
              <span className="w-[18px] h-[2px] bg-white rounded-full transition-all"></span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Visible only on very small screens) */}
        <div className="px-4 pb-2.5 sm:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-[#52637a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', language, 'Search polymarkets...')}
              className="w-full h-[36px] bg-[#111722] border border-[#1e2738] rounded-lg pl-9 pr-4 text-xs text-white placeholder-[#52637a] focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Hamburger Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div
            className="relative w-full max-w-[340px] bg-[#0c111a] border-l border-[#1c2638] h-full shadow-2xl flex flex-col justify-between text-white p-5 animate-slideLeft z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2638] mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                    <path d="M12 2.5V21.5" />
                    <path d="M2.5 8L21.5 16" />
                    <path d="M2.5 16L21.5 8" />
                  </svg>
                  <span className="font-bold text-base text-white">Polymarket Menu</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#161e2c] hover:bg-[#202b3d] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Switch to ሃገራዊ Sportsbook Banner */}
              <div className="mb-4">
                <button
                  id="drawer-switch-to-1xbet"
                  onClick={() => {
                    setDrawerOpen(false);
                    setAppMode('1xbet');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#143457] to-[#10253d] border border-[#1b4d82] text-white hover:brightness-110 transition-all cursor-pointer shadow-md group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="px-1.5 py-1 rounded-lg bg-[#0070e0] flex items-center justify-center font-black text-[11px] text-white shadow-xs">
                      ሃገራዊ
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                        Switch to ሃገራዊ Sports
                      </div>
                      <div className="text-[10px] text-[#93c5fd]">
                        Live Match Tracker & Odds
                      </div>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#93c5fd] rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                {/* Mobile Drawer Language Selector */}
                <div className="p-2.5 mb-2 rounded-xl bg-[#111722] border border-[#1e2738] flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    {language === 'am' ? 'ቋንቋ ይምረጡ' : 'Language'}
                  </span>
                  <LanguageToggle />
                </div>

                <button
                  onClick={() => {
                    setActiveViewTab('featured');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeViewTab === 'featured'
                      ? 'bg-[#182232] text-white font-bold'
                      : 'text-[#8e9eb3] hover:text-white hover:bg-[#131a26]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                  <span>{language === 'am' ? 'ተለይተው የቀረቡ ገበያዎች' : 'Featured Highlights'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveViewTab('all');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeViewTab === 'all'
                      ? 'bg-[#182232] text-white font-bold'
                      : 'text-[#8e9eb3] hover:text-white hover:bg-[#131a26]'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                    🌐
                  </div>
                  <span>{t('all_prediction_markets', language, 'All Live Prediction Markets')}</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setHowItWorksOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#8e9eb3] hover:text-white hover:bg-[#131a26] transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t('how_it_works', language, 'How Polymarket Works')}</span>
                </button>

                {onToggleChat && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onToggleChat();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-[#8e9eb3] hover:text-white hover:bg-[#131a26] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>{language === 'am' ? 'የቀጥታ ውይይት' : 'Live Chat & Trollbox'}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                      Online
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-4 border-t border-[#1c2638] space-y-3">
              {user.isLoggedIn ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#111722] border border-[#1c2638] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#6b7c93]">{language === 'am' ? 'የተጠቃሚ ስም' : 'Signed in as'}</div>
                      <div className="text-xs font-bold text-white">{user.username}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#6b7c93]">{language === 'am' ? 'ቀሪ ሂሳብ' : 'Balance'}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {user.balance.toLocaleString()} {user.currency}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#18202e] hover:bg-rose-950/40 text-neutral-300 hover:text-rose-400 border border-[#243044] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('logout', language, 'Log Out')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 rounded-lg bg-[#141b27] hover:bg-[#1c2638] border border-[#243248] text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    {t('login', language, 'Log In')}
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 rounded-lg bg-[#0066ff] hover:bg-[#1a75ff] text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
                  >
                    {t('signup', language, 'Sign Up')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How It Works Explainer Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        onOpenSignUp={() => setAuthModalOpen(true)}
      />

      {/* Polymarket Auth Modal */}
      <PolymarketAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};
