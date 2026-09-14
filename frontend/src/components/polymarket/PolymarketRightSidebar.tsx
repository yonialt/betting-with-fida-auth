import React, { useState } from 'react';
import {
  Zap,
  Flame,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { POLYMARKET_HOT_TOPICS, POLYMARKET_HERO, marketLogoUrl } from '../../data/polymarketData';
import { heroSlideLogoUrl, HERO_CAROUSEL_SLIDES } from '../../data/polymarketExtendedData';
import { PolymarketChat } from './PolymarketChat';
import { PolymarketTradeWidget } from './PolymarketTradeWidget';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { formatBirrVolume } from '../../data/polymarketTranslations';

interface PolymarketRightSidebarProps {
  onOpenPerps: () => void;
  onOpenCombos: () => void;
  onSelectTopic: (topicName: string) => void;
  selectedMarket?: PolymarketMarket | null;
  onSelectOutcome?: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}

export const PolymarketRightSidebar: React.FC<PolymarketRightSidebarProps> = ({
  onOpenPerps,
  onOpenCombos,
  onSelectTopic,
  selectedMarket,
  onSelectOutcome,
}) => {
  // Theme comes from context: the sidebar lives in the body scope, so the
  // pm-body CSS handles light-mode colors. Flag exposed for native theming
  // of the chart, which draws its own canvas colors.
  const { polymarketDarkMode } = useBetting();
  const { language } = useBetting();
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<'trade' | 'chat' | 'topics'>('trade');
  
  // Default market: Addis Ababa legal administrative status change before 2029
  const addisAbabaLegalMarket: PolymarketMarket = {
    id: 'eth-addis-federal-city',
    title: "Will Addis Ababa's legal administrative status officially change before 2029?",
    category: 'Politics',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    volume: '14.7M ETB Vol',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 38, yesPrice: 38, noPrice: 62 },
      { name: 'No', probability: 62, yesPrice: 62, noPrice: 38 },
    ],
    marketOpened: 'Jan 1, 2029',
    resolverAddress: 'UMA 0x9fc47De9D...',
    logoUrl: heroSlideLogoUrl['eth-addis-federal-city'],
  };
  
  const displayMarket = selectedMarket || addisAbabaLegalMarket;

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
          <span>{language === 'am' ? 'ቀጥታ ውይይት' : 'Live Chat'}</span>
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
          <span>{language === 'am' ? 'ተወዳጅ ርዕሶች' : 'Hot Topics'}</span>
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
              <span>{language === 'am' ? 'ተወዳጅ ርዕሶች' : 'Hot topics'}</span>
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
                  {topic.icon && (
                    <span className="text-base leading-none">{topic.icon}</span>
                  )}
                  <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                    {topic.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">
                    {formatBirrVolume(topic.volume, language)}
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
            {language === 'am' ? 'ሁሉንም አስስ' : 'Explore all'}
          </button>
        </div>
      )}
    </div>
  );
};
