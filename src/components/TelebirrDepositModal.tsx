import React, { useState, useCallback } from 'react';
import { Lock, CheckCircle, X } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

type PaymentMethod = 'telebirr' | 'pgo';
type FlowStep = 'form' | 'processing' | 'success';

const METHODS: Record<PaymentMethod, {
  label: string;
  title: string;
  note: string;
  banner: string;
  cta: string;
  processing: string;
  refPrefix: string;
}> = {
  telebirr: {
    label: 'telebirr',
    title: 'Deposit with telebirr',
    note: "You'll be redirected to telebirr to approve this payment. Adera Bet never sees or stores your telebirr PIN \u2014 you enter it only inside telebirr's own app or USSD session.",
    banner: "After you tap continue, telebirr will ask you to confirm the amount and authorize with your own PIN on their platform.",
    cta: 'Continue to telebirr',
    processing: 'Redirecting to telebirr to authorize a deposit of',
    refPrefix: 'TB',
  },
  pgo: {
    label: 'Chapa/ArifPay',
    title: 'Deposit with a payment gateway',
    note: "You'll be redirected to your chosen gateway (Chapa or ArifPay) to complete payment. They support telebirr, bank cards, and CBE Birr from a single checkout \u2014 Adera Bet never sees your card or wallet PIN.",
    banner: "After you tap continue, the gateway will let you pick telebirr, a bank card, or another wallet, then confirm the amount before you authorize.",
    cta: 'Continue to gateway',
    processing: 'Redirecting to the payment gateway to authorize a deposit of',
    refPrefix: 'PGO',
  },
};

const AMOUNTS = [200, 500, 1000, 2000];

export const TelebirrDepositModal: React.FC = () => {
  const { depositModalOpen, setDepositModalOpen, user, depositFunds, setNotification } = useBetting();
  const [amount, setAmount] = useState<number>(2000);
  const [method, setMethod] = useState<PaymentMethod>('telebirr');
  const [step, setStep] = useState<FlowStep>('form');
  const [receiptRef, setReceiptRef] = useState('');

  const fmt = (n: number) =>
    `ETB ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const handleAmountChip = (val: number) => {
    setAmount(val);
  };

  const handleCustomAmount = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n)) setAmount(n);
  };

  const handleContinue = () => {
    if (amount < 50) {
      setNotification({ message: 'Minimum deposit is ETB 50', type: 'warning' });
      return;
    }
    setStep('processing');
    const cfg = METHODS[method];
    setTimeout(() => {
      const ref = `${cfg.refPrefix}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setReceiptRef(ref);
      depositFunds(amount);
      setStep('success');
    }, 1600);
  };

  const handleReset = useCallback(() => {
    setStep('form');
  }, []);

  const handleClose = useCallback(() => {
    setDepositModalOpen(false);
    setTimeout(() => setStep('form'), 300);
  }, [setDepositModalOpen]);

  if (!depositModalOpen) return null;

  const cfg = METHODS[method];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative w-full max-w-[920px] rounded-2xl overflow-hidden shadow-3xl"
        style={{ background: '#EEF2F9', fontFamily: "'Inter', sans-serif" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#DFE5F0]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#0B4A8C', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              A
            </div>
            <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Adera Bet \u00b7 18+
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4C5C77]">
            <Lock className="w-3.5 h-3.5" />
            Secure deposit
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr]">
          {/* LEFT: deposit summary */}
          <div className="p-6 md:border-r border-[#DFE5F0]">
            <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>
              Deposit to your wallet
            </h1>
            <p className="text-sm mb-6" style={{ color: '#4C5C77' }}>
              Current balance \u00b7 {user.balance.toLocaleString()} {user.currency}
            </p>

            {/* Amount chips */}
            <div className="mb-4">
              <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>Choose an amount</label>
              <div className="grid grid-cols-2 gap-2">
                {AMOUNTS.map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAmountChip(val)}
                    className={`border rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
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

            {/* Custom amount input */}
            <div className="mb-5">
              <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>Or enter a custom amount</label>
              <div className="flex items-center border border-[#DFE5F0] rounded-[10px] overflow-hidden bg-white">
                <span className="px-3 py-2.5 text-sm font-semibold border-r border-[#DFE5F0] bg-[#EEF2F9] text-[#4C5C77]">ETB</span>
                <input
                  type="number"
                  value={amount}
                  min={50}
                  max={50000}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  className="border-none outline-none px-3 py-2.5 text-sm w-full"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#4C5C77' }}>
                Minimum deposit ETB 50 \u00b7 maximum ETB 50,000 per transaction.
              </p>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-[#DFE5F0]">
              <div className="flex justify-between text-sm py-1" style={{ color: '#4C5C77' }}>
                <span>Deposit amount</span><span>{fmt(amount)}</span>
              </div>
              <div className="flex justify-between text-sm py-1" style={{ color: '#4C5C77' }}>
                <span>Processing fee</span><span>ETB 0</span>
              </div>
              <div className="flex justify-between font-semibold pt-3 mt-2 border-t border-[#DFE5F0]" style={{ color: '#10213D' }}>
                <span className="text-base">Total to pay</span>
                <span className="text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(amount)}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: payment panel */}
          <div className="p-6 flex flex-col min-h-[460px]">
            {/* Method tabs */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setMethod('telebirr'); setStep('form'); }}
                className={`flex-1 border rounded-[11px] px-3 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  method === 'telebirr'
                    ? 'border-[#0B4A8C] bg-[#E4EEFC] text-[#083761]'
                    : 'border-[#DFE5F0] bg-white text-[#4C5C77] hover:bg-[#EEF2F9]'
                }`}
              >
                <span className={`w-4 h-4 rounded-[5px] shrink-0`} style={{ background: method === 'telebirr' ? '#0B4A8C' : '#C6CEDD' }} />
                telebirr
              </button>
              <button
                onClick={() => { setMethod('pgo'); setStep('form'); }}
                className={`flex-1 border rounded-[11px] px-3 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  method === 'pgo'
                    ? 'border-[#0B4A8C] bg-[#E4EEFC] text-[#083761]'
                    : 'border-[#DFE5F0] bg-white text-[#4C5C77] hover:bg-[#EEF2F9]'
                }`}
              >
                <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: method === 'pgo' ? '#0B4A8C' : '#C6CEDD' }} />
                PGO (Chapa/ArifPay)
              </button>
              <button
                className="flex-1 border rounded-[11px] px-3 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-[#DFE5F0] bg-white text-[#4C5C77] cursor-default"
                disabled
              >
                <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: '#C6CEDD' }} />
                Bank transfer
              </button>
            </div>

            {/* Step content */}
            <div className="bg-white border border-[#DFE5F0] rounded-[14px] p-6 flex-1 flex flex-col">
              {step === 'form' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>
                      {cfg.title}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#4C5C77' }}>{cfg.note}</p>
                  <div className="flex gap-2.5 items-start rounded-[10px] px-3.5 py-3 text-xs leading-relaxed mb-5 bg-[#E4EEFC] border border-[#DFE5F0] text-[#083761]">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#0B4A8C]" />
                    <span>{cfg.banner}</span>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full border-none rounded-[10px] px-4 py-3 text-sm font-semibold text-white cursor-pointer mt-auto transition-colors"
                    style={{ background: '#0B4A8C', fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#083761')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#0B4A8C')}
                  >
                    {cfg.cta} \u2014 {fmt(amount)}
                  </button>
                </>
              )}

              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                  <div className="w-10 h-10 rounded-full border-[3px] border-[#E4EEFC] border-t-[#0B4A8C] animate-spin" />
                  <p className="text-sm max-w-[260px]" style={{ color: '#4C5C77' }}>
                    {cfg.processing} {fmt(amount)}\u2026
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center text-center flex-1 justify-center gap-1.5">
                  <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center mb-2.5 bg-[#E4F4EC]">
                    <CheckCircle className="w-6 h-6 text-[#1E8E5A]" />
                  </div>
                  <h3 className="m-0 mb-1 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>
                    Deposit successful
                  </h3>
                  <p className="m-0 text-sm" style={{ color: '#4C5C77' }}>Your wallet has been topped up and is ready to bet.</p>
                  <div className="w-full mt-5 border border-dashed border-[#DFE5F0] rounded-[10px] p-3.5 text-left">
                    <div className="flex justify-between text-xs py-1" style={{ color: '#4C5C77' }}>
                      <span>Amount deposited</span><span className="font-semibold" style={{ color: '#10213D' }}>{fmt(amount)}.00</span>
                    </div>
                    <div className="flex justify-between text-xs py-1" style={{ color: '#4C5C77' }}>
                      <span>New wallet balance</span><span className="font-semibold" style={{ color: '#10213D' }}>ETB {user.balance.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-xs py-1" style={{ color: '#4C5C77' }}>
                      <span>Paid via</span><span className="font-semibold" style={{ color: '#10213D' }}>{cfg.label}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1" style={{ color: '#4C5C77' }}>
                      <span>Reference</span><span className="font-semibold" style={{ color: '#10213D' }}>{receiptRef}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full mt-4 border border-[#DFE5F0] rounded-[10px] px-4 py-3 text-sm font-semibold cursor-pointer transition-colors bg-white hover:bg-[#EEF2F9]"
                    style={{ color: '#10213D', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Back to wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
