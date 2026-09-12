import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Clock,
  Search,
  CheckCircle2,
  TrendingUp,
  Share2,
  Bookmark,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { PolymarketTradeState } from '../../../types/polymarket';

interface PolymarketMidtermsViewProps {
  onBack: () => void;
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}

interface SenateSeat {
  id: number;
  party: 'D' | 'R' | 'I';
  state: string;
  candidate: string;
  incumbent: boolean;
  margin: string;
  x: number;
  y: number;
}

export const PolymarketMidtermsView: React.FC<PolymarketMidtermsViewProps> = ({
  onBack,
  onSelectOutcome,
  isDarkMode = true,
}) => {
  // Live Countdown (57 DAYS 02 HOURS 47 MINUTES 17 SECONDS)
  const [timeLeft, setTimeLeft] = useState({
    days: 57,
    hours: 2,
    minutes: 47,
    seconds: 17,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeChamber, setActiveChamber] = useState<'senate' | 'house'>('senate');
  const [selectedSeat, setSelectedSeat] = useState<SenateSeat | null>(null);
  const [tradeAmount, setTradeAmount] = useState<string>('100');
  const [selectedSide, setSelectedSide] = useState<'Democrat' | 'Republican'>('Democrat');
  const [tradeExecuted, setTradeExecuted] = useState<boolean>(false);

  // Generate 100 Senate seats arranged in a parliamentary semi-circle hemisphere:
  // 48 Republican on the left (Red), 52 Democratic on the right (Blue)
  const senateSeats: SenateSeat[] = [];
  const rows = [16, 22, 28, 34]; // total 100
  let seatCounter = 0;

  const states = [
    'PA', 'MI', 'WI', 'NV', 'AZ', 'GA', 'NC', 'TX', 'FL', 'OH',
    'MT', 'WV', 'ME', 'NE', 'IN', 'MO', 'NM', 'VA', 'MN', 'NH',
  ];

  rows.forEach((seatCountInRow, rowIdx) => {
    const radius = 100 + rowIdx * 35;
    for (let i = 0; i < seatCountInRow; i++) {
      seatCounter++;
      // Angle from 180 (left) to 0 (right) in radians
      const angle = Math.PI - (i / (seatCountInRow - 1)) * Math.PI;
      const x = 250 + Math.cos(angle) * radius;
      const y = 230 - Math.sin(angle) * radius;

      const isRepublican = i < seatCountInRow / 2;
      const party = isRepublican ? 'R' : 'D';
      const state = states[seatCounter % states.length];

      senateSeats.push({
        id: seatCounter,
        party,
        state,
        candidate: party === 'D' ? `${state} Democrat` : `${state} Republican`,
        incumbent: seatCounter % 3 === 0,
        margin: party === 'D' ? `+${(Math.random() * 4 + 1).toFixed(1)}%` : `+${(Math.random() * 5 + 1).toFixed(1)}%`,
        x,
        y,
      });
    }
  });

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141b27] hover:bg-[#1e2738] border border-[#222c3d] text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Markets</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>UPDATED SEP 1, 2026 3:00 PM ET</span>
        </div>
      </div>

      {/* Hero Header from Video 00:58 */}
      <div className="p-6 rounded-3xl bg-[#101622] border border-[#1b2536] space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
              <span>POLITICS</span>
              <span>·</span>
              <span className="text-blue-400 font-bold">2026 US ELECTIONS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              2026 Midterm Election Odds & Predictions
            </h1>
          </div>

          {/* Countdown Clock (Video 00:59) */}
          <div className="flex items-center gap-2 bg-[#0b1018] px-4 py-2.5 rounded-2xl border border-[#1f2a3a] font-mono text-xs">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-neutral-200">
              {timeLeft.days} DAYS {String(timeLeft.hours).padStart(2, '0')} HOURS{' '}
              {String(timeLeft.minutes).padStart(2, '0')} MINS{' '}
              {String(timeLeft.seconds).padStart(2, '0')} SECS
            </span>
          </div>
        </div>

        {/* 52% Chance Democrats Headline */}
        <div className="pt-4 border-t border-[#1b2536] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-blue-400">
              52%
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                chance Democrats take the Senate
              </div>
              <div className="text-xs text-neutral-400">
                48 Republican Seats vs 52 Democratic Seats projected
              </div>
            </div>
          </div>

          {/* Chamber Toggle Pills */}
          <div className="flex items-center gap-2 bg-[#0b1018] p-1 rounded-xl border border-[#1d2738]">
            <button
              onClick={() => setActiveChamber('senate')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeChamber === 'senate'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Senate (52% DEM)
            </button>
            <button
              onClick={() => setActiveChamber('house')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeChamber === 'house'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              House (88% DEM)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Visualizer on Left (8 cols), Trade Widget on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Senate Hemisphere Visualizer */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#101622] border border-[#1b2536] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Senate Chamber Projection</span>
              <span className="text-xs text-neutral-400 font-normal">
                (Click any seat to inspect)
              </span>
            </h2>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                48 Rep
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                52 Dem
              </span>
            </div>
          </div>

          {/* Semi-Circle SVG */}
          <div className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center">
            <svg
              viewBox="0 0 500 270"
              className="w-full h-full max-w-xl select-none"
            >
              {/* Divider centerline */}
              <line
                x1="250"
                y1="10"
                x2="250"
                y2="230"
                stroke="#1f2c3f"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* 100 Seat Dots */}
              {senateSeats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id;
                const fill =
                  seat.party === 'R' ? '#ef4444' : '#3b82f6';

                return (
                  <circle
                    key={seat.id}
                    cx={seat.x}
                    cy={seat.y}
                    r={isSelected ? 6.5 : 4.5}
                    fill={fill}
                    stroke={isSelected ? '#ffffff' : '#0b1018'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => setSelectedSeat(seat)}
                  />
                );
              })}

              {/* Center Podium Label */}
              <text
                x="250"
                y="245"
                fill="#64748b"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="bold"
              >
                51 NEEDED FOR MAJORITY
              </text>
            </svg>
          </div>

          {/* Seat Inspector Detail Box */}
          {selectedSeat ? (
            <div className="p-4 rounded-2xl bg-[#0b1018] border border-[#1f2c40] flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-400 font-mono">
                  Selected Race · {selectedSeat.state} Senate Seat
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedSeat.candidate}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Margin: {selectedSeat.margin} {selectedSeat.party === 'D' ? 'DEM' : 'GOP'}
                </div>
              </div>
              <button
                onClick={() =>
                  onSelectOutcome({
                    marketId: `senate-${selectedSeat.state}`,
                    outcomeName: `${selectedSeat.state} ${selectedSeat.party}`,
                    price: selectedSeat.party === 'D' ? 52 : 48,
                    side: 'yes',
                  })
                }
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Trade {selectedSeat.state} Race
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#0b1018] border border-[#1a2434] text-xs text-neutral-400 text-center">
              Hover or click on any seat in the chamber to preview state polling and trading odds
            </div>
          )}
        </div>

        {/* Right Sidebar: Midterm Trade Box (matching video 01:02) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#101622] border border-[#1b2536] space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Trade Senate Majority</h3>
            <div className="text-xs text-neutral-400 mt-0.5">
              Trade 100 ETB → 194 ETB (+0% past 7d · 4K ETB vol)
            </div>
          </div>

          {/* Party Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0b1018] border border-[#1b2536]">
            <button
              onClick={() => setSelectedSide('Democrat')}
              className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSide === 'Democrat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Democrat 52%
            </button>
            <button
              onClick={() => setSelectedSide('Republican')}
              className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSide === 'Republican'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Republican 48%
            </button>
          </div>

          {/* Amount presets */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Amount</span>
              <span className="font-mono">100 ETB preset</span>
            </div>
            <div className="flex items-center px-3 py-2 rounded-xl bg-[#0b1018] border border-[#1f2c40]">
              <span className="text-neutral-400 font-mono text-sm mr-2">$</span>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full bg-transparent font-mono text-white text-base outline-hidden font-bold"
              />
            </div>

            <div className="flex gap-1.5 pt-1">
              {['25', '50', '100', '250', '500'].map((val) => (
                <button
                  key={val}
                  onClick={() => setTradeAmount(val)}
                  className="flex-1 py-1 rounded-lg bg-[#141b27] hover:bg-[#1d2738] border border-[#222e40] text-[11px] font-mono text-neutral-300 font-semibold cursor-pointer"
                >
                  {val} ETB
                </button>
              ))}
            </div>
          </div>

          {/* Payout calculation */}
          <div className="p-3 rounded-xl bg-[#0b1018] border border-[#1b2536] space-y-2 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Avg Price</span>
              <span className="font-mono text-white">
                {selectedSide === 'Democrat' ? '51.5%' : '48.5%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shares</span>
              <span className="font-mono text-white">
                {Math.round((parseFloat(tradeAmount) || 0) / (selectedSide === 'Democrat' ? 0.515 : 0.485))}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-neutral-200 pt-2 border-t border-[#1b2536]">
              <span>Potential Return</span>
              <span className="font-mono text-emerald-400">
                {((parseFloat(tradeAmount) || 0) * (1 / (selectedSide === 'Democrat' ? 0.515 : 0.485))).toFixed(2)} ETB
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={() => {
              setTradeExecuted(true);
              setTimeout(() => setTradeExecuted(false), 2500);
            }}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              selectedSide === 'Democrat'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
            }`}
          >
            {tradeExecuted ? 'Order Executed!' : `Buy ${selectedSide} Senate`}
          </button>
        </div>
      </div>
    </div>
  );
};
