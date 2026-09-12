import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { useBetting } from '../../context/BettingContext';

/* ============================================================================
   CryptoLivePriceChart
   The "yellow" animated live price line chart from the crypto Up/Down cards,
   packaged for reuse (e.g. the Probability tab of the market-detail chart).
   Live random-walk motion, dashed target (price-to-beat), left +$ delta ladder,
   a moving price flag, hover scrub, and the ሃገራዊ watermark.
   ============================================================================ */

interface Props {
  symbol: string;
  priceToBeat: number;
  currentPrice: number;
  color?: string;
}

function buildInitialSeries(beat: number, cur: number): number[] {
  const n = 80;
  const start = beat * 1.00009;
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let base: number;
    if (t < 0.55) {
      base = start;
    } else {
      const p = (t - 0.55) / 0.45;
      base = start + (cur - start) * p;
    }
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * (beat * 0.00002);
    arr.push(base + noise);
  }
  arr[n - 1] = cur;
  return arr;
}

function fmtPrice(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(4);
}

export const CryptoLivePriceChart: React.FC<Props> = ({ symbol, priceToBeat, currentPrice, color = '#f59e0b' }) => {
  const { polymarketDarkMode } = useBetting();
  const isDark = polymarketDarkMode;

  const T = isDark
    ? { grid: '#1c2637', axis: '#64748b', watermark: '#334155' }
    : { grid: '#eceff3', axis: '#94a3b8', watermark: '#cbd5e1' };

  const beat = priceToBeat || currentPrice || 100;
  const [series, setSeries] = useState<number[]>(() => buildInitialSeries(beat, currentPrice || beat));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  /* live motion — random walk every 900ms */
  useEffect(() => {
    const t = setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.515) * (beat * 0.00014);
        return [...prev.slice(1), Math.max(0, last + drift)];
      });
    }, 900);
    return () => clearInterval(t);
  }, [beat]);

  const cur = series[series.length - 1];
  const lineColor = color || '#f59e0b';

  /* geometry */
  const W = 820;
  const H = 300;
  const padL = 8;
  const padR = 64;
  const padT = 18;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const { min, max } = useMemo(() => {
    let lo = Math.min(...series, beat);
    let hi = Math.max(...series, beat);
    const span = Math.max(hi - lo, beat * 0.0002);
    lo -= span * 0.35;
    hi += span * 0.35;
    return { min: lo, max: hi };
  }, [series, beat]);

  const getY = (v: number) => padT + (1 - (v - min) / (max - min)) * innerH;
  const getX = (i: number) => padL + (i / (series.length - 1)) * innerW;

  const linePath = useMemo(() => {
    return series
      .map((v, i) => {
        const x = getX(i);
        const y = getY(v);
        if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        const px = getX(i - 1);
        const py = getY(series[i - 1]);
        const mx = (px + x) / 2;
        return `C ${mx.toFixed(1)} ${py.toFixed(1)}, ${mx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, min, max]);

  const areaPath = `${linePath} L ${getX(series.length - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

  const yTicks = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i <= 5; i++) arr.push(max - (i / 5) * (max - min));
    return arr;
  }, [min, max]);

  const xLabels = useMemo(() => {
    const now = new Date();
    return [0, 1, 2, 3, 4].map((i) => {
      const d = new Date(now.getTime() - (4 - i) * 8000);
      return `${String(d.getHours() % 12 || 12)}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series.length, cur]);

  const leftDeltas = useMemo(() => {
    const tradeSizes = [1, 24, 2, 6, 3, 11, 1];
    return yTicks.slice(1, 6).map((tick, i) => {
      const d = tick - beat;
      const amt = tradeSizes[i % tradeSizes.length];
      return { y: getY(tick), val: amt, pos: d >= 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yTicks, beat, min, max]);

  const hovered = hoverIdx != null ? series[hoverIdx] : null;

  const handleMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (series.length - 1));
    setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)));
  };

  return (
    <div className="relative w-full">
      {/* Brand watermark — centered & faint, behind the chart */}
      <div className="absolute inset-x-0 top-1 flex justify-center pointer-events-none select-none z-0">
        <span className="text-xl sm:text-2xl font-black tracking-wide" style={{ color: T.watermark, opacity: 0.55 }}>
          ሃገራዊ
        </span>
      </div>

      <div
        className="relative w-full h-[240px] sm:h-[300px]"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full cursor-crosshair select-none">
          <defs>
            <linearGradient id={`clpc-fill-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>

            {/* Dynamic clipPath for scrubbing lines left and right with cursor */}
            <clipPath id={`clpc-clip-${symbol}`}>
              <rect
                x="0"
                y="0"
                width={hoverIdx != null ? getX(hoverIdx) : W}
                height={H}
              />
            </clipPath>
          </defs>

          {/* grid */}
          {yTicks.map((tk, i) => (
            <line key={i} x1={padL} y1={getY(tk)} x2={W - padR} y2={getY(tk)} stroke={T.grid} strokeWidth="1" strokeDasharray="4 4" />
          ))}

          {/* target (price to beat) */}
          <line x1={padL} y1={getY(beat)} x2={W - padR} y2={getY(beat)} stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 5" opacity="0.7" />

          {/* area + line */}
          <path d={areaPath} fill={`url(#clpc-fill-${symbol})`} clipPath={`url(#clpc-clip-${symbol})`} />
          {hoverIdx != null && (
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
          )}
          <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#clpc-clip-${symbol})`} />

          {/* live pulsating aura tracking cursor left/right when scrubbing */}
          {(() => {
            const activePtX = hoverIdx != null ? getX(hoverIdx) : getX(series.length - 1);
            const activePtY = hoverIdx != null ? getY(series[hoverIdx]) : getY(cur);
            return (
              <g className="pointer-events-none">
                <circle cx={activePtX} cy={activePtY} r="4.5" fill={lineColor} opacity="0.6">
                  <animate attributeName="r" values="4.5;16" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.65;0" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx={activePtX} cy={activePtY} r="4.5" fill={lineColor} opacity="0.45">
                  <animate attributeName="r" values="4.5;11" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0" dur="2.2s" begin="0.8s" repeatCount="indefinite" />
                </circle>
                <circle cx={activePtX} cy={activePtY} r="7" fill={lineColor} opacity="0.28" />
                <circle cx={activePtX} cy={activePtY} r="4.5" fill={lineColor} stroke="#ffffff" strokeWidth="1.8" />
              </g>
            );
          })()}

          {/* y labels */}
          {yTicks.map((tk, i) => (
            <text key={i} x={W - padR + 8} y={getY(tk) + 3} fill={T.axis} fontSize="10.5" fontFamily="monospace">
              {fmtPrice(tk)} ETB
            </text>
          ))}

          {/* x labels */}
          {xLabels.map((lb, i) => (
            <text
              key={i}
              x={padL + (i / (xLabels.length - 1)) * innerW}
              y={H - 8}
              fill={T.axis}
              fontSize="10"
              textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
            >
              {lb}
            </text>
          ))}

          {/* hover cursor hairline + target beacon ring */}
          {hoverIdx != null && (
            <g className="pointer-events-none">
              <line x1={getX(hoverIdx)} y1={padT} x2={getX(hoverIdx)} y2={padT + innerH} stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx={getX(hoverIdx)} cy={getY(series[hoverIdx])} r="11" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.9" />
              <circle cx={getX(hoverIdx)} cy={getY(series[hoverIdx])} r="3.5" fill="#38bdf8" opacity="0.95" />
            </g>
          )}
        </svg>

        {/* Target pill */}
        <div
          className={`absolute right-0 -translate-y-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${isDark ? 'bg-[#1b2536] text-neutral-200' : 'bg-neutral-800 text-white'}`}
          style={{ top: `${(getY(beat) / H) * 100}%` }}
        >
          Target <ChevronUp className="w-3 h-3" />
        </div>

        {/* current price flag */}
        <div
          className="absolute px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white pointer-events-none whitespace-nowrap"
          style={{
            top: `${(getY(cur) / H) * 100}%`,
            left: `${(getX(series.length - 1) / W) * 100}%`,
            transform: 'translate(-108%, -140%)',
            backgroundColor: lineColor,
          }}
        >
          {symbol} {fmtPrice(cur)} ETB
        </div>

        {/* left delta ladder */}
        <div className="absolute left-1 top-0 h-full pointer-events-none">
          {leftDeltas.map((d, i) => (
            <div
              key={i}
              className={`absolute text-[10px] font-bold font-mono ${d.pos ? 'text-amber-400' : 'text-orange-400'}`}
              style={{ top: `${(d.y / H) * 100}%`, transform: 'translateY(-50%)' }}
            >
              + ${d.val}
            </div>
          ))}
        </div>

        {/* hover tooltip */}
        {hoverIdx != null && hovered != null && (
          <div
            className={`absolute top-1 px-2 py-1 rounded-md text-[11px] font-mono font-semibold pointer-events-none border shadow ${isDark ? 'bg-[#0a0f18] text-white border-[#2a374c]' : 'bg-white text-neutral-900 border-neutral-200'}`}
            style={{ left: `${Math.min(80, Math.max(2, (getX(hoverIdx) / W) * 100))}%` }}
          >
            {fmtPrice(hovered)} ETB
          </div>
        )}
      </div>
    </div>
  );
};
