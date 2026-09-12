import React, { useState } from 'react';
import { POLYMARKET_TAG_PILLS } from '../../../data/polymarketData';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  Sparkles,
  Bookmark,
  Gift,
  Repeat2,
  ChevronDown,
  Search,
  Filter,
} from 'lucide-react';

interface NewMarketItem {
  id: string;
  title: string;
  category: string;
  volume: string;
  badge: string;
  chance?: string;
  options?: { name: string; probability: number; yesPrice: number; noPrice: number }[];
  isDaily?: boolean;
}

export const PolymarketNewView: React.FC<{
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onSelectOutcome, isDarkMode = true }) => {
  const [activeTag, setActiveTag] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(bookmarkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarkedIds(next);
  };

  const newMarketsList: NewMarketItem[] = [
    {
      id: 'new-israel-economic',
      title: 'Israel Election: Will New Economic Party pass the electoral threshold?',
      category: 'Politics',
      volume: '22K ETB Vol.',
      badge: '+ NEW',
      chance: '44% chance',
    },
    {
      id: 'new-israel-reservists',
      title: 'Israel Election: Will The Reservists party join with Blue and White?',
      category: 'Politics',
      volume: '19K ETB Vol.',
      badge: '+ NEW',
      chance: '47% chance',
    },
    {
      id: 'new-rhine-river',
      title: 'When will the Rhine River Kaub gauge return to normal depth (>150cm)?',
      category: 'Weather',
      volume: '31K ETB Vol.',
      badge: '+ NEW',
      chance: '59% chance',
    },
    {
      id: 'new-mrbeast-day27',
      title: '# of views of MrBeast video on day 27',
      category: 'Culture',
      volume: '48K ETB Vol.',
      badge: '+ NEW',
      options: [
        { name: '100M - 120M', probability: 48, yesPrice: 48, noPrice: 52 },
        { name: '120M - 140M', probability: 34, yesPrice: 34, noPrice: 66 },
      ],
    },
    {
      id: 'new-tornado-risk',
      title: 'Which cities face tornado risk on September 6?',
      category: 'Weather',
      volume: '14K ETB Vol.',
      badge: '+ NEW • Daily',
      options: [
        { name: 'Omaha, NE', probability: 31, yesPrice: 31, noPrice: 69 },
        { name: 'Des Moines, IA', probability: 24, yesPrice: 24, noPrice: 76 },
      ],
      isDaily: true,
    },
    {
      id: 'new-rain-sep7',
      title: 'Where will it rain on September 7?',
      category: 'Weather',
      volume: '29K ETB Vol.',
      badge: '+ NEW • Daily',
      options: [
        { name: 'Chicago, IL', probability: 64, yesPrice: 64, noPrice: 36 },
        { name: 'New York, NY', probability: 18, yesPrice: 18, noPrice: 82 },
      ],
      isDaily: true,
    },
    {
      id: 'new-elon-tweets-sep7',
      title: 'Elon Musk # tweets September 7 - September 9',
      category: 'Culture',
      volume: '62K ETB Vol.',
      badge: '+ NEW',
      options: [
        { name: '80 - 100', probability: 51, yesPrice: 51, noPrice: 49 },
        { name: '100 - 120', probability: 38, yesPrice: 38, noPrice: 62 },
      ],
    },
    {
      id: 'new-whitehouse-posts',
      title: 'White House # posts this week',
      category: 'Politics',
      volume: '16K ETB Vol.',
      badge: '+ NEW',
      options: [
        { name: '40 - 55', probability: 58, yesPrice: 58, noPrice: 42 },
        { name: '56+', probability: 28, yesPrice: 28, noPrice: 72 },
      ],
    },
    {
      id: 'new-ted-cruz-posts',
      title: 'Ted Cruz # posts this week',
      category: 'Politics',
      volume: '11K ETB Vol.',
      badge: '+ NEW',
      chance: '32% chance',
    },
    {
      id: 'new-cz-posts',
      title: 'CZ (Changpeng Zhao) # posts on X after release',
      category: 'Crypto',
      volume: '84K ETB Vol.',
      badge: '+ NEW',
      options: [
        { name: '5 - 10 posts', probability: 61, yesPrice: 61, noPrice: 39 },
        { name: '10 - 20 posts', probability: 29, yesPrice: 29, noPrice: 71 },
      ],
    },
    {
      id: 'new-nyc-mayor-posts',
      title: 'NYC Mayor Eric Adams # posts this week',
      category: 'Politics',
      volume: '9K ETB Vol.',
      badge: '+ NEW',
      chance: '41% chance',
    },
    {
      id: 'new-zelenskyy-posts',
      title: 'Volodymyr Zelenskyy # video addresses this week',
      category: 'World',
      volume: '23K ETB Vol.',
      badge: '+ NEW',
      options: [
        { name: '7 addresses', probability: 72, yesPrice: 72, noPrice: 28 },
        { name: '8+ addresses', probability: 21, yesPrice: 21, noPrice: 79 },
      ],
    },
    {
      id: 'new-trump-truth-social',
      title: 'Donald Trump # Truth Social posts August 31 - September 6',
      category: 'Politics',
      volume: '144K ETB Vol.',
      badge: '+ NEW',
      options: [
        { name: '120 - 150', probability: 49, yesPrice: 49, noPrice: 51 },
        { name: '150+', probability: 42, yesPrice: 42, noPrice: 58 },
      ],
    },
    {
      id: 'new-khamenei-posts',
      title: 'Ayatollah Khamenei # tweets in English this week',
      category: 'Geopolitics',
      volume: '38K ETB Vol.',
      badge: '+ NEW',
      chance: '63% chance',
    },
    {
      id: 'new-israel-seats-yashar',
      title: 'Israel Election: Will Yashar Party win at least 4 seats?',
      category: 'Politics',
      volume: '17K ETB Vol.',
      badge: '+ NEW',
      chance: '39% chance',
    },
    {
      id: 'new-israel-otzma',
      title: 'Israel Election: Will Otzma Yehudit win more seats than Shas?',
      category: 'Politics',
      volume: '25K ETB Vol.',
      badge: '+ NEW',
      chance: '28% chance',
    },
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>New Prediction Markets</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              FRESH
            </span>
          </h2>
          <div className="text-xs text-neutral-400 mt-0.5">
            Recently approved and listed markets on Polymarket
          </div>
        </div>
      </div>

      {/* Tag pills filter (matching video 00:43) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {POLYMARKET_TAG_PILLS.map((pill) => (
          <button
            key={pill}
            onClick={() => setActiveTag(pill)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTag === pill
                ? 'bg-white text-neutral-950 font-bold'
                : 'bg-[#121824] hover:bg-[#1a2333] text-neutral-400 hover:text-white border border-[#1d2738]'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Grid of New Market Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {newMarketsList.map((item) => {
          const isBookmarked = bookmarkedIds.has(item.id);
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badge & Category Row */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span className="text-emerald-400 font-mono font-bold text-[11px]">
                    {item.badge}
                  </span>
                  <span className="text-neutral-500">{item.category}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-3">
                  {item.title}
                </h3>

                {/* Options or Single Chance */}
                {item.chance ? (
                  <div className="my-2">
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      {item.chance}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() =>
                          onSelectOutcome({
                            marketId: item.id,
                            outcomeName: 'Yes',
                            price: parseInt(item.chance || '50'),
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
                            marketId: item.id,
                            outcomeName: 'No',
                            price: 100 - parseInt(item.chance || '50'),
                            side: 'no',
                          })
                        }
                        className="py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 my-2">
                    {item.options?.map((opt, i) => (
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
                            onClick={() =>
                              onSelectOutcome({
                                marketId: item.id,
                                outcomeName: opt.name,
                                price: opt.yesPrice,
                                side: 'yes',
                              })
                            }
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
                  <span>{item.volume}</span>
                  <Repeat2 className="w-3 h-3 text-neutral-500" />
                </div>

                <div className="flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 text-neutral-500 hover:text-white cursor-pointer" />
                  <button
                    onClick={(e) => toggleBookmark(item.id, e)}
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
            </div>
          );
        })}
      </div>

      {/* Show more markets button */}
      <div className="text-center pt-4">
        <button className="px-6 py-2 rounded-full bg-[#121824] hover:bg-[#1a2333] border border-[#212c3e] text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer">
          Show more markets
        </button>
      </div>
    </div>
  );
};
