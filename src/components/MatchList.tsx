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
  Banknote,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { Match, OddsItem } from '../types';
import { ActiveStadiumTracker } from './ActiveStadiumTracker';

const LeagueHeaderDropdown: React.FC<{ label: string; widthClass?: string }> = ({
  label,
  widthClass = 'w-[48px] sm:w-[50px]',
}) => (
  <div
    className={`${widthClass} flex flex-col items-center justify-center -space-y-0.5 shrink-0 select-none`}
  >
    <span className="text-[11px] font-semibold text-neutral-700 leading-tight">
      {label}
    </span>
    <span className="w-3.5 h-3.5 rounded-full bg-[#525f6e] text-white flex items-center justify-center text-[7px] leading-none shadow-2xs">
      ▼
    </span>
  </div>
);

export const MatchList: React.FC = () => {
  const {
    matches,
    activeSport,
    activeSubTab,
    searchQuery,
    favorites,
    oddsDisplayMode,
    setOddsDisplayMode,
  } = useBetting();

  // Filter matches based on user selections
  const filteredMatches = matches.filter((m) => {
    if (activeSport !== 'all' && m.sport !== activeSport) return false;
    if (activeSubTab === 'recommended' && !favorites.has(m.id)) return false;
    if (activeSubTab === 'live' && !m.isLive) return false;
    if (activeSubTab === 'upcoming' && m.isLive) return false;
    if (activeSubTab === 'today') {
      if (m.isLive) return false;
      return m.timeCategory === 'today';
    }
    if (activeSubTab === 'tomorrow') {
      if (m.isLive) return false;
      return m.timeCategory === 'tomorrow';
    }
    if (activeSubTab === 'day2') {
      if (m.isLive) return false;
      return m.timeCategory === 'day2';
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.team1} ${m.team2} ${m.league}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  // Group matches by league
  const groupedMatches = filteredMatches.reduce<Record<string, Match[]>>(
    (acc, match) => {
      if (!acc[match.league]) {
        acc[match.league] = [];
      }

      acc[match.league].push(match);
      return acc;
    },
    {}
  );

  const leagues = Object.keys(groupedMatches);

  return (
    <div
      id="match-list-container"
      className="w-full bg-[#eaedf1] divide-y divide-[#c9d6e4]"
    >
      {leagues.length === 0 ? (
        <div className="bg-white p-6 text-center">
          <p className="text-neutral-500 text-sm font-semibold">
            No live matches found matching your filters.
          </p>
        </div>
      ) : (
        leagues.map((leagueName) => {
          const leagueMatches = groupedMatches[leagueName];
          const firstMatch = leagueMatches[0];
          const isEsports = firstMatch?.sport === 'esports';

          return (
            <div
              key={leagueName}
              id={`league-group-${leagueName.replace(
                /[^a-zA-Z0-9]/g,
                '-'
              )}`}
              className="w-full bg-white overflow-hidden"
            >
              {/* League Header */}
              {(() => {
                const isTennisLeague =
                  firstMatch?.sport === 'tennis' ||
                  leagueName.toLowerCase().includes('tennis') ||
                  leagueName.toLowerCase().includes('open');
                const isEsportsLeague = isEsports;

                const getFlag = () => {
                  if (leagueName.includes('Argentina')) return '🇦🇷';
                  if (leagueName.includes('US Open') || leagueName.includes('USA')) return '🇺🇸';
                  if (leagueName.includes('Portugal')) return '🇵🇹';
                  if (leagueName.includes('England') || leagueName.includes('Premier League')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
                  if (leagueName.includes('Champions League') || leagueName.includes('UEFA')) return '🇪🇺';
                  if (leagueName.includes('India')) return '🇮🇳';
                  if (leagueName.includes('Nigeria')) return '🇳🇬';
                  if (leagueName.includes('Socca')) return '🌍';
                  if (leagueName.includes('Kazakhstan')) return '🇰🇿';
                  return null;
                };

                const flag = getFlag();

                return (
                  <div className="bg-[#dce2e8] border-y border-[#cbd5e1] px-2.5 py-1.5 flex items-center justify-between gap-1 text-xs select-none">
                    {/* Left: Sport Icon + Flag + League Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm leading-none shrink-0">
                        {isTennisLeague ? '🎾' : isEsportsLeague ? '🎮' : '⚽'}
                      </span>

                      {flag ? (
                        <span className="text-sm leading-none shrink-0">{flag}</span>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#163b63] shrink-0" />
                      )}

                      <h3 className="font-bold text-[13px] text-[#163b63] tracking-tight truncate">
                        {leagueName}
                      </h3>
                    </div>

                    {/* Right: Column Odds Headers matching image.png */}
                    {oddsDisplayMode === 'simple' && (
                      <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-neutral-700 pr-1 shrink-0">
                        {isTennisLeague ? (
                          <>
                            {/* Match Winner 1 X 2 */}
                            <span className="w-[48px] sm:w-[50px] text-center">1</span>
                            <LeagueHeaderDropdown label="X" />
                            <span className="w-[48px] sm:w-[50px] text-center">2</span>

                            {/* Total Games */}
                            <span className="w-[48px] sm:w-[50px] text-center">O</span>
                            <LeagueHeaderDropdown label="Total" widthClass="w-[36px] sm:w-[40px]" />
                            <span className="w-[48px] sm:w-[50px] text-center">U</span>

                            {/* Handicap */}
                            <span className="w-[48px] sm:w-[50px] text-center">1</span>
                            <LeagueHeaderDropdown label="Handicap" widthClass="w-[48px] sm:w-[54px]" />
                            <span className="w-[48px] sm:w-[50px] text-center">2</span>

                            {/* Extra markets header */}
                            <span className="w-10 text-center font-bold text-[#1b65a5]">
                              +2
                            </span>
                          </>
                        ) : isEsportsLeague ? (
                          <>
                            <span className="w-[48px] sm:w-[50px] text-center">1</span>
                            <span className="w-[48px] sm:w-[50px] text-center">X</span>
                            <span className="w-[48px] sm:w-[50px] text-center">2</span>
                            <span className="w-[48px] sm:w-[50px] text-center">O</span>
                            <LeagueHeaderDropdown label="Total" widthClass="w-[36px] sm:w-[40px]" />
                            <span className="w-[48px] sm:w-[50px] text-center">U</span>
                            <span className="w-10 text-center font-bold text-[#1b65a5]">
                              +2
                            </span>
                          </>
                        ) : (
                          <>
                            {/* 1X2 */}
                            <span className="w-[48px] sm:w-[50px] text-center">1</span>
                            <LeagueHeaderDropdown label="X" />
                            <span className="w-[48px] sm:w-[50px] text-center">2</span>

                            {/* Double Chance */}
                            <span className="w-[48px] sm:w-[50px] text-center">1X</span>
                            <LeagueHeaderDropdown label="12" />
                            <span className="w-[48px] sm:w-[50px] text-center">2X</span>

                            {/* Total Goals */}
                            <span className="w-[48px] sm:w-[50px] text-center">O</span>
                            <LeagueHeaderDropdown label="Total" widthClass="w-[36px] sm:w-[40px]" />
                            <span className="w-[48px] sm:w-[50px] text-center">U</span>

                            {/* Extra markets header */}
                            <span className="w-10 text-center font-bold text-[#1b65a5]">
                              +4
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

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

const MatchRow: React.FC<MatchRowProps> = ({
  match,
  isEsports,
  displayMode,
}) => {
  const {
    favorites,
    toggleFavorite,
    toggleSelection,
    isOddsSelected,
    openDetailedEvent,
  } = useBetting();

  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [subGamesExpanded, setSubGamesExpanded] =
    useState<boolean>(false);
  const [showActiveStadium, setShowActiveStadium] =
    useState<boolean>(false);
  const [quickOddsExpanded, setQuickOddsExpanded] = useState<boolean>(false);

  const isFav = favorites.has(match.id);
  const isTennis =
    match.sport === 'tennis' ||
    match.league.toLowerCase().includes('tennis') ||
    match.league.toLowerCase().includes('open');

  // Helper for rendering team logo or custom badge
  const renderTeamIcon = (teamName: string, teamLogo?: string) => {
    if (teamLogo) {
      return (
        <img
          src={teamLogo}
          alt={teamName}
          className="w-4 h-4 rounded-full object-cover shrink-0 bg-neutral-100"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    if (teamName.includes('Belgrano')) {
      return (
        <div className="w-4 h-4 rounded-full bg-[#00a3e0] text-white flex items-center justify-center text-[7px] font-black shrink-0 border border-sky-600">
          CAB
        </div>
      );
    }
    if (teamName.includes('Huracan') || teamName.includes('Huracán')) {
      return (
        <div className="w-4 h-4 rounded-full bg-white text-red-600 flex items-center justify-center text-[7px] font-black shrink-0 border border-red-300">
          🎈
        </div>
      );
    }
    if (teamName.includes('Platense')) {
      return (
        <div className="w-4 h-4 rounded-full bg-[#5c3a21] text-white flex items-center justify-center text-[7px] font-black shrink-0">
          CAP
        </div>
      );
    }
    if (teamName.includes('Riestra')) {
      return (
        <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[7px] font-black shrink-0 border border-neutral-400">
          R
        </div>
      );
    }
    if (teamName.includes('Gen.G')) {
      return (
        <div className="w-4 h-4 bg-[#a8893a] text-black font-black text-[7px] rounded flex items-center justify-center shrink-0">
          GG
        </div>
      );
    }
    if (teamName.includes('KT Rolster')) {
      return (
        <div className="w-4 h-4 bg-[#e60012] text-white font-black text-[7px] rounded flex items-center justify-center shrink-0">
          KT
        </div>
      );
    }
    if (teamName.includes('Serbia')) {
      return <span className="text-xs leading-none">🇷🇸</span>;
    }
    if (teamName.includes('Luxembourg')) {
      return <span className="text-xs leading-none">🇱🇺</span>;
    }
    if (teamName.includes('Moreirense')) {
      return (
        <div className="w-4 h-4 bg-emerald-600 text-white font-bold text-[8px] rounded flex items-center justify-center shrink-0">
          M
        </div>
      );
    }
    if (teamName.includes('Portimonense')) {
      return (
        <div className="w-4 h-4 bg-neutral-900 text-white font-bold text-[8px] rounded flex items-center justify-center shrink-0">
          P
        </div>
      );
    }
    if (teamName.includes('Farense')) {
      return (
        <div className="w-4 h-4 bg-black text-white font-bold text-[8px] rounded flex items-center justify-center shrink-0">
          F
        </div>
      );
    }
    if (teamName.includes('Famalicão')) {
      return (
        <div className="w-4 h-4 bg-blue-700 text-white font-bold text-[8px] rounded flex items-center justify-center shrink-0">
          FA
        </div>
      );
    }

    return (
      <div className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[8px] font-bold shrink-0">
        {teamName.charAt(0)}
      </div>
    );
  };

  const renderOddsPill = (
    item: OddsItem | undefined,
    dashPlaceholder: boolean = false
  ) => {
    if (!item || item.value === 0 || dashPlaceholder) {
      return (
        <div className="h-7 w-[48px] sm:w-[50px] rounded-[5px] bg-[#f0f2f5] text-neutral-400 font-bold text-xs flex items-center justify-center select-none cursor-default">
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
        title={`${item.marketName}: ${item.name} (${item.value}) ${item.isLocked ? '(Odds Locked)' : ''}`}
        className={`h-7 w-[48px] sm:w-[50px] rounded-[5px] text-[11.5px] sm:text-[12px] font-semibold transition-all cursor-pointer flex items-center justify-center relative select-none border border-transparent ${
          selected
            ? 'bg-[#ffc600] text-black shadow-inner font-extrabold border-[#e6b200]'
            : 'bg-[#f0f2f5] hover:bg-[#e4e8ec] text-[#212529]'
        }`}
      >
        <span className="font-sans">
          {item.value}
        </span>

        {item.isLocked && (
          <Lock className="w-2.5 h-2.5 text-neutral-600 absolute top-1 right-1" />
        )}
      </button>
    );
  };

  const renderDetailedOddsBtn = (
    label: string,
    value: number,
    marketName: string,
    subId: string
  ) => {
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
        className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
          selected
            ? 'bg-[#ffc600] border-[#e6b200] text-black font-extrabold shadow-inner'
            : 'bg-[#f4f6f8] border-neutral-200 text-neutral-900 hover:bg-[#e8ecf0]'
        }`}
      >
        <span className="text-[11px] text-neutral-600 font-semibold">
          {label}
        </span>

        <span className="font-mono text-neutral-900 font-bold">
          {value}
        </span>
      </button>
    );
  };

  return (
    <div
      id={`match-row-wrapper-${match.id}`}
      className="flex flex-col bg-white"
    >
      {/* Primary Match Row matching image.png */}
      <div
        id={`match-row-${match.id}`}
        className="px-2.5 py-1.5 flex flex-col lg:flex-row lg:items-center justify-between gap-1.5 hover:bg-[#f8fafc] transition-colors"
      >
        {/* Left Column: Teams, Scores & In-line Metadata */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Vertical Pin & Star */}
          <div className="flex flex-col items-center justify-center gap-1 text-neutral-400 pt-0.5 shrink-0 select-none">
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

          {/* Teams & Scores & Metadata */}
          <div className="flex-1 min-w-0">
            {/* Team 1 Row */}
            <div className="flex items-center justify-between gap-2 py-0.5">
              <div
                onClick={() => openDetailedEvent(match)}
                className="flex items-center gap-1.5 font-medium text-[13px] text-neutral-900 cursor-pointer hover:text-[#0091ff] truncate min-w-0"
              >
                {renderTeamIcon(match.team1, match.team1Logo)}
                <span className="truncate">{match.team1}</span>
              </div>

              {/* Score 1 */}
              <div className="flex items-center gap-2 font-mono text-[13px] shrink-0 pr-1">
                {isTennis ? (
                  <div className="flex items-center gap-2.5">
                    {match.servingTeam === 1 && (
                      <span className="text-xs leading-none" title="Serving">🎾</span>
                    )}
                    <span className="font-bold text-neutral-900 w-3 text-center">
                      {match.score1}
                    </span>
                    {match.tennisScores?.p1Sets ? (
                      match.tennisScores.p1Sets.map((s, idx) => (
                        <span key={idx} className="text-neutral-700 text-xs w-2.5 text-center font-medium">
                          {s}
                        </span>
                      ))
                    ) : null}
                    {match.tennisScores?.p1Points && (
                      <span className="text-neutral-500 text-[11px]">
                        {match.tennisScores.p1Points}
                      </span>
                    )}
                  </div>
                ) : match.isLive ? (
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-neutral-900 w-3 text-center">
                      {match.score1}
                    </span>
                    {match.periodScores?.p1 && (
                      <span className="text-neutral-600 text-xs w-3 text-center font-normal">
                        {match.periodScores.p1[0]}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400 text-xs font-bold">-</span>
                )}
              </div>
            </div>

            {/* Team 2 Row */}
            <div className="flex items-center justify-between gap-2 py-0.5">
              <div
                onClick={() => openDetailedEvent(match)}
                className="flex items-center gap-1.5 font-medium text-[13px] text-neutral-900 cursor-pointer hover:text-[#0091ff] truncate min-w-0"
              >
                {renderTeamIcon(match.team2, match.team2Logo)}
                <span className="truncate">{match.team2}</span>
              </div>

              {/* Score 2 */}
              <div className="flex items-center gap-2 font-mono text-[13px] shrink-0 pr-1">
                {isTennis ? (
                  <div className="flex items-center gap-2.5">
                    {match.servingTeam === 2 && (
                      <span className="text-xs leading-none" title="Serving">🎾</span>
                    )}
                    <span className="font-bold text-neutral-900 w-3 text-center">
                      {match.score2}
                    </span>
                    {match.tennisScores?.p2Sets ? (
                      match.tennisScores.p2Sets.map((s, idx) => (
                        <span key={idx} className="text-neutral-700 text-xs w-2.5 text-center font-medium">
                          {s}
                        </span>
                      ))
                    ) : null}
                    {match.tennisScores?.p2Points && (
                      <span className="text-neutral-500 text-[11px]">
                        {match.tennisScores.p2Points}
                      </span>
                    )}
                  </div>
                ) : match.isLive ? (
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-neutral-900 w-3 text-center">
                      {match.score2}
                    </span>
                    {match.periodScores?.p1 && (
                      <span className="text-neutral-600 text-xs w-3 text-center font-normal">
                        {match.periodScores.p1[1]}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400 text-xs font-bold">-</span>
                )}
              </div>
            </div>

            {/* Bottom Row: Status + In-line Actions + Pitch Toggle */}
            <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500 font-normal">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="truncate text-[11px] text-neutral-500">
                  {match.period || match.timeDisplay}
                </span>

                <div className="flex items-center gap-1.5 text-neutral-500 shrink-0">
                  <button
                    onClick={() => openDetailedEvent(match)}
                    title="Cashout Available"
                    className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowActiveStadium(!showActiveStadium)}
                    title="Match Stats & Pitch"
                    className="hover:text-black cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-neutral-500 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => openDetailedEvent(match)}
                    title="Odds Movement & Trends"
                    className="hover:text-black cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-500 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => openDetailedEvent(match)}
                    title="Markets Overview"
                    className="hover:text-black cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5 text-neutral-500 hover:text-blue-600" />
                  </button>
                  <button
                    onClick={() => openDetailedEvent(match)}
                    title="Lineups & Head-to-Head"
                    className="hover:text-black cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-neutral-500 hover:text-blue-600" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowActiveStadium(!showActiveStadium)}
                className="text-neutral-500 hover:text-neutral-800 p-0.5 cursor-pointer shrink-0 ml-1"
                title="Toggle Live Stadium Pitch"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showActiveStadium ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Simple Odds matching image.png */}
        {displayMode === 'simple' && (
          <div className="flex items-center gap-1 shrink-0 justify-end overflow-x-auto no-scrollbar pt-0">
            {isTennis ? (
              <>
                {/* Match Winner: 1, X (-), 2 */}
                {renderOddsPill(match.odds.w1)}
                {renderOddsPill(undefined, true)}
                {renderOddsPill(match.odds.w2)}

                {/* Total Games: Over, Line, Under */}
                {renderOddsPill(match.odds.totalOver)}
                <span
                  className="w-[36px] sm:w-[40px] text-center text-[11px] font-semibold text-neutral-800 border-b border-dashed border-neutral-500 select-none cursor-default"
                  title="Total Line"
                >
                  {match.totalLine || '38.5'}
                </span>
                {renderOddsPill(match.odds.totalUnder)}

                {/* Handicap: 1, Line, 2 */}
                {renderOddsPill(match.odds.handicap1)}
                <span
                  className="w-[48px] sm:w-[54px] text-center text-[11px] font-semibold text-neutral-800 border-b border-dashed border-neutral-500 select-none cursor-default"
                  title="Handicap Line"
                >
                  {match.handicapLine || '-0.5+'}
                </span>
                {renderOddsPill(match.odds.handicap2)}
              </>
            ) : isEsports ? (
              <>
                {renderOddsPill(match.odds.w1)}
                {renderOddsPill(undefined, true)}
                {renderOddsPill(match.odds.w2)}
                {renderOddsPill(match.odds.totalOver)}
                <span className="w-[36px] sm:w-[40px] text-center text-[11px] font-semibold text-neutral-800 border-b border-dashed border-neutral-500 select-none cursor-default">
                  {match.totalLine || '2.5'}
                </span>
                {renderOddsPill(match.odds.totalUnder)}
              </>
            ) : (
              <>
                {/* 1X2 */}
                {renderOddsPill(match.odds.w1)}
                {renderOddsPill(match.odds.x)}
                {renderOddsPill(match.odds.w2)}

                {/* Double Chance */}
                {renderOddsPill(match.odds.x1)}
                {renderOddsPill(match.odds.w12)}
                {renderOddsPill(match.odds.x2)}

                {/* Total Goals */}
                {renderOddsPill(match.odds.totalOver)}
                <span
                  className="w-[36px] sm:w-[40px] text-center text-[11px] font-semibold text-neutral-800 border-b border-dashed border-neutral-500 select-none cursor-default"
                  title="Total Line"
                >
                  {match.totalLine || '2.5'}
                </span>
                {renderOddsPill(match.odds.totalUnder)}
              </>
            )}

            {/* Extra Markets Link */}
            <button
              onClick={() => openDetailedEvent(match)}
              className="w-10 text-center text-xs sm:text-[13px] font-semibold text-neutral-900 underline hover:text-[#0091ff] cursor-pointer shrink-0"
              title={`View all ${match.extraMarketsCount} markets`}
            >
              +{match.extraMarketsCount}
            </button>
          </div>
        )}
      </div>

      {/* Detailed Odds Mode */}
      {displayMode === 'detailed' && (
        <div className="px-2 pb-2 pt-1 bg-[#f8fafc] border-t border-[#e2eaf2] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 text-xs animate-in fade-in">
          {/* 1X2 */}
          <div className="bg-white p-1.5 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-0.5 text-[11px]">
              1X2
            </div>

            <div className="flex gap-1">
              {renderDetailedOddsBtn(
                '1',
                match.odds.w1?.value || 1.8,
                '1X2',
                '1'
              )}

              {match.odds.x &&
                renderDetailedOddsBtn(
                  'X',
                  match.odds.x.value,
                  '1X2',
                  'x'
                )}

              {renderDetailedOddsBtn(
                '2',
                match.odds.w2?.value || 2.2,
                '1X2',
                '2'
              )}
            </div>
          </div>

          {/* Double Chance */}
          <div className="bg-white p-1.5 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-0.5 text-[11px]">
              Double Chance
            </div>

            <div className="flex gap-1">
              {renderDetailedOddsBtn(
                '1X',
                match.odds.x1?.value || 1.15,
                'DC',
                '1x'
              )}

              {renderDetailedOddsBtn(
                '12',
                match.odds.w12?.value || 1.25,
                'DC',
                '12'
              )}

              {renderDetailedOddsBtn(
                '2X',
                match.odds.x2?.value || 1.85,
                'DC',
                '2x'
              )}
            </div>
          </div>

          {/* Both Teams to Score */}
          <div className="bg-white p-1.5 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-0.5 text-[11px]">
              Both Teams to Score
            </div>

            <div className="flex gap-1">
              {renderDetailedOddsBtn(
                'Yes',
                1.88,
                'BTTS',
                'yes'
              )}

              {renderDetailedOddsBtn(
                'No',
                1.92,
                'BTTS',
                'no'
              )}
            </div>
          </div>

          {/* Total Goals */}
          <div className="bg-white p-1.5 rounded border border-neutral-200 shadow-2xs">
            <div className="font-bold text-neutral-700 mb-0.5 text-[11px]">
              Total Goals (2.5)
            </div>

            <div className="flex gap-1">
              {renderDetailedOddsBtn(
                'Over 2.5',
                1.95,
                'Total',
                'o2.5'
              )}

              {renderDetailedOddsBtn(
                'Under 2.5',
                1.85,
                'Total',
                'u2.5'
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Odds Categories Chevron */}
      {displayMode === 'simple' && !isEsports && (
        <div className="px-2 py-0.5 bg-[#f0f4f9] border-t border-[#e2eaf2]">
          <button
            onClick={() => setQuickOddsExpanded(!quickOddsExpanded)}
            className="w-full flex items-center justify-between px-1 py-0.5 text-[11px] font-bold text-[#476587] hover:text-[#163b63] cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1">
              <span className="text-[10px]">📊</span>
              Quick Markets
            </span>
            {quickOddsExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {quickOddsExpanded && (
            <div className="pb-1.5 pt-0.5 space-y-1 animate-in fade-in">
              {/* 1st Half */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[10px] font-bold text-[#556980] shrink-0">1st Half</span>
                <div className="flex items-center gap-1">
                  {match.odds.w1 && renderOddsPill({ ...match.odds.w1, id: `${match.id}-h1-1`, marketName: '1st Half', name: '1st Half - 1' })}
                  {match.odds.x && renderOddsPill({ ...match.odds.x, id: `${match.id}-h1-x`, value: +(match.odds.x.value * 0.7).toFixed(2), marketName: '1st Half', name: '1st Half - X' })}
                  {match.odds.w2 && renderOddsPill({ ...match.odds.w2, id: `${match.id}-h1-2`, marketName: '1st Half', name: '1st Half - 2' })}
                </div>
              </div>

              {/* 2nd Half */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[10px] font-bold text-[#556980] shrink-0">2nd Half</span>
                <div className="flex items-center gap-1">
                  {match.odds.w1 && renderOddsPill({ ...match.odds.w1, id: `${match.id}-h2-1`, value: +(match.odds.w1.value * 0.85).toFixed(2), marketName: '2nd Half', name: '2nd Half - 1' })}
                  {match.odds.x && renderOddsPill({ ...match.odds.x, id: `${match.id}-h2-x`, value: +(match.odds.x.value * 0.65).toFixed(2), marketName: '2nd Half', name: '2nd Half - X' })}
                  {match.odds.w2 && renderOddsPill({ ...match.odds.w2, id: `${match.id}-h2-2`, value: +(match.odds.w2.value * 0.8).toFixed(2), marketName: '2nd Half', name: '2nd Half - 2' })}
                </div>
              </div>

              {/* Corners */}
              <div className="flex items-center gap-1">
                <span className="w-20 text-[10px] font-bold text-[#556980] shrink-0">Corners</span>
                <div className="flex items-center gap-1">
                  {renderOddsPill({ id: `${match.id}-corn-o9.5`, label: 'O9.5', name: 'Corners Over 9.5', marketName: 'Corners', value: 1.85 })}
                  {renderOddsPill({ id: `${match.id}-corn-u9.5`, label: 'U9.5', name: 'Corners Under 9.5', marketName: 'Corners', value: 1.95 })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expandable Sub-Games */}
      {subGamesExpanded &&
        match.subGames &&
        match.subGames.length > 0 && (
          <div className="bg-[#f0f4f9] border-t border-[#d8e2ec] px-2 py-1 space-y-1 divide-y divide-white/60 animate-in fade-in">
            {match.subGames.map((sub) => (
              <div
                key={sub.id}
                className="pt-1 flex items-center justify-between gap-1 text-xs"
              >
                <span className="font-bold text-[#163b63] text-xs pl-3 truncate">
                  {sub.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {sub.odds?.w1 &&
                    renderOddsPill(sub.odds.w1)}

                  {sub.odds?.x &&
                    renderOddsPill(sub.odds.x)}

                  {sub.odds?.w2 &&
                    renderOddsPill(sub.odds.w2)}

                  {sub.odds?.x1 &&
                    renderOddsPill(sub.odds.x1)}

                  {sub.odds?.w12 &&
                    renderOddsPill(sub.odds.w12)}

                  {sub.odds?.x2 &&
                    renderOddsPill(sub.odds.x2)}

                  {sub.extraMarketsCount && (
                    <button
                      onClick={() => openDetailedEvent(match)}
                      className="w-9 text-center text-xs font-bold text-[#1b65a5] hover:underline cursor-pointer"
                    >
                      +{sub.extraMarketsCount}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Inline Active Stadium Tracker */}
      {showActiveStadium && (
        <div className="p-2 bg-[#0f2845] border-t border-[#204975] animate-in fade-in">
          <ActiveStadiumTracker match={match} />
        </div>
      )}
    </div>
  );
};