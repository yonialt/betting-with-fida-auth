import React from 'react';
import {
  Gamepad2,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { SportId } from '../types';

interface SportItem {
  id: SportId;
  label: string;
  icon: string;
}

export const SportFilterBar: React.FC = () => {
  const {
    activeSport,
    setActiveSport,
  } = useBetting();

  const sports: SportItem[] = [
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
    { id: 'ice-hockey', label: 'Ice Hockey', icon: '🏒' },
    { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
    { id: 'table-tennis', label: 'Table Tennis', icon: '🏓' },
    { id: 'cricket', label: 'Cricket', icon: '🏏' },
  ];

  return (
    <div
      id="sports-filter-bar"
      className="w-full bg-[#163b63] border-b border-[#102d4d] px-2 sm:px-3 py-1 flex items-center gap-2 text-xs select-none text-white"
    >
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sports List */}
        <div className="flex items-center gap-1 sm:gap-2">
          {sports.map((s) => {
            const isSelected = activeSport === s.id;
            return (
              <button
                key={s.id}
                id={`sport-filter-${s.id}`}
                onClick={() => setActiveSport(isSelected ? 'all' : s.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#1e4d80] text-white font-bold'
                    : 'text-neutral-200 hover:text-white hover:bg-[#1a4473]'
                }`}
              >
                <span className="text-xs">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Dropdowns: Menu & Esports */}
      <div className="flex items-center gap-1 shrink-0 text-neutral-300">
        <button
          id="btn-filter-more"
          className="flex items-center gap-0.5 px-1.5 py-1 hover:bg-[#1a4473] rounded text-neutral-200 hover:text-white transition-colors cursor-pointer"
          title="More filters"
        >
          <Menu className="w-3.5 h-3.5" />
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          id="btn-filter-esports"
          onClick={() => setActiveSport(activeSport === 'esports' ? 'all' : 'esports')}
          className={`flex items-center gap-0.5 px-1.5 py-1 rounded transition-colors cursor-pointer ${
            activeSport === 'esports'
              ? 'bg-[#1e4d80] text-white font-bold'
              : 'hover:bg-[#1a4473] text-neutral-200 hover:text-white'
          }`}
          title="Esports"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
