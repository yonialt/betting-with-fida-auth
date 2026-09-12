import React, { useState } from 'react';
import {
  WEATHER_CITY_MARKETS,
  WeatherCityMarket,
  WEATHER_EVENT_MARKETS,
  WeatherEventMarket,
} from '../../../data/polymarketExtendedData';
import { PolymarketTradeState } from '../../../types/polymarket';
import {
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe2,
  Flame,
  CloudRain,
  Compass,
  AlertTriangle,
  Waves,
} from 'lucide-react';

interface PolymarketWeatherViewProps {
  onSelectOutcome: (trade: PolymarketTradeState) => void;
  isDarkMode?: boolean;
}

type WeatherSelection =
  | {
      type: 'city';
      market: WeatherCityMarket;
      optionIndex: number;
    }
  | {
      type: 'event';
      market: WeatherEventMarket;
    };

export const PolymarketWeatherView: React.FC<PolymarketWeatherViewProps> = ({
  onSelectOutcome,
  isDarkMode = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Temperature');
  const [activeDatePill, setActiveDatePill] = useState<string>('Sep 7');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<WeatherSelection>({
    type: 'city',
    market: WEATHER_CITY_MARKETS[0],
    optionIndex: 0,
  });
  const [orderSide, setOrderSide] = useState<'Yes' | 'No'>('Yes');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [tradeAmount, setTradeAmount] = useState<string>('50');
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);

  const categories = [
    { name: 'All', count: WEATHER_CITY_MARKETS.length + WEATHER_EVENT_MARKETS.length, icon: Globe2 },
    { name: 'Ethiopia 🇪🇹', count: 28, icon: Thermometer },
    { name: 'Horn of Africa', count: 15, icon: CloudRain },
    { name: 'Temperature', count: WEATHER_CITY_MARKETS.length, icon: Thermometer },
    {
      name: 'Precipitation',
      count: WEATHER_EVENT_MARKETS.filter((m) => m.category === 'Precipitation').length,
      icon: CloudRain,
    },
    {
      name: 'Drought',
      count: WEATHER_EVENT_MARKETS.filter((m) => m.category === 'Drought').length,
      icon: Droplets,
    },
    {
      name: 'Global',
      count: WEATHER_EVENT_MARKETS.filter((m) => m.category === 'Global').length,
      icon: Globe2,
    },
    {
      name: 'Hurricanes',
      count: WEATHER_EVENT_MARKETS.filter((m) => m.category === 'Hurricanes').length,
      icon: Wind,
    },
    {
      name: 'Tornadoes',
      count: WEATHER_EVENT_MARKETS.filter((m) => m.category === 'Tornadoes').length,
      icon: Compass,
    },
    {
      name: 'Earthquakes',
      count: WEATHER_EVENT_MARKETS.filter((m) => m.category === 'Earthquakes').length,
      icon: Waves,
    },
  ];

  const datePills = ['Globe', 'Sep 6', 'Sep 7', 'Sep 8', '2026 Season'];

  // Filtering cities
  const filteredCities = WEATHER_CITY_MARKETS.filter((city) => {
    if (activeCategory !== 'All' && activeCategory !== 'Temperature') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        city.city.toLowerCase().includes(q) ||
        city.options.some((o) => o.temp.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtering event markets
  const filteredEvents = WEATHER_EVENT_MARKETS.filter((evt) => {
    if (activeCategory !== 'All' && evt.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        evt.title.toLowerCase().includes(q) ||
        evt.region.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Active pricing calculations for right trade panel
  let activeTitle = '';
  let activeSubtitle = '';
  let activeYesPrice = 50;
  let activeNoPrice = 50;
  let activeProbability = 50;

  if (selectedTarget.type === 'city') {
    const opt = selectedTarget.market.options[selectedTarget.optionIndex] || selectedTarget.market.options[0];
    activeTitle = `${selectedTarget.market.city} ${opt.temp}?`;
    activeSubtitle = `${selectedTarget.market.city} · ${selectedTarget.market.date} · Daily High`;
    activeYesPrice = opt.yesPrice;
    activeNoPrice = opt.noPrice;
    activeProbability = opt.probability;
  } else {
    activeTitle = selectedTarget.market.title;
    activeSubtitle = `${selectedTarget.market.region} · Closes ${selectedTarget.market.endsDate}`;
    activeYesPrice = selectedTarget.market.yesPrice;
    activeNoPrice = selectedTarget.market.noPrice;
    activeProbability = selectedTarget.market.chance;
  }

  const activePriceCents = orderSide === 'Yes' ? activeYesPrice : activeNoPrice;
  const priceInDollars = activePriceCents / 100;
  const numAmount = parseFloat(tradeAmount) || 0;
  const estimatedShares = priceInDollars > 0 ? Math.floor(numAmount / priceInDollars) : 0;
  const potentialPayout = (estimatedShares * 1.0).toFixed(2);

  const handlePlaceOrder = () => {
    setOrderConfirmed(true);
    setTimeout(() => setOrderConfirmed(false), 2500);

    if (selectedTarget.type === 'city') {
      const opt = selectedTarget.market.options[selectedTarget.optionIndex] || selectedTarget.market.options[0];
      onSelectOutcome({
        market: {
          id: selectedTarget.market.id,
          title: `${selectedTarget.market.city} Daily Temp (${selectedTarget.market.date})`,
          category: 'Weather',
          subcategory: 'Temperature',
          volume: selectedTarget.market.volume,
          outcomes: selectedTarget.market.options.map((o) => ({
            name: o.temp,
            probability: o.probability,
            yesPrice: o.yesPrice,
            noPrice: o.noPrice,
          })),
        },
        outcomeName: opt.temp,
        selectedSide: orderSide.toLowerCase() as 'yes' | 'no',
        price: priceInDollars,
      });
    } else {
      onSelectOutcome({
        market: {
          id: selectedTarget.market.id,
          title: selectedTarget.market.title,
          category: 'Weather',
          subcategory: selectedTarget.market.category,
          volume: selectedTarget.market.volume,
          outcomes: [
            { name: 'Yes', probability: selectedTarget.market.chance, yesPrice: selectedTarget.market.yesPrice, noPrice: selectedTarget.market.noPrice },
            { name: 'No', probability: 100 - selectedTarget.market.chance, yesPrice: selectedTarget.market.noPrice, noPrice: selectedTarget.market.yesPrice },
          ],
        },
        outcomeName: orderSide,
        selectedSide: orderSide.toLowerCase() as 'yes' | 'no',
        price: priceInDollars,
      });
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-4 text-white space-y-6">
      {/* 1. Weather Ticker & Oracle Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1728] via-[#111e33] to-[#0a121e] border border-[#1e2f47] p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🌦️</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold tracking-wide">
                GLOBAL WEATHER & CLIMATE MARKETS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
                ● NOAA / EMI ORACLE FEED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Trade Temperature Forecasts, Monsoon Rains, & Climate Milestones
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
              Decentralized prediction contracts settled against official meteorological stations worldwide—including Addis Ababa Bole Airport, Lake Tana, Central Park, London Heathrow, and Tokyo Haneda.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap md:flex-col lg:flex-row gap-3 text-xs shrink-0">
            <div className="p-2.5 rounded-xl bg-[#090e17]/80 border border-[#1b273b] min-w-[130px]">
              <div className="text-neutral-400 text-[10px] uppercase font-mono">Global Anomaly</div>
              <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">+1.48°C vs Base</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090e17]/80 border border-[#1b273b] min-w-[130px]">
              <div className="text-neutral-400 text-[10px] uppercase font-mono">Highlands Kiremt</div>
              <div className="text-blue-400 font-bold font-mono text-sm mt-0.5">Surplus (+8.2%)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090e17]/80 border border-[#1b273b] min-w-[130px]">
              <div className="text-neutral-400 text-[10px] uppercase font-mono">ENSO Status</div>
              <div className="text-amber-400 font-bold font-mono text-sm mt-0.5">La Niña Watch (72%)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Categories */}
        <aside className="w-full lg:w-56 shrink-0 space-y-2">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-3 flex items-center justify-between">
            <span>Weather Sectors</span>
            <CloudSun className="w-3.5 h-3.5 text-neutral-500" />
          </div>

          <div className="space-y-1">
            {categories.map((item) => {
              const isActive = activeCategory === item.name;
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveCategory(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-neutral-300 hover:text-white hover:bg-[#121926] border border-transparent hover:border-[#1d2738]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{item.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-blue-800 text-white' : 'bg-[#151d2a] text-neutral-400'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Ethiopia Weather Tag Banner */}
          <div
            onClick={() => setSearchQuery('Ethiopia')}
            className="mt-4 p-3 rounded-xl bg-gradient-to-br from-[#121f18] to-[#121926] border border-emerald-900/40 hover:border-emerald-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>🇪🇹</span>
              <span>Ethiopia Climate Hub</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug group-hover:text-neutral-200">
              Click to view all Ethiopian weather, Lake Tana, Kiremt rain, and temperature contracts.
            </p>
          </div>
        </aside>

        {/* Center Grid: Weather City Cards & Event Markets */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{activeCategory === 'All' ? 'All Weather Predictions' : `${activeCategory} Markets`}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE TRADING
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

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities (Addis Ababa, Tokyo, London), Kiremt rain, Lake Tana, hurricanes, drought..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101520] border border-[#1d2738] text-white placeholder:text-neutral-500 text-sm focus:border-blue-500 outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded-md bg-[#1a2130]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Section A: City Temperature Cards */}
          {filteredCities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  Daily Metropolitan Temperature Brackets ({filteredCities.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredCities.map((cityMkt) => {
                  const isCitySelected =
                    selectedTarget.type === 'city' && selectedTarget.market.id === cityMkt.id;

                  return (
                    <div
                      key={cityMkt.id}
                      onClick={() =>
                        setSelectedTarget({
                          type: 'city',
                          market: cityMkt,
                          optionIndex: 0,
                        })
                      }
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isCitySelected
                          ? 'bg-[#141d2c] border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-[#101622] border-[#1b2536] hover:border-[#26374e]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                          <span className="font-bold text-white text-base truncate pr-1">
                            {cityMkt.city}
                          </span>
                          <span className="font-mono text-neutral-400 text-[11px] shrink-0">
                            {cityMkt.date}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-400 mb-3">
                          Daily maximum officially certified station temperature
                        </div>

                        {/* Temperature outcome bars */}
                        <div className="space-y-1.5">
                          {cityMkt.options.map((opt, i) => {
                            const isThisOption =
                              isCitySelected && selectedTarget.optionIndex === i;

                            return (
                              <div
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTarget({
                                    type: 'city',
                                    market: cityMkt,
                                    optionIndex: i,
                                  });
                                }}
                                className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                  isThisOption
                                    ? 'bg-blue-950/40 border-blue-500 text-white'
                                    : 'bg-[#0b1018] border-[#1b2536] hover:border-neutral-700 text-neutral-300'
                                }`}
                              >
                                <span className="font-bold text-white font-mono">{opt.temp}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-semibold text-neutral-300">
                                    {opt.probability}%
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-600/30 text-blue-300 font-mono font-bold text-[11px]">
                                    {opt.yesPrice}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2.5 mt-3 border-t border-[#1a2333] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>{cityMkt.volume}</span>
                        <span className="text-blue-400 font-semibold group-hover:underline">
                          Select & Trade →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section B: Weather Event Markets (Rainfall, Drought, Hurricanes, Global) */}
          {filteredEvents.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  Seasonal Weather, Monsoon, & Climate Contracts ({filteredEvents.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredEvents.map((eventMkt) => {
                  const isEventSelected =
                    selectedTarget.type === 'event' && selectedTarget.market.id === eventMkt.id;

                  return (
                    <div
                      key={eventMkt.id}
                      onClick={() =>
                        setSelectedTarget({
                          type: 'event',
                          market: eventMkt,
                        })
                      }
                      className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isEventSelected
                          ? 'bg-[#141d2c] border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-[#101622] border-[#1b2536] hover:border-[#26374e]'
                      }`}
                    >
                      <div>
                        {/* Top Tag & Region */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#16202f] border border-[#233247] text-neutral-300 font-semibold text-[11px]">
                            {eventMkt.region}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {eventMkt.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[14px] text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-3">
                          {eventMkt.title}
                        </h3>

                        {/* Binary Yes / No Quick Buttons */}
                        <div className="grid grid-cols-2 gap-2 my-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTarget({ type: 'event', market: eventMkt });
                              setOrderSide('Yes');
                            }}
                            className="p-2 rounded-xl bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 flex flex-col items-center justify-center transition-all cursor-pointer"
                          >
                            <span className="text-[10px] font-bold uppercase">YES</span>
                            <span className="text-base font-extrabold font-mono">{eventMkt.chance}%</span>
                            <span className="text-[10px] text-neutral-400 font-mono">Buy {eventMkt.yesPrice}%</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTarget({ type: 'event', market: eventMkt });
                              setOrderSide('No');
                            }}
                            className="p-2 rounded-xl bg-red-950/20 hover:bg-red-900/30 border border-red-800/40 text-red-400 flex flex-col items-center justify-center transition-all cursor-pointer"
                          >
                            <span className="text-[10px] font-bold uppercase">NO</span>
                            <span className="text-base font-extrabold font-mono">{100 - eventMkt.chance}%</span>
                            <span className="text-[10px] text-neutral-400 font-mono">Buy {eventMkt.noPrice}%</span>
                          </button>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2.5 mt-2 border-t border-[#1a2333] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>{eventMkt.volume}</span>
                        <span>Closes {eventMkt.endsDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredCities.length === 0 && filteredEvents.length === 0 && (
            <div className="text-center py-12 rounded-2xl bg-[#0e131d] border border-[#1b2332] p-8">
              <p className="text-neutral-300 font-semibold text-base mb-1">
                No weather markets match your filter
              </p>
              <p className="text-neutral-500 text-xs mb-4">
                Try searching for "Addis Ababa", "Rainfall", "Lake Tana", "Mead", or click "All".
              </p>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Weather Trade Slip */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20 rounded-3xl bg-[#101622] border border-[#1b2536] p-5 space-y-4 shadow-xl">
            <div>
              <div className="text-xs font-mono text-neutral-400 truncate">
                {activeSubtitle}
              </div>
              <h3 className="font-bold text-base text-white mt-1 leading-snug">
                {activeTitle}
              </h3>
            </div>

            {/* Buy / Sell & Order Type */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0b1018] border border-[#1b2536]">
              <button
                onClick={() => setOrderSide('Yes')}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'Yes'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Yes {activeYesPrice}%
              </button>
              <button
                onClick={() => setOrderSide('No')}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  orderSide === 'No'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                No {activeNoPrice}%
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Amount (USDC)</span>
                <span className="font-mono">1,250 ETB balance</span>
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
                    {val} ETB
                  </button>
                ))}
              </div>
            </div>

            {/* Payout calculation */}
            <div className="p-3 rounded-xl bg-[#0b1018] border border-[#1b2536] space-y-1.5 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Outcome Probability</span>
                <span className="font-mono text-white font-bold">{activeProbability}%</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shares</span>
                <span className="font-mono text-white font-bold">{estimatedShares}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-200 pt-2 border-t border-[#1b2536]">
                <span>Potential Payout</span>
                <span className="font-mono text-emerald-400 font-extrabold">{potentialPayout} ETB</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {orderConfirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Weather Trade Confirmed!</span>
                </>
              ) : (
                <span>Place Order · {orderSide}</span>
              )}
            </button>

            <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Instant settlement via UMA Optimistic Oracle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
