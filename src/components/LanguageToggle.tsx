import React from 'react';
import { Languages } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  compact = false,
}) => {
  const { language, setLanguage } = useBetting();

  return (
    <div
      id="btn-language-toggle"
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center p-0.5 rounded-lg bg-[#0d141f] border border-[#223147] shadow-inner select-none ${className}`}
      title={language === 'am' ? 'Switch to English' : 'ወደ አማርኛ ይቀይሩ'}
    >
      {/* Amharic Option */}
      <button
        type="button"
        id="btn-lang-amharic"
        onClick={() => setLanguage('am')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
          language === 'am'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-neutral-400 hover:text-white hover:bg-[#162030]'
        }`}
      >
        <span className="text-xs leading-none">🇪🇹</span>
        <span>{compact ? 'አማ' : 'አማርኛ'}</span>
      </button>

      {/* English Option */}
      <button
        type="button"
        id="btn-lang-english"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-neutral-400 hover:text-white hover:bg-[#162030]'
        }`}
      >
        <span className="text-xs leading-none">🇬🇧</span>
        <span>{compact ? 'EN' : 'ENG'}</span>
      </button>
    </div>
  );
};
