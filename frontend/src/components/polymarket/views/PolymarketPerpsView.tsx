import React, { useState } from 'react';
import { PERP_TOKENS, PerpToken } from '../../../data/polymarketExtendedData';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  X,
  CheckCircle,
  HelpCircle,
  Shield,
  Zap,
  BarChart3,
} from 'lucide-react';
import { PerpsChartPanel } from '../PerpsChartPanel';

export const PolymarketPerpsView: React.FC<{ isDarkMode?: boolean }> = ({
  isDarkMode = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedToken, setSelectedToken] = useState<PerpToken | null>(null);
  const [chartToken, setChartToken] = useState<PerpToken | null>(null);
  const [tradeSide, setTradeSide] = useState<'Long' | 'Short'>('Long');
  const [leverage, setLeverage] = useState<number>(5);
  const [tradeAmount, setTradeAmount] = useState<string>('100');
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [comingSoonDismissed, setComingSoonDismissed] = useState<boolean>(false);

  const categories = [
    { name: 'All', count: 47 },
    { name: 'Stocks', count: 36 },
    { name: 'Crypto', count: 24 },
    { name: 'Indices', count: 3 },
    { name: 'Commodities', count: 4 },
  ];

  const filteredTokens =
    activeCategory === 'All'
      ? PERP_TOKENS
      : PERP_TOKENS.filter(
          (t) => t.category.toLowerCase() === activeCategory.toLowerCase()
        );

  const handleOpenTrade = (token: PerpToken, side: 'Long' | 'Short') => {
    setSelectedToken(token);
    setTradeSide(side);
    setOrderConfirmed(false);
  };

  const handleOpenChart = (token: PerpToken) => {
    setChartToken(token);
  };

  if (chartToken) {
    return (
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
        <PerpsChartPanel token={chartToken} onBack={() => setChartToken(null)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white relative">
      {/* Coming Soon Blur Overlay */}
      {!comingSoonDismissed && (
        <div className="absolute inset-0 z-20 flex items-start justify-center pt-12 backdrop-blur-md bg-black/40 rounded-2xl">
          <div className="bg-[#101622] border border-[#26364e] rounded-2xl px-8 py-6 text-center shadow-2xl max-w-sm mx-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Coming Soon</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Perpetuals trading is under construction. Stay tuned for up to 20x leverage on crypto, stocks, and commodities.
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Under Development
            </div>
            <button
              onClick={() => setComingSoonDismissed(true)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Categories (from video 00:32) */}
        <aside className="w-full lg:w-52 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Markets
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a2536] text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#121926]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-[#223147] text-neutral-200' : 'text-neutral-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Grid: Perp Token Cards */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Perpetuals</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Up to 20x Leverage
                </span>
              </h2>
              <div className="text-xs text-neutral-400 mt-0.5">
                Trade crypto, equities, and commodities perpetuals with deep liquidity
              </div>
            </div>
          </div>

          {/* Tokens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredTokens.map((token) => (
              <div
                key={token.symbol}
                onClick={() => handleOpenChart(token)}
                className="p-4 rounded-2xl bg-[#101622] border border-[#1b2536] hover:border-[#26364e] transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Token Header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      {token.logoUrl ? (
                        <img
                          src={token.logoUrl}
                          alt={token.symbol}
                          className="w-7 h-7 rounded-full object-contain shadow-sm"
                          style={{ backgroundColor: token.logoBg }}
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                          style={{ backgroundColor: token.logoBg }}
                        >
                          {token.symbol.slice(0, 3)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-white">{token.symbol}</div>
                        <div className="text-[10px] text-neutral-400">{token.category}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LIVE
                    </span>
                  </div>

                  {/* Price & Change */}
                  <div className="my-2">
                    <div className="font-mono font-bold text-lg text-white">
                      {token.price}
                    </div>
                    <div
                      className={`text-xs font-mono font-medium flex items-center gap-1 ${
                        token.positive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {token.positive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>{token.change}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Chart button, Long / Short & Volume */}
                <div className="pt-3 border-t border-[#1a2435] mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenChart(token); }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 font-bold text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Charts
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenTrade(token, 'Long'); }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Long
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenTrade(token, 'Short'); }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Short
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-500 text-right">
                    {token.volume}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leverage Trading Modal */}
      {selectedToken && (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm ${isDarkMode ? 'bg-black/70' : 'bg-black/50'}`} onClick={() => setSelectedToken(null)}>
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl relative ${isDarkMode ? 'bg-[#101622] border-[#222f42]' : 'bg-white border-neutral-200'}`} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedToken(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a2538] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2.5 mb-4">
              {selectedToken.logoUrl ? (
                <img
                  src={selectedToken.logoUrl}
                  alt={selectedToken.symbol}
                  className="w-8 h-8 rounded-full object-contain"
                  style={{ backgroundColor: selectedToken.logoBg }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: selectedToken.logoBg }}
                >
                  {selectedToken.symbol.slice(0, 3)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-base text-white">
                  {tradeSide} {selectedToken.symbol}-PERP
                </h3>
                <div className="text-xs text-neutral-400 font-mono">
                  Current: {selectedToken.price}
                </div>
              </div>
            </div>

            {/* Side Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0b1018] border border-[#1b2536] mb-4">
              <button
                onClick={() => setTradeSide('Long')}
                className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  tradeSide === 'Long'
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Long
              </button>
              <button
                onClick={() => setTradeSide('Short')}
                className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  tradeSide === 'Short'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Short
              </button>
            </div>

            {/* Leverage Slider (1x - 20x) */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Leverage</span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {leverage}x
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1a2538] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
                <span>15x</span>
                <span>20x</span>
              </div>
            </div>

            {/* Order Size Input */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Margin (USDC)</span>
                <span>Balance: 1,250.00 ETB</span>
              </div>
              <div className="flex items-center px-3 py-2 rounded-xl bg-[#0b1018] border border-[#1f2c40]">
                <span className="text-neutral-400 font-mono text-sm mr-2">$</span>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full bg-transparent font-mono text-white text-sm outline-hidden font-bold"
                />
              </div>
            </div>

            {/* Position Details */}
            <div className="p-3 rounded-xl bg-[#0b1018] border border-[#1b2536] space-y-1.5 text-xs text-neutral-400 mb-5">
              <div className="flex justify-between">
                <span>Position Size</span>
                <span className="font-mono font-bold text-white">
                  {((parseFloat(tradeAmount) || 0) * leverage).toFixed(2)} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Est. Liquidation Price</span>
                <span className="font-mono text-amber-400">
                  {tradeSide === 'Long' ? '5% below entry' : '5% above entry'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trading Fee (0.05%)</span>
                <span className="font-mono text-neutral-400">
                  {(((parseFloat(tradeAmount) || 0) * leverage * 0.0005)).toFixed(2)} ETB
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                setOrderConfirmed(true);
                setTimeout(() => {
                  setOrderConfirmed(false);
                  setSelectedToken(null);
                }, 2000);
              }}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                tradeSide === 'Long'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
              }`}
            >
              {orderConfirmed
                ? 'Order Placed Successfully!'
                : `Place ${tradeSide} Order (${leverage}x)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
