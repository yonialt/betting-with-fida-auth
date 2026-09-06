import React, { useState, useMemo } from 'react';
import {
  Lock,
  Check,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { Match, OddsItem } from '../types';

interface SecondaryMarketsDrawerProps {
  match: Match;
  onOpenFullModal?: () => void;
}

export const SecondaryMarketsDrawer: React.FC<SecondaryMarketsDrawerProps> = ({
  match,
  onOpenFullModal,
}) => {
  const { toggleSelection, isOddsSelected } = useBetting();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const isTennis =
    match.sport === 'tennis' ||
    match.league.toLowerCase().includes('tennis') ||
    match.league.toLowerCase().includes('open');

  const isEsports = match.sport === 'esports';
  const isBasketball = match.sport === 'basketball';

  // Base odds values to compute realistic secondary markets dynamically
  const w1Val = match.odds.w1?.value || 2.1;
  const xVal = match.odds.x?.value || 3.2;
  const w2Val = match.odds.w2?.value || 2.8;
  const baseOver = match.odds.totalOver?.value || 1.95;
  const baseUnder = match.odds.totalUnder?.value || 1.85;

  // Generate structured secondary markets based on sport
  const markets = useMemo(() => {
    const list: {
      category: 'totals' | 'halves' | 'handicap' | 'btts' | 'specials';
      title: string;
      items: { label: string; name: string; value: number; subId: string }[];
      columns?: number;
    }[] = [];

    if (isTennis) {
      // TENNIS MARKETS
      list.push({
        category: 'halves',
        title: 'Set 1 Winner',
        items: [
          {
            label: `${match.team1}`,
            name: `${match.team1} to win Set 1`,
            value: +(w1Val * 0.95).toFixed(2),
            subId: 's1-w1',
          },
          {
            label: `${match.team2}`,
            name: `${match.team2} to win Set 1`,
            value: +(w2Val * 0.95).toFixed(2),
            subId: 's1-w2',
          },
        ],
      });

      list.push({
        category: 'halves',
        title: 'Set 2 Winner',
        items: [
          {
            label: `${match.team1}`,
            name: `${match.team1} to win Set 2`,
            value: +(w1Val * 0.98).toFixed(2),
            subId: 's2-w1',
          },
          {
            label: `${match.team2}`,
            name: `${match.team2} to win Set 2`,
            value: +(w2Val * 0.98).toFixed(2),
            subId: 's2-w2',
          },
        ],
      });

      list.push({
        category: 'totals',
        title: 'Total Match Sets',
        items: [
          {
            label: 'Over 2.5 Sets',
            name: 'Over 2.5 Total Sets',
            value: 2.15,
            subId: 'sets-o2.5',
          },
          {
            label: 'Under 2.5 Sets',
            name: 'Under 2.5 Total Sets',
            value: 1.65,
            subId: 'sets-u2.5',
          },
        ],
      });

      list.push({
        category: 'handicap',
        title: 'Game Handicap',
        items: [
          {
            label: `${match.team1} (-2.5)`,
            name: `${match.team1} Game Handicap (-2.5)`,
            value: +(w1Val * 0.88).toFixed(2),
            subId: 'gh-1',
          },
          {
            label: `${match.team2} (+2.5)`,
            name: `${match.team2} Game Handicap (+2.5)`,
            value: +(w2Val * 0.88).toFixed(2),
            subId: 'gh-2',
          },
        ],
      });

      list.push({
        category: 'specials',
        title: 'Tie-break in Match',
        items: [
          {
            label: 'Yes',
            name: 'Tie-break in Match - Yes',
            value: 2.45,
            subId: 'tb-yes',
          },
          {
            label: 'No',
            name: 'Tie-break in Match - No',
            value: 1.5,
            subId: 'tb-no',
          },
        ],
      });
    } else if (isBasketball) {
      // BASKETBALL MARKETS
      list.push({
        category: 'totals',
        title: 'Total Points (Over / Under)',
        items: [
          {
            label: 'Over 218.5',
            name: 'Over 218.5 Total Points',
            value: 1.9,
            subId: 'tot-o218.5',
          },
          {
            label: 'Under 218.5',
            name: 'Under 218.5 Total Points',
            value: 1.9,
            subId: 'tot-u218.5',
          },
        ],
      });

      list.push({
        category: 'handicap',
        title: 'Point Spread',
        items: [
          {
            label: `${match.team1} (-4.5)`,
            name: `${match.team1} Spread (-4.5)`,
            value: 1.92,
            subId: 'spread-1',
          },
          {
            label: `${match.team2} (+4.5)`,
            name: `${match.team2} Spread (+4.5)`,
            value: 1.88,
            subId: 'spread-2',
          },
        ],
      });

      list.push({
        category: 'halves',
        title: '1st Half Winner',
        items: [
          {
            label: `${match.team1}`,
            name: `${match.team1} 1st Half Winner`,
            value: +(w1Val * 0.92).toFixed(2),
            subId: '1h-1',
          },
          {
            label: 'Tie',
            name: '1st Half Tie',
            value: 11.0,
            subId: '1h-x',
          },
          {
            label: `${match.team2}`,
            name: `${match.team2} 1st Half Winner`,
            value: +(w2Val * 0.92).toFixed(2),
            subId: '1h-2',
          },
        ],
        columns: 3,
      });
    } else {
      // FOOTBALL / SOCCER / GENERAL MARKETS
      // 1. Both Teams to Score
      list.push({
        category: 'btts',
        title: 'Both Teams to Score (BTTS)',
        items: [
          {
            label: 'Yes',
            name: 'Both Teams To Score - Yes',
            value: 1.85,
            subId: 'btts-yes',
          },
          {
            label: 'No',
            name: 'Both Teams To Score - No',
            value: 1.95,
            subId: 'btts-no',
          },
        ],
      });

      // 2. Alternative Totals
      list.push({
        category: 'totals',
        title: 'Alternative Total Goals',
        items: [
          {
            label: 'Over 1.5',
            name: 'Total Over 1.5 Goals',
            value: +(baseOver * 0.68).toFixed(2),
            subId: 'o-1.5',
          },
          {
            label: 'Under 1.5',
            name: 'Total Under 1.5 Goals',
            value: +(baseUnder * 1.55).toFixed(2),
            subId: 'u-1.5',
          },
          {
            label: 'Over 2.5',
            name: 'Total Over 2.5 Goals',
            value: baseOver,
            subId: 'o-2.5',
          },
          {
            label: 'Under 2.5',
            name: 'Total Under 2.5 Goals',
            value: baseUnder,
            subId: 'u-2.5',
          },
          {
            label: 'Over 3.5',
            name: 'Total Over 3.5 Goals',
            value: +(baseOver * 1.62).toFixed(2),
            subId: 'o-3.5',
          },
          {
            label: 'Under 3.5',
            name: 'Total Under 3.5 Goals',
            value: +(baseUnder * 0.72).toFixed(2),
            subId: 'u-3.5',
          },
        ],
        columns: 2,
      });

      // 3. Draw No Bet
      list.push({
        category: 'btts',
        title: 'Draw No Bet (DNB)',
        items: [
          {
            label: `${match.team1}`,
            name: `${match.team1} (Draw No Bet)`,
            value: +(w1Val * 0.72).toFixed(2),
            subId: 'dnb-1',
          },
          {
            label: `${match.team2}`,
            name: `${match.team2} (Draw No Bet)`,
            value: +(w2Val * 0.72).toFixed(2),
            subId: 'dnb-2',
          },
        ],
      });

      // 4. Double Chance
      list.push({
        category: 'btts',
        title: 'Double Chance',
        items: [
          {
            label: '1X',
            name: `${match.team1} or Draw`,
            value: match.odds.x1?.value || +(w1Val * 0.55).toFixed(2),
            subId: 'dc-1x',
          },
          {
            label: '12',
            name: `${match.team1} or ${match.team2}`,
            value: match.odds.w12?.value || 1.25,
            subId: 'dc-12',
          },
          {
            label: '2X',
            name: `Draw or ${match.team2}`,
            value: match.odds.x2?.value || +(w2Val * 0.55).toFixed(2),
            subId: 'dc-2x',
          },
        ],
        columns: 3,
      });

      // 5. 1st Half 1X2
      list.push({
        category: 'halves',
        title: '1st Half - 1X2',
        items: [
          {
            label: '1 (1H)',
            name: `${match.team1} 1st Half Winner`,
            value: +(w1Val * 1.15).toFixed(2),
            subId: '1h-1',
          },
          {
            label: 'X (1H)',
            name: '1st Half Draw',
            value: +(xVal * 0.68).toFixed(2),
            subId: '1h-x',
          },
          {
            label: '2 (1H)',
            name: `${match.team2} 1st Half Winner`,
            value: +(w2Val * 1.15).toFixed(2),
            subId: '1h-2',
          },
        ],
        columns: 3,
      });

      // 6. 1st Half Total Goals
      list.push({
        category: 'halves',
        title: '1st Half Goals (Over / Under 0.5)',
        items: [
          {
            label: '1H Over 0.5',
            name: '1st Half Over 0.5 Goals',
            value: 1.45,
            subId: '1h-o0.5',
          },
          {
            label: '1H Under 0.5',
            name: '1st Half Under 0.5 Goals',
            value: 2.65,
            subId: '1h-u0.5',
          },
        ],
      });

      // 7. Asian Handicap
      list.push({
        category: 'handicap',
        title: 'Asian Handicap',
        items: [
          {
            label: `${match.team1} (-0.5)`,
            name: `${match.team1} Asian Handicap (-0.5)`,
            value: +(w1Val * 0.95).toFixed(2),
            subId: 'ah-1-m0.5',
          },
          {
            label: `${match.team2} (+0.5)`,
            name: `${match.team2} Asian Handicap (+0.5)`,
            value: +(w2Val * 0.75).toFixed(2),
            subId: 'ah-2-p0.5',
          },
          {
            label: `${match.team1} (-1.5)`,
            name: `${match.team1} Asian Handicap (-1.5)`,
            value: +(w1Val * 1.75).toFixed(2),
            subId: 'ah-1-m1.5',
          },
          {
            label: `${match.team2} (+1.5)`,
            name: `${match.team2} Asian Handicap (+1.5)`,
            value: 1.42,
            subId: 'ah-2-p1.5',
          },
        ],
        columns: 2,
      });

      // 8. Clean Sheet
      list.push({
        category: 'specials',
        title: `${match.team1} Clean Sheet`,
        items: [
          {
            label: 'Yes',
            name: `${match.team1} Clean Sheet - Yes`,
            value: 2.15,
            subId: 'cs-t1-yes',
          },
          {
            label: 'No',
            name: `${match.team1} Clean Sheet - No`,
            value: 1.62,
            subId: 'cs-t1-no',
          },
        ],
      });

      // 9. Total Odd / Even
      list.push({
        category: 'specials',
        title: 'Total Goals Odd/Even',
        items: [
          {
            label: 'Odd',
            name: 'Total Goals Odd',
            value: 1.9,
            subId: 'oe-odd',
          },
          {
            label: 'Even',
            name: 'Total Goals Even',
            value: 1.9,
            subId: 'oe-even',
          },
        ],
      });
    }

    return list;
  }, [match, w1Val, xVal, w2Val, baseOver, baseUnder, isTennis, isEsports, isBasketball]);

  const filteredMarkets = useMemo(() => {
    if (activeCategory === 'all') return markets;
    return markets.filter((m) => m.category === activeCategory);
  }, [markets, activeCategory]);

  const categories = [
    { id: 'all', label: 'All Markets' },
    { id: 'btts', label: isTennis ? 'Sets' : 'Main & BTTS' },
    { id: 'totals', label: 'Totals' },
    { id: 'halves', label: isTennis ? 'By Set' : 'Halves' },
    { id: 'handicap', label: 'Handicaps' },
    { id: 'specials', label: 'Specials' },
  ];

  const handleOddsClick = (
    e: React.MouseEvent,
    title: string,
    item: { label: string; name: string; value: number; subId: string }
  ) => {
    e.stopPropagation();
    const oddsItem: OddsItem = {
      id: `${match.id}-sec-${item.subId}`,
      label: item.label,
      name: `${match.team1} vs ${match.team2} · ${item.name}`,
      marketName: title,
      value: item.value,
      isLocked: match.odds.w1?.isLocked,
    };
    toggleSelection(match, oddsItem);
  };

  return (
    <div
      id={`secondary-markets-${match.id}`}
      className="bg-[#f2f6fa] border-t border-[#d5e0eb] p-2.5 sm:p-3.5 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Secondary Markets Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#dce5ef]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#163b63] text-white flex items-center justify-center text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-[#ffc600]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#10213d] tracking-tight">
                Secondary Betting Markets
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#dfe8f2] text-[#3b516b]">
                +{match.extraMarketsCount || 85} available
              </span>
            </div>
            <p className="text-[10px] text-[#61748d]">
              Click any odds to add to your BetSlip
            </p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(cat.id);
              }}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#163b63] text-white shadow-xs'
                  : 'bg-white text-[#476587] hover:bg-[#e4ecf5] hover:text-[#163b63] border border-[#d3dfea]'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {onOpenFullModal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenFullModal();
              }}
              title="Open full markets dialog"
              className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white text-[#1b65a5] hover:bg-[#e8f1fb] border border-[#bcd2e8] flex items-center gap-1 shrink-0 ml-1 cursor-pointer transition-colors"
            >
              <span>All ({match.extraMarketsCount})</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredMarkets.map((market, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg border border-[#d8e3ed] p-2 sm:p-2.5 shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-[#edf2f7]">
              <span className="text-[11px] font-bold text-[#20364f] truncate">
                {market.title}
              </span>
              <span className="text-[9.5px] font-medium text-[#7d90a6]">
                {market.items.length} choices
              </span>
            </div>

            <div
              className={`grid gap-1.5 ${
                market.columns === 3
                  ? 'grid-cols-3'
                  : market.columns === 2
                  ? 'grid-cols-2'
                  : market.items.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2'
              }`}
            >
              {market.items.map((item) => {
                const oddsId = `${match.id}-sec-${item.subId}`;
                const isSelected = isOddsSelected(oddsId);

                return (
                  <button
                    key={item.subId}
                    id={`sec-odds-${oddsId}`}
                    onClick={(e) => handleOddsClick(e, market.title, item)}
                    title={`${market.title}: ${item.name} (${item.value})`}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#ffc600] border-[#e6b200] text-black font-bold shadow-inner'
                        : 'bg-[#f8fafc] border-[#e2eaf2] text-[#1b2b40] hover:bg-[#eef4fb] hover:border-[#ccdbeb]'
                    }`}
                  >
                    <span className="truncate text-[10.5px] font-medium text-neutral-700 pr-1">
                      {item.label}
                    </span>
                    <span className="font-mono text-[11.5px] font-bold text-neutral-900 shrink-0">
                      {item.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
