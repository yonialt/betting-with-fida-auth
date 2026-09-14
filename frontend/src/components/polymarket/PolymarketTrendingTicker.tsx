import React, { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import { PolymarketMarket, PolymarketTradeState } from '../../types/polymarket';

interface TrendingItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  logoUrl?: string;
  icon?: string;
  accent: string;
  chance: number;
  volume: string;
  endsDate: string;
  description: string;
}

// Auto-rotating trending highlights. The three requested topics lead the loop.
const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'pm-eth-q-military-service',
    title: 'Will Ethiopia enact mandatory national military service before 2029?',
    category: 'Politics',
    categoryLabel: 'Defense · National Service',
    icon: '🎖️',
    accent: '#ef4444',
    chance: 29,
    volume: '16.1M ETB Vol.',
    endsDate: 'Jan 1, 2029',
    description: 'Resolves to Yes if the federal government enacts a law introducing compulsory national military service before January 1, 2029.',
  },
  {
    id: 'pm-eth-redsea',
    title: 'Ethiopia secures official Red Sea port access accord before 2027?',
    category: 'Politics',
    categoryLabel: 'Diplomacy · Maritime',
    icon: '🌊',
    accent: '#06b6d4',
    chance: 74,
    volume: '42.1M ETB Vol.',
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if a ratified sovereign port access or naval leasing treaty is executed by the Ethiopian federal government.',
  },
  {
    id: 'pm-eth-q-constitution-2029',
    title: 'Will Ethiopia officially amend or replace its constitution before 2029?',
    category: 'Politics',
    categoryLabel: 'Constitution & Reform',
    logoUrl: '/offical logos/id  pm-eth-q-constitution-2029 .png',
    accent: '#f59e0b',
    chance: 41,
    volume: '21.9M ETB Vol.',
    endsDate: 'Jan 1, 2029',
    description: 'Resolves to Yes if a constitutional amendment is ratified, or a new constitution is adopted, through the official process before January 1, 2029.',
  },
  {
    id: 'pm-eth-q-addis-legal-status',
    title: 'Will Addis Ababa’s legal administrative status officially change before 2029?',
    category: 'Politics',
    categoryLabel: 'Addis Ababa · Legal Status',
    icon: '🏙️',
    accent: '#6366f1',
    chance: 38,
    volume: '14.7M ETB Vol.',
    endsDate: 'Jan 1, 2029',
    description: 'Resolves to Yes if a federal proclamation, constitutional amendment, or court ruling officially alters the legal administrative status of Addis Ababa before January 1, 2029.',
  },
];

interface PolymarketTrendingTickerProps {
  onOpenDetail?: (market: PolymarketMarket) => void;
  onSelectOutcome?: (trade: PolymarketTradeState) => void;
  /** How long each highlight stays before rotating to the next (ms). */
  intervalMs?: number;
}

function toMarket(t: TrendingItem): PolymarketMarket {
  return {
    id: t.id,
    title: t.title,
    category: t.category,
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    volume: t.volume,
    displayType: 'binary_buttons',
    endDate: t.endsDate,
    rulesText: t.description,
    outcomes: [
      { name: 'Yes', probability: t.chance, yesPrice: t.chance, noPrice: 100 - t.chance },
      { name: 'No', probability: 100 - t.chance, yesPrice: 100 - t.chance, noPrice: t.chance },
    ],
  };
}

export const PolymarketTrendingTicker: React.FC<PolymarketTrendingTickerProps> = ({
  onOpenDetail,
  onSelectOutcome,
  intervalMs = 3500,
}) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loop through the highlights on a timer; pause while the user hovers.
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % TRENDING_ITEMS.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, intervalMs]);

  const item = TRENDING_ITEMS[active];

  const buy = (side: 'yes' | 'no', e: React.MouseEvent) => {
    e.stopPropagation();
    const m = toMarket(item);
    onSelectOutcome?.({
      market: m,
      outcome: m.outcomes[side === 'yes' ? 0 : 1],
      side,
      price: side === 'yes' ? item.chance : 100 - item.chance,
    });
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => onOpenDetail?.(toMarket(item))}
      className="relative w-full rounded-2xl border border-[#1f293b] bg-[#101622] overflow-hidden cursor-pointer group select-none"
    >
      {/* Left accent bar + soft glow, tinted to the active item */}
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: item.accent }} />
      <div
        className="absolute top-0 right-0 w-72 h-full opacity-10 pointer-events-none blur-2xl transition-colors duration-500"
        style={{ background: item.accent }}
      />

      <div className="relative px-4 sm:px-5 py-3 flex items-center gap-3 sm:gap-4">
        {/* TRENDING label */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-[#1f293b]">
          <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 hidden sm:block">
            Trending
          </span>
        </div>

        {/* Rotating headline (re-keyed so it animates on every change) */}
        <div
          key={active}
          className="flex-1 min-w-0 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500"
        >
          {item.logoUrl ? (
            <img
              src={item.logoUrl}
              alt={item.title}
              className="w-9 h-9 rounded-xl object-contain ring-1 ring-white/10 shrink-0"
            />
          ) : item.icon ? (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ring-1 ring-white/10"
              style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accent}22)` }}
              aria-hidden="true"
            >
              {item.icon}
            </span>
          ) : (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ring-1 ring-white/10"
              style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accent}22)` }}
              aria-hidden="true"
            >
              🏛️
            </span>
          )}
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
              <span>🇪🇹</span>
              <span className="truncate">{item.categoryLabel}</span>
              <span className="text-neutral-600 hidden md:inline">· {item.volume}</span>
            </div>
            <div className="text-[13px] sm:text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
              {item.title}
            </div>
          </div>
        </div>

        {/* Chance + quick Yes/No */}
        <div key={`side-${active}`} className="flex items-center gap-3 shrink-0 animate-in fade-in duration-500">
          <div className="text-right hidden sm:block leading-none">
            <div className="font-mono font-extrabold text-base" style={{ color: item.accent }}>
              {item.chance}%
            </div>
            <div className="text-[9px] uppercase tracking-wider text-neutral-500 mt-0.5">chance</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => buy('yes', e)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer active:scale-95"
            >
              Yes
            </button>
            <button
              onClick={(e) => buy('no', e)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors cursor-pointer active:scale-95"
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
        {TRENDING_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setActive(i);
            }}
            className={`h-1 rounded-full transition-all ${
              i === active ? 'w-5 bg-white' : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
            }`}
            aria-label={`Show trending item ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
