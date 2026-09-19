import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { t, translateMarketTitle, translateOutcomeName } from '../../data/polymarketTranslations';
import { heroSlideLogoUrl } from '../../data/polymarketExtendedData';
import { marketLogoUrl } from '../../data/polymarketData';
import {
  polymarketTradingApi,
  PmPosition,
  PM_PORTFOLIO_CHANGED,
} from '../../services/polymarketTradingApi';

interface PolymarketTradeWidgetProps {
  market: PolymarketMarket;
  onTradeExecuted?: (trade: PolymarketTradeState, amount: number) => void;
  /**
   * Prediction-market confirmation mode: when set, the Trade button no longer
   * executes locally — it hands the order to the parent to show a confirmation
   * modal, and the backend executes it on confirm. The sportsbook bet slip is
   * never involved.
   */
  onConfirmOrder?: (trade: PolymarketTradeState, amount: number) => void;
  className?: string;
}

// Pick a logo/emblem that matches the market instead of a generic stock photo.
const getMarketEmoji = (m: PolymarketMarket): string => {
  const s = `${m.category || ''} ${m.subcategory || ''} ${m.title || ''}`.toLowerCase();
  if (/mlb|baseball|brewers|reds|yankees|dodgers|tigers|guardians/.test(s)) return '⚾';
  if (/nba|basketball/.test(s)) return '🏀';
  if (/nfl|american football/.test(s)) return '🏈';
  if (/soccer|premier|la liga|serie a|uefa|fifa|world cup/.test(s)) return '⚽';
  if (/tennis|kostyuk|noskova/.test(s)) return '🎾';
  if (/esport|cs2|counter-strike|league of legends|valorant|dota|spirit|mouz|g2/.test(s)) return '🎮';
  if (/crypto|bitcoin|\bbtc\b|\beth\b|solana|coin/.test(s)) return '🪙';
  if (/politic|election|senate|midterm|congress|president|fed |fomc/.test(s)) return '🏛️';
  if (/geopolit|china|taiwan|russia|ukraine|\bwar\b|invasion|red sea/.test(s)) return '🌍';
  if (/\bai\b|anthropic|openai|gemini|tech|model|clarity act/.test(s)) return '🤖';
  if (/weather|hurricane|temperature|rain|storm/.test(s)) return '🌦️';
  if (/addis|ethiop|federal city|military service/.test(s)) return '🇪🇹';
  if (/sport/.test(s)) return '🏆';
  return '📊';
};

export const PolymarketTradeWidget: React.FC<PolymarketTradeWidgetProps> = ({
  market,
  onTradeExecuted,
  onConfirmOrder,
  className = '',
}) => {
  const { user, language } = useBetting();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [selectedOutcomeSide, setSelectedOutcomeSide] = useState<'yes' | 'no'>('yes');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [showOrderTypeMenu, setShowOrderTypeMenu] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // SELL mode: the user's open position on this market (either side) and the
  // number of shares they want to sell. Powered by the real backend position.
  const [heldPosition, setHeldPosition] = useState<PmPosition | null>(null);
  const [sellShares, setSellShares] = useState<string>('');

  // Real-time live drift & price tick simulation (matching chart live behavior)
  const [liveDriftOffset, setLiveDriftOffset] = useState<number>(0);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Micro drift (-1, 0, +1)
      const delta = (Math.random() - 0.5) > 0 ? 0.4 : -0.4;
      setLiveDriftOffset((prev) => {
        const next = Math.max(-1.4, Math.min(1.4, prev + delta));
        const diff = Math.round(next) - Math.round(prev);
        if (diff > 0) {
          setPriceFlash('up');
          setTimeout(() => setPriceFlash(null), 750);
        } else if (diff < 0) {
          setPriceFlash('down');
          setTimeout(() => setPriceFlash(null), 750);
        }
        return next;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [market.id]);

  const activeOutcome = market.outcomes[0] || {
    name: '25 bps increase',
    probability: 57,
    yesPrice: 58,
    noPrice: 43,
  };

  // Derive consistent Yes/No prices with live drift applied
  const rawYes =
    activeOutcome.yesPrice && activeOutcome.yesPrice > 0
      ? activeOutcome.yesPrice
      : activeOutcome.probability ?? 50;
  const baseYesPrice = Math.min(99, Math.max(1, Math.round(rawYes)));
  const yesPrice = Math.min(99, Math.max(1, Math.round(baseYesPrice + liveDriftOffset)));
  const noPrice = 100 - yesPrice;
  const currentPrice = selectedOutcomeSide === 'yes' ? yesPrice : noPrice;

  // Load the real open position for this market so Sell can close it (crypto-style).
  const loadHeldPosition = async () => {
    if (!user.isLoggedIn) {
      setHeldPosition(null);
      return;
    }
    try {
      const open = await polymarketTradingApi.openPositions();
      const mine = open.filter((p) => p.marketId === market.id && p.shares > 0);
      setHeldPosition(mine.length > 0 ? mine[0] : null);
    } catch {
      setHeldPosition(null);
    }
  };

  useEffect(() => {
    loadHeldPosition();
    // Re-check holdings whenever any confirmed order lands (incl. this widget's own)
    // and whenever the user opens the Sell tab, so the shares input is current.
    const onPmChange = () => loadHeldPosition();
    window.addEventListener(PM_PORTFOLIO_CHANGED, onPmChange);
    return () => window.removeEventListener(PM_PORTFOLIO_CHANGED, onPmChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market.id, user.isLoggedIn, orderSide]);

  // Potential payout calculation: shares = (amount / (price / 100))
  const calculatedShares =
    amount > 0 && currentPrice > 0 ? (amount / (currentPrice / 100)).toFixed(1) : '0';
  const potentialReturn =
    amount > 0 && currentPrice > 0 ? (Number(calculatedShares) * 1).toFixed(2) : '0.00';

  const handleQuickAdd = (value: number) => {
    setAmount((prev) => prev + value);
  };

  // SELL sizing: shares typed, capped at what the user actually holds.
  const numSellShares = parseFloat(sellShares) || 0;
  const heldShares = heldPosition ? heldPosition.shares : 0;
  const sellPrice = heldPosition ? heldPosition.currentPriceCents : currentPrice;
  const sellProceeds = Math.round(numSellShares * sellPrice) / 100;
  const sellPnl =
    heldPosition && numSellShares > 0
      ? Math.round(
          (numSellShares * sellPrice - numSellShares * heldPosition.avgPriceCents) / 100 * 100,
        ) / 100
      : 0;

  const handleExecuteTrade = () => {
    // ---- SELL: close part/all of the held position at the live market price ----
    if (orderSide === 'sell') {
      if (!heldPosition || numSellShares <= 0) return;
      const sellState: PolymarketTradeState = {
        market,
        outcome: activeOutcome,
        side: heldPosition.side,
        price: sellPrice,
        orderAction: 'SELL',
        sellShares: Math.min(numSellShares, heldPosition.shares),
        heldShares: heldPosition.shares,
        heldAvgPriceCents: heldPosition.avgPriceCents,
      };
      // Confirmation flow: the modal reviews and executes the SELL on confirm.
      if (onConfirmOrder) {
        onConfirmOrder(sellState, 0);
        return;
      }
      // Standalone (no confirmation modal attached): execute against the backend now.
      setIsSubmitting(true);
      polymarketTradingApi
        .placeOrder({
          action: 'SELL',
          marketId: market.id,
          side: heldPosition.side,
          priceCents: sellPrice,
          shares: Math.min(numSellShares, heldPosition.shares),
        })
        .then(() => {
          setTradeSuccess(true);
          setSellShares('');
          window.dispatchEvent(new CustomEvent(PM_PORTFOLIO_CHANGED));
          setTimeout(() => setTradeSuccess(false), 2000);
        })
        .catch(() => {
          // Validation errors (no position / too many shares) — state resets below.
        })
        .finally(() => setIsSubmitting(false));
      return;
    }

    // ---- BUY: open/extend a position ----
    if (amount <= 0) return;

    const tradeState: PolymarketTradeState = {
      market,
      outcome: activeOutcome,
      side: selectedOutcomeSide,
      price: currentPrice,
      amount,
      orderAction: 'BUY',
    };

    // Prediction-market confirmation flow: hand the order to the confirmation
    // modal; the backend executes it only after the user reviews and confirms.
    if (onConfirmOrder) {
      onConfirmOrder(tradeState, amount);
      return;
    }

    // Legacy standalone behavior (kept for direct usages without confirmation):
    // simulate fill locally and notify.
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTradeSuccess(true);

      onTradeExecuted?.(tradeState, amount);

      try {
        window.dispatchEvent(new CustomEvent(PM_PORTFOLIO_CHANGED));
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
          {/* Avatar Thumbnail — hero-slide logo, market image, else a category-matched emblem */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#2e3b52] bg-[#1a2232] flex items-center justify-center">
            {market.logoUrl ? (
              <img
                src={market.logoUrl}
                alt={market.title}
                className="w-full h-full object-contain"
              />
            ) : marketLogoUrl[market.id] ? (
              <img
                src={marketLogoUrl[market.id]}
                alt={market.title}
                className="w-full h-full object-contain"
              />
            ) : market.imageUrl ? (
              <img
                src={market.imageUrl}
                alt={market.title}
                className="w-full h-full object-cover"
              />
            ) : market.avatarUrl ? (
              <img
                src={market.avatarUrl}
                alt={market.title}
                className="w-full h-full object-cover"
              />
            ) : heroSlideLogoUrl[market.id] ? (
              <img
                src={heroSlideLogoUrl[market.id]}
                alt={market.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <span
                className="text-xl leading-none select-none"
                role="img"
                aria-label={market.category || 'market'}
              >
                {getMarketEmoji(market)}
              </span>
            )}
          </div>

          {/* Titles */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
              <span>{market.category}</span>
              <span>·</span>
              <span className="text-neutral-300">{market.subcategory || ''}</span>
            </div>
            <h4 className="text-xs text-neutral-300 font-medium truncate">
              {translateMarketTitle(market.title, language)}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-white truncate">
                {translateOutcomeName(activeOutcome.name, language)}
              </span>
              <span className="text-neutral-500 font-bold">·</span>
              <span
                className={`text-xs font-bold ${
                  selectedOutcomeSide === 'yes' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedOutcomeSide === 'yes'
                  ? (language === 'am' ? 'አዎ' : 'Yes')
                  : (language === 'am' ? 'አይ' : 'No')}
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
              {t('buy', language, 'Buy')}
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`pb-1 transition-all cursor-pointer ${
                orderSide === 'sell'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('sell', language, 'Sell')}
            </button>
          </div>

          {/* Market / Limit Selector */}
          <div className="relative">
            <button
              onClick={() => setShowOrderTypeMenu(!showOrderTypeMenu)}
              className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white font-semibold py-1 px-2 rounded-lg bg-[#1a2232] border border-[#2e3b52] transition-colors cursor-pointer"
            >
              <span>{orderType === 'Market' ? (language === 'am' ? 'ገበያ' : 'Market') : (language === 'am' ? 'ወሰን' : 'Limit')}</span>
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
                  <span>{language === 'am' ? 'ገበያ' : 'Market'}</span>
                  {orderType === 'Market' && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
                <button
                  onClick={() => {
                    setOrderType('Limit');
                    setShowOrderTypeMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[#253248] font-medium flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'am' ? 'ወሰን' : 'Limit'}</span>
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
            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedOutcomeSide === 'yes'
                ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/50'
                : 'bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] border border-[#22c55e]/40'
            }`}
          >
            {/* Pulsing Radar Dot */}
            <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 duration-1000 ${
                  selectedOutcomeSide === 'yes' ? 'bg-white' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  selectedOutcomeSide === 'yes' ? 'bg-white' : 'bg-emerald-400'
                }`}
              />
            </span>
            <span>{translateOutcomeName('Yes', language)}</span>
            <span
              className={`font-extrabold transition-all duration-300 ${
                priceFlash === 'up' && selectedOutcomeSide === 'yes'
                  ? 'scale-110 text-emerald-100'
                  : ''
              }`}
            >
              {yesPrice}%
            </span>
          </button>

          {/* NO Button */}
          <button
            onClick={() => setSelectedOutcomeSide('no')}
            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedOutcomeSide === 'no'
                ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-lg shadow-rose-950/40 ring-2 ring-rose-400/50'
                : 'bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] border border-[#ef4444]/40'
            }`}
          >
            {/* Pulsing Radar Dot */}
            <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 duration-1000 ${
                  selectedOutcomeSide === 'no' ? 'bg-white' : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  selectedOutcomeSide === 'no' ? 'bg-white' : 'bg-rose-400'
                }`}
              />
            </span>
            <span>{translateOutcomeName('No', language)}</span>
            <span
              className={`font-extrabold transition-all duration-300 ${
                priceFlash === 'down' && selectedOutcomeSide === 'no'
                  ? 'scale-110 text-emerald-100'
                  : ''
              }`}
            >
              {noPrice}%
            </span>
          </button>
        </div>

        {/* 4. Amount (BUY) or Shares (SELL) input — same styling, mode-dependent */}
        {orderSide === 'sell' ? (
          <div className="mb-3">
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="shrink-0">
                <span className="text-sm font-semibold text-white block">
                  {t('sell_shares', language, 'Shares to sell')}
                </span>
                {heldPosition ? (
                  <span className="text-[11px] text-neutral-500">
                    {t('you_hold', language, 'You hold')}{' '}
                    <span className="text-emerald-400 font-mono font-bold">
                      {heldPosition.shares}
                    </span>{' '}
                    {heldPosition.side.toUpperCase()} @ {(heldPosition.avgPriceCents / 100).toFixed(2)} ETB{' '}
                    {t('avg', language, 'avg')}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400">
                    {t('no_position', language, 'No open position on this market')}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 flex-1 justify-end min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={sellShares}
                  onChange={(e) => setSellShares(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  disabled={!heldPosition}
                  className="min-w-0 flex-1 text-right bg-transparent text-3xl sm:text-4xl font-extrabold font-mono text-white placeholder-neutral-600 focus:outline-none disabled:opacity-40"
                />
                <span className="text-xs font-bold text-neutral-400 font-mono self-end mb-1.5 shrink-0">
                  {t('shares', language, 'shares')}
                </span>
              </div>
            </div>

            {/* Quick share chips: 25% / 50% / 75% / MAX — same chip styling */}
            <div className="flex items-center justify-end gap-1.5">
              {[25, 50, 75].map((pct) => (
                <button
                  key={pct}
                  onClick={() =>
                    heldPosition &&
                    setSellShares(String(Math.floor(heldPosition.shares * (pct / 100) * 10000) / 10000))
                  }
                  disabled={!heldPosition}
                  className="px-2.5 py-1 rounded-lg bg-[#1a2232] hover:bg-[#253248] text-neutral-300 hover:text-white border border-[#2e3b52] text-xs font-semibold font-mono transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pct}%
                </button>
              ))}
              <button
                onClick={() =>
                  heldPosition && setSellShares(String(Math.floor(heldPosition.shares * 10000) / 10000))
                }
                disabled={!heldPosition}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                MAX
              </button>
              {sellShares && (
                <button
                  onClick={() => setSellShares('')}
                  className="px-2 py-1 rounded-lg bg-[#1a2232] hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 border border-[#2e3b52] text-xs font-semibold transition-all cursor-pointer"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Proceeds preview — mirrors the BUY 'To win' block styling */}
            {numSellShares > 0 && heldPosition && (
              <div className="flex items-center justify-between gap-3 mb-4 pt-3 border-t border-[#1e293b]">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                    <span>{t('you_receive', language, 'You receive')}</span>
                    <span aria-hidden="true">💵</span>
                  </div>
                  <div
                    className={`text-[11px] font-mono mt-0.5 ${
                      sellPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sellPnl >= 0 ? '+' : ''}
                    {sellPnl.toFixed(2)} {language === 'am' ? 'ብር' : 'ETB'}{' '}
                    {t('pnl', language, 'P/L')}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-right truncate">
                  {sellProceeds.toFixed(2)}{' '}
                  <span className="text-sm text-amber-400">{language === 'am' ? 'ብር' : 'ETB'}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2 gap-3">
            <div className="shrink-0">
              <span className="text-sm font-semibold text-white block">
                {t('amount', language, 'Amount')}
              </span>
              <span className="text-[11px] text-neutral-500">
                {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                {language === 'am' ? 'ብር ቀሪ' : 'ETB cash'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 flex-1 justify-end min-w-0">
              <input
                type="text"
                inputMode="numeric"
                value={amount ? amount.toLocaleString() : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(digits ? Math.min(parseInt(digits, 10), 99999999) : 0);
                }}
                placeholder="0"
                className="min-w-0 flex-1 text-right bg-transparent text-3xl sm:text-4xl font-extrabold font-mono text-white placeholder-neutral-600 focus:outline-none"
              />
              <span className="text-xs font-bold text-amber-400 font-mono self-end mb-1.5 shrink-0">
                {language === 'am' ? 'ብር' : 'ETB'}
              </span>
            </div>
          </div>

          {/* Quick Increment Chips */}
          <div className="flex items-center justify-end gap-1.5">
            {[10, 50, 100, 500].map((val) => (
              <button
                key={val}
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 rounded-lg bg-[#1a2232] hover:bg-[#253248] text-neutral-300 hover:text-white border border-[#2e3b52] text-xs font-semibold font-mono transition-all active:scale-95 cursor-pointer"
              >
                +{val}
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
        )}

        {/* To win payout (prominent, like the reference) */}
        {amount > 0 && (
          <div className="flex items-center justify-between gap-3 mb-4 pt-3 border-t border-[#1e293b]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                <span>{language === 'am' ? 'ለማሸነፍ' : 'To win'}</span>
                <span aria-hidden="true">💵</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {t('avg_price', language, 'Avg. Price')} {currentPrice}%
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono text-right truncate">
              {Number(potentialReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              {language === 'am' ? 'ብር' : 'ETB'}
            </div>
          </div>
        )}

        {/* 5. Trade Button — Sell uses rose, Buy uses the existing blue */}
        <button
          onClick={handleExecuteTrade}
          disabled={isSubmitting || (orderSide === 'sell' && (!heldPosition || numSellShares <= 0))}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
            tradeSuccess
              ? 'bg-emerald-600 text-white'
              : orderSide === 'sell'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
              : 'bg-[#0084ff] hover:bg-[#0070db] text-white shadow-blue-900/30'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {language === 'am' ? 'ትዕዛዝ በማስኬድ ላይ...' : 'Executing Order...'}
            </span>
          ) : tradeSuccess ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              {language === 'am' ? 'ትዕዛዝ ተጠናቋል!' : 'Order Placed!'}
            </span>
          ) : orderSide === 'sell' ? (
            <span>
              {t('sell', language, 'Sell')}
              {heldPosition && numSellShares > 0
                ? ` ${numSellShares} ${heldPosition.side.toUpperCase()}`
                : ''}
            </span>
          ) : (
            <span>{t('trade', language, 'Trade')}</span>
          )}
        </button>

        {/* 6. Terms Disclaimer */}
        <p className="text-[11px] text-neutral-500 text-center mt-3">
          {language === 'am' ? (
            <>በመገበያየት <span className="underline hover:text-neutral-400 cursor-pointer">የአጠቃቀም ደንቦችን</span> ተስማምተዋል።</>
          ) : (
            <>By trading, you agree to the <span className="underline hover:text-neutral-400 cursor-pointer">Terms of Use</span>.</>
          )}
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
