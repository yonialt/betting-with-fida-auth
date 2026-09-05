import React, { useState } from 'react';
import {
  Star,
  Pin,
  ChevronDown,
  Search,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  MapPin,
  User,
  Activity,
  BarChart2,
  ListFilter,
  Check,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { Match, OddsItem } from '../types';
import { ActiveStadiumTracker } from './ActiveStadiumTracker';

export const EventDetailedView: React.FC = () => {
  const {
    matches,
    selectedEventMatch,
    setSelectedEventMatch,
    closeDetailedEvent,
    toggleFavorite,
    favorites,
    toggleSelection,
    isOddsSelected,
  } = useBetting();

  const match: Match = selectedEventMatch || matches[0];
  const isFav = favorites.has(match.id);

  const [activeMarketTab, setActiveMarketTab] = useState<'all' | 'total' | 'handicap' | 'popular'>('all');
  const [marketSearch, setMarketSearch] = useState<string>('');
  const [timeMode, setTimeMode] = useState<string>('Regular time');
  const [collapsedMarkets, setCollapsedMarkets] = useState<Record<string, boolean>>({});
  const [activeWidgetTab, setActiveWidgetTab] = useState<'stats' | 'timeline' | 'lineups' | 'standings'>('stats');

  const toggleMarketCollapse = (marketKey: string) => {
    setCollapsedMarkets((prev) => ({
      ...prev,
      [marketKey]: !prev[marketKey],
    }));
  };

  const renderOddsBtn = (
    label: string,
    value: number,
    itemOverride?: Partial<OddsItem>,
    customMarketName = 'Detailed Market'
  ) => {
    const oddsId = itemOverride?.id || `${match.id}-${customMarketName.replace(/\s+/g, '-')}-${label.replace(/\s+/g, '-')}`;
    const selected = isOddsSelected(oddsId);

    const fullItem: OddsItem = {
      id: oddsId,
      label,
      name: itemOverride?.name || `${match.team1} vs ${match.team2} - ${label}`,
      marketName: customMarketName,
      value: value,
      trend: 'same',
    };

    return (
      <button
        key={oddsId}
        id={`odds-btn-${oddsId}`}
        onClick={() => toggleSelection(match, fullItem)}
        title={`${customMarketName}: ${label} (${value})`}
        className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
          selected
            ? 'bg-[#ffc600] border-[#e6b200] text-black shadow-inner font-extrabold scale-[1.01]'
            : 'bg-[#f4f6f8] border-neutral-200 text-neutral-900 hover:bg-[#e8ecf0] hover:border-neutral-300'
        }`}
      >
        <span className="text-[11px] text-neutral-600 font-semibold truncate pr-1">{label}</span>
        <span className="font-mono text-neutral-900 font-bold">{value.toFixed(value % 1 === 0 ? 0 : value < 10 ? (value * 100) % 1 === 0 ? 2 : 3 : 2)}</span>
      </button>
    );
  };

  // List of other matches in the same league for switcher
  const siblingMatches = matches.filter((m) => m.league === match.league);

  return (
    <div id="event-detailed-view" className="flex-1 w-full overflow-y-auto flex flex-col bg-[#eef2f6] text-neutral-900 select-none pb-8">
      {/* 1. Top Breadcrumb & Match Switcher Bar */}
      <div className="bg-[#1b4470] text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#14365b]">
        {/* Left: Star + League name + Match dropdown */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <button
            onClick={closeDetailedEvent}
            className="flex items-center gap-1 text-neutral-200 hover:text-white bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors text-[11px] font-bold"
            title="Back to matches"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Matches</span>
          </button>

          <button
            onClick={() => toggleFavorite(match.id)}
            className="text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Add to favorites"
          >
            <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>

          <div className="flex items-center gap-1 font-semibold text-neutral-200 text-xs">
            <span>{match.league}</span>
            <span className="text-neutral-400">·</span>
            {match.isLive ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                {match.period} {match.timeDisplay}
              </span>
            ) : (
              <span className="text-emerald-300 font-bold">
                📅 {match.dateLabel || match.timeDisplay}
              </span>
            )}
          </div>

          {/* Sibling Matches selector */}
          {siblingMatches.length > 1 && (
            <div className="relative group/sw">
              <select
                value={match.id}
                onChange={(e) => {
                  const target = matches.find((m) => m.id === e.target.value);
                  if (target) setSelectedEventMatch(target);
                }}
                className="bg-[#14365b] text-white text-[11px] font-semibold border border-white/20 rounded px-2 py-0.5 focus:outline-hidden cursor-pointer"
              >
                {siblingMatches.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#1b4470] text-white">
                    {m.team1} vs {m.team2} {m.isLive ? `(${m.score1}:${m.score2})` : `(${m.dateLabel || m.timeDisplay})`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Venue & Referee */}
        <div className="flex items-center gap-3 text-[11px] text-neutral-300">
          {match.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span>{match.venue}</span>
            </div>
          )}
          {match.referee && (
            <div className="flex items-center gap-1 border-l border-white/20 pl-2">
              <User className="w-3 h-3 text-neutral-400" />
              <span>{match.referee}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Match Active Stadium Tracker matching video at 00:02 - 00:16 */}
      <div className="p-3 max-w-7xl w-full mx-auto">
        <ActiveStadiumTracker match={match} />
      </div>

      {/* 3. Filter Bar & Market Tabs matching video at 00:03 */}
      <div className="bg-white border-b border-neutral-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs sticky top-0 z-20 shadow-xs">
        {/* Left: Regular Time dropdown + Market Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value)}
            className="bg-[#f0f4f8] text-neutral-800 font-bold border border-neutral-300 rounded px-2.5 py-1 text-xs focus:outline-hidden cursor-pointer"
          >
            <option value="Regular time">Regular time</option>
            <option value="1st half">1st half</option>
            <option value="2nd half">2nd half</option>
          </select>

          {/* Market Tab Pills */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveMarketTab('all')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeMarketTab === 'all'
                  ? 'bg-[#1b4470] text-white shadow-xs'
                  : 'bg-[#f4f6f8] text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All markets <span className="opacity-75 font-normal">({match.extraMarketsCount || 516})</span>
            </button>

            <button
              onClick={() => setActiveMarketTab('total')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeMarketTab === 'total'
                  ? 'bg-[#1b4470] text-white shadow-xs'
                  : 'bg-[#f4f6f8] text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Total <span className="opacity-75 font-normal">(75)</span>
            </button>

            <button
              onClick={() => setActiveMarketTab('handicap')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeMarketTab === 'handicap'
                  ? 'bg-[#1b4470] text-white shadow-xs'
                  : 'bg-[#f4f6f8] text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Handicap <span className="opacity-75 font-normal">(16)</span>
            </button>

            <button
              onClick={() => setActiveMarketTab('popular')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeMarketTab === 'popular'
                  ? 'bg-[#1b4470] text-white shadow-xs'
                  : 'bg-[#f4f6f8] text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Popular <span className="opacity-75 font-normal">(104)</span>
            </button>
          </div>
        </div>

        {/* Right: List of markets dropdown & Search input */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
              placeholder="Search markets..."
              className="bg-[#f8fafc] border border-neutral-300 rounded pl-7 pr-2 py-0.5 text-xs text-neutral-800 focus:outline-hidden focus:border-[#1b4470] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* 4. Full 2-Column Detailed Odds Market Grid matching video at 00:03 - 00:10 & 00:28 - 00:34 */}
      <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-7xl w-full mx-auto">
        {/* Market 1: 1X2 */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('1x2')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>1X2</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['1x2'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['1x2'] && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {renderOddsBtn('W1', match.odds.w1.value, { id: `${match.id}-1x2-w1`, name: `${match.team1} (1)` }, '1X2')}
              {match.odds.x && renderOddsBtn('X', match.odds.x.value, { id: `${match.id}-1x2-x`, name: 'Draw (X)' }, '1X2')}
              {renderOddsBtn('W2', match.odds.w2.value, { id: `${match.id}-1x2-w2`, name: `${match.team2} (2)` }, '1X2')}
            </div>
          )}
        </div>

        {/* Market 2: Double Chance */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('double_chance')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Double Chance</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['double_chance'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['double_chance'] && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {renderOddsBtn('1X', match.odds.x1?.value || 1.16, { id: `${match.id}-dc-1x` }, 'Double Chance')}
              {renderOddsBtn('12', match.odds.w12?.value || 1.464, { id: `${match.id}-dc-12` }, 'Double Chance')}
              {renderOddsBtn('2X', match.odds.x2?.value || 1.7, { id: `${match.id}-dc-2x` }, 'Double Chance')}
            </div>
          )}
        </div>

        {/* Market 3: Both Teams To Score */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('btts')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Both Teams To Score</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['btts'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['btts'] && (
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {renderOddsBtn('Yes', 2.88, { id: `${match.id}-btts-yes` }, 'Both Teams To Score')}
              {renderOddsBtn('No', 1.408, { id: `${match.id}-btts-no` }, 'Both Teams To Score')}
            </div>
          )}
        </div>

        {/* Market 4: 1X2 + Each Team To Score */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('1x2_btts')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>1X2 + Each Team To Score</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['1x2_btts'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['1x2_btts'] && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {renderOddsBtn('W1 & Yes', 9.76, {}, '1X2 + BTTS')}
              {renderOddsBtn('X & Yes', 8.86, {}, '1X2 + BTTS')}
              {renderOddsBtn('W2 & Yes', 19.6, {}, '1X2 + BTTS')}
              {renderOddsBtn('W1 & No', 1.032, {}, '1X2 + BTTS')}
              {renderOddsBtn('X & No', 1.085, {}, '1X2 + BTTS')}
              {renderOddsBtn('W2 & No', 1.95, {}, '1X2 + BTTS')}
            </div>
          )}
        </div>

        {/* Market 5: Asian Total */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('asian_total')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Asian Total</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['asian_total'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['asian_total'] && (
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {renderOddsBtn('Over 0.75', 1.27, {}, 'Asian Total')}
              {renderOddsBtn('Under 0.75', 3.75, {}, 'Asian Total')}
              {renderOddsBtn('Over 1.25', 1.656, {}, 'Asian Total')}
              {renderOddsBtn('Under 1.25', 2.285, {}, 'Asian Total')}
              {renderOddsBtn('Over 1.75', 2.304, {}, 'Asian Total')}
              {renderOddsBtn('Under 1.75', 1.6, {}, 'Asian Total')}
              {renderOddsBtn('Over 2.25', 3.4, {}, 'Asian Total')}
              {renderOddsBtn('Under 2.25', 1.32, {}, 'Asian Total')}
              {renderOddsBtn('Over 2.75', 5.15, {}, 'Asian Total')}
              {renderOddsBtn('Under 2.75', 1.165, {}, 'Asian Total')}
            </div>
          )}
        </div>

        {/* Market 6: Total (Over/Under) */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('total_ou')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Total</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['total_ou'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['total_ou'] && (
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {renderOddsBtn('Over 0.5', 1.216, {}, 'Total')}
              {renderOddsBtn('Under 0.5', 4.33, {}, 'Total')}
              {renderOddsBtn('Over 1', 1.36, {}, 'Total')}
              {renderOddsBtn('Under 1', 3.1, {}, 'Total')}
              {renderOddsBtn('Over 1.5', 2.056, {}, 'Total')}
              {renderOddsBtn('Under 1.5', 1.8, {}, 'Total')}
              {renderOddsBtn('Over 2', 3.02, {}, 'Total')}
              {renderOddsBtn('Under 2', 1.375, {}, 'Total')}
              {renderOddsBtn('Over 2.5', 3.87, {}, 'Total')}
              {renderOddsBtn('Under 2.5', 1.26, {}, 'Total')}
              {renderOddsBtn('Over 3', 8.03, {}, 'Total')}
              {renderOddsBtn('Under 3', 1.07, {}, 'Total')}
              {renderOddsBtn('Over 3.5', 13.7, {}, 'Total')}
              {renderOddsBtn('Under 3.5', 1.016, {}, 'Total')}
            </div>
          )}
        </div>

        {/* Market 7: Correct Score */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('correct_score')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Correct Score</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['correct_score'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['correct_score'] && (
            <div className="p-2 grid grid-cols-4 gap-1.5">
              {renderOddsBtn('1-0', 4.0, {}, 'Correct Score')}
              {renderOddsBtn('0-0', 4.25, {}, 'Correct Score')}
              {renderOddsBtn('0-1', 7.1, {}, 'Correct Score')}
              {renderOddsBtn('1-1', 6.0, {}, 'Correct Score')}
              {renderOddsBtn('2-0', 7.5, {}, 'Correct Score')}
              {renderOddsBtn('2-1', 12.0, {}, 'Correct Score')}
              {renderOddsBtn('2-2', 19.0, {}, 'Correct Score')}
              {renderOddsBtn('0-2', 21.0, {}, 'Correct Score')}
              {renderOddsBtn('3-0', 19.0, {}, 'Correct Score')}
              {renderOddsBtn('3-1', 29.0, {}, 'Correct Score')}
              {renderOddsBtn('3-2', 51.0, {}, 'Correct Score')}
              {renderOddsBtn('1-2', 21.0, {}, 'Correct Score')}
              {renderOddsBtn('4-0', 41.0, {}, 'Correct Score')}
              {renderOddsBtn('4-1', 67.0, {}, 'Correct Score')}
              {renderOddsBtn('0-3', 51.0, {}, 'Correct Score')}
              {renderOddsBtn('Any Other', 39.0, {}, 'Correct Score')}
            </div>
          )}
        </div>

        {/* Market 8: Asian Handicap */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('handicap')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Asian Handicap</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['handicap'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['handicap'] && (
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {renderOddsBtn('1 (-0.75)', 2.52, {}, 'Asian Handicap')}
              {renderOddsBtn('2 (+0.75)', 1.51, {}, 'Asian Handicap')}
              {renderOddsBtn('1 (-0.25)', 1.736, {}, 'Asian Handicap')}
              {renderOddsBtn('2 (+0.25)', 2.144, {}, 'Asian Handicap')}
              {renderOddsBtn('1 (0)', 1.256, {}, 'Asian Handicap')}
              {renderOddsBtn('2 (0)', 3.82, {}, 'Asian Handicap')}
              {renderOddsBtn('1 (-1.0)', 3.78, {}, 'Asian Handicap')}
              {renderOddsBtn('2 (+1.0)', 1.28, {}, 'Asian Handicap')}
            </div>
          )}
        </div>

        {/* Market 9: HT-FT (Half Time / Full Time) */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('ht_ft')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>HT-FT</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['ht_ft'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['ht_ft'] && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {renderOddsBtn('W1 / W1', 3.5, {}, 'HT-FT')}
              {renderOddsBtn('X / W1', 3.75, {}, 'HT-FT')}
              {renderOddsBtn('W2 / W1', 34.0, {}, 'HT-FT')}
              {renderOddsBtn('W1 / X', 19.0, {}, 'HT-FT')}
              {renderOddsBtn('X / X', 3.25, {}, 'HT-FT')}
              {renderOddsBtn('W2 / X', 21.0, {}, 'HT-FT')}
              {renderOddsBtn('W1 / W2', 51.0, {}, 'HT-FT')}
              {renderOddsBtn('X / W2', 9.0, {}, 'HT-FT')}
              {renderOddsBtn('W2 / W2', 13.0, {}, 'HT-FT')}
            </div>
          )}
        </div>

        {/* Market 10: Goal Will Be Scored Up To A Minute */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('goal_minute')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Goal Will Be Scored Up To A Minute</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['goal_minute'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['goal_minute'] && (
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {renderOddsBtn('Goal Up To 30 Min - Yes', 9.06, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 30 Min - No', 1.056, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 40 Min - Yes', 3.78, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 40 Min - No', 1.26, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 50 Min - Yes', 2.52, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 50 Min - No', 1.51, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 60 Min - Yes', 1.89, {}, 'Goal Minute')}
              {renderOddsBtn('Goal Up To 60 Min - No', 1.89, {}, 'Goal Minute')}
            </div>
          )}
        </div>

        {/* Market 11: Team 1 Scores in Halves */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('team_halves')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Team 1 Scores In Halves</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['team_halves'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['team_halves'] && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {renderOddsBtn('1st + 2nd Half', 5.3, {}, 'Team 1 Halves')}
              {renderOddsBtn('1st Half', 1.89, {}, 'Team 1 Halves')}
              {renderOddsBtn('2nd Half', 2.25, {}, 'Team 1 Halves')}
            </div>
          )}
        </div>

        {/* Market 12: Total 1 & Total 2 (Individual Team Totals) */}
        <div className="bg-white rounded border border-neutral-300 shadow-2xs overflow-hidden">
          <div
            onClick={() => toggleMarketCollapse('team_totals')}
            className="bg-[#f3f7fb] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 cursor-pointer font-bold text-xs text-neutral-900"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3 h-3 text-neutral-400 hover:text-[#1b4470]" />
              <span>Individual Team Totals</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsedMarkets['team_totals'] ? 'rotate-180' : ''}`} />
          </div>

          {!collapsedMarkets['team_totals'] && (
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {renderOddsBtn('Team 1 Over 0.5', 1.42, {}, 'Team 1 Total')}
              {renderOddsBtn('Team 1 Under 0.5', 2.79, {}, 'Team 1 Total')}
              {renderOddsBtn('Team 2 Over 0.5', 2.395, {}, 'Team 2 Total')}
              {renderOddsBtn('Team 2 Under 0.5', 1.545, {}, 'Team 2 Total')}
              {renderOddsBtn('Team 1 Over 1.5', 3.235, {}, 'Team 1 Total')}
              {renderOddsBtn('Team 1 Under 1.5', 1.325, {}, 'Team 1 Total')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
