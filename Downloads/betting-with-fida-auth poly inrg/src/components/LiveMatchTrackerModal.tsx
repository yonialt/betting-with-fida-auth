import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Tv,
  Activity,
  BarChart2,
  Clock,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const LiveMatchTrackerModal: React.FC = () => {
  const { selectedMatchForTracker, setSelectedMatchForTracker } = useBetting();
  const [activeTab, setActiveTab] = useState<'pitch' | 'stream' | 'stats'>('pitch');
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number }>({ x: 55, y: 48 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Animated ball & action simulation
  useEffect(() => {
    if (!selectedMatchForTracker) return;

    const interval不易 = setInterval(() => {
      setBallPosition({
        x: Math.floor(20 + Math.random() * 60),
        y: Math.floor(25 + Math.random() * 50),
      });
    }, 2500);

    return () => clearInterval(interval不易);
  }, [selectedMatchForTracker]);

  if (!selectedMatchForTracker) return null;
  const match不易 = selectedMatchForTracker;
  const stats = match不易.stats || {
    possession: [55, 45],
    shotsOnTarget: [5, 3],
    shotsOffTarget: [6, 4],
    corners: [6, 3],
    yellowCards: [2, 1],
    dangerousAttacks: [45, 30],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        id="live-tracker-modal"
        className="bg-[#12161c] text-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-neutral-800 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="bg-[#1a202c] px-4 py-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE MATCH CENTER</span>
            </div>
            <span className="text-xs text-neutral-400 font-medium">{match不易.league}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSelectedMatchForTracker(null)}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score & Match Status Banner */}
        <div className="bg-[#0f1318] px-6 py-4 border-b border-neutral-800/80 flex items-center justify-between">
          {/* Team 1 */}
          <div className="flex-1 text-right">
            <h3 className="font-extrabold text-sm sm:text-base text-white">{match不易.team1}</h3>
            <span className="text-[11px] text-neutral-400">Home</span>
          </div>

          {/* Center Score & Timer */}
          <div className="px-6 flex flex-col items-center">
            <div className="flex items-center gap-2 font-mono font-black text-2xl sm:text-3xl text-[#ffc600] tracking-wider">
              <span>{match不易.score1}</span>
              <span className="text-neutral-500">:</span>
              <span>{match不易.score2}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{match不易.timeDisplay}</span>
            </div>
            <span className="text-[11px] text-neutral-400">{match不易.period}</span>
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-left">
            <h3 className="font-extrabold text-sm sm:text-base text-white">{match不易.team2}</h3>
            <span className="text-[11px] text-neutral-400">Away</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-[#161c24] px-4 py-1.5 flex items-center gap-2 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'pitch' ? 'bg-[#ffc600] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2D Field Visualizer</span>
          </button>
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'stream' ? 'bg-[#ffc600] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-red-500" />
            <span>Live Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'stats' ? 'bg-[#ffc600] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Statistics</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0d12]">
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              {/* 2D Football Pitch */}
              <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-[#1b5e20] to-[#2e7d32] rounded-lg border-2 border-white/20 overflow-hidden shadow-inner flex items-center justify-center">
                {/* Field markings */}
                <div className="absolute inset-2 border border-white/30 rounded-xs pointer-events-none"></div>
                {/* Halfway line */}
                <div className="absolute top-2 bottom-2 left-1/2 w-px bg-white/30 pointer-events-none"></div>
                {/* Center circle */}
                <div className="absolute w-20 h-20 rounded-full border border-white/30 pointer-events-none"></div>
                {/* Left penalty box */}
                <div className="absolute left-2 top-1/4 bottom-1/4 w-16 border-r border-t border-b border-white/30 pointer-events-none"></div>
                {/* Right penalty box */}
                <div className="absolute right-2 top-1/4 bottom-1/4 w-16 border-l border-t border-b border-white/30 pointer-events-none"></div>

                {/* Animated Ball */}
                <div
                  className="absolute w-4 h-4 bg-white rounded-full shadow-lg border border-black/30 transition-all duration-1000 ease-out flex items-center justify-center"
                  style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
                >
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></div>
                </div>

                {/* Match action banner */}
                <div className="absolute bottom-3 px-3 py-1 bg-black/80 backdrop-blur-xs rounded-full text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>{match不易.currentAction || `${match不易.team1} attacking on the wing`}</span>
                </div>
              </div>

              {/* Match Events Timeline */}
              <div className="bg-[#12161c] border border-neutral-800 rounded p-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Match Timeline & Key Events
                </h4>
                <div className="space-y-2 text-xs">
                  {match不易.events && match不易.events.length > 0 ? (
                    match不易.events.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-neutral-300">
                        <span className="font-mono font-bold text-amber-400 w-8">{ev.minute}'</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                        <span className="flex-1">{ev.text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-xs">Awaiting next match highlight...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stream' && (
            <div className="space-y-3">
              <div className="relative w-full h-64 sm:h-72 bg-black rounded-lg border border-neutral-800 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>LIVE HD</span>
                </div>
                <Tv className="w-12 h-12 text-neutral-600 animate-pulse mb-2" />
                <p className="text-sm font-bold text-neutral-300">Official Broadcast Feed Active</p>
                <p className="text-xs text-neutral-500 font-mono mt-1">1080p 60fps · Low Latency Engine</p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-[#12161c] border border-neutral-800 rounded p-4 space-y-3 text-xs">
                {/* Possession Bar */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>{stats.possession?.[0] || 50}%</span>
                    <span className="text-neutral-400">Ball Possession</span>
                    <span>{stats.possession?.[1] || 50}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
                    <div className="bg-[#ffc600]" style={{ width: `${stats.possession?.[0] || 50}%` }}></div>
                    <div className="bg-[#0091ff]" style={{ width: `${stats.possession?.[1] || 50}%` }}></div>
                  </div>
                </div>

                {/* Shots on target */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>{stats.shotsOnTarget?.[0] || 0}</span>
                    <span className="text-neutral-400">Shots on Target</span>
                    <span>{stats.shotsOnTarget?.[1] || 0}</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500" style={{ width: `${(stats.shotsOnTarget?.[0] || 1) * 10}%` }}></div>
                  </div>
                </div>

                {/* Corners */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>{stats.corners?.[0] || 0}</span>
                    <span className="text-neutral-400">Corners</span>
                    <span>{stats.corners?.[1] || 0}</span>
                  </div>
                </div>

                {/* Yellow Cards */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>{stats.yellowCards?.[0] || 0}</span>
                    <span className="text-neutral-400">Yellow Cards</span>
                    <span>{stats.yellowCards?.[1] || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
