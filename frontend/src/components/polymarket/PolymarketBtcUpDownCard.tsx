import React, { useEffect, useState, useRef } from 'react';
import { Bookmark, TrendingUp, TrendingDown, Zap, BarChart3 } from 'lucide-react';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { translateMarketTitle } from '../../data/polymarketTranslations';

interface PolymarketBtcUpDownCardProps {
  market: PolymarketMarket;
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail?: (market: PolymarketMarket) => void;
}

// Deterministic pseudo-random from a string seed (stable across renders)
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const PolymarketBtcUpDownCard: React.FC<PolymarketBtcUpDownCardProps> = ({
  market,
  onSelectOutcome,
  onOpenDetail,
}) => {
  const { language } = useBetting();
  const upOutcome = market.outcomes.find((o) => o.name.toLowerCase().includes('up')) || market.outcomes[0];
  const downOutcome = market.outcomes.find((o) => o.name.toLowerCase().includes('down')) || market.outcomes[1] || market.outcomes[0];

  // Live BTC price — try public Binance ticker, fall back to bundled data
  const [btcPrice, setBtcPrice] = useState<number>(market.currentPrice ?? 0);
  const [priceToBeat, setPriceToBeat] = useState<number>(market.priceToBeat ?? market.targetPrice ?? 0);
  const [isLiveFetch, setIsLiveFetch] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(
    (market.timerMins ?? 5) * 60 + (market.timerSecs ?? 0)
  );
  const [isBookmarked, setIsBookmarked] = useState(false);
  const randRef = useRef(seeded(market.id + '-depth'));

  // Live BTC price poll
  useEffect(() => {
    let cancelled = false;
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        if (res.ok) {
          const data = await res.json();
          const price = parseFloat(data.price);
          if (!cancelled && !isNaN(price) && price > 0) {
            setBtcPrice(price);
            setIsLiveFetch(true);
            // Price to beat drifts slightly above/below current for realism
            setPriceToBeat((prev) => (prev > 0 ? prev : price * 1.00003));
          }
        }
      } catch {
        // Offline — keep bundled price
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [market.id]);

  // Ticking countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Multiplier odds: 1 / probability (e.g. 51% -> 1.96x)
  const upOdds = upOutcome.probability > 0 ? (100 / upOutcome.probability).toFixed(2) : '1.00';
  const downOdds = downOutcome.probability > 0 ? (100 / downOutcome.probability).toFixed(2) : '1.00';
  const upProb = upOutcome.probability ?? 50;

  // Micro simulated price ticks so the number feels alive
  const [tickOffset, setTickOffset] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTickOffset((prev) => prev + (Math.random() * 8 - 4));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const displayPrice = btcPrice > 0 ? btcPrice + tickOffset : 0;
  const priceDiff = priceToBeat > 0 ? displayPrice - priceToBeat : 0;
  const diffClass = priceDiff >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const diffArrow = priceDiff >= 0 ? '▲' : '▼';

  // Deterministic depth bar (visual only)
  const depthFactor = () => 0.35 + randRef.current() * 0.45;

  const handleTrade = (side: 'up' | 'down') => {
    const outcome = side === 'up' ? upOutcome : downOutcome;
    onSelectOutcome({
      market,
      outcome,
      side,
      price: side === 'up' ? upOutcome.probability : downOutcome.probability,
    });
  };

  return (
    <div
      onClick={() => onOpenDetail?.(market)}
      className="bg-[#101622] border border-[#1a2333] hover:border-[#28374d] hover:shadow-xl rounded-2xl p-4 text-white flex flex-col justify-between transition-all shadow-md group cursor-pointer"
    >
      {/* Top Info */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <img
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Bitcoin_logo_clean.svg"
              alt="Bitcoin"
              className="w-8 h-8 rounded-lg object-contain bg-amber-500/20 border border-amber-500/30 shadow-xs"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML += '<div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-white text-sm shadow-xs">₿</div>';
                }
              }}
            />
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                {translateMarketTitle(market.title, language)}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                  {market.liveTag || 'LIVE Bitcoin'}
                </span>
              </div>
            </div>
          </div>

          {/* Circular Gauge */}
          <div
            className="w-11 h-11 rounded-full border-2 border-blue-500 bg-blue-950/60 flex flex-col items-center justify-center text-[10px] font-bold text-blue-400 shrink-0"
            title={`${upProb}% chance up`}
          >
            <span>{upProb}%</span>
            <span className="text-[8px] -mt-0.5 font-mono">Up</span>
          </div>
        </div>

        {/* Live BTC Price */}
        <div className="flex items-end justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">
              <BarChart3 className="w-3 h-3" />
              {market.subcategory || 'BTC/USD'} · Live
              {isLiveFetch && (
                <span className="text-emerald-400">●</span>
              )}
            </div>
            <div className="text-2xl font-extrabold font-mono text-white tracking-tight mt-0.5">
              ${displayPrice > 0 ? displayPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">
              Price to beat
            </div>
            <div className="font-mono font-bold text-sm text-neutral-200">
              ${priceToBeat > 0 ? priceToBeat.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
            </div>
            <div className={`text-[11px] font-mono font-bold mt-0.5 ${diffClass}`}>
              {priceToBeat > 0 ? `${diffArrow} $${Math.abs(priceDiff).toFixed(2)}` : ''}
            </div>
          </div>
        </div>

        {/* Countdown + Volume row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-300 bg-[#1a2334] border border-[#2e3b52] rounded-lg px-2.5 py-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatCountdown(countdown)}</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">{market.volume}</span>
        </div>

        {/* Split Green Up / Red Down multiplier buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTrade('up')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl p-2.5 flex items-center justify-between transition-all active:scale-95 cursor-pointer shadow-md group/up"
          >
            <span className="flex flex-col items-start">
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-100">
                <TrendingUp className="w-3.5 h-3.5" />
                {upProb}%
              </span>
              <span className="text-xs font-black uppercase mt-0.5">Up</span>
            </span>
            <span className="text-sm font-black font-mono">×{upOdds}</span>
          </button>

          <button
            onClick={() => handleTrade('down')}
            className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl p-2.5 flex items-center justify-between transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <span className="flex flex-col items-start">
              <span className="flex items-center gap-1 text-[11px] font-mono text-rose-100">
                <TrendingDown className="w-3.5 h-3.5" />
                {downOutcome.probability}%
              </span>
              <span className="text-xs font-black uppercase mt-0.5">Down</span>
            </span>
            <span className="text-sm font-black font-mono">×{downOdds}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          {/* Depth mini-bar */}
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-sm bg-emerald-500/70" style={{ height: `${10 + depthFactor() * 14}px` }} />
            <span className="w-1 h-3 rounded-sm bg-emerald-500/50" style={{ height: `${8 + depthFactor() * 10}px` }} />
            <span className="w-1 h-3 rounded-sm bg-rose-500/50" style={{ height: `${8 + depthFactor() * 10}px` }} />
            <span className="w-1 h-3 rounded-sm bg-rose-500/70" style={{ height: `${10 + depthFactor() * 14}px` }} />
          </div>
          <span className="font-semibold text-neutral-300">{market.orderBookVolume || '$240 Vol.'}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked((prev) => !prev);
          }}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default PolymarketBtcUpDownCard;
