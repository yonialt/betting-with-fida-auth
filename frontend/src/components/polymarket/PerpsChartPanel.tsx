import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { PerpToken } from '../../data/polymarketExtendedData';
import {
  TrendingUp,
  ArrowLeft,
  BarChart3,
  Layers,
  Activity,
} from 'lucide-react';

interface PerpsChartPanelProps {
  token: PerpToken;
  onBack: () => void;
}

type ChartType = 'kline' | 'probability' | 'orderbook';

// --- Mock data generators (seeded by symbol for consistency) ---
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashSymbol(sym: string): number {
  let h = 0;
  for (let i = 0; i < sym.length; i++) {
    h = ((h << 5) - h + sym.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateCandles(token: PerpToken): Candle[] {
  const rng = seededRandom(hashSymbol(token.symbol));
  const basePrice = parseFloat(token.price.replace(/[, ETB]/g, '')) || 100;
  const candles: Candle[] = [];
  let price = basePrice * 0.92;
  const now = Date.now();
  for (let i = 60; i >= 0; i--) {
    const t = new Date(now - i * 15 * 60000);
    const timeStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    const drift = (rng() - 0.48) * basePrice * 0.012;
    const open = price;
    const close = price + drift;
    const high = Math.max(open, close) + rng() * basePrice * 0.005;
    const low = Math.min(open, close) - rng() * basePrice * 0.005;
    const volume = Math.round(50000 + rng() * 200000);
    candles.push({ time: timeStr, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

function generateProbabilityData(token: PerpToken): { time: string; long: number; short: number }[] {
  const rng = seededRandom(hashSymbol(token.symbol) + 1000);
  const data: { time: string; long: number; short: number }[] = [];
  let longPct = 50 + (rng() - 0.5) * 20;
  const now = Date.now();
  for (let i = 48; i >= 0; i--) {
    const t = new Date(now - i * 30 * 60000);
    const timeStr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    longPct = Math.max(15, Math.min(85, longPct + (rng() - 0.48) * 4));
    data.push({ time: timeStr, long: +longPct.toFixed(1), short: +(100 - longPct).toFixed(1) });
  }
  return data;
}

function generateOrderbook(token: PerpToken): { bids: { price: number; amount: number }[]; asks: { price: number; amount: number }[] } {
  const rng = seededRandom(hashSymbol(token.symbol) + 2000);
  const basePrice = parseFloat(token.price.replace(/[, ETB]/g, '')) || 100;
  const step = basePrice * 0.001;
  const bids: { price: number; amount: number }[] = [];
  const asks: { price: number; amount: number }[] = [];
  for (let i = 0; i < 20; i++) {
    bids.push({ price: +(basePrice - step * (i + 1)).toFixed(4), amount: Math.round(100 + rng() * 5000) });
    asks.push({ price: +(basePrice + step * (i + 1)).toFixed(4), amount: Math.round(100 + rng() * 5000) });
  }
  return { bids, asks };
}

// --- Chart Components ---

const KlineChart: React.FC<{ candles: Candle[]; width: number; height: number }> = ({ candles, width, height }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pad = { top: 10, right: 60, bottom: 24, left: 8 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const { minP, maxP, minV, maxV } = useMemo(() => {
    let mn = Infinity, mx = -Infinity, mv = 0;
    candles.forEach((c) => {
      if (c.low < mn) mn = c.low;
      if (c.high > mx) mx = c.high;
      if (c.volume > mv) mv = c.volume;
    });
    return { minP: mn * 0.998, maxP: mx * 1.002, minV: 0, maxV: mv };
  }, [candles]);

  const yScale = (p: number) => pad.top + chartH - ((p - minP) / (maxP - minP)) * chartH;
  const vScale = (v: number) => (v / maxV) * (chartH * 0.18);
  const candleW = Math.max(2, (chartW / candles.length) * 0.6);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - pad.left;
    const idx = Math.round((x / chartW) * (candles.length - 1));
    setHoverIdx(Math.max(0, Math.min(candles.length - 1, idx)));
  }, [candles.length, chartW, pad.left]);

  const hc = hoverIdx !== null ? candles[hoverIdx] : null;

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)} className="cursor-crosshair">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = pad.top + chartH * f;
          const price = maxP - f * (maxP - minP);
          return (
            <g key={f}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#1b2536" strokeWidth="0.5" />
              <text x={width - pad.right + 4} y={y + 3.5} fill="#64748b" fontSize="9" fontFamily="monospace">{price < 1 ? price.toFixed(4) : price < 100 ? price.toFixed(2) : price.toFixed(0)}</text>
            </g>
          );
        })}

        {/* Volume bars */}
        {candles.map((c, i) => {
          const x = pad.left + (i / (candles.length - 1)) * chartW - candleW / 2;
          const vH = vScale(c.volume);
          const isUp = c.close >= c.open;
          return (
            <rect key={`v-${i}`} x={x} y={pad.top + chartH - vH} width={candleW} height={vH} fill={isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'} rx={1} />
          );
        })}

        {/* Candles */}
        {candles.map((c, i) => {
          const x = pad.left + (i / (candles.length - 1)) * chartW;
          const isUp = c.close >= c.open;
          const color = isUp ? '#10b981' : '#ef4444';
          const bodyTop = yScale(Math.max(c.open, c.close));
          const bodyBot = yScale(Math.min(c.open, c.close));
          const bodyH = Math.max(1, bodyBot - bodyTop);
          return (
            <g key={`c-${i}`}>
              <line x1={x} y1={yScale(c.high)} x2={x} y2={yScale(c.low)} stroke={color} strokeWidth={1} />
              <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={color} rx={1} />
            </g>
          );
        })}

        {/* Hover crosshair */}
        {hc && hoverIdx !== null && (
          <g>
            <line x1={pad.left + (hoverIdx / (candles.length - 1)) * chartW} y1={pad.top} x2={pad.left + (hoverIdx / (candles.length - 1)) * chartW} y2={pad.top + chartH} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" strokeWidth="1" />
            <circle cx={pad.left + (hoverIdx / (candles.length - 1)) * chartW} cy={yScale(hc.close)} r={4} fill={hc.close >= hc.open ? '#10b981' : '#ef4444'} stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      {hc && hoverIdx !== null && (
        <div className="absolute top-2 left-2 bg-[#0e1726]/95 border border-[#223249] rounded-lg px-3 py-2 text-[11px] font-mono pointer-events-none z-10">
          <div className="text-neutral-400 mb-1">{hc.time}</div>
          <div className="flex gap-3">
            <span className="text-neutral-400">O <span className="text-white">{hc.open.toFixed(2)}</span></span>
            <span className="text-neutral-400">H <span className="text-emerald-400">{hc.high.toFixed(2)}</span></span>
            <span className="text-neutral-400">L <span className="text-red-400">{hc.low.toFixed(2)}</span></span>
            <span className="text-neutral-400">C <span className="text-white">{hc.close.toFixed(2)}</span></span>
          </div>
          <div className="text-neutral-500 mt-0.5">Vol: {hc.volume.toLocaleString()}</div>
        </div>
      )}

      {/* Y-axis price label */}
      {hc && (
        <div className="absolute right-1 bg-[#0e1726] border border-[#223249] rounded px-1.5 py-0.5 text-[10px] font-mono text-white" style={{ top: yScale(hc.close) - 8 }}>
          {hc.close.toFixed(2)}
        </div>
      )}
    </div>
  );
};

const ProbabilityChart: React.FC<{ data: { time: string; long: number; short: number }[]; width: number; height: number }> = ({ data, width, height }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pad = { top: 10, right: 12, bottom: 24, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const toPath = (vals: number[]) =>
    vals.map((v, i) => {
      const x = pad.left + (i / (vals.length - 1)) * chartW;
      const y = pad.top + chartH - (v / 100) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

  const toArea = (vals: number[]) => {
    const path = vals.map((v, i) => {
      const x = pad.left + (i / (vals.length - 1)) * chartW;
      const y = pad.top + chartH - (v / 100) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
    const lastX = pad.left + chartW;
    const firstX = pad.left;
    return `${path} L${lastX},${pad.top + chartH} L${firstX},${pad.top + chartH} Z`;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - pad.left;
    const idx = Math.round((x / chartW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }, [data.length, chartW, pad.left]);

  const hd = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)} className="cursor-crosshair">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pad.top + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#1b2536" strokeWidth="0.5" />
              <text x={pad.left - 4} y={y + 3.5} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">{v}%</text>
            </g>
          );
        })}

        {/* 50% line */}
        <line x1={pad.left} y1={pad.top + chartH / 2} x2={width - pad.right} y2={pad.top + chartH / 2} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

        {/* Long area fill */}
        <path d={toArea(data.map((d) => d.long))} fill="rgba(16,185,129,0.08)" />

        {/* Long line */}
        <path d={toPath(data.map((d) => d.long))} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

        {/* Short line */}
        <path d={toPath(data.map((d) => d.short))} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" />

        {/* Hover crosshair */}
        {hd && hoverIdx !== null && (
          <g>
            <line x1={pad.left + (hoverIdx / (data.length - 1)) * chartW} y1={pad.top} x2={pad.left + (hoverIdx / (data.length - 1)) * chartW} y2={pad.top + chartH} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" strokeWidth="1" />
            <circle cx={pad.left + (hoverIdx / (data.length - 1)) * chartW} cy={pad.top + chartH - (hd.long / 100) * chartH} r={4} fill="#10b981" stroke="#fff" strokeWidth={1.5} />
            <circle cx={pad.left + (hoverIdx / (data.length - 1)) * chartW} cy={pad.top + chartH - (hd.short / 100) * chartH} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-3 flex items-center gap-3 text-[10px] font-mono">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Long</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Short</span>
      </div>

      {/* Hover tooltip */}
      {hd && hoverIdx !== null && (
        <div className="absolute top-2 left-2 bg-[#0e1726]/95 border border-[#223249] rounded-lg px-3 py-2 text-[11px] font-mono pointer-events-none z-10">
          <div className="text-neutral-400 mb-1">{hd.time}</div>
          <div className="flex gap-3">
            <span className="text-emerald-400">Long {hd.long}%</span>
            <span className="text-red-400">Short {hd.short}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderbookDepth: React.FC<{ orderbook: { bids: { price: number; amount: number }[]; asks: { price: number; amount: number }[] }; width: number; height: number }> = ({ orderbook, width, height }) => {
  const pad = { top: 10, right: 12, bottom: 24, left: 60 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const allAmounts = [...orderbook.bids.map((b) => b.amount), ...orderbook.asks.map((a) => a.amount)];
  const maxAmount = Math.max(...allAmounts);

  // Cumulative depth
  const bidCum = orderbook.bids.map((b, i) => ({
    price: b.price,
    cum: orderbook.bids.slice(0, i + 1).reduce((s, x) => s + x.amount, 0),
  }));
  const askCum = orderbook.asks.map((a, i) => ({
    price: a.price,
    cum: orderbook.asks.slice(0, i + 1).reduce((s, x) => s + x.amount, 0),
  }));
  const maxCum = Math.max(bidCum[bidCum.length - 1]?.cum || 1, askCum[askCum.length - 1]?.cum || 1);

  const allPrices = [...orderbook.bids.map((b) => b.price), ...orderbook.asks.map((a) => a.price)];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  const xScale = (p: number) => pad.left + ((p - minPrice) / (maxPrice - minPrice)) * chartW;
  const yScale = (cum: number) => pad.top + chartH - (cum / maxCum) * chartH;

  // Bid area path
  const bidPath = bidCum.map((b, i) => `${i === 0 ? 'M' : 'L'}${xScale(b.price)},${yScale(b.cum)}`).join(' ');
  const bidArea = `${bidPath} L${xScale(bidCum[bidCum.length - 1]?.price || minPrice)},${pad.top + chartH} L${xScale(minPrice)},${pad.top + chartH} Z`;

  // Ask area path
  const askPath = askCum.map((a, i) => `${i === 0 ? 'M' : 'L'}${xScale(a.price)},${yScale(a.cum)}`).join(' ');
  const askArea = `${askPath} L${xScale(askCum[askCum.length - 1]?.price || maxPrice)},${pad.top + chartH} L${xScale(maxPrice)},${pad.top + chartH} Z`;

  // Mid price line
  const midPrice = (orderbook.bids[0]?.price + orderbook.asks[0]?.price) / 2;

  return (
    <div className="relative">
      <svg width={width} height={height} className="cursor-crosshair">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = pad.top + chartH * f;
          return (
            <g key={f}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#1b2536" strokeWidth="0.5" />
              <text x={pad.left - 4} y={y + 3.5} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">{Math.round(maxCum * (1 - f))}</text>
            </g>
          );
        })}

        {/* Price axis labels */}
        {[minPrice, (minPrice + maxPrice) / 2, maxPrice].map((p, i) => (
          <text key={i} x={xScale(p)} y={height - 4} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">{p < 1 ? p.toFixed(4) : p.toFixed(2)}</text>
        ))}

        {/* Bid depth area */}
        <path d={bidArea} fill="rgba(16,185,129,0.12)" />
        <path d={bidPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

        {/* Ask depth area */}
        <path d={askArea} fill="rgba(239,68,68,0.12)" />
        <path d={askPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

        {/* Mid price line */}
        <line x1={xScale(midPrice)} y1={pad.top} x2={xScale(midPrice)} y2={pad.top + chartH} stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
        <text x={xScale(midPrice)} y={pad.top - 2} fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">Mid: {midPrice < 1 ? midPrice.toFixed(4) : midPrice.toFixed(2)}</text>

        {/* Bid/Ask horizontal bars at bottom */}
        {orderbook.bids.slice(0, 10).map((b, i) => {
          const barW = (b.amount / maxAmount) * chartW * 0.4;
          return (
            <rect key={`bid-bar-${i}`} x={xScale(b.price) - barW} y={pad.top + chartH + 2} width={barW} height={3} fill="#10b981" opacity={0.4 + (1 - i / 10) * 0.6} rx={1} />
          );
        })}
        {orderbook.asks.slice(0, 10).map((a, i) => {
          const barW = (a.amount / maxAmount) * chartW * 0.4;
          return (
            <rect key={`ask-bar-${i}`} x={xScale(a.price)} y={pad.top + chartH + 2} width={barW} height={3} fill="#ef4444" opacity={0.4 + (1 - i / 10) * 0.6} rx={1} />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-3 flex items-center gap-3 text-[10px] font-mono">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Bids</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Asks</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Mid</span>
      </div>
    </div>
  );
};

// --- Main Panel ---
export const PerpsChartPanel: React.FC<PerpsChartPanelProps> = ({ token, onBack }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('kline');
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(700);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartWidth(Math.max(300, entry.contentRect.width));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const candles = useMemo(() => generateCandles(token), [token.symbol]);
  const probData = useMemo(() => generateProbabilityData(token), [token.symbol]);
  const orderbook = useMemo(() => generateOrderbook(token), [token.symbol]);

  const chartHeight = 320;

  const chartTabs: { id: ChartType; label: string; icon: React.ReactNode }[] = [
    { id: 'kline', label: 'K-Line', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'probability', label: 'Probability', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'orderbook', label: 'Orderbook', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-[#141b27] hover:bg-[#1a2333] border border-[#1d2738] text-neutral-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: token.logoBg }}>
            {token.symbol.slice(0, 3)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {token.symbol}-PERP
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">LIVE</span>
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono font-bold text-white">{token.price}</span>
              <span className={`font-mono ${token.positive ? 'text-emerald-400' : 'text-red-400'}`}>{token.change}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Type Tabs */}
      <div className="flex items-center gap-1 bg-[#0e1520] border border-[#1b2536] rounded-xl p-1">
        {chartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeChart === tab.id
                ? 'bg-[#1a2536] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="w-full rounded-2xl bg-[#101622] border border-[#1b2536] p-4 overflow-hidden">
        {activeChart === 'kline' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">K-Line Chart</h3>
              <div className="flex gap-1.5">
                {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
                  <button key={tf} className="px-2.5 py-1 rounded-md text-[10px] font-bold text-neutral-500 hover:text-white hover:bg-[#1a2333] transition-colors cursor-pointer">{tf}</button>
                ))}
              </div>
            </div>
            <KlineChart candles={candles} width={chartWidth - 32} height={chartHeight} />
          </div>
        )}

        {activeChart === 'probability' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Long/Short Probability</h3>
              <div className="flex gap-1.5">
                {['1H', '4H', '1D', '1W'].map((tf) => (
                  <button key={tf} className="px-2.5 py-1 rounded-md text-[10px] font-bold text-neutral-500 hover:text-white hover:bg-[#1a2333] transition-colors cursor-pointer">{tf}</button>
                ))}
              </div>
            </div>
            <ProbabilityChart data={probData} width={chartWidth - 32} height={chartHeight} />
          </div>
        )}

        {activeChart === 'orderbook' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Orderbook Depth</h3>
              <div className="text-[10px] font-mono text-neutral-500">
                Spread: {orderbook.asks[0] && orderbook.bids[0] ? ((orderbook.asks[0].price - orderbook.bids[0].price).toFixed(4)) : '—'}
              </div>
            </div>
            <OrderbookDepth orderbook={orderbook} width={chartWidth - 32} height={chartHeight} />
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#101622] border border-[#1b2536]">
          <div className="text-[10px] text-neutral-500 font-bold uppercase">24h Volume</div>
          <div className="text-sm font-mono font-bold text-white mt-0.5">{token.volume}</div>
        </div>
        <div className="p-3 rounded-xl bg-[#101622] border border-[#1b2536]">
          <div className="text-[10px] text-neutral-500 font-bold uppercase">24h Change</div>
          <div className={`text-sm font-mono font-bold mt-0.5 ${token.positive ? 'text-emerald-400' : 'text-red-400'}`}>{token.change}</div>
        </div>
        <div className="p-3 rounded-xl bg-[#101622] border border-[#1b2536]">
          <div className="text-[10px] text-neutral-500 font-bold uppercase">Open Interest</div>
          <div className="text-sm font-mono font-bold text-white mt-0.5">{(parseInt(token.volume) * 12 || 5000).toLocaleString()} ETB</div>
        </div>
        <div className="p-3 rounded-xl bg-[#101622] border border-[#1b2536]">
          <div className="text-[10px] text-neutral-500 font-bold uppercase">Funding Rate</div>
          <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">0.0100%</div>
        </div>
      </div>
    </div>
  );
};
