import React, { useState } from 'react';
import {
  Globe,
  Calendar,
  ChevronRight,
  ExternalLink,
  MapPin,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { PolymarketTradeState } from '../../../types/polymarket';

interface ElectionPin {
  id: string;
  country: string;
  flag: string;
  election: string;
  date: string;
  x: number; // percentage in svg
  y: number;
  leadingParty: string;
  prob: string;
}

export const PolymarketElectionsView: React.FC<{
  onOpenMidterms: () => void;
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onOpenMidterms, onSelectOutcome, isDarkMode = true }) => {
  const [activeMonth, setActiveMonth] = useState<string>('All');
  const [selectedPin, setSelectedPin] = useState<ElectionPin | null>(null);

  const months = [
    'All', 'Ethiopia 🇪🇹', 'Africa', 'Americas', 'Europe', 'Asia', 'Middle East',
  ];

  const electionCategories = [
    { name: 'All', count: '3.2K' },
    { name: 'Ethiopia 🇪🇹', count: '280' },
    { name: 'Africa', count: '420' },
    { name: 'Americas', count: '510' },
    { name: 'Europe', count: '380' },
    { name: 'Asia', count: '290' },
    { name: 'Middle East', count: '180' },
    { name: 'Oceania', count: '120' },
  ];

  const electionPins: ElectionPin[] = [
    { id: 'et', country: 'Ethiopia', flag: '🇪🇹', election: 'National Elections', date: '2027 (expected)', x: 545, y: 245, leadingParty: 'Prosperity Party', prob: '72%' },
    { id: 'et-regional', country: 'Ethiopia', flag: '🇪🇹', election: 'Regional State Council Elections', date: '2026-2027', x: 535, y: 235, leadingParty: 'TBD', prob: '50%' },
    { id: 'et-reform', country: 'Ethiopia', flag: '🇪🇹', election: 'Constitutional Reform Referendum', date: 'Before 2027', x: 555, y: 255, leadingParty: 'Reform Pass', prob: '38%' },
    { id: 'so', country: 'Somalia', flag: '🇸🇴', election: 'Parliamentary Elections', date: '2026-2027', x: 580, y: 250, leadingParty: 'TBD', prob: '45%' },
    { id: 'ke', country: 'Kenya', flag: '🇰🇪', election: 'General Elections', date: 'Aug 2027', x: 565, y: 260, leadingParty: 'UDA Coalition', prob: '48%' },
    { id: 'ng', country: 'Nigeria', flag: '🇳🇬', election: 'Presidential Election', date: 'Feb 2027', x: 490, y: 230, leadingParty: 'APC', prob: '42%' },
    { id: 'us', country: 'United States', flag: '🇺🇸', election: '2026 Midterm Elections', date: 'Nov 3, 2026', x: 230, y: 150, leadingParty: 'Democrats Senate', prob: '52%' },
    { id: 'br', country: 'Brazil', flag: '🇧🇷', election: 'Presidential General Election', date: 'Oct 4, 2026', x: 330, y: 280, leadingParty: 'Lula da Silva', prob: '55%' },
    { id: 'fr', country: 'France', flag: '🇫🇷', election: 'Presidential Election', date: 'Apr 2027', x: 490, y: 135, leadingParty: 'Marine Le Pen', prob: '42%' },
    { id: 'de', country: 'Germany', flag: '🇩🇪', election: 'Saxony-Anhalt Parliament', date: 'Sep 2026', x: 520, y: 125, leadingParty: 'AfD Vote Share', prob: '89%' },
    { id: 'il', country: 'Israel', flag: '🇮🇱', election: 'Knesset Legislative Election', date: 'Oct 2026', x: 575, y: 175, leadingParty: 'Benjamin Netanyahu', prob: '48%' },
    { id: 'ru', country: 'Russia', flag: '🇷🇺', election: 'Presidential Succession', date: 'Dec 2026', x: 670, y: 100, leadingParty: 'Putin In Power', prob: '86%' },
    { id: 'kr', country: 'South Korea', flag: '🇰🇷', election: 'National Assembly Election', date: 'Apr 2028', x: 800, y: 160, leadingParty: 'Democratic Party', prob: '61%' },
    { id: 'au', country: 'Australia', flag: '🇦🇺', election: 'Federal Election', date: 'May 2026', x: 820, y: 310, leadingParty: 'Labor Party', prob: '58%' },
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white space-y-6">
      {/* Top Header from Video 02:05 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Election Odds</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Global election predictions and timeline across over 40 democracies
          </p>
        </div>

        <button
          onClick={onOpenMidterms}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Trade on US Midterms</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Region Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {electionCategories.map((m) => (
          <button
            key={m.name}
            onClick={() => setActiveMonth(m.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeMonth === m.name
                ? 'bg-white text-neutral-950 font-bold'
                : 'bg-[#121824] hover:bg-[#1a2333] text-neutral-400 hover:text-white border border-[#1d2738]'
            }`}
          >
            {m.name} <span className="text-neutral-500 font-mono">({m.count})</span>
          </button>
        ))}
      </div>

      {/* World Map Interactive Visualizer (Video 02:07 - 02:24) */}
      <div className="p-6 rounded-3xl bg-[#101622] border border-[#1b2536] space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>GLOBAL ELECTIONS HEATMAP</span>
          </div>
          <span className="text-xs text-neutral-400">Click any country pin to inspect</span>
        </div>

        {/* SVG World Map Container */}
        <div className="relative w-full h-[320px] sm:h-[400px] bg-[#0b1018] rounded-2xl border border-[#1a2436] overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 960 420"
            className="w-full h-full select-none"
          >
            {/* World Landmass Simplified Silhouettes */}
            <path
              d="M 150,90 Q 200,60 270,70 Q 300,100 280,160 Q 250,190 190,170 Q 140,130 150,90 Z"
              fill="#182335"
            />
            {/* South America */}
            <path
              d="M 280,210 Q 340,220 350,280 Q 320,380 290,360 Q 260,280 280,210 Z"
              fill="#182335"
            />
            {/* Europe */}
            <path
              d="M 460,90 Q 550,80 540,150 Q 480,180 460,130 Z"
              fill="#182335"
            />
            {/* Africa */}
            <path
              d="M 480,180 Q 560,190 550,290 Q 500,340 470,250 Z"
              fill="#182335"
            />
            {/* Asia */}
            <path
              d="M 560,70 Q 820,60 840,160 Q 750,240 600,180 Z"
              fill="#182335"
            />
            {/* Australia */}
            <path
              d="M 780,280 Q 860,270 850,340 Q 790,350 780,280 Z"
              fill="#182335"
            />

            {/* Interactive Election Pins */}
            {electionPins.map((pin) => {
              const isSelected = selectedPin?.id === pin.id;
              return (
                <g
                  key={pin.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedPin(pin)}
                >
                  {/* Outer pulse circle */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={isSelected ? 14 : 9}
                    fill="#3b82f6"
                    opacity={isSelected ? 0.35 : 0.2}
                    className="animate-pulse"
                  />
                  {/* Pin core */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={isSelected ? 6 : 4.5}
                    fill={isSelected ? '#38bdf8' : '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Country Code Label */}
                  <text
                    x={pin.x}
                    y={pin.y - 12}
                    fill="#cbd5e1"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {pin.flag} {pin.country}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Selected Pin Info Box */}
          {selectedPin && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-2xl bg-[#101622]/95 backdrop-blur-md border border-[#223147] shadow-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{selectedPin.flag}</span>
                  <span>{selectedPin.country}</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {selectedPin.date}
                </span>
              </div>

              <div className="text-xs text-neutral-300 font-semibold">
                {selectedPin.election}
              </div>

              <div className="p-2.5 rounded-xl bg-[#0b1018] border border-[#1b2536] flex items-center justify-between text-xs">
                <span className="text-neutral-400">Frontrunner:</span>
                <span className="font-bold text-blue-400 font-mono">
                  {selectedPin.leadingParty} ({selectedPin.prob})
                </span>
              </div>

              <button
                onClick={() => {
                  if (selectedPin.id === 'us') onOpenMidterms();
                  else {
                    onSelectOutcome({
                      marketId: `election-${selectedPin.id}`,
                      outcomeName: selectedPin.leadingParty,
                      price: parseInt(selectedPin.prob),
                      side: 'yes',
                    });
                  }
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {selectedPin.id === 'us' ? 'Open Midterms Tracker' : 'Trade Election'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
