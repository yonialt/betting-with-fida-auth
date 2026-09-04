import React, { useState } from 'react';
import { X, CheckCircle, TrendingUp, AlertCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';

interface PolymarketTradeModalProps {
  trade: PolymarketTradeState | null;
  onClose: () => void;
}

export const PolymarketTradeModal: React.FC<PolymarketTradeModalProps> = ({
  trade,
  onClose,
}) => {
  const { user } = useBetting();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>(
    trade?.side === 'no' ? 'no' : 'yes'
  );
  const [amount, setAmount] = useState<string>('50');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!trade || !trade.market) return null;

  const currentPriceCents =
    selectedSide === 'yes'
      ? trade.outcome?.yesPrice || trade.price || 50
      : trade.outcome?.noPrice || 100 - (trade.price || 50);

  const priceInDollars = currentPriceCents / 100;
  const numAmount = parseFloat(amount) || 0;
  const shares = priceInDollars > 0 ? (numAmount / priceInDollars).toFixed(1) : '0';
  const potentialPayout = (parseFloat(shares) * 1.0).toFixed(2);
  const returnPercentage =
    priceInDollars > 0 ? (((1 - priceInDollars) / priceInDollars) * 100).toFixed(0) : '0';

  const handlePlaceOrder = () => {
    if (numAmount <= 0) return;
    setIsSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md text-neutral-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {trade.market.category} Prediction
            </div>
            <h3 className="font-bold text-sm text-neutral-900 mt-0.5 line-clamp-2">
              {trade.market.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-neutral-900">Order Executed!</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              Successfully bought {shares} {selectedSide.toUpperCase()} shares for ${numAmount}.
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Outcome Target */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-700 font-semibold">
                Outcome: <strong className="text-neutral-900">{trade.outcome?.name}</strong>
              </span>
              <span className="text-xs font-mono font-bold text-blue-600">
                {trade.outcome?.probability}% chance
              </span>
            </div>

            {/* Buy / Sell & Yes / No Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedSide('yes')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                  selectedSide === 'yes'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                <span>Buy YES</span>
                <span className="text-[11px] font-mono opacity-90">{trade.outcome?.yesPrice || 50}¢</span>
              </button>

              <button
                onClick={() => setSelectedSide('no')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                  selectedSide === 'no'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                <span>Buy NO</span>
                <span className="text-[11px] font-mono opacity-90">{trade.outcome?.noPrice || 50}¢</span>
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <label className="font-semibold text-neutral-700">Amount (USD)</label>
                <span>Balance: $14,500.00</span>
              </div>

              <div className="relative">
                <DollarSign className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-500 rounded-xl pl-9 pr-14 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
                <button
                  onClick={() => setAmount('100')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-neutral-200 hover:bg-neutral-300 text-blue-700 px-2 py-1 rounded cursor-pointer"
                >
                  MAX
                </button>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2">
                {['$10', '$25', '$50', '$100', '$250'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setAmount(chip.replace('$', ''))}
                    className="flex-1 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-[11px] font-semibold rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Summary */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex flex-col gap-1.5 text-xs text-neutral-600">
              <div className="flex items-center justify-between">
                <span>Avg Price:</span>
                <span className="font-mono text-neutral-900 font-bold">{currentPriceCents}¢</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shares:</span>
                <span className="font-mono text-neutral-900 font-bold">{shares}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Potential Return:</span>
                <span className="font-mono text-emerald-600 font-bold">
                  +${(parseFloat(potentialPayout) - numAmount).toFixed(2)} ({returnPercentage}%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-neutral-200 font-bold text-neutral-900">
                <span>Total Payout:</span>
                <span className="font-mono text-emerald-600 text-sm">${potentialPayout}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={numAmount <= 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer ${
                selectedSide === 'yes'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              Buy {selectedSide.toUpperCase()} for ${numAmount}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
