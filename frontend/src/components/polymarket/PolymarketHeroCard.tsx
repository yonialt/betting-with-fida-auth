import React, { useState, useRef, useEffect } from 'react';
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
import { HERO_CAROUSEL_SLIDES, HeroSlideItem } from '../../data/polymarketExtendedData';
import { PolymarketTradeState, PolymarketMarket } from '../../types/polymarket';
import { useBetting } from '../../context/BettingContext';
import {
  t,
  translateMarketTitle,
  translateOutcomeName,
  formatBirrVolume,
  formatSantim,
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

  // Simulated chart data generator based on slide
  const getSlideChartData = (slideId: string) => {
    switch (slideId) {
      case 'clarity-act':
        return {
          labels: ['Aug 9', 'Aug 16', 'Aug 23', 'Aug 30', 'Sep 6'],
          yTicks: ['38%', '34%', '30%', '26%', '22%', '18%', '14%'],
          lines: [
            {
              name: 'Yes',
              color: '#10b981',
              points: [22, 26, 32, 25, 29, 21, 19, 16],
            },
          ],
        };
      case 'btc-up-down':
        return {
          labels: ['2:10 PM', '2:11 PM', '2:12 PM', '2:13 PM', '2:14 PM', '2:15 PM'],
          yTicks: ['79,840 ETB', '79,835 ETB', '79,830 ETB', '79,825 ETB', '79,820 ETB'],
          targetLine: 79829,
          lines: [
            {
              name: 'BTC',
              color: '#f59e0b',
              points: [79820, 79825, 79832, 79828, 79831, 79829],
            },
          ],
        };
      case 'midterms-balance-power':
        return {
          labels: ['Nov 2024', 'May 2025', 'Nov 2025', 'May 2026', 'Nov 2026'],
          yTicks: ['60%', '45%', '30%', '15%', '0%'],
          lines: [
            { name: 'Democrats Sweep', color: '#3b82f6', points: [35, 40, 42, 48, 51] },
            { name: 'R Senate, D House', color: '#06b6d4', points: [25, 28, 30, 34, 36] },
            { name: 'Republicans Sweep', color: '#ef4444', points: [35, 28, 25, 16, 12] },
            { name: 'D Senate, R House', color: '#a855f7', points: [5, 4, 3, 2, 1] },
          ],
        };
      case 'best-ai-september':
        return {
          labels: ['Aug 9', 'Aug 16', 'Aug 23', 'Aug 30', 'Sep 6'],
          yTicks: ['80%', '60%', '40%', '20%', '0%'],
          lines: [
            { name: 'Anthropic', color: '#38bdf8', points: [45, 52, 60, 72, 84] },
            { name: 'OpenAI', color: '#10b981', points: [42, 38, 30, 22, 14] },
            { name: 'Google', color: '#f59e0b', points: [10, 8, 7, 4, 2] },
          ],
        };
      case 'eth-addis-federal-city':
        return {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
          yTicks: ['80%', '60%', '40%', '20%', '0%'],
          lines: [{ name: 'Yes', color: '#10b981', points: [12, 15, 19, 22, 24, 26, 25, 26] }],
        };
      case 'eth-military-service':
        return {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
          yTicks: ['80%', '60%', '40%', '20%', '0%'],
          lines: [{ name: 'Yes', color: '#10b981', points: [18, 20, 24, 22, 26, 30, 28, 29] }],
        };
      case 'eth-red-sea-access':
        return {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
          yTicks: ['90%', '75%', '60%', '45%', '30%'],
          lines: [{ name: 'Yes', color: '#10b981', points: [58, 63, 61, 69, 72, 70, 73, 74] }],
        };
      default:
        // Fed Decision step chart
        return {
          labels: ['Aug 9', 'Aug 23', 'Sep 6'],
          yTicks: ['80%', '60%', '40%', '20%', '0%'],
          lines: [
            { name: 'No change', color: '#3b82f6', points: [20, 25, 35, 45, 51] },
            { name: '25 bps increase', color: '#eab308', points: [65, 60, 55, 52, 50] },
            { name: '50+ bps increase', color: '#ef4444', points: [12, 10, 5, 2, 1] },
            { name: '25 bps decrease', color: '#38bdf8', points: [3, 5, 5, 1, 0.4] },
          ],
        };
    }
  };

  const chartData = getSlideChartData(slide.id);

  // Auto-scale the chart to its own data range so the plotted line always lines
  // up with the axis labels (fixes the price chart and low-probability markets).
  const allYValues = chartData.lines.flatMap((l) => l.points as number[]);
  const rawMin = Math.min(...allYValues);
  const rawMax = Math.max(...allYValues);
  const isPriceChart = rawMax > 1000;
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

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>{translateMarketTitle(slide.title, language)}</span>
              </h1>
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
            {slide.id === 'clarity-act' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    onSelectOutcome({
                      marketId: slide.id,
                      outcomeName: 'Yes',
                      price: 16,
                      side: 'yes',
                    })
                  }
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{translateOutcomeName('Yes', language)} {formatSantim(16, language)}</span>
                  <span className="text-xs text-emerald-300 font-normal">
                    16% {language === 'am' ? 'ዕድል' : 'chance'}
                  </span>
                </button>
                <button
                  onClick={() =>
                    onSelectOutcome({
                      marketId: slide.id,
                      outcomeName: 'No',
                      price: 84,
                      side: 'no',
                    })
                  }
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{translateOutcomeName('No', language)} {formatSantim(84, language)}</span>
                  <span className="text-xs text-red-300 font-normal">
                    84% {language === 'am' ? 'ዕድል' : 'chance'}
                  </span>
                </button>
              </div>
            ) : slide.id === 'btc-up-down' ? (
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

                {/* Data Lines */}
                {chartData.lines.map((line, lineIdx) => {
                  const pts = line.points;
                  if (pts.length < 2) return null;

                  // Build smooth or step path
                  let d = '';
                  pts.forEach((val, idx) => {
                    const x = paddingLeft + (idx / (pts.length - 1)) * chartInnerWidth;
                    const y = plotY(val);
                    if (idx === 0) {
                      d += `M ${x} ${y}`;
                    } else {
                      // Smooth curve to next point
                      const prevX =
                        paddingLeft + ((idx - 1) / (pts.length - 1)) * chartInnerWidth;
                      const prevY = plotY(pts[idx - 1]);
                      const midX = (prevX + x) / 2;
                      d += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
                    }
                  });

                  return (
                    <g key={lineIdx}>
                      <path
                        d={d}
                        fill="none"
                        stroke={line.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })}

                {/* Hover Cursor Line */}
                {hoverX !== null && (
                  <g>
                    <line
                      x1={hoverX}
                      y1={paddingTop}
                      x2={hoverX}
                      y2={svgHeight - paddingBottom}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={hoverX}
                      cy={plotY(hoverVal ?? scaleMin)}
                      r="4.5"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
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

              {/* Dynamic Hover Tooltip */}
              {hoverX !== null && hoverVal !== null && (
                <div
                  className="absolute top-2 pointer-events-none bg-[#0a0f18] text-white text-xs px-2 py-1 rounded-md border border-[#2a374c] shadow-lg font-mono z-10"
                  style={{
                    left: Math.min(chartInnerWidth - 40, Math.max(10, hoverX)),
                  }}
                >
                  Value: {fmtHover(hoverVal)}
                </div>
              )}
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
