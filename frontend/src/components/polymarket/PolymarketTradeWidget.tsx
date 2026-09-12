import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { t, translateMarketTitle, translateOutcomeName } from '../../data/polymarketTranslations';

interface PolymarketTradeWidgetProps {
  market: PolymarketMarket;
  onTradeExecuted?: (trade: PolymarketTradeState, amount: number) => void;
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
  className = '',
}) => {
  const { placeBet, user, language } = useBetting();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [selectedOutcomeSide, setSelectedOutcomeSide] = useState<'yes' | 'no'>('yes');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [showOrderTypeMenu, setShowOrderTypeMenu] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);

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

  // Potential payout calculation: shares = (amount / (price / 100))
  const calculatedShares =
    amount > 0 && currentPrice > 0 ? (amount / (currentPrice / 100)).toFixed(1) : '0';
  const potentialReturn =
    amount > 0 && currentPrice > 0 ? (Number(calculatedShares) * 1).toFixed(2) : '0.00';

  const handleQuickAdd = (value: number) => {
    setAmount((prev) => prev + value);
  };

  const handleExecuteTrade = () => {
    if (amount <= 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setTradeSuccess(true);

      const tradeState: PolymarketTradeState = {
        market,
        outcome: activeOutcome,
        side: selectedOutcomeSide,
        price: currentPrice,
      };

      onTradeExecuted?.(tradeState, amount);

      // Place bet in context if available
      try {
        placeBet();
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
          {/* Avatar Thumbnail — real market image, else a category-matched emblem */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#2e3b52] bg-[#1a2232] flex items-center justify-center">
            {market.imageUrl ? (
              <img
                src={market.imageUrl}
                alt={market.title}
                className="w-full h-full object-cover"
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
                  ? 'scale-110 text-rose-100'
                  : ''
              }`}
            >
              {noPrice}%
            </span>
          </button>
        </div>

        {/* 4. Amount Input Section — typeable, comma-formatted (like the reference) */}
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

        {/* 5. Trade Button */}
        <button
          onClick={handleExecuteTrade}
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${
            tradeSuccess
              ? 'bg-emerald-600 text-white'
              : amount > 0
              ? 'bg-[#0084ff] hover:bg-[#0070db] text-white shadow-blue-900/30'
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
