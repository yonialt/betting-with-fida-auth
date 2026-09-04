import React, { useState, useRef } from 'react';
import {
  Code2,
  Link2,
  Bookmark,
  ChevronDown,
  Trophy,
  Clock,
  SlidersHorizontal,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { POLYMARKET_HERO } from '../../data/polymarketData';
import { PolymarketTradeState } from '../../types/polymarket';

interface PolymarketHeroCardProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
}

export const PolymarketHeroCard: React.FC<PolymarketHeroCardProps> = ({
  onSelectOutcome,
}) => {
  const hero = POLYMARKET_HERO;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState<string>('Sep 16');
  const [activeTimeframe, setActiveTimeframe] = useState<string>('ALL');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const seriesList = hero.chartData?.series || [];
  const labels = hero.chartData?.labels || [];
  const totalPoints = labels.length || 1;

  // SVG Chart ViewBox Dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const paddingLeft = 12;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number) => {
    // 0% - 100% scale
    const clamped = Math.max(0, Math.min(100, val));
    return paddingTop + (1 - clamped / 100) * chartInnerHeight;
  };

  const getX = (index: number) => {
    if (totalPoints <= 1) return paddingLeft;
    return paddingLeft + (index / (totalPoints - 1)) * chartInnerWidth;
  };

  // Build stepped curve path (curveStep interpolation like in Polymarket)
  const buildStepPath = (data: number[]) => {
    if (!data.length) return '';
    let path = `M ${getX(0)},${getY(data[0])}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(data[i]);
      const x2 = getX(i + 1);
      const y2 = getY(data[i + 1]);
      const xMid = (x1 + x2) / 2;
      // Step horizontal then vertical then horizontal
      path += ` L ${xMid},${y1} L ${xMid},${y2} L ${x2},${y2}`;
    }
    return path;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const scaleX = svgWidth / rect.width;
    const chartX = clientX * scaleX;

    const clampedX = Math.max(paddingLeft, Math.min(svgWidth - paddingRight, chartX));
    const ratio = (clampedX - paddingLeft) / chartInnerWidth;
    const nearestIdx = Math.round(ratio * (totalPoints - 1));
    const safeIdx = Math.max(0, Math.min(totalPoints - 1, nearestIdx));

    setHoverIndex(safeIdx);
    setTooltipPos({ x: getX(safeIdx), y: clientY * (svgHeight / rect.height) });
  };

  const handleSvgMouseLeave = () => {
    setHoverIndex(null);
    setTooltipPos(null);
  };

  // Get current active or hovered value for each series
  const getDisplayVal = (seriesIdx: number) => {
    const s = seriesList[seriesIdx];
    if (!s) return '0%';
    if (hoverIndex !== null && s.data[hoverIndex] !== undefined) {
      const val = s.data[hoverIndex];
      return val < 1 ? '<1%' : `${Math.round(val)}%`;
    }
    return s.currentVal < 1 ? '<1%' : `${Math.round(s.currentVal)}%`;
  };

  // Handle selecting an outcome from hero card
  const handleOutcomeClick = (seriesIdx: number, side: 'yes' | 'no' = 'yes') => {
    const s = seriesList[seriesIdx];
    if (!s) return;
    const heroOutcome = hero.outcomes[seriesIdx] || {
      name: s.name,
      probability: s.currentVal,
      yesPrice: Math.max(1, Math.round(s.currentVal)),
      noPrice: Math.max(1, 100 - Math.round(s.currentVal)),
    };
    onSelectOutcome({
      market: hero,
      outcome: heroOutcome,
      side,
      price: side === 'yes' ? (heroOutcome.yesPrice || Math.round(s.currentVal)) : (heroOutcome.noPrice || 100 - Math.round(s.currentVal)),
    });
  };

  const dateOptions = ['Sep 16', 'Oct 28', 'Dec 9', 'Jan 27, 2027'];

  return (
    <div
      id="polymarket-hero-container"
      className="w-full bg-[#0d121c] border border-[#1e2638] rounded-2xl p-5 lg:p-6 text-white shadow-2xl relative overflow-hidden"
    >
      {/* 1. Header Row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar Thumbnail */}
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#2d3a52] bg-[#1a2232] shadow-md">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=128&h=128&fit=crop"
              alt="Fed Decision"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="text-xs text-neutral-400 font-semibold tracking-wide flex items-center gap-1.5">
              <span>{hero.category}</span>
              <span className="text-neutral-500 font-bold">·</span>
              <span>{hero.subcategory}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5">
              {hero.title}
            </h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
          <button
            title="Embed Market"
            className="p-2 rounded-lg hover:text-white hover:bg-[#1a2334] transition-colors cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyLink}
            title={copiedLink ? 'Link Copied!' : 'Share Market'}
            className="p-2 rounded-lg hover:text-white hover:bg-[#1a2334] transition-colors cursor-pointer relative"
          >
            <Link2 className="w-4 h-4" />
            {copiedLink && (
              <span className="absolute -bottom-7 right-0 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={() => setIsBookmarked((prev) => !prev)}
            title="Bookmark Market"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-400 bg-amber-400/10'
                : 'hover:text-white hover:bg-[#1a2334]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Date Target Filter Pills Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#18202e] hover:bg-[#222d40] text-neutral-300 text-xs font-semibold border border-[#2a374d] transition-colors cursor-pointer">
          <span>Past</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {dateOptions.map((date) => (
          <button
            key={date}
            onClick={() => setActiveDateTab(date)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeDateTab === date
                ? 'bg-white text-[#0d121c] shadow-md font-extrabold'
                : 'bg-[#18202e] text-neutral-300 hover:text-white hover:bg-[#222d40] border border-[#2a374d]'
            }`}
          >
            {date}
          </button>
        ))}
      </div>

      {/* 3. Legend & Live Probability Row (Clickable Odds Selection) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* 25 bps increase (Light Blue) */}
          <button
            onClick={() => handleOutcomeClick(0, 'yes')}
            title="Click to trade 25 bps increase"
            className="flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg bg-[#141b27] hover:bg-[#1f2a3c] border border-[#243044] hover:border-[#38bdf8] transition-all cursor-pointer group shadow-xs"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shrink-0 group-hover:scale-125 transition-transform" />
            <span className="text-neutral-300 group-hover:text-white">25 bps increase</span>
            <span className="text-[#38bdf8] font-extrabold font-mono">{getDisplayVal(0)}</span>
          </button>

          {/* No change (Deep Blue) */}
          <button
            onClick={() => handleOutcomeClick(1, 'yes')}
            title="Click to trade No change"
            className="flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg bg-[#141b27] hover:bg-[#1f2a3c] border border-[#243044] hover:border-[#2563eb] transition-all cursor-pointer group shadow-xs"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0 group-hover:scale-125 transition-transform" />
            <span className="text-neutral-300 group-hover:text-white">No change</span>
            <span className="text-[#60a5fa] font-extrabold font-mono">{getDisplayVal(1)}</span>
          </button>

          {/* 50+ bps increase (Yellow) */}
          <button
            onClick={() => handleOutcomeClick(2, 'yes')}
            title="Click to trade 50+ bps increase"
            className="flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg bg-[#141b27] hover:bg-[#1f2a3c] border border-[#243044] hover:border-[#eab308] transition-all cursor-pointer group shadow-xs"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shrink-0 group-hover:scale-125 transition-transform" />
            <span className="text-neutral-300 group-hover:text-white">50+ bps increase</span>
            <span className="text-[#facc15] font-extrabold font-mono">{getDisplayVal(2)}</span>
          </button>

          {/* 25 bps decrease (Orange) */}
          <button
            onClick={() => handleOutcomeClick(3, 'yes')}
            title="Click to trade 25 bps decrease"
            className="flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg bg-[#141b27] hover:bg-[#1f2a3c] border border-[#243044] hover:border-[#f97316] transition-all cursor-pointer group shadow-xs"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shrink-0 group-hover:scale-125 transition-transform" />
            <span className="text-neutral-300 group-hover:text-white">25 bps decrease</span>
            <span className="text-[#fb923c] font-extrabold font-mono">{getDisplayVal(3)}</span>
          </button>
        </div>

        {/* Polymarket Logo Watermark Header */}
        <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-semibold select-none">
          <svg className="w-4 h-4 text-neutral-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="tracking-wide">Polymarket</span>
        </div>
      </div>

      {/* 4. The Graph Canvas */}
      <div className="relative w-full aspect-[2.4/1] min-h-[260px] bg-[#0c1017] rounded-xl border border-[#1a2334] p-1 overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible cursor-crosshair"
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={handleSvgMouseLeave}
        >
          {/* Horizontal Grid lines with right Y-Axis percentage labels */}
          {[100, 75, 50, 25, 0].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#1c2638"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={svgWidth - paddingRight + 8}
                  y={y + 3.5}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Stepped Curve Series Paths */}
          {seriesList.map((s, idx) => {
            const pathData = buildStepPath(s.data);
            const lastIdx = s.data.length - 1;
            const lastX = getX(lastIdx);
            const lastY = getY(s.data[lastIdx]);

            return (
              <g key={s.name}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={idx === 0 ? 2.5 : idx === 1 ? 2.2 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Active pulsating endpoint dot on line terminus */}
                <circle
                  cx={lastX}
                  cy={lastY}
                  r="4.5"
                  fill={s.color}
                  stroke="#0c1017"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Interactive Hover Crosshair & Tooltip */}
          {hoverIndex !== null && (
            <g className="pointer-events-none transition-all duration-75">
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop - 10}
                x2={getX(hoverIndex)}
                y2={svgHeight - paddingBottom}
                stroke="#475569"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />

              {/* Timestamp tag at top */}
              <g transform={`translate(${getX(hoverIndex)}, ${paddingTop - 12})`}>
                <rect
                  x={-35}
                  y={-10}
                  width={70}
                  height={18}
                  rx={4}
                  fill="#1e293b"
                  stroke="#334155"
                />
                <text
                  x={0}
                  y={2}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {labels[hoverIndex]}
                </text>
              </g>

              {/* Series intersection circles */}
              {seriesList.map((s) => {
                const val = s.data[hoverIndex];
                if (val === undefined) return null;
                const dotY = getY(val);
                return (
                  <circle
                    key={`dot-${s.name}`}
                    cx={getX(hoverIndex)}
                    cy={dotY}
                    r="5"
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}

          {/* Watermark Lower Left */}
          <text
            x={paddingLeft + 6}
            y={svgHeight - paddingBottom - 18}
            fill="#475569"
            fontSize="9"
            fontWeight="500"
            fontFamily="sans-serif"
          >
            Source: Polymarket.com
          </text>
        </svg>

        {/* Floating "+ $87" Link in bottom left of graph */}
        <div className="absolute bottom-11 left-4">
          <button className="text-xs font-bold text-[#38bdf8] hover:underline cursor-pointer flex items-center gap-1">
            + $87
          </button>
        </div>

        {/* Timeline Scrub Rail along bottom with Jul, Aug, Sep markers */}
        <div className="absolute bottom-2 left-3 right-12 flex items-center justify-between text-[11px] font-semibold text-neutral-500 px-2 pt-1 border-t border-[#1c2638]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            <span>Jul</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            <span>Aug</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-neutral-300">Sep</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        </div>
      </div>

      {/* 5. Bottom Card Info & Timeframe Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[#1e2638] text-xs">
        {/* Left: Volume & Resolution Date */}
        <div className="flex items-center gap-3 text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>$74,190,103 Vol.</span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Sep 15, 2026</span>
          </div>
        </div>

        {/* Right: Timeframes & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#141b27] p-0.5 rounded-lg border border-[#243044]">
            {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  activeTimeframe === tf
                    ? 'bg-[#222d3e] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            title="Chart Display Options"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a2334] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            title="Chart Settings"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a2334] transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
