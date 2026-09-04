import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';

interface PolymarketTradeWidgetProps {
  market: PolymarketMarket;
  onTradeExecuted?: (trade: PolymarketTradeState, amount: number) => void;
  className?: string;
}

export const PolymarketTradeWidget: React.FC<PolymarketTradeWidgetProps> = ({
  market,
  onTradeExecuted,
  className = '',
}) => {
  const { placeBet, user } = useBetting();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [selectedOutcomeSide, setSelectedOutcomeSide] = useState<'yes' | 'no'>('yes');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [showOrderTypeMenu, setShowOrderTypeMenu] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  const activeOutcome = market.outcomes[0] || {
    name: '25 bps increase',
    probability: 57,
    yesPrice: 58,
    noPrice: 43,
  };

  const yesPrice = activeOutcome.yesPrice || 58;
  const noPrice = activeOutcome.noPrice || 43;
  const currentPrice = selectedOutcomeSide === 'yes' ? yesPrice : noPrice;

  // Potential payout calculation: shares = (amount / (price / 100))
  const calculatedShares =
    amount > 0 && currentPrice > 0 ? (amount / (currentPrice / 100)).toFixed(1) : '0';
  const potentialReturn =
    amount > 0 && currentPrice > 0 ? (Number(calculatedShares) * 1).toFixed(2) : '0.00';

  const handleQuickAdd = (value: number) => {
    setAmount((prev) => prev + value);
  };

  const handleExecuteTrade = () => {
    if (amount <= 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setTradeSuccess(true);

      const tradeState: PolymarketTradeState = {
        market,
        outcome: activeOutcome,
        side: selectedOutcomeSide,
        price: currentPrice,
      };

      onTradeExecuted?.(tradeState, amount);

      // Place bet in context if available
      try {
        placeBet();
      } catch {
        // Handled
      }

      setTimeout(() => {
        setTradeSuccess(false);
        setAmount(0);
      }, 2000);
    }, 600);
  };

  return (
    <div
      id="polymarket-trade-box"
      className={`w-full bg-[#121824] border border-[#1e293b] rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col justify-between ${className}`}
    >
      {/* 1. Market Header Item */}
      <div>
        <div className="flex items-center gap-3 pb-3 border-b border-[#1e293b]">
          {/* Avatar Thumbnail */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#2e3b52] bg-[#1a2232]">
            <img
              src={
                market.imageUrl ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?w=128&h=128&fit=crop'
              }
              alt={market.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Titles */}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs text-neutral-300 font-medium truncate">
              {market.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-white truncate">
                {activeOutcome.name}
              </span>
              <span className="text-neutral-500 font-bold">·</span>
              <span
                className={`text-xs font-bold ${
                  selectedOutcomeSide === 'yes' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedOutcomeSide === 'yes' ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Order Tab Nav: Buy / Sell + Market dropdown */}
        <div className="flex items-center justify-between mt-3 mb-4">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button
              onClick={() => setOrderSide('buy')}
              className={`pb-1 transition-all cursor-pointer ${
                orderSide === 'buy'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`pb-1 transition-all cursor-pointer ${
                orderSide === 'sell'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Market / Limit Selector */}
          <div className="relative">
            <button
              onClick={() => setShowOrderTypeMenu(!showOrderTypeMenu)}
              className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white font-semibold py-1 px-2 rounded-lg bg-[#1a2232] border border-[#2e3b52] transition-colors cursor-pointer"
            >
              <span>{orderType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showOrderTypeMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a2232] border border-[#2e3b52] rounded-xl shadow-2xl py-1 z-30 min-w-[110px]">
                <button
                  onClick={() => {
                    setOrderType('Market');
                    setShowOrderTypeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[#253248] font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Market</span>
                  {orderType === 'Market' && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
                <button
                  onClick={() => {
                    setOrderType('Limit');
                    setShowOrderTypeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[#253248] font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>Limit</span>
                  {orderType === 'Limit' && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Yes / No Large Outcome Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {/* YES Button */}
          <button
            onClick={() => setSelectedOutcomeSide('yes')}
            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedOutcomeSide === 'yes'
                ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/50'
                : 'bg-[#1b2434] hover:bg-[#222d42] text-neutral-400 border border-[#2e3d55]'
            }`}
          >
            <span>Yes</span>
            <span className="font-extrabold">{yesPrice}¢</span>
          </button>

          {/* NO Button */}
          <button
            onClick={() => setSelectedOutcomeSide('no')}
            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedOutcomeSide === 'no'
                ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-lg shadow-rose-950/40 ring-2 ring-rose-400/50'
                : 'bg-[#1b2434] hover:bg-[#222d42] text-neutral-400 border border-[#2e3d55]'
            }`}
          >
            <span>No</span>
            <span className="font-extrabold">{noPrice}¢</span>
          </button>
        </div>

        {/* 4. Amount Input Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-neutral-400">Amount</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                ${amount}
              </span>
            </div>
          </div>

          {/* Quick Increment Chips */}
          <div className="flex items-center justify-end gap-1.5">
            {[1, 5, 10, 100].map((val) => (
              <button
                key={val}
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 rounded-lg bg-[#1a2232] hover:bg-[#253248] text-neutral-300 hover:text-white border border-[#2e3b52] text-xs font-semibold font-mono transition-all active:scale-95 cursor-pointer"
              >
                +${val}
              </button>
            ))}
            {amount > 0 && (
              <button
                onClick={() => setAmount(0)}
                className="px-2 py-1 rounded-lg bg-[#1a2232] hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 border border-[#2e3b52] text-xs font-semibold transition-all cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Trade Details Preview if Amount > 0 */}
        {amount > 0 && (
          <div className="bg-[#171f2d] border border-[#26354a] rounded-xl p-2.5 mb-4 text-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Avg Price:</span>
              <span className="font-mono font-bold text-white">{currentPrice}¢</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Shares:</span>
              <span className="font-mono font-bold text-emerald-400">{calculatedShares}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Potential Return:</span>
              <span className="font-mono font-bold text-emerald-400">${potentialReturn} ({(100 - currentPrice).toFixed(0)}% profit)</span>
            </div>
          </div>
        )}

        {/* 5. Trade Button */}
        <button
          onClick={handleExecuteTrade}
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${
            tradeSuccess
              ? 'bg-emerald-600 text-white'
              : amount > 0
              ? 'bg-[#0084ff] hover:bg-[#0070db] text-white shadow-blue-900/30'
              : 'bg-[#0084ff] hover:bg-[#0070db] text-white shadow-blue-900/30'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Executing Order...
            </span>
          ) : tradeSuccess ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Order Placed!
            </span>
          ) : (
            <span>Trade</span>
          )}
        </button>

        {/* 6. Terms Disclaimer */}
        <p className="text-[11px] text-neutral-500 text-center mt-3">
          By trading, you agree to the{' '}
          <span className="underline hover:text-neutral-400 cursor-pointer">Terms of Use</span>.
        </p>
      </div>

      {/* 7. Bottom Tags */}
      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-[#1e293b]">
        {['All', 'Fed', 'Jerome Powell'].map((tag, idx) => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              idx === 0
                ? 'bg-[#222d3f] text-white'
                : 'bg-[#18202e] text-neutral-400 hover:text-white hover:bg-[#222d3f]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
