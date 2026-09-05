import React, { useState } from 'react';
import {
  Zap,
  Flame,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { POLYMARKET_HOT_TOPICS, POLYMARKET_HERO } from '../../data/polymarketData';
import { PolymarketChat } from './PolymarketChat';
import { PolymarketTradeWidget } from './PolymarketTradeWidget';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';

interface PolymarketRightSidebarProps {
  onOpenPerps: () => void;
  onOpenCombos: () => void;
  onSelectTopic: (topicName: string) => void;
  selectedMarket?: PolymarketMarket | null;
  onSelectOutcome?: (trade: PolymarketTradeState) => void;
}

export const PolymarketRightSidebar: React.FC<PolymarketRightSidebarProps> = ({
  onOpenPerps,
  onOpenCombos,
  onSelectTopic,
  selectedMarket,
  onSelectOutcome,
}) => {
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<'trade' | 'chat' | 'topics'>('trade');
  const displayMarket = selectedMarket || POLYMARKET_HERO;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Main Primary Trade Box ("Sid Box" from screenshot) */}
      <PolymarketTradeWidget
        market={displayMarket}
        onTradeExecuted={(trade, amount) => {
          onSelectOutcome?.(trade);
        }}
      />

      {/* 2. Secondary Tabs: Live Chat & Hot Topics */}
      <div className="w-full bg-[#121824] border border-[#1e293b] rounded-xl p-1 flex items-center gap-1 shadow-md text-xs font-bold">
        <button
          onClick={() => setActiveSecondaryTab('chat')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSecondaryTab === 'chat'
              ? 'bg-[#0084ff] text-white shadow-xs font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-[#1a2334]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Chat</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
        </button>

        <button
          onClick={() => setActiveSecondaryTab('topics')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSecondaryTab === 'topics'
              ? 'bg-[#0084ff] text-white shadow-xs font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-[#1a2334]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Hot Topics</span>
        </button>

        <button
          onClick={onOpenPerps}
          className="flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-neutral-400 hover:text-white hover:bg-[#1a2334] transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Perps</span>
        </button>
      </div>

      {/* Tab Content: Live Chat */}
      {activeSecondaryTab === 'chat' && (
        <div className="rounded-2xl overflow-hidden border border-[#1e293b] shadow-xl">
          <PolymarketChat
            selectedMarket={displayMarket}
            onTradeClick={onSelectOutcome}
            compact={true}
          />
        </div>
      )}

      {/* Tab Content: Hot Topics */}
      {activeSecondaryTab === 'topics' && (
        <div className="w-full bg-[#121824] border border-[#1e293b] rounded-2xl p-4 text-white shadow-xl">
          <div className="flex items-center justify-between mb-3 cursor-pointer group">
            <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-200 group-hover:text-blue-400 transition-colors">
              <span>Hot topics</span>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#1e293b]">
            {POLYMARKET_HOT_TOPICS.map((topic) => (
              <div
                key={topic.name}
                onClick={() => onSelectTopic(topic.name)}
                className="py-2.5 flex items-center justify-between hover:bg-[#1a2334] -mx-2 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-neutral-500 w-3">
                    {topic.rank}
                  </span>
                  <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                    {topic.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">
                    {topic.volume}
                  </span>
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectTopic('All')}
            className="mt-3 w-full py-2 bg-[#1a2334] hover:bg-[#253248] text-neutral-200 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#2e3b52]"
          >
            Explore all
          </button>
        </div>
      )}
    </div>
  );
};
