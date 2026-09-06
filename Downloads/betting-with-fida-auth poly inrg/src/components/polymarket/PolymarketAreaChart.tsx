import React, { useState } from 'react';
import { curveStep } from '@visx/curve';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PolymarketMarket } from '../../types/polymarket';

interface PolymarketAreaChartProps {
  market: PolymarketMarket;
  onHoverValueChange?: (activeIdx: number, values: { [name: string]: number }) => void;
}

// Custom Grid Component that supports horizontal prop
export const Grid: React.FC<{ horizontal?: boolean; vertical?: boolean; className?: string }> = ({
  horizontal = true,
  vertical = false,
}) => (
  <CartesianGrid
    horizontal={horizontal}
    vertical={vertical}
    stroke="#e2e8f0"
    strokeDasharray="3 3"
  />
);

// Custom High-Quality Chart Tooltip
export const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const dateStr = dataPoint?.fullDate || label;

  return (
    <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl p-3 shadow-xl text-white text-xs min-w-[190px] animate-fadeIn pointer-events-none">
      <div className="flex items-center justify-between border-b border-neutral-700/60 pb-1.5 mb-2">
        <span className="font-mono text-[11px] text-neutral-300 font-semibold">{dateStr}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
          Step Quote
        </span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any) => {
          const name = entry.name === 'desktop' ? 'Lead Prediction' : entry.name;
          const val = entry.value;
          const color = entry.color || entry.stroke || '#3b82f6';
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-neutral-200 font-medium truncate text-[11px]">
                  {name}
                </span>
              </div>
              <span className="font-mono font-bold text-white text-xs">
                {typeof val === 'number' ? val.toFixed(1) : val}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PolymarketAreaChart: React.FC<PolymarketAreaChartProps> = ({
  market,
  onHoverValueChange,
}) => {
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState<string>('all');
  const labels = market.chartData?.labels || [];
  const seriesList = market.chartData?.series || [];

  // Transform data into Recharts / AreaChart format
  const chartData = labels.map((label, idx) => {
    const parts = label.split(', ');
    const day = parts[0] || label;
    const time = parts[1] || '';
    const item: Record<string, any> = {
      index: idx,
      date: label,
      day,
      time: time || day,
      fullDate: label,
    };

    seriesList.forEach((s) => {
      item[s.name] = s.data[idx] !== undefined ? s.data[idx] : s.currentVal;
    });

    // Provide 'desktop' key for the lead outcome (matches user prompt template)
    item.desktop = seriesList[0]?.data[idx] !== undefined ? seriesList[0].data[idx] : 96.0;

    return item;
  });

  const handleMouseMove = (state: any) => {
    if (state && state.activeTooltipIndex !== undefined && onHoverValueChange) {
      const idx = state.activeTooltipIndex;
      const values: { [name: string]: number } = {};
      seriesList.forEach((s) => {
        values[s.name] = s.data[idx] !== undefined ? s.data[idx] : s.currentVal;
      });
      onHoverValueChange(idx, values);
    }
  };

  const handleMouseLeave = () => {
    if (onHoverValueChange && seriesList.length > 0) {
      const lastIdx = (labels.length || 1) - 1;
      const values: { [name: string]: number } = {};
      seriesList.forEach((s) => {
        values[s.name] = s.currentVal;
      });
      onHoverValueChange(lastIdx, values);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Filter and Mode Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedOutcomeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedOutcomeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            All Curves
          </button>
          <button
            onClick={() => setSelectedOutcomeFilter('desktop')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedOutcomeFilter === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            Desktop (Lead)
          </button>
          {seriesList.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedOutcomeFilter(s.name)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedOutcomeFilter === s.name
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Indicator badge for stepped curve */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500">
          <span className="w-2 h-2 rounded-xs bg-blue-500 inline-block" />
          <span>visx curveStep (Stepped Quote)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[260px] sm:h-[280px] bg-[#fafbfc] rounded-xl border border-neutral-200 p-3 pt-4 shadow-2xs relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Stepped Area Gradient for Desktop / Lead outcome */}
              <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>

              {/* Dynamic Gradients for series */}
              {seriesList.map((s) => (
                <linearGradient
                  key={`gradient-${s.name}`}
                  id={`gradient-${s.name.replace(/\s+/g, '-')}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            {/* Grid component with horizontal rule */}
            <Grid horizontal vertical={false} />

            {/* X Axis with formatted timestamps */}
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickMargin={8}
              interval="preserveStartEnd"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
            />

            {/* Y Axis for Probability percentage */}
            <YAxis
              domain={[20, 100]}
              orientation="right"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickMargin={6}
              tickFormatter={(val) => `${val}%`}
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'monospace' }}
            />

            {/* Custom Interactive Chart Tooltip */}
            <Tooltip content={<ChartTooltip />} />

            {/* If Desktop view is selected, render single Area with curveStep */}
            {selectedOutcomeFilter === 'desktop' && (
              <Area
                type={curveStep}
                dataKey="desktop"
                name="Desktop (Lead Outcome)"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#colorDesktop)"
                fillOpacity={0.3}
                activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}

            {/* If a specific outcome is selected */}
            {selectedOutcomeFilter !== 'all' && selectedOutcomeFilter !== 'desktop' && (
              (() => {
                const s = seriesList.find((item) => item.name === selectedOutcomeFilter);
                if (!s) return null;
                const gradId = `url(#gradient-${s.name.replace(/\s+/g, '-')})`;
                return (
                  <Area
                    key={s.name}
                    type={curveStep}
                    dataKey={s.name}
                    stroke={s.color}
                    strokeWidth={2.5}
                    fill={gradId}
                    fillOpacity={0.3}
                    activeDot={{ r: 5, fill: s.color, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                );
              })()
            )}

            {/* If 'all' is selected, render all series with curveStep */}
            {selectedOutcomeFilter === 'all' &&
              seriesList.map((s, sIdx) => {
                const gradId = `url(#gradient-${s.name.replace(/\s+/g, '-')})`;
                return (
                  <Area
                    key={s.name}
                    type={curveStep}
                    dataKey={s.name}
                    stroke={s.color}
                    strokeWidth={sIdx === 0 ? 2.5 : 2}
                    fill={gradId}
                    fillOpacity={0.3}
                    activeDot={{ r: 4.5, fill: s.color, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                );
              })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
