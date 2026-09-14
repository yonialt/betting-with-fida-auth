import React, { useState } from 'react';
import {
  MessageSquare,
  X,
} from 'lucide-react';
import { PolymarketHeader } from './PolymarketHeader';
import { PolymarketCategories } from './PolymarketCategories';
import { PolymarketHeroCard } from './PolymarketHeroCard';
import { PolymarketRightSidebar } from './PolymarketRightSidebar';
import { PolymarketAllMarketsGrid } from './PolymarketAllMarketsGrid';
import { PolymarketDetailView } from './PolymarketDetailView';
import { PolymarketTradeModal } from './PolymarketTradeModal';
import { PolymarketFooter } from './PolymarketFooter';
import { PolymarketChat } from './PolymarketChat';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { PolymarketCombosView } from './views/PolymarketCombosView';
import { PolymarketPerpsView } from './views/PolymarketPerpsView';
import { PolymarketBreakingView } from './views/PolymarketBreakingView';
import { PolymarketNewView } from './views/PolymarketNewView';
import { PolymarketPoliticsView } from './views/PolymarketPoliticsView';
import { PolymarketMidtermsView } from './views/PolymarketMidtermsView';
import { PolymarketCryptoView } from './views/PolymarketCryptoView';
import { PolymarketWeatherView } from './views/PolymarketWeatherView';
import { PolymarketMentionsView } from './views/PolymarketMentionsView';
import { PolymarketElectionsView } from './views/PolymarketElectionsView';
import { PolymarketArtView } from './views/PolymarketArtView';
import { PolymarketEsportsView } from './views/PolymarketEsportsView';
import { PolymarketEthiopiaView } from './views/PolymarketEthiopiaView';
import { PolymarketGeopoliticsView } from './views/PolymarketGeopoliticsView';
import { PolymarketTechView } from './views/PolymarketTechView';
import { PolymarketCultureView } from './views/PolymarketCultureView';
import { PolymarketEconomyView } from './views/PolymarketEconomyView';
import { HERO_CAROUSEL_SLIDES, HeroSlideItem } from '../../data/polymarketExtendedData';

// Build a tradeable market object from the current hero carousel slide, so the
// right-hand trade box always matches whichever slide is animating on the left.
const heroSlideToMarket = (slide: HeroSlideItem): PolymarketMarket => ({
  id: slide.id,
  title: slide.title,
  category: slide.category,
  subcategory: slide.subcategory,
  volume: slide.volume,
  displayType:
    slide.id === 'btc-up-down'
      ? 'up_down_btc'
      : slide.outcomes.length > 2
      ? 'multi_outcome'
      : 'binary_buttons',
  priceToBeat: slide.priceToBeat,
  currentPrice: slide.currentPrice,
  outcomes: slide.outcomes.map((o) => ({
    name: o.name,
    probability: o.probability,
    yesPrice: o.yesPrice ?? Math.round(o.probability),
    noPrice: o.noPrice ?? Math.round(100 - o.probability),
  })),
});

export const PolymarketPage: React.FC = () => {
  const { language, polymarketDarkMode, setAppMode, setBonusesModalOpen } = useBetting();
  const [activeCategory, setActiveCategory] = useState<string>('trending');
  const [activeViewTab, setActiveViewTab] = useState<'featured' | 'all'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTrade, setActiveTrade] = useState<PolymarketTradeState | null>(null);
  const [floatingChatOpen, setFloatingChatOpen] = useState<boolean>(false);
  const [selectedMarketForChat, setSelectedMarketForChat] = useState<PolymarketMarket | null>(null);
  const [selectedDetailMarket, setSelectedDetailMarket] = useState<PolymarketMarket | null>(null);
  const [showMidtermsView, setShowMidtermsView] = useState<boolean>(false);
  // Which hero-carousel slide is currently showing. Lifted here so the right-hand
  // trade box can follow the animated slide instead of staying on one market.
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const activeHeroMarket = heroSlideToMarket(
    HERO_CAROUSEL_SLIDES[heroSlideIndex] || HERO_CAROUSEL_SLIDES[0]
  );

  const handleSelectOutcome = (trade: PolymarketTradeState) => {
    setActiveTrade(trade);
  };

  const handleOpenDetail = (market: PolymarketMarket) => {
    setSelectedDetailMarket(market);
    setSelectedMarketForChat(market);
    setShowMidtermsView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPerps = () => {
    setActiveCategory('perps');
    setShowMidtermsView(false);
    setSelectedDetailMarket(null);
  };

  const handleOpenCombos = () => {
    setActiveCategory('combos');
    setShowMidtermsView(false);
    setSelectedDetailMarket(null);
  };

  const handleSelectTopic = (topicName: string) => {
    setSelectedDetailMarket(null);
    setShowMidtermsView(false);
    if (topicName === 'All') {
      setActiveViewTab('all');
      setSearchQuery('');
    } else {
      setSearchQuery(topicName);
      setActiveViewTab('all');
    }
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedDetailMarket(null);
    setShowMidtermsView(false);
    if (cat === 'midterms') {
      setShowMidtermsView(true);
    }
  };

  // Render view depending on category or special state
  const renderMainContent = () => {
    if (selectedDetailMarket) {
      return (
        <PolymarketDetailView
          market={selectedDetailMarket}
          onBack={() => setSelectedDetailMarket(null)}
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (showMidtermsView || activeCategory === 'midterms') {
      return (
        <PolymarketMidtermsView
          onBack={() => {
            setShowMidtermsView(false);
            setActiveCategory('politics');
          }}
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'combos') {
      return (
        <PolymarketCombosView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'perps') {
      return <PolymarketPerpsView isDarkMode={polymarketDarkMode} />;
    }

    if (activeCategory === 'breaking') {
      return (
        <PolymarketBreakingView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'new') {
      return (
        <PolymarketNewView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'ethiopia') {
      return (
        <PolymarketEthiopiaView
          onSelectOutcome={handleSelectOutcome}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (activeCategory === 'politics') {
      return (
        <PolymarketPoliticsView
          onSelectOutcome={handleSelectOutcome}
          onOpenDetail={handleOpenDetail}
          onOpenMidterms={() => setShowMidtermsView(true)}
        />
      );
    }

    if (activeCategory === 'crypto') {
      return (
        <PolymarketCryptoView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'weather') {
      return (
        <PolymarketWeatherView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'mentions') {
      return (
        <PolymarketMentionsView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'elections') {
      return (
        <PolymarketElectionsView
          onOpenMidterms={() => setShowMidtermsView(true)}
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'pop-culture' || activeCategory === 'art') {
      return (
        <PolymarketArtView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'esports') {
      return (
        <PolymarketEsportsView
          onSelectOutcome={handleSelectOutcome}
        />
      );
    }

    if (activeCategory === 'geopolitics') {
      return (
        <PolymarketGeopoliticsView
          onSelectOutcome={handleSelectOutcome}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (activeCategory === 'tech') {
      return (
        <PolymarketTechView
          onSelectOutcome={handleSelectOutcome}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (activeCategory === 'culture') {
      return (
        <PolymarketCultureView
          onSelectOutcome={handleSelectOutcome}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (activeCategory === 'economy') {
      return (
        <PolymarketEconomyView
          onSelectOutcome={handleSelectOutcome}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    // Default Featured vs All Views
    if (activeViewTab === 'featured') {
      return (
        <>
          {/* Top Featured Row: Hero Card (Left) + Right Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Hero Prediction Carousel Card */}
            <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9">
              <PolymarketHeroCard
                onSelectOutcome={handleSelectOutcome}
                onOpenDetail={handleOpenDetail}
                activeSlideIndex={heroSlideIndex}
                onSlideChange={(idx) => {
                  setHeroSlideIndex(idx);
                  setActiveTrade(null);
                }}
                isDarkMode={polymarketDarkMode}
              />
            </div>

            {/* Right Sidebar Widget: Trade Box + Tabs */}
            <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
              <PolymarketRightSidebar
                onOpenPerps={handleOpenPerps}
                onOpenCombos={handleOpenCombos}
                onSelectTopic={handleSelectTopic}
                selectedMarket={activeTrade?.market || activeHeroMarket}
                onSelectOutcome={handleSelectOutcome}
              />
            </div>
          </div>

          {/* Bottom: All Markets Grid Section */}
          <div className="mt-4">
            <PolymarketAllMarketsGrid
              onSelectOutcome={handleSelectOutcome}
              searchFilter={searchQuery}
              categoryFilter={activeCategory}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        </>
      );
    }

    return (
      <div className="w-full">
        <PolymarketAllMarketsGrid
          onSelectOutcome={handleSelectOutcome}
          searchFilter={searchQuery}
          categoryFilter={activeCategory}
          onOpenDetail={handleOpenDetail}
        />
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans antialiased relative ${
        polymarketDarkMode
          ? 'bg-[#0a0d14] text-white selection:bg-blue-600 selection:text-white'
          : 'bg-[#f8f9fb] text-[#1f2937] selection:bg-blue-600 selection:text-white'
      }`}
    >
      {/* 1. Main Polymarket Header (Navy Top Navbar + Second Categories Navbar + Fender Arch Logo) */}
      <PolymarketHeader
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q) {
            setSelectedDetailMarket(null);
            setShowMidtermsView(false);
          }
        }}
        activeViewTab={activeViewTab}
        setActiveViewTab={(tab) => {
          setActiveViewTab(tab);
          setSelectedDetailMarket(null);
        }}
        onToggleChat={() => setFloatingChatOpen(!floatingChatOpen)}
        chatOpen={floatingChatOpen}
        onOpenMarketDetail={handleOpenDetail}
        onSelectMoreOption={(option) => {
          if (option === 'Dashboards') {
            // Navigate to profile page
            window.history.pushState({}, '', '/profile');
            window.dispatchEvent(new PopStateEvent('popstate'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (option === 'Rewards') {
            setBonusesModalOpen(true);
          } else if (option === 'Documentation') {
            setBonusesModalOpen(true);
          } else if (option === 'Help Center') {
            setBonusesModalOpen(true);
          } else if (option === 'Terms of Use') {
            setBonusesModalOpen(true);
          } else if (option === 'Activity') {
            setBonusesModalOpen(true);
          } else if (option === 'Leaderboard') {
            setBonusesModalOpen(true);
          } else if (option === 'APIs') {
            // Coming soon - do nothing
          }
        }}
      >
        {/* 2. Category Carousel Filter Bar (Navbar 2) */}
        <PolymarketCategories
          activeCategory={activeCategory}
          setActiveCategory={handleCategoryChange}
        />
      </PolymarketHeader>

      {/* 3. Main Polymarket Content Area (body-only light-mode scope) */}
      <main className={`flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8 ${polymarketDarkMode ? '' : 'pm-body'}`}>
        {renderMainContent()}
      </main>

      {/* Floating Chat Trollbox (Bottom Right Popup on any tab/view) */}
      {floatingChatOpen && (
        <div
          id="floating-polymarket-chat-drawer"
          className={`fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] max-w-[440px] shadow-2xl rounded-2xl overflow-hidden animate-slideUp border ${
            polymarketDarkMode ? 'border-[#2e3b52] bg-[#121824]' : 'pm-body border-[#e2e5ea] bg-white'
          }`}
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
          <span className="text-xs">{language === 'am' ? 'ቀጥታ ውይይት' : 'Live Chat'}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Trade Execution Modal */}
      <div className={polymarketDarkMode ? '' : 'pm-body'}>
        <PolymarketTradeModal
          trade={activeTrade}
          onClose={() => setActiveTrade(null)}
        />
      </div>

      {/* Polymarket Footer (shared component) — intentionally NOT wrapped in
          pm-body, so it keeps its native dark theme in light mode too and looks
          identical in both modes (same as the sportsbook footer). */}
      <div>
        <PolymarketFooter />
      </div>
    </div>
  );
};
