import React, { useState } from 'react';
import { BREAKING_NEWS_ITEMS, BreakingNewsItem } from '../../../data/polymarketExtendedData';
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Mail,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Repeat2,
  Heart,
  Share2,
} from 'lucide-react';

interface PolymarketBreakingViewProps {
  onSelectOutcome?: (trade: { marketId: string; outcomeName: string; price: number; side: 'yes' | 'no' }) => void;
  isDarkMode?: boolean;
}

export const PolymarketBreakingView: React.FC<PolymarketBreakingViewProps> = ({
  onSelectOutcome,
  isDarkMode = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [emailSubscribed, setEmailSubscribed] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  const filterTabs = [
    'All',
    'Politics',
    'World',
    'Sports',
    'Crypto',
    'Finance',
    'Tech',
    'Culture',
  ];

  const filteredItems =
    activeCategory === 'All'
      ? BREAKING_NEWS_ITEMS
      : BREAKING_NEWS_ITEMS.filter((item) =>
          item.category.toLowerCase().includes(activeCategory.toLowerCase())
        );

  const mockTweets = [
    {
      handle: '@Polymarket',
      time: '1h',
      content:
        'BREAKING: Odds of CDU winning less than 20% second votes just spiked +87% following regional parliamentary election results.',
      retweets: 142,
      likes: 890,
    },
    {
      handle: '@Polymarket',
      time: '3h',
      content:
        'Apple Foldable iPhone rumors surge to 59% probability ahead of next week’s keynote event.',
      retweets: 98,
      likes: 642,
    },
    {
      handle: '@Polymarket',
      time: '5h',
      content:
        'F1 Italian Grand Prix: Kimi Antonelli probability hits 100% after dominant qualifying performance.',
      retweets: 310,
      likes: 1840,
    },
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left / Center Main Feed: 8 cols */}
        <div className="flex-1 w-full space-y-4">
          {/* Header Banner from Video 00:36 */}
          <div className="p-5 rounded-2xl bg-[#101622] border border-[#1b2536] flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span>Sep 6, 2026</span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">24H MOVERS</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Breaking News</span>
              </h1>
              <p className="text-xs text-neutral-400">
                See the polymarkets that moved the most in the last 24 hours
              </p>
            </div>

            {/* Red / Green Up-Down Graphic */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <ArrowDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === tab
                    ? 'bg-white text-neutral-950 font-bold'
                    : 'bg-[#121824] hover:bg-[#1a2333] text-neutral-400 hover:text-white border border-[#1d2738]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Ranked List of Mover Items (1-14+) */}
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.rank}
                onClick={() => {
                  if (onSelectOutcome) {
                    onSelectOutcome({
                      marketId: `breaking-${item.rank}`,
                      outcomeName: item.title,
                      price: item.probability,
                      side: item.isUp ? 'yes' : 'no',
                    });
                  }
                }}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] hover:bg-[#141d2d] transition-all flex items-center justify-between gap-4 group cursor-pointer"
              >
                {/* Rank number & Title */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <span className="font-mono text-base sm:text-lg font-bold text-neutral-500 w-6 text-center shrink-0">
                    {item.rank}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>{item.category}</span>
                      {item.badge && (
                        <>
                          <span>·</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-[#161f2e] text-neutral-300 font-mono text-[10px]">
                            {item.badge}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Probability, Delta & Sparkline */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Mini Sparkline */}
                  <div className="hidden sm:block w-16 h-7">
                    <svg viewBox="0 0 60 25" className="w-full h-full">
                      <path
                        d={
                          item.isUp
                            ? 'M 2 20 Q 20 18, 35 10 T 58 4'
                            : 'M 2 4 Q 20 8, 35 15 T 58 22'
                        }
                        fill="none"
                        stroke={item.isUp ? '#10b981' : '#ef4444'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Probability & Change */}
                  <div className="text-right font-mono min-w-[75px]">
                    <div className="text-sm sm:text-base font-bold text-white">
                      {item.probability}%
                    </div>
                    <div
                      className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                        item.isUp ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {item.isUp ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{item.change}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Daily Newsletter + Live Tweets (matching video 00:38) */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Newsletter Box */}
          <div className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Get daily updates</h3>
            </div>
            <p className="text-xs text-neutral-400">
              The top stories and biggest movers sent directly to your inbox every morning.
            </p>

            {emailSubscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium py-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (emailInput) setEmailSubscribed(true);
                }}
                className="space-y-2"
              >
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1018] border border-[#1f2a3a] text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Live From @Polymarket */}
          <div className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2536]">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <span className="text-neutral-400">𝕏</span>
                <span>Live from @Polymarket</span>
              </div>
              <a
                href="https://twitter.com/Polymarket"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              {mockTweets.map((tweet, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#0e131d] border border-[#1a2332] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-bold text-neutral-200">{tweet.handle}</span>
                    <span>{tweet.time}</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11.5px]">
                    {tweet.content}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1">
                    <span className="flex items-center gap-1 hover:text-neutral-300 cursor-pointer">
                      <Repeat2 className="w-3.5 h-3.5" />
                      {tweet.retweets}
                    </span>
                    <span className="flex items-center gap-1 hover:text-neutral-300 cursor-pointer">
                      <Heart className="w-3.5 h-3.5" />
                      {tweet.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
