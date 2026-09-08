import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { PolymarketMarket } from '../../types/polymarket';
import { PolymarketTradingChart } from './PolymarketTradingChart';
import {
  CandleData,
  OrderbookDepthData,
  generateHistoricalCandles,
  generateOrderbookDepth,
  subscribeToMockPriceFeed,
} from '../../services/mockMarketFeed';
import { LineChart, BarChart2, Layers } from 'lucide-react';

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

export const PolymarketInteractiveChart: React.FC<PolymarketInteractiveChartProps> = ({
  market,
  timeframe = 'ALL',
  onHoverChange,
  defaultChartMode,
  allowTradingMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const isBtc5m = market.displayType === 'up_down_btc' || market.id === 'pm-btc-5m';
  const isTradingMarket = isBtc5m || market.category === 'Crypto' || market.subcategory === 'Crypto';

  // Active chart view mode: probability line vs K-line candlestick vs orderbook depth
  const [chartMode, setChartMode] = useState<'probability' | 'candles' | 'depth'>(
    defaultChartMode || (isBtc5m ? 'candles' : 'probability')
  );

  // Local state for live feed candles and orderbook
  const basePrice = market.currentPrice || market.priceToBeat || (isBtc5m ? 79820 : 100);
  const [candles, setCandles] = useState<CandleData[]>(() =>
    generateHistoricalCandles(basePrice, 70, 300)
  );
  const [orderbook, setOrderbook] = useState<OrderbookDepthData>(() =>
    generateOrderbookDepth(basePrice)
  );

  // Subscribe to live mock price feed for real-time tick streaming updates
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

  // SVG Coordinate Canvas bounds
  const svgWidth = 720;
  const svgHeight = 260;
  const padLeft = 40;
  const padRight = 50;
  const padTop = 26;
  const padBottom = 34;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const isEthiopia = market.id === 'pm-ethiopia-pm' || market.subcategory === 'Ethiopia';

  // Extract or synthesize high-fidelity series data
  const { labels, seriesList } = useMemo(() => {
    if (market.chartData && market.chartData.series.length > 0) {
      return {
        labels: market.chartData.labels,
        seriesList: market.chartData.series,
      };
    }

    // Default synthesized series if market does not have custom chartData
    const defaultLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const defaultSeries = market.outcomes.slice(0, 4).map((o, idx) => {
      const colors = ['#38bdf8', '#f97316', '#eab308', '#a855f7'];
      const baseProb = o.probability || 50;
      return {
        name: o.name,
        color: colors[idx % colors.length],
        currentVal: baseProb,
        data: [
          Math.max(0.1, baseProb - 3),
          Math.max(0.1, baseProb - 1),
          Math.max(0.1, baseProb + 1),
          Math.max(0.1, baseProb - 0.5),
          baseProb,
        ],
      };
    });

    return { labels: defaultLabels, seriesList: defaultSeries };
  }, [market]);

  // Coordinate scales
  const getX = useCallback(
    (index: number, total: number) => {
      if (total <= 1) return padLeft + chartWidth / 2;
      return padLeft + (index / (total - 1)) * chartWidth;
    },
    [padLeft, chartWidth]
  );

  // Y scale for percentage [0, 100]
  const getY = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(100, val));
      return padTop + chartHeight - (clamped / 100) * chartHeight;
    },
    [padTop, chartHeight]
  );

  // Build SVG path string with smooth organic spline
  const buildSmoothPath = useCallback(
    (data: number[]) => {
      if (data.length === 0) return '';
      const points = data.map((d, i) => ({
        x: getX(i, data.length),
        y: getY(d),
      }));

      if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

      let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return path;
    },
    [getX, getY]
  );

  // Event handlers for cursor scrubbing
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

  // Interpolated data calculation based on hoverX
  const hoverData = useMemo(() => {
    if (hoverX === null || !seriesList.length) return null;

    const dataLength = seriesList[0].data.length;
    if (dataLength < 2) return null;

    const t = Math.max(0, Math.min(1, (hoverX - padLeft) / chartWidth));
    const floatIdx = t * (dataLength - 1);
    const i0 = Math.floor(floatIdx);
    const i1 = Math.min(dataLength - 1, i0 + 1);
    const frac = floatIdx - i0;

    // Interpolate date / label
    const dateLabel = labels[Math.round(floatIdx)] || labels[i0] || '';

    // Interpolate each series value
    const interpolated = seriesList.map((s) => {
      const v0 = s.data[i0] ?? s.currentVal;
      const v1 = s.data[i1] ?? s.currentVal;
      const val = v0 + (v1 - v0) * frac;
      return {
        name: s.name,
        color: s.color,
        value: val,
        y: getY(val),
      };
    });

    // Lead series is the first series (e.g. Abiy Ahmed)
    const lead = interpolated[0];
    // Secondary series (e.g. Gedion, Belete, Berhanu) sorted by value descending
    const secondary = interpolated.slice(1).sort((a, b) => b.value - a.value);

    return {
      x: hoverX,
      date: dateLabel,
      lead,
      secondary,
      all: interpolated,
    };
  }, [hoverX, seriesList, labels, padLeft, chartWidth, getY]);

  // Propagate hover update to parent (if requested)
  React.useEffect(() => {
    if (hoverData) {
      onHoverChange?.({
        date: hoverData.date,
        leadName: hoverData.lead.name,
        leadVal: hoverData.lead.value,
        allValues: hoverData.all.map((s) => ({
          name: s.name,
          value: s.value,
          color: s.color,
        })),
      });
    }
  }, [hoverData, onHoverChange]);

  const leadSeries = seriesList[0];
  const lastIndex = leadSeries ? leadSeries.data.length - 1 : 0;
  const lastLeadX = getX(lastIndex, leadSeries ? leadSeries.data.length : 1);
  const lastLeadY = getY(leadSeries ? leadSeries.data[lastIndex] : 50);

  // Month label positions along bottom X axis
  const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];

  if (chartMode === 'candles' || chartMode === 'depth') {
    return (
      <div className="w-full flex flex-col gap-2.5">
        {/* Mode Selector Pill Bar */}
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
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Mode Selector Pill Bar (if trading is allowed for this market) */}
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
          <linearGradient id="leadGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
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

        {/* BTC 5m Specific Target Line */}
        {isBtc5m && (
          <g>
            <line
              x1={padLeft}
              y1={getY(50)}
              x2={svgWidth - padRight}
              y2={getY(50)}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            <text
              x={svgWidth - padRight - 80}
              y={getY(50) - 6}
              fill="#f59e0b"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Target $79,814
            </text>
          </g>
        )}

        {/* Secondary Series Paths (Rendered beneath lead series) */}
        {seriesList.slice(1).map((s) => {
          const pathD = buildSmoothPath(s.data);
          return (
            <g key={s.name}>
              <path
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </g>
          );
        })}

        {/* Lead Series Path (Abiy Ahmed / Primary) with glowing width */}
        {leadSeries && (
          <g>
            <path
              d={buildSmoothPath(leadSeries.data)}
              fill="none"
              stroke={leadSeries.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pulsating End Dot when NOT hovering (seen in frame 00:03) */}
            {!isHovering && (
              <g>
                <circle
                  cx={lastLeadX}
                  cy={lastLeadY}
                  r="7"
                  fill={leadSeries.color}
                  opacity="0.25"
                  className="animate-ping"
                />
                <circle
                  cx={lastLeadX}
                  cy={lastLeadY}
                  r="4"
                  fill={leadSeries.color}
                  stroke="#090d14"
                  strokeWidth="1.5"
                />
                <text
                  x={lastLeadX + 8}
                  y={lastLeadY + 3.5}
                  fill={leadSeries.color}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {leadSeries.data[lastIndex]?.toFixed(0)}%
                </text>
              </g>
            )}
          </g>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE CURSOR MOVEMENT OVERLAY (THE GRAPH MOVEMENT IN THE VIDEO)     */}
        {/* ========================================================================= */}
        {isHovering && hoverData && (
          <g className="pointer-events-none transition-all duration-75">
            {/* 1. Full-Height Vertical Crosshair Line tracking cursor X */}
            <line
              x1={hoverData.x}
              y1={padTop - 8}
              x2={hoverData.x}
              y2={svgHeight - padBottom}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />

            {/* Subtle glow behind vertical line */}
            <line
              x1={hoverData.x}
              y1={padTop}
              x2={hoverData.x}
              y2={svgHeight - padBottom}
              stroke="#38bdf8"
              strokeWidth="1"
              opacity="0.15"
            />

            {/* 2. Secondary Series Intersection Dots */}
            {hoverData.secondary.map((s) => (
              <circle
                key={`dot-${s.name}`}
                cx={hoverData.x}
                cy={s.y}
                r="3"
                fill={s.color}
                stroke="#090d14"
                strokeWidth="1.5"
              />
            ))}

            {/* 3. Lead Series Outer Glowing Ring / Halo + Center Dot (Video 00:00) */}
            <g>
              {/* Outer soft aura */}
              <circle
                cx={hoverData.x}
                cy={hoverData.lead.y}
                r="13"
                fill={hoverData.lead.color}
                opacity="0.15"
              />
              {/* Distinct outer halo ring as shown in video frame 00:00 */}
              <circle
                cx={hoverData.x}
                cy={hoverData.lead.y}
                r="8.5"
                fill="none"
                stroke={hoverData.lead.color}
                strokeWidth="2"
                opacity="0.95"
              />
              {/* Solid inner center circle */}
              <circle
                cx={hoverData.x}
                cy={hoverData.lead.y}
                r="4"
                fill={hoverData.lead.color}
                stroke="#090d14"
                strokeWidth="1.5"
              />
            </g>

            {/* 4. Floating Data Tags (Top Lead Tag & Bottom Stacked Tags) */}
            {(() => {
              // Calculate tooltip offset: flip to left if crosshair approaches right boundary
              const isNearRight = hoverData.x > svgWidth - 190;
              const tagX = isNearRight ? hoverData.x - 12 : hoverData.x + 12;
              const anchor = isNearRight ? 'end' : 'start';

              // Lead tag text width approximation
              const leadText = `${hoverData.lead.name} ${hoverData.lead.value.toFixed(1)}%`;
              const leadTagWidth = leadText.length * 7.5 + 24;

              return (
                <g filter="url(#softShadow)">
                  {/* Top Lead Tag (e.g. Abiy Ahmed 76.5% -> 94.5% -> 95.3%) */}
                  <g
                    transform={`translate(${isNearRight ? tagX - leadTagWidth : tagX}, ${Math.max(
                      padTop + 4,
                      hoverData.lead.y - 12
                    )})`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width={leadTagWidth}
                      height="24"
                      rx="6"
                      fill="#0d1422"
                      stroke="#223049"
                      strokeWidth="1"
                    />
                    {/* Vertical indicator bar */}
                    <rect
                      x="7"
                      y="6"
                      width="3"
                      height="12"
                      rx="1"
                      fill={hoverData.lead.color}
                    />
                    <text
                      x="16"
                      y="16"
                      fill="#f1f5f9"
                      fontSize="11.5"
                      fontWeight="600"
                      fontFamily="system-ui, sans-serif"
                    >
                      {hoverData.lead.name}
                    </text>
                    <text
                      x={leadTagWidth - 8}
                      y="16"
                      textAnchor="end"
                      fill={hoverData.lead.color}
                      fontSize="11.5"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      {hoverData.lead.value.toFixed(1)}%
                    </text>
                  </g>

                  {/* Bottom Stacked Tags for Secondary Candidates */}
                  {hoverData.secondary.length > 0 && (
                    <g
                      transform={`translate(${
                        isNearRight ? tagX - 170 : tagX
                      }, ${svgHeight - padBottom - hoverData.secondary.length * 24 - 4})`}
                    >
                      {hoverData.secondary.map((cand, idx) => (
                        <g key={cand.name} transform={`translate(0, ${idx * 23})`}>
                          <rect
                            x="0"
                            y="0"
                            width="170"
                            height="21"
                            rx="5"
                            fill="#0d1422"
                            stroke="#1e2738"
                            strokeWidth="0.8"
                          />
                          {/* Vertical Color Marker Bar */}
                          <rect
                            x="6"
                            y="5"
                            width="3"
                            height="11"
                            rx="1"
                            fill={cand.color}
                          />
                          {/* Candidate Name */}
                          <text
                            x="15"
                            y="14"
                            fill="#cbd5e1"
                            fontSize="10.5"
                            fontWeight="500"
                            fontFamily="system-ui, sans-serif"
                          >
                            {cand.name}
                          </text>
                          {/* Exact Value with 1 Decimal */}
                          <text
                            x="162"
                            y="14"
                            textAnchor="end"
                            fill="#ffffff"
                            fontSize="10.5"
                            fontWeight="700"
                            fontFamily="monospace"
                          >
                            {cand.value.toFixed(1)}%
                          </text>
                        </g>
                      ))}
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* Watermark in bottom left corner (matches video "Source: Polymarket.com") */}
        <text
          x={padLeft + 6}
          y={svgHeight - padBottom - 10}
          fill="#475569"
          fontSize="9.5"
          fontWeight="500"
          fontFamily="system-ui, sans-serif"
          className="select-none"
        >
          Source: Polymarket.com
        </text>

        {/* X Axis Month Labels: May, Jun, Jul, Aug, Sep */}
        {monthLabels.map((month, idx) => {
          const x = padLeft + (idx / (monthLabels.length - 1)) * chartWidth;
          return (
            <text
              key={month}
              x={x}
              y={svgHeight - 10}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="600"
            >
              {month}
            </text>
          );
        })}
      </svg>
      </div>
    </div>
  );
};
