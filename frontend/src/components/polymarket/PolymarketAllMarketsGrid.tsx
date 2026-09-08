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
import { PolymarketBtcUpDownCard } from './PolymarketBtcUpDownCard';
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

  // Render team or league emblem icon with official logos
  const renderEmblem = (logoType?: string, flag?: string, logoUrl?: string) => {
    if (flag) {
      return (
        <span className="text-base leading-none shrink-0 select-none" title="Country Flag">
          {flag}
        </span>
      );
    }
    // Use official logo URL if provided
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt="Team Logo"
          className="w-6 h-6 rounded object-contain shrink-0 border border-[#222c3e]"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      );
    }
    if (logoType === 'spirit') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Team_Spirit_new_em.svg"
          alt="Team Spirit"
          className="w-6 h-6 rounded object-contain bg-[#121620] border border-[#293244] shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#121620] border border-[#293244] flex items-center justify-center shrink-0"><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.5 2 4 5 4 8.5c0 3 2.5 4.5 4.5 5.5-2 1-3.5 2.5-3.5 5 0 2.8 4 3 7 3s7-0.2 7-3c0-2.5-1.5-4-3.5-5 2-1 4.5-2.5 4.5-5.5C20 5 16.5 2 12 2z"/></svg></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'mouz') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Mouz_logo.svg"
          alt="MOUZ"
          className="w-6 h-6 rounded object-contain bg-[#e11d48] border border-[#c41a3d] shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#e11d48] flex items-center justify-center shrink-0"><span class="text-white font-bold text-xs">MOUZ</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'g2') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/G2_Esports_logo.svg"
          alt="G2 Esports"
          className="w-6 h-6 rounded object-contain bg-[#161820] border border-[#2d3342] shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#161820] border border-[#2d3342] flex items-center justify-center shrink-0"><span class="text-[#38bdf8] font-black text-xs tracking-tighter">G2</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'karmine') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Karmine_Corp_logo.svg"
          alt="Karmine Corp"
          className="w-6 h-6 rounded object-contain bg-[#0d162a] border border-[#1d2d52] shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#0d162a] border border-[#1d2d52] flex items-center justify-center shrink-0"><span class="text-[#38bdf8] font-black text-[8.5px] tracking-tighter leading-none">KC</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'brewers') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Milwaukee_Brewers_Baseball_Club_wordmark.svg"
          alt="Milwaukee Brewers"
          className="w-6 h-6 rounded object-contain bg-[#0a2351] border border-[#ffc52f]/40 shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#0a2351] border border-[#ffc52f]/40 flex items-center justify-center shrink-0"><span class="text-[#ffc52f] font-black text-[10px] leading-none">BREWERS</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'reds') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Cincinnati_Reds_logo.svg"
          alt="Cincinnati Reds"
          className="w-6 h-6 rounded object-contain bg-[#c6011f] shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#c6011f] flex items-center justify-center shrink-0"><span class="text-white font-serif font-black text-[10.5px] leading-none">REDS</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'tigers') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Detroit_Tigers_logo.svg"
          alt="Detroit Tigers"
          className="w-6 h-6 rounded-sm object-contain bg-[#0c2340] border border-[#ffc52f]/30 shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-sm bg-[#0c2340] flex items-center justify-center shrink-0"><span class="text-white font-serif font-black text-[10px] leading-none">TIGERS</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'guardians') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Cleveland_Guardians_logo.svg"
          alt="Cleveland Guardians"
          className="w-6 h-6 rounded-sm object-contain bg-[#e31937] shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-sm bg-[#e31937] flex items-center justify-center shrink-0"><span class="text-white font-black text-[10.5px] leading-none">GUARDIANS</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'cbe-sa') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/CBE_SA_logo.png"
          alt="CBE SA"
          className="w-6 h-6 rounded-full object-contain bg-[#0066cc] border border-[#3399ff]/40 shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#0066cc] border border-[#3399ff]/40 flex items-center justify-center shrink-0"><span class="text-white font-black text-[7px] leading-none">CBE SA</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'saint-george') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Saint_George_SC_logo.svg"
          alt="Saint George SC"
          className="w-6 h-6 rounded-full object-contain bg-[#ffd700] border border-[#b8960f]/40 shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#ffd700] border border-[#b8960f]/40 flex items-center justify-center shrink-0"><span class="text-[#8b0000] font-black text-[8px] leading-none">ST GEORGE</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'fasil-kenema') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Fasil_Kenema_logo.svg"
          alt="Fasil Kenema"
          className="w-6 h-6 rounded-full object-contain bg-[#1a5276] border border-[#2e86c1]/40 shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#1a5276] border border-[#2e86c1]/40 flex items-center justify-center shrink-0"><span class="text-white font-black text-[8px] leading-none">FK</span></div>';
            }
          }}
        />
      );
    }
    if (logoType === 'defense-force') {
      return (
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Defense_Force_SC_logo.svg"
          alt="Defense Force SC"
          className="w-6 h-6 rounded-full object-contain bg-[#2d5016] border border-[#4a7c28]/40 shrink-0"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-[#2d5016] border border-[#4a7c28]/40 flex items-center justify-center shrink-0"><span class="text-white font-black text-[7px] leading-none">DF</span></div>';
            }
          }}
        />
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

    // 1. BTC 5m UP / DOWN Card (live price + countdown + multiplier odds)
    if (market.displayType === 'up_down_btc') {
      return (
        <PolymarketBtcUpDownCard
          key={market.id}
          market={market}
          onSelectOutcome={onSelectOutcome}
          onOpenDetail={onOpenDetail}
        />
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
                  {renderEmblem(out1?.logoType, out1?.countryFlag, out1?.logoUrl)}
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
                  {renderEmblem(out2?.logoType, out2?.countryFlag, out2?.logoUrl)}
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
        <div>            {/* Header with Avatar / Logo & Title */}
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
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {market.imageUrl ? (
              <div className="w-8 h-8 rounded-md bg-[#162030] items-center justify-center text-neutral-300 shrink-0 hidden">
                <HelpCircle className="w-4 h-4" />
              </div>
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
                <div className="flex items-center gap-2 min-w-0">
                  {outcome.avatar ? (
                    <img
                      src={outcome.avatar}
                      alt={outcome.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#222c3e]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : outcome.logoUrl ? (
                    <img
                      src={outcome.logoUrl}
                      alt={outcome.name}
                      className="w-6 h-6 rounded object-cover shrink-0 border border-[#222c3e]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : outcome.logoType ? (
                    renderEmblem(outcome.logoType, outcome.countryFlag, outcome.logoUrl)
                  ) : outcome.countryFlag ? (
                    <span className="text-lg leading-none shrink-0">{outcome.countryFlag}</span>
                  ) : null}
                  <span className="text-neutral-200 font-medium truncate max-w-[100px] sm:max-w-[120px]">
                    {translateOutcomeName(outcome.name, language)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-white text-xs mr-1">
                    {outcome.probability}%
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold text-neutral-500 bg-[#151d2b] border border-[#222c3e] rounded px-1 py-0.5"
                    title={`${language === 'am' ? 'የብዜት ዕድል' : 'Multiplier odds'}`}
                  >
                    ×{outcome.probability > 0 ? (100 / outcome.probability).toFixed(2) : '1.00'}
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
