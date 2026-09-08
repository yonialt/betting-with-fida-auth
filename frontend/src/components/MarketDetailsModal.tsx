import React, { useState } from 'react';
import { X, Star, Video, Activity, Info, Trophy } from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { Match, OddsItem } from '../types';

export const MarketDetailsModal: React.FC = () => {
  const {
    selectedMatchForModal,
    setSelectedMatchForModal,
    setSelectedMatchForTracker,
    toggleSelection,
    isOddsSelected,
    favorites,
    toggleFavorite,
  } = useBetting();

  const [activeMarketTab, setActiveMarketTab] = useState<'all' | 'main' | 'totals' | 'handicap' | 'goals' | 'corners'>('all');

  if (!selectedMatchForModal) return null;
  const match = selectedMatchForModal;
  const isFavNum = favorites.has(match.id);

  // Generate extended markets dynamically for this match
  const main1X2: OddsItem[] = [
    match.odds.w1,
    match.odds.x || { id: `${match.id}-x-gen`, label: 'X', name: 'Draw', marketName: '1X2', value: 3.25 },
    match.odds.w2,
  ];

  const doubleChance: OddsItem[] = [
    match.odds.x1 || { id: `${match.id}-1x-gen`, label: '1X', name: `${match.team1} or Draw`, marketName: 'Double Chance', value: 1.15 },
    match.odds.w12 || { id: `${match.id}-12-gen`, label: '12', name: `${match.team1} or ${match.team2}`, marketName: 'Double Chance', value: 1.28 },
    match.odds.x2 || { id: `${match.id}-2x-gen`, label: '2X', name: `Draw or ${match.team2}`, marketName: 'Double Chance', value: 2.10 },
  ];

  const bothTeamsToScore: OddsItem[] = [
    { id: `${match.id}-btts-yes`, label: 'Yes', name: 'Both Teams To Score - Yes', marketName: 'Both Teams To Score', value: 1.85 },
    { id: `${match.id}-btts-no`, label: 'No', name: 'Both Teams To Score - No', marketName: 'Both Teams To Score', value: 1.95 },
  ];

  const totalGoals: { line: string; over: OddsItem; under: OddsItem }[] = [
    {
      line: '1.5',
      over: { id: `${match.id}-over-1.5`, label: 'Over 1.5', name: 'Total Over 1.5 Goals', marketName: 'Total Goals', value: 1.32 },
      under: { id: `${match.id}-under-1.5`, label: 'Under 1.5', name: 'Total Under 1.5 Goals', marketName: 'Total Goals', value: 3.40 },
    },
    {
      line: '2.5',
      over: { id: `${match.id}-over-2.5`, label: 'Over 2.5', name: 'Total Over 2.5 Goals', marketName: 'Total Goals', value: 1.95 },
      under: { id: `${match.id}-under-2.5`, label: 'Under 2.5', name: 'Total Under 2.5 Goals', marketName: 'Total Goals', value: 1.88 },
    },
    {
      line: '3.5',
      over: { id: `${match.id}-over-3.5`, label: 'Over 3.5', name: 'Total Over 3.5 Goals', marketName: 'Total Goals', value: 3.10 },
      under: { id: `${match.id}-under-3.5`, label: 'Under 3.5', name: 'Total Under 3.5 Goals', marketName: 'Total Goals', value: 1.36 },
    },
  ];

  const nextGoal: OddsItem[] = [
    { id: `${match.id}-next-t1`, label: 'Goal 1', name: `${match.team1} Next Goal`, marketName: 'Next Goal', value: 2.10 },
    { id: `${match.id}-next-none`, label: 'No Goal', name: 'No Next Goal', marketName: 'Next Goal', value: 2.45 },
    { id: `${match.id}-next-t2`, label: 'Goal 2', name: `${match.team2} Next Goal`, marketName: 'Next Goal', value: 3.80 },
  ];

  const asianHandicaps: { team1Handicap: OddsItem; team2Handicap: OddsItem }[] = [
    {
      team1Handicap: { id: `${match.id}-ah-1-m0.5`, label: `( -0.5 )`, name: `${match.team1} (-0.5)`, marketName: 'Asian Handicap', value: 1.92 },
      team2Handicap: { id: `${match.id}-ah-2-p0.5`, label: `( +0.5 )`, name: `${match.team2} (+0.5)`, marketName: 'Asian Handicap', value: 1.90 },
    },
    {
      team1Handicap: { id: `${match.id}-ah-1-m1.5`, label: `( -1.5 )`, name: `${match.team1} (-1.5)`, marketName: 'Asian Handicap', value: 2.85 },
      team2Handicap: { id: `${match.id}-ah-2-p1.5`, label: `( +1.5 )`, name: `${match.team2} (+1.5)`, marketName: 'Asian Handicap', value: 1.42 },
    },
  ];

  const renderOddsPill = (item: OddsItem) => {
    const selected進 = isOddsSelected(item.id);
    return (
      <button
        key={item.id}
        id={`market-modal-odds-${item.id}`}
        onClick={() => toggleSelection(match, item)}
        className={`flex items-center justify-between px-3 py-2 rounded text-xs font-semibold border transition-all cursor-pointer ${
          selected進
            ? 'bg-[#ffc600] border-[#e6b200] text-black font-bold shadow-xs'
            : 'bg-[#f8fafc] border-neutral-200 text-neutral-800 hover:bg-[#eaeef2] hover:border-neutral-300'
        }`}
      >
        <span className="truncate pr-2">{item.label}</span>
        <span className="font-mono font-bold">{item.value}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        id="market-details-modal"
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with Match Info */}
        <div className="bg-[#1e2329] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(match.id)}
              className="text-neutral-400 hover:text-amber-400 cursor-pointer"
            >
              <Star className={`w-4 h-4 ${isFavNum ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <span className="font-semibold">{match.league}</span>
                <span>·</span>
                <span className="text-amber-400 font-mono font-bold">{match.timeDisplay}</span>
                <span>·</span>
                <span className="text-neutral-400">{match.period}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>{match.team1}</span>
                <span className="px-2 py-0.5 bg-neutral-800 rounded font-mono text-amber-400 font-extrabold">
                  {match.score1} : {match.score2}
                </span>
                <span>{match.team2}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedMatchForModal(null);
                setSelectedMatchForTracker(match);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0091ff] hover:bg-[#007cdb] text-white text-xs font-bold rounded cursor-pointer transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Pitch & Stats</span>
            </button>

            <button
              onClick={() => setSelectedMatchForModal(null)}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-market tabs */}
        <div className="bg-[#f1f3f6] px-4 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-neutral-200 text-xs">
          {[
            { id: 'all', label: 'All Markets' },
            { id: 'main', label: 'Main' },
            { id: 'totals', label: 'Totals' },
            { id: 'handicap', label: 'Handicap' },
            { id: 'goals', label: 'Goals' },
            { id: 'corners', label: 'Corners & Cards' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMarketTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-all ${
                activeMarketTab === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Markets Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
          {/* 1X2 Market */}
          {(activeMarketTab === 'all' || activeMarketTab === 'main') && (
            <div className="bg-white rounded border border-neutral-200 p-3 shadow-2xs">
              <div className="text-xs font-bold text-neutral-800 mb-2 flex items-center justify-between">
                <span>1X2 (Match Outcome)</span>
                <span className="text-neutral-400 text-[11px] font-normal">Full Time</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {main1X2.map((item) => renderOddsPill(item))}
              </div>
            </div>
          )}

          {/* Double Chance */}
          {(activeMarketTab === 'all' || activeMarketTab === 'main') && (
            <div className="bg-white rounded border border-neutral-200 p-3 shadow-2xs">
              <div className="text-xs font-bold text-neutral-800 mb-2">Double Chance</div>
              <div className="grid grid-cols-3 gap-2">
                {doubleChance.map((item) => renderOddsPill(item))}
              </div>
            </div>
          )}

          {/* Both Teams To Score */}
          {(activeMarketTab === 'all' || activeMarketTab === 'goals') && (
            <div className="bg-white rounded border border-neutral-200 p-3 shadow-2xs">
              <div className="text-xs font-bold text-neutral-800 mb-2">Both Teams To Score</div>
              <div className="grid grid-cols-2 gap-2">
                {bothTeamsToScore.map((item) => renderOddsPill(item))}
              </div>
            </div>
          )}

          {/* Total Goals (Over / Under) */}
          {(activeMarketTab === 'all' || activeMarketTab === 'totals') && (
            <div className="bg-white rounded border border-neutral-200 p-3 shadow-2xs">
              <div className="text-xs font-bold text-neutral-800 mb-2">Total Goals (Over / Under)</div>
              <div className="space-y-2">
                {totalGoals.map((g) => (
                  <div key={g.line} className="grid grid-cols-2 gap-2">
                    {renderOddsPill(g.over)}
                    {renderOddsPill(g.under)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Goal */}
          {(activeMarketTab === 'all' || activeMarketTab === 'goals') && (
            <div className="bg-white rounded border border-neutral-200 p-3 shadow-2xs">
              <div className="text-xs font-bold text-neutral-800 mb-2">Next Goal In Match</div>
              <div className="grid grid-cols-3 gap-2">
                {nextGoal.map((item) => renderOddsPill(item))}
              </div>
            </div>
          )}

          {/* Asian Handicap */}
          {(activeMarketTab === 'all' || activeMarketTab === 'handicap') && (
            <div className="bg-white rounded border border-neutral-200 p-3 shadow-2xs">
              <div className="text-xs font-bold text-neutral-800 mb-2">Asian Handicap</div>
              <div className="space-y-2">
                {asianHandicaps.map((ah, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    {renderOddsPill(ah.team1Handicap)}
                    {renderOddsPill(ah.team2Handicap)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
