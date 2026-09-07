import React from 'react';
import { useBetting } from '../context/BettingContext';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, user, openAuthModal, placedBets } = useBetting();

  if (!loginModalOpen) return null;

  // Signed-out visitor opened the wallet modal → prompt them to log in first
  if (!user.isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
        <div
          id="login-account-modal"
          className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden border border-neutral-300"
        >
          {/* Purposeful sharp header: No icons, sharp geometry */}
          <div
            className="px-4 py-3 flex items-center justify-between text-white border-b border-neutral-800"
            style={{ backgroundColor: '#1b2838' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center text-xs font-black tracking-wider uppercase">
                <span className="bg-[#1b2838] text-white px-2.5 py-0.5">ሃገራዊ</span>
                <span className="bg-[#1b2838] text-[#ffe6e6] px-2 py-0.5">BETTING</span>
              </div>
              <div className="h-4 w-px bg-neutral-700" />
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-wider uppercase text-white leading-none">
                  ACCOUNT & WALLET
                </span>
                <span className="text-[10px] font-mono text-neutral-400 leading-none mt-1">
                  STATUS: AUTHENTICATION REQUIRED
                </span>
              </div>
            </div>
            <button
              onClick={() => setLoginModalOpen(false)}
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-2.5 py-1 border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer rounded-none"
            >
              CLOSE
            </button>
          </div>

          <div className="p-6 text-center space-y-4">
            <div className="p-3 bg-neutral-100 border border-neutral-200 text-left">
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block tracking-wider">
                SESSION NOTICE
              </span>
              <p className="text-xs text-neutral-800 font-medium mt-1">
                Log in to view your real-time wallet balance, active tickets, and verified account information. One account works across both ሃገራዊ Betting Sports and Polymarket.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => { setLoginModalOpen(false); openAuthModal('login'); }}
                className="w-full py-2.5 bg-[#1b2838] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-none transition-colors cursor-pointer"
              >
                LOG IN
              </button>
              <button
                onClick={() => { setLoginModalOpen(false); openAuthModal('signup'); }}
                className="w-full py-2.5 bg-[#0070e0] hover:bg-[#005bb8] text-white font-extrabold text-xs uppercase tracking-wider rounded-none transition-colors cursor-pointer"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeTicketsCount = placedBets ? placedBets.filter(b => b.status === 'active' || b.status === 'pending').length : 0;
  const totalTicketsCount = placedBets ? placedBets.length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div
        id="login-account-modal"
        className="bg-white rounded-none shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-300 text-neutral-800"
      >
        {/* Purposeful Sharp Modern Header — ሃገራዊ BETTING, No round corners, no icons */}
        <div
          className="px-4 py-3 flex items-center justify-between text-white border-b border-neutral-800"
          style={{ backgroundColor: '#1b2838' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center text-xs font-black tracking-wider uppercase">
              <span className="bg-[#1b2838] text-white px-2.5 py-0.5">ሃገራዊ</span>
              <span className="bg-[#1b2838] text-[#ffe6e6] px-2 py-0.5">BETTING</span>
            </div>
            <div className="h-4 w-px bg-neutral-700" />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider uppercase text-white leading-none">
                ACCOUNT & WALLET
              </span>
              <span className="text-[10px] font-mono text-neutral-400 leading-none mt-1">
                ID: {user.userId || 'USR-849201'} • VERIFIED
              </span>
            </div>
          </div>

          <button
            id="btn-close-account-modal"
            onClick={() => setLoginModalOpen(false)}
            className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-2.5 py-1 border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer rounded-none"
          >
            CLOSE
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* User Profile & Active Balance Card — Sharp architectural container, no round corners, no icons */}
          <div className="bg-neutral-50 border border-neutral-200 p-3.5 flex items-center justify-between rounded-none">
            <div className="flex items-center gap-3">
              {/* Sharp square monogram badge */}
              <div className="w-11 h-11 rounded-none bg-[#1b2838] text-white font-mono font-black text-base flex items-center justify-center border border-neutral-700 shrink-0">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-neutral-900 uppercase tracking-tight">
                    {user.username}
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 border border-emerald-300 uppercase tracking-wider rounded-none">
                    VERIFIED MEMBER
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  ID: {user.userId || 'USR-849201'} • {user.phone || '+251 91 123 4567'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                ACTIVE WALLET BALANCE
              </span>
              <span className="font-mono font-black text-lg text-emerald-700 block leading-tight">
                {user.balance.toLocaleString()} {user.currency}
              </span>
              {user.bonusBalance > 0 && (
                <span className="text-[10px] font-mono text-amber-700 font-bold block mt-0.5">
                  BONUS: {user.bonusBalance.toLocaleString()} {user.currency}
                </span>
              )}
            </div>
          </div>

          {/* About Account (ስለ አካውንት) Section — Purposeful, structured, no icons, sharp layout */}
          <div className="border border-neutral-200 bg-white">
            <div className="bg-neutral-100 px-3.5 py-2 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                ABOUT ACCOUNT / ስለ አካውንት ዝርዝር መረጃ
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                STATUS: ACTIVE
              </span>
            </div>

            {/* Grid of purposeful account specifications */}
            <div className="divide-y divide-neutral-200 text-xs font-mono">
              <div className="grid grid-cols-2 p-3 bg-white">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">ACCOUNT NUMBER / መለያ ቁጥር</span>
                  <span className="font-bold text-neutral-900 text-xs">{user.userId || 'USR-849201'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">ACCOUNT TIER / ደረጃ</span>
                  <span className="font-bold text-neutral-900 text-xs">TIER-1 NATIONAL SPORTSBOOK</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 bg-neutral-50/60">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">NATIONAL eKYC STATUS / ማንነት</span>
                  <span className="font-bold text-emerald-700 text-xs">FAYDA ID VERIFIED (የተረጋገጠ)</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">OPERATING CURRENCY / ገንዘብ</span>
                  <span className="font-bold text-neutral-900 text-xs">{user.currency} (ETHIOPIAN BIRR)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 bg-white">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">REGISTERED PHONE / ስልክ</span>
                  <span className="font-bold text-neutral-900 text-xs">{user.phone || '+251 91 123 4567'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">ACCOUNT EMAIL</span>
                  <span className="font-bold text-neutral-900 text-xs">{user.email || 'verified.bettor@fidabet.et'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 bg-neutral-50/60">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">TICKET ACTIVITY / ውርርዶች</span>
                  <span className="font-bold text-neutral-900 text-xs">
                    {activeTicketsCount} ACTIVE ({totalTicketsCount} TOTAL)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">DAILY WAGERING LIMIT / ጣሪያ</span>
                  <span className="font-bold text-neutral-900 text-xs">50,000 {user.currency} / DAY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 bg-white">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">PLATFORM ECOSYSTEM / መድረክ</span>
                  <span className="font-bold text-neutral-900 text-xs">ሃገራዊ BETTING & POLYMARKET</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">RESPONSIBLE GAMING</span>
                  <span className="font-bold text-emerald-700 text-xs">COMPLIANT & MONITORED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Verification Banner — Purposeful text notice without icons */}
          <div className="p-3 bg-neutral-100 border border-neutral-300 text-[11px] font-mono text-neutral-700 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold uppercase tracking-wider text-neutral-900">
              SECURITY: TLS 1.3 256-BIT ENCRYPTION ACTIVE
            </span>
            <span className="text-neutral-500 uppercase">
              FAYDA NATIONAL ID SYSTEM BACKED
            </span>
          </div>

          <button
            onClick={() => setLoginModalOpen(false)}
            className="w-full py-2.5 bg-[#1b2838] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-none transition-colors cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
