import React, { useState } from 'react';
import { PolymarketMarket, PolymarketTradeState, PolymarketOutcome, PolymarketChartData } from '../../../types/polymarket';
import {
  Search,
  Bookmark,
  Repeat2,
  ChevronRight,
} from 'lucide-react';

interface PoliticsCard {
  id: string;
  region: string;
  title: string;
  volume: string;
  chance?: string;
  options?: Array<{
    name: string;
    probability: number;
    yesPrice: number;
    noPrice: number;
  }>;
  rulesText?: string;
  resolutionSource?: string;
  marketOpened?: string;
  resolverAddress?: string;
}

interface PolymarketPoliticsViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail: (market: PolymarketMarket) => void;
  onOpenMidterms: () => void;
  isDarkMode?: boolean;
}

const POLITICS_SUBCATEGORIES = [
  { name: 'All', count: '3.5K' },
  { name: 'Ethiopia 🇪🇹', count: '340' },
  { name: 'Horn of Africa', count: '185' },
  { name: 'Trump', count: '306' },
  { name: 'Midterms', count: '1.2K' },
  { name: 'Global Elections', count: '661' },
  { name: 'Primaries', count: '28' },
  { name: 'Congress', count: '35' },
  { name: 'Courts', count: '23' },
  { name: 'Russia', count: '12' },
  { name: 'Israel', count: '37' },
  { name: 'UK', count: '1' },
  { name: 'Germany', count: '88' },
  { name: 'France', count: '6' },
  { name: 'China', count: '45' },
  { name: 'India', count: '22' },
];

const POLITICS_CARDS: PoliticsCard[] = [
  {
    id: 'pol-eth-parliament',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopian parliament passes new media law by end of 2026?',
    volume: '1.2M ETB Vol.',
    chance: '35%',
    rulesText: 'Resolves to Yes if the Ethiopian House of Peoples\' Representatives passes the new media freedom and regulation bill before December 31, 2026.',
    resolutionSource: 'Ethiopian Parliament Records',
    marketOpened: 'Jan 15, 2026',
  },
  {
    id: 'pol-eth-peace',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia nationwide peace agreement signed by December 2026?',
    volume: '3.8M ETB Vol.',
    chance: '22%',
    rulesText: 'Resolves to Yes if the Ethiopian federal government signs a comprehensive nationwide peace agreement covering all regional states.',
    resolutionSource: 'Ethiopian Ministry of Peace',
    marketOpened: 'Feb 1, 2026',
  },
  {
    id: 'pol-eth-election',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopia holds national elections before end of 2027?',
    volume: '2.5M ETB Vol.',
    chance: '48%',
    rulesText: 'Resolves to Yes if the National Election Board of Ethiopia schedules and conducts national elections before December 31, 2027.',
    resolutionSource: 'National Election Board of Ethiopia',
    marketOpened: 'Mar 1, 2026',
  },
  {
    id: 'pol-horn-djibouti',
    region: 'Horn of Africa',
    title: 'Ethiopia-Djibouti corridor trade deal signed by end of 2026?',
    volume: '1.1M ETB Vol.',
    chance: '42%',
    rulesText: 'Resolves to Yes if Ethiopia and Djibouti sign a formal trade corridor agreement increasing bilateral trade capacity.',
    resolutionSource: 'Ethiopian Ministry of Trade',
    marketOpened: 'Apr 1, 2026',
  },
  {
    id: 'pol-balance-power',
    region: 'US Midterms',
    title: 'Balance of Power: 2026 Midterms',
    volume: '11M ETB Vol.',
    options: [
      { name: 'Democrats Sweep', probability: 51, yesPrice: 51, noPrice: 49 },
      { name: 'R Senate, D House', probability: 36, yesPrice: 36, noPrice: 64 },
      { name: 'Republicans Sweep', probability: 12, yesPrice: 12, noPrice: 88 },
      { name: 'D Senate, R House', probability: 1, yesPrice: 1, noPrice: 99 },
    ],
    rulesText: 'Resolves based on the final composition of the US Senate and House of Representatives following the 2026 midterm elections.',
    resolutionSource: 'AP Election Results',
    marketOpened: 'Nov 1, 2025',
  },
  {
    id: 'pol-french-presidential',
    region: 'France',
    title: 'Next French Presidential Election Winner',
    volume: '4M ETB Vol.',
    options: [
      { name: 'Marine Le Pen', probability: 42, yesPrice: 42, noPrice: 58 },
      { name: 'Jordan Bardella', probability: 28, yesPrice: 28, noPrice: 72 },
      { name: 'Gabriel Attal', probability: 12, yesPrice: 12, noPrice: 88 },
      { name: 'Édouard Philippe', probability: 8, yesPrice: 8, noPrice: 92 },
    ],
    rulesText: 'Resolves to the individual who wins the French presidential election and is sworn in as President.',
    resolutionSource: 'French Interior Ministry',
    marketOpened: 'Dec 1, 2025',
  },
  {
    id: 'pol-gop-2028',
    region: 'US Election',
    title: 'Republican Presidential Nominee 2028',
    volume: '8.2M ETB Vol.',
    options: [
      { name: 'JD Vance', probability: 54, yesPrice: 54, noPrice: 46 },
      { name: 'Nikki Haley', probability: 14, yesPrice: 14, noPrice: 86 },
      { name: 'Ron DeSantis', probability: 9, yesPrice: 9, noPrice: 91 },
      { name: 'Vivek Ramaswamy', probability: 7, yesPrice: 7, noPrice: 93 },
    ],
    rulesText: 'Resolves to the candidate who wins the Republican Party nomination for the 2028 US Presidential election.',
    resolutionSource: 'Republican National Committee',
    marketOpened: 'Jan 1, 2026',
  },
  {
    id: 'pol-israel-pm',
    region: 'Israel',
    title: 'Next Prime Minister of Israel',
    volume: '6.5M ETB Vol.',
    options: [
      { name: 'Benjamin Netanyahu', probability: 48, yesPrice: 48, noPrice: 52 },
      { name: 'Naftali Bennett', probability: 31, yesPrice: 31, noPrice: 69 },
      { name: 'Benny Gantz', probability: 12, yesPrice: 12, noPrice: 88 },
      { name: 'Yair Lapid', probability: 5, yesPrice: 5, noPrice: 95 },
    ],
    rulesText: 'Resolves to the individual who becomes Prime Minister of Israel following the next general election.',
    resolutionSource: 'Israeli Knesset',
    marketOpened: 'Feb 1, 2026',
  },
  {
    id: 'pol-dem-2028',
    region: 'US Election',
    title: 'Democratic Presidential Nominee 2028',
    volume: '7.4M ETB Vol.',
    options: [
      { name: 'Kamala Harris', probability: 38, yesPrice: 38, noPrice: 62 },
      { name: 'Gavin Newsom', probability: 24, yesPrice: 24, noPrice: 76 },
      { name: 'Josh Shapiro', probability: 17, yesPrice: 17, noPrice: 83 },
      { name: 'Gretchen Whitmer', probability: 9, yesPrice: 9, noPrice: 91 },
    ],
    rulesText: 'Resolves to the candidate who wins the Democratic Party nomination for the 2028 US Presidential election.',
    resolutionSource: 'Democratic National Committee',
    marketOpened: 'Jan 1, 2026',
  },
  {
    id: 'pol-brazil-election',
    region: 'Latin America',
    title: 'Brazil Presidential Election 2026',
    volume: '1.8M ETB Vol.',
    options: [
      { name: 'Lula da Silva', probability: 55, yesPrice: 55, noPrice: 45 },
      { name: 'Tarcísio de Freitas', probability: 29, yesPrice: 29, noPrice: 71 },
      { name: 'Jair Bolsonaro', probability: 8, yesPrice: 8, noPrice: 92 },
    ],
    rulesText: 'Resolves to the winner of the 2026 Brazilian presidential election.',
    resolutionSource: 'Brazilian Electoral Commission (TSE)',
    marketOpened: 'Mar 1, 2026',
  },
  {
    id: 'pol-us-iran-blockade',
    region: 'Middle East',
    title: 'US announces end of Iranian naval blockade by September 30?',
    volume: '3.2M ETB Vol.',
    chance: '34%',
    rulesText: 'Resolves to Yes if the United States officially announces the termination of any naval blockade affecting Iranian waters.',
    resolutionSource: 'US Department of Defense',
    marketOpened: 'May 1, 2026',
  },
  {
    id: 'pol-china-taiwan',
    region: 'Asia Pacific',
    title: 'Will China invade Taiwan by end of 2026?',
    volume: '4.1M ETB Vol.',
    chance: '4%',
    rulesText: 'Resolves to Yes if Chinese military forces conduct a full-scale invasion of Taiwan before December 31, 2026.',
    resolutionSource: 'International Conflict Tracking',
    marketOpened: 'Jun 1, 2026',
  },
  {
    id: 'pol-putin-out',
    region: 'Russia',
    title: 'Vladimir Putin out as President of Russia by December 31, 2026?',
    volume: '2.9M ETB Vol.',
    chance: '14%',
    rulesText: 'Resolves to Yes if Vladimir Putin ceases to hold the office of President of Russia before December 31, 2026.',
    resolutionSource: 'Russian Presidential Administration',
    marketOpened: 'Jul 1, 2026',
  },
  {
    id: 'pol-afd-majority',
    region: 'Germany',
    title: 'Will AfD win an absolute majority in any state election in 2026?',
    volume: '890K ETB Vol.',
    chance: '19%',
    rulesText: 'Resolves to Yes if the Alternative for Germany (AfD) party wins more than 50% of seats in any German state parliament election in 2026.',
    resolutionSource: 'German Federal Returning Officer',
    marketOpened: 'Aug 1, 2026',
  },
];

const POLITICS_LOGO_MAP: Record<string, string> = {
  'pol-eth-parliament': '/addis ababa city.jpg',
  'pol-eth-peace': '/addis ababa city.jpg',
  'pol-eth-election': '/addis ababa city.jpg',
  'pol-horn-djibouti': '/readseaport.jpg',
  'pol-balance-power': '/weath-global-2026-warmest .png',
  'pol-french-presidential': '/china-taiwan-2026.jpg',
  'pol-gop-2028': '/best-ai-september .jpg',
  'pol-israel-pm': '/russiaxukranie.jpg',
  'pol-dem-2028': '/best-ai-september .jpg',
  'pol-brazil-election': '/china-taiwan-2026.jpg',
  'pol-us-iran-blockade': '/russiaxukranie.jpg',
  'pol-china-taiwan': '/china-taiwan-2026.jpg',
  'pol-putin-out': '/russiaxukranie.jpg',
  'pol-afd-majority': '/weath-global-2026-warmest .png',
};

// Convert a PoliticsCard to PolymarketMarket format
const politicsCardToMarket = (card: PoliticsCard): PolymarketMarket => {
  const outcomes: PolymarketOutcome[] = [];

  if (card.chance) {
    const chanceNum = parseInt(card.chance.replace('%', '')) || 50;
    outcomes.push(
      { name: 'Yes', probability: chanceNum, yesPrice: chanceNum, noPrice: 100 - chanceNum },
      { name: 'No', probability: 100 - chanceNum, yesPrice: 100 - chanceNum, noPrice: chanceNum }
    );
  } else if (card.options) {
    card.options.forEach((opt, i) => {
      outcomes.push({
        name: opt.name,
        probability: opt.probability,
        yesPrice: opt.yesPrice,
        noPrice: opt.noPrice,
        avatar: i === 0 ? undefined : undefined,
      });
    });
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
    category: 'Politics',
    subcategory: card.region,
    countryFlag: card.region.includes('Ethiopia') ? '🇪🇹' : undefined,
    volume: card.volume,
    displayType: 'multi_outcome',
    outcomes,
    chartData,
    rulesText: card.rulesText,
    resolutionSource: card.resolutionSource,
    marketOpened: card.marketOpened || 'Jan 1, 2026',
    resolverAddress: card.resolverAddress || 'UMA 0x9fc47De9D...',
    commentsCount: Math.floor(Math.random() * 50) + 20,
    logoUrl: POLITICS_LOGO_MAP[card.id],
  };
};

export const PolymarketPoliticsView: React.FC<PolymarketPoliticsViewProps> = ({
  onSelectOutcome,
  onOpenDetail,
  onOpenMidterms,
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

  const handleCardClick = (card: PoliticsCard) => {
    const market = politicsCardToMarket(card);
    if (onOpenDetail) {
      onOpenDetail(market);
    }
  };





  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Categories */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Politics
          </div>

          <div className="space-y-0.5">
            {POLITICS_SUBCATEGORIES.map((sub) => {
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

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-5">
          {/* Hero Feature: 2026 Midterms Predictions Card */}
          <div
            onClick={onOpenMidterms}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121b2a] via-[#152033] to-[#121c2d] border border-[#23334d] hover:border-blue-500/50 transition-all cursor-pointer shadow-xl group relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold">
                  <span>FEATURED PREDICTION</span>
                  <span>·</span>
                  <span className="text-emerald-400">UPDATED DAILY</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span>2026 Midterms Predictions</span>
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-xs text-neutral-300 max-w-xl">
                  Interactive state-by-state race forecast, Senate and House chamber seat
                  projections, live candidate odds, and battleground margins.
                </p>
              </div>

              {/* Graphic stats preview */}
              <div className="flex items-center gap-3 bg-[#0a0f18]/80 p-3 rounded-2xl border border-[#1e2a3c] shrink-0">
                <div className="text-center px-3 border-r border-[#1e2a3c]">
                  <div className="font-mono font-extrabold text-blue-400 text-lg">52%</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Dem Senate</div>
                </div>
                <div className="text-center px-3">
                  <div className="font-mono font-extrabold text-blue-400 text-lg">88%</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Dem House</div>
                </div>
              </div>
            </div>
          </div>

          {/* Politics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {POLITICS_CARDS.map((card) => {
              const isBookmarked = bookmarkedIds.has(card.id);
              const market = politicsCardToMarket(card);

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
                    ) : (
                      <div className="space-y-1.5 my-2">
                        {card.options?.map((opt, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-[#141b27] border border-[#1e2838] flex items-center justify-between text-xs"
                          >
                            <span className="text-neutral-300 font-medium truncate">
                              {opt.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-white">
                                {opt.probability}%
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectOutcome({
                                    market,
                                    outcome: market.outcomes[i],
                                    side: 'yes',
                                    price: opt.yesPrice,
                                  });
                                }}
                                className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[11px] cursor-pointer"
                              >
                                {opt.yesPrice}%
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
