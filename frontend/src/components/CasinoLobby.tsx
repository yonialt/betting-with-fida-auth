import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Star,
  Play,
  Wallet,
  Plus,
  Users,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

/**
 * ሃገራዊ CASINO — full-screen games lobby overlay.
 * Opened from the sportsbook top navigation (CASINO / LIVE CASINO).
 * Styled to match the site theme: navy (#1b2838 / #0d1723) shell with
 * gold (#ffc600) and emerald accents. Game tiles are ሃገራዊ-branded
 * originals; launching a game shows a themed notice (lobby preview).
 */

interface CasinoGame {
  id: string;
  name: string;
  provider: string;
  category: string; // slots | crash | roulette | blackjack | jackpots | baccarat | gameshows
  badge?: 'HOT' | 'NEW' | 'JACKPOT' | 'LIVE';
  players: number;
}

const CATEGORY_STYLE: Record<string, { gradient: string; emoji: string; blurb: string }> = {
  slots: {
    gradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    emoji: '🎰',
    blurb: 'Spin dazzling reels loaded with wilds, free spins and ሃገራዊ multipliers.',
  },
  crash: {
    gradient: 'from-orange-500 via-red-500 to-rose-700',
    emoji: '🚀',
    blurb: 'Ride the multiplier as it climbs — cash out before it busts.',
  },
  roulette: {
    gradient: 'from-emerald-600 via-green-700 to-teal-800',
    emoji: '🎡',
    blurb: 'Place your chips and let the wheel decide. Classic European rules.',
  },
  blackjack: {
    gradient: 'from-slate-700 via-slate-800 to-neutral-900',
    emoji: '🃏',
    blurb: 'Beat the dealer to 21 — smooth, fast and endlessly re-playable.',
  },
  jackpots: {
    gradient: 'from-amber-400 via-yellow-500 to-orange-600',
    emoji: '💰',
    blurb: 'Chase pooled jackpots that grow with every single bet placed.',
  },
  baccarat: {
    gradient: 'from-rose-600 via-red-700 to-rose-900',
    emoji: '🎴',
    blurb: 'Bet Player, Banker or Tie in the game of pure elegance.',
  },
  gameshows: {
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    emoji: '📺',
    blurb: 'Live hosts, giant wheels and bonus rounds — entertainment meets big wins.',
  },
};

const CASINO_GAMES: CasinoGame[] = [
  { id: 'golden-habesha', name: 'Golden Habesha', provider: 'ሃገራዊ Originals', category: 'slots', badge: 'HOT', players: 1240 },
  { id: 'addis-neon', name: 'Addis Neon', provider: 'ሃገራዊ Originals', category: 'slots', badge: 'HOT', players: 1520 },
  { id: 'shebas-fortune', name: "Sheba's Fortune", provider: 'Habesha Gaming', category: 'slots', players: 860 },
  { id: 'lalibela-riches', name: 'Lalibela Riches', provider: 'Addis Studios', category: 'slots', badge: 'NEW', players: 640 },
  { id: 'nile-gold', name: 'Nile Gold', provider: 'Habesha Gaming', category: 'slots', players: 980 },
  { id: 'coffee-ceremony', name: 'Coffee Ceremony', provider: 'ሃገራዊ Originals', category: 'slots', players: 410 },
  { id: 'simien-wilds', name: 'Simien Wilds', provider: 'Addis Studios', category: 'slots', players: 305 },
  { id: 'blue-nile-treasures', name: 'Blue Nile Treasures', provider: 'Habesha Gaming', category: 'slots', badge: 'NEW', players: 220 },
  { id: 'timket-treasure', name: 'Timket Treasure', provider: 'Habesha Gaming', category: 'slots', players: 190 },
  { id: 'comet-crash', name: 'Comet Crash', provider: 'ሃገራዊ Originals', category: 'crash', badge: 'HOT', players: 2100 },
  { id: 'rocket-rush', name: 'Rocket Rush', provider: 'Addis Studios', category: 'crash', players: 1330 },
  { id: 'addis-roulette', name: 'Addis Roulette', provider: 'ሃገራዊ Originals', category: 'roulette', players: 540 },
  { id: 'lucky7-roulette', name: 'Lucky 7 Roulette', provider: 'Habesha Gaming', category: 'roulette', players: 300 },
  { id: 'habesha-blackjack', name: 'Habesha Blackjack', provider: 'ሃገራዊ Originals', category: 'blackjack', players: 470 },
  { id: 'golden-21', name: 'Golden 21', provider: 'Addis Studios', category: 'blackjack', players: 260 },
  { id: 'mega-habesha-jackpot', name: 'Mega Habesha Jackpot', provider: 'ሃገራዊ Originals', category: 'jackpots', badge: 'JACKPOT', players: 3120 },
  { id: 'sheba-millions', name: 'Sheba Millions', provider: 'Habesha Gaming', category: 'jackpots', badge: 'JACKPOT', players: 2040 },
  { id: 'meskel-fortune', name: 'Meskel Fortune Wheel', provider: 'Addis Studios', category: 'jackpots', badge: 'JACKPOT', players: 760 },
];

const LIVE_GAMES: CasinoGame[] = [
  { id: 'live-addis-roulette', name: 'Live Addis Roulette', provider: 'ሃገራዊ Live', category: 'roulette', badge: 'LIVE', players: 830 },
  { id: 'vip-habesha-roulette', name: 'VIP Habesha Roulette', provider: 'ሃገራዊ Live', category: 'roulette', badge: 'LIVE', players: 210 },
  { id: 'live-habesha-blackjack', name: 'Live Habesha Blackjack', provider: 'ሃገራዊ Live', category: 'blackjack', badge: 'LIVE', players: 640 },
  { id: 'golden-21-live', name: 'Golden 21 Live', provider: 'Addis Live', category: 'blackjack', badge: 'LIVE', players: 380 },
  { id: 'sheba-baccarat', name: 'Sheba Baccarat', provider: 'ሃገራዊ Live', category: 'baccarat', badge: 'LIVE', players: 450 },
  { id: 'speed-baccarat', name: 'Speed Baccarat', provider: 'Addis Live', category: 'baccarat', badge: 'LIVE', players: 290 },
  { id: 'habesha-mega-wheel', name: 'Habesha Mega Wheel', provider: 'ሃገራዊ Live', category: 'gameshows', badge: 'LIVE', players: 1720 },
  { id: 'wheel-of-sheba', name: 'Wheel of Sheba', provider: 'ሃገራዊ Live', category: 'gameshows', badge: 'LIVE', players: 1100 },
  { id: 'dream-numbers', name: 'Dream Numbers', provider: 'Addis Live', category: 'gameshows', badge: 'LIVE', players: 910 },
];

const CASINO_CATS = [
  { id: 'all', label: 'All Games', emoji: '🎮' },
  { id: 'slots', label: 'Slots', emoji: '🎰' },
  { id: 'crash', label: 'Crash', emoji: '🚀' },
  { id: 'roulette', label: 'Roulette', emoji: '🎡' },
  { id: 'blackjack', label: 'Blackjack', emoji: '🃏' },
  { id: 'jackpots', label: 'Jackpots', emoji: '💰' },
];

const LIVE_CATS = [
  { id: 'all', label: 'All Tables', emoji: '🕹️' },
  { id: 'roulette', label: 'Roulette', emoji: '🎡' },
  { id: 'blackjack', label: 'Blackjack', emoji: '🃏' },
  { id: 'baccarat', label: 'Baccarat', emoji: '🎴' },
  { id: 'gameshows', label: 'Game Shows', emoji: '📺' },
];

const styleFor = (category: string) =>
  CATEGORY_STYLE[category] || { gradient: 'from-slate-600 to-slate-800', emoji: '🎲', blurb: '' };

const badgeClass = (b?: string) => {
  switch (b) {
    case 'HOT':
      return 'bg-red-500 text-white';
    case 'NEW':
      return 'bg-emerald-500 text-white';
    case 'JACKPOT':
      return 'bg-[#ffc600] text-black';
    case 'LIVE':
      return 'bg-red-600 text-white';
    default:
      return 'bg-white/20 text-white';
  }
};

export const CasinoLobby: React.FC = () => {
  const {
    casinoView,
    setCasinoView,
    casinoCategory,
    user,
    setDepositModalOpen,
    openAuthModal,
    setNotification,
  } = useBetting();

  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedGame, setSelectedGame] = useState<CasinoGame | null>(null);

  const isLive = casinoView === 'live-casino';

  // Seed the category from the header dropdown each time the lobby (re)opens or the tab changes
  useEffect(() => {
    if (casinoView !== 'none') {
      setCategory(casinoCategory || 'all');
      setSelectedGame(null);
    }
  }, [casinoView, casinoCategory]);

  // Lock the background from scrolling while the lobby is open
  useEffect(() => {
    if (casinoView === 'none') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [casinoView]);

  if (casinoView === 'none') return null;

  const games = isLive ? LIVE_GAMES : CASINO_GAMES;
  const cats = isLive ? LIVE_CATS : CASINO_CATS;

  const visibleGames = games.filter((g) => {
    if (category !== 'all' && g.category !== category) return false;
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      if (!`${g.name} ${g.provider}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const close = () => setCasinoView('none');

  const handlePlay = (g: CasinoGame) => {
    if (!user.isLoggedIn) {
      setNotification({ message: `Log in to play ${g.name}`, type: 'warning' });
      openAuthModal('login');
      return;
    }
    setNotification({
      message: `🎰 ${g.name} is warming up — full launch coming soon on ሃገራዊ Casino!`,
      type: 'info',
    });
    setSelectedGame(null);
  };

  const notifyMe = (g: CasinoGame) => {
    setNotification({ message: `🔔 We'll ping you the moment ${g.name} goes live!`, type: 'success' });
    setSelectedGame(null);
  };

  const tabPill = (active: boolean) =>
    `flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
      active ? 'bg-[#ffc600] text-black shadow' : 'text-neutral-300 hover:text-white'
    }`;

  const chipClass = (active: boolean) =>
    `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
      active
        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
        : 'bg-[#131e2b] border-white/10 text-neutral-300 hover:border-white/25 hover:text-white'
    }`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a1119] flex flex-col animate-in fade-in duration-150 text-white select-none">
      {/* ===== Top Bar (navy, matches site header) ===== */}
      <div className="shrink-0 bg-[#1b2838] border-b border-black/40 px-3 sm:px-5 py-2.5 flex items-center gap-2 sm:gap-3">
        {/* Brand → click returns to the sportsbook */}
        <button
          onClick={close}
          title="Back to sportsbook"
          className="flex items-center gap-2 shrink-0 cursor-pointer group"
        >
          <img
            src="/hagerawi-logo.png"
            alt="ሃገራዊ"
            className="w-9 h-9 rounded-full object-contain shrink-0 group-active:scale-95 transition-transform"
          />
          <div className="hidden sm:flex flex-col leading-none text-left">
            <span className="text-white font-black text-sm tracking-tight">
              ሃገራዊ <span className="text-[#ffc600]">CASINO</span>
            </span>
            <span className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">
              {isLive ? 'Live Dealer Tables' : 'Games Lobby'}
            </span>
          </div>
        </button>

        {/* Casino / Live Casino tabs */}
        <div className="flex items-center gap-1 bg-[#0d1723] rounded-full p-1 ml-1 sm:ml-2 shrink-0">
          <button onClick={() => setCasinoView('casino')} className={tabPill(!isLive)}>
            <span>🎰</span>
            <span className="hidden xs:inline sm:inline">Casino</span>
          </button>
          <button onClick={() => setCasinoView('live-casino')} className={tabPill(isLive)}>
            <span>📺</span>
            <span className="hidden xs:inline sm:inline">Live Casino</span>
          </button>
        </div>

        {/* Desktop search */}
        <div className="relative flex-1 max-w-xs hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games"
            className="w-full bg-[#0d1723] border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Wallet / login + close */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {user.isLoggedIn ? (
            <div className="hidden sm:flex items-center rounded-full bg-[#0d1723] border border-neutral-700/70 p-0.5">
              <div className="flex items-center gap-1.5 pl-2.5 pr-2 py-0.5">
                <Wallet className="w-3 h-3 text-emerald-400" />
                <span className="font-mono font-extrabold text-[12px] text-white">
                  {user.balance.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">{user.currency}</span>
              </div>
              <button
                onClick={() => setDepositModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-[10.5px] font-extrabold rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span className="hidden md:inline">DEPOSIT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 bg-[#ffc600] hover:bg-[#f0ba00] text-black text-[11px] font-black rounded uppercase tracking-wide transition-all cursor-pointer"
            >
              Log in
            </button>
          )}
          <button
            onClick={close}
            title="Close casino"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== Scrollable Body ===== */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero strip */}
        <div
          className={`relative overflow-hidden bg-gradient-to-r ${
            isLive
              ? 'from-[#0b1d3a] via-[#12325c] to-[#1e3a8a]'
              : 'from-[#1b0b2e] via-[#3b1466] to-[#6d28d9]'
          }`}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 30%, rgba(255,198,0,0.5) 0%, transparent 55%)',
            }}
          />
          <div className="relative px-4 sm:px-6 py-5 sm:py-7 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-black bg-[#ffc600] px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  {isLive ? 'Live 24/7' : 'From just 2 Birr'}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                {isLive ? 'ሃገራዊ Live Casino' : 'ሃገራዊ Casino'}
              </h1>
              <p className="text-neutral-200 text-xs sm:text-sm font-medium mt-1 max-w-lg">
                {isLive
                  ? 'Real dealers, real tables, streamed live — roulette, blackjack, baccarat & game shows.'
                  : 'Hundreds of slots, crash games and jackpots. Play any game from only 2 Birr.'}
              </p>
            </div>
            <div className="hidden sm:block text-6xl md:text-7xl drop-shadow-lg shrink-0">
              {isLive ? '📺' : '🎰'}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-3 pt-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games"
              className="w-full bg-[#131e2b] border border-white/10 rounded-full pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="px-3 sm:px-5 pt-4 pb-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {cats.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={chipClass(category === c.id)}>
              <span>{c.emoji}</span>
              <span className="whitespace-nowrap">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Section title */}
        <div className="px-3 sm:px-5 pt-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
            {cats.find((c) => c.id === category)?.emoji}{' '}
            {cats.find((c) => c.id === category)?.label || 'Games'}
          </h2>
          <span className="text-[11px] font-bold text-neutral-400">{visibleGames.length} games</span>
        </div>

        {/* Game grid */}
        {visibleGames.length === 0 ? (
          <div className="px-5 py-16 text-center text-neutral-400 text-sm font-semibold">
            No games match your search.
          </div>
        ) : (
          <div className="px-3 sm:px-5 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {visibleGames.map((g) => {
              const st = styleFor(g.category);
              const fav = favorites.has(g.id);
              return (
                <div
                  key={g.id}
                  className="group relative rounded-xl overflow-hidden border border-white/5 bg-[#131e2b] shadow-lg hover:border-white/20 transition-all"
                >
                  <div
                    className={`relative aspect-[3/4] bg-gradient-to-br ${st.gradient} flex items-center justify-center overflow-hidden`}
                  >
                    <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                      {st.emoji}
                    </span>

                    {/* Faint game-name watermark */}
                    <span className="absolute bottom-8 left-0 right-0 text-center text-[10px] font-black uppercase tracking-widest text-white/25 px-1 truncate">
                      {g.name}
                    </span>

                    {/* Badge */}
                    {g.badge && (
                      <span
                        className={`absolute top-2 left-2 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${badgeClass(
                          g.badge
                        )}`}
                      >
                        {g.badge === 'LIVE' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                        {g.badge}
                      </span>
                    )}

                    {/* Favorite star */}
                    <button
                      onClick={() => toggleFav(g.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
                      title={fav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          fav ? 'text-[#ffc600] fill-[#ffc600]' : 'text-white/80'
                        }`}
                      />
                    </button>

                    {/* Players online */}
                    <div className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[9px] font-bold text-white/90">
                      <Users className="w-2.5 h-2.5" />
                      {g.players.toLocaleString()}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={() => handlePlay(g)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffc600] hover:bg-[#f0ba00] text-black text-xs font-black uppercase tracking-wide shadow-lg active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        Play
                      </button>
                      <button
                        onClick={() => setSelectedGame(g)}
                        className="text-[11px] text-white/85 hover:text-white underline font-semibold cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-2">
                    <div className="text-[12px] font-bold text-white truncate">{g.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{g.provider}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Responsible-gaming footer */}
        <div className="px-5 py-6 text-center">
          <p className="text-[11px] text-neutral-500 max-w-xl mx-auto leading-relaxed">
            18+ · Play responsibly. ሃገራዊ Casino is a preview lobby — games shown are ሃገራዊ originals
            launching soon. Gambling can be addictive.
          </p>
        </div>
      </div>

      {/* ===== Game Detail Modal ===== */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedGame(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#131e2b] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div
              className={`relative h-40 bg-gradient-to-br ${
                styleFor(selectedGame.category).gradient
              } flex items-center justify-center`}
            >
              <span className="text-7xl drop-shadow-lg">{styleFor(selectedGame.category).emoji}</span>
              {selectedGame.badge && (
                <span
                  className={`absolute top-3 left-3 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${badgeClass(
                    selectedGame.badge
                  )}`}
                >
                  {selectedGame.badge === 'LIVE' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  {selectedGame.badge}
                </span>
              )}
              <button
                onClick={() => setSelectedGame(null)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-black text-white leading-tight">{selectedGame.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-semibold">
                <span>{selectedGame.provider}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedGame.players.toLocaleString()} playing
                </span>
              </div>
              <p className="text-neutral-300 text-xs mt-3 leading-relaxed">
                {styleFor(selectedGame.category).blurb}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => handlePlay(selectedGame)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#ffc600] hover:bg-[#f0ba00] text-black text-xs font-black uppercase tracking-wide transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  Play now
                </button>
                <button
                  onClick={() => notifyMe(selectedGame)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Notify me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
