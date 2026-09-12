import React, { useState } from 'react';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  Music,
  Bookmark,
  Repeat2,
} from 'lucide-react';

interface PolymarketCultureViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}

const subcategories = [
  { name: 'All', count: '2.1K' },
  { name: 'Ethiopia 🇪🇹', count: '220' },
  { name: 'Music', count: '340' },
  { name: 'Film & TV', count: '410' },
  { name: 'Sports Culture', count: '280' },
  { name: 'Social Media', count: '190' },
  { name: 'Fashion', count: '120' },
  { name: 'Awards', count: '180' },
  { name: 'Internet Culture', count: '210' },
  { name: 'Food & Drink', count: '90' },
  { name: 'Language', count: '60' },
];

const cultureCards = [
  {
    id: 'cul-eth-music',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopian artist wins Grammy nomination by 2027?',
    volume: '1.3M ETB Vol.',
    chance: '22%',
  },
  {
    id: 'cul-eth-festival',
    region: 'Ethiopia 🇪🇹',
    title: 'Timkat festival designated UNESCO Intangible Heritage by 2027?',
    volume: '950K ETB Vol.',
    chance: '45%',
  },
  {
    id: 'cul-eth-film',
    region: 'Ethiopia 🇪🇹',
    title: 'Ethiopian film surpasses $10M box office by 2027?',
    volume: '820K ETB Vol.',
    chance: '18%',
  },
  {
    id: 'cul-oscar',
    region: 'Awards',
    title: 'Next Best Picture Oscar goes to a non-English film?',
    volume: '2.8M ETB Vol.',
    chance: '28%',
  },
  {
    id: 'cul-tiktok',
    region: 'Social Media',
    title: 'TikTok banned in US before end of 2026?',
    volume: '3.5M ETB Vol.',
    chance: '35%',
  },
  {
    id: 'cul-mrbeast',
    region: 'Internet Culture',
    title: 'MrBeast reaches 400M YouTube subscribers by end of 2026?',
    volume: '1.1M ETB Vol.',
    chance: '52%',
  },
  {
    id: 'cul-grammy',
    region: 'Music',
    title: 'AI-generated song nominated for Grammy by 2027?',
    volume: '1.9M ETB Vol.',
    chance: '15%',
  },
  {
    id: 'cul-nba',
    region: 'Sports Culture',
    title: 'NBA expands to Mexico City before 2028?',
    volume: '2.1M ETB Vol.',
    chance: '42%',
  },
  {
    id: 'cul-f1',
    region: 'Sports Culture',
    title: 'F1 adds African Grand Prix by 2027?',
    volume: '1.7M ETB Vol.',
    chance: '55%',
  },
  {
    id: 'cul-netflix',
    region: 'Film & TV',
    title: 'Netflix reaches 300M subscribers by end of 2026?',
    volume: '2.4M ETB Vol.',
    chance: '68%',
  },
  {
    id: 'cul-fifa',
    region: 'Sports Culture',
    title: 'FIFA Club World Cup 2025 viewership exceeds 1B total?',
    volume: '1.5M ETB Vol.',
    chance: '38%',
  },
  {
    id: 'cul-anime',
    region: 'Film & TV',
    title: 'First anime film crosses $1B global box office?',
    volume: '1.8M ETB Vol.',
    chance: '20%',
  },
];

export const PolymarketCultureView: React.FC<PolymarketCultureViewProps> = ({
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
      ? cultureCards
      : cultureCards.filter((c) => c.region === activeSubcat);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Culture
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
            <Music className="w-5 h-5 text-pink-400" />
            <span>{activeSubcat === 'All' ? 'All Culture Markets' : activeSubcat}</span>
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
                    <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">
                      {card.region}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2 mt-1.5 mb-3">
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
