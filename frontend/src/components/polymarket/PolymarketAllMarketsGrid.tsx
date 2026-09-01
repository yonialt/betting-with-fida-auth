import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Gift,
  HelpCircle,
  Swords,
  Coins,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Server,
  Radio,
} from 'lucide-react';
import {
  POLYMARKET_ALL_MARKETS,
  POLYMARKET_TAG_PILLS,
} from '../../data/polymarketData';
import {
  PolymarketMarket,
  PolymarketOutcome,
  PolymarketTradeState,
} from '../../types/polymarket';
import { fetchPolymarketGammaEvents } from '../../services/polymarketGammaService';
import { SpringBootModal } from './SpringBootModal';

interface PolymarketAllMarketsGridProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  searchFilter: string;
}

export const PolymarketAllMarketsGrid: React.FC<PolymarketAllMarketsGridProps> = ({
  onSelectOutcome,
  searchFilter,
}) => {
  const [activeTag, setActiveTag] = useState<string>('All');
  const [bookmarkedMarkets, setBookmarkedMarkets] = useState<Set<string>>(new Set());
  const [markets, setMarkets] = useState<PolymarketMarket[]>(POLYMARKET_ALL_MARKETS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [isSpringBootModalOpen, setIsSpringBootModalOpen] = useState<boolean>(false);

  // Fetch live events from Polymarket Gamma API
  const loadGammaMarkets = async () => {
    setIsLoading(true);
    try {
      const liveData = await fetchPolymarketGammaEvents({
        limit: 28,
        tag: activeTag === 'All' ? undefined : activeTag,
      });
      if (liveData && liveData.length > 0) {
        setMarkets(liveData);
        setIsLiveConnected(true);
      }
    } catch (err) {
      console.warn('Could not fetch Gamma events:', err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGammaMarkets();
  }, [activeTag]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedMarkets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter markets by search and tag
  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      !searchFilter ||
      market.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      market.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      market.outcomes.some((o) =>
        o.name.toLowerCase().includes(searchFilter.toLowerCase())
      );

    if (!matchesSearch) return false;
    return true;
  });

  const renderMarketCard = (market: PolymarketMarket) => {
    const isBookmarked = bookmarkedMarkets.has(market.id);

    // 1. BTC 5m UP / DOWN specialized card
    if (market.displayType === 'up_down_btc') {
      return (
        <div
          key={market.id}
          className="bg-[#121824] border border-[#1e293b] hover:border-[#2d3d57] hover:shadow-xl rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group"
        >
          {/* Top Info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                  ₿
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  {market.title}
                </h3>
              </div>

              {/* Circular Gauge */}
              <div className="w-9 h-9 rounded-full border-2 border-blue-500 bg-blue-950/60 flex flex-col items-center justify-center text-[10px] font-bold text-blue-400 shrink-0">
                <span>51%</span>
                <span className="text-[8px] -mt-1 font-mono">Up</span>
              </div>
            </div>

            {/* Split Green Up / Red Down buttons */}
            <div className="grid grid-cols-2 gap-2 my-2">
              <button
                onClick={() =>
                  onSelectOutcome({
                    market,
                    outcome: market.outcomes[0],
                    side: 'yes',
                    price: 51,
                  })
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl p-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <span className="text-[11px] font-mono text-emerald-100">+ $5</span>
                <span className="text-[11px] font-mono text-emerald-100">+ $99</span>
                <span className="text-xs font-black uppercase mt-1">Up</span>
              </button>

              <button
                onClick={() =>
                  onSelectOutcome({
                    market,
                    outcome: market.outcomes[1],
                    side: 'no',
                    price: 49,
                  })
                }
                className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl p-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <span className="text-[11px] font-mono text-rose-100">+ $2</span>
                <span className="text-[11px] font-mono text-rose-100">+ $3</span>
                <span className="text-xs font-black uppercase mt-1">Down</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>LIVE Bitcoin</span>
            </div>

            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      );
    }

    // 2. Esports Versus Match Card (Gen.G vs KT Rolster)
    if (market.displayType === 'versus_match') {
      return (
        <div
          key={market.id}
          className="bg-[#121824] border border-[#1e293b] hover:border-[#2d3d57] hover:shadow-xl rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1a2334] flex items-center justify-center text-neutral-300">
                <Swords className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                {market.title}
              </h3>
            </div>

            {/* Team Outcomes */}
            <div className="flex flex-col gap-2 my-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                    G
                  </span>
                  <span className="font-semibold text-neutral-200">Gen.G</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">83%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] border border-rose-500/30">
                    K
                  </span>
                  <span className="font-semibold text-neutral-200">KT Rolster</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">18%</span>
              </div>

              {/* Team Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() =>
                    onSelectOutcome({
                      market,
                      outcome: market.outcomes[0],
                      side: 'team1',
                      price: 83,
                    })
                  }
                  className="py-1.5 bg-[#1a2334] hover:bg-[#253248] text-white rounded-lg text-xs font-bold transition-all border border-[#2e3b52] active:scale-95 cursor-pointer"
                >
                  Gen.G
                </button>
                <button
                  onClick={() =>
                    onSelectOutcome({
                      market,
                      outcome: market.outcomes[1],
                      side: 'team2',
                      price: 18,
                    })
                  }
                  className="py-1.5 bg-[#1a2334] hover:bg-[#253248] text-white rounded-lg text-xs font-bold transition-all border border-[#2e3b52] active:scale-95 cursor-pointer"
                >
                  KT Rolster
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-neutral-400">
              {market.volume} · {market.timeInfo}
            </span>
            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      );
    }

    // 3. Binary Yes/No Button Card (e.g. Lindsay Clancy)
    if (market.displayType === 'binary_buttons') {
      return (
        <div
          key={market.id}
          className="bg-[#121824] border border-[#1e293b] hover:border-[#2d3d57] hover:shadow-xl rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={market.avatarUrl}
                  alt="avatar"
                  className="w-8 h-8 rounded-lg object-cover border border-[#2e3b52]"
                />
                <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {market.title}
                </h3>
              </div>

              {/* Gauge */}
              <div className="w-9 h-9 rounded-full border-2 border-blue-500 bg-blue-950/60 flex flex-col items-center justify-center text-[10px] font-bold text-blue-400 shrink-0">
                <span>30%</span>
                <span className="text-[7px] -mt-1 text-neutral-400">chance</span>
              </div>
            </div>

            {/* Big Yes / No Buttons */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <button
                onClick={() =>
                  onSelectOutcome({
                    market,
                    outcome: market.outcomes[0],
                    side: 'yes',
                    price: 30,
                  })
                }
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md text-center"
              >
                Yes
              </button>
              <button
                onClick={() =>
                  onSelectOutcome({
                    market,
                    outcome: market.outcomes[1],
                    side: 'no',
                    price: 70,
                  })
                }
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md text-center"
              >
                No
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono">{market.volume}</span>
            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      );
    }

    // 4. Standard Multi-Outcome Card (Fed Decision, US Open, Ceasefire, Trump, etc.)
    return (
      <div
        key={market.id}
        className="bg-[#121824] border border-[#1e293b] hover:border-[#2d3d57] hover:shadow-xl rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group"
      >
        <div>
          {/* Header */}
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#1a2334] flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2">
              {market.title}
            </h3>
          </div>

          {/* Outcomes List with Yes/No Mini Buttons */}
          <div className="flex flex-col gap-2 my-2">
            {market.outcomes.map((outcome) => (
              <div
                key={outcome.name}
                className="flex items-center justify-between text-xs py-1"
              >
                <span className="text-neutral-300 font-medium truncate max-w-[120px] sm:max-w-[140px]">
                  {outcome.name}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-white text-xs mr-1">
                    {outcome.probability}%
                  </span>

                  <button
                    onClick={() =>
                      onSelectOutcome({
                        market,
                        outcome,
                        side: 'yes',
                        price: outcome.yesPrice || outcome.probability,
                      })
                    }
                    className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded font-bold text-[11px] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Yes
                  </button>

                  <button
                    onClick={() =>
                      onSelectOutcome({
                        market,
                        outcome,
                        side: 'no',
                        price: outcome.noPrice || 100 - outcome.probability,
                      })
                    }
                    className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded font-bold text-[11px] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono">{market.volume}</span>
          <div className="flex items-center gap-2">
            <button
              title="Reward pool"
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-white">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            All markets
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gamma API Connected</span>
          </div>
        </div>

        {/* Action Controls & Spring Boot trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSpringBootModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2334] hover:bg-[#253248] text-white border border-[#2e3b52] rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="View Spring Boot Java Backend Implementation"
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spring Boot Backend</span>
          </button>

          <button
            onClick={loadGammaMarkets}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-neutral-300 hover:text-white bg-[#121824] hover:bg-[#1a2334] border border-[#1e293b] rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Live Polymarket Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* In-frame Tag Pills */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-4">
        {POLYMARKET_TAG_PILLS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0084ff] text-white shadow-md font-bold'
                  : 'bg-[#121824] text-neutral-300 hover:text-white hover:bg-[#1a2334] border border-[#1e293b]'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* 4x4 Cards Responsive Grid */}
      {isLoading ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-neutral-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mb-3" />
          <p className="text-sm font-semibold text-neutral-300">Syncing live markets from Polymarket Gamma API...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredMarkets.map(renderMarketCard)}
        </div>
      )}

      {/* Spring Boot Java Backend Architecture Modal */}
      <SpringBootModal
        isOpen={isSpringBootModalOpen}
        onClose={() => setIsSpringBootModalOpen(false)}
      />
    </div>
  );
};
