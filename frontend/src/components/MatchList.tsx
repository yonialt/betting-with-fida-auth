import React, { useState } from 'react';
import {
  Star,
  Pin,
  ChevronDown,
  ChevronUp,
  Play,
  BarChart2,
  TrendingUp,
  List,
  Users,
  Lock,
  Activity,
  Layers,
  LayoutGrid,
  Shield,
  Zap,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { Match, OddsItem } from '../types';
import { ActiveStadiumTracker } from './ActiveStadiumTracker';

export const MatchList: React.FC = () => {
  const {
    matches,
    activeSport,
    onlyWithStreams,
    activeSubTab,
    searchQuery,
    favorites,
    oddsDisplayMode,
    setOddsDisplayMode,
  } = useBetting();

  // Filter matches based on user selections
  const filteredMatches = matches.filter((m) => {
    if (activeSport !== 'all' && m.sport !== activeSport) return false;
    if (onlyWithStreams && !m.hasLiveStream) return false;
    if (activeSubTab === 'recommended' && !favorites.has(m.id)) return false;
    if (activeSubTab === 'upcoming' && m.isLive) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.team1} ${m.team2} ${m.league}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  // Group matches by league
  const groupedMatches = filteredMatches.reduce<Record<string, Match[]>>((acc, match) => {
    if (!acc[match.league]) {
      acc[match.league] = [];
    }
    acc[match.league].push(match);
    return acc;
  }, {});

  const leagues = Object.keys(groupedMatches);

  return (
    <div id="match-list-container" className="w-full bg-[#eaedf1] divide-y divide-[#c9d6e4]">
      {/* Odds View Switcher Toolbar */}
      <div className="bg-[#1b4470] text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#14365b]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-200">Odds Display Mode:</span>
          <div className="flex items-center bg-[#0e2c4d] rounded p-0.5 border border-white/20">
            <button
              onClick={() => setOddsDisplayMode('simple')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                oddsDisplayMode === 'simple'
                  ? 'bg-[#0091ff] text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Simple Odds</span>
            </button>
            <button
              onClick={() => setOddsDisplayMode('detailed')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                oddsDisplayMode === 'detailed'
                  ? 'bg-[#0091ff] text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Detailed Odds</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-neutral-300 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">{filteredMatches.length}</span> Live Matches
          </span>
          <span className="hidden sm:inline text-neutral-400">| Click 🏟️ for Live Active Stadium</span>
        </div>
      </div>

      {leagues.length === 0 ? (
        <div className="bg-white p-8 text-center">
          <p className="text-neutral-500 text-sm font-semibold">No live matches found matching your filters.</p>
        </div>
      ) : (
        leagues.map((leagueName) => {
          const leagueMatches = groupedMatches[leagueName];
          const firstMatch = leagueMatches[0];
          const isEsports = firstMatch?.sport === 'esports';

          return (
            <div
              key={leagueName}
              id={`league-group-${leagueName.replace(/[^a-zA-Z0-9]/g, '-')}`}
              className="w-full bg-white overflow-hidden"
            >
              {/* League Header */}
              <div className="bg-[#d2dce8] border-b border-[#c2d0df] px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
                {/* Left: Sport Icon + Flag/Badge + League Name */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {firstMatch?.sport === 'esports' ? '🎮' : '⚽'}
                  </span>
                  {leagueName.includes('Portugal') ? (
                    <span className="text-xs">🇵🇹</span>
                  ) : leagueName.includes('India') ? (
                    <span className="text-xs">🇮🇳</span>
                  ) : leagueName.includes('Nigeria') ? (
                    <span className="text-xs">🇳🇬</span>
                  ) : leagueName.includes('Socca') ? (
                    <span className="text-xs">🌍</span>
                  ) : leagueName.includes('Kazakhstan') ? (
                    <span className="text-xs">🇰🇿</span>
                  ) : leagueName.includes('League of Legends') ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[8px]">
                      L
                    </span>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#163b63]" />
                  )}
                  <h3 className="font-bold text-[13px] text-[#163b63] tracking-tight">
                    {leagueName}
                  </h3>
                </div>

                {/* Right: Column Odds Headers (in simple mode) */}
                {oddsDisplayMode === 'simple' && (
                  <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-[#476587] pr-2">
                    {isEsports ? (
                      <>
                        <span className="w-12 text-center">1</span>
                        <span className="w-12 text-center">X</span>
                        <span className="w-12 text-center">2</span>
                        <span className="w-12 text-center">-</span>
                        <span className="w-12 text-center">-</span>
                        <span className="w-12 text-center">-</span>
                      </>
                    ) : (
                      <>
                        <span className="w-12 text-center">1</span>
                        <span className="w-12 text-center flex items-center justify-center gap-0.5">
                          X <ChevronDown className="w-2.5 h-2.5" />
                        </span>
                        <span className="w-12 text-center">2</span>
                        <span className="w-12 text-center">1X</span>
                        <span className="w-12 text-center flex items-center justify-center gap-0.5">
                          12 <ChevronDown className="w-2.5 h-2.5" />
                        </span>
                        <span className="w-12 text-center">2X</span>
                        <span className="w-8 text-center text-[#1b65a5] font-black">+5</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Match Rows */}
              <div className="divide-y divide-[#e2eaf2]">
                {leagueMatches.map((match) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    isEsports={isEsports}
                    displayMode={oddsDisplayMode}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

interface MatchRowProps {
  match: Match;
  isEsports: boolean;
  displayMode: 'simple' | 'detailed';
}

const MatchRow: React.FC<MatchRowProps> = ({ match, isEsports, displayMode }) => {
  const {
    favorites,
    toggleFavorite,
    toggleSelection,
    isOddsSelected,
    openDetailedEvent,
  } = useBetting();

  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [subGamesExpanded, setSubGamesExpanded] = useState<boolean>(false);
  const [showActiveStadium, setShowActiveStadium] = useState<boolean>(false);
  const isFav = favorites.has(match.id);

  // Helper for rendering team logo or custom badge
  const renderTeamIcon = (teamName: string) => {
    if (teamName.includes('Gen.G')) {
      return (
        <div className="w-4 h-4 bg-[#a8893a] text-black font-black text-[7px] rounded flex items-center justify-center shadow-2xs">
          GG
        </div>
      );
    }
    if (teamName.includes('KT Rolster')) {
      return (
        <div className="w-4 h-4 bg-[#e60012] text-white font-black text-[7px] rounded flex items-center justify-center shadow-2xs">
          KT
        </div>
      );
    }
    if (teamName.includes('Serbia')) {
      return <span className="text-sm leading-none">🇷🇸</span>;
    }
    if (teamName.includes('Luxembourg')) {
      return <span className="text-sm leading-none">🇱🇺</span>;
    }
    if (teamName.includes('De-Elite')) {
      return <span className="text-xs leading-none">🛡️</span>;
    }
    if (teamName.includes('Prince Kazeem')) {
      return <span className="text-xs leading-none">⚽</span>;
    }
    if (teamName.includes('Moreirense')) {
      return <div className="w-4 h-4 bg-emerald-600 text-white font-bold text-[8px] rounded flex items-center justify-center">M</div>;
    }
    if (teamName.includes('Portimonense')) {
      return <div className="w-4 h-4 bg-neutral-900 text-white font-bold text-[8px] rounded flex items-center justify-center">P</div>;
    }
    if (teamName.includes('Farense')) {
      return <div className="w-4 h-4 bg-black text-white font-bold text-[8px] rounded flex items-center justify-center">F</div>;
    }
    if (teamName.includes('Famalicão')) {
      return <div className="w-4 h-4 bg-blue-700 text-white font-bold text-[8px] rounded flex items-center justify-center">FA</div>;
    }
    return <div className="w-3.5 h-3.5 rounded-full bg-neutral-300" />;
  };

  const renderOddsPill = (item: OddsItem | undefined, dashPlaceholder: boolean = false) => {
    if (!item || item.value === 0 || dashPlaceholder) {
      return (
        <div className="w-12 h-7 rounded bg-[#e8eef5] text-neutral-400 font-bold text-xs flex items-center justify-center select-none">
          -
        </div>
      );
    }

    const selected = isOddsSelected(item.id);

    return (
      <button
        key={item.id}
        id={`odds-btn-${item.id}`}
        onClick={() => toggleSelection(match, item)}
        title={`${item.marketName}: ${item.name} (${item.value})`}
        className={`w-12 h-7 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
          selected
            ? 'bg-[#ffc600] text-black shadow-inner font-black'
            : 'bg-[#e8eef5] hover:bg-[#d9e4f0] text-[#1b3e66]'
        }`}
      >
        <span className="font-sans text-[11.5px]">{item.value}</span>
        {item.isLocked && <Lock className="w-2.5 h-2.5 text-neutral-500 shrink-0" />}
      </button>
    );
  };

  const renderDetailedOddsBtn = (label: string, value: number, marketName: string, subId: string) => {
    const oddsId = `${match.id}-${marketName}-${subId}`;
    const selected = isOddsSelected(oddsId);
    const item: OddsItem = {
      id: oddsId,
      label,
      name: `${match.team1} vs ${match.team2} - ${label}`,
      marketName,
      value,
    };

    return (
      <button
        key={oddsId}
        onClick={() => toggleSelection(match, item)}
        className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
          selected
            ? 'bg-[#ffc600] border-[#e6b200] text-black font-extrabold shadow-inner'
            : 'bg-[#f4f6f8] border-neutral-200 text-neutral-900 hover:bg-[#e8ecf0]'
        }`}
      >
        <span className="text-[11px] text-neutral-600 font-semibold">{label}</span>
        <span className="font-mono text-neutral-900 font-bold">{value}</span>
      </button>
    );
  };

  return (
    <div id={`match-row-wrapper-${match.id}`} className="flex flex-col bg-white">
      {/* Primary Match Row */}
      <div
        id={`match-row-${match.id}`}
        className="p-2 sm:px-3 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#f6f9fc] transition-colors"
      >
        {/* Left Column: Pin, Star, Teams, Scores & Status Actions */}
        <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
          {/* Pin & Star icons */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 text-neutral-400 pt-0.5 sm:pt-0">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`cursor-pointer hover:text-neutral-700 transition-colors ${
                isPinned ? 'text-[#163b63]' : ''
              }`}
              title="Pin match"
            >
              <Pin className="w-3.5 h-3.5 rotate-45" />
            </button>
            <button
              onClick={() => toggleFavorite(match.id)}
              className={`cursor-pointer hover:text-amber-400 transition-colors ${
                isFav ? 'text-amber-500 fill-amber-400' : ''
              }`}
              title="Favorite match"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Teams & Status */}
          <div className="flex-1 min-w-0">
            {/* Team 1 */}
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={() => openDetailedEvent(match)}
                className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-neutral-900 cursor-pointer hover:text-[#0091ff] truncate"
              >
                {renderTeamIcon(match.team1)}
                <span className="truncate">{match.team1}</span>
              </div>
              {/* Score 1 */}
              <div className="flex items-center gap-2 font-black text-xs sm:text-[13px] text-neutral-900 pr-3 font-mono">
                <span>{match.score1}</span>
                {match.periodScores?.p1 && (
                  <span className="text-neutral-500 text-[11px] font-normal">
                    {match.periodScores.p1[0]}
                  </span>
                )}
                {match.periodScores?.p2 && (
                  <span className="text-neutral-400 text-[11px] font-normal">
                    {match.periodScores.p2[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <div
                onClick={() => openDetailedEvent(match)}
                className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-neutral-900 cursor-pointer hover:text-[#0091ff] truncate"
              >
                {renderTeamIcon(match.team2)}
                <span className="truncate">{match.team2}</span>
              </div>
              {/* Score 2 */}
              <div className="flex items-center gap-2 font-black text-xs sm:text-[13px] text-neutral-900 pr-3 font-mono">
                <span>{match.score2}</span>
                {match.periodScores?.p1 && (
                  <span className="text-neutral-500 text-[11px] font-normal">
                    {match.periodScores.p1[1]}
                  </span>
                )}
                {match.periodScores?.p2 && (
                  <span className="text-neutral-400 text-[11px] font-normal">
                    {match.periodScores.p2[1]}
                  </span>
                )}
              </div>
            </div>

            {/* Subtitle Line: Status + Stadium Active Indicator + Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#556980] mt-1 font-medium">
              <span className="truncate">{match.period}</span>

              {/* Stadium Active Live Badge */}
              <button
                onClick={() => setShowActiveStadium(!showActiveStadium)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition-all ${
                  showActiveStadium
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Toggle Active Stadium Pitch"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>STADIUM ACTIVE</span>
              </button>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5 text-neutral-600 shrink-0">
                {match.hasLiveStream && (
                  <button onClick={() => openDetailedEvent(match)} title="Live Stream">
                    <Play className="w-2.5 h-2.5 text-blue-600 fill-blue-600 cursor-pointer" />
                  </button>
                )}
                <button
                  onClick={() => setShowActiveStadium(!showActiveStadium)}
                  title="Active Stadium & Stats"
                  className="hover:text-black cursor-pointer"
                >
                  <BarChart2 className="w-3 h-3 text-[#0091ff]" />
                </button>
                <TrendingUp
                  onClick={() => openDetailedEvent(match)}
                  className="w-2.5 h-2.5 text-neutral-500 hover:text-black cursor-pointer"
                  title="Markets Movement"
                />
                <List
                  onClick={() => openDetailedEvent(match)}
                  className="w-2.5 h-2.5 text-neutral-500 hover:text-black cursor-pointer"
                  title="All Markets"
                />
                <Users
                  onClick={() => openDetailedEvent(match)}
                  className="w-2.5 h-2.5 text-neutral-500 hover:text-black cursor-pointer"
                  title="Lineups"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simple Odds Mode */}
        {displayMode === 'simple' && (
          <div className="flex items-center gap-1.5 shrink-0 justify-end overflow-x-auto no-scrollbar pt-1 sm:pt-0">
            {/* Show Sub-Games Dropdown Button (matching video at 00:00) */}
            {match.subGames && match.subGames.length > 0 && (
              <button
                onClick={() => setSubGamesExpanded(!subGamesExpanded)}
                className={`w-6 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  subGamesExpanded
                    ? 'bg-[#0091ff] text-white'
                    : 'bg-[#1b4470] hover:bg-[#255c96] text-white'
                }`}
                title={subGamesExpanded ? 'Hide sub-games' : 'Show sub-games'}
              >
                {subGamesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {isEsports ? (
              <>
                {renderOddsPill(match.odds.w1)}
                {renderOddsPill(undefined, true)}
                {renderOddsPill(match.odds.w2)}
                {renderOddsPill(undefined, true)}
                {renderOddsPill(undefined, true)}
                {renderOddsPill(undefined, true)}
              </>
            ) : (
              <>
                {renderOddsPill(match.odds.w1)}
                {renderOddsPill(match.odds.x)}
                {renderOddsPill(match.odds.w2)}
                {renderOddsPill(match.odds.x1)}
                {renderOddsPill(match.odds.w12)}
                {renderOddsPill(match.odds.x2)}
              </>
            )}

            {/* Extra Markets Count */}
            <button
              onClick={() => openDetailedEvent(match)}
              className="w-10 text-center text-xs font-bold text-[#1b65a5] hover:underline cursor-pointer"
              title={`View all ${match.extraMarketsCount} markets`}
            >
              +{match.extraMarketsCount}
            </button>
          </div>
        )}
      </div>

      {/* Detailed Odds Mode Inline Panel */}
      {displayMode === 'detailed' && (
        <div className="px-3 pb-3 pt-1 bg-[#f8fafc] border-t border-[#e2eaf2] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs animate-in fade-in">
          {/* 1X2 */}
          <div className="bg-white p-2 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-1 text-[11px]">1X2</div>
            <div className="flex gap-1">
              {renderDetailedOddsBtn('1', match.odds.w1?.value || 1.8, '1X2', '1')}
              {match.odds.x && renderDetailedOddsBtn('X', match.odds.x.value, '1X2', 'x')}
              {renderDetailedOddsBtn('2', match.odds.w2?.value || 2.2, '1X2', '2')}
            </div>
          </div>

          {/* Double Chance */}
          <div className="bg-white p-2 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-1 text-[11px]">Double Chance</div>
            <div className="flex gap-1">
              {renderDetailedOddsBtn('1X', match.odds.x1?.value || 1.15, 'DC', '1x')}
              {renderDetailedOddsBtn('12', match.odds.w12?.value || 1.25, 'DC', '12')}
              {renderDetailedOddsBtn('2X', match.odds.x2?.value || 1.85, 'DC', '2x')}
            </div>
          </div>

          {/* Both Teams to Score */}
          <div className="bg-white p-2 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-1 text-[11px]">Both Teams to Score</div>
            <div className="flex gap-1">
              {renderDetailedOddsBtn('Yes', 1.88, 'BTTS', 'yes')}
              {renderDetailedOddsBtn('No', 1.92, 'BTTS', 'no')}
            </div>
          </div>

          {/* Total Goals */}
          <div className="bg-white p-2 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-1 text-[11px]">Total Goals (2.5)</div>
            <div className="flex gap-1">
              {renderDetailedOddsBtn('Over 2.5', 1.95, 'Total', 'o2.5')}
              {renderDetailedOddsBtn('Under 2.5', 1.85, 'Total', 'u2.5')}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Sub-Games List (matching video at 00:00 - 00:09) */}
      {subGamesExpanded && match.subGames && match.subGames.length > 0 && (
        <div className="bg-[#f0f4f9] border-t border-[#d8e2ec] px-4 py-2 space-y-1.5 divide-y divide-white/60 animate-in fade-in">
          {match.subGames.map((sub) => (
            <div key={sub.id} className="pt-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#163b63] text-xs pl-6">{sub.name}</span>
              <div className="flex items-center gap-1.5">
                {sub.odds?.w1 && renderOddsPill(sub.odds.w1)}
                {sub.odds?.x && renderOddsPill(sub.odds.x)}
                {sub.odds?.w2 && renderOddsPill(sub.odds.w2)}
                {sub.odds?.x1 && renderOddsPill(sub.odds.x1)}
                {sub.odds?.w12 && renderOddsPill(sub.odds.w12)}
                {sub.odds?.x2 && renderOddsPill(sub.odds.x2)}
                {sub.extraMarketsCount && (
                  <button
                    onClick={() => openDetailedEvent(match)}
                    className="w-10 text-center text-xs font-bold text-[#1b65a5] hover:underline cursor-pointer"
                  >
                    +{sub.extraMarketsCount}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline Active Stadium Tracker Panel */}
      {showActiveStadium && (
        <div className="p-3 bg-[#0f2845] border-t border-[#204975] animate-in fade-in">
          <ActiveStadiumTracker match={match} />
        </div>
      )}
    </div>
  );
};
