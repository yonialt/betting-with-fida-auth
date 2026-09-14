import React, { useState } from 'react';
import {
  COMBOS_LIVE_MATCHES,
  CombosLiveMatch,
} from '../../../data/polymarketExtendedData';
import { PolymarketTradeState } from '../../../types/polymarket';
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

export const PolymarketCombosView: React.FC<{ isDarkMode?: boolean; onSelectOutcome?: (trade: PolymarketTradeState) => void }> = ({
  isDarkMode = true,
  onSelectOutcome,
}) => {
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

  const filteredMatches = COMBOS_LIVE_MATCHES;

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">


        {/* Center: Live Combos Matches Table - empty (no active matches) */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Combos Live</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                NO MATCHES
              </span>
            </h2>

            <div className="text-xs text-neutral-400">
              No live combos matches available right now
            </div>
          </div>

          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#161f2e] text-neutral-400 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="mt-4 text-sm text-neutral-300">
              Check back later for live sports and esports combo opportunities
            </div>
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
