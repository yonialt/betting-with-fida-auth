import React, { useState } from 'react';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  TrendingUp,
  Bookmark,
  Repeat2,
  DollarSign,
} from 'lucide-react';

interface PolymarketFinanceViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}

const subcategories = [
  { name: 'All', count: '3.1K' },
  { name: 'Ethiopia 🇪🇹', count: '280' },
  { name: 'Interest Rates', count: '420' },
  { name: 'Stock Market', count: '510' },
  { name: 'Bonds & Yields', count: '340' },
  { name: 'Commodities', count: '290' },
  { name: 'Currency', count: '380' },
  { name: 'Banking', count: '180' },
  { name: 'FOMC', count: '150' },
  { name: 'IPO & Listings', count: '210' },
  { name: 'Forex', count: '340' },
];

const financeCards = [
  {
    id: 'fin-etb-rate',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopian Birr (ETB) stabilizes below 130 per USD by end of 2026?',
    volume: '1.5M ETB Vol.',
    chance: '38%',
  },
  {
    id: 'fin-nbe-rate',
    region: 'Ethiopia 🇪🇹',
    title: 'National Bank of Ethiopia cuts interest rate before Q2 2027?',
    volume: '980K ETB Vol.',
    chance: '52%',
  },
  {
    id: 'fin-etse- Addis',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopian Securities Exchange (ESX) reaches 100B ETB market cap by 2027?',
    volume: '2.1M ETB Vol.',
    chance: '25%',
  },
  {
    id: 'fin-fomc-cut',
    region: 'Interest Rates',
    title: 'Fed cuts rates by 50bps in September 2026?',
    volume: '4.8M ETB Vol.',
    chance: '32%',
  },
  {
    id: 'fin-sp500',
    region: 'Stock Market',
    title: 'S&P 500 above 6,000 by end of 2026?',
    volume: '3.9M ETB Vol.',
    chance: '58%',
  },
  {
    id: 'fin-btc-100k',
    region: 'Stock Market',
    title: 'Bitcoin above $100K by December 2026?',
    volume: '6.2M ETB Vol.',
    chance: '44%',
  },
  {
    id: 'fin-us10y',
    region: 'Bonds & Yields',
    title: 'US 10-year Treasury yield above 5% by end of 2026?',
    volume: '2.7M ETB Vol.',
    chance: '18%',
  },
  {
    id: 'fin-gold',
    region: 'Commodities',
    title: 'Gold above $3,500/oz by end of 2026?',
    volume: '3.1M ETB Vol.',
    chance: '41%',
  },
  {
    id: 'fin-oil',
    region: 'Commodities',
    title: 'Oil (WTI) below $60/barrel by end of 2026?',
    volume: '2.4M ETB Vol.',
    chance: '27%',
  },
  {
    id: 'fin-eur-usd',
    region: 'Currency',
    title: 'EUR/USD parity reached before end of 2026?',
    volume: '1.8M ETB Vol.',
    chance: '12%',
  },
  {
    id: 'fin-jpy-usd',
    region: 'Forex',
    title: 'USD/JPY above 160 before end of 2026?',
    volume: '1.3M ETB Vol.',
    chance: '35%',
  },
  {
    id: 'fin-fomc-hold',
    region: 'FOMC',
    title: 'FOMC holds rates steady at September meeting?',
    volume: '5.1M ETB Vol.',
    chance: '62%',
  },
];

export const PolymarketFinanceView: React.FC<PolymarketFinanceViewProps> = ({
  onSelectOutcome,
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
      ? financeCards
      : financeCards.filter((c) => c.region === activeSubcat);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Finance
          </div>
          <div className="space-y-0.5">
            {subcategories.map((sub) => {
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
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{activeSubcat === 'All' ? 'All Finance Markets' : activeSubcat}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isBookmarked = bookmarkedIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      {card.region}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mt-1.5 mb-3">
                      {card.title}
                    </h3>
                    <div className="my-2">
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        {card.chance} chance
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() =>
                            onSelectOutcome({
                              marketId: card.id,
                              outcomeName: 'Yes',
                              price: parseInt(card.chance),
                              side: 'yes',
                            })
                          }
                          className="py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() =>
                            onSelectOutcome({
                              marketId: card.id,
                              outcomeName: 'No',
                              price: 100 - parseInt(card.chance),
                              side: 'no',
                            })
                          }
                          className="py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
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
