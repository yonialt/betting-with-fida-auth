import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  Edit3,
} from 'lucide-react';

// ---------- storage shape ----------
export interface AdminOutcomeRow {
  id: string;
  name: string;
  probability: number;
  yesPrice: number;
  noPrice: number;
}

export interface AdminMarketRecord {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  volume: string;
  chance: number;
  yesPrice: number;
  noPrice: number;
  description: string;
  endsDate: string;
  imageUrl: string;
  logoUrl: string;
  outcomes: AdminOutcomeRow[];
  isHot: boolean;
  featured: boolean;
  icon?: string;
  accent?: string;
}

export type AdminCategory =
  | 'hero'
  | 'trending'
  | 'ethiopia'
  | 'breaking'
  | 'finance'
  | 'weather-cities'
  | 'weather-events'
  | 'art'
  | 'perps';

interface AdminCategoryMeta {
  id: AdminCategory;
  label: string;
}

const ADMIN_CATEGORIES: AdminCategoryMeta[] = [
  { id: 'hero', label: 'Hero Carousel' },
  { id: 'trending', label: 'Trending / Hot Topics' },
  { id: 'ethiopia', label: 'Ethiopia Markets' },
  { id: 'breaking', label: 'Breaking News' },
  { id: 'finance', label: 'Finance' },
  { id: 'weather-cities', label: 'Weather Cities' },
  { id: 'weather-events', label: 'Weather Events' },
  { id: 'art', label: 'Art / Culture' },
  { id: 'perps', label: 'Perps Tokens' },
];

const API_BASE = '/api/polymarket-admin';

// ---------- helpers ----------
const emptyOutcomeRow = (): AdminOutcomeRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  probability: 50,
  yesPrice: 50,
  noPrice: 50,
});

const emptyRecord = (category: string): AdminMarketRecord => ({
  id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  category,
  subcategory: '',
  volume: '',
  chance: 50,
  yesPrice: 50,
  noPrice: 50,
  description: '',
  endsDate: '',
  imageUrl: '',
  logoUrl: '',
  outcomes: [],
  isHot: false,
  featured: false,
});

// ---------- seed from window globals (populated by App.tsx) ----------
const loadSeedFromGlobals = (): Record<AdminCategory, AdminMarketRecord[]> => {
  const empty: AdminMarketRecord[] = [];

  const hero = (typeof window !== 'undefined' && window['__polymarket_seed_hero__']) ||
    empty;
  const trending = (typeof window !== 'undefined' && window['__polymarket_seed_trending__']) ||
    empty;
  const ethiopia = (typeof window !== 'undefined' && window['__polymarket_seed_ethiopia__']) ||
    empty;
  const breaking = (typeof window !== 'undefined' && window['__polymarket_seed_breaking__']) ||
    empty;
  const weatherCities = (typeof window !== 'undefined' && window['__polymarket_weather_cities_seed__']) || empty;
  const weatherEvents = (typeof window !== 'undefined' && window['__polymarket_weather_events_seed__']) || empty;
  const art = (typeof window !== 'undefined' && window['__polymarket_art_seed__']) || empty;
  const perps = (typeof window !== 'undefined' && window['__polymarket_perps_seed__']) || empty;

  return {
    hero,
    trending,
    ethiopia,
    breaking,
    finance: empty,
    'weather-cities': weatherCities,
    'weather-events': weatherEvents,
    art,
    perps,
  };
};

// ---------- component ----------
export const PolymarketAdmin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<AdminCategory>('hero');
  const [records, setRecords] = useState<AdminMarketRecord[]>([]);
  const [topLevel, setTopLevel] = useState<Record<AdminCategory, AdminMarketRecord[]>>(
    loadSeedFromGlobals()
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [search, setSearch] = useState('');

  const filteredList = useMemo(
    () =>
      search.trim()
        ? records.filter((r) =>
            r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.title.toLowerCase().includes(search.toLowerCase())
          )
        : records,
    [records, search]
  );

  // initial records from topLevel
  useEffect(() => {
    setRecords(topLevel[activeCategory] || []);
  }, []);

  // load persisted data from backend on mount
  const loadFromBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) return null;
      const json = await res.json();
      if (!json || typeof json !== 'object') return null;
      const filled: Partial<Record<AdminCategory, AdminMarketRecord[]>> = {};
      for (const cat of ADMIN_CATEGORIES.map((c) => c.id)) {
        const arr = Array.isArray((json as any)[cat]) ? (json as any)[cat] : [];
        filled[cat as AdminCategory] = arr as AdminMarketRecord[];
      }
      return filled as Record<AdminCategory, AdminMarketRecord[]>;
    } catch {
      return null;
    }
  }, []);

  // persist topLevel to backend on change
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topLevel),
        });
        if (!res.ok) {
          console.warn('Polymarket admin save failed', res.status);
        }
      } catch (err) {
        console.warn('Polymarket admin save failed', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [topLevel]);

  // initial load
  useEffect(() => {
    (async () => {
      const stored = await loadFromBackend();
      if (stored) {
        setTopLevel(stored);
        setRecords(stored[activeCategory] || []);
      } else {
        // fallback: seed from globals
        const seed = loadSeedFromGlobals();
        setTopLevel(seed);
        setRecords(seed[activeCategory] || []);
      }
    })();
  }, []);

  const resetToSeed = useCallback(() => {
    (async () => {
      // clear backend storage
      try {
        await fetch(`${API_BASE}/data`, { method: 'DELETE' });
      } catch {}
      const seed = loadSeedFromGlobals();
      setTopLevel(seed);
      setRecords(seed[activeCategory] || []);
      setSelectedId(null);
    })();
  }, [activeCategory]);

  const updateRecord = useCallback(
    (id: string, patch: Partial<AdminMarketRecord>) => {
      setTopLevel((prev) => {
        const next = { ...prev };
        const catRecords = next[activeCategory] || [];
        next[activeCategory] = catRecords.map((r) =>
          r.id === id ? { ...r, ...patch } : r
        );
        return next;
      });
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );
    },
    [activeCategory]
  );

  const addRecord = useCallback(() => {
    const newRecord = emptyRecord(activeCategory);
    setTopLevel((prev) => ({
      ...prev,
      [activeCategory]: [...(prev[activeCategory] || []), newRecord],
    }));
    setRecords((prev) => [...prev, newRecord]);
    setSelectedId(newRecord.id);
  }, [activeCategory]);

  const removeRecord = useCallback(
    (id: string) => {
      setTopLevel((prev) => ({
        ...prev,
        [activeCategory]: (prev[activeCategory] || []).filter((r) => r.id !== id),
      }));
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [activeCategory, selectedId]
  );

  const selectedRecord = records.find((r) => r.id === selectedId) || null;

  const renderOutcomeEditor = (record: AdminMarketRecord) => {
    const outcomes = record.outcomes || [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          <span>Outcomes</span>
          <button
            type="button"
            onClick={() => {
              const next = [...outcomes, emptyOutcomeRow()];
              updateRecord(record.id, { outcomes: next });
            }}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Outcome
          </button>
        </div>
        {outcomes.map((o, idx) => (
          <div
            key={o.id}
            className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-[#101722] border border-[#1c2738] items-center"
          >
            <input
              type="text"
              value={o.name}
              onChange={(e) => {
                const next = [...outcomes];
                next[idx] = { ...o, name: e.target.value };
                updateRecord(record.id, { outcomes: next });
              }}
              placeholder="Outcome name"
              className="col-span-1 bg-[#0b111c] border border-[#1c2738] rounded px-2 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              value={o.probability}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                const next = [...outcomes];
                next[idx] = { ...o, probability: val };
                updateRecord(record.id, { outcomes: next });
              }}
              className="col-span-1 bg-[#0b111c] border border-[#1c2738] rounded px-2 py-1.5 text-xs text-white text-right w-16 focus:outline-none focus:border-blue-500"
              placeholder="%"
            />
            <input
              type="number"
              value={o.yesPrice}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value) || 0);
                const next = [...outcomes];
                next[idx] = { ...o, yesPrice: val };
                updateRecord(record.id, { outcomes: next });
              }}
              className="col-span-1 bg-[#0b111c] border border-[#1c2738] rounded px-2 py-1.5 text-xs text-white text-right w-16 focus:outline-none focus:border-blue-500"
              placeholder="Yes$"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const next = outcomes.filter((_, i) => i !== idx);
                  updateRecord(record.id, { outcomes: next });
                }}
                className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                title="Remove outcome"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEditorFields = (record: AdminMarketRecord) => (
    <div className="space-y-4">
      {/* Identity */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider col-span-2">
          Logo & Identity
        </label>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Market ID</span>
          <input
            type="text"
            value={record.id}
            readOnly
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Logo URL</span>
          <input
            type="text"
            value={record.logoUrl}
            onChange={(e) => updateRecord(record.id, { logoUrl: e.target.value })}
            placeholder="/offical logos/..."
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Image URL</span>
          <input
            type="text"
            value={record.imageUrl}
            onChange={(e) => updateRecord(record.id, { imageUrl: e.target.value })}
            placeholder="/offical logos/..."
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Emblem icon (emoji)</span>
          <input
            type="text"
            value={record.icon || ''}
            onChange={(e) => updateRecord(record.id, { icon: e.target.value })}
            placeholder="🇪🇹"
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Accent color (hex)</span>
          <input
            type="text"
            value={record.accent || ''}
            onChange={(e) => updateRecord(record.id, { accent: e.target.value })}
            placeholder="#10b981"
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Logo preview</span>
          <div className="w-12 h-12 rounded-lg bg-[#0b111c] border border-[#1c2738] flex items-center justify-center text-lg shrink-0 overflow-hidden">
            {record.logoUrl || record.imageUrl ? (
              <img
                src={record.logoUrl || record.imageUrl}
                alt="logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  t.style.display = 'none';
                  const parent = t.parentElement;
                  if (parent) {
                    parent.innerHTML = '';
                    parent.innerHTML = '<span className="text-neutral-500 text-sm">broken</span>';
                  }
                }}
              />
            ) : (
              <span className="text-neutral-500 text-sm">no logo</span>
            )}
          </div>
        </div>
      </div>

      {/* Title & classification */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Title</span>
          <input
            type="text"
            value={record.title}
            onChange={(e) => updateRecord(record.id, { title: e.target.value })}
            placeholder="Market title"
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Category</span>
          <input
            type="text"
            value={record.category}
            onChange={(e) => updateRecord(record.id, { category: e.target.value })}
            placeholder="Politics"
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Subcategory</span>
          <input
            type="text"
            value={record.subcategory}
            onChange={(e) => updateRecord(record.id, { subcategory: e.target.value })}
            placeholder="Ethiopia"
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Ends Date</span>
          <input
            type="text"
            value={record.endsDate}
            onChange={(e) => updateRecord(record.id, { endsDate: e.target.value })}
            placeholder="Dec 31, 2026"
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Price / chance block */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Yes Price %</span>
          <input
            type="number"
            value={record.yesPrice}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              updateRecord(record.id, { yesPrice: v });
            }}
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">No Price %</span>
          <input
            type="number"
            value={record.noPrice}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              updateRecord(record.id, { noPrice: v });
            }}
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Chance (for badge)</span>
          <input
            type="number"
            value={record.chance}
            onChange={(e) => {
              const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
              updateRecord(record.id, { chance: v });
            }}
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* volume / description */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Volume</span>
          <input
            type="text"
            value={record.volume}
            onChange={(e) => updateRecord(record.id, { volume: e.target.value })}
            placeholder="21.9M ETB Vol."
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-neutral-500">Description</span>
          <textarea
            value={record.description}
            onChange={(e) => updateRecord(record.id, { description: e.target.value })}
            placeholder="Resolves to..."
            rows={3}
            className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* toggles */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={record.isHot}
            onChange={(e) => updateRecord(record.id, { isHot: e.target.checked })}
            className="rounded border-[#1c2738] bg-[#0b111c] text-emerald-500 focus:ring-emerald-500/30"
          />
          Hot
        </label>
        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={record.featured}
            onChange={(e) => updateRecord(record.id, { featured: e.target.checked })}
            className="rounded border-[#1c2738] bg-[#0b111c] text-blue-500 focus:ring-blue-500/30"
          />
          Featured
        </label>
      </div>

      {/* outcomes */}
      {record.outcomes && record.outcomes.length > 0 && (
        renderOutcomeEditor(record)
      )}
    </div>
  );

  const renderItemCard = (record: AdminMarketRecord) => (
    <div
      type="button"
      onClick={() => setSelectedId(record.id)}
      className={`group relative cursor-pointer rounded-xl border ${
        selectedId === record.id
          ? 'border-blue-500 bg-[#14202e] shadow-md shadow-blue-500/10'
          : 'border-[#1c2738] bg-[#0f1722] hover:border-[#2a3a52]'
      } p-3 transition-all`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mb-1">
            <span className="uppercase">{record.category}</span>
            {record.isHot && <span className="text-amber-400">HOT</span>}
            {record.featured && <span className="text-blue-400">FEATURED</span>}
          </div>
          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
            {record.title || 'Untitled'}
          </h4>
          <div className="mt-1.5 text-[11px] text-neutral-400">
            {record.volume || 'No volume'}
          </div>
          {record.outcomes && record.outcomes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {record.outcomes.map((o) => (
                <span
                  key={o.id}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: o.probability > 50 ? '#10b98122' : '#ef444422',
                    color: o.probability > 50 ? '#10b981' : '#ef4444',
                  }}
                >
                  {o.name} {o.probability}%
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeRecord(record.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  const recordsList = topLevel[activeCategory] || [];

  return (
    <div
      id="polymarket-admin-page-root"
      className="min-h-screen bg-[#0a1118] text-neutral-100 flex flex-col font-sans"
    >
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0f1923] border-b border-neutral-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              id="admin-polymarket-btn-back-to-site"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-neutral-700 shadow-xs"
              title="Return to Fida Bet Sportsbook"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Betting Site</span>
            </button>

            <div className="h-4 w-px bg-neutral-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white tracking-wider uppercase font-mono">
                    FIDABET POLYMARKET
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-500/30">
                    /admin/polymarket
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
                  Edit logos, text, prices, outcomes, add markets
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowJson(!showJson)}
              className="px-3 py-1.5 bg-[#102030] hover:bg-[#182838] text-neutral-200 text-xs font-bold rounded uppercase tracking-wider transition-all cursor-pointer border border-neutral-700 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={resetToSeed}
              className="px-3 py-1.5 bg-[#102030] hover:bg-[#182838] text-neutral-200 text-xs font-bold rounded uppercase tracking-wider transition-all cursor-pointer border border-neutral-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Seed
            </button>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="px-3 py-1.5 bg-[#ffc600] hover:bg-[#f0ba00] text-black text-xs font-black rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Go to App</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-wrap">
          {ADMIN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#121722] hover:bg-[#1b2333] text-neutral-300 border border-[#20293a]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Item List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                {filteredList.length} / {recordsList.length} {activeCategory === 'hero' ? 'slides' : 'markets'}
              </span>
              <button
                type="button"
                onClick={addRecord}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or ID (e.g. pm-eth-q-constitution-2029)"
                className="w-full bg-[#0b111c] border border-[#1c2738] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
            <div className="space-y-2">
              {filteredList.map(renderItemCard)}
              {recordsList.length === 0 && (
                <div className="text-center py-8 rounded-xl bg-[#101722] border border-[#1c2738] text-neutral-400 text-xs">
                  No {activeCategory === 'hero' ? 'hero slides' : 'markets'} yet.
                  <br />
                  <button
                    type="button"
                    onClick={addRecord}
                    className="mt-2 text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                  >
                    Add the first one
                  </button>
                </div>
              )}
              {recordsList.length > 0 && filteredList.length === 0 && (
                <div className="text-center py-8 rounded-xl bg-[#101722] border border-[#1c2738] text-neutral-400 text-xs">
                  No results for "{search}".
                </div>
              )}
            </div>
          </div>

          {/* Right: Editor Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              {selectedRecord ? (
                <div className="rounded-2xl bg-[#0f1722] border border-[#1c2738] p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-blue-400" />
                      Edit Market
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  {renderEditorFields(selectedRecord)}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#0f1722] border border-[#1c2738] p-8 shadow-xl text-center">
                  <Edit3 className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">
                    Select a market from the list to edit its logo, text, prices, and outcomes.
                  </p>
                  <button
                    type="button"
                    onClick={addRecord}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                    Add New Market
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* JSON dump (collapsible) */}
        {showJson && (
          <div className="rounded-2xl bg-[#0a1118] border border-[#1c2738] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1c2738]">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Admin Data Snapshot (backend)
              </span>
              <button
                type="button"
                onClick={() => {
                  const json = JSON.stringify(topLevel, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'polymarket_admin_data.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
              >
                Download
              </button>
            </div>
            <pre className="overflow-auto max-h-96 p-4 text-xs text-neutral-300 font-mono leading-relaxed bg-[#060b12]">
              {JSON.stringify(topLevel, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-neutral-800 bg-[#0f1923] py-4 px-6 text-center text-xs text-neutral-500">
        <p>
          Polymarket Admin · Edit logos, text, prices, outcomes, add markets to any category · Data persisted on the backend (Redis)
        </p>
      </footer>
    </div>
  );
};

export default PolymarketAdmin;
