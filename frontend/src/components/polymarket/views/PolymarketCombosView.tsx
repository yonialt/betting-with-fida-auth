import React, { useState } from 'react';
import {
  COMBOS_SPORTS_CATEGORIES,
  COMBOS_LIVE_MATCHES,
  CombosLiveMatch,
} from '../../../data/polymarketExtendedData';
import {
  Trophy,
  Flame,
  Search,
  Check,
  X,
  Plus,
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SelectedPick {
  id: string;
  matchTitle: string;
  pickName: string;
  odds: string;
  numericMultiplier: number;
}

export const PolymarketCombosView: React.FC<{ isDarkMode?: boolean }> = ({
  isDarkMode = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPicks, setSelectedPicks] = useState<SelectedPick[]>([]);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const togglePick = (match: CombosLiveMatch, pickName: string, odds: string) => {
    const pickId = `${match.id}-${pickName}`;
    const exists = selectedPicks.find((p) => p.id === pickId);

    if (exists) {
      setSelectedPicks(selectedPicks.filter((p) => p.id !== pickId));
    } else {
      // Parse multiplier or percentage
      let mult = 1.85;
      if (odds.includes('X')) {
        mult = parseFloat(odds.replace('X', '')) || 1.85;
      } else if (odds.includes('%')) {
        const pct = parseFloat(odds.replace('%', '')) || 50;
        mult = 100 / Math.max(1, pct);
      }

      setSelectedPicks([
        ...selectedPicks,
        {
          id: pickId,
          matchTitle: `${match.team1.name} vs ${match.team2.name}`,
          pickName,
          odds,
          numericMultiplier: parseFloat(mult.toFixed(2)),
        },
      ]);
    }
  };

  const removePick = (id: string) => {
    setSelectedPicks(selectedPicks.filter((p) => p.id !== id));
  };

  // Calculate cumulative multiplier
  const totalMultiplier = selectedPicks.reduce((acc, p) => acc * p.numericMultiplier, 1);
  const potentialPayout = (parseFloat(betAmount) || 0) * (selectedPicks.length > 0 ? totalMultiplier : 0);

  const filteredMatches =
    activeCategory === 'all'
      ? COMBOS_LIVE_MATCHES
      : COMBOS_LIVE_MATCHES.filter((m) =>
          m.sport.toLowerCase().includes(activeCategory.toLowerCase())
        );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Sports Categories (matching video 00:22) */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Sports
          </div>

          <div className="space-y-0.5">
            {COMBOS_SPORTS_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a2536] text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#121926]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#223147] text-neutral-200' : 'text-neutral-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: Live Combos Matches Table */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Combos Live</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </h2>

            <div className="text-xs text-neutral-400">
              Parlay outcomes across games for multiplied returns
            </div>
          </div>

          {/* Table Header Row */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-neutral-400 border-b border-[#1b2536]">
            <div className="col-span-5">Event / Match</div>
            <div className="col-span-2 text-center">Moneyline</div>
            <div className="col-span-3 text-center">Spread</div>
            <div className="col-span-2 text-center">Total</div>
          </div>

          {/* Match rows */}
          <div className="space-y-3">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#26354d] transition-all"
              >
                {/* Match header info */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{match.league}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium">{match.status}</span>
                  </div>
                  <span className="font-mono text-neutral-500">{match.volume}</span>
                </div>

                {/* Match Interactive Grid */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Teams / Scores (5 cols) */}
                  <div className="col-span-5 space-y-2">
                    <div className="flex items-center justify-between pr-4">
                      <span className="text-sm font-bold text-white truncate">
                        {match.team1.name}
                      </span>
                      {match.team1.score !== undefined && (
                        <span className="font-mono text-sm font-bold text-neutral-300">
                          {match.team1.score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pr-4">
                      <span className="text-sm font-bold text-white truncate">
                        {match.team2.name}
                      </span>
                      {match.team2.score !== undefined && (
                        <span className="font-mono text-sm font-bold text-neutral-300">
                          {match.team2.score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Moneyline Buttons (2 cols) */}
                  <div className="col-span-2 space-y-1.5">
                    <button
                      onClick={() =>
                        togglePick(match, match.team1.name, match.moneyline.team1Odds)
                      }
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer border ${
                        selectedPicks.some(
                          (p) => p.id === `${match.id}-${match.team1.name}`
                        )
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#161f2e] border-[#222e42] hover:bg-[#1d2a3e] text-neutral-200'
                      }`}
                    >
                      {match.moneyline.team1Odds}
                    </button>
                    <button
                      onClick={() =>
                        togglePick(match, match.team2.name, match.moneyline.team2Odds)
                      }
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer border ${
                        selectedPicks.some(
                          (p) => p.id === `${match.id}-${match.team2.name}`
                        )
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#161f2e] border-[#222e42] hover:bg-[#1d2a3e] text-neutral-200'
                      }`}
                    >
                      {match.moneyline.team2Odds}
                    </button>
                  </div>

                  {/* Spread Buttons (3 cols) */}
                  <div className="col-span-3 space-y-1.5">
                    <button
                      onClick={() =>
                        togglePick(match, match.spread.label1, match.spread.odds1)
                      }
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border flex items-center justify-between ${
                        selectedPicks.some(
                          (p) => p.id === `${match.id}-${match.spread.label1}`
                        )
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#161f2e] border-[#222e42] hover:bg-[#1d2a3e] text-neutral-300'
                      }`}
                    >
                      <span>{match.spread.label1}</span>
                      <span className="font-bold">{match.spread.odds1}</span>
                    </button>
                    <button
                      onClick={() =>
                        togglePick(match, match.spread.label2, match.spread.odds2)
                      }
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border flex items-center justify-between ${
                        selectedPicks.some(
                          (p) => p.id === `${match.id}-${match.spread.label2}`
                        )
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#161f2e] border-[#222e42] hover:bg-[#1d2a3e] text-neutral-300'
                      }`}
                    >
                      <span>{match.spread.label2}</span>
                      <span className="font-bold">{match.spread.odds2}</span>
                    </button>
                  </div>

                  {/* Total Buttons (2 cols) */}
                  <div className="col-span-2 space-y-1.5">
                    <button
                      onClick={() =>
                        togglePick(match, match.total.label1, match.total.odds1)
                      }
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border flex items-center justify-between ${
                        selectedPicks.some(
                          (p) => p.id === `${match.id}-${match.total.label1}`
                        )
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#161f2e] border-[#222e42] hover:bg-[#1d2a3e] text-neutral-300'
                      }`}
                    >
                      <span>{match.total.label1}</span>
                      <span className="font-bold">{match.total.odds1}</span>
                    </button>
                    <button
                      onClick={() =>
                        togglePick(match, match.total.label2, match.total.odds2)
                      }
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer border flex items-center justify-between ${
                        selectedPicks.some(
                          (p) => p.id === `${match.id}-${match.total.label2}`
                        )
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#161f2e] border-[#222e42] hover:bg-[#1d2a3e] text-neutral-300'
                      }`}
                    >
                      <span>{match.total.label2}</span>
                      <span className="font-bold">{match.total.odds2}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Combo Slip (matching video 00:25) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20 rounded-2xl bg-[#101622] border border-[#1b2536] p-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2536] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Combo Ticket</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded-full font-bold">
                  {selectedPicks.length} {selectedPicks.length === 1 ? 'pick' : 'picks'}
                </span>
              </div>
              {selectedPicks.length > 0 && (
                <button
                  onClick={() => setSelectedPicks([])}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedPicks.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#161f2e] text-neutral-400 flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-200">Select 2+ picks</div>
                  <div className="text-xs text-neutral-400 mt-1 max-w-[200px] mx-auto">
                    Click any moneyline, spread, or total odd to build your combo
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* List of picks */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedPicks.map((pick) => (
                    <div
                      key={pick.id}
                      className="p-2.5 rounded-xl bg-[#141b27] border border-[#1e293a] flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {pick.pickName}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {pick.matchTitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          {pick.odds}
                        </span>
                        <button
                          onClick={() => removePick(pick.id)}
                          className="text-neutral-400 hover:text-white p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Multiplier and Payout summary */}
                <div className="pt-3 border-t border-[#1b2536] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Total Multiplier</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {totalMultiplier.toFixed(2)}x
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Stake Amount</span>
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-400">$</span>
                      <input
                        type="number"
                        min="1"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-20 px-2 py-1 rounded-lg bg-[#141b27] border border-[#222e42] text-right font-mono font-bold text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-bold text-sm pt-2 border-t border-[#1b2536]">
                    <span className="text-neutral-200">Potential Return</span>
                    <span className="font-mono text-emerald-400 text-base">
                      {potentialPayout.toFixed(2)} ETB
                    </span>
                  </div>
                </div>

                {/* Place Combo button */}
                <button
                  onClick={() => {
                    setIsSuccess(true);
                    setTimeout(() => setIsSuccess(false), 2500);
                  }}
                  disabled={selectedPicks.length < 2}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    selectedPicks.length >= 2
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                      : 'bg-[#1b2536] text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isSuccess ? 'Combo Order Placed!' : 'Place Combo Bet'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
