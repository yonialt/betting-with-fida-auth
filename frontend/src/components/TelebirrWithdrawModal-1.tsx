import React, { useState, useCallback, useEffect } from 'react';
import { Lock, X, Phone } from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { TelebirrCheckout } from './TelebirrCheckout';

type FlowStep = 'form' | 'checkout';

const AMOUNTS = [100, 200, 500, 1000, 2000];
const MERCHANT = 'ሃገራዊ Prediction Market';
const LOGO = '/hagerawi-logo.png';

/**
 * Withdrawal modal. Mirrors the deposit modal exactly (same two-column wallet
 * UI and simulated telebirr checkout) — the only difference is the wording
 * ("withdraw" instead of "deposit") and that it debits the wallet via
 * `withdrawFunds` instead of crediting it.
 */
export const TelebirrWithdrawModal: React.FC = () => {
  const { withdrawModalOpen, setWithdrawModalOpen, user, setNotification, withdrawFunds } = useBetting();
  const balance = user?.balance || 0;
  const currency = user?.currency || 'ETB';

  const [amount, setAmount] = useState<number>(0);
  const [phone, setPhone] = useState(user?.phone?.replace('+251', '') || '911000000');
  const [step, setStep] = useState<FlowStep>('form');
  const [reference, setReference] = useState('');

  const fmt = (n: number) => `ETB ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  // Reset when the modal opens. Depend ONLY on withdrawModalOpen — depending on
  // `user` would re-fire this when withdrawFunds updates the balance and bounce
  // the checkout back to the form before the success screen can show.
  useEffect(() => {
    if (withdrawModalOpen) {
      setStep('form');
      setAmount(0);
      setPhone(user?.phone?.replace('+251', '') || '911000000');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawModalOpen]);

  const handleClose = useCallback(() => {
    setWithdrawModalOpen(false);
    setTimeout(() => setStep('form'), 300);
  }, [setWithdrawModalOpen]);

  const amountValid = amount > 0 && amount <= balance;
  const phoneValid = !!phone && phone.trim().length >= 8;

  const handleContinue = () => {
    if (amount <= 0) {
      setNotification({ message: 'Enter an amount to withdraw', type: 'warning' });
      return;
    }
    if (amount > balance) {
      setNotification({ message: 'Amount exceeds your available balance', type: 'warning' });
      return;
    }
    if (!phoneValid) {
      setNotification({ message: 'Please enter a valid phone number', type: 'warning' });
      return;
    }
    setReference('TB' + Date.now().toString().slice(-10));
    setStep('checkout');
  };

  if (!withdrawModalOpen) return null;

  // Simulated telebirr checkout (phone → name & password → confirmation → done)
  if (step === 'checkout') {
    return (
      <TelebirrCheckout
        mode="withdraw"
        amount={amount}
        initialPhone={phone}
        merchant={MERCHANT}
        logo={LOGO}
        reference={reference}
        onClose={handleClose}
        onComplete={() => {
          const fullPhone = phone.startsWith('+251') ? phone : '+251' + phone.replace(/^0/, '');
          return withdrawFunds(amount, fullPhone);
        }}
      />
    );
  }

  // ========== MAIN WITHDRAW FORM ==========
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative w-full max-w-[920px] rounded-2xl overflow-hidden shadow-3xl my-auto max-h-[92vh] flex flex-col"
        style={{ background: '#EEF2F9', fontFamily: "'Inter', sans-serif" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="shrink-0 flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#DFE5F0]">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO}
              alt="ሃገራዊ"
              className="w-8 h-8 rounded-lg object-contain shrink-0"
              style={{ background: '#EEF2F9' }}
            />
            <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {MERCHANT} · 18+
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4C5C77] pr-7">
            <Lock className="w-3.5 h-3.5" />
            Secure withdraw
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] overflow-y-auto flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-[#DFE5F0]">
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>
                Withdraw from your wallet
              </h1>
              <p className="text-sm mb-5" style={{ color: '#4C5C77' }}>
                Available balance · {balance.toLocaleString()} {currency}
              </p>

              <div className="mb-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>
                  Choose an amount
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      disabled={val > balance}
                      className={`border rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        amount === val
                          ? 'border-[#0B4A8C] bg-[#E4EEFC] text-[#083761]'
                          : 'border-[#DFE5F0] bg-white text-[#10213D] hover:bg-[#EEF2F9]'
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      ETB {val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>
                  Or enter a custom amount
                </label>
                <div className="flex items-center border border-[#DFE5F0] rounded-[10px] overflow-hidden bg-white">
                  <span className="px-3 py-2 text-sm font-semibold border-r border-[#DFE5F0] bg-[#EEF2F9] text-[#4C5C77]">ETB</span>
                  <input
                    type="number"
                    value={amount || ''}
                    min={0}
                    max={balance}
                    placeholder="0"
                    onChange={(e) => {
                      const n = parseFloat(e.target.value);
                      setAmount(isNaN(n) ? 0 : Math.max(0, n));
                    }}
                    className="border-none outline-none px-3 py-2 text-sm w-full"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                {amount > balance ? (
                  <p className="text-xs mt-1.5 font-semibold text-[#D32F2F]">Amount exceeds your available balance.</p>
                ) : (
                  <p className="text-xs mt-1.5" style={{ color: '#4C5C77' }}>
                    You can withdraw up to {fmt(balance)}.
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>
                  <Phone className="w-3 h-3 inline mr-1" />
                  Phone number (Telebirr)
                </label>
                <div className="flex items-center border border-[#DFE5F0] rounded-[10px] overflow-hidden bg-white">
                  <span className="px-3 py-2 text-sm font-semibold border-r border-[#DFE5F0] bg-[#EEF2F9] text-[#4C5C77] whitespace-nowrap">+251</span>
                  <input
                    type="tel"
                    value={phone}
                    placeholder="9XXXXXXXX"
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="border-none outline-none px-3 py-2 text-sm w-full"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#4C5C77' }}>
                  Funds are sent to this Telebirr number.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DFE5F0]">
              <div className="flex justify-between text-sm py-0.5" style={{ color: '#4C5C77' }}>
                <span>Withdrawal amount</span>
                <span>{fmt(amount)}</span>
              </div>
              <div className="flex justify-between text-sm py-0.5" style={{ color: '#4C5C77' }}>
                <span>Processing fee</span>
                <span>ETB 0</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 mt-1 border-t border-[#DFE5F0]" style={{ color: '#10213D' }}>
                <span className="text-base">Total to receive</span>
                <span className="text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col justify-between min-h-0">
            <div>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 border rounded-[11px] px-3 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-[#0B4A8C] bg-[#E4EEFC] text-[#083761]">
                  <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: '#0B4A8C' }} />
                  telebirr
                </div>
                <button className="flex-1 border rounded-[11px] px-3 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-[#DFE5F0] bg-white text-[#4C5C77] cursor-default" disabled>
                  <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: '#C6CEDD' }} />
                  PGO
                </button>
                <button className="flex-1 border rounded-[11px] px-3 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-[#DFE5F0] bg-white text-[#4C5C77] cursor-default" disabled>
                  <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: '#C6CEDD' }} />
                  Bank transfer
                </button>
              </div>

              <div className="bg-white border border-[#DFE5F0] rounded-[14px] p-4 sm:p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>
                    Withdraw with telebirr
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed mb-3" style={{ color: '#4C5C77' }}>
                  You'll be redirected to telebirr to approve this withdrawal. {MERCHANT} never sees or stores your
                  telebirr password — you enter it only inside telebirr's own secure screen.
                </p>
                <div className="flex gap-2.5 items-start rounded-[10px] px-3.5 py-2.5 text-xs leading-relaxed mb-4 bg-[#E4EEFC] border border-[#DFE5F0] text-[#083761]">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#0B4A8C]" />
                  <span>
                    After you tap continue, you'll enter your phone number, then your name and password, and finally
                    confirm the withdrawal — all inside telebirr.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-auto">
              <button
                onClick={handleContinue}
                disabled={!amountValid}
                className="w-full border-none rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition-colors cursor-pointer shadow-xs hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#0B4A8C', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Continue to telebirr — {fmt(amount)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
