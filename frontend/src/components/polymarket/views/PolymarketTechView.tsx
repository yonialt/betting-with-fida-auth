import React, { useState } from 'react';
import { PolymarketMarket, PolymarketTradeState, PolymarketOutcome, PolymarketChartData } from '../../../types/polymarket';
import {
  Cpu,
  Bookmark,
  Repeat2,
} from 'lucide-react';

interface PolymarketTechViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail: (market: PolymarketMarket) => void;
  isDarkMode?: boolean;
}

interface TechCard {
  id: string;
  region: string;
  title: string;
  volume: string;
  chance?: string;
}

const TECH_SUBCATEGORIES = [
  { name: 'All', count: '2.4K' },
  { name: 'Ethiopia 🇪🇹', count: '160' },
  { name: 'AI & LLMs', count: '520' },
  { name: 'Big Tech', count: '380' },
  { name: 'Startups', count: '290' },
  { name: 'Semiconductors', count: '210' },
  { name: 'Telecom', count: '180' },
  { name: 'Space', count: '150' },
  { name: 'Regulation', count: '220' },
  { name: 'Cybersecurity', count: '140' },
  { name: 'Open Source', count: '80' },
];

const TECH_CARDS: TechCard[] = [
  {
    id: 'tech-eth-internet',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia reaches 50% internet penetration by end of 2026?',
    volume: '1.8M ETB Vol.',
    chance: '32%',
  },
  {
    id: 'tech-eth-telebirr',
    region: 'Ethiopia 🇪🇹',
    title: 'Telebirr surpasses 50M active users by 2027?',
    volume: '2.5M ETB Vol.',
    chance: '58%',
  },
  {
    id: 'tech-eth-startup',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia produces first $100M startup valuation by 2027?',
    volume: '1.1M ETB Vol.',
    chance: '22%',
  },
  {
    id: 'tech-ai-agi',
    region: 'AI & LLMs',
    title: 'OpenAI announces AGI milestone before end of 2026?',
    volume: '4.2M ETB Vol.',
    chance: '15%',
  },
  {
    id: 'tech-ai-regulation',
    region: 'AI & LLMs',
    title: 'EU AI Act enforcement leads to first major fine by 2027?',
    volume: '2.8M ETB Vol.',
    chance: '65%',
  },
  {
    id: 'tech-apple-vr',
    region: 'Big Tech',
    title: 'Apple Vision Pro sells 10M units by end of 2026?',
    volume: '1.9M ETB Vol.',
    chance: '28%',
  },
  {
    id: 'tech-google-antitrust',
    region: 'Regulation',
    title: 'Google forced to divest Chrome browser by 2027?',
    volume: '3.5M ETB Vol.',
    chance: '18%',
  },
  {
    id: 'tech-nvidia',
    region: 'Semiconductors',
    title: 'Nvidia market cap exceeds $5T by end of 2026?',
    volume: '4.1M ETB Vol.',
    chance: '35%',
  },
  {
    id: 'tech-spacex-mars',
    region: 'Space',
    title: 'SpaceX Starship reaches Mars orbit by end of 2026?',
    volume: '2.2M ETB Vol.',
    chance: '8%',
  },
  {
    id: 'tech-cyber-major',
    region: 'Cybersecurity',
    title: 'Major critical infrastructure cyberattack in US before 2027?',
    volume: '1.7M ETB Vol.',
    chance: '42%',
  },
  {
    id: 'tech-elon-twitter',
    region: 'Startups',
    title: 'X (Twitter) IPO before end of 2026?',
    volume: '1.4M ETB Vol.',
    chance: '12%',
  },
  {
    id: 'tech-5g-africa',
    region: 'Telecom',
    title: 'Africa 5G subscribers surpass 100M by end of 2026?',
    volume: '890K ETB Vol.',
    chance: '38%',
  },
];

const TECH_LOGO_MAP: Record<string, string> = {
  'tech-eth-internet': '/best-ai-september .jpg',
  'tech-eth-telebirr': '/pm-eth-birr-fx .jpg',
  'tech-eth-startup': '/best-ai-september .jpg',
  'tech-ai-agi': '/best-ai-september .jpg',
  'tech-ai-regulation': '/best-ai-september .jpg',
  'tech-apple-vr': '/best-ai-september .jpg',
  'tech-google-antitrust': '/best-ai-september .jpg',
  'tech-nvidia': '/best-ai-september .jpg',
  'tech-spacex-mars': '/best-ai-september .jpg',
  'tech-cyber-major': '/best-ai-september .jpg',
  'tech-elon-twitter': '/best-ai-september .jpg',
  'tech-5g-africa': '/best-ai-september .jpg',
};

// Convert a TechCard to PolymarketMarket format
const techCardToMarket = (card: TechCard): PolymarketMarket => {
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
    category: 'Tech',
    subcategory: card.region,
    countryFlag: card.region.includes('Ethiopia') ? '🇪🇹' : undefined,
    volume: card.volume,
    displayType: 'binary_buttons',
    outcomes,
    chartData,
    marketOpened: 'Jan 1, 2026',
    resolverAddress: 'UMA 0x9fc47De9D...',
    commentsCount: Math.floor(Math.random() * 50) + 20,
    logoUrl: TECH_LOGO_MAP[card.id],
  };
};

export const PolymarketTechView: React.FC<PolymarketTechViewProps> = ({
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
      ? TECH_CARDS
      : TECH_CARDS.filter((c) => c.region === activeSubcat);

  const handleCardClick = (card: TechCard) => {
    const market = techCardToMarket(card);
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
            Tech
          </div>
          <div className="space-y-0.5">
            {TECH_SUBCATEGORIES.map((sub) => {
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
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>{activeSubcat === 'All' ? 'All Tech Markets' : activeSubcat}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isBookmarked = bookmarkedIds.has(card.id);
              const market = techCardToMarket(card);

              return (
                <div
                  key={card.id}
                  onClick={(e) => { console.log('Card clicked:', card.id); handleCardClick(card); }}
                  className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {card.region && (
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                        {card.region}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2 mt-1.5 mb-3">
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
