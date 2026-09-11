import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import { CandleData, OrderbookDepthData } from '../../services/mockMarketFeed';
import { BarChart3, Layers, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

export interface PolymarketTradingChartProps {
  candles?: CandleData[];
  orderbook?: OrderbookDepthData;
  symbol?: string;
  targetPrice?: number;
  priceToBeat?: number;
  currentPrice?: number;
  height?: number;
  isDarkMode?: boolean;
  onTickPrice?: (price: number) => void;
  initialViewMode?: 'candles' | 'depth';
  hideViewToggle?: boolean;
}

export const PolymarketTradingChart: React.FC<PolymarketTradingChartProps> = ({
  candles = [],
  orderbook,
  symbol = 'BTC/USD',
  targetPrice,
  priceToBeat,
  currentPrice,
  height = 320,
  isDarkMode = true,
  initialViewMode = 'candles',
  hideViewToggle = false,
}) => {
  const [viewMode, setViewMode] = useState<'candles' | 'depth'>(initialViewMode);
  const [chartError, setChartError] = useState<string | null>(null);

  // When a parent drives the view via initialViewMode (e.g. outer mode pills),
  // keep the internal view in sync so switching Candles/Depth always works.
  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  // OHLCV crosshair hover state
  const [hoveredBar, setHoveredBar] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Sanitized candle data sorted strictly ascending by timestamp
  const sanitizedCandles = useMemo(() => {
    if (!candles || !Array.isArray(candles) || candles.length === 0) {
      return [];
    }

    try {
      const valid = candles.filter(
        (c) =>
          c &&
          typeof c.time === 'number' &&
          !isNaN(c.time) &&
          typeof c.open === 'number' &&
          !isNaN(c.open) &&
          typeof c.high === 'number' &&
          !isNaN(c.high) &&
          typeof c.low === 'number' &&
          !isNaN(c.low) &&
          typeof c.close === 'number' &&
          !isNaN(c.close)
      );

      // Deduplicate and ensure strictly ascending timestamps
      const sorted = [...valid].sort((a, b) => a.time - b.time);
      const unique: CandleData[] = [];
      for (const item of sorted) {
        if (unique.length === 0 || unique[unique.length - 1].time < item.time) {
          unique.push(item);
        }
      }
      return unique;
    } catch (err) {
      console.error('Error sanitizing candle data:', err);
      return [];
    }
  }, [candles]);

  // Format timestamp to localized readable string
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);

  // Initialize Lightweight Charts instance
  useEffect(() => {
    if (viewMode !== 'candles') {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    setChartError(null);

    let chart: IChartApi | null = null;

    try {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const initialWidth = rect.width > 0 ? rect.width : 700;

      chart = createChart(container, {
        width: initialWidth,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: isDarkMode ? '#090d14' : '#ffffff' },
          textColor: isDarkMode ? '#94a3b8' : '#334155',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: isDarkMode ? '#131b29' : '#f1f5f9', style: 1 },
          horzLines: { color: isDarkMode ? '#131b29' : '#f1f5f9', style: 1 },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: isDarkMode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(14, 165, 233, 0.5)',
            width: 1,
            style: 2,
            labelBackgroundColor: '#0284c7',
          },
          horzLine: {
            color: isDarkMode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(14, 165, 233, 0.5)',
            width: 1,
            style: 2,
            labelBackgroundColor: '#0284c7',
          },
        },
        rightPriceScale: {
          borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
          autoScale: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.22,
          },
        },
        timeScale: {
          borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: true,
        handleScale: true,
      });

      chartRef.current = chart;

      // Add Candlestick Series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      candleSeriesRef.current = candleSeries;

      // Add Volume Histogram Series
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume_scale',
      });
      volumeSeriesRef.current = volumeSeries;

      // Configure separate price scale margins for volume
      chart.priceScale('volume_scale').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Populate series if candles exist
      if (sanitizedCandles.length > 0) {
        const formattedCandles = sanitizedCandles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const formattedVolumes = sanitizedCandles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume || 1000,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
        }));

        candleSeries.setData(formattedCandles);
        volumeSeries.setData(formattedVolumes);

        // Price Lines for Price to Beat / Target if provided
        if (targetPrice) {
          candleSeries.createPriceLine({
            price: targetPrice,
            color: '#f59e0b',
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'Target',
          });
        }

        if (priceToBeat) {
          candleSeries.createPriceLine({
            price: priceToBeat,
            color: '#38bdf8',
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: true,
            title: 'Beat',
          });
        }

        chart.timeScale().fitContent();
      }

      // Crosshair move subscription for OHLCV legend
      chart.subscribeCrosshairMove((param) => {
        if (
          !param ||
          !param.time ||
          !param.seriesData ||
          !param.seriesData.get(candleSeries)
        ) {
          setHoveredBar(null);
          return;
        }

        const candle = param.seriesData.get(candleSeries) as any;
        const volumeData = param.seriesData.get(volumeSeries) as any;

        if (candle) {
          const timeNum = typeof param.time === 'number' ? param.time : 0;
          const open = candle.open;
          const close = candle.close;
          const change = open > 0 ? ((close - open) / open) * 100 : 0;

          setHoveredBar({
            time: formatTime(timeNum),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: volumeData ? volumeData.value : 0,
            change,
          });
        }
      });

      // Responsive Resize Observer
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0 || !chartRef.current) return;
        const newRect = entries[0].contentRect;
        if (newRect.width > 0 && newRect.height > 0) {
          chartRef.current.applyOptions({
            width: Math.floor(newRect.width),
            height: Math.floor(newRect.height),
          });
        }
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        if (chart) {
          chart.remove();
          chartRef.current = null;
          candleSeriesRef.current = null;
          volumeSeriesRef.current = null;
        }
      };
    } catch (err: any) {
      console.error('Error initializing TradingView lightweight chart:', err);
      setChartError(err?.message || 'Failed to initialize chart engine');
      if (chart) {
        chart.remove();
      }
    }
    // Init once per view/theme/market — live candle ticks are applied by the
    // separate update effect below, so sanitizedCandles is intentionally omitted
    // here (keeping it would tear down & rebuild the whole chart on every tick).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, height, isDarkMode, targetPrice, priceToBeat, formatTime]);

  // Handle incoming real-time candle update
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || sanitizedCandles.length === 0) {
      return;
    }

    const last = sanitizedCandles[sanitizedCandles.length - 1];
    if (last) {
      try {
        candleSeriesRef.current.update({
          time: last.time as UTCTimestamp,
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
        });

        volumeSeriesRef.current.update({
          time: last.time as UTCTimestamp,
          value: last.volume,
          color: last.close >= last.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
        });
      } catch (err) {
        // Silently capture order update collisions if timestamp is identical
      }
    }
  }, [sanitizedCandles]);

  // Latest candle for fallback display
  const latestCandle = sanitizedCandles[sanitizedCandles.length - 1];
  const activePrice = hoveredBar ? hoveredBar.close : currentPrice || latestCandle?.close || 0;
  const activeChange = hoveredBar
    ? hoveredBar.change
    : latestCandle
    ? ((latestCandle.close - latestCandle.open) / latestCandle.open) * 100
    : 0;

  return (
    <div className="w-full flex flex-col bg-[#090d14] rounded-xl border border-[#182130] overflow-hidden select-none">
      {/* Chart Top Header & Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-[#0d131f] border-b border-[#182130]">
        {/* Left: Symbol, Price, and OHLCV Data Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-white tracking-wide">{symbol}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              K-LINE
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

          {/* Active Price & Change */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm text-white">
              {activePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                activeChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {activeChange >= 0 ? '+' : ''}
              {activeChange.toFixed(2)}%
            </span>
          </div>

          {/* Hovered OHLC values when hovering */}
          {hoveredBar && (
            <div className="hidden md:flex items-center gap-2.5 font-mono text-[10px] text-neutral-400">
              <span>
                O: <strong className="text-white">{hoveredBar.open.toFixed(2)} ETB</strong>
              </span>
              <span>
                H: <strong className="text-emerald-400">{hoveredBar.high.toFixed(2)} ETB</strong>
              </span>
              <span>
                L: <strong className="text-rose-400">{hoveredBar.low.toFixed(2)} ETB</strong>
              </span>
              <span>
                C: <strong className="text-white">{hoveredBar.close.toFixed(2)} ETB</strong>
              </span>
              <span>
                Vol: <strong className="text-sky-400">{hoveredBar.volume.toLocaleString()}</strong>
              </span>
              <span className="text-neutral-500">{hoveredBar.time}</span>
            </div>
          )}
        </div>

        {/* Right: View Toggle (Candles vs Depth) — hidden when a parent drives the view */}
        {!hideViewToggle && (
        <div className="flex items-center gap-1 bg-[#090d14] p-0.5 rounded-lg border border-[#1b2536]">
          <button
            type="button"
            onClick={() => setViewMode('candles')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'candles'
                ? 'bg-[#1e2738] text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Candles</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('depth')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'depth'
                ? 'bg-[#1e2738] text-white font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Depth</span>
          </button>
        </div>
        )}
      </div>

      {/* Main Chart Canvas Container */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {chartError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <div className="text-xs font-semibold text-white">Chart Render Error</div>
            <div className="text-[11px] text-neutral-500 mt-1 max-w-sm">{chartError}</div>
            <button
              onClick={() => setChartError(null)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#1e2738] hover:bg-[#28364e] text-xs text-white font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : viewMode === 'candles' ? (
          <>
            {sanitizedCandles.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                <TrendingUp className="w-8 h-8 text-neutral-600 mb-2 animate-pulse" />
                <div className="text-xs font-medium text-neutral-400">Awaiting Price Feed...</div>
                <div className="text-[10px] text-neutral-600 mt-1">
                  Connecting to live market order updates
                </div>
              </div>
            ) : (
              <div ref={containerRef} className="w-full h-full" />
            )}
          </>
        ) : (
          /* Order Book Market Depth Visualizer */
          <OrderbookDepthVisualizer
            orderbook={orderbook}
            currentPrice={activePrice}
            height={height}
          />
        )}
      </div>

      {/* Footer Info / Live Status */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0a0f18] border-t border-[#141d2c] text-[10px] font-mono text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE FEED
          </span>
          <span>•</span>
          <span>5m Period</span>
          {targetPrice && (
            <>
              <span>•</span>
              <span className="text-amber-400">Target {targetPrice.toLocaleString()} ETB</span>
            </>
          )}
        </div>
        <div className="text-neutral-500">TradingView Lightweight Charts v5</div>
      </div>
    </div>
  );
};

/**
 * Orderbook Depth Visualizer Sub-component
 * Renders cumulative bid (green) and ask (red) depth curves with spread
 */
const OrderbookDepthVisualizer: React.FC<{
  orderbook?: OrderbookDepthData;
  currentPrice: number;
  height: number;
}> = ({ orderbook, currentPrice, height }) => {
  const [hoverDepth, setHoverDepth] = useState<{
    price: number;
    total: number;
    side: 'bid' | 'ask';
    x: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback synthetic depth if not provided
  const depthData = useMemo(() => {
    if (orderbook && orderbook.bids.length > 0 && orderbook.asks.length > 0) {
      return orderbook;
    }

    const mid = currentPrice || 79825;
    const bids = [];
    const asks = [];
    let bTotal = 0;
    let aTotal = 0;

    for (let i = 1; i <= 15; i++) {
      const p = mid - i * 4;
      bTotal += 0.8 + i * 0.15;
      bids.push({ price: p, size: 1, total: bTotal });
    }

    for (let i = 1; i <= 15; i++) {
      const p = mid + i * 4;
      aTotal += 0.8 + i * 0.15;
      asks.push({ price: p, size: 1, total: aTotal });
    }

    return {
      bids,
      asks,
      spread: 4.0,
      midPrice: mid,
    };
  }, [orderbook, currentPrice]);

  const maxTotal = useMemo(() => {
    const maxBids = depthData.bids[depthData.bids.length - 1]?.total || 10;
    const maxAsks = depthData.asks[depthData.asks.length - 1]?.total || 10;
    return Math.max(maxBids, maxAsks) * 1.1;
  }, [depthData]);

  const svgWidth = 720;
  const svgHeight = Math.max(200, height - 30);
  const padH = 20;
  const padBottom = 26;
  const padTop = 15;
  const chartH = svgHeight - padTop - padBottom;
  const halfW = (svgWidth - padH * 2) / 2;

  // Build Bids Area (Left side: Mid price -> Leftmost lowest price)
  // We mirror so bids go from right (mid price) to left (lowest bid)
  const bidsPoints = depthData.bids.map((b, i) => {
    const fraction = i / Math.max(1, depthData.bids.length - 1);
    const x = padH + halfW - fraction * halfW;
    const y = padTop + chartH - (b.total / maxTotal) * chartH;
    return { x, y, price: b.price, total: b.total };
  });

  // Build Asks Area (Right side: Mid price -> Rightmost highest price)
  const asksPoints = depthData.asks.map((a, i) => {
    const fraction = i / Math.max(1, depthData.asks.length - 1);
    const x = padH + halfW + fraction * halfW;
    const y = padTop + chartH - (a.total / maxTotal) * chartH;
    return { x, y, price: a.price, total: a.total };
  });

  const bidsPath = useMemo(() => {
    if (bidsPoints.length === 0) return '';
    const startX = padH + halfW;
    const startY = padTop + chartH;
    let path = `M ${startX} ${startY}`;
    for (const pt of bidsPoints) {
      path += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    const lastX = bidsPoints[bidsPoints.length - 1].x;
    path += ` L ${lastX.toFixed(1)} ${startY} Z`;
    return path;
  }, [bidsPoints, padH, halfW, padTop, chartH]);

  const asksPath = useMemo(() => {
    if (asksPoints.length === 0) return '';
    const startX = padH + halfW;
    const startY = padTop + chartH;
    let path = `M ${startX} ${startY}`;
    for (const pt of asksPoints) {
      path += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    const lastX = asksPoints[asksPoints.length - 1].x;
    path += ` L ${lastX.toFixed(1)} ${startY} Z`;
    return path;
  }, [asksPoints, padH, halfW, padTop, chartH]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scale = svgWidth / rect.width;
    const svgX = clientX * scale;

    const midX = padH + halfW;
    if (svgX < midX) {
      // On Bid side
      const dist = (midX - svgX) / halfW;
      const idx = Math.min(
        depthData.bids.length - 1,
        Math.max(0, Math.round(dist * (depthData.bids.length - 1)))
      );
      const b = depthData.bids[idx];
      if (b) {
        setHoverDepth({ price: b.price, total: b.total, side: 'bid', x: svgX });
      }
    } else {
      // On Ask side
      const dist = (svgX - midX) / halfW;
      const idx = Math.min(
        depthData.asks.length - 1,
        Math.max(0, Math.round(dist * (depthData.asks.length - 1)))
      );
      const a = depthData.asks[idx];
      if (a) {
        setHoverDepth({ price: a.price, total: a.total, side: 'ask', x: svgX });
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverDepth(null)}
      >
        <defs>
          <linearGradient id="bidsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="asksGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Center Midpoint line */}
        <line
          x1={padH + halfW}
          y1={padTop}
          x2={padH + halfW}
          y2={padTop + chartH}
          stroke="#334155"
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        {/* Bids Depth Fill & Stroke */}
        <path d={bidsPath} fill="url(#bidsGrad)" />
        <path
          d={bidsPath.replace(/ Z$/, '')}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Asks Depth Fill & Stroke */}
        <path d={asksPath} fill="url(#asksGrad)" />
        <path
          d={asksPath.replace(/ Z$/, '')}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Midpoint Label */}
        <text
          x={padH + halfW}
          y={padTop + 14}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          Mid: {depthData.midPrice.toFixed(2)} ETB
        </text>

        {/* Spread badge */}
        <text
          x={padH + halfW}
          y={padTop + 28}
          textAnchor="middle"
          fill="#64748b"
          fontSize="9.5"
          fontFamily="monospace"
        >
          Spread: {depthData.spread.toFixed(2)} ETB
        </text>

        {/* Bottom price bounds */}
        <text
          x={padH}
          y={padTop + chartH + 16}
          textAnchor="start"
          fill="#10b981"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {depthData.bids[depthData.bids.length - 1]?.price.toFixed(2)} ETB (Bids)
        </text>

        <text
          x={svgWidth - padH}
          y={padTop + chartH + 16}
          textAnchor="end"
          fill="#ef4444"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {depthData.asks[depthData.asks.length - 1]?.price.toFixed(2)} ETB (Asks)
        </text>

        {/* Hover Crosshair & Tooltip */}
        {hoverDepth && (
          <g>
            <line
              x1={hoverDepth.x}
              y1={padTop}
              x2={hoverDepth.x}
              y2={padTop + chartH}
              stroke={hoverDepth.side === 'bid' ? '#10b981' : '#ef4444'}
              strokeDasharray="2 2"
              strokeWidth="1.2"
            />
            <g transform={`translate(${Math.max(80, Math.min(svgWidth - 110, hoverDepth.x))}, ${padTop + 45})`}>
              <rect
                x="-65"
                y="-20"
                width="130"
                height="40"
                rx="6"
                fill="#0f172a"
                stroke={hoverDepth.side === 'bid' ? '#10b981' : '#ef4444'}
                strokeWidth="1"
              />
              <text
                x="0"
                y="-4"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {hoverDepth.price.toFixed(2)} ETB
              </text>
              <text
                x="0"
                y="11"
                textAnchor="middle"
                fill={hoverDepth.side === 'bid' ? '#34d399' : '#f87171'}
                fontSize="9.5"
                fontFamily="monospace"
              >
                Depth: {hoverDepth.total.toFixed(3)}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
