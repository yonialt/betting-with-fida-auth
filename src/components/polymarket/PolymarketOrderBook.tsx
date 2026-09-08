import React, { useEffect, useMemo, useState } from 'react';
import { Layers, Activity } from 'lucide-react';

interface PolymarketOrderBookProps {
  /** Base price in cents (0-100) around which the book is built */
  basePriceCents: number;
  /** Volume label, e.g. "$240 Vol." */
  volumeLabel?: string;
  /** Seed for stable pseudo-random depth */
  seed?: string;
}

interface BookLevel {
  priceCents: number;
  size: number;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLevels(baseCents: number, seed: string): { bids: BookLevel[]; asks: BookLevel[] } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const rand = mulberry32(hash);

  const bids: BookLevel[] = [];
  const asks: BookLevel[] = [];

  // ~5 ticks on each side, 1-3 cents apart
  let bidPrice = baseCents;
  for (let i = 0; i < 5; i++) {
    bidPrice = Math.max(1, bidPrice - (1 + Math.floor(rand() * 3)));
    bids.push({ priceCents: bidPrice, size: Math.round((5 + rand() * 60) * 10) / 10 });
  }

  let askPrice = baseCents;
  for (let i = 0; i < 5; i++) {
    askPrice = Math.min(99, askPrice + (1 + Math.floor(rand() * 3)));
    asks.push({ priceCents: askPrice, size: Math.round((5 + rand() * 60) * 10) / 10 });
  }

  return { bids, asks };
}

export const PolymarketOrderBook: React.FC<PolymarketOrderBookProps> = ({
  basePriceCents,
  volumeLabel,
  seed = 'pm-orderbook',
}) => {
  const [view, setView] = useState<'both' | 'add' | 'asked'>('both');
  const [tick, setTick] = useState(0);

  // Subtle live re-tick so sizes/price feel real
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(interval);
  }, []);

  const { bids, asks } = useMemo(
    () => buildLevels(basePriceCents, `${seed}-${tick}`),
    [basePriceCents, seed, tick]
  );

  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);
  const mid = `${(basePriceCents / 100).toFixed(2)}`;

  const renderLevel = (level: BookLevel, kind: 'bid' | 'ask') => {
    const pct = (level.size / maxSize) * 100;
    return (
      <div key={`${kind}-${level.priceCents}`} className="relative flex items-center justify-between text-[11px] py-[3px] px-2 rounded-sm hover:bg-[#1a2334] transition-colors">
        <span
          className={`absolute inset-y-0 left-0 rounded-sm ${kind === 'bid' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
          style={{ width: `${pct}%` }}
        />
        <span className={`relative font-mono font-bold ${kind === 'bid' ? 'text-emerald-400' : 'text-rose-400'}`}>
          ${(level.priceCents / 100).toFixed(2)}
        </span>
        <span className="relative font-mono text-neutral-400">
          {level.size}
        </span>
      </div>
    );
  };

  const tabs: { id: 'both' | 'add' | 'asked'; label: string }[] = [
    { id: 'both', label: 'Add / Asked' },
    { id: 'add', label: 'Add' },
    { id: 'asked', label: 'Asked' },
  ];

  return (
    <div className="bg-[#0d121c] border border-[#1e293b] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-[#1e293b]">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-300">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Order Book</span>
          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold uppercase">
            <Activity className="w-2.5 h-2.5 animate-pulse" />
            Live
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500">{volumeLabel || '$240 Vol.'}</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              view === tab.id
                ? 'bg-[#222d3e] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-1 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
        <span>{view === 'asked' ? 'Asked Price' : 'Add Price'}</span>
        <span>Size</span>
      </div>

      {/* Levels */}
      <div className="px-1.5 pb-1.5 max-h-40 overflow-y-auto no-scrollbar">
        {(view === 'asked' || view === 'both') && (
          <div className="flex flex-col-reverse">{asks.map((a) => renderLevel(a, 'ask'))}</div>
        )}

        {(view === 'both') && (
          <div className="flex items-center justify-between px-2 py-1.5 my-1 bg-[#161f2f] border-y border-[#1e293b]">
            <span className="text-[10px] font-mono font-bold text-white">${mid}</span>
            <span className="text-[9px] text-neutral-500 uppercase tracking-wide">Mid</span>
          </div>
        )}

        {(view === 'add' || view === 'both') && (
          <div>{bids.map((b) => renderLevel(b, 'bid'))}</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#1e293b] flex items-center justify-between text-[9px] text-neutral-500">
        <span>Spread: {((asks[0]?.priceCents ?? basePriceCents) - (bids[0]?.priceCents ?? basePriceCents))}¢</span>
        <span className="font-mono">{volumeLabel || '$240 Vol.'} depth</span>
      </div>
    </div>
  );
};

export default PolymarketOrderBook;