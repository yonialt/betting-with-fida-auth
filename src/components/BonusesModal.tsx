import React from 'react';
import { X, Gift, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const BonusesModal: React.FC = () => {
  const { bonusesModalOpen, setBonusesModalOpen, user } = useBetting();

  if (!bonusesModalOpen) return null;

  const bonuses = [
    {
      id: 'b1',
      title: '100% First Deposit Bonus',
      desc: 'Double your initial deposit up to 10,000 ETB for live sports events.',
      reward: 'Up to 10,000 ETB',
      claimed: true,
    },
    {
      id: 'b2',
      title: 'Accumulator of the Day (+10% Odds Boost)',
      desc: 'Place bets on selected daily accumulators and get an instant 10% profit multiplier.',
      reward: '+10% Boost',
      claimed: false,
    },
    {
      id: 'b3',
      title: 'VIP Cashback & Crystal Loyalty',
      desc: 'Earn loyalty points and weekly cashback for every settled live bet.',
      reward: '5% Weekly Cashback',
      claimed: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div
        id="bonuses-modal"
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-neutral-200"
      >
        <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#ffc600]" />
            <h3 className="font-bold text-sm">Promotions & Bonus Offers</h3>
          </div>
          <button
            onClick={() => setBonusesModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {bonuses.map((b) => (
            <div
              key={b.id}
              className="bg-[#f8fafc] border border-neutral-200 rounded-lg p-3 space-y-2 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900">{b.title}</h4>
                  <p className="text-xs text-neutral-600 mt-0.5">{b.desc}</p>
                </div>
                <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-2 py-0.5 rounded-full shrink-0 font-mono">
                  {b.reward}
                </span>
              </div>

              <div className="flex items-center justify-end pt-1">
                {b.claimed ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active on Account</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      alert(`Bonus "${b.title}" activated!`);
                      setBonusesModalOpen(false);
                    }}
                    className="px-3 py-1 bg-[#ffc600] hover:bg-[#f0ba00] text-black font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Claim Bonus</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
