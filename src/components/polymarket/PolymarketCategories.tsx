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
  isDarkMode = true,
  onToggleDarkMode,
  onSelectMoreOption,
}) => {
  const { language } = useBetting();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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
      className={`w-full border-b select-none relative z-30 transition-colors ${
        isDarkMode
          ? 'bg-[#090d14] border-[#181f2c] text-white'
          : 'bg-white border-neutral-200 text-neutral-800'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-[42px] flex items-center justify-between gap-2 relative">
        {/* Scrollable category links */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 sm:gap-4.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
        >
          {POLYMARKET_CATEGORIES.map((item) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={item.id}
                  className={`h-3.5 w-px shrink-0 mx-0.5 ${
                    isDarkMode ? 'bg-[#263244]' : 'bg-neutral-300'
                  }`}
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
                    ? isDarkMode
                      ? 'text-white font-bold tracking-tight'
                      : 'text-neutral-900 font-bold tracking-tight'
                    : isDarkMode
                    ? 'text-[#8e9eb3] hover:text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 font-medium'
                }`}
              >
                {item.type === 'icon' && renderItemIcon(item.iconType)}
                <span>{getCategoryLabel(item.id, item.name)}</span>
              </button>
            );
          })}

          {/* More v button matching video 02:31 */}
          <button
            id="cat-more-dropdown-btn"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex items-center gap-1 whitespace-nowrap text-[13px] sm:text-[13.5px] transition-colors cursor-pointer py-1 font-medium ${
              moreMenuOpen
                ? isDarkMode
                  ? 'text-white font-bold'
                  : 'text-neutral-900 font-bold'
                : isDarkMode
                ? 'text-[#8e9eb3] hover:text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>{language === 'am' ? 'ተጨማሪ' : 'More'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Far-Right Arrow Button matching video ('>') */}
        <div
          className={`flex items-center pl-2 shrink-0 ${
            isDarkMode
              ? 'bg-gradient-to-l from-[#090d14] via-[#090d14] to-transparent'
              : 'bg-gradient-to-l from-white via-white to-transparent'
          }`}
        >
          <button
            onClick={handleScrollRight}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#8e9eb3] hover:text-white hover:bg-[#141b27]'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Scroll categories right"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* More dropdown popup */}
        <PolymarketMoreMenu
          isOpen={moreMenuOpen}
          onClose={() => setMoreMenuOpen(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => onToggleDarkMode?.()}
          onSelectOption={(opt) => {
            onSelectMoreOption?.(opt);
            setMoreMenuOpen(false);
          }}
        />
      </div>
    </nav>
  );
};
