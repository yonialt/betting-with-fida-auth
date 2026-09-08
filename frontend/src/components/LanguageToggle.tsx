import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBetting } from '../context/BettingContext';

interface LanguageToggleProps {
  className?: string;
  align?: 'left' | 'right';
  compact?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  align = 'right',
}) => {
  const { language, setLanguage } = useBetting();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    clearCloseTimeout();
    // Grace delay so moving cursor down to the popout doesn't cause flicker
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearCloseTimeout();
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (lang: 'am' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      id="language-toggle-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
    >
      {/* Globe Icon Button - only the world icon */}
      <button
        type="button"
        id="btn-language-globe"
        aria-label="Toggle language menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-neutral-300 hover:text-white bg-[#0f1722]/90 hover:bg-[#182436] border border-[#223147] hover:border-[#385175] transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex items-center justify-center group"
        title={language === 'am' ? 'ቋንቋ: አማርኛ (ቀይር)' : 'Language: English (Change)'}
      >
        <Globe className="w-4 h-4 text-neutral-300 group-hover:text-blue-400 group-hover:scale-105 transition-transform duration-200" />
        
        {/* Subtle dot indicator for current active language */}
        <span
          className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[#0d141f] transition-colors ${
            language === 'am' ? 'bg-emerald-400' : 'bg-blue-400'
          }`}
          title={language === 'am' ? 'አማርኛ' : 'English'}
        />
      </button>

      {/* Popout Menu revealing Amharic & English on cursor hover / focus / click */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="language-popout-menu"
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full mt-1.5 ${
              align === 'right' ? 'right-0' : 'left-0'
            } w-52 bg-[#0e1622] border border-[#23354c] rounded-xl shadow-2xl z-50 p-1.5 overflow-hidden backdrop-blur-md`}
          >
            {/* Header label */}
            <div className="px-2.5 py-1.5 border-b border-[#1b2738] mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>ቋንቋ / Language</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#182436] text-neutral-300 font-mono">
                {language === 'am' ? '🇪🇹 አማ' : '🇬🇧 EN'}
              </span>
            </div>

            {/* Amharic Option */}
            <button
              type="button"
              id="btn-lang-amharic"
              role="menuitem"
              onClick={() => handleSelect('am')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                language === 'am'
                  ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                  : 'text-neutral-300 hover:text-white hover:bg-[#162234] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">🇪🇹</span>
                <div className="flex flex-col">
                  <span className="leading-tight font-extrabold text-[13px]">አማርኛ</span>
                  <span className="text-[10px] font-medium text-neutral-400">Amharic</span>
                </div>
              </div>
              {language === 'am' && (
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* English Option */}
            <button
              type="button"
              id="btn-lang-english"
              role="menuitem"
              onClick={() => handleSelect('en')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-left mt-1 ${
                language === 'en'
                  ? 'bg-blue-500/15 text-white border border-blue-500/30'
                  : 'text-neutral-300 hover:text-white hover:bg-[#162234] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">🇬🇧</span>
                <div className="flex flex-col">
                  <span className="leading-tight font-extrabold text-[13px]">English</span>
                  <span className="text-[10px] font-medium text-neutral-400">እንግሊዝኛ</span>
                </div>
              </div>
              {language === 'en' && (
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
