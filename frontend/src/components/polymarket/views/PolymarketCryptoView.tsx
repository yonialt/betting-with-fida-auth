import React, { useState, useEffect } from 'react';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Repeat2,
  Gift,
  Search,
} from 'lucide-react';
import { PolymarketCryptoLiveChart } from '../PolymarketCryptoLiveChart';

interface Crypto5MinMarket {
  symbol: string;
  name: string;
  priceToBeat: number;
  currentPrice: number;
  upMultiplier: string;
  downMultiplier: string;
  volume: string;
  color: string;
  logoUrl?: string;
}

export const PolymarketCryptoView: React.FC<{
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onSelectOutcome, isDarkMode = true }) => {
  const [activeInterval, setActiveInterval] = useState<string>('5 Min');
  const [activeFilterPill, setActiveFilterPill] = useState<string>('All');
  const [countdownSecs, setCountdownSecs] = useState<number>(233); // 3:53
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto5MinMarket | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdownSecs((s) => (s > 0 ? s - 1 : 300));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const intervals = [
    { name: 'All', count: 311 },
    { name: 'Ethiopia 🇪🇹', count: 24 },
    { name: '5 Min', count: 8 },
    { name: '15 Min', count: 8 },
    { name: '1 Hour', count: 9 },
    { name: '4 Hours', count: 8 },
    { name: 'Daily', count: 11 },
    { name: 'Weekly', count: 61 },
    { name: 'Monthly', count: 23 },
    { name: 'Yearly', count: 27 },
    { name: 'Targets', count: 34 },
    { name: 'Pre-Market', count: 134 },
    { name: 'Institutions', count: 22 },
  ];

  const filterPills = [
    'All',
    'Up / Down',
    'Above / Below',
    'Price Range',
    'Hit Price',
  ];

  const shortTermMarkets: Crypto5MinMarket[] = [
    { symbol: 'BTC', name: 'Bitcoin', priceToBeat: 79829, currentPrice: 79834, upMultiplier: 'UP 2.74X', downMultiplier: 'DOWN 1.57X', volume: '11M ETB Vol.', color: '#f59e0b', logoUrl: '/bitcoincrypot.jpg' },
    { symbol: 'ETH', name: 'Ethereum', priceToBeat: 2492.5, currentPrice: 2491.8, upMultiplier: 'UP 1.88X', downMultiplier: 'DOWN 2.12X', volume: '4.2M ETB Vol.', color: '#627eea', logoUrl: '/ETHcoincrypot.jpg' },
    { symbol: 'SOL', name: 'Solana', priceToBeat: 106.4, currentPrice: 106.6, upMultiplier: 'UP 2.05X', downMultiplier: 'DOWN 1.94X', volume: '3.8M ETB Vol.', color: '#14b8a6', logoUrl: '/solcrypot.jpg' },
    { symbol: 'XRP', name: 'XRP', priceToBeat: 0.584, currentPrice: 0.585, upMultiplier: 'UP 2.30X', downMultiplier: 'DOWN 1.76X', volume: '1.9M ETB Vol.', color: '#38bdf8', logoUrl: '/xrpcrypot.jpg' },
    { symbol: 'DOGE', name: 'Dogecoin', priceToBeat: 0.0891, currentPrice: 0.0890, upMultiplier: 'UP 1.95X', downMultiplier: 'DOWN 2.05X', volume: '1.4M ETB Vol.', color: '#eab308', logoUrl: '/dogecrypot.jpg' },
    { symbol: 'HYPE', name: 'Hyperliquid', priceToBeat: 87.89, currentPrice: 88.02, upMultiplier: 'UP 2.50X', downMultiplier: 'DOWN 1.66X', volume: '2.1M ETB Vol.', color: '#ec4899', logoUrl: '/hypecrypot.jpg' },
    { symbol: 'BNB', name: 'BNB', priceToBeat: 747.98, currentPrice: 748.20, upMultiplier: 'UP 1.82X', downMultiplier: 'DOWN 2.20X', volume: '1.2M ETB Vol.', color: '#f59e0b', logoUrl: '/bnbcrypot.jpg' },
    { symbol: 'ZEC', name: 'Zcash', priceToBeat: 1213.3, currentPrice: 1215.1, upMultiplier: 'UP 3.10X', downMultiplier: 'DOWN 1.45X', volume: '980K ETB Vol.', color: '#10b981', logoUrl: '/zcacrypot.jpg' },
  ];

  if (selectedCrypto) {
    return (
      <PolymarketCryptoLiveChart
        crypto={selectedCrypto}
        onBack={() => setSelectedCrypto(null)}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Intervals (from video 01:07) */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Crypto
          </div>

          <div className="space-y-0.5">
            {intervals.map((item) => {
              const isActive = activeInterval === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveInterval(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a2536] text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#121926]'
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#223147] text-neutral-200' : 'text-neutral-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{activeInterval} Crypto Markets</span>
              </h2>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {filterPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActiveFilterPill(pill)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilterPill === pill
                      ? 'bg-white text-neutral-950 font-bold'
                      : 'bg-[#121824] hover:bg-[#1a2333] text-neutral-400 hover:text-white border border-[#1d2738]'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Short Term Up/Down Cards (matching video 01:08) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {shortTermMarkets.map((m) => (
              <div
                key={m.symbol}
                onClick={() => setSelectedCrypto(m)}
                title="Open live chart"
                className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#25344c] transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Symbol Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {m.logoUrl ? (
                        <img
                          src={m.logoUrl}
                          alt={m.symbol}
                          className="w-7 h-7 rounded-full object-contain shadow-sm"
                          style={{ backgroundColor: m.color }}
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.symbol.slice(0, 3)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-white">{m.symbol}</div>
                        <div className="text-[10px] text-neutral-400">{m.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Prices box */}
                  <div className="p-2.5 rounded-xl bg-[#0b1018] border border-[#1a2434] space-y-1 mb-3 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Price to Beat</span>
                      <span className="font-mono text-white font-semibold">
                        {m.priceToBeat.toLocaleString()} ETB
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Current Price</span>
                      <span
                        className={`font-mono font-bold ${
                          m.currentPrice >= m.priceToBeat ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {m.currentPrice.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Multiplier buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOutcome({
                          marketId: `crypto-${m.symbol}-up`,
                          outcomeName: `${m.symbol} Up`,
                          price: 52,
                          side: 'yes',
                        });
                      }}
                      className="py-2 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{m.upMultiplier}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOutcome({
                          marketId: `crypto-${m.symbol}-down`,
                          outcomeName: `${m.symbol} Down`,
                          price: 48,
                          side: 'no',
                        });
                      }}
                      className="py-2 px-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{m.downMultiplier}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2.5 mt-3 border-t border-[#1a2333] flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono">{m.volume}</span>
                  <Repeat2 className="w-3.5 h-3.5 text-neutral-500 hover:text-white cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
