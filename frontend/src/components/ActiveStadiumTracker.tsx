import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart2,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Flag,
  Target,
  Trophy,
  Shield,
  Layers,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Match } from '../types';

interface ActiveStadiumTrackerProps {
  match: Match;
  compact?: boolean;
}

export const ActiveStadiumTracker: React.FC<ActiveStadiumTrackerProps> = ({ match, compact = false }) => {
  // Stadium view angle: 2D tactical pitch, 3D isometric stadium, or virtual live action
  const [stadiumViewMode, setStadiumViewMode] = useState<'2d' | '3d' | 'replay'>('2d');
  const [activeAction, setActiveAction] = useState<string>('Dangerous attacks');
  const [actionTeam, setActionTeam] = useState<1 | 2>(1); // 1 = Home, 2 = Away
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 68, y: 48 });
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'timeline' | 'lineups' | 'standings'>('stats');
  const [soundMuted, setSoundMuted] = useState<boolean>(true);

  const stats = {
    attacks: match.stats?.attacks || [28, 11],
    dangerousAttacks: match.stats?.dangerousAttacks || [14, 5],
    possession: match.stats?.possession || [55, 45],
    shotsOnTarget: match.stats?.shotsOnTarget || [2, 0],
    shotsOffTarget: match.stats?.shotsOffTarget || [6, 0],
    corners: match.stats?.corners || [4, 1],
    yellowCards: match.stats?.yellowCards || [0, 1],
    fouls: match.stats?.fouls || [5, 7],
    xg: [0.82, 0.14],
  };

  // Automated live action cycle for an authentic live active stadium experience
  useEffect(() => {
    if (!autoSimulate) return;

    const actions = [
      { text: 'Attacks', team: 1 as 1 | 2, pos: { x: 62, y: 40 } },
      { text: 'Dangerous attacks', team: 1 as 1 | 2, pos: { x: 78, y: 52 } },
      { text: 'Shot on target', team: 1 as 1 | 2, pos: { x: 88, y: 48 } },
      { text: 'Corner kick', team: 1 as 1 | 2, pos: { x: 92, y: 15 } },
      { text: 'Attacks', team: 2 as 1 | 2, pos: { x: 38, y: 55 } },
      { text: 'Dangerous attacks', team: 2 as 1 | 2, pos: { x: 24, y: 45 } },
      { text: 'Goalkeeper save', team: 1 as 1 | 2, pos: { x: 12, y: 50 } },
      { text: 'Ball in midfield', team: 1 as 1 | 2, pos: { x: 50, y: 50 } },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % actions.length;
      const nextAct = actions[idx];
      setActiveAction(nextAct.text);
      setActionTeam(nextAct.team);
      setBallPos({
        x: nextAct.pos.x + (Math.random() * 6 - 3),
        y: nextAct.pos.y + (Math.random() * 6 - 3),
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [autoSimulate]);

  // Manually trigger a play event
  const triggerManualEvent = (actionName: string, team: 1 | 2, targetX: number, targetY: number) => {
    setActiveAction(actionName);
    setActionTeam(team);
    setBallPos({ x: targetX, y: targetY });
  };

  return (
    <div
      id={`active-stadium-tracker-${match.id}`}
      className="w-full bg-[#163b63] text-white rounded-lg shadow-lg border border-[#204975] overflow-hidden select-none"
    >
      {/* 1. Header Bar: Match Summary & View Toggles */}
      <div className="bg-[#112d4d] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#204975] text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-red-600/90 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE STADIUM</span>
          </div>
          <span className="font-bold text-neutral-200 text-xs truncate max-w-[180px] sm:max-w-xs">
            {match.team1} vs {match.team2}
          </span>
          <span className="text-[#a3e635] font-mono font-bold text-xs bg-[#0c223a] px-2 py-0.5 rounded">
            {match.score1} : {match.score2}
          </span>
        </div>

        {/* Right Controls: Stadium View Angle + Auto-Simulate Toggle */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center bg-[#0d2238] rounded p-0.5 border border-[#204975]">
            <button
              onClick={() => setStadiumViewMode('2d')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                stadiumViewMode === '2d' ? 'bg-[#0091ff] text-white' : 'text-neutral-300 hover:text-white'
              }`}
              title="2D Tactical Field"
            >
              2D Pitch
            </button>
            <button
              onClick={() => setStadiumViewMode('3d')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                stadiumViewMode === '3d' ? 'bg-[#0091ff] text-white' : 'text-neutral-300 hover:text-white'
              }`}
              title="3D Isometric Stadium"
            >
              3D Stadium
            </button>
            <button
              onClick={() => setStadiumViewMode('replay')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                stadiumViewMode === 'replay' ? 'bg-[#0091ff] text-white' : 'text-neutral-300 hover:text-white'
              }`}
              title="Live Action Replay"
            >
              Replay Cam
            </button>
          </div>

          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`p-1 rounded cursor-pointer transition-colors ${
              autoSimulate ? 'bg-emerald-600/30 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
            }`}
            title={autoSimulate ? 'Pause live action' : 'Resume live action'}
          >
            {autoSimulate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1 rounded bg-[#0d2238] text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. Main Pitch & Visual Stats Section (matching video at 00:14) */}
      <div className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch gap-4">
        {/* Left: Visual Stats Box (matching reference UI at 00:14) */}
        <div className="w-full md:w-64 bg-[#0d2238]/90 rounded-lg p-3 border border-[#204975] flex flex-col justify-between shrink-0 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-[#204975] text-[11px] font-bold">
            <span
              onClick={() => setActiveSubTab('standings')}
              className="text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#0091ff]" /> Standings
            </span>
            <span className="text-[#a3e635] font-extrabold border-b-2 border-[#a3e635] pb-0.5">
              Visual stats
            </span>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            {/* Stat: Attacks */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-mono font-bold text-white">{stats.attacks[0]}</span>
                <span className="text-neutral-300 font-medium">Attacks</span>
                <span className="font-mono font-bold text-neutral-300">{stats.attacks[1]}</span>
              </div>
              <div className="w-full h-1.5 bg-[#163b63] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#0091ff] h-full"
                  style={{ width: `${(stats.attacks[0] / (stats.attacks[0] + stats.attacks[1])) * 100}%` }}
                />
                <div
                  className="bg-[#e60012] h-full"
                  style={{ width: `${(stats.attacks[1] / (stats.attacks[0] + stats.attacks[1])) * 100}%` }}
                />
              </div>
            </div>

            {/* Stat: Dangerous attacks */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-mono font-extrabold text-[#38bdf8]">{stats.dangerousAttacks[0]}</span>
                <span className="text-neutral-200 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Dangerous attacks
                </span>
                <span className="font-mono font-bold text-neutral-300">{stats.dangerousAttacks[1]}</span>
              </div>
              <div className="w-full h-1.5 bg-[#163b63] rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-400 h-full"
                  style={{
                    width: `${
                      (stats.dangerousAttacks[0] / (stats.dangerousAttacks[0] + stats.dangerousAttacks[1] || 1)) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-orange-500 h-full"
                  style={{
                    width: `${
                      (stats.dangerousAttacks[1] / (stats.dangerousAttacks[0] + stats.dangerousAttacks[1] || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Stat: Ball possession % */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-mono font-bold text-white">{stats.possession[0]}%</span>
                <span className="text-neutral-300 font-medium">Ball possession %</span>
                <span className="font-mono font-bold text-white">{stats.possession[1]}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#163b63] rounded-full overflow-hidden flex">
                <div className="bg-[#a3e635] h-full" style={{ width: `${stats.possession[0]}%` }} />
                <div className="bg-neutral-500 h-full" style={{ width: `${stats.possession[1]}%` }} />
              </div>
            </div>

            {/* Stat: Shots on target */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-emerald-400">{stats.shotsOnTarget[0]}</span>
              <span className="text-neutral-300 font-medium">Shots on target</span>
              <span className="font-mono font-bold text-neutral-300">{stats.shotsOnTarget[1]}</span>
            </div>

            {/* Stat: Shots off target */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-white">{stats.shotsOffTarget[0]}</span>
              <span className="text-neutral-300 font-medium">Shots off target</span>
              <span className="font-mono font-bold text-neutral-300">{stats.shotsOffTarget[1]}</span>
            </div>

            {/* Stat: Corners */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-[#0091ff]">{stats.corners[0]}</span>
              <span className="text-neutral-300 font-medium flex items-center gap-1">
                <Flag className="w-2.5 h-2.5" /> Corners
              </span>
              <span className="font-mono font-bold text-neutral-300">{stats.corners[1]}</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Interactive Stadium Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Top Pitch Match Title & Timer */}
          <div className="w-full flex items-center justify-between px-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{match.team1}</span>
              <span className="text-[10px] text-neutral-400">(Home)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0d2238] px-3 py-1 rounded-full border border-[#204975]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-extrabold text-[#a3e635] text-sm">
                {match.score1} - {match.score2}
              </span>
              <span className="text-neutral-300 font-mono text-xs">1ST HALF {match.timeDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400">(Away)</span>
              <span className="font-bold text-white text-sm">{match.team2}</span>
            </div>
          </div>

          {/* 3D Isometric or 2D Active Pitch Canvas */}
          <div className="w-full relative rounded-lg overflow-hidden border border-[#204975] shadow-xl bg-radial from-[#1e5631] via-[#144222] to-[#0c2a15] p-2 min-h-[170px] sm:min-h-[200px] flex flex-col justify-between">
            {/* Field Boundary Lines & Markings */}
            <div className="absolute inset-2 border-2 border-white/40 rounded pointer-events-none">
              {/* Half-way line */}
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/40 -translate-x-1/2" />
              {/* Center Circle */}
              <div className="absolute left-1/2 top-1/2 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2" />

              {/* Left Penalty Box (Home) */}
              <div className="absolute left-0 top-1/4 bottom-1/4 w-12 sm:w-16 border-r-2 border-t-2 border-b-2 border-white/40" />
              <div className="absolute left-0 top-[38%] bottom-[38%] w-5 sm:w-6 border-r-2 border-t-2 border-b-2 border-white/40" />
              <div className="absolute -left-1.5 top-[40%] bottom-[40%] w-1.5 bg-white/80 border border-neutral-800" />

              {/* Right Penalty Box (Away) */}
              <div className="absolute right-0 top-1/4 bottom-1/4 w-12 sm:w-16 border-l-2 border-t-2 border-b-2 border-white/40" />
              <div className="absolute right-0 top-[38%] bottom-[38%] w-5 sm:w-6 border-l-2 border-t-2 border-b-2 border-white/40" />
              <div className="absolute -right-1.5 top-[40%] bottom-[40%] w-1.5 bg-white/80 border border-neutral-800" />

              {/* Corner Arcs */}
              <div className="absolute top-0 left-0 w-3 h-3 border-r border-b border-white/40 rounded-br-full" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-r border-t border-white/40 rounded-tr-full" />
              <div className="absolute top-0 right-0 w-3 h-3 border-l border-b border-white/40 rounded-bl-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-l border-t border-white/40 rounded-tl-full" />
            </div>

            {/* Grass Stripes Pattern */}
            <div className="absolute inset-2 grid grid-cols-8 pointer-events-none opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={i % 2 === 0 ? 'bg-black/20' : 'bg-white/10'} />
              ))}
            </div>

            {/* Attack Pressure Direction Arrow */}
            <div
              className={`absolute top-4 ${
                actionTeam === 1 ? 'right-16 text-[#38bdf8]' : 'left-16 text-[#e60012]'
              } flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse z-10`}
            >
              <span>{actionTeam === 1 ? `${match.team1} Attacking ➔` : `⬅ ${match.team2} Attacking`}</span>
            </div>

            {/* Live Active Action Badge (Floating on Pitch) */}
            <div
              className="absolute z-20 transition-all duration-700 ease-out transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${ballPos.x}%`, top: `${Math.max(22, Math.min(78, ballPos.y - 14))}%` }}
            >
              <div className="flex items-center gap-1.5 bg-black/85 text-white border border-[#a3e635] shadow-2xl px-2.5 py-1 rounded-full text-xs font-black tracking-wide whitespace-nowrap animate-bounce">
                {activeAction.includes('Dangerous') ? (
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-spin" />
                ) : activeAction.includes('Shot') ? (
                  <Target className="w-3.5 h-3.5 text-red-400" />
                ) : activeAction.includes('Corner') ? (
                  <Flag className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-[#a3e635]" />
                )}
                <span>{activeAction}</span>
              </div>
            </div>

            {/* Animated Ball with Glowing Ripple */}
            <div
              className="absolute z-20 transition-all duration-700 ease-out transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            >
              <div className="relative">
                <span className="w-3.5 h-3.5 bg-white border border-neutral-900 rounded-full shadow-lg block animate-pulse" />
                <span className="absolute -inset-1 rounded-full bg-[#a3e635]/60 animate-ping" />
              </div>
            </div>

            {/* Interactive Stadium Action Simulation Buttons */}
            <div className="z-10 mt-auto pt-20 flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs p-1 rounded-md border border-white/10 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-neutral-400 font-bold px-1 uppercase">Simulate:</span>
                <button
                  onClick={() => triggerManualEvent('Attacks', 1, 65, 45)}
                  className="px-2 py-0.5 rounded bg-[#13355a] hover:bg-[#1b4878] text-white font-bold cursor-pointer transition-colors"
                >
                  ⚡ Attack
                </button>
                <button
                  onClick={() => triggerManualEvent('Dangerous attacks', 1, 82, 50)}
                  className="px-2 py-0.5 rounded bg-amber-600/80 hover:bg-amber-600 text-white font-bold cursor-pointer transition-colors"
                >
                  🔥 Dangerous Attack
                </button>
                <button
                  onClick={() => triggerManualEvent('Corner kick', 1, 94, 18)}
                  className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white font-bold cursor-pointer transition-colors"
                >
                  🚩 Corner
                </button>
                <button
                  onClick={() => triggerManualEvent('Shot on target', 1, 88, 48)}
                  className="px-2 py-0.5 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold cursor-pointer transition-colors"
                >
                  🎯 Shot
                </button>
                <button
                  onClick={() => triggerManualEvent('Goal attempt saved!', 1, 95, 50)}
                  className="px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-600 text-white font-bold cursor-pointer transition-colors"
                >
                  ⚽ Goal
                </button>
              </div>

              {/* Status footer pill */}
              <div className="bg-black/60 px-2 py-0.5 rounded text-[10px] text-neutral-300 font-medium">
                🏟️ {match.venue || 'Active Stadium Field'}
              </div>
            </div>
          </div>

          {/* Sub Widgets Switcher Bar: Lineups, Timeline, Standings */}
          <div className="w-full flex items-center justify-center gap-6 mt-2 text-xs font-bold text-neutral-300">
            <button
              onClick={() => setActiveSubTab(activeSubTab === 'lineups' ? 'stats' : 'lineups')}
              className={`hover:text-[#a3e635] flex items-center gap-1 cursor-pointer transition-colors ${
                activeSubTab === 'lineups' ? 'text-[#a3e635]' : ''
              }`}
            >
              <span>Lineups</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveSubTab(activeSubTab === 'timeline' ? 'stats' : 'timeline')}
              className={`hover:text-[#a3e635] flex items-center gap-1 cursor-pointer transition-colors ${
                activeSubTab === 'timeline' ? 'text-[#a3e635]' : ''
              }`}
            >
              <span>Timeline</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveSubTab(activeSubTab === 'standings' ? 'stats' : 'standings')}
              className={`hover:text-[#a3e635] flex items-center gap-1 cursor-pointer transition-colors ${
                activeSubTab === 'standings' ? 'text-[#a3e635]' : ''
              }`}
            >
              <span>Standings</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Expandable Sub Tab Panels */}
          {activeSubTab === 'timeline' && (
            <div className="w-full mt-2 p-3 bg-[#0d2238] rounded-md border border-[#204975] text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold text-neutral-200 border-b border-[#204975] pb-1 flex items-center justify-between">
                <span>Match Events Timeline</span>
                <span className="text-[#a3e635] font-mono">1st Half ({match.timeDisplay})</span>
              </div>
              {match.events && match.events.length > 0 ? (
                match.events.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5 text-neutral-300">
                    <span className="font-mono font-bold text-[#38bdf8] w-8">{ev.minute}'</span>
                    <span className="text-xs">
                      {ev.type === 'goal' ? '⚽' : ev.type === 'card' ? '🟨' : ev.type === 'corner' ? '🚩' : '🎯'}
                    </span>
                    <span>{ev.text}</span>
                  </div>
                ))
              ) : (
                <div className="py-2 text-center text-neutral-400">
                  <p>12' 🟨 Yellow Card - Tactical foul</p>
                  <p>21' 🚩 Corner Kick - Moreirense U23</p>
                  <p>34' 🎯 Shot on target saved by keeper</p>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'lineups' && (
            <div className="w-full mt-2 p-3 bg-[#0d2238] rounded-md border border-[#204975] text-xs animate-in fade-in">
              <div className="font-bold text-neutral-200 border-b border-[#204975] pb-1 flex justify-between">
                <span>{match.team1} (4-3-3)</span>
                <span>{match.team2} (4-2-3-1)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-neutral-300">
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#38bdf8]">Starting XI:</p>
                  <p>1. Silva (GK)</p>
                  <p>3. Santos, 4. Rocha, 2. Gomes, 5. Pinto</p>
                  <p>8. Costa, 6. Ramos, 10. Teixeira</p>
                  <p>7. Martins, 9. Oliveira, 11. Fernandes</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-400">Starting XI:</p>
                  <p>12. Ferreira (GK)</p>
                  <p>2. Alves, 14. Carvalho, 4. Sousa, 3. Ribeiro</p>
                  <p>6. Vieira, 8. Monteiro</p>
                  <p>11. Lopes, 10. Pereira, 7. Neves</p>
                  <p>9. Barbosa</p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'standings' && (
            <div className="w-full mt-2 p-3 bg-[#0d2238] rounded-md border border-[#204975] text-xs animate-in fade-in">
              <div className="font-bold text-neutral-200 border-b border-[#204975] pb-1">
                {match.league} - Standings
              </div>
              <div className="divide-y divide-white/5 pt-1">
                <div className="flex justify-between py-1 font-bold text-[#a3e635]">
                  <span>1. {match.team1}</span>
                  <span>4 MP · 10 PTS</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-300">
                  <span>2. Famalicão U23</span>
                  <span>4 MP · 8 PTS</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-300">
                  <span>3. {match.team2}</span>
                  <span>4 MP · 7 PTS</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-400">
                  <span>4. Farense U23</span>
                  <span>4 MP · 5 PTS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
