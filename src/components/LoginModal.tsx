import React, { useState } from 'react';
import { X, Wallet, ArrowDownToLine, CheckCircle2, ShieldCheck, User, LogIn, UserPlus } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, user, depositFunds, openAuthModal } = useBetting();
  const [customAmount, setCustomAmount] = useState<string>('500');

  if (!loginModalOpen) return null;

  // Signed-out visitor opened the wallet modal → prompt them to log in first
  if (!user.isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
        <div
          id="login-account-modal"
          className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-neutral-200"
        >
          <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#ffc600]" />
              <span className="font-bold text-sm">Account & Wallet</span>
            </div>
            <button
              onClick={() => setLoginModalOpen(false)}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-neutral-600">
              Log in to view your account and wallet.<br />One account works for Sport Betting and Polymarket.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setLoginModalOpen(false); openAuthModal('login'); }}
                className="w-full py-2.5 bg-[#1e2329] hover:bg-black text-white font-bold text-sm rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> LOG IN
              </button>
              <button
                onClick={() => { setLoginModalOpen(false); openAuthModal('signup'); }}
                className="w-full py-2.5 bg-[#0091ff] hover:bg-[#007ad6] text-white font-bold text-sm rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> SIGN UP
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDeposit = (amount: number) => {
    depositFunds(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div
        id="login-account-modal"
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-neutral-200"
      >
        {/* Header */}
        <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-lg flex items-center">
              <span className="text-[#0091ff]">1x</span>
              <span className="text-[#ffc600]">BET</span>
            </div>
            <span className="text-xs text-neutral-400">Account & Wallet</span>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* User Profile Card */}
          <div className="bg-[#f8fafc] border border-neutral-200 rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffc600] text-black font-extrabold flex items-center justify-center text-sm shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-neutral-900">{user.username}</h4>
                <p className="text-xs text-neutral-500 font-mono">{user.userId}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-neutral-500 block">Main Balance</span>
              <span className="font-mono font-extrabold text-base text-emerald-700">
                {user.balance.toLocaleString()} {user.currency}
              </span>
            </div>
          </div>

          {/* Quick Deposit Section */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-neutral-700 uppercase tracking-tight flex items-center gap-1.5">
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Deposit</span>
            </h5>

            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 2000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleDeposit(amt)}
                  className="py-2 bg-[#f4f6f8] hover:bg-[#ffc600] hover:text-black text-neutral-800 font-bold text-xs rounded border border-neutral-300 transition-all cursor-pointer"
                >
                  +{amt} {user.currency}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 bg-white border border-neutral-300 rounded px-3 py-1.5 text-xs font-mono font-bold text-neutral-900 focus:outline-hidden focus:border-[#ffc600]"
                placeholder="Custom amount"
              />
              <button
                onClick={() => {
                  const val = Number(customAmount);
                  if (val > 0) handleDeposit(val);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded cursor-pointer transition-colors"
              >
                Deposit
              </button>
            </div>
          </div>

          {/* Verified security info */}
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-bit SSL encrypted & instant payout guaranteed</span>
          </div>

          <button
            onClick={() => setLoginModalOpen(false)}
            className="w-full py-2 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
