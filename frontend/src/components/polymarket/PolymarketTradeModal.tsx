import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { t, translateMarketTitle, translateOutcomeName } from '../../data/polymarketTranslations';
import { polymarketTradingApi, PmOrderReceipt } from '../../services/polymarketTradingApi';

interface PolymarketTradeModalProps {
  trade: PolymarketTradeState | null;
  onClose: () => void;
}

/**
 * Prediction-market order confirmation modal. The trade box hands the reviewed
 * order here; nothing is executed until the user clicks "Confirm Buy YES/NO".
 * Confirming sends the order to the Spring Boot backend, which authenticates,
 * validates market/outcome/status/amount/balance and executes atomically. The
 * authoritative receipt (filled shares, new balance) is then displayed, and the
 * portfolio / market / wallet data refreshes so the new position and the
 * activity row appear immediately.
 */
export const PolymarketTradeModal: React.FC<PolymarketTradeModalProps> = ({
  trade,
  onClose,
}) => {
  const { user, language } = useBetting();
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<string>('50');
  const [sellShares, setSellShares] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<PmOrderReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // SELL orders close part/all of an existing position; BUY orders open/extend one.
  const isSell = trade?.orderAction === 'SELL';

  // Reset all state whenever a new order is handed over (or the modal closes).
  useEffect(() => {
    if (trade) {
      setSelectedSide(trade.side === 'no' ? 'no' : 'yes');
      setAmount(trade.amount != null && trade.amount > 0 ? String(trade.amount) : '50');
      setSellShares(trade.sellShares != null && trade.sellShares > 0 ? String(trade.sellShares) : '');
      setIsSubmitting(false);
      setReceipt(null);
      setErrorMsg(null);
    }
  }, [trade]);

  if (!trade || !trade.market) return null;

  const outcome =
    trade.outcome ||
    trade.market.outcomes[0] || { name: 'Yes', probability: 50, yesPrice: 50, noPrice: 50 };

  const yesPrice = Math.min(99, Math.max(1, Math.round(outcome.yesPrice || outcome.probability || 50)));
  const noPrice = 100 - yesPrice;
  const currentPriceCents = selectedSide === 'yes' ? yesPrice : noPrice;

  const priceInDollars = currentPriceCents / 100;
  const numAmount = parseFloat(amount) || 0;
  const numSellShares = parseFloat(sellShares) || 0;
  const shares = priceInDollars > 0 ? (numAmount / priceInDollars).toFixed(1) : '0';
  const potentialPayout = (parseFloat(shares) * 1.0).toFixed(2);
  const returnPercentage =
    priceInDollars > 0 ? (((1 - priceInDollars) / priceInDollars) * 100).toFixed(0) : '0';

  // SELL preview: proceeds at the live market price and realized P/L vs avg entry.
  const heldShares = trade?.heldShares ?? 0;
  const heldAvgCents = trade?.heldAvgPriceCents ?? 0;
  const sellProceeds = Math.round(numSellShares * currentPriceCents) / 100;
  const sellPnl =
    Math.round((numSellShares * currentPriceCents - numSellShares * heldAvgCents) / 100 * 100) / 100;
  const sellClosesAll = heldShares > 0 && numSellShares >= heldShares;

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    if (isSell && (numSellShares <= 0 || heldShares <= 0)) return;
    if (!isSell && numAmount <= 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Backend: authenticate → validate market → status → shares → execute
      // atomically → return the authoritative result.
      const rcpt = await polymarketTradingApi.placeOrder(
        isSell
          ? {
              action: 'SELL' as const,
              marketId: trade.market.id,
              side: selectedSide,
              priceCents: currentPriceCents,
              shares: Math.min(numSellShares, heldShares),
            }
          : {
              action: 'BUY' as const,
              marketId: trade.market.id,
              marketTitle: trade.market.title,
              category: trade.market.category,
              side: selectedSide,
              outcomeName: outcome.name,
              priceCents: currentPriceCents,
              amount: numAmount,
            },
      );
      setReceipt(rcpt);
      // Refresh market + wallet + portfolio data everywhere.
      window.dispatchEvent(new CustomEvent('pm:portfolio-changed'));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Order failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md text-neutral-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {trade.market.category} {language === 'am' ? 'ግምገማ' : 'Prediction'}
            </div>
            <h3 className="font-bold text-sm text-neutral-900 mt-0.5 line-clamp-2">
              {translateMarketTitle(trade.market.title, language)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          /* -------- Authoritative backend result -------- */
          <div className="p-6 flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
              receipt.action === 'SELL' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-neutral-900">
              {receipt.action === 'SELL'
                ? (language === 'am' ? 'ተሸጧል!' : 'Position Closed!')
                : (language === 'am' ? 'ትዕዛዝ ተጠናቋል!' : 'Order Filled!')}
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              {receipt.reference} · {receipt.shares} {receipt.side.toUpperCase()} shares @ {(receipt.priceCents != null ? receipt.priceCents / 100 : 0).toFixed(2)} ETB
            </p>
            <div className="w-full bg-neutral-50 rounded-xl border border-neutral-200 p-3 mt-4 text-xs flex flex-col gap-1.5 text-left">
              {receipt.action === 'SELL' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{language === 'am' ? 'የተቀበሉት' : 'Proceeds'}</span>
                    <span className="font-mono font-bold text-emerald-600">+{receipt.amount} {user.currency}</span>
                  </div>
                  {receipt.realizedPnl != null && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">{language === 'am' ? 'የተገኘ ትርፍ/ኪሳራ' : 'Realized P/L'}</span>
                      <span className={`font-mono font-bold ${receipt.realizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {receipt.realizedPnl >= 0 ? '+' : ''}{receipt.realizedPnl} {user.currency}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{language === 'am' ? 'ወጪ' : 'Cost'}</span>
                    <span className="font-mono font-bold">{receipt.amount} {user.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{language === 'am' ? 'ጠቅላላ ክፍያ' : 'Total payout if correct'}</span>
                    <span className="font-mono font-bold text-emerald-600">{potentialPayout} {user.currency}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-1 border-t border-neutral-200">
                <span className="text-neutral-500">
                  {receipt.action === 'SELL'
                    ? (language === 'am' ? 'ቀሪ አካባቢዎች' : 'Remaining shares')
                    : (language === 'am' ? 'ቀሪ ሂሳብ' : 'New balance')}
                </span>
                <span className="font-mono font-bold">
                  {receipt.action === 'SELL'
                    ? receipt.positionShares
                    : receipt.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                  {receipt.action === 'SELL' ? 'shares' : user.currency}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">
              {receipt.action === 'SELL'
                ? (language === 'am'
                  ? 'አካባቢው ተዘግቷል — ጥሬ ገንዘብ ወደ ሂሳብዎ ተመልሷል።'
                  : 'Position closed — proceeds are back in your cash balance.')
                : (language === 'am'
                  ? 'አካባቢዎ ወደ ፖርትፎሊዎ ታክሏል — Positions እና Activity ይመልከቱ።'
                  : 'Position added to your Portfolio — see it under Positions and Activity.')}
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ተጠናቋል' : 'Done'}
            </button>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Outcome Target */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-700 font-semibold">
                {language === 'am' ? 'ውጤት: ' : 'Outcome: '}{' '}
                <strong className="text-neutral-900">
                  {translateOutcomeName(outcome.name, language)}
                </strong>
              </span>
              <span className="text-xs font-mono font-bold text-blue-600">
                {currentPriceCents}% {language === 'am' ? 'ዕድል' : 'chance'}
              </span>
            </div>

            {isSell ? (
              /* ---- SELL: the side is fixed to the held position ---- */
              <div className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                <span className="text-xs text-neutral-700 font-semibold">
                  {language === 'am' ? 'ሽያጭ: ' : 'Selling: '}
                  <strong className="text-neutral-900">{selectedSide.toUpperCase()}</strong>
                </span>
                <span className="text-xs text-neutral-500">
                  {language === 'am' ? 'የያዙት: ' : 'You hold: '}
                  <strong className="font-mono text-neutral-900">{heldShares}</strong>{' '}
                  {language === 'am' ? 'አካባቢ @ ' : 'shares @ '}{(heldAvgCents / 100).toFixed(2)} ETB
                </span>
              </div>
            ) : (
              /* ---- BUY: Buy YES / Buy NO selectors ---- */
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedSide('yes')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                    selectedSide === 'yes'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                  }`}
                >
                  <span>{language === 'am' ? 'ግዛ አዎ' : 'Buy YES'}</span>
                  <span className="text-[11px] font-mono opacity-90">{yesPrice}%</span>
                </button>

                <button
                  onClick={() => setSelectedSide('no')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                    selectedSide === 'no'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                  }`}
                >
                  <span>{language === 'am' ? 'ግዛ አይ' : 'Buy NO'}</span>
                  <span className="text-[11px] font-mono opacity-90">{noPrice}%</span>
                </button>
              </div>
            )}

            {/* Amount (BUY) or Shares (SELL) Input */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <label className="font-semibold text-neutral-700">
                  {isSell
                    ? (language === 'am' ? 'ለሽያጭ አካባቢዎች' : 'Shares to sell')
                    : (language === 'am' ? 'መጠን (ብር)' : 'Amount (Birr)')}
                </label>
                {isSell ? (
                  <span>
                    {language === 'am' ? 'የያዙት: ' : 'You hold: '}
                    <strong className="font-mono text-neutral-900">{heldShares}</strong>
                  </span>
                ) : (
                  <span>
                    {language === 'am' ? 'ቀሪ ሂሳብ: ' : 'Balance: '}
                    {user.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {user.currency}
                  </span>
                )}
              </div>

              {isSell ? (
                <>
                  <input
                    type="number"
                    value={sellShares}
                    onChange={(e) => setSellShares(e.target.value)}
                    max={heldShares}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none transition-colors"
                    placeholder="0"
                  />
                  {/* Quick share chips: 25/50/75/MAX — same chip styling */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[25, 50, 75].map((pct) => (
                      <button
                        key={pct}
                        onClick={() =>
                          setSellShares(String(Math.floor(heldShares * (pct / 100) * 10000) / 10000))
                        }
                        className="flex-1 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-[11px] font-semibold rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                      >
                        {pct}%
                      </button>
                    ))}
                    <button
                      onClick={() => setSellShares(String(heldShares))}
                      className="flex-1 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <span className="text-xs font-bold text-neutral-500 font-mono absolute left-3 top-1/2 -translate-y-1/2 select-none">
                      {language === 'am' ? 'ብር' : 'ETB'}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-500 rounded-xl pl-12 pr-14 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none transition-colors"
                      placeholder="0.00"
                    />
                    <button
                      onClick={() => setAmount(String(Math.max(0, Math.floor(user.balance))))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-neutral-200 hover:bg-neutral-300 text-blue-700 px-2 py-1 rounded cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {['10', '50', '100', '250', '500'].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setAmount(chip)}
                        className="flex-1 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 text-[11px] font-semibold rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                      >
                        {chip} {language === 'am' ? 'ብር' : 'Birr'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Trade Preview — computed by the frontend, verified by the backend */}
            {isSell ? (
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex flex-col gap-1.5 text-xs text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>{t('avg_price', language, 'Avg Price:')}</span>
                  <span className="font-mono text-neutral-900 font-bold">{(currentPriceCents / 100).toFixed(2)} {user.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('shares', language, 'Shares:')}</span>
                  <span className="font-mono text-neutral-900 font-bold">{numSellShares}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{language === 'am' ? 'የሚገኘው ጥሬ ገንዘብ:' : 'You receive:'}</span>
                  <span className="font-mono text-emerald-600 font-bold">{sellProceeds.toFixed(2)} {user.currency}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-200 font-bold text-neutral-900">
                  <span>{language === 'am' ? 'የተገኘ ትርፍ/ኪሳራ:' : 'Realized P/L:'}</span>
                  <span className={`font-mono text-sm ${sellPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {sellPnl >= 0 ? '+' : ''}{sellPnl.toFixed(2)} {language === 'am' ? 'ብር' : 'Birr'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex flex-col gap-1.5 text-xs text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>{t('avg_price', language, 'Avg Price:')}</span>
                  <span className="font-mono text-neutral-900 font-bold">{(currentPriceCents / 100).toFixed(2)} {user.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('shares', language, 'Shares:')}</span>
                  <span className="font-mono text-neutral-900 font-bold">{shares}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('potential_return', language, 'Potential Return:')}</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    +{(parseFloat(potentialPayout) - numAmount).toFixed(2)} {language === 'am' ? 'ብር' : 'Birr'} ({returnPercentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-200 font-bold text-neutral-900">
                  <span>{language === 'am' ? 'ጠቅላላ ክፍያ:' : 'Total Payout:'}</span>
                  <span className="font-mono text-emerald-600 text-sm">
                    {potentialPayout} {language === 'am' ? 'ብር' : 'Birr'}
                  </span>
                </div>
              </div>
            )}

            {/* Confirm Button — the only thing that executes the order */}
            <button
              onClick={handleConfirmOrder}
              disabled={
                isSubmitting ||
                (isSell ? numSellShares <= 0 || heldShares <= 0 : numAmount <= 0)
              }
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                isSell
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : selectedSide === 'yes'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'am' ? 'ትዕዛዝ በማስኬድ ላይ...' : 'Placing Order...'}
                </>
              ) : isSell ? (
                language === 'am'
                  ? `አረጋግጥ · ${numSellShares} ${selectedSide.toUpperCase()} አካባቢ ሽያጭ`
                  : `Confirm · Sell ${numSellShares} ${selectedSide.toUpperCase()} shares${sellClosesAll ? ' (close position)' : ''}`
              ) : (
                language === 'am'
                  ? `አረጋግጥ · ${selectedSide === 'yes' ? 'አዎ' : 'አይ'} በ ${numAmount} ብር ግዛ`
                  : `Confirm · Buy ${selectedSide.toUpperCase()} for ${numAmount} Birr`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
