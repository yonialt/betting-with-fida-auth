import React, { useState } from 'react';
import { MENTION_EVENTS, MentionEvent } from '../../../data/polymarketExtendedData';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  Mic,
  MessageSquare,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
} from 'lucide-react';

export const PolymarketMentionsView: React.FC<{
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onSelectOutcome, isDarkMode = true }) => {
  const [selectedWord, setSelectedWord] = useState<{ eventId: string; word: string } | null>(null);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white space-y-6">
      {/* Header Banner from Video 01:57 */}
      <div className="p-6 rounded-3xl bg-[#101622] border border-[#1b2536] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Mic className="w-4 h-4 text-purple-400" />
          <span>SPEECH & TRANSCRIPT MARKETS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Mention polymarkets
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
          Live events where you can predict the specific words and phrases that will be
          said during speeches, podcasts, debates, and TV broadcasts.
        </p>
      </div>

      {/* Timeline of Events (Video 01:58 - 02:03) */}
      <div className="space-y-4">
        {MENTION_EVENTS.map((event) => (
          <div
            key={event.id}
            className="p-5 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#26374f] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left Date Badge & Title */}
            <div className="flex items-start gap-4">
              {/* Day / Month Block */}
              <div className="w-14 h-14 rounded-2xl bg-[#0b1018] border border-[#1b2536] flex flex-col items-center justify-center shrink-0">
                <span className="font-mono text-lg font-extrabold text-white leading-none">
                  {event.day}
                </span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                  {event.month}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono text-neutral-400">{event.timeInfo}</div>
                <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer">
                  {event.title}
                </h3>
              </div>
            </div>

            {/* Right: Words Pills & Trade CTA */}
            <div className="flex flex-wrap items-center gap-2">
              {event.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() =>
                    onSelectOutcome({
                      marketId: event.id,
                      outcomeName: opt.label,
                      price: 45,
                      side: 'yes',
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#141b27] hover:bg-[#1f2b3e] border border-[#222e40] text-xs font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>"{opt.label}"</span>
                  <span className="font-mono text-[11px] text-blue-400 font-bold">Trade</span>
                </button>
              ))}

              <span className="text-xs font-mono text-neutral-500 font-bold px-2">
                +{event.moreCount} more
              </span>

              <button
                onClick={() =>
                  onSelectOutcome({
                    marketId: event.id,
                    outcomeName: event.options[0]?.label || 'Mention',
                    price: 50,
                    side: 'yes',
                  })
                }
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer ml-1"
              >
                View all words
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
