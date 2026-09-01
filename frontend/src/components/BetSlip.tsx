import React from 'react';
import {
  Settings,
  Trash2,
  X,
  ChevronDown,
  Info,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { BetType, OddsAcceptanceMode } from '../types';

export const BetSlip: React.FC = () => {
  const {
    betSlip,
    placedBets,
    activeTabSlip,
    setActiveTabSlip,
    removeSelection,
    clearSlip,
    stakeAmount,
    setStakeAmount,
    betType,
    setBetType,
    oddsAcceptanceMode,
    setOddsAcceptanceMode,
    promoCode,
    setPromoCode,
    totalOdds,
    potentialWin,
    placeBet,
    cashoutBet,
    user,
    setLoginModalOpen,
  } = useBetting();

  const handleQuickAddStake = (amount: number) => {
    setStakeAmount((prev) => Math.max(1, +(prev + amount).toFixed(2)));
  };

  return (
    <aside
      id="bet-slip-panel"
      className="w-full lg:w-80 xl:w-96 bg-white border-l border-neutral-200 flex flex-col shrink-0 select-none shadow-xs h-full min-h-[500px]"
    >
      {/* Top Tabs: Bet Slip & My Bets */}
      <div className="flex items-center border-b border-neutral-200 bg-[#fbfcfd]">
        <button
          id="tab-bet-slip"
          onClick={() => setActiveTabSlip('slip')}
          className={`flex-1 py-2.5 px-3 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer relative transition-colors ${
            activeTabSlip === 'slip'
              ? 'text-black font-extrabold'
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <span>Bet slip</span>
          {betSlip.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#ffc600] text-black text-[10px] font-black flex items-center justify-center">
              {betSlip.length}
            </span>
          )}
          {activeTabSlip === 'slip' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ffc600]" />
          )}
        </button>

        <button
          id="tab-my-bets"
          onClick={() => setActiveTabSlip('mybets')}
          className={`flex-1 py-2.5 px-3 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer relative transition-colors ${
            activeTabSlip === 'mybets'
              ? 'text-black font-extrabold'
              : 'text-neutral-500 hover:text-black'
          }`}
        >
          <span>My bets</span>
          {placedBets.filter((b) => b.status === 'active').length > 0 && (
            <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-black flex items-center justify-center">
              {placedBets.filter((b) => b.status === 'active').length}
            </span>
          )}
          {activeTabSlip === 'mybets' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ffc600]" />
          )}
        </button>
      </div>

      {activeTabSlip === 'slip' ? (
        <div className="flex-1 flex flex-col justify-between p-3 overflow-y-auto">
          {/* Top Header of Bets list */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                YOUR BETS
              </span>
              <button
                className="text-neutral-400 hover:text-black transition-colors"
                title="Bet slip options"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Selections */}
            {betSlip.length === 0 ? (
              <div className="py-8 text-center text-neutral-400">
                <p className="text-xs font-medium">Your bet slip is empty</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Click any odds button to add a selection
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {betSlip.map((item) => (
                  <div
                    key={item.id}
                    id={`slip-item-${item.id}`}
                    className="bg-[#f8fafc] border border-neutral-200 rounded-sm p-2.5 relative group hover:border-neutral-300 transition-colors"
                  >
                    {/* Header info: LIVE pill, match code, remove X */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        {item.isLive && (
                          <span className="bg-[#ff4d4f] text-white text-[9px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                            LIVE
                          </span>
                        )}
                        <span className="text-neutral-500 font-medium truncate max-w-[190px]">
                          {item.matchCode}. {item.league}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSelection(item.id)}
                        className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                        title="Remove selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Match title */}
                    <div className="font-bold text-xs text-neutral-900 leading-tight">
                      {item.matchTitle} <span className="text-neutral-500 font-mono">[{item.currentScore}]</span>
                    </div>

                    {/* Selection outcome & odds */}
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#ffc600] text-black font-extrabold text-xs px-1.5 py-0.5 rounded-xs font-mono">
                          {item.odds}
                        </span>
                        <span className="text-xs font-bold text-neutral-800">
                          {item.marketName}: {item.selectionLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 truncate max-w-[100px]">
                        {item.selectionName}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Bet Type Dropdown & Clear Slip Trash */}
                <div className="flex items-center justify-between pt-1">
                  <div className="relative">
                    <select
                      id="select-bet-type"
                      value={betType}
                      onChange={(e) => setBetType(e.target.value as BetType)}
                      className="bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs font-semibold text-neutral-800 focus:outline-hidden focus:border-[#ffc600] cursor-pointer"
                    >
                      <option value="single">Single bet</option>
                      <option value="accumulator">Accumulator (Express)</option>
                      <option value="system">System (2/3)</option>
                    </select>
                  </div>

                  <button
                    id="btn-clear-slip"
                    onClick={clearSlip}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                    title="Clear bet slip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls: Overall Odds, Stake Amount, Quick Pills, Odds Change, Promo Code, Place Bet */}
          <div className="mt-4 pt-3 border-t border-neutral-200 space-y-3">
            {/* Overall Odds */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Overall odds</span>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm text-neutral-900 font-mono">
                  {totalOdds}
                </span>
                <Settings className="w-3 h-3 text-neutral-400" />
              </div>
            </div>

            {/* Stake Amount (ETB) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-600 font-medium">Stake amount ({user.currency})</span>
                <Settings className="w-3 h-3 text-neutral-400" />
              </div>

              {/* - / Input / + buttons */}
              <div className="flex items-center rounded border border-neutral-300 overflow-hidden bg-white">
                <button
                  id="btn-decrease-stake"
                  onClick={() => setStakeAmount((prev) => Math.max(1, +(prev - 10).toFixed(2)))}
                  className="w-10 h-8 flex items-center justify-center bg-[#f4f6f8] text-neutral-700 font-bold hover:bg-[#eaeef2] transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  id="input-stake-amount"
                  type="number"
                  min="1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Math.max(1, Number(e.target.value) || 0))}
                  className="flex-1 text-center font-mono font-bold text-sm text-neutral-900 py-1 focus:outline-hidden"
                />
                <button
                  id="btn-increase-stake"
                  onClick={() => setStakeAmount((prev) => +(prev + 10).toFixed(2))}
                  className="w-10 h-8 flex items-center justify-center bg-[#f4f6f8] text-neutral-700 font-bold hover:bg-[#eaeef2] transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Quick stake pills: +2.5, +100, +250 */}
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                <button
                  id="btn-quick-stake-2.5"
                  onClick={() => handleQuickAddStake(2.5)}
                  className="py-1 bg-[#f4f6f8] hover:bg-[#e8ecf0] text-neutral-800 text-[11px] font-bold rounded text-center transition-colors cursor-pointer"
                >
                  +2.5
                </button>
                <button
                  id="btn-quick-stake-100"
                  onClick={() => handleQuickAddStake(100)}
                  className="py-1 bg-[#f4f6f8] hover:bg-[#e8ecf0] text-neutral-800 text-[11px] font-bold rounded text-center transition-colors cursor-pointer"
                >
                  +100
                </button>
                <button
                  id="btn-quick-stake-250"
                  onClick={() => handleQuickAddStake(250)}
                  className="py-1 bg-[#f4f6f8] hover:bg-[#e8ecf0] text-neutral-800 text-[11px] font-bold rounded text-center transition-colors cursor-pointer"
                >
                  +250
                </button>
              </div>

              {/* Maximum stake & Potential Win */}
              <div className="flex items-center justify-between text-[11px] mt-1.5">
                <span className="text-neutral-500">Maximum stake</span>
                <span className="font-mono font-bold text-[#ff9900]">24700000 {user.currency}</span>
              </div>

              {betSlip.length > 0 && (
                <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-dashed border-neutral-200">
                  <span className="text-neutral-700 font-bold">Potential win:</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">
                    {potentialWin} {user.currency}
                  </span>
                </div>
              )}
            </div>

            {/* When odds change dropdown */}
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">When odds change:</label>
              <div className="relative">
                <select
                  id="select-odds-change-mode"
                  value={oddsAcceptanceMode}
                  onChange={(e) => setOddsAcceptanceMode(e.target.value as OddsAcceptanceMode)}
                  className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden focus:border-[#ffc600] cursor-pointer"
                >
                  <option value="increase">Accept if odds increase</option>
                  <option value="any">Accept any odds changes</option>
                  <option value="ask">Always ask</option>
                </select>
              </div>
            </div>

            {/* Promo code input */}
            <div>
              <div className="relative flex items-center">
                <input
                  id="input-promo-code"
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#ffc600]"
                />
                {promoCode && (
                  <button
                    onClick={() => {
                      alert('Promo code applied: +10% Boost on Live Bets!');
                    }}
                    className="absolute right-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            {/* Big Yellow PLACE BET Button */}
            <button
              id="btn-place-bet"
              onClick={placeBet}
              disabled={betSlip.length === 0}
              className={`w-full py-2.5 rounded font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                betSlip.length > 0
                  ? 'bg-[#ffc600] hover:bg-[#f0ba00] active:scale-[0.98] text-black'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              PLACE BET
            </button>
          </div>
        </div>
      ) : (
        /* My Bets View */
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-800 uppercase">
              Placed Bets History ({placedBets.length})
            </span>
          </div>

          {placedBets.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs">
              No placed bets found yet.
            </div>
          ) : (
            placedBets.map((bet) => (
              <div
                key={bet.id}
                id={`placed-bet-${bet.id}`}
                className="bg-[#f8fafc] border border-neutral-200 rounded p-2.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-neutral-500 font-bold">{bet.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      bet.status === 'active'
                        ? 'bg-amber-100 text-amber-800'
                        : bet.status === 'won'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bet.status === 'cashed_out'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bet.status}
                  </span>
                </div>

                <div className="space-y-1">
                  {bet.items.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-[#ffc600] pl-2">
                      <div className="font-bold text-neutral-900">{item.matchTitle}</div>
                      <div className="text-[11px] text-neutral-600">
                        {item.marketName} · {item.selectionLabel} @ <span className="font-mono font-bold text-black">{item.odds}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-neutral-500">Stake: </span>
                    <span className="font-mono font-bold text-neutral-900">{bet.stake} {bet.currency}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Potential win: </span>
                    <span className="font-mono font-bold text-emerald-700">{bet.potentialWin} {bet.currency}</span>
                  </div>
                </div>

                {bet.status === 'active' && (
                  <button
                    onClick={() => cashoutBet(bet.id)}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Cashout ({bet.cashoutValue} {bet.currency})</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};
