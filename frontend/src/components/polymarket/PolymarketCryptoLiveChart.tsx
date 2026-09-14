import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Code2,
  Link2,
  Info,
} from 'lucide-react';
import { useBetting } from '../../context/BettingContext';
import { PolymarketTradingChart } from './PolymarketTradingChart';
import { CryptoLivePriceChart } from './CryptoLivePriceChart';
import {
  CandleData,
  OrderbookDepthData,
  generateHistoricalCandles,
  generateOrderbookDepth,
  subscribeToMockPriceFeed,
} from '../../services/mockMarketFeed';

/* ============================================================================
   PolymarketCryptoLiveChart
   The "<COIN> Up or Down 5m" live card. The chart is the TradingView
   (lightweight-charts) candlestick/depth chart — the same one used on the
   BTC market detail — fed by a live candle feed, per crypto (symbol, price-to-
   beat, current price). Reused for every crypto (BTC, ETH, SOL, ...).
   ============================================================================ */

export interface CryptoConfig {
  symbol: string;
  name: string;
  priceToBeat: number;
  currentPrice: number;
  color: string;
  logoUrl?: string;
}

interface Props {
  crypto: CryptoConfig;
  onBack: () => void;
  isDarkMode?: boolean;
}

/* ---- helpers -------------------------------------------------------------- */

// Probability-style Up price in cents, driven by distance from the target.
function computeUpCents(cur: number, beat: number): number {
  const scale = beat * 0.0003;
  const p = 1 / (1 + Math.exp(-(cur - beat) / scale));
  return Math.max(5, Math.min(95, Math.round(p * 100)));
}

function fmtPrice(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(4);
}

function fmtWin(v: number): string {
  return v < 10 ? v.toFixed(2) : Math.round(v).toLocaleString();
}

function fmtClock(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const PolymarketCryptoLiveChart: React.FC<Props> = ({ crypto, onBack, isDarkMode = false }) => {
  // Follow the live Polymarket theme from context (the isDarkMode prop can be stale).
  const { polymarketDarkMode } = useBetting();
  const isDark = polymarketDarkMode ?? isDarkMode;

  /* theme tokens */
  const T = isDark
    ? {
        page: 'text-neutral-100',
        card: 'bg-[#0e1520] border-[#1b2536]',
        soft: 'text-neutral-400',
        pill: 'bg-[#121a27] border-[#1d2738] text-neutral-300 hover:text-white',
        pillActive: 'bg-white text-neutral-950',
        divider: '#1b2536',
      }
    : {
        page: 'text-neutral-900',
        card: 'bg-white border-neutral-200',
        soft: 'text-neutral-500',
        pill: 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900',
        pillActive: 'bg-neutral-900 text-white',
        divider: '#eceff3',
      };

  const beat = crypto.priceToBeat;
  const basePrice = crypto.currentPrice || crypto.priceToBeat || 100;
  const lineColor = crypto.color || '#f59e0b';

  /* ---- live candle feed for the TradingView chart ---- */
  const [candles, setCandles] = useState<CandleData[]>(() => generateHistoricalCandles(basePrice, 70, 300));
  const [orderbook, setOrderbook] = useState<OrderbookDepthData>(() => generateOrderbookDepth(basePrice));

  /* ---- card state ---- */
  const [secs, setSecs] = useState<number>(240);
  const [side, setSide] = useState<'up' | 'down'>('up');
  const [buySell, setBuySell] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState<string>('5 Min');
  const [pastOpen, setPastOpen] = useState<boolean>(false);
  const [chartMode, setChartMode] = useState<'probability' | 'candles' | 'depth'>('candles');

  // Candle interval (seconds) for the selected timeframe.
  const intervalSeconds =
    timeframe === '15 Min' ? 900 : timeframe === '1 Hour' ? 3600 : timeframe === '1 Day' ? 86400 : 300;

  // Rebuild the candle history synchronously when the timeframe (interval) or coin
  // changes, so the chart — keyed on candleKey — remounts with the correct data
  // instead of trying to patch a fresh dataset onto the old one.
  const candleKey = `${basePrice}|${intervalSeconds}`;
  const [builtKey, setBuiltKey] = useState<string>(candleKey);
  if (builtKey !== candleKey) {
    setBuiltKey(candleKey);
    setCandles(generateHistoricalCandles(basePrice, 70, intervalSeconds));
    setOrderbook(generateOrderbookDepth(basePrice));
  }

  /* subscribe to the live mock price feed → streams into candles + orderbook */
  useEffect(() => {
    const unsubscribe = subscribeToMockPriceFeed(basePrice, (tick) => {
      setCandles((prev) => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const bucketTime = Math.floor(tick.time / intervalSeconds) * intervalSeconds;
        if (last.time === bucketTime) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              high: Math.max(last.high, tick.price),
              low: Math.min(last.low, tick.price),
              close: tick.price,
              volume: last.volume + tick.volumeDelta,
            },
          ];
        } else if (tick.time > last.time) {
          return [
            ...prev.slice(-100),
            {
              time: bucketTime,
              open: last.close,
              high: Math.max(last.close, tick.price),
              low: Math.min(last.close, tick.price),
              close: tick.price,
              volume: tick.volumeDelta,
            },
          ];
        }
        return prev;
      });
      setOrderbook((prev) => ({ ...prev, midPrice: tick.price }));
    });
    return unsubscribe;
  }, [basePrice, intervalSeconds]);

  /* countdown every 1s, resets to 5:00 */
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 300)), 1000);
    return () => clearInterval(t);
  }, []);

  const currentPrice = candles.length ? candles[candles.length - 1].close : basePrice;
  const upCents = computeUpCents(currentPrice, beat);
  const downCents = 101 - upCents;
  const activeCents = side === 'up' ? upCents : downCents;

  const mins = Math.floor(secs / 60);
  const ss = secs % 60;

  /* round pills (5-min boundaries around now) + past history */
  const roundPills = useMemo(() => {
    const now = new Date();
    const base = new Date(now);
    base.setMinutes(Math.floor(now.getMinutes() / 5) * 5, 0, 0);
    return [-3, -2, -1, 0, 1].map((k) => {
      const d = new Date(base.getTime() + k * 5 * 60000);
      return { label: fmtClock(d), live: k === 0, next: k === 1 };
    });
  }, [secs > 250]);

  const pastRounds = useMemo(() => {
    const now = new Date();
    const base = new Date(now);
    base.setMinutes(Math.floor(now.getMinutes() / 5) * 5, 0, 0);
    return Array.from({ length: 8 }).map((_, i) => {
      const d = new Date(base.getTime() - (i + 1) * 5 * 60000);
      return { label: `${fmtClock(d)} · Today`, up: [true, true, false, true, false, true, true, false][i] };
    });
  }, []);

  const outcomeHistory = [true, true, true, false, true];
  const oneTapAmounts = [5, 25, 100];

  return (
    <div className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 ${T.page}`}>
      {/* Back */}
      <button
        onClick={onBack}
        className={`mb-3 inline-flex items-center gap-1.5 text-xs font-semibold ${T.soft} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All crypto markets</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* ================= LEFT : CHART CARD ================= */}
        <div className={`flex-1 rounded-2xl border ${T.card} p-4 sm:p-5`}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {crypto.logoUrl ? (
                <img
                  src={crypto.logoUrl}
                  alt={crypto.symbol}
                  className="w-9 h-9 rounded-xl object-contain shadow-sm shrink-0"
                  style={{ backgroundColor: lineColor }}
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-sm shrink-0"
                  style={{ backgroundColor: lineColor }}
                >
                  {crypto.symbol.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-lg font-black tracking-tight truncate">{crypto.symbol} Up or Down 5m</h1>
                <div className={`flex items-center gap-1 text-[11px] ${T.soft}`}>
                  <span>Live 5-minute round</span>
                  <Info className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${T.soft}`}>
              <Code2 className="w-4 h-4 cursor-pointer hover:opacity-70" />
              <Link2 className="w-4 h-4 cursor-pointer hover:opacity-70" />
              <Bookmark className="w-4 h-4 cursor-pointer hover:opacity-70" />
            </div>
          </div>

          {/* Price row + countdown */}
          <div className="flex items-end justify-between gap-4 mt-4">
            <div className="flex items-end gap-6">
              <div>
                <div className={`text-[11px] font-semibold ${T.soft}`}>Price To Beat</div>
                <div className="text-xl font-black font-mono tracking-tight">{fmtPrice(beat)} ETB</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold" style={{ color: lineColor }}>
                  Current Price
                </div>
                <div className="text-xl font-black font-mono tracking-tight" style={{ color: lineColor }}>
                  {fmtPrice(currentPrice)} ETB
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right leading-none">
                <div className="flex items-center gap-2 font-black font-mono text-rose-500 text-2xl tabular-nums">
                  <span>{String(mins).padStart(2, '0')}</span>
                  <span>{String(ss).padStart(2, '0')}</span>
                </div>
                <div className={`flex items-center gap-6 text-[9px] font-bold ${T.soft} justify-end pr-0.5`}>
                  <span>MINS</span>
                  <span>SECS</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- CHART: Probability (live line) / K-Line Candles (TradingView) / Orderbook Depth ---- */}
          <div className="mt-3">
            {/* Mode selector pills */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border w-max mb-2.5 ${
                isDark ? 'bg-[#090d14] border-[#1b2536]' : 'bg-neutral-100 border-neutral-200'
              }`}
            >
              {([
                { k: 'probability', label: 'Probability' },
                { k: 'candles', label: 'K-Line Candles' },
                { k: 'depth', label: 'Orderbook Depth' },
              ] as const).map((m) => (
                <button
                  key={m.k}
                  onClick={() => setChartMode(m.k)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    chartMode === m.k
                      ? isDark
                        ? 'bg-[#1e2738] text-white'
                        : 'bg-white text-neutral-900 shadow-sm'
                      : isDark
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {chartMode === 'probability' ? (
              <CryptoLivePriceChart
                symbol={crypto.symbol}
                priceToBeat={beat}
                currentPrice={currentPrice}
                color={lineColor}
              />
            ) : (
              <PolymarketTradingChart
                key={candleKey}
                candles={candles}
                orderbook={orderbook}
                symbol={`${crypto.symbol}/USD · ${timeframe}`}
                targetPrice={beat * 1.00002}
                priceToBeat={beat}
                currentPrice={currentPrice}
                initialViewMode={chartMode === 'depth' ? 'depth' : 'candles'}
                hideViewToggle
                isDarkMode={isDark}
              />
            )}
          </div>

          {/* ---- BOTTOM TOOLBAR ---- */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Past dropdown */}
            <div className="relative">
              <button
                onClick={() => setPastOpen((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${T.pill} transition-colors cursor-pointer`}
              >
                Past <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {pastOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPastOpen(false)} />
                  <div className={`absolute left-0 bottom-full mb-1.5 w-52 rounded-xl border shadow-2xl z-40 py-1 ${isDark ? 'bg-[#0e1520] border-[#1d2738]' : 'bg-white border-neutral-200'}`}>
                    {pastRounds.map((r, i) => (
                      <div key={i} className={`flex items-center gap-2 px-3 py-1.5 text-xs ${T.soft}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${r.up ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {r.up ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-white" />}
                        </span>
                        <span className="font-semibold">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* outcome history pills */}
            <div className="flex items-center gap-1">
              {outcomeHistory.map((up, i) => (
                <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center ${up ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {up ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-white" />}
                </span>
              ))}
            </div>

            {/* round pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {roundPills.map((p, i) => (
                <button
                  key={i}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    p.next ? T.pillActive + ' border-transparent' : T.pill
                  }`}
                >
                  {p.live && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                  {p.label}
                </button>
              ))}
              <button className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${T.pill} flex items-center gap-1 cursor-pointer`}>
                More <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT : TRADE PANEL ================= */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-3">
          <div className={`rounded-2xl border ${T.card} p-4`}>
            {/* head */}
            <div className="flex items-center gap-2.5 mb-3">
              {crypto.logoUrl ? (
                <img
                  src={crypto.logoUrl}
                  alt={crypto.symbol}
                  className="w-8 h-8 rounded-lg object-contain"
                  style={{ backgroundColor: lineColor }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: lineColor }}>
                  {crypto.symbol.slice(0, 1)}
                </div>
              )}
              <div>
                <div className="text-xs font-semibold">{crypto.symbol} Up or Down 5m</div>
                <div className={`text-sm font-black ${side === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {side === 'up' ? 'Up' : 'Down'}
                </div>
              </div>
            </div>

            {/* Buy/Sell + 1-Tap */}
            <div className="flex items-center justify-between border-b mb-3" style={{ borderColor: T.divider }}>
              <div className="flex items-center gap-4">
                {(['buy', 'sell'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBuySell(b)}
                    className={`pb-2 text-sm font-bold capitalize transition-colors cursor-pointer border-b-2 -mb-px ${
                      buySell === b ? 'border-current' : 'border-transparent ' + T.soft
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <button className={`flex items-center gap-1 text-xs font-semibold ${T.soft} cursor-pointer`}>
                1-Tap <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Up / Down price buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSide('up')}
                className={`py-3 rounded-xl font-black text-sm transition-all cursor-pointer ${
                  side === 'up'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow'
                    : isDark
                    ? 'bg-[#121a27] border border-[#1d2738] text-neutral-300 hover:text-white'
                    : 'bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Up {upCents}%
              </button>
              <button
                onClick={() => setSide('down')}
                className={`py-3 rounded-xl font-black text-sm transition-all cursor-pointer ${
                  side === 'down'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow'
                    : isDark
                    ? 'bg-[#121a27] border border-[#1d2738] text-neutral-300 hover:text-white'
                    : 'bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Down {downCents}%
              </button>
            </div>

            {/* One-tap buy */}
            <div className={`text-xs font-bold mb-2 ${T.soft}`}>One-tap buy</div>
            <div className="grid grid-cols-3 gap-2">
              {oneTapAmounts.map((amt) => (
                <button
                  key={amt}
                  className={`py-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    isDark ? 'bg-[#0b1018] border-[#1a2434] hover:border-[#25344c]' : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-base font-black">{amt} ETB</div>
                  <div className="text-[10px] font-semibold">
                    <span className={T.soft}>win </span>
                    <span className="text-emerald-500">{fmtWin((amt * 100) / activeCents)} ETB</span>
                  </div>
                </button>
              ))}
            </div>

            <p className={`text-[10px] mt-3 ${T.soft}`}>
              By trading, you agree to the <span className="underline">Terms of Use</span>.
            </p>
          </div>

          {/* timeframe tabs */}
          <div className="flex items-center gap-2">
            {['5 Min', '15 Min', '1 Hour', '1 Day'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  timeframe === tf ? T.pillActive + ' border-transparent' : T.pill
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
