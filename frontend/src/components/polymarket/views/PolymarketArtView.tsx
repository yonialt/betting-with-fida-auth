import React, { useState } from 'react';
import { ART_MARKETS, ART_FAQS, ArtMarketCard } from '../../../data/polymarketExtendedData';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  Palette,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Repeat2,
  Gift,
  HelpCircle,
} from 'lucide-react';

export const PolymarketArtView: React.FC<{
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onSelectOutcome, isDarkMode = true }) => {
  const [activeSubcat, setActiveSubcat] = useState<string>('Art');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(bookmarkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarkedIds(next);
  };

  const cultureSubcats = [
    { name: 'All', count: 393 },
    { name: 'Art', count: 9 },
    { name: 'Music', count: 57 },
    { name: 'Celebrities', count: 61 },
    { name: 'Awards', count: 93 },
    { name: 'MrBeast', count: 6 },
    { name: 'Movies', count: 72 },
    { name: 'Box Office', count: 8 },
    { name: 'Taylor Swift', count: 7 },
    { name: 'GTA VI', count: 5 },
    { name: 'Tweet Markets', count: 30 },
    { name: 'YouTube', count: 8 },
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Subcategories (from video 02:26) */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Pop Culture
          </div>

          <div className="space-y-0.5">
            {cultureSubcats.map((item) => {
              const isActive = activeSubcat === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveSubcat(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a2536] text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#121926]'
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#223147] text-neutral-200' : 'text-neutral-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: Art Markets Grid */}
        <div className="flex-1 w-full space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-400" />
              <span>Art Prediction Markets</span>
            </h2>
            <div className="text-xs text-neutral-400 mt-0.5">
              Curated by Masterworks · Global art milestones, auctions, and major exhibitions
            </div>
          </div>

          {/* Grid of Art Cards (Video 02:27 - 02:28) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {ART_MARKETS.map((card) => {
              const isBookmarked = bookmarkedIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Badge */}
                    <div className="text-[11px] font-semibold text-pink-400 mb-2 font-mono">
                      + NEW · {card.partnerBadge}
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2 mb-3">
                      {card.title}
                    </h3>

                    {/* Binary or Multi Outcome */}
                    {card.chance ? (
                      <div className="my-2">
                        <div className="text-xl font-bold font-mono text-emerald-400">
                          {card.chance}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() =>
                              onSelectOutcome({
                                marketId: card.id,
                                outcomeName: 'Yes',
                                price: parseInt(card.chance || '50'),
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
                                price: 100 - parseInt(card.chance || '50'),
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
                                onClick={() =>
                                  onSelectOutcome({
                                    marketId: card.id,
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

                  <div className="pt-2.5 mt-2 border-t border-[#1a2333] flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono">{card.volume}</span>
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

          {/* Frequently Asked Questions Accordion (Video 02:29) */}
          <div className="pt-6 border-t border-[#1b2536] space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-neutral-400" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2">
              {ART_FAQS.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl bg-[#101622] border border-[#1b2536] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-[#162030] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
