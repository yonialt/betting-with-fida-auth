import React from 'react';
import {
  Search,
  Info,
  Menu,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { useBetting } from '../../context/BettingContext';

interface PolymarketHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeViewTab: 'featured' | 'all';
  setActiveViewTab: (tab: 'featured' | 'all') => void;
  onToggleChat?: () => void;
  chatOpen?: boolean;
}

export const PolymarketHeader: React.FC<PolymarketHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeViewTab,
  setActiveViewTab,
  onToggleChat,
  chatOpen,
}) => {
  const { user, setAppMode, openAuthModal, logout } = useBetting();

  return (
    <header className="w-full bg-[#0d121c] border-b border-[#1e2638] text-white select-none sticky top-0 z-40 shadow-md">
      {/* Top Banner Bar */}
      <div className="bg-[#121824] border-b border-[#1e293b] px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0084ff] text-white font-bold text-[10px] tracking-wide uppercase shadow-xs">
            LIVE PREDICTION MARKET
          </span>
          <span className="hidden sm:inline text-neutral-400 font-medium">
            Decentralized prediction trading with live order books.
          </span>
        </div>
        <button
          onClick={() => setAppMode('1xbet')}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-200 hover:text-white bg-[#1a2334] hover:bg-[#253248] border border-[#2e3b52] px-3 py-1 rounded transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
          <span>Switch to 1xBET Sports</span>
        </button>
      </div>

      {/* Main Polymarket Navigation */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & View Switcher */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer transition-transform active:scale-95"
            onClick={() => setActiveViewTab('featured')}
          >
            {/* Square Polymarket Icon Badge */}
            <div className="w-8 h-8 rounded-lg bg-[#0084ff] flex items-center justify-center shadow-md shadow-blue-900/40">
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Polymarket
            </span>
          </div>

          {/* Quick View Modes */}
          <div className="hidden lg:flex items-center bg-[#141b27] p-0.5 rounded-lg border border-[#243044]">
            <button
              onClick={() => setActiveViewTab('featured')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'featured'
                  ? 'bg-[#222d3e] text-white shadow-xs font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Featured Highlights
            </button>
            <button
              onClick={() => setActiveViewTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeViewTab === 'all'
                  ? 'bg-[#222d3e] text-white shadow-xs font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Live Markets
            </button>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prediction markets (e.g. Fed, BTC, Trump, LoL)..."
              className="w-full bg-[#121824] hover:bg-[#161f2f] focus:bg-[#1a2334] border border-[#243044] focus:border-[#0084ff] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#1a2334] text-neutral-400 border border-[#2e3b52] rounded px-1.5 py-0.5 text-[10px] font-mono pointer-events-none">
              /
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Trollbox / Chat Toggle Button */}
          <button
            id="btn-polymarket-header-chat"
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              chatOpen
                ? 'bg-[#0084ff] text-white shadow-md'
                : 'bg-[#18202e] hover:bg-[#222d40] text-blue-400 border border-[#2a374d]'
            }`}
            title="Open Polymarket Live Chat & Trollbox"
          >
            <span className="text-xs">💬</span>
            <span className="hidden sm:inline">Live Chat</span>
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black">
              2.8k
            </span>
          </button>

          <button className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-1">
            <Info className="w-4 h-4 text-neutral-500" />
            <span>How it works</span>
          </button>

          {user.isLoggedIn ? (
            <>
              {/* Logged-in user chip (shared account) */}
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#121824] border border-[#243044]">
                <div className="w-6 h-6 rounded-full bg-[#0084ff] text-white flex items-center justify-center text-[10px] font-black uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="text-xs font-bold text-neutral-100">{user.username}</span>
              </div>
              <button
                id="btn-polymarket-logout"
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-[#1a2334] transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="btn-polymarket-login"
                onClick={() => openAuthModal('login')}
                className="text-xs font-bold text-neutral-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-[#1a2334] transition-colors cursor-pointer"
              >
                Log in
              </button>

              <button
                id="btn-polymarket-signup"
                onClick={() => openAuthModal('signup')}
                className="text-xs font-bold bg-[#0084ff] hover:bg-[#0070db] text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-900/30 active:scale-95 cursor-pointer"
              >
                Sign up
              </button>
            </>
          )}

          <button className="p-2 text-neutral-400 hover:text-white hover:bg-[#1a2334] rounded-lg transition-colors cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
