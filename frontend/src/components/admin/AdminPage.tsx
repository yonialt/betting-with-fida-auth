import React from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  Server,
  Database,
  ExternalLink,
  RefreshCw,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';
import { ApiFootballRedisModal } from '../ApiFootballRedisModal';

interface AdminPageProps {
  onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  return (
    <div id="admin-page-root" className="min-h-screen bg-[#0a1118] text-neutral-100 flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0f1923] border-b border-neutral-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              id="admin-btn-back-to-site"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-neutral-700 shadow-xs"
              title="Return to Fida Bet Sportsbook"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Betting Site</span>
            </button>

            <div className="h-4 w-px bg-neutral-700 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white tracking-wider uppercase font-mono">
                    FIDA<span className="text-emerald-400">BET</span> ADMIN
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-emerald-300 border border-emerald-500/30">
                    /admin
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
                  Redis Cache Engine · Real-Time Match & Odds Pipeline
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Redis & Express: Online</span>
            </div>

            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="px-3 py-1.5 bg-[#ffc600] hover:bg-[#f0ba00] text-black text-xs font-black rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Go to App</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Info Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#101c27] border border-neutral-800 rounded-lg p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400 uppercase font-semibold">Primary Cache</p>
              <h4 className="text-sm font-bold text-white truncate">Redis Cache-Aside</h4>
              <p className="text-[10px] text-emerald-400 font-mono">&lt; 1.2ms latency</p>
            </div>
          </div>

          <div className="bg-[#101c27] border border-neutral-800 rounded-lg p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400 uppercase font-semibold">Match Feed</p>
              <h4 className="text-sm font-bold text-white truncate">ESPN Public Scoreboard</h4>
              <p className="text-[10px] text-cyan-400 font-mono">100% Free & No API Key</p>
            </div>
          </div>

          <div className="bg-[#101c27] border border-neutral-800 rounded-lg p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400 uppercase font-semibold">Odds Engine</p>
              <h4 className="text-sm font-bold text-white truncate">DraftKings / Caesars</h4>
              <p className="text-[10px] text-amber-400 font-mono">Dynamic 1X2 & Spreads</p>
            </div>
          </div>

          <div className="bg-[#101c27] border border-neutral-800 rounded-lg p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400 uppercase font-semibold">Architecture</p>
              <h4 className="text-sm font-bold text-white truncate">Express + Spring Boot</h4>
              <p className="text-[10px] text-purple-300 font-mono">Dual Backend Ready</p>
            </div>
          </div>
        </div>

        {/* Free Match & Odds API · Redis Cache Engine Main Console */}
        <section id="admin-redis-engine-section" className="w-full">
          <ApiFootballRedisModal isEmbedded={true} />
        </section>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-neutral-800 bg-[#0f1923] py-4 px-6 text-center text-xs text-neutral-500">
        <p>Fida Bet Admin Portal · Route: <code className="text-emerald-400 font-mono font-bold">/admin</code> · Redis Cache Engine Management</p>
      </footer>
    </div>
  );
};
