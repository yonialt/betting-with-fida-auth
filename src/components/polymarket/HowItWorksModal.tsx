import React from 'react';
import { X, ArrowRight, ShieldCheck, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignUp?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenSignUp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl bg-[#0e1420] border border-[#222d42] rounded-2xl shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c263a] bg-[#0a0e17]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0066ff] flex items-center justify-center text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 2.5L21.5 8V16L12 21.5L2.5 16V8L12 2.5Z" />
                <path d="M12 2.5V21.5" />
                <path d="M2.5 8L21.5 16" />
                <path d="M2.5 16L21.5 8" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                How Polymarket Works
              </h2>
              <p className="text-xs text-[#8e9eb3]">
                The world's largest real-time prediction market
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#161e2e] hover:bg-[#202b40] text-[#8e9eb3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#121927] border border-[#1d273a]">
            <div className="w-9 h-9 rounded-full bg-[#1b263b] text-[#38bdf8] flex items-center justify-center font-bold text-sm shrink-0 border border-[#2b3a56]">
              1
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Prices reflect real-time probabilities
              </h3>
              <p className="text-[#8e9eb3] text-xs leading-relaxed">
                Shares trade between <span className="text-white font-semibold">$0.00</span> and{' '}
                <span className="text-white font-semibold">$1.00</span>. If a "Yes" share costs{' '}
                <span className="text-[#38bdf8] font-semibold">57¢</span>, the market sees a{' '}
                <span className="text-[#38bdf8] font-semibold">57%</span> chance of that event occurring.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#121927] border border-[#1d273a]">
            <div className="w-9 h-9 rounded-full bg-[#1b263b] text-[#22c55e] flex items-center justify-center font-bold text-sm shrink-0 border border-[#2b3a56]">
              2
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Buy Yes or No shares
              </h3>
              <p className="text-[#8e9eb3] text-xs leading-relaxed">
                Take a position by buying shares based on your analysis. If you believe an outcome will happen, buy{' '}
                <span className="text-emerald-400 font-semibold">Yes</span>. If you think it won't, buy{' '}
                <span className="text-rose-400 font-semibold">No</span>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#121927] border border-[#1d273a]">
            <div className="w-9 h-9 rounded-full bg-[#1b263b] text-[#f59e0b] flex items-center justify-center font-bold text-sm shrink-0 border border-[#2b3a56]">
              3
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Trade anytime or hold to resolution
              </h3>
              <p className="text-[#8e9eb3] text-xs leading-relaxed">
                You don't need to wait until the end. You can sell your shares at any time if the price moves in your favor to lock in profit, or hold until the market resolves for{' '}
                <span className="text-white font-semibold">$1.00</span> per winning share.
              </p>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-[#0b0f17] border border-[#1a2334] text-center">
              <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <div className="font-bold text-xs text-white">USDC Settlement</div>
              <div className="text-[11px] text-[#718299] mt-0.5">Instant deposits & withdrawals</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0b0f17] border border-[#1a2334] text-center">
              <TrendingUp className="w-5 h-5 text-[#38bdf8] mx-auto mb-1.5" />
              <div className="font-bold text-xs text-white">Live Order Books</div>
              <div className="text-[11px] text-[#718299] mt-0.5">Deep liquidity & narrow spreads</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0b0f17] border border-[#1a2334] text-center">
              <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
              <div className="font-bold text-xs text-white">Transparent Resolution</div>
              <div className="text-[11px] text-[#718299] mt-0.5">UMA Oracle verification</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1c263a] bg-[#0a0e17] flex items-center justify-between">
          <div className="text-xs text-[#718299]">
            Over <span className="text-white font-bold">$3.2 Billion</span> traded
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#8e9eb3] hover:text-white hover:bg-[#161e2e] transition-colors cursor-pointer"
            >
              Got it
            </button>
            {onOpenSignUp && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSignUp();
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0066ff] hover:bg-[#1a75ff] text-white flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <span>Start Trading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
