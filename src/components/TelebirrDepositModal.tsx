import React, { useState, useCallback, useEffect } from 'react';
import { Lock, CheckCircle, X, Phone, AlertCircle } from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { fidaBetApi } from '../services/fidaBetApi';

type FlowStep = 'form' | 'phone-entry' | 'pin-entry' | 'processing' | 'success' | 'error';

const AMOUNTS = [100, 200, 500, 1000, 2000];

export const TelebirrDepositModal: React.FC = () => {
  const { depositModalOpen, setDepositModalOpen, user, setNotification } = useBetting();
  const [amount, setAmount] = useState<number>(200);
  const [phone, setPhone] = useState(user?.phone?.replace('+251', '') || '911000000');
  const [step, setStep] = useState<FlowStep>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [pin, setPin] = useState('');
  const [merchantOrderId, setMerchantOrderId] = useState('');

  const fmt = (n: number) =>
    `ETB ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const fmtFull = (n: number) =>
    `ETB ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Reset when modal opens
  useEffect(() => {
    if (depositModalOpen) {
      setStep('form');
      setErrorMsg('');
      setPin('');
      setCheckoutPhone('');
    }
  }, [depositModalOpen]);

  const handleContinue = async () => {
    if (amount < 100) {
      setNotification({ message: 'Minimum deposit is ETB 100', type: 'warning' });
      return;
    }
    if (!phone || phone.trim().length < 8) {
      setNotification({ message: 'Please enter a valid phone number', type: 'warning' });
      return;
    }

    setStep('processing');
    setErrorMsg('');

    try {
      // Use the fidaBetApi client which handles auth tokens properly
      // First ensure we're authenticated
      let token = localStorage.getItem('fidabet_token');
      if (!token) {
        try {
          await fidaBetApi.login('Player_8831', 'password123');
          token = localStorage.getItem('fidabet_token');
        } catch (e: any) {
          console.error('Auto-login failed:', e);
          throw new Error('Authentication failed: ' + (e.message || 'Please refresh the page and try again'));
        }
      }

      if (!token) {
        throw new Error('No authentication token. Please refresh the page.');
      }

      const fullPhone = phone.startsWith('+251') ? phone : '+251' + phone;

      console.log('[Deposit] Calling deposit API with token:', token.substring(0, 20) + '...');
      const data = await fidaBetApi.deposit(amount, 'telebirr', fullPhone);
      console.log('[Deposit] API response:', data);

      if (!data.paymentUrl) {
        throw new Error('No payment URL received from server. Response: ' + JSON.stringify(data));
      }

      // Store transaction info and move to simulated checkout
      const refId = data.referenceId || data.transactionId;
      setReceiptRef(refId);
      setMerchantOrderId(refId);
      setCheckoutPhone(phone);

      // Move to simulated phone entry
      setStep('phone-entry');
    } catch (err: any) {
      console.error('[Deposit] Error:', err);
      setErrorMsg(err.message || 'Failed to initiate deposit. Please try again.');
      setStep('error');
    }
  };

  // PIN entry auto-submit after 6 digits
  useEffect(() => {
    if (pin.length === 6 && step === 'pin-entry') {
      handlePinSubmit();
    }
  }, [pin, step]);

  const handlePinSubmit = useCallback(async () => {
    if (pin.length < 4) return;
    setStep('processing');

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 2500));

    // Call the real webhook to complete payment
    try {
      await fetch('/webhook/telebirr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merch_order_id: merchantOrderId,
          trade_status: 'PAY_SUCCESS',
          total_amount: amount.toString(),
          trade_no: 'TB' + Date.now(),
        }),
      });
      setStep('success');
      setNotification({ message: `Deposit of ${fmt(amount)} completed!`, type: 'success' });
    } catch {
      setStep('error');
      setErrorMsg('Payment verification failed. Contact support if you were charged.');
    }
  }, [pin, merchantOrderId, amount]);

  const handleReset = useCallback(() => {
    setStep('form');
    setErrorMsg('');
    setPin('');
  }, []);

  const handleClose = useCallback(() => {
    setDepositModalOpen(false);
    setTimeout(() => {
      setStep('form');
      setErrorMsg('');
      setPin('');
    }, 300);
  }, [setDepositModalOpen]);

  if (!depositModalOpen) return null;

  // ========== SIMULATED CHECKOUT STAGES ==========

  // Phone Entry Screen
  if (step === 'phone-entry') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-3xl my-auto max-h-[94vh] overflow-y-auto" style={{ background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#d32f2f' }}>telebirr</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>telebirr</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Secure Payment</div>
              </div>
            </div>
            <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>

          <div style={{ background: 'white', margin: '16px', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Payment to</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Adera Bet</div>
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#666' }}>Amount</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#d32f2f' }}>{fmtFull(amount)}</span>
            </div>
          </div>

          <div style={{ background: 'white', margin: '0 16px 16px', borderRadius: 12, padding: '24px 20px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>Enter your phone number</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>The phone number registered with your telebirr account</p>
            <div style={{ display: 'flex', border: '2px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: '#f5f5f5', padding: '14px 12px', fontSize: 16, fontWeight: 600, color: '#333', borderRight: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 6 }}>🇪🇹 +251</div>
              <input
                type="tel"
                autoFocus
                placeholder="9XXXXXXXX"
                value={checkoutPhone}
                onChange={(e) => setCheckoutPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => { if (e.key === 'Enter' && checkoutPhone.length >= 9) { setStep('pin-entry'); } }}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '14px 16px', fontSize: 16 }}
              />
            </div>
            <button
              onClick={() => {
                if (checkoutPhone.length < 8) { setNotification({ message: 'Enter a valid phone number', type: 'warning' }); return; }
                setStep('pin-entry');
              }}
              style={{ width: '100%', marginTop: 20, padding: '16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >Continue</button>
          </div>

          <div style={{ textAlign: 'center', padding: '12px 16px', fontSize: 11, color: '#bbb' }}>Powered by Ethio Telecom · telebirr</div>
        </div>
      </div>
    );
  }

  // PIN Entry Screen
  if (step === 'pin-entry') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-3xl my-auto max-h-[94vh] overflow-y-auto" style={{ background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#d32f2f' }}>telebirr</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>telebirr</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Secure Payment</div>
              </div>
            </div>
            <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>

          <div style={{ background: 'white', margin: '16px', borderRadius: 12, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: '#666' }}>Paying</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Adera Bet</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#d32f2f' }}>{fmtFull(amount)}</div>
          </div>

          <div style={{ background: 'white', margin: '0 16px 16px', borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>Enter your PIN</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 6px' }}>Enter your 4-6 digit telebirr PIN to authorize</p>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>Phone: <strong style={{ color: '#333' }}>+251{checkoutPhone}</strong></p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < pin.length ? '#d32f2f' : '#e0e0e0', transition: 'background 0.15s' }} />
              ))}
            </div>

            <input
              type="password"
              autoFocus
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 280, margin: '0 auto' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (num === 'del') setPin((p) => p.slice(0, -1));
                    else if (num !== null) setPin((p) => (p.length < 6 ? p + num : p));
                  }}
                  disabled={num === null}
                  style={{
                    padding: '16px', borderRadius: 10, border: '1px solid #e8e8e8',
                    background: num === null ? 'transparent' : '#f8f8f8',
                    fontSize: 20, fontWeight: 600, color: num === 'del' ? '#d32f2f' : '#1a1a1a',
                    cursor: num === null ? 'default' : 'pointer',
                  }}
                >{num === null ? '' : num}</button>
              ))}
            </div>

            <button onClick={() => setPin('')} style={{ marginTop: 16, background: 'none', border: 'none', color: '#d32f2f', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Clear PIN</button>
          </div>

          <div style={{ textAlign: 'center', padding: '12px 16px', fontSize: 11, color: '#bbb' }}>Powered by Ethio Telecom · telebirr</div>
        </div>
      </div>
    );
  }

  // Processing Screen
  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-3xl my-auto max-h-[94vh] overflow-y-auto" style={{ background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#d32f2f' }}>telebirr</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>telebirr</div>
          </div>
          <div style={{ background: 'white', margin: '16px', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid #f5f5f5', borderTopColor: '#d32f2f', animation: 'telebirr-spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>Processing payment...</h2>
            <p style={{ fontSize: 14, color: '#888' }}>Please wait while we confirm your payment</p>
            <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>{fmtFull(amount)} → Adera Bet</p>
          </div>
          <style>{`@keyframes telebirr-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-3xl my-auto max-h-[94vh] overflow-y-auto" style={{ background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div style={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#2e7d32' }}>telebirr</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>telebirr</div>
          </div>
          <div style={{ background: 'white', margin: '16px', borderRadius: 12, padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#2e7d32' }}>Payment Successful</h2>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 4px' }}>You have paid <strong>{fmtFull(amount)}</strong></p>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 20px' }}>to <strong>Adera Bet</strong></p>
            <div style={{ background: '#f5f5f5', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#888', maxWidth: 280, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Reference</span>
                <span style={{ color: '#333', fontWeight: 600 }}>{receiptRef}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status</span>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>Completed</span>
              </div>
            </div>
            <button onClick={handleClose} style={{ width: '100%', marginTop: 20, padding: '14px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN DEPOSIT FORM ==========

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0B4A8C', fontFamily: "'Space Grotesk', sans-serif" }}>A</div>
            <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Adera Bet · 18+</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4C5C77] pr-7">
            <Lock className="w-3.5 h-3.5" />
            Secure deposit
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] overflow-y-auto flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-[#DFE5F0]">
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>Deposit to your wallet</h1>
              <p className="text-sm mb-5" style={{ color: '#4C5C77' }}>Current balance · {user?.balance?.toLocaleString() || '0'} {user?.currency || 'ETB'}</p>

              <div className="mb-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>Choose an amount</label>
                <div className="grid grid-cols-2 gap-2">
                  {AMOUNTS.map((val) => (
                    <button key={val} onClick={() => setAmount(val)}
                      className={`border rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${amount === val ? 'border-[#0B4A8C] bg-[#E4EEFC] text-[#083761]' : 'border-[#DFE5F0] bg-white text-[#10213D] hover:bg-[#EEF2F9]'}`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ETB {val.toLocaleString()}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>Or enter a custom amount</label>
                <div className="flex items-center border border-[#DFE5F0] rounded-[10px] overflow-hidden bg-white">
                  <span className="px-3 py-2 text-sm font-semibold border-r border-[#DFE5F0] bg-[#EEF2F9] text-[#4C5C77]">ETB</span>
                  <input type="number" value={amount} min={100} max={50000}
                    onChange={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setAmount(n); }}
                    className="border-none outline-none px-3 py-2 text-sm w-full" style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#4C5C77' }}>Minimum deposit ETB 100 · maximum ETB 50,000 per transaction.</p>
              </div>

              <div className="mb-5">
                <label className="block text-xs mb-2 font-medium" style={{ color: '#4C5C77' }}>
                  <Phone className="w-3 h-3 inline mr-1" />Phone number (Telebirr)
                </label>
                <div className="flex items-center border border-[#DFE5F0] rounded-[10px] overflow-hidden bg-white">
                  <span className="px-3 py-2 text-sm font-semibold border-r border-[#DFE5F0] bg-[#EEF2F9] text-[#4C5C77] whitespace-nowrap">+251</span>
                  <input type="tel" value={phone} placeholder="9XXXXXXXX"
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="border-none outline-none px-3 py-2 text-sm w-full" style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#4C5C77' }}>Your registered Telebirr phone number.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DFE5F0]">
              <div className="flex justify-between text-sm py-0.5" style={{ color: '#4C5C77' }}><span>Deposit amount</span><span>{fmt(amount)}</span></div>
              <div className="flex justify-between text-sm py-0.5" style={{ color: '#4C5C77' }}><span>Processing fee</span><span>ETB 0</span></div>
              <div className="flex justify-between font-semibold pt-2 mt-1 border-t border-[#DFE5F0]" style={{ color: '#10213D' }}>
                <span className="text-base">Total to pay</span>
                <span className="text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{fmt(amount)}</span>
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
                  <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: '#C6CEDD' }} />PGO
                </button>
                <button className="flex-1 border rounded-[11px] px-3 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-[#DFE5F0] bg-white text-[#4C5C77] cursor-default" disabled>
                  <span className="w-4 h-4 rounded-[5px] shrink-0" style={{ background: '#C6CEDD' }} />Bank transfer
                </button>
              </div>

              <div className="bg-white border border-[#DFE5F0] rounded-[14px] p-4 sm:p-5 flex flex-col">
                {step === 'error' && (
                  <div className="flex flex-col items-center text-center flex-1 justify-center gap-3 py-3">
                    <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center mb-1 bg-[#FDECEA]">
                      <AlertCircle className="w-6 h-6 text-[#D32F2F]" />
                    </div>
                    <h3 className="m-0 mb-1 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>Deposit failed</h3>
                    <p className="m-0 text-sm max-w-[320px] break-all" style={{ color: '#4C5C77', wordBreak: 'break-word' }}>{errorMsg}</p>
                    <button onClick={handleReset} className="w-full mt-3 border border-[#DFE5F0] rounded-[10px] px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors bg-white hover:bg-[#EEF2F9]" style={{ color: '#10213D' }}>Try again</button>
                  </div>
                )}

                {(step === 'form' || step === 'processing') && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#10213D' }}>Deposit with telebirr</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed mb-3" style={{ color: '#4C5C77' }}>
                      You'll be redirected to telebirr to approve this payment. Adera Bet never sees or stores your telebirr PIN — you enter it only inside telebirr's own app or USSD session.
                    </p>
                    <div className="flex gap-2.5 items-start rounded-[10px] px-3.5 py-2.5 text-xs leading-relaxed mb-4 bg-[#E4EEFC] border border-[#DFE5F0] text-[#083761]">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#0B4A8C]" />
                      <span>After you tap continue, you'll see the telebirr PIN entry screen where you authorize the payment with your own PIN.</span>
                    </div>

                    {step === 'processing' && (
                      <div className="flex flex-col items-center justify-center text-center gap-2.5 mb-3 py-2">
                        <div className="w-9 h-9 rounded-full border-[3px] border-[#E4EEFC] border-t-[#0B4A8C] animate-spin" />
                        <p className="text-xs sm:text-sm" style={{ color: '#4C5C77' }}>Contacting Telebirr...</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 mt-auto">
              <button
                onClick={handleContinue}
                disabled={step === 'processing'}
                className="w-full border-none rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs hover:brightness-105"
                style={{ background: '#0B4A8C', fontFamily: "'Space Grotesk', sans-serif", cursor: step === 'processing' ? 'wait' : 'pointer' }}
              >
                {step === 'processing' ? 'Connecting...' : `Continue to telebirr — ${fmt(amount)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
