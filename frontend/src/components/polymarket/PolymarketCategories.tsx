import React, { useRef, useState } from 'react';
import { TrendingUp, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { POLYMARKET_CATEGORIES, PolymarketCategoryItem } from '../../data/polymarketData';
import { PolymarketMoreMenu } from './PolymarketMoreMenu';
import { useBetting } from '../../context/BettingContext';
import { t } from '../../data/polymarketTranslations';

interface PolymarketCategoriesProps {
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onSelectMoreOption?: (opt: string) => void;
}

export const PolymarketCategories: React.FC<PolymarketCategoriesProps> = ({
  activeCategory,
  setActiveCategory,
  isDarkMode = false,
  onToggleDarkMode,
  onSelectMoreOption,
}) => {
  const { language, setAppMode, polymarketDarkMode, togglePolymarketDarkMode } = useBetting();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const getCategoryLabel = (id: string, name: string) => {
    if (language === 'en') return name;
    const catTranslations: Record<string, string> = {
      trending: 'ወቅታዊ',
      ethiopia: 'ኢትዮጵያ',
      politics: 'ፖለቲካ',
      crypto: 'ክሪፕቶ',
      weather: 'የአየር ሁኔታ',
      elections: 'ምርጫዎች',
      mentions: 'መጥቀሶች',
      combos: 'ጥምር',
      perps: 'ዘላቂ ንግድ',
      breaking: 'ሰበር ዜና',
      new: 'አዲስ',
      sports: 'ስፖርት',
      'pop-culture': 'ባህልና መዝናኛ',
      art: 'ጥበብ',
      business: 'ቢዝነስና ኢኮኖሚ',
      science: 'ሳይንስ',
      fomc: 'የወለድ ምጣኔ',
    };
    return catTranslations[id.toLowerCase()] || catTranslations[name.toLowerCase()] || name;
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
    }
  };

  const renderItemIcon = (iconType?: 'trending' | 'combos' | 'perps') => {
    switch (iconType) {
      case 'trending':
        return <TrendingUp className="w-3.5 h-3.5 shrink-0" />;
      case 'combos':
        return (
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="7" y="2" width="13" height="15" rx="2" />
            <path d="M4 7v13a2 2 0 0 0 2 2h11" />
          </svg>
        );
      case 'perps':
        return (
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 3v3M9 15v6M6 6h6v9H6zM18 3v6M18 17v4M15 9h6v8h-6z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full bg-white border-b pl-[118px] sm:pl-[128px] lg:pl-[140px] pr-3 sm:pr-4 lg:pr-6 py-1.5 select-none"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#ffffff',
      }}
    >
      <nav
        id="polymarket-categories-bar"
        aria-label="Polymarket category navigation"
        className="w-full flex items-center justify-between gap-1 sm:gap-2 text-[12px] sm:text-[13px] font-extrabold"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Left Chevron (visible when scrolled right) */}
        {canScrollLeft && (
          <button
            onClick={handleScrollLeft}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 shrink-0"
            title="Scroll categories left"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable category links */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
          style={{
            backgroundColor: '#ffffff',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {POLYMARKET_CATEGORIES.map((item) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={item.id}
                  className="h-3.5 w-px shrink-0 mx-0.5 bg-neutral-200"
                  aria-hidden="true"
                />
              );
            }

            const isActive = activeCategory.toLowerCase() === item.id.toLowerCase();

            return (
              <button
                key={item.id}
                id={`cat-${item.id}`}
                onClick={() => setActiveCategory(item.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1 rounded transition-all whitespace-nowrap cursor-pointer text-[12px] sm:text-[13px] ${
                  isActive
                    ? 'bg-[#1b2838] text-white shadow-xs font-black'
                    : 'text-neutral-700 hover:text-emerald-600 hover:bg-neutral-100/70 font-extrabold'
                }`}
              >
                {item.type === 'icon' && renderItemIcon(item.iconType)}
                <span>{getCategoryLabel(item.id, item.name)}</span>
              </button>
            );
          })}

        </div>

        {/* Far-Right: Scroll button & Symmetrical SPORTS LIVE button mirroring Header.tsx */}
        <div className="flex items-center gap-1.5 pl-2 shrink-0 bg-gradient-to-l from-white via-white to-transparent">
          <button
            onClick={handleScrollRight}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100"
            title="Scroll categories right"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Symmetrical CTA Button mirroring the POLYMARKET LIVE button in Header.tsx */}
          <button
            id="nav-sportsbook-live-cta"
            onClick={() => {
              setAppMode('1xbet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black hover:opacity-95 transition-all uppercase tracking-tight shadow-xs active:scale-95 cursor-pointer shrink-0 ml-auto"
            title="Return to Hagerawi Sportsbook"
          >
            <span className="font-extrabold tracking-tight hidden sm:inline">SPORTS</span>
            <span className="bg-[#ffc600] text-black text-[9px] px-1 py-0.2 rounded font-black tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              LIVE
            </span>
          </button>
        </div>

      </nav>
    </div>
  );
};
