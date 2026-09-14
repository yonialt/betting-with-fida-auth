import React, { useState } from 'react';
import { PolymarketMarket, PolymarketTradeState, PolymarketOutcome, PolymarketChartData } from '../../../types/polymarket';
import {
  Landmark,
  Bookmark,
  Repeat2,
} from 'lucide-react';

interface PolymarketEconomyViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail: (market: PolymarketMarket) => void;
  isDarkMode?: boolean;
}

interface EconomyCard {
  id: string;
  region: string;
  title: string;
  volume: string;
  chance?: string;
}

const ECONOMY_SUBCATEGORIES = [
  { name: 'All', count: '2.6K' },
  { name: 'Ethiopia 🇪🇹', count: '310' },
  { name: 'GDP & Growth', count: '420' },
  { name: 'Inflation', count: '380' },
  { name: 'Trade', count: '290' },
  { name: 'Employment', count: '210' },
  { name: 'Infrastructure', count: '180' },
  { name: 'Aid & Development', count: '150' },
  { name: 'Debt & IMF', count: '220' },
  { name: 'Real Estate', count: '160' },
  { name: 'Supply Chain', count: '120' },
];

const ECONOMY_CARDS: EconomyCard[] = [
  {
    id: 'econ-eth-gdp',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia GDP growth exceeds 7% in 2026?',
    volume: '2.1M ETB Vol.',
    chance: '55%',
  },
  {
    id: 'econ-eth-inflation',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia inflation drops below 15% by end of 2026?',
    volume: '1.8M ETB Vol.',
    chance: '32%',
  },
  {
    id: 'econ-eth-dam',
    region: 'Ethiopia 🇪🇹',
    title: 'GERD full power generation reached by end of 2026?',
    volume: '3.5M ETB Vol.',
    chance: '48%',
  },
  {
    id: 'econ-eth-imf',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia completes IMF reform program by 2027?',
    volume: '2.4M ETB Vol.',
    chance: '62%',
  },
  {
    id: 'econ-eth-railway',
    region: 'Ethiopia 🇪🇹',
    title: 'Addis Ababa-Djibouti railway expansion completed by 2027?',
    volume: '1.2M ETB Vol.',
    chance: '38%',
  },
  {
    id: 'econ-us-recession',
    region: 'GDP & Growth',
    title: 'US enters recession before end of 2026?',
    volume: '4.8M ETB Vol.',
    chance: '28%',
  },
  {
    id: 'econ-china-gdp',
    region: 'GDP & Growth',
    title: 'China GDP growth falls below 4% in 2026?',
    volume: '3.2M ETB Vol.',
    chance: '42%',
  },
  {
    id: 'econ-global-inflation',
    region: 'Inflation',
    title: 'Global inflation averages below 3% by end of 2026?',
    volume: '2.9M ETB Vol.',
    chance: '35%',
  },
  {
    id: 'econ-us-inflation',
    region: 'Inflation',
    title: 'US CPI below 2.5% by December 2026?',
    volume: '3.8M ETB Vol.',
    chance: '45%',
  },
  {
    id: 'econ-usmca',
    region: 'Trade',
    title: 'USMCA trade agreement renegotiated before 2027?',
    volume: '1.5M ETB Vol.',
    chance: '22%',
  },
  {
    id: 'econ-us-unemployment',
    region: 'Employment',
    title: 'US unemployment rises above 5% by end of 2026?',
    volume: '2.1M ETB Vol.',
    chance: '18%',
  },
  {
    id: 'econ-africa-afcfta',
    region: 'Trade',
    title: 'AfCFTA achieves 50% tariff reduction by 2027?',
    volume: '1.1M ETB Vol.',
    chance: '30%',
  },
];

const ECONOMY_LOGO_MAP: Record<string, string> = {
  'econ-eth-gdp': '/pm-eth-birr-fx .jpg',
  'econ-eth-inflation': '/pm-eth-birr-fx .jpg',
  'econ-eth-dam': '/pm-eth-gerd-capacity.jpg',
  'econ-eth-imf': '/pm-eth-birr-fx .jpg',
  'econ-eth-railway': '/readseaport.jpg',
  'econ-us-recession': '/weath-global-2026-warmest .png',
  'econ-china-gdp': '/china-taiwan-2026.jpg',
  'econ-global-inflation': '/weath-global-2026-warmest .png',
  'econ-us-inflation': '/weath-global-2026-warmest .png',
  'econ-usmca': '/china-taiwan-2026.jpg',
  'econ-us-unemployment': '/weath-global-2026-warmest .png',
  'econ-africa-afcfta': '/readseaport.jpg',
};

// Convert an EconomyCard to PolymarketMarket format
const economyCardToMarket = (card: EconomyCard): PolymarketMarket => {
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
    category: 'Economy',
    subcategory: card.region,
    countryFlag: card.region.includes('Ethiopia') ? '🇪🇹' : undefined,
    volume: card.volume,
    displayType: 'binary_buttons',
    outcomes,
    chartData,
    marketOpened: 'Jan 1, 2026',
    resolverAddress: 'UMA 0x9fc47De9D...',
    commentsCount: Math.floor(Math.random() * 50) + 20,
    logoUrl: ECONOMY_LOGO_MAP[card.id],
  };
};

export const PolymarketEconomyView: React.FC<PolymarketEconomyViewProps> = ({
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
      ? ECONOMY_CARDS
      : ECONOMY_CARDS.filter((c) => c.region === activeSubcat);

  const handleCardClick = (card: EconomyCard) => {
    const market = economyCardToMarket(card);
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
            Economy
          </div>
          <div className="space-y-0.5">
            {ECONOMY_SUBCATEGORIES.map((sub) => {
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
            <Landmark className="w-5 h-5 text-amber-400" />
            <span>{activeSubcat === 'All' ? 'All Economy Markets' : activeSubcat}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isBookmarked = bookmarkedIds.has(card.id);
              const market = economyCardToMarket(card);

              return (
                <div
                  key={card.id}
                  onClick={(e) => { console.log('Card clicked:', card.id); handleCardClick(card); }}
                  className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {card.region && (
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                        {card.region}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mt-1.5 mb-3">
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
