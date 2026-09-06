import React, { useState } from 'react';
import { WEATHER_CITY_MARKETS, WeatherCityMarket } from '../../../data/polymarketExtendedData';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const PolymarketWeatherView: React.FC<{
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}> = ({ onSelectOutcome, isDarkMode = true }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Temperature');
  const [activeDatePill, setActiveDatePill] = useState<string>('Sep 7');
  const [selectedCity, setSelectedCity] = useState<WeatherCityMarket>(WEATHER_CITY_MARKETS[0]);
  const [orderSide, setOrderSide] = useState<'Yes' | 'No'>('Yes');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [tradeAmount, setTradeAmount] = useState<string>('50');
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);

  const categories = [
    { name: 'All', count: 383 },
    { name: 'Temperature', count: 7 },
    { name: 'Precipitation', count: 8 },
    { name: 'Drought', count: 7 },
    { name: 'Global', count: 40 },
    { name: 'Tornadoes', count: 4 },
    { name: 'Hurricanes', count: 11 },
    { name: 'Earthquakes', count: 19 },
    { name: 'Volcanoes', count: 2 },
    { name: 'Pandemics', count: 14 },
  ];

  const datePills = ['Globe', 'Sep 6', 'Sep 7', 'Sep 8'];

  const activeOption = selectedCity.options[0];
  const activePrice = orderSide === 'Yes' ? activeOption.yesPrice : activeOption.noPrice;

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-5 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Categories (matching video 01:50) */}
        <aside className="w-full lg:w-56 shrink-0 space-y-1">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Weather
          </div>

          <div className="space-y-0.5">
            {categories.map((item) => {
              const isActive = activeCategory === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveCategory(item.name)}
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

        {/* Center Grid: Weather City Cards */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Daily Temperature Forecasts</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  METAR / NOAA
                </span>
              </h2>
            </div>

            {/* Date Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {datePills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActiveDatePill(pill)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeDatePill === pill
                      ? 'bg-white text-neutral-950 font-bold'
                      : 'bg-[#121824] hover:bg-[#1a2333] text-neutral-400 hover:text-white border border-[#1d2738]'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid (matching video 01:51) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {WEATHER_CITY_MARKETS.map((cityMkt) => {
              const isSelected = selectedCity.id === cityMkt.id;
              return (
                <div
                  key={cityMkt.id}
                  onClick={() => setSelectedCity(cityMkt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#141d2c] border-blue-500 shadow-lg'
                      : 'bg-[#101622] border-[#1b2536] hover:border-[#26374e]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                      <span className="font-semibold text-white text-base">
                        {cityMkt.city}
                      </span>
                      <span className="font-mono text-neutral-500 text-[11px]">
                        {cityMkt.date}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 mb-3">
                      Highest recorded daily temperature
                    </div>

                    {/* Temperature outcome bars */}
                    <div className="space-y-1.5">
                      {cityMkt.options.map((opt, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-[#0b1018] border border-[#1b2536] flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-white font-mono">{opt.temp}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-neutral-300">
                              {opt.probability}%
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-blue-600/30 text-blue-300 font-mono font-bold text-[11px]">
                              {opt.yesPrice}¢
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 mt-3 border-t border-[#1a2333] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>{cityMkt.volume}</span>
                    <span className="text-blue-400 font-semibold group-hover:underline">
                      Select City →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Active Weather Trade Slip (from video 01:53) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20 rounded-3xl bg-[#101622] border border-[#1b2536] p-5 space-y-4">
            <div>
              <div className="text-xs font-mono text-neutral-400">
                {selectedCity.city} · {selectedCity.date}
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                {selectedCity.city} {activeOption.temp}?
              </h3>
            </div>

            {/* Buy / Sell & Order Type */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0b1018] border border-[#1b2536]">
              <button
                onClick={() => setOrderSide('Yes')}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'Yes'
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Yes {activeOption.yesPrice}¢
              </button>
              <button
                onClick={() => setOrderSide('No')}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'No'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                No {activeOption.noPrice}¢
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Amount (USDC)</span>
                <span className="font-mono">$1,250 balance</span>
              </div>
              <div className="flex items-center px-3 py-2 rounded-xl bg-[#0b1018] border border-[#1f2c40]">
                <span className="text-neutral-400 font-mono text-sm mr-2">$</span>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full bg-transparent font-mono text-white text-base outline-hidden font-bold"
                />
              </div>

              {/* Presets */}
              <div className="flex gap-1.5 pt-1">
                {['10', '25', '50', '100'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setTradeAmount(val)}
                    className="flex-1 py-1 rounded-lg bg-[#141b27] hover:bg-[#1d2738] border border-[#222e40] text-[11px] font-mono text-neutral-300 font-semibold cursor-pointer"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout calculation */}
            <div className="p-3 rounded-xl bg-[#0b1018] border border-[#1b2536] space-y-1.5 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Estimated Shares</span>
                <span className="font-mono text-white">
                  {Math.round((parseFloat(tradeAmount) || 0) / (activePrice / 100))}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-200 pt-2 border-t border-[#1b2536]">
                <span>Potential Payout</span>
                <span className="font-mono text-emerald-400">
                  ${(((parseFloat(tradeAmount) || 0) / (activePrice / 100)) * 1.0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={() => {
                setOrderConfirmed(true);
                setTimeout(() => setOrderConfirmed(false), 2500);
              }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-lg"
            >
              {orderConfirmed ? 'Weather Trade Placed!' : `Trade ${selectedCity.city}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
