import React, { useState } from 'react';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  Gamepad2,
  TrendingUp,
  Bookmark,
  Repeat2,
  CheckCircle,
  Clock,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface EsportsGame {
  id: string;
  name: string;
  liveCount: number;
}

export const PolymarketEsportsView: React.FC<{
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onSelectOutcome, isDarkMode = true }) => {
  const [activeGame, setActiveGame] = useState<string>('LoL');
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);

  const games: EsportsGame[] = [
    { id: 'cs2', name: 'CS2', liveCount: 11 },
    { id: 'lol', name: 'LoL', liveCount: 19 },
    { id: 'dota2', name: 'Dota 2', liveCount: 1 },
    { id: 'valorant', name: 'Valorant', liveCount: 1 },
    { id: 'r6', name: 'Rainbow Six Siege', liveCount: 1 },
    { id: 'mlbb', name: 'Mobile Legends', liveCount: 0 },
    { id: 'rocket_league', name: 'Rocket League', liveCount: 0 },
    { id: 'overwatch', name: 'Overwatch', liveCount: 0 },
  ];

  const liveTradesTicker = [
    { user: 'KAPWV', action: 'bought', team: 'G2 Esports', price: '71.0%', amount: '2,200 ETB', positive: true },
    { user: '421-Uf1WNFNEW2...', action: 'bought', team: 'G2 Esports', price: '70.0%', amount: '114 ETB', positive: true },
    { user: 'Jesperrr', action: 'sold', team: 'G2 Esports', price: '69.0%', amount: '454 ETB', positive: false },
    { user: 'JFestivel', action: 'bought', team: 'Karmine Corp', price: '31.0%', amount: '850 ETB', positive: true },
  ];

  const matchesList = [
    {
      id: 'lol-g2-kc',
      league: 'League of Legends · LEC Season Finals',
      status: 'Game 4 of 5 · LIVE',
      volume: '3.1M ETB Vol.',
      team1: { name: 'G2 Esports', odds: '70%', prob: 70 },
      team2: { name: 'Karmine Corp', odds: '31%', prob: 31 },
    },
    {
      id: 'dota2-spirit-liquid',
      league: 'Dota 2 · The International',
      status: 'Game 2 · Upcoming',
      volume: '890K ETB Vol.',
      team1: { name: 'Team Spirit', odds: '55%', prob: 55 },
      team2: { name: 'Team Liquid', odds: '45%', prob: 45 },
    },
    {
      id: 'val-fnatic-sentinels',
      league: 'Valorant · Champions Tour',
      status: 'Map 3 Decider',
      volume: '1.2M ETB Vol.',
      team1: { name: 'Fnatic', odds: '61%', prob: 61 },
      team2: { name: 'Sentinels', odds: '39%', prob: 39 },
    },
  ];

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white space-y-6">
      {/* Top Header from Video 01:14 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            <span>Esports | Leaderboard</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Live tournament odds and in-play predictions for major esports titles
          </p>
        </div>
      </div>

      {/* Hero Match: Game 4 of 5 LoL G2 vs Karmine Corp (Video 01:14) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#121a28] via-[#162235] to-[#111926] border border-[#223147] shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-purple-400 font-bold">LEC SEASON FINALS</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Game 4 of 5 · LIVE
            </span>
          </div>

          <div className="font-mono text-xs text-neutral-400">3.1M ETB Vol.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Match Info & Teams (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              G2 Esports vs Karmine Corp
            </h2>

            {/* Interactive Odds Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  onSelectOutcome({
                    marketId: 'lol-g2-kc',
                    outcomeName: 'G2 Esports',
                    price: 70,
                    side: 'yes',
                  })
                }
                className="py-3 px-4 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-sm flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>G2 Esports</span>
                <span className="font-mono text-base font-extrabold">70%</span>
              </button>

              <button
                onClick={() =>
                  onSelectOutcome({
                    marketId: 'lol-g2-kc',
                    outcomeName: 'Karmine Corp',
                    price: 31,
                    side: 'no',
                  })
                }
                className="py-3 px-4 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-sm flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Karmine Corp</span>
                <span className="font-mono text-base font-extrabold">31%</span>
              </button>
            </div>
          </div>

          {/* Live Trades Ticker (5 cols) (Video 01:15) */}
          <div className="md:col-span-5 p-3 rounded-2xl bg-[#0b1018] border border-[#1b2536] space-y-2">
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Live Trade Activity
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {liveTradesTicker.map((trade, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#141d2a] last:border-0"
                >
                  <div className="truncate text-neutral-300 font-medium">
                    <span className="text-white font-bold">{trade.user}</span>{' '}
                    <span className={trade.positive ? 'text-emerald-400' : 'text-red-400'}>
                      {trade.action}
                    </span>{' '}
                    <span className="text-neutral-200">{trade.team}</span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400 shrink-0 ml-2">
                    {trade.amount} ({trade.price})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeGame === g.name
                ? 'bg-white text-neutral-950 font-bold'
                : 'bg-[#121824] hover:bg-[#1a2333] text-neutral-400 hover:text-white border border-[#1d2738]'
            }`}
          >
            <span>{g.name}</span>
            {g.liveCount > 0 && (
              <span className="font-mono text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded-full font-bold">
                {g.liveCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchesList.map((match) => (
          <div
            key={match.id}
            className="p-5 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-white">{match.league}</span>
              <span className="text-emerald-400 font-mono font-bold">{match.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  onSelectOutcome({
                    marketId: match.id,
                    outcomeName: match.team1.name,
                    price: match.team1.prob,
                    side: 'yes',
                  })
                }
                className="p-3 rounded-xl bg-[#141b27] hover:bg-[#1c2738] border border-[#202c3e] text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-neutral-300 truncate">
                  {match.team1.name}
                </div>
                <div className="font-mono text-base font-extrabold text-blue-400 mt-1">
                  {match.team1.odds}
                </div>
              </button>

              <button
                onClick={() =>
                  onSelectOutcome({
                    marketId: match.id,
                    outcomeName: match.team2.name,
                    price: match.team2.prob,
                    side: 'no',
                  })
                }
                className="p-3 rounded-xl bg-[#141b27] hover:bg-[#1c2738] border border-[#202c3e] text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-neutral-300 truncate">
                  {match.team2.name}
                </div>
                <div className="font-mono text-base font-extrabold text-red-400 mt-1">
                  {match.team2.odds}
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-[#1a2333] flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono">{match.volume}</span>
              <Repeat2 className="w-3.5 h-3.5 text-neutral-500 hover:text-white cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
