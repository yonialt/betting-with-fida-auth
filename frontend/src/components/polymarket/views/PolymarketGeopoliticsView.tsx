import React, { useState } from 'react';
import { PolymarketMarket, PolymarketTradeState, PolymarketOutcome, PolymarketChartData } from '../../../types/polymarket';
import {
  Globe,
  MapPin,
  Bookmark,
  Repeat2,
  ChevronRight,
} from 'lucide-react';

interface PolymarketGeopoliticsViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail: (market: PolymarketMarket) => void;
  isDarkMode?: boolean;
}

interface GeopoliticsCard {
  id: string;
  region: string;
  title: string;
  volume: string;
  chance?: string;
}

const GEOPOLITICS_SUBCATEGORIES = [
  { name: 'All', count: '2.8K' },
  { name: 'Ethiopia 🇪🇹', count: '340' },
  { name: 'Horn of Africa', count: '185' },
  { name: 'East Africa', count: '120' },
  { name: 'Middle East', count: '520' },
  { name: 'US-China', count: '310' },
  { name: 'Russia-Ukraine', count: '280' },
  { name: 'NATO & Europe', count: '190' },
  { name: 'South Asia', count: '140' },
  { name: 'Latin America', count: '110' },
  { name: 'Arctic & Pacific', count: '85' },
];

const GEOPOLITICS_CARDS: GeopoliticsCard[] = [
  {
    id: 'geo-eth-djibouti',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia-Djibouti corridor trade deal signed by end of 2026?',
    volume: '1.2M ETB Vol.',
    chance: '42%',
  },
  {
    id: 'geo-eth-somalia',
    region: 'Horn of Africa',
    title: 'Ethiopia-Somalia maritime agreement reached by December 2026?',
    volume: '2.8M ETB Vol.',
    chance: '28%',
  },
  {
    id: 'geo-eth-eritrea',
    region: 'Horn of Africa',
    title: 'Ethiopia-Eritrea border normalization before 2027?',
    volume: '3.5M ETB Vol.',
    chance: '18%',
  },
  {
    id: 'geo-horn-stability',
    region: 'Horn of Africa',
    title: 'Horn of Africa sees reduced conflict by end of 2026?',
    volume: '1.9M ETB Vol.',
    chance: '35%',
  },
  {
    id: 'geo-us-china-taiwan',
    region: 'US-China',
    title: 'Will China invade Taiwan by end of 2026?',
    volume: '4.1M ETB Vol.',
    chance: '4%',
  },
  {
    id: 'geo-us-china-trade',
    region: 'US-China',
    title: 'US-China trade deal signed before Q2 2027?',
    volume: '2.6M ETB Vol.',
    chance: '31%',
  },
  {
    id: 'geo-ru-ukraine',
    region: 'Russia-Ukraine',
    title: 'Russia-Ukraine ceasefire by end of 2026?',
    volume: '5.2M ETB Vol.',
    chance: '22%',
  },
  {
    id: 'geo-putin-out',
    region: 'Russia-Ukraine',
    title: 'Vladimir Putin out as President by December 31, 2026?',
    volume: '2.9M ETB Vol.',
    chance: '14%',
  },
  {
    id: 'geo-iran-blockade',
    region: 'Middle East',
    title: 'US announces end of Iranian naval blockade by September 30?',
    volume: '3.2M ETB Vol.',
    chance: '34%',
  },
  {
    id: 'geo-israel-pm',
    region: 'Middle East',
    title: 'Next Prime Minister of Israel',
    volume: '6.5M ETB Vol.',
    chance: '48%',
  },
  {
    id: 'geo-nato-spending',
    region: 'NATO & Europe',
    title: 'All NATO members meet 3% GDP spending target by 2027?',
    volume: '1.1M ETB Vol.',
    chance: '15%',
  },
  {
    id: 'geo-afghanistan',
    region: 'South Asia',
    title: 'Afghanistan women education rights restored before 2028?',
    volume: '890K ETB Vol.',
    chance: '8%',
  },
];

const GEOPOLITICS_LOGO_MAP: Record<string, string> = {
  'geo-eth-djibouti': '/readseaport.jpg',
  'geo-eth-somalia': '/id  pm-eth-q-constitution-2029 .png',
  'geo-eth-eritrea': '/russiaxukranie.jpg',
  'geo-horn-stability': '/ethiopianmilitary.jpg',
  'geo-us-china-taiwan': '/china-taiwan-2026.jpg',
  'geo-us-china-trade': '/china-taiwan-2026.jpg',
  'geo-ru-ukraine': '/russiaxukranie.jpg',
  'geo-putin-out': '/russiaxukranie.jpg',
  'geo-iran-blockade': '/russiaxukranie.jpg',
  'geo-israel-pm': '/russiaxukranie.jpg',
  'geo-nato-spending': '/weath-global-2026-warmest .png',
  'geo-afghanistan': '/id  pm-eth-q-constitution-2029 .png',
};

// Convert a GeopoliticsCard to PolymarketMarket format
const geopoliticsCardToMarket = (card: GeopoliticsCard): PolymarketMarket => {
  const outcomes: PolymarketOutcome[] = [];

  if (card.chance) {
    const chanceNum = parseInt(card.chance.replace('%', '')) || 50;
    outcomes.push(
      { name: 'Yes', probability: chanceNum, yesPrice: chanceNum, noPrice: 100 - chanceNum },
      { name: 'No', probability: 100 - chanceNum, yesPrice: 100 - chanceNum, noPrice: chanceNum }
    );
  }

  // Generate chart data
  const baseProb = outcomes[0]?.probability || 50;
  const chartData: PolymarketChartData = {
    labels: ['May 1', 'May 8', 'May 15', 'May 22', 'May 29', 'Jun 5', 'Jun 12', 'Jun 19'],
    series: [
      {
        name: outcomes[0]?.name || 'Lead',
        color: '#38bdf8',
        currentVal: baseProb,
        data: outcomes.map((_, i) => {
          const trend = (i / outcomes.length) * 5;
          const noise = (Math.random() - 0.5) * 3;
          return Math.min(99, Math.max(1, baseProb + trend + noise));
        }),
      },
    ],
  };

  return {
    id: card.id,
    title: card.title,
    category: 'Geopolitics',
    subcategory: card.region,
    countryFlag: card.region.includes('Ethiopia') ? '🇪🇹' : undefined,
    volume: card.volume,
    displayType: 'binary_buttons',
    outcomes,
    chartData,
    marketOpened: 'Jan 1, 2026',
    resolverAddress: 'UMA 0x9fc47De9D...',
    commentsCount: Math.floor(Math.random() * 50) + 20,
    logoUrl: GEOPOLITICS_LOGO_MAP[card.id],
  };
};

export const PolymarketGeopoliticsView: React.FC<PolymarketGeopoliticsViewProps> = ({
  onSelectOutcome,
  onOpenDetail,
  isDarkMode = true,
}) => {
  const [activeSubcat, setActiveSubcat] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(bookmarkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarkedIds(next);
  };

  const filteredCards =
    activeSubcat === 'All'
      ? GEOPOLITICS_CARDS
      : GEOPOLITICS_CARDS.filter((c) => c.region === activeSubcat);

  const handleCardClick = (card: GeopoliticsCard) => {
    const market = geopoliticsCardToMarket(card);
    if (onOpenDetail) {
      onOpenDetail(market);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Geopolitics
          </div>
          <div className="space-y-0.5">
            {GEOPOLITICS_SUBCATEGORIES.map((sub) => {
              const isActive = activeSubcat === sub.name;
              return (
                <button
                  key={sub.name}
                  onClick={() => setActiveSubcat(sub.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a2536] text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#121926]'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#223147] text-neutral-200' : 'text-neutral-500'
                    }`}
                  >
                    {sub.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full space-y-5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span>{activeSubcat === 'All' ? 'All Geopolitics Markets' : activeSubcat}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isBookmarked = bookmarkedIds.has(card.id);
              const market = geopoliticsCardToMarket(card);

              return (
                <div
                  key={card.id}
                  onClick={(e) => { console.log('Card clicked:', card.id); handleCardClick(card); }}
                  className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {card.region && (
                      <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                        {card.region}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mt-1.5 mb-3">
                      {card.title}
                    </h3>

                    {card.chance ? (
                      <div className="my-2">
                        <div className="text-xl font-bold font-mono text-emerald-400">
                          {card.chance}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOutcome({
                                market,
                                outcome: market.outcomes[0],
                                side: 'yes',
                                price: market.outcomes[0].yesPrice,
                              });
                            }}
                            className="py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer text-center"
                          >
                            Yes
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOutcome({
                                market,
                                outcome: market.outcomes[1],
                                side: 'no',
                                price: market.outcomes[1].yesPrice,
                              });
                            }}
                            className="py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer text-center"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2.5 mt-2 border-t border-[#1a2333] flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>{card.volume}</span>
                      <Repeat2 className="w-3 h-3 text-neutral-500" />
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(card.id, e)}
                      className="cursor-pointer hover:text-white"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-neutral-500'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
