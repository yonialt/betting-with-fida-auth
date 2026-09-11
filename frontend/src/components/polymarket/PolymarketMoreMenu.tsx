import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  Trophy,
  LayoutDashboard,
  Gift,
  Code,
  Moon,
  Sun,
  CheckCircle2,
  Radio,
  FileText,
  HelpCircle,
  Shield,
  Globe,
} from 'lucide-react';

interface PolymarketMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectOption?: (option: string) => void;
  /**
   * When provided, the menu is rendered through a portal on top of everything
   * (document.body) and positioned just under this anchor element. This lets the
   * popup escape the header's sticky stacking context / overflow so nothing can
   * cover or clip it.
   */
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}

export const PolymarketMoreMenu: React.FC<PolymarketMoreMenuProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  onSelectOption,
  anchorRef,
}) => {
  const usePortal = !!anchorRef;
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  // Position the portal menu right under the anchor button. useLayoutEffect keeps
  // it from flashing at the wrong spot, and we track scroll/resize so it stays put.
  useLayoutEffect(() => {
    if (!isOpen || !anchorRef) return;

    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const top = Math.round(r.bottom + 6);
      const right = Math.round(Math.max(8, window.innerWidth - r.right));
      setPos((prev) => (prev && prev.top === top && prev.right === right ? prev : { top, right }));
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const dropdown = (
    <div
      id="polymarket-more-dropdown"
      style={
        usePortal
          ? pos
            ? { position: 'fixed', top: pos.top, right: pos.right }
            : { position: 'fixed', top: -9999, left: -9999 }
          : undefined
      }
      className={`${usePortal ? '' : 'absolute right-4 top-full mt-1.5'} w-64 rounded-2xl shadow-2xl z-[9999] py-2.5 text-xs font-medium border animate-fadeIn transition-colors ${
        isDarkMode
          ? 'bg-[#101622] border-[#222d3f] text-neutral-200 divide-y divide-[#182232]'
          : 'bg-white border-neutral-200 text-neutral-800 divide-y divide-neutral-100 shadow-neutral-300/40'
      }`}
    >
      {/* Top Section */}
      <div className="py-1 px-1.5 space-y-0.5">
        <button
          onClick={() => {
            onSelectOption?.('Activity');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-200' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Activity</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Leaderboard');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-200' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Dashboards');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-200' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Dashboards</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Rewards');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-200' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Rewards</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('APIs');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-200' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
        >
          <Code className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>APIs</span>
        </button>
      </div>

      {/* Dark Mode Toggle Switch */}
      <div className="py-2 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="font-semibold">Dark mode</span>
        </div>

        <button
          id="polymarket-dark-mode-switch"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDarkMode();
          }}
          aria-label="Toggle dark mode"
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
            isDarkMode ? 'bg-blue-600 justify-end' : 'bg-neutral-300 justify-start'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
        </button>
      </div>

      {/* Informational Links */}
      <div className="py-1 px-1.5 space-y-0.5">
        <button
          onClick={() => {
            onSelectOption?.('Accuracy');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Accuracy</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Status');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Status</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Documentation');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Documentation</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Help Center');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Help Center</span>
        </button>

        <button
          onClick={() => {
            onSelectOption?.('Terms of Use');
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-[#182334] text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>Terms of Use</span>
        </button>
      </div>

      {/* Language Selection */}
      <div className="py-2 px-3 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" />
          <span>Language</span>
        </div>
        <span className="font-semibold text-neutral-300">English (US)</span>
      </div>
    </div>
  );

  const backdrop = (
    <div
      className={usePortal ? 'fixed inset-0 z-[9998]' : 'fixed inset-0 z-40'}
      onClick={onClose}
    />
  );

  if (usePortal) {
    return createPortal(
      <>
        {backdrop}
        {dropdown}
      </>,
      document.body,
    );
  }

  return (
    <>
      {backdrop}
      {dropdown}
    </>
  );
};
