import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Gift,
  Repeat2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
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
import { useBetting } from '../../context/BettingContext';
import {
  t,
  translateMarketTitle,
  translateOutcomeName,
  formatBirrVolume,
} from '../../data/polymarketTranslations';

interface PolymarketAllMarketsGridProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  searchFilter: string;
  categoryFilter?: string;
  onOpenDetail?: (market: PolymarketMarket) => void;
}

export const PolymarketAllMarketsGrid: React.FC<PolymarketAllMarketsGridProps> = ({
  onSelectOutcome,
  searchFilter,
  categoryFilter,
  onOpenDetail,
}) => {
  const { language } = useBetting();
  const [activeTag, setActiveTag] = useState<string>('All');
  const [bookmarkedMarkets, setBookmarkedMarkets] = useState<Set<string>>(new Set());
  const [markets, setMarkets] = useState<PolymarketMarket[]>(POLYMARKET_ALL_MARKETS);
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [internalSearch, setInternalSearch] = useState<string>('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);
  const tagsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch live events from Polymarket Gamma API and append after our primary photo markets
  useEffect(() => {
    let isMounted = true;
    const loadLive = async () => {
      try {
        const liveData = await fetchPolymarketGammaEvents({
          limit: 20,
          tag: activeTag === 'All' ? undefined : activeTag,
        });
        if (liveData && liveData.length > 0 && isMounted) {
          const primaryIds = new Set(POLYMARKET_ALL_MARKETS.map((m) => m.id));
          const filteredLive = liveData.filter((m) => !primaryIds.has(m.id));
          setMarkets([...POLYMARKET_ALL_MARKETS, ...filteredLive]);
        }
      } catch (err) {
        console.warn('Could not fetch Gamma events:', err);
      }
    };
    loadLive();
    return () => {
      isMounted = false;
    };
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

  const scrollTagsRight = () => {
    if (tagsScrollRef.current) {
      tagsScrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  // Filter markets by search, tag, categoryFilter, and bookmark toggle
  const combinedSearch = (searchFilter || internalSearch).trim().toLowerCase();

  const filteredMarkets = markets.filter((market) => {
    if (showBookmarkedOnly && !bookmarkedMarkets.has(market.id)) {
      return false;
    }

    if (combinedSearch) {
      const matchesSearch =
        market.title.toLowerCase().includes(combinedSearch) ||
        market.category.toLowerCase().includes(combinedSearch) ||
        (market.subcategory && market.subcategory.toLowerCase().includes(combinedSearch)) ||
        market.outcomes.some((o) => o.name.toLowerCase().includes(combinedSearch));
      if (!matchesSearch) return false;
    }

    if (activeTag !== 'All') {
      const tagLower = activeTag.toLowerCase().replace('🇪🇹', '').trim();
      const matchTag =
        market.category.toLowerCase().includes(tagLower) ||
        (market.subcategory && market.subcategory.toLowerCase().includes(tagLower)) ||
        market.title.toLowerCase().includes(tagLower) ||
        (tagLower === 'ethiopia' && (market.countryFlag === '🇪🇹' || market.subcategory === 'Ethiopia'));
      if (!matchTag) return false;
    }

    if (categoryFilter && categoryFilter !== 'trending' && categoryFilter !== 'all') {
      const cat = categoryFilter.toLowerCase();
      const matchCat =
        market.category.toLowerCase() === cat ||
        market.category.toLowerCase().includes(cat) ||
        (market.subcategory && market.subcategory.toLowerCase().includes(cat)) ||
        (cat === 'ethiopia' && (market.countryFlag === '🇪🇹' || market.subcategory === 'Ethiopia')) ||
        market.title.toLowerCase().includes(cat);
      if (!matchCat) return false;
    }

    return true;
  });

  // Render team or league emblem icon
  const renderEmblem = (logoType?: string, flag?: string) => {
    if (flag) {
      return (
        <span className="text-base leading-none shrink-0 select-none">
          {flag}
        </span>
      );
    }
    if (logoType === 'spirit') {
      return (
        <div className="w-5 h-5 rounded-full bg-[#121620] border border-[#293244] flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C7.5 2 4 5 4 8.5c0 3 2.5 4.5 4.5 5.5-2 1-3.5 2.5-3.5 5 0 2.8 4 3 7 3s7-0.2 7-3c0-2.5-1.5-4-3.5-5 2-1 4.5-2.5 4.5-5.5C20 5 16.5 2 12 2z" />
          </svg>
        </div>
      );
    }
    if (logoType === 'mouz') {
      return (
        <div className="w-5 h-5 rounded-full bg-[#e11d48] flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      );
    }
    if (logoType === 'g2') {
      return (
        <div className="w-5 h-5 rounded-full bg-[#161820] border border-[#2d3342] flex items-center justify-center shrink-0">
          <svg className="w-3.2 h-3.2 text-neutral-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 3.5c1.93 0 3.5 1.57 3.5 3.5 0 2.2-2.5 4-3.5 5.5-1-1.5-3.5-3.3-3.5-5.5 0-1.93 1.57-3.5 3.5-3.5z" />
          </svg>
        </div>
      );
    }
    if (logoType === 'karmine') {
      return (
        <div className="w-5 h-5 rounded-full bg-[#0d162a] border border-[#1d2d52] flex items-center justify-center shrink-0">
          <span className="font-black text-[8.5px] text-[#38bdf8] tracking-tighter leading-none">KC</span>
        </div>
      );
    }
    if (logoType === 'brewers') {
      return (
        <div className="w-5 h-5 rounded-full bg-[#0a2351] border border-[#ffc52f]/40 flex items-center justify-center shrink-0">
          <span className="font-black text-[10px] text-[#ffc52f] leading-none">M</span>
        </div>
      );
    }
    if (logoType === 'reds') {
      return (
        <div className="w-5 h-5 rounded-full bg-[#c6011f] flex items-center justify-center shrink-0">
          <span className="font-serif font-black text-[10.5px] text-white leading-none">C</span>
        </div>
      );
    }
    if (logoType === 'tigers') {
      return (
        <div className="w-5 h-5 rounded-sm bg-[#0c2340] flex items-center justify-center shrink-0">
          <span className="font-serif font-black text-[10px] text-white leading-none">D</span>
        </div>
      );
    }
    if (logoType === 'guardians') {
      return (
        <div className="w-5 h-5 rounded-sm bg-[#e31937] flex items-center justify-center shrink-0">
          <span className="font-black text-[10.5px] text-white leading-none">C</span>
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-[#1e2738] flex items-center justify-center text-neutral-400 shrink-0 text-xs">
        •
      </div>
    );
  };

  // Button theme classes for Match / Versus cards
  const getMatchButtonClasses = (theme?: string) => {
    switch (theme) {
      case 'red':
        return 'bg-[#36151c] hover:bg-[#481c25] text-[#f87171] border border-[#4b1d26]';
      case 'blue':
        return 'bg-[#13233c] hover:bg-[#1a2e4e] text-[#38bdf8] border border-[#1e3454]';
      case 'olive':
        return 'bg-[#2a2914] hover:bg-[#38371a] text-[#facc15] border border-[#3e3c1d]';
      case 'slate':
      default:
        return 'bg-[#222936] hover:bg-[#2c3445] text-white border border-[#2e3748]';
    }
  };

  const renderMarketCard = (market: PolymarketMarket) => {
    const isBookmarked = bookmarkedMarkets.has(market.id);

    // 1. BTC 5m UP / DOWN Card (Card 2 in Photo)
    if (market.displayType === 'up_down_btc') {
      return (
        <div
          key={market.id}
          onClick={() => onOpenDetail?.(market)}
          className="bg-[#101622] border border-[#1a2333] hover:border-[#28374d] rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group cursor-pointer"
        >
          <div>
            {/* Top row with ₿ Icon, Title & Circular Gauge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f7931a] flex items-center justify-center font-black text-white text-base shadow-xs shrink-0">
                  ₿
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  {translateMarketTitle(market.title, language)}
                </h3>
              </div>

              {/* Donut Circular Gauge */}
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-[#1a2538]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#3b82f6]"
                    strokeDasharray="50, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center leading-none text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-white leading-none">50%</span>
                  <span className="text-[7.5px] font-medium text-neutral-400 leading-none mt-0.5">
                    {language === 'am' ? 'ከፍ' : 'Up'}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Dark Green Up / Dark Red Down buttons side-by-side */}
            <div className="grid grid-cols-2 gap-2.5 my-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOutcome({
                    market,
                    outcome: market.outcomes[0],
                    side: 'up',
                    price: 50,
                  });
                }}
                className="bg-[#122b20] hover:bg-[#18392a] text-[#4ade80] border border-[#1c3e2e] rounded-xl py-2.5 text-sm font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-98"
              >
                {language === 'am' ? 'ከፍ' : 'Up'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOutcome({
                    market,
                    outcome: market.outcomes[1],
                    side: 'down',
                    price: 50,
                  });
                }}
                className="bg-[#2d1419] hover:bg-[#3d1921] text-[#f87171] border border-[#451c24] rounded-xl py-2.5 text-sm font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-98"
              >
                {language === 'am' ? 'ዝቅ' : 'Down'}
              </button>
            </div>
          </div>

          {/* Footer: LIVE · Bitcoin + Bookmark */}
          <div className="mt-3 pt-2.5 border-t border-[#1b2536] flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 font-medium text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>LIVE · Bitcoin</span>
            </div>

            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Bookmark market"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      );
    }

    // 2. Versus Match Card (CS2 Spirit vs MOUZ, LoL G2 vs Karmine, MLB Brewers vs Reds, Tigers vs Guardians, Tennis Kostyuk vs Noskova)
    if (market.displayType === 'match_versus' || market.displayType === 'versus_match') {
      const out1 = market.outcomes[0];
      const out2 = market.outcomes[1];

      return (
        <div
          key={market.id}
          onClick={() => onOpenDetail?.(market)}
          className="bg-[#101622] border border-[#1a2333] hover:border-[#28374d] rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group cursor-pointer"
        >
          <div>
            {/* Two Teams / Competitors Rows */}
            <div className="flex flex-col gap-2.5 mb-3.5">
              {/* Competitor 1 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {renderEmblem(out1?.logoType, out1?.countryFlag)}
                  {out1?.badge && (
                    <span className="font-mono text-neutral-300 font-bold text-xs shrink-0">
                      {out1.badge}
                    </span>
                  )}
                  <span className="font-semibold text-white truncate text-xs">
                    {out1?.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-white text-sm shrink-0 ml-2">
                  {out1?.probability}%
                </span>
              </div>

              {/* Competitor 2 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {renderEmblem(out2?.logoType, out2?.countryFlag)}
                  {out2?.badge && (
                    <span className="font-mono text-neutral-300 font-bold text-xs shrink-0">
                      {out2.badge}
                    </span>
                  )}
                  <span className="font-semibold text-white truncate text-xs">
                    {out2?.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-white text-sm shrink-0 ml-2">
                  {out2?.probability}%
                </span>
              </div>
            </div>

            {/* Team/Player Action Buttons side by side with custom themes */}
            <div className="grid grid-cols-2 gap-2.5 my-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOutcome({
                    market,
                    outcome: out1,
                    side: 'team1',
                    price: out1?.yesPrice || out1?.probability,
                  });
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all truncate px-2 cursor-pointer shadow-xs active:scale-98 ${getMatchButtonClasses(
                  out1?.buttonTheme
                )}`}
              >
                {out1?.shortName || out1?.name}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOutcome({
                    market,
                    outcome: out2,
                    side: 'team2',
                    price: out2?.yesPrice || out2?.probability,
                  });
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all truncate px-2 cursor-pointer shadow-xs active:scale-98 ${getMatchButtonClasses(
                  out2?.buttonTheme
                )}`}
              >
                {out2?.shortName || out2?.name}
              </button>
            </div>
          </div>

          {/* Match Footer: Live status dot + volume + category + bookmark */}
          <div className="mt-3 pt-2.5 border-t border-[#1b2536] flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 font-medium truncate">
              {market.matchStatus && (
                <span className="text-red-500 font-bold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                  {market.matchStatus}
                </span>
              )}
              <span className="text-neutral-400 truncate">
                {formatBirrVolume(market.volume, language)}
              </span>
            </div>

            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
              title="Bookmark market"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      );
    }

    // 3. Multi-Outcome standard card (Fed Decision, US Open Winner, etc.)
    return (
      <div
        key={market.id}
        onClick={() => onOpenDetail?.(market)}
        className="bg-[#101622] border border-[#1a2333] hover:border-[#28374d] rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group cursor-pointer"
      >
        <div>
          {/* Header with Avatar / Logo & Title */}
          <div className="flex items-start gap-2.5 mb-3">
            {market.logoType === 'us_open' ? (
              <div className="w-8 h-8 rounded-md bg-white p-0.5 flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-[7.5px] font-black text-[#0f2d59] leading-none tracking-tight">us open</span>
                <div className="w-3.5 h-0.5 bg-[#f59e0b] rounded-full mt-0.5"></div>
              </div>
            ) : market.imageUrl ? (
              <img
                src={market.imageUrl}
                alt={market.title}
                className="w-8 h-8 rounded-md object-cover shrink-0 border border-[#222c3e]"
              />
            ) : market.countryFlag ? (
              <span className="text-2xl leading-none shrink-0">{market.countryFlag}</span>
            ) : (
              <div className="w-8 h-8 rounded-md bg-[#162030] flex items-center justify-center text-neutral-300 shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
            )}

            <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
              {translateMarketTitle(market.title, language)}
            </h3>
          </div>

          {/* Outcomes list with probability + separate Yes/No buttons */}
          <div className="flex flex-col gap-2 my-2">
            {market.outcomes.slice(0, 2).map((outcome) => (
              <div
                key={outcome.name}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <span className="text-neutral-200 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                  {translateOutcomeName(outcome.name, language)}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-white text-xs mr-1">
                    {outcome.probability}%
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOutcome({
                        market,
                        outcome,
                        side: 'yes',
                        price: outcome.yesPrice || outcome.probability,
                      });
                    }}
                    className="px-2.5 py-1 bg-[#132c21] hover:bg-[#193a2c] text-[#22c55e] border border-[#1b3e2e] rounded-md text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {language === 'am' ? 'አዎ' : 'Yes'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOutcome({
                        market,
                        outcome,
                        side: 'no',
                        price: outcome.noPrice || 100 - outcome.probability,
                      });
                    }}
                    className="px-2.5 py-1 bg-[#2f151a] hover:bg-[#3e1b22] text-[#ef4444] border border-[#441d24] rounded-md text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {language === 'am' ? 'አይ' : 'No'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Volume, optional loop/gift icons, and Bookmark */}
        <div className="mt-3 pt-2.5 border-t border-[#1b2536] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-mono">
            <span>{formatBirrVolume(market.volume, language)}</span>
            {market.hasRepeat && (
              <Repeat2 className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-300 transition-colors" />
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {market.hasGift && (
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Rewards available"
              >
                <Gift className="w-4 h-4 text-neutral-400 hover:text-white" />
              </button>
            )}

            <button
              onClick={(e) => toggleBookmark(market.id, e)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Bookmark market"
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
      {/* 1. Top Carousel Dots & Sub-navigation Row (From Photo) */}
      <div className="flex items-center justify-between gap-3 mb-5">
        {/* Left: Carousel Progress Indicator: 1 active pill + 7 dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-1.5 bg-neutral-200 rounded-full" />
          <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
          <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
          <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
          <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
          <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
          <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
        </div>

        {/* Right: < Sports, Clarity Act >, Explore all */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTag('CFB')}
            className="px-3.5 py-1.5 rounded-full bg-[#141a26] hover:bg-[#1d2636] border border-[#222b3b] text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
            <span>{language === 'am' ? 'ስፖርት' : 'Sports'}</span>
          </button>
          <button
            onClick={() => setActiveTag('Trump')}
            className="px-3.5 py-1.5 rounded-full bg-[#141a26] hover:bg-[#1d2636] border border-[#222b3b] text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Clarity Act</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          <button
            onClick={() => {
              setActiveTag('All');
              setShowBookmarkedOnly(false);
              setInternalSearch('');
            }}
            className="px-5 py-1.5 rounded-full bg-[#151a24] hover:bg-[#1e2533] border border-[#263143] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            {language === 'am' ? 'ሁሉንም አስስ' : 'Explore all'}
          </button>
        </div>
      </div>

      {/* 2. All markets Header Row (From Photo) */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {t('all_markets', language, 'All markets')}
        </h2>

        {/* Right Action Icons from Photo: Search, Filter, Bookmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`p-1.5 transition-colors cursor-pointer ${
              showSearchInput ? 'text-blue-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Search markets"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (activeTag === 'All') {
                setActiveTag('Trump');
              } else {
                setActiveTag('All');
              }
            }}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`p-1.5 transition-colors cursor-pointer ${
              showBookmarkedOnly ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Show bookmarks only"
          >
            <Bookmark className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Optional In-line Search Bar when search icon clicked */}
      {showSearchInput && (
        <div className="mb-3">
          <input
            type="text"
            placeholder={t('search_placeholder', language, 'Search all markets...')}
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full bg-[#121824] border border-[#222c3e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      )}

      {/* 3. Horizontal Tags Carousel (From Photo) */}
      <div className="flex items-center gap-1.5 mb-5">
        <div
          ref={tagsScrollRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex-1"
        >
          {POLYMARKET_TAG_PILLS.map((tag) => {
            const isActive = activeTag === tag;
            const displayLabel = tag === 'All' && language === 'am' ? 'ሁሉም' : tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0070f3] text-white font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141a26] font-medium'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
        <button
          onClick={scrollTagsRight}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer"
          title="Scroll tags"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. 4-Column Responsive Grid with the 8 exact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredMarkets.map(renderMarketCard)}
      </div>
    </div>
  );
};
