import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { PolymarketHeader } from './PolymarketHeader';
import { PolymarketCategories } from './PolymarketCategories';
import { PolymarketHeroCard } from './PolymarketHeroCard';
import { PolymarketRightSidebar } from './PolymarketRightSidebar';
import { PolymarketAllMarketsGrid } from './PolymarketAllMarketsGrid';
import { PolymarketTradeModal } from './PolymarketTradeModal';
import { PolymarketFooter } from './PolymarketFooter';
import { PolymarketChat } from './PolymarketChat';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';

export const PolymarketPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('trending');
  const [activeViewTab, setActiveViewTab] = useState<'featured' | 'all'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTrade, setActiveTrade] = useState<PolymarketTradeState | null>(null);
  const [floatingChatOpen, setFloatingChatOpen] = useState<boolean>(false);
  const [selectedMarketForChat, setSelectedMarketForChat] = useState<PolymarketMarket | null>(null);

  const handleSelectOutcome = (trade: PolymarketTradeState) => {
    setActiveTrade(trade);
  };

  const handleOpenPerps = () => {
    setActiveCategory('perps');
    setActiveViewTab('all');
  };

  const handleOpenCombos = () => {
    setActiveCategory('combos');
    setActiveViewTab('all');
  };

  const handleSelectTopic = (topicName: string) => {
    if (topicName === 'All') {
      setActiveViewTab('all');
      setSearchQuery('');
    } else {
      setSearchQuery(topicName);
      setActiveViewTab('all');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0a0d14] text-white flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white relative">
      {/* 1. Main Polymarket Header */}
      <PolymarketHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeViewTab={activeViewTab}
        setActiveViewTab={setActiveViewTab}
        onToggleChat={() => setFloatingChatOpen(!floatingChatOpen)}
        chatOpen={floatingChatOpen}
      />

      {/* 2. Category Carousel Filter Bar */}
      <PolymarketCategories
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          if (cat === 'combos' || cat === 'perps') {
            setActiveViewTab('all');
          }
        }}
      />

      {/* 3. Main Polymarket Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        {activeViewTab === 'featured' ? (
          <>
            {/* Top Featured Row: Hero Card (Left) + Right Sidebar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Hero Prediction Card (Fed Decision in September) */}
              <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9">
                <PolymarketHeroCard onSelectOutcome={handleSelectOutcome} />
              </div>

              {/* Right Sidebar Widget: Trade Box ("Sid Box") + Tabs */}
              <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
                <PolymarketRightSidebar
                  onOpenPerps={handleOpenPerps}
                  onOpenCombos={handleOpenCombos}
                  onSelectTopic={handleSelectTopic}
                  selectedMarket={selectedMarketForChat}
                  onSelectOutcome={handleSelectOutcome}
                />
              </div>
            </div>

            {/* Bottom: All Markets Grid Section */}
            <div className="mt-4 pt-8 border-t border-[#1e293b]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  All Prediction Markets
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  Real-time Settlement
                </span>
              </div>
              <PolymarketAllMarketsGrid
                onSelectOutcome={handleSelectOutcome}
                searchFilter={searchQuery}
              />
            </div>
          </>
        ) : (
          /* All Markets View Grid */
          <div className="w-full">
            <PolymarketAllMarketsGrid
              onSelectOutcome={handleSelectOutcome}
              searchFilter={searchQuery}
            />
          </div>
        )}
      </main>

      {/* Floating Chat Trollbox (Bottom Right Popup on any tab/view) */}
      {floatingChatOpen && (
        <div
          id="floating-polymarket-chat-drawer"
          className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] max-w-[440px] shadow-2xl rounded-2xl overflow-hidden animate-slideUp border border-[#2e3b52] bg-[#121824]"
        >
          <div className="relative">
            <button
              onClick={() => setFloatingChatOpen(false)}
              className="absolute top-2.5 right-12 z-20 p-1 text-neutral-400 hover:text-white rounded bg-[#1e293b]/80 backdrop-blur-xs transition-colors cursor-pointer"
              title="Close floating chat"
            >
              <X className="w-4 h-4" />
            </button>
            <PolymarketChat
              selectedMarket={selectedMarketForChat}
              onTradeClick={handleSelectOutcome}
              compact={false}
            />
          </div>
        </div>
      )}

      {/* Floating Chat Quick Button (Bottom Right) */}
      {!floatingChatOpen && (
        <button
          id="btn-floating-chat-open"
          onClick={() => setFloatingChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-[#0084ff] hover:bg-[#0070db] text-white font-extrabold px-4 py-3 rounded-full shadow-2xl shadow-blue-900/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30"
          title="Open Polymarket Trollbox & Live Chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">Live Chat</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Trade Execution Modal */}
      <PolymarketTradeModal
        trade={activeTrade}
        onClose={() => setActiveTrade(null)}
      />

      {/* Polymarket Footer */}
      <PolymarketFooter />
    </div>
  );
};
