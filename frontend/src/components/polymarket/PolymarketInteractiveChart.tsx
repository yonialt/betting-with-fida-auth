import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { PolymarketMarket } from '../../types/polymarket';
import { PolymarketTradingChart } from './PolymarketTradingChart';
import { CryptoLivePriceChart } from './CryptoLivePriceChart';
import {
  CandleData,
  OrderbookDepthData,
  generateHistoricalCandles,
  generateOrderbookDepth,
  subscribeToMockPriceFeed,
} from '../../services/mockMarketFeed';
import { LineChart, BarChart2, Layers } from 'lucide-react';
import { useBetting } from '../../context/BettingContext';

// Deterministic PRNG seeded from a string, so each market's chart is stable across re-renders
function makeSeededRand(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build realistic stepped probability series that lands accurately on `end` (0-100)
function buildProbabilitySeries(seed: string, end: number, points = 32): number[] {
  const rand = makeSeededRand(seed);
  const target = Math.max(1, Math.min(99, end));
  let v = Math.max(2, Math.min(98, target + (rand() * 2 - 1) * 20));
  const out: number[] = [];

  for (let i = 0; i < points; i++) {
    // Prediction markets have plateaus with event-driven jumps
    const isStepEvent = rand() > 0.45 || i === points - 1;
    if (isStepEvent) {
      const pull = (target - v) * 0.12;
      const noise = (rand() * 2 - 1) * 7.5;
      v = Math.max(1, Math.min(99, v + pull + noise));
    }
    out.push(+v.toFixed(1));
  }
  out[points - 1] = +target.toFixed(1);
  return out;
}

// High-fidelity timestamp labels matching Polymarket format in the video (e.g. "Aug 30, 7:00 AM", "Sep 11, 7:15 PM")
function buildDateLabelsWithTime(points = 32): { full: string; short: string; hour: string }[] {
  const now = Date.now();
  const span = 45 * 24 * 3600 * 1000; // ~45 days
  return Array.from({ length: points }, (_, i) => {
    const d = new Date(now - (span * (points - 1 - i)) / (points - 1));
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinute = minutes < 10 ? `0${minutes}` : minutes;

    return {
      full: `${month} ${day}, ${formattedHour}:${formattedMinute} ${ampm}`,
      short: `${month} ${day}`,
      hour: `${formattedHour}:${formattedMinute} ${ampm}`,
    };
  });
}

// Authentic step-after curve generation as seen in real Polymarket charts
function buildStepPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // In Polymarket step charts, probability holds horizontally until the trade occurs, then steps up or down
    d += ` L ${curr.x.toFixed(1)} ${prev.y.toFixed(1)} L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

export interface PolymarketInteractiveChartProps {
  market: PolymarketMarket;
  timeframe?: string;
  onHoverChange?: (
    data: {
      date: string;
      leadName: string;
      leadVal: number;
      allValues: { name: string; value: number; color: string }[];
    } | null
  ) => void;
  defaultChartMode?: 'probability' | 'candles' | 'depth';
  allowTradingMode?: boolean;
}

interface LiveTradePing {
  id: string;
  amount: number;
  yPercent: number;
  color: string;
}

export const PolymarketInteractiveChart: React.FC<PolymarketInteractiveChartProps> = ({
  market,
  timeframe = 'ALL',
  onHoverChange,
  defaultChartMode,
  allowTradingMode = true,
}) => {
  const { polymarketDarkMode: isDarkMode } = useBetting();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Live real-time ticking drift offset
  const [liveDrift, setLiveDrift] = useState<number[]>([]);

  // Live left-side trade stream pings (seen in video at frames 00:05-00:09, 00:11-00:16, 00:20-00:22, 00:30-00:33)
  const [liveTrades, setLiveTrades] = useState<LiveTradePing[]>([
    { id: 't-1', amount: 17, yPercent: 42, color: '#ef4444' },
    { id: 't-2', amount: 9, yPercent: 49, color: '#94a3b8' },
    { id: 't-3', amount: 1, yPercent: 55, color: '#f59e0b' },
    { id: 't-4', amount: 5, yPercent: 62, color: '#38bdf8' },
    { id: 't-5', amount: 50, yPercent: 71, color: '#f59e0b' },
  ]);

  const isBtc5m = market.displayType === 'up_down_btc' || market.id === 'pm-btc-5m';
  const isTradingMarket =
    isBtc5m ||
    market.category === 'Crypto' ||
    market.subcategory === 'Crypto' ||
    market.category === 'Stocks' ||
    market.subcategory === 'Stocks' ||
    market.displayType === 'up_down_btc' ||
    (typeof market.priceToBeat === 'number' && typeof market.currentPrice === 'number');

  // Active chart view mode
  const [chartMode, setChartMode] = useState<'probability' | 'candles' | 'depth'>(
    defaultChartMode || (isBtc5m ? 'candles' : 'probability')
  );

  const basePrice = market.currentPrice || market.priceToBeat || (isBtc5m ? 79820 : 100);
  const [candles, setCandles] = useState<CandleData[]>(() =>
    generateHistoricalCandles(basePrice, 70, 300)
  );
  const [orderbook, setOrderbook] = useState<OrderbookDepthData>(() =>
    generateOrderbookDepth(basePrice)
  );

  // Subscribe to live mock price feed for trading market candle stream
  useEffect(() => {
    if (!allowTradingMode) return;

    const unsubscribe = subscribeToMockPriceFeed(basePrice, (tick) => {
      setCandles((prev) => {
        if (!prev || prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const bucketTime = Math.floor(tick.time / 300) * 300;

        if (last.time === bucketTime) {
          const updated: CandleData = {
            ...last,
            high: Math.max(last.high, tick.price),
            low: Math.min(last.low, tick.price),
            close: tick.price,
            volume: last.volume + tick.volumeDelta,
          };
          return [...prev.slice(0, -1), updated];
        } else if (tick.time > last.time) {
          const newCandle: CandleData = {
            time: bucketTime,
            open: last.close,
            high: Math.max(last.close, tick.price),
            low: Math.min(last.close, tick.price),
            close: tick.price,
            volume: tick.volumeDelta,
          };
          return [...prev.slice(-100), newCandle];
        }
        return prev;
      });

      setOrderbook((prev) => ({
        ...prev,
        midPrice: tick.price,
      }));
    }, 1400);

    return () => unsubscribe();
  }, [basePrice, allowTradingMode]);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 260;
  const padLeft = 46;
  const padRight = 62;
  const padTop = 28;
  const padBottom = 32;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Single line vs Multi-outcome series
  // Markets with 2 or more distinct outcome names (like Sevilla, Draw, Valencia or candidate choices)
  // receive multiple lines matching Polymarket in the video
  const isSingleLine =
    (market.outcomes?.length ?? 0) <= 1 ||
    (market.outcomes?.length === 2 &&
      market.outcomes[0].name.toLowerCase() === 'yes' &&
      market.outcomes[1].name.toLowerCase() === 'no');

  // Palette matching the video: Blue, Cyan, Amber/Yellow, Red/Coral, Gray
  const palette = useMemo(() => {
    // If sports soccer match (e.g. Sevilla vs Valencia), match team colors from video:
    const title = (market.title || '').toLowerCase();
    if (title.includes('sevilla') || title.includes('valencia')) {
      return ['#ef4444', '#94a3b8', '#f59e0b', '#38bdf8'];
    }
    return ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#a855f7', '#94a3b8'];
  }, [market.title]);

  // Extract series data
  const { dateLabels, seriesList } = useMemo(() => {
    const POINTS = 32;
    const labels = buildDateLabelsWithTime(POINTS);

    if (market.chartData && market.chartData.series.length > 0) {
      const sList = isSingleLine
        ? market.chartData.series.slice(0, 1)
        : market.chartData.series;
      return {
        dateLabels: labels,
        seriesList: sList.map((s, i) => ({
          ...s,
          color: s.color || palette[i % palette.length],
          currentVal: s.currentVal ?? s.data[s.data.length - 1],
        })),
      };
    }

    if (isSingleLine) {
      const primary = market.outcomes?.[0];
      const end = primary?.probability ?? 50;
      return {
        dateLabels: labels,
        seriesList: [
          {
            name: primary?.name || 'Yes',
            color: palette[0],
            currentVal: end,
            data: buildProbabilitySeries(`${market.id}|${primary?.name || 'yes'}`, end, POINTS),
          },
        ],
      };
    }

    // Multi-outcome lines (up to 4)
    const outcomesToRender = (market.outcomes || []).slice(0, 4);
    const series = outcomesToRender.map((o, idx) => {
      const end = o.probability ?? 33;
      return {
        name: o.name,
        color: palette[idx % palette.length],
        currentVal: end,
        data: buildProbabilitySeries(`${market.id}|${o.name}`, end, POINTS),
      };
    });

    return { dateLabels: labels, seriesList: series };
  }, [market, isSingleLine, palette]);

  // Real-time live simulation: causes subtle micro-ticks on the latest data points and periodically adds live trade pings
  useEffect(() => {
    // Initial drift offsets for each series
    setLiveDrift(seriesList.map(() => 0));

    const tradeAmounts = [1, 2, 3, 5, 6, 9, 11, 17, 24, 40, 50, 75, 88, 310, 312];

    const interval = setInterval(() => {
      setLiveDrift((prev) =>
        prev.map(() => {
          const delta = (Math.random() - 0.5) * 0.45;
          return +(Math.max(-1.8, Math.min(1.8, (prev[0] || 0) + delta))).toFixed(2);
        })
      );

      // Periodically inject a new trade into the left stream
      if (Math.random() > 0.45) {
        const amt = tradeAmounts[Math.floor(Math.random() * tradeAmounts.length)];
        const pickColor = palette[Math.floor(Math.random() * Math.min(palette.length, 3))];
        const yPct = Math.floor(Math.random() * 45) + 30;

        setLiveTrades((prev) => [
          { id: `t-${Date.now()}`, amount: amt, yPercent: yPct, color: pickColor },
          ...prev.slice(0, 4),
        ]);
      }
    }, 2100);

    return () => clearInterval(interval);
  }, [seriesList.length, palette]);

  // Scaled live series incorporating live drift
  const activeSeries = useMemo(() => {
    return seriesList.map((s, sIdx) => {
      const drift = liveDrift[sIdx] || 0;
      const copy = [...s.data];
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = +(Math.max(1, Math.min(99, last + drift))).toFixed(1);
      return {
        ...s,
        data: copy,
        liveVal: copy[copy.length - 1],
      };
    });
  }, [seriesList, liveDrift]);

  // Coordinate scales
  const getX = useCallback(
    (index: number, total: number) => {
      if (total <= 1) return padLeft + chartWidth / 2;
      return padLeft + (index / (total - 1)) * chartWidth;
    },
    [padLeft, chartWidth]
  );

  const getY = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(100, val));
      return padTop + chartHeight - (clamped / 100) * chartHeight;
    },
    [padTop, chartHeight]
  );

  // Mouse / Touch scrub
  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const scale = svgWidth / rect.width;
    const clampedSvgX = Math.max(padLeft, Math.min(svgWidth - padRight, relativeX * scale));

    setHoverX(clampedSvgX);
    setIsHovering(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePointerMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handlePointerLeave = () => {
    setHoverX(null);
    setIsHovering(false);
    onHoverChange?.(null);
  };

  // Interpolated hover data
  const hoverData = useMemo(() => {
    if (hoverX === null || !activeSeries.length) return null;

    const dataLength = activeSeries[0].data.length;
    if (dataLength < 2) return null;

    const t = Math.max(0, Math.min(1, (hoverX - padLeft) / chartWidth));
    const floatIdx = t * (dataLength - 1);
    const i0 = Math.floor(floatIdx);
    const i1 = Math.min(dataLength - 1, i0 + 1);
    const frac = floatIdx - i0;

    const dateObj = dateLabels[Math.round(floatIdx)] || dateLabels[i0] || {
      full: '',
      short: '',
      hour: '',
    };

    const interpolated = activeSeries.map((s) => {
      const v0 = s.data[i0] ?? s.currentVal;
      const v1 = s.data[i1] ?? s.currentVal;
      const val = v0 + (v1 - v0) * frac;
      const prevVal = s.data[Math.max(0, i0 - 1)] ?? v0;
      const isUp = val >= prevVal;

      return {
        name: s.name,
        color: s.color,
        value: val,
        y: getY(val),
        isUp,
      };
    });

    // Collision avoidance relaxation for floating tags along the vertical hairline
    const sorted = [...interpolated].sort((a, b) => a.y - b.y);
    const minGap = 24;
    const adjustedY = sorted.map((item) => item.y);

    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < adjustedY.length; i++) {
        if (adjustedY[i] - adjustedY[i - 1] < minGap) {
          const overlap = minGap - (adjustedY[i] - adjustedY[i - 1]);
          adjustedY[i - 1] = Math.max(padTop + 4, adjustedY[i - 1] - overlap / 2);
          adjustedY[i] = Math.min(svgHeight - padBottom - 10, adjustedY[i] + overlap / 2);
        }
      }
    }

    const tagItems = sorted.map((item, idx) => ({
      ...item,
      tagY: adjustedY[idx],
    }));

    return {
      x: hoverX,
      date: dateObj.full,
      all: interpolated,
      tagItems,
    };
  }, [hoverX, activeSeries, dateLabels, padLeft, chartWidth, getY, padTop, chartHeight, padBottom, svgHeight]);

  // Propagate hover state to parent
  useEffect(() => {
    if (hoverData && hoverData.all.length > 0) {
      onHoverChange?.({
        date: hoverData.date,
        leadName: hoverData.all[0].name,
        leadVal: hoverData.all[0].value,
        allValues: hoverData.all.map((s) => ({
          name: s.name,
          value: s.value,
          color: s.color,
        })),
      });
    }
  }, [hoverData, onHoverChange]);

  // Bottom X axis tick dates
  const xTicks = useMemo(() => {
    if (dateLabels.length < 5) return [];
    return [
      { label: dateLabels[0].short, x: padLeft },
      { label: dateLabels[Math.floor(dateLabels.length * 0.33)].short, x: padLeft + chartWidth * 0.33 },
      { label: dateLabels[Math.floor(dateLabels.length * 0.66)].short, x: padLeft + chartWidth * 0.66 },
      { label: dateLabels[dateLabels.length - 1].short, x: padLeft + chartWidth },
    ];
  }, [dateLabels, padLeft, chartWidth]);

  // Right-edge end-of-line outcome positions when not hovering
  const endPoints = useMemo(() => {
    return activeSeries.map((s) => {
      const len = s.data.length;
      const x = getX(len - 1, len);
      const y = getY(s.liveVal);
      return {
        name: s.name,
        color: s.color,
        val: s.liveVal,
        x,
        y,
      };
    });
  }, [activeSeries, getX, getY]);

  if (chartMode === 'candles' || chartMode === 'depth') {
    return (
      <div className="w-full flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#090d14] p-1 rounded-xl border border-[#1b2536]">
            <button
              type="button"
              onClick={() => setChartMode('probability')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Probability</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('candles')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                chartMode === 'candles' ? 'bg-[#1e2738] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>K-Line Candles</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('depth')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                chartMode === 'depth' ? 'bg-[#1e2738] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Orderbook Depth</span>
            </button>
          </div>
        </div>

        <PolymarketTradingChart
          candles={candles}
          orderbook={orderbook}
          symbol={market.id === 'pm-btc-5m' ? 'BTC/USD 5M' : `${market.title.slice(0, 18)}`}
          targetPrice={market.targetPrice}
          priceToBeat={market.priceToBeat}
          currentPrice={market.currentPrice}
          initialViewMode={chartMode === 'depth' ? 'depth' : 'candles'}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  // Crypto markets: Probability tab shows live animated price chart
  if (chartMode === 'probability' && isTradingMarket) {
    return (
      <div className="w-full flex flex-col gap-2.5">
        {allowTradingMode && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#090d14] p-1 rounded-xl border border-[#1b2536]">
              <button
                type="button"
                onClick={() => setChartMode('probability')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#1e2738] text-white transition-colors cursor-pointer"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Probability</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('candles')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>K-Line Candles</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('depth')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Orderbook Depth</span>
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full bg-[#090d14] rounded-xl border border-[#182130] p-2 overflow-hidden">
          <CryptoLivePriceChart
            symbol={
              market.id === 'pm-btc-5m'
                ? 'BTC'
                : (market.title || 'BTC').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'BTC'
            }
            priceToBeat={market.priceToBeat || market.currentPrice || 100}
            currentPrice={market.currentPrice || market.priceToBeat || 100}
            color="#f59e0b"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Top Outcome Bar directly matching the video (frames 00:00, 00:20, 00:25, 00:30, 00:38) */}
      <div className="flex items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {activeSeries.map((s) => {
            // If hovering, show the hovered value; otherwise show the live value
            const hoveredVal = hoverData?.all.find((a) => a.name === s.name)?.value;
            const displayVal = hoveredVal !== undefined ? hoveredVal : s.liveVal;
            const isUp = hoveredVal !== undefined
              ? (hoverData?.all.find((a) => a.name === s.name)?.isUp ?? true)
              : true;

            return (
              <div key={s.name} className="flex items-center gap-1.5 font-sans">
                {/* Arrow or circular indicator matching video */}
                <span
                  className="text-[11px] font-extrabold"
                  style={{ color: s.color }}
                >
                  {isUp ? '↑' : '↓'}
                </span>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-neutral-300 font-medium text-[11.5px] truncate max-w-[140px]">
                  {s.name}
                </span>
                <span
                  className="font-mono font-bold text-[12px] tracking-tight"
                  style={{ color: isHovering ? '#ffffff' : s.color }}
                >
                  {displayVal.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover Date Stamp or Live Beacon */}
        <div className="flex items-center gap-2 shrink-0">
          {isHovering && hoverData ? (
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#162032] text-neutral-200 border border-[#23334d]">
              {hoverData.date}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handlePointerLeave}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        onTouchEnd={handlePointerLeave}
        className="relative w-full aspect-[2.4/1] min-h-[260px] bg-[#090d14] rounded-xl border border-[#182130] p-1 overflow-hidden select-none cursor-crosshair group"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[100, 75, 50, 25, 0].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#172233"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={svgWidth - padRight + 8}
                  y={y + 3.5}
                  fill="#475569"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Stepped Series Lines (authentic Polymarket step-after curves) */}
          {activeSeries.map((s, sIdx) => {
            const points = s.data.map((d, i) => ({
              x: getX(i, s.data.length),
              y: getY(d),
            }));
            const pathD = buildStepPath(points);

            return (
              <g key={s.name}>
                {/* Stepped probability stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={sIdx === 0 ? '2.4' : '1.8'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isHovering ? 0.45 : 0.95}
                  className="transition-opacity duration-150"
                />
              </g>
            );
          })}

          {/* Left-Side Live Trade/Bet Pings Ladder (frames 00:05-00:09, 00:11-00:16, 00:20-00:22) */}
          <g className="pointer-events-none select-none">
            {liveTrades.map((t, idx) => {
              const yPos = padTop + (t.yPercent / 100) * chartHeight;
              return (
                <g key={t.id || idx} opacity={1 - idx * 0.15}>
                  <text
                    x={padLeft - 6}
                    y={yPos}
                    textAnchor="end"
                    fill={t.color}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="700"
                    className="transition-all duration-300"
                  >
                    + ${t.amount}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Vertical right guide line where lines meet the present moment */}
          <line
            x1={svgWidth - padRight}
            y1={padTop}
            x2={svgWidth - padRight}
            y2={svgHeight - padBottom}
            stroke="#1b273b"
            strokeDasharray="2 2"
            strokeWidth="1"
          />

          {/* Right-Edge Live Pulsating Blinking Dots (matching video exactly) */}
          {endPoints.map((pt) => {
            return (
              <g key={`end-${pt.name}`} className="transition-all duration-300 pointer-events-none">
                {/* 1. Primary expanding radar blink ripple */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill={pt.color}
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="4;15"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.65;0"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 2. Secondary staggered ripple for continuous pulse */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill={pt.color}
                  opacity="0.45"
                >
                  <animate
                    attributeName="r"
                    values="4;11"
                    dur="2.2s"
                    begin="0.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0"
                    dur="2.2s"
                    begin="0.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* 3. Soft translucent glow halo (radius ~6.5) */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6.5"
                  fill={pt.color}
                  opacity="0.28"
                />

                {/* 4. Solid center point matching line color */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill={pt.color}
                  stroke="#090d14"
                  strokeWidth="1.6"
                />
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* HOVER CROSSHAIR AND INLINE FLOATING TAGS (EXACT BEHAVIOR FROM VIDEO)      */}
          {/* ========================================================================= */}
          {isHovering && hoverData && (
            <g className="pointer-events-none">
              {/* 1. Vertical Dashed Crosshair Line */}
              <line
                x1={hoverData.x}
                y1={padTop - 6}
                x2={hoverData.x}
                y2={svgHeight - padBottom}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />

              {/* 2. Top Centered / Hairline Timestamp Tag */}
              <g transform={`translate(${Math.max(padLeft + 40, Math.min(svgWidth - padRight - 60, hoverData.x))}, ${padTop - 12})`}>
                <rect
                  x="-42"
                  y="0"
                  width="84"
                  height="16"
                  rx="4"
                  fill="#0e1726"
                  stroke="#223249"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="11.5"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {hoverData.date.split(',')[0]}
                </text>
              </g>

              {/* 3. Intersection Dots on Each Line */}
              {hoverData.all.map((item) => (
                <g key={`dot-${item.name}`}>
                  <circle
                    cx={hoverData.x}
                    cy={item.y}
                    r="4"
                    fill="#090d14"
                    stroke={item.color}
                    strokeWidth="2.2"
                  />
                </g>
              ))}

              {/* 4. Attached Line Tags Aligned Vertically with Each Line (Video 00:01, 00:22, 00:33) */}
              {hoverData.tagItems.map((item) => {
                const isNearRight = hoverData.x > svgWidth - 145;
                const tagWidth = 118;
                const tagHeight = 20;
                const tagX = isNearRight ? hoverData.x - tagWidth - 8 : hoverData.x + 8;
                const tagY = item.tagY - tagHeight / 2;

                return (
                  <g key={`tag-${item.name}`} filter="url(#softGlow)">
                    {/* Compact Card Container */}
                    <rect
                      x={tagX}
                      y={tagY}
                      width={tagWidth}
                      height={tagHeight}
                      rx="4.5"
                      fill="#0e1726"
                      stroke="#223249"
                      strokeWidth="1"
                    />

                    {/* Vertical Color Accent Bar */}
                    <rect
                      x={tagX + 5}
                      y={tagY + 4}
                      width="2.5"
                      height="12"
                      rx="1"
                      fill={item.color}
                    />

                    {/* Arrow Indicator (↑ or ↓) */}
                    <text
                      x={tagX + 11}
                      y={tagY + 14}
                      fill={item.color}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {item.isUp ? '↑' : '↓'}
                    </text>

                    {/* Outcome Name */}
                    <text
                      x={tagX + 22}
                      y={tagY + 13.5}
                      fill="#e2e8f0"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="system-ui, sans-serif"
                    >
                      {item.name.length > 8 ? `${item.name.slice(0, 7)}…` : item.name}
                    </text>

                    {/* Exact Percentage */}
                    <text
                      x={tagX + tagWidth - 6}
                      y={tagY + 13.5}
                      textAnchor="end"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      {item.value.toFixed(1)}%
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Brand watermark — bottom-left source line (PRESERVED EXACTLY) */}
          <text
            x={padLeft + 6}
            y={svgHeight - padBottom - 10}
            fill="#475569"
            fontSize="9.5"
            fontWeight="500"
            fontFamily="'Nyala', 'Noto Sans Ethiopic', system-ui, sans-serif"
            className="select-none pointer-events-none"
          >
            Source: ሃገራዊ
          </text>

          {/* Brand watermark — faint mark in the top-right corner (PRESERVED EXACTLY) */}
          <text
            x={svgWidth - padRight - 4}
            y={padTop - 8}
            textAnchor="end"
            fill="#64748b"
            fontSize="13"
            fontWeight="700"
            fontFamily="'Nyala', 'Noto Sans Ethiopic', system-ui, sans-serif"
            opacity="0.5"
            className="select-none pointer-events-none"
          >
            ሃገራዊ
          </text>

          {/* Bottom X Axis Date Labels */}
          {xTicks.map((tk, idx) => (
            <text
              key={idx}
              x={tk.x}
              y={svgHeight - 12}
              textAnchor={idx === 0 ? 'start' : idx === xTicks.length - 1 ? 'end' : 'middle'}
              fill="#64748b"
              fontSize="9.5"
              fontFamily="monospace"
              fontWeight="600"
            >
              {tk.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};
