import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Code2,
  Link2,
  Bookmark,
  ChevronDown,
  TrendingUp,
  Clock,
  Repeat2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { HERO_CAROUSEL_SLIDES, HeroSlideItem, heroSlideLogoUrl } from '../../data/polymarketExtendedData';
import { PolymarketTradeState, PolymarketMarket } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import { getRealisticChartForMarket } from '../../services/polymarketChartProfiles';
import {
  t,
  translateMarketTitle,
  translateOutcomeName,
  formatBirrVolume,

} from '../../data/polymarketTranslations';

interface PolymarketHeroCardProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  onOpenDetail?: (market: PolymarketMarket) => void;
  activeSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  isDarkMode?: boolean;
}

export const PolymarketHeroCard: React.FC<PolymarketHeroCardProps> = ({
  onSelectOutcome,
  onOpenDetail,
  activeSlideIndex = 0,
  onSlideChange,
  isDarkMode = true,
}) => {
  const { language } = useBetting();
  const [internalSlide, setInternalSlide] = useState(0);
  const slideIndex = onSlideChange ? activeSlideIndex : internalSlide;
  const setSlide = (idx: number) => {
    const safeIdx = (idx + HERO_CAROUSEL_SLIDES.length) % HERO_CAROUSEL_SLIDES.length;
    if (onSlideChange) {
      onSlideChange(safeIdx);
    } else {
      setInternalSlide(safeIdx);
    }
  };

  const slide = HERO_CAROUSEL_SLIDES[slideIndex] || HERO_CAROUSEL_SLIDES[0];

  // Auto-rotate the hero carousel in a loop; pause while the user hovers the card.
  const [paused, setPaused] = useState(false);
  const slideRef = useRef(slideIndex);
  slideRef.current = slideIndex;
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setSlide(slideRef.current + 1);
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState<string>('Sep 16');
  const [activeTimeframe, setActiveTimeframe] = useState<string>('ALL');
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Real-time live drift & trade pings ladder (matching Polymarket live behavior)
  const [heroLiveDrift, setHeroLiveDrift] = useState<number>(0);
  const [heroLiveTrades, setHeroLiveTrades] = useState<{ id: string; amount: number; yPercent: number; color: string }[]>([
    { id: 'ht-1', amount: 17, yPercent: 38, color: '#10b981' },
    { id: 'ht-2', amount: 9, yPercent: 48, color: '#94a3b8' },
    { id: 'ht-3', amount: 1, yPercent: 56, color: '#f59e0b' },
    { id: 'ht-4', amount: 5, yPercent: 64, color: '#38bdf8' },
    { id: 'ht-5', amount: 50, yPercent: 72, color: '#10b981' },
  ]);

  useEffect(() => {
    const tradeAmounts = [1, 2, 3, 5, 6, 9, 11, 17, 24, 40, 50, 75, 88];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#38bdf8', '#ef4444'];
    const interval = setInterval(() => {
      setHeroLiveDrift((prev) => {
        const delta = (Math.random() - 0.5) * 0.35;
        return +(Math.max(-1.4, Math.min(1.4, prev + delta))).toFixed(2);
      });

      if (Math.random() > 0.42) {
        const amt = tradeAmounts[Math.floor(Math.random() * tradeAmounts.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const yPct = Math.floor(Math.random() * 45) + 28;
        setHeroLiveTrades((prev) => [
          { id: `ht-${Date.now()}`, amount: amt, yPercent: yPct, color },
          ...prev.slice(0, 4),
        ]);
      }
    }, 2100);
    return () => clearInterval(interval);
  }, [slide.id]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // SVG Chart Geometry
  const svgWidth = 780;
  const svgHeight = 240;
  const paddingLeft = 10;
  const paddingRight = 45;
  // Extra top padding reserves a clean band under the timeframe pills and above
  // the top price/% axis label — that is where the ሃገራዊ watermark now sits.
  const paddingTop = 40;
  const paddingBottom = 30;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number, maxVal = 100) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return paddingTop + (1 - clamped / maxVal) * chartInnerHeight;
  };

  // Realistic chart data generator for each statement, question, and match
  const chartData = useMemo(() => {
    return getRealisticChartForMarket(
      slide.id,
      slide.title,
      slide.outcomes,
      slide.category
    );
  }, [slide.id, slide.title, slide.outcomes, slide.category]);

  // Check if price chart based on raw points
  const rawMaxCheck = Math.max(
    ...chartData.lines.flatMap((l) => l.points as number[])
  );
  const isPriceChart = rawMaxCheck > 1000;

  // Scaled lines incorporating hero live drift
  const activeHeroLines = useMemo(() => {
    return chartData.lines.map((l, lIdx) => {
      const copy = [...l.points];
      if (copy.length > 0 && !isPriceChart && lIdx === 0) {
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = +(Math.max(1, Math.min(99, last + heroLiveDrift))).toFixed(1);
      }
      return { ...l, points: copy };
    });
  }, [chartData.lines, heroLiveDrift, isPriceChart]);

  // Auto-scale the chart to its own data range so the plotted line always lines
  // up with the axis labels (fixes the price chart and low-probability markets).
  const allYValues = activeHeroLines.flatMap((l) => l.points as number[]);
  const rawMin = Math.min(...allYValues);
  const rawMax = Math.max(...allYValues);
  let scaleMin: number;
  let scaleMax: number;
  if (isPriceChart) {
    const pad = Math.max((rawMax - rawMin) * 0.3, 2);
    scaleMin = rawMin - pad;
    scaleMax = rawMax + pad;
  } else {
    const pad = Math.max((rawMax - rawMin) * 0.25, 6);
    scaleMin = Math.max(0, rawMin - pad);
    scaleMax = Math.min(100, rawMax + pad);
    if (scaleMax - scaleMin < 12) scaleMax = Math.min(100, scaleMin + 12);
  }
  const scaleSpan = scaleMax - scaleMin || 1;
  const plotY = (val: number) =>
    paddingTop + (1 - (val - scaleMin) / scaleSpan) * chartInnerHeight;
  const TICK_COUNT = 5;
  const computedYTicks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const v = scaleMax - (i / (TICK_COUNT - 1)) * scaleSpan;
    return isPriceChart ? `${Math.round(v).toLocaleString()} ETB` : `${Math.round(v)}%`;
  });
  const fmtHover = (v: number) =>
    isPriceChart ? `${Math.round(v).toLocaleString()} ETB` : `${v}%`;

  // Handle Chart Cursor Movement
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clampedX = Math.max(paddingLeft, Math.min(paddingLeft + chartInnerWidth, clientX));
    setHoverX(clampedX);

    // Calculate approx value
    const primaryLine = chartData.lines[0];
    if (primaryLine && primaryLine.points.length > 0) {
      const ratio = (clampedX - paddingLeft) / chartInnerWidth;
      const idx = Math.min(
        primaryLine.points.length - 1,
        Math.max(0, Math.round(ratio * (primaryLine.points.length - 1)))
      );
      setHoverVal(primaryLine.points[idx]);
    }
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverVal(null);
  };

  return (
    <div className="w-full">
      {/* Main Hero Card Container */}
      <div
        id="polymarket-hero-main-card"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={`w-full rounded-2xl border transition-all duration-300 relative overflow-hidden ${
          isDarkMode
            ? 'bg-[#101622] border-[#1f293b] text-white shadow-xl'
            : 'bg-white border-neutral-200 text-neutral-900 shadow-md'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Category & Title */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
                <span>{slide.category}</span>
                <span>·</span>
                <span className="text-neutral-300">{slide.subcategory}</span>
                {slide.endsIn && (
                  <span className="flex items-center gap-1 text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded-full text-[11px]">
                    <Clock className="w-3 h-3" />
                    {language === 'am' ? `የሚያበቃው በ ${slide.endsIn}` : `Ends in ${slide.endsIn}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {heroSlideLogoUrl[slide.id] ? (
                  <img
                    src={heroSlideLogoUrl[slide.id]}
                    alt={slide.title}
                    className="w-10 h-10 rounded-xl object-contain bg-[#0b111c] border border-[#222c3e] shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                    {slide.category[0]}
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {translateMarketTitle(slide.title, language)}
                </h1>
              </div>
            </div>

            {/* Right: Actions (Embed, Link, Bookmark) */}
            <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
              <button
                onClick={handleCopyLink}
                className="p-2 hover:text-white hover:bg-[#1b2536] rounded-lg transition-colors cursor-pointer"
                title="Copy market link"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 hover:text-white hover:bg-[#1b2536] rounded-lg transition-colors cursor-pointer"
                title="Bookmark market"
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Outcome Bars / Buttons Row */}
          <div className="mt-4">
            {slide.id === 'btc-up-down' ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-[#141b27] border border-[#222d3d] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400">
                      {language === 'am' ? 'የሚበልጠው ዋጋ' : 'Price to Beat'}
                    </div>
                    <div className="font-mono font-bold text-white text-base">
                      {slide.priceToBeat?.toLocaleString()} ETB
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-neutral-400">
                      {language === 'am' ? 'የአሁኑ ዋጋ' : 'Current Price'}
                    </div>
                    <div className="font-mono font-bold text-amber-400 text-base">
                      {slide.currentPrice?.toLocaleString()} ETB
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onSelectOutcome({
                      marketId: slide.id,
                      outcomeName: 'Up',
                      price: 51,
                      side: 'yes',
                    })
                  }
                  className="py-3 px-5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{slide.upMultiplier}</span>
                </button>

                <button
                  onClick={() =>
                    onSelectOutcome({
                      marketId: slide.id,
                      outcomeName: 'Down',
                      price: 49,
                      side: 'no',
                    })
                  }
                  className="py-3 px-5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>{slide.downMultiplier}</span>
                </button>
              </div>
            ) : (
              /* Multi-outcome bar row */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {slide.outcomes.map((outc, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      onSelectOutcome({
                        marketId: slide.id,
                        outcomeName: outc.name,
                        price: Math.round(outc.probability),
                        side: 'yes',
                      })
                    }
                    className="p-2.5 rounded-xl bg-[#141b27] hover:bg-[#1a2333] border border-[#202b3c] transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-300 truncate font-medium group-hover:text-white">
                        {translateOutcomeName(outc.name, language)}
                      </span>
                      <span
                        className="font-bold font-mono text-sm ml-1"
                        style={{ color: outc.color }}
                      >
                        {outc.probability < 1 ? '<1%' : `${outc.probability}%`}
                      </span>
                    </div>
                    {/* Mini progress track */}
                    <div className="w-full h-1.5 bg-[#0e141f] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(2, Math.min(100, outc.probability))}%`,
                          backgroundColor: outc.color,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle: Interactive Chart & Comments Ticker */}
        <div className="px-4 sm:px-5 py-2 border-t border-[#1a2434] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Chart Section (8 cols) */}
          <div className="lg:col-span-12 relative">
            {/* Chart Toolbar (Date Tabs & Timeframes) */}
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <div className="flex items-center gap-1">
                {['Monthly', 'All Time'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDateTab(tab)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeDateTab === tab
                        ? 'bg-[#1b2536] text-white font-semibold'
                        : 'hover:text-white'
                    }`}
                  >
                    {language === 'am' ? (tab === 'Monthly' ? 'ወርሃዊ' : 'ሁሉም ጊዜ') : tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 font-mono text-[11px]">
                {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activeTimeframe === tf
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Line / Step Graph */}
            <div className="relative w-full h-[190px] sm:h-[220px]">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full cursor-crosshair select-none"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  {/* Dynamic clipPath for scrubbing lines left and right with cursor */}
                  <clipPath id={`hero-chart-clip-${slide.id}`}>
                    <rect
                      x="0"
                      y="0"
                      width={hoverX !== null ? hoverX : svgWidth}
                      height={svgHeight}
                    />
                  </clipPath>
                  <style>{`
                    @keyframes heroRadarPulse {
                      0% { r: 4.5; opacity: 0.65; }
                      100% { r: 16; opacity: 0; }
                    }
                    @keyframes heroRadarPulse2 {
                      0% { r: 4.5; opacity: 0.5; }
                      100% { r: 11; opacity: 0; }
                    }
                  `}</style>
                </defs>

                {/* Brand watermark — faint mark in the top-right corner */}
                <text
                  x={svgWidth - paddingRight - 4}
                  y={paddingTop - 14}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="22"
                  fontWeight="700"
                  fontFamily="'Nyala', 'Noto Sans Ethiopic', system-ui, sans-serif"
                  opacity="0.45"
                  className="select-none"
                >
                  ሃገራዊ
                </text>

                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
                  <line
                    key={i}
                    x1={paddingLeft}
                    y1={paddingTop + ratio * chartInnerHeight}
                    x2={svgWidth - paddingRight}
                    y2={paddingTop + ratio * chartInnerHeight}
                    stroke="#1c2637"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Y-Axis Ticks */}
                {computedYTicks.map((tick, i) => {
                  const yPos =
                    paddingTop + (i / (computedYTicks.length - 1)) * chartInnerHeight;
                  return (
                    <text
                      key={i}
                      x={svgWidth - paddingRight + 8}
                      y={yPos + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {tick}
                    </text>
                  );
                })}

                {/* Left-Side Live Trade/Bet Pings Ladder */}
                <g className="pointer-events-none select-none">
                  {heroLiveTrades.map((t, idx) => {
                    const yPos = paddingTop + (t.yPercent / 100) * chartInnerHeight;
                    return (
                      <g key={t.id} opacity={1 - idx * 0.18}>
                        <text
                          x={paddingLeft + 4}
                          y={yPos}
                          textAnchor="start"
                          fill={t.color}
                          fontSize="9.5"
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

                {/* Data Lines: Dynamically reveals/retracts left & right with cursor */}
                {activeHeroLines.map((line, lineIdx) => {
                  const pts = line.points;
                  if (pts.length < 2) return null;

                  // Build smooth curve path
                  let d = '';
                  pts.forEach((val, idx) => {
                    const x = paddingLeft + (idx / (pts.length - 1)) * chartInnerWidth;
                    const y = plotY(val);
                    if (idx === 0) {
                      d += `M ${x} ${y}`;
                    } else {
                      const prevX =
                        paddingLeft + ((idx - 1) / (pts.length - 1)) * chartInnerWidth;
                      const prevY = plotY(pts[idx - 1]);
                      const midX = (prevX + x) / 2;
                      d += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
                    }
                  });

                  return (
                    <g key={lineIdx}>
                      {/* 1. Ghost background silhouette trail when hovering (matching video 00:06) */}
                      {hoverX !== null && (
                        <path
                          d={d}
                          fill="none"
                          stroke={line.color}
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={0.16}
                        />
                      )}
                      {/* 2. Solid vibrant line dynamically extending / retracting with cursor */}
                      <path
                        d={d}
                        fill="none"
                        stroke={line.color}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        clipPath={`url(#hero-chart-clip-${slide.id})`}
                        opacity={1}
                      />
                    </g>
                  );
                })}

                {/* Pulsating End/Scrub Points:
                    - Radar rings ONLY expand for the top line (lowest Y / highest probability)
                    - Black circle outline removed completely, replaced with crisp white outline
                */}
                {(() => {
                  // Pre-calculate positions for each line
                  const calculatedPoints = activeHeroLines.map((line, lineIdx) => {
                    const pts = line.points;
                    if (pts.length < 2) return null;

                    let ptX = paddingLeft + chartInnerWidth;
                    let ptY = plotY(pts[pts.length - 1]);

                    if (hoverX !== null) {
                      ptX = hoverX;
                      const ratio = Math.max(0, Math.min(1, (hoverX - paddingLeft) / chartInnerWidth));
                      const floatIdx = ratio * (pts.length - 1);
                      const i0 = Math.floor(floatIdx);
                      const i1 = Math.min(pts.length - 1, i0 + 1);
                      const frac = floatIdx - i0;
                      const v = pts[i0] + (pts[i1] - pts[i0]) * frac;
                      ptY = plotY(v);
                    }

                    return {
                      line,
                      lineIdx,
                      ptX,
                      ptY,
                    };
                  }).filter(Boolean);

                  // Find top line (smallest ptY)
                  let topIdx = 0;
                  let minY = Infinity;
                  calculatedPoints.forEach((p) => {
                    if (p && p.ptY < minY) {
                      minY = p.ptY;
                      topIdx = p.lineIdx;
                    }
                  });

                  return calculatedPoints.map((item) => {
                    if (!item) return null;
                    const { line, lineIdx, ptX, ptY } = item;
                    const isTop = lineIdx === topIdx;

                    return (
                      <g key={`hero-end-${lineIdx}`} className="transition-all duration-75 pointer-events-none">
                        {/* Radar rings ONLY expand for the top line */}
                        {isTop && (
                          <>
                            {/* 1. Primary expanding radar blink ripple */}
                            <circle cx={ptX} cy={ptY} r="4.5" fill={line.color} opacity="0.6"
                              style={{ animation: 'heroRadarPulse 2.2s ease-out infinite' }}
                            />

                            {/* 2. Secondary staggered ripple for continuous pulse */}
                            <circle cx={ptX} cy={ptY} r="4.5" fill={line.color} opacity="0.45"
                              style={{ animation: 'heroRadarPulse2 2.2s ease-out 0.8s infinite' }}
                            />

                            {/* 3. Soft translucent glow halo */}
                            <circle cx={ptX} cy={ptY} r="7" fill={line.color} opacity="0.28" />
                          </>
                        )}

                        {/* 4. Solid center point with crisp white outline (black circle removed) */}
                        <circle cx={ptX} cy={ptY} r="4.5" fill={line.color} stroke="#ffffff" strokeWidth="1.8" />
                      </g>
                    );
                  });
                })()}

                {/* Hover Cursor Hairline & Circular Beacon Ring (Video 00:00, 00:04, 00:06, 00:10) */}
                {hoverX !== null && (
                  <g className="pointer-events-none">
                    <line
                      x1={hoverX}
                      y1={paddingTop - 4}
                      x2={hoverX}
                      y2={svgHeight - paddingBottom}
                      stroke="rgba(255, 255, 255, 0.35)"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    {/* Blue target cursor ring matching video */}
                    <circle
                      cx={hoverX}
                      cy={plotY(hoverVal ?? scaleMin)}
                      r="11"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      opacity="0.9"
                    />
                    <circle
                      cx={hoverX}
                      cy={plotY(hoverVal ?? scaleMin)}
                      r="3.5"
                      fill="#38bdf8"
                      opacity="0.95"
                    />

                    {/* Floating inline tags attached to each line at hoverX (matching video 00:01 - 00:15) */}
                    {(() => {
                      // Collect tag positions for collision avoidance
                      const tagData = activeHeroLines.map((line, lineIdx) => {
                        const pts = line.points;
                        if (pts.length < 2) return null;
                        const ratio = Math.max(0, Math.min(1, (hoverX - paddingLeft) / chartInnerWidth));
                        const floatIdx = ratio * (pts.length - 1);
                        const i0 = Math.floor(floatIdx);
                        const i1 = Math.min(pts.length - 1, i0 + 1);
                        const frac = floatIdx - i0;
                        const v = pts[i0] + (pts[i1] - pts[i0]) * frac;
                        return { line, lineIdx, rawY: plotY(v), value: v };
                      }).filter(Boolean) as { line: typeof activeHeroLines[0]; lineIdx: number; rawY: number; value: number }[];

                      // Sort by Y and apply collision avoidance
                      const sorted = [...tagData].sort((a, b) => a.rawY - b.rawY);
                      const minGap = 28;
                      const tagH = 24;
                      const adjustedY = sorted.map((d) => d.rawY);
                      for (let pass = 0; pass < 6; pass++) {
                        for (let i = 1; i < adjustedY.length; i++) {
                          if (adjustedY[i] - adjustedY[i - 1] < minGap) {
                            const overlap = minGap - (adjustedY[i] - adjustedY[i - 1]);
                            adjustedY[i - 1] = Math.max(paddingTop + tagH / 2, adjustedY[i - 1] - overlap / 2);
                            adjustedY[i] = Math.min(svgHeight - paddingBottom - tagH / 2, adjustedY[i] + overlap / 2);
                          }
                        }
                      }
                      for (let i = 0; i < adjustedY.length; i++) {
                        adjustedY[i] = Math.max(paddingTop + tagH / 2, Math.min(svgHeight - paddingBottom - tagH / 2, adjustedY[i]));
                      }

                      const tagWidth = 140;
                      const tagHeight = 24;

                      return sorted.map((d, idx) => {
                        const isNearRight = hoverX > svgWidth - tagWidth - 20;
                        const tagX = isNearRight ? hoverX - tagWidth - 10 : hoverX + 10;
                        const tagY = adjustedY[idx] - tagHeight / 2;

                        return (
                          <g key={`hero-tag-${d.lineIdx}`}>
                            <rect
                              x={tagX}
                              y={tagY}
                              width={tagWidth}
                              height={tagHeight}
                              rx="5"
                              fill="#0e1726"
                              stroke="#223249"
                              strokeWidth="1"
                            />
                            <rect
                              x={tagX + 5}
                              y={tagY + 5}
                              width="2.5"
                              height={tagHeight - 10}
                              rx="1"
                              fill={d.line.color}
                            />
                            <text
                              x={tagX + 12}
                              y={tagY + 16}
                              fill="#e2e8f0"
                              fontSize="10"
                              fontWeight="600"
                            >
                              {d.line.name.length > 12 ? `${d.line.name.slice(0, 11)}…` : d.line.name}
                            </text>
                            <text
                              x={tagX + tagWidth - 6}
                              y={tagY + 16}
                              textAnchor="end"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="700"
                              fontFamily="monospace"
                            >
                              {fmtHover(Math.round(d.value))}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </g>
                )}

                {/* X-Axis Labels */}
                {chartData.labels.map((lbl, i) => {
                  const xPos =
                    paddingLeft + (i / (chartData.labels.length - 1)) * chartInnerWidth;
                  return (
                    <text
                      key={i}
                      x={xPos}
                      y={svgHeight - 10}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {lbl}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Resolution date caption (kept after removing the Live Comments panel) */}
            {slide.resolutionDate && (
              <div className="mt-3 pt-2 border-t border-[#1b2536] text-[11px] text-neutral-400 flex items-center justify-end gap-2">
                <span>Resolution Date</span>
                <span className="font-semibold text-neutral-300">{slide.resolutionDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Carousel Dots & Sub-navigation Row (Directly below hero card from video 00:07 - 00:15) */}
      <div className="flex items-center justify-between gap-3 mt-4 mb-4">
        {/* Left: Carousel Progress Indicator (1 active pill + 7 dots) */}
        <div className="flex items-center gap-1.5">
          {HERO_CAROUSEL_SLIDES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setSlide(dotIdx)}
              className={`transition-all duration-300 cursor-pointer ${
                dotIdx === slideIndex
                  ? 'w-7 h-1.5 bg-neutral-200 rounded-full'
                  : 'w-1.5 h-1.5 bg-neutral-700 hover:bg-neutral-500 rounded-full'
              }`}
              title={`Slide ${dotIdx + 1}`}
            />
          ))}
        </div>

        {/* Right: Previous / Next Slide Pill Buttons + Explore all */}
        <div className="flex items-center gap-2">
          {/* Arrow Left */}
          <button
            onClick={() => setSlide(slideIndex - 1)}
            className="p-1.5 rounded-full bg-[#141a26] hover:bg-[#1d2636] border border-[#222b3b] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Previous slide"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Left Destination Pill */}
          {slide.prevSlideLabel && (
            <button
              onClick={() => setSlide(slideIndex - 1)}
              className="px-3.5 py-1.5 rounded-full bg-[#141a26] hover:bg-[#1d2636] border border-[#222b3b] text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{translateMarketTitle(slide.prevSlideLabel, language)}</span>
            </button>
          )}

          {/* Right Destination Pill */}
          {slide.nextSlideLabel && (
            <button
              onClick={() => setSlide(slideIndex + 1)}
              className="px-3.5 py-1.5 rounded-full bg-[#141a26] hover:bg-[#1d2636] border border-[#222b3b] text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{translateMarketTitle(slide.nextSlideLabel, language)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}

          {/* Arrow Right */}
          <button
            onClick={() => setSlide(slideIndex + 1)}
            className="p-1.5 rounded-full bg-[#141a26] hover:bg-[#1d2636] border border-[#222b3b] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Next slide"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Explore all button */}
          <button
            onClick={() => {
              const el = document.getElementById('all-markets-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-1.5 rounded-full bg-[#151a24] hover:bg-[#1e2533] border border-[#263143] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            {language === 'am' ? 'ሁሉንም አስስ' : 'Explore all'}
          </button>
        </div>
      </div>
    </div>
  );
};
