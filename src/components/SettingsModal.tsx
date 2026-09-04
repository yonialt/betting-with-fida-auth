import React from 'react';
import { X, Settings, Check } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const SettingsModal: React.FC = () => {
  const { settingsModalOpen, setSettingsModalOpen, oddsAcceptanceMode, setOddsAcceptanceMode } = useBetting();

  if (!settingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div
        id="settings-modal"
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-neutral-200"
      >
        <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#ffc600]" />
            <h3 className="font-bold text-sm">Betting & Interface Settings</h3>
          </div>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Odds Format */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-800 block">Odds Format</label>
            <select
              defaultValue="decimal"
              className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs text-neutral-800 focus:outline-hidden focus:border-[#ffc600]"
            >
              <option value="decimal">Decimal (e.g. 1.85)</option>
              <option value="fractional">Fractional (e.g. 17/20)</option>
              <option value="american">American (e.g. -118)</option>
              <option value="hongkong">Hong Kong (e.g. 0.85)</option>
              <option value="malay">Malay (e.g. 0.85)</option>
              <option value="indonesian">Indonesian (e.g. -1.18)</option>
            </select>
          </div>

          {/* Odds Acceptance */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-800 block">Automatic Odds Acceptance</label>
            <select
              value={oddsAcceptanceMode}
              onChange={(e) => setOddsAcceptanceMode(e.target.value as any)}
              className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs text-neutral-800 focus:outline-hidden focus:border-[#ffc600]"
            >
              <option value="increase">Accept if odds increase only</option>
              <option value="any">Accept any odds change automatically</option>
              <option value="ask">Always ask confirmation on odds change</option>
            </select>
          </div>

          {/* Quick Bet Default */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-800 block">Default Quick Stake Amount</label>
            <input
              type="number"
              defaultValue="50"
              className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs font-mono font-bold text-neutral-800 focus:outline-hidden focus:border-[#ffc600]"
            />
          </div>

          {/* Sound & Notifications */}
          <div className="space-y-2 pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#ffc600] focus:ring-[#ffc600]" />
              <span className="text-neutral-700 font-medium">Play sound on live score goals and wins</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#ffc600] focus:ring-[#ffc600]" />
              <span className="text-neutral-700 font-medium">Highlight live odds fluctuations (Green / Red)</span>
            </label>
          </div>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="w-full py-2 bg-[#ffc600] hover:bg-[#f0ba00] text-black font-extrabold text-xs rounded transition-colors uppercase tracking-wider"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
