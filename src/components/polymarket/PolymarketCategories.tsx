import React, { useRef } from 'react';
import { TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { POLYMARKET_CATEGORIES, PolymarketCategoryItem } from '../../data/polymarketData';

interface PolymarketCategoriesProps {
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
}

export const PolymarketCategories: React.FC<PolymarketCategoriesProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <nav
      id="polymarket-categories-bar"
      aria-label="Polymarket category navigation"
      className="w-full bg-[#090d14] border-b border-[#181f2c] text-white select-none relative z-30"
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-[40px] flex items-center justify-between gap-2 relative">
        {/* Scrollable category links */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
        >
          {POLYMARKET_CATEGORIES.map((item) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={item.id}
                  className="h-3.5 w-px bg-[#263244] shrink-0 mx-0.5"
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
                className={`flex items-center gap-1.5 whitespace-nowrap text-[13px] sm:text-[13.5px] transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-white font-bold tracking-tight'
                    : 'text-[#8e9eb3] hover:text-white font-medium'
                }`}
              >
                {item.type === 'icon' && renderItemIcon(item.iconType)}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Far-Right Arrow Button matching screenshot ('>') */}
        <div className="flex items-center pl-2 shrink-0 bg-gradient-to-l from-[#090d14] via-[#090d14] to-transparent">
          <button
            onClick={handleScrollRight}
            className="w-7 h-7 flex items-center justify-center text-[#8e9eb3] hover:text-white hover:bg-[#141b27] rounded-md transition-colors cursor-pointer"
            title="Scroll categories right"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
