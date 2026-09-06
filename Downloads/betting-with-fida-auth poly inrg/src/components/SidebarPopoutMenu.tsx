import React, { useState } from 'react';
import {
  ChevronDown,
  Pin,
  PinOff,
  Search,
  Check,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { SportId } from '../types';
import {
  SoccerIcon,
  TennisIcon,
  BasketballIcon,
  HockeyIcon,
  VolleyballIcon,
  TableTennisIcon,
  CricketIcon,
  EsportsIcon,
  AthleticsIcon,
  BadmintonIcon,
  BaseballIcon,
  BeachVolleyIcon,
  BoatRacingIcon,
  HandballIcon,
  HorseRacingIcon,
  MartialArtsIcon,
  MotorsportIcon,
  RugbyIcon,
  SnookerIcon,
  WaterPoloIcon,
} from './SportIcons';

export interface SportMenuEntry {
  id: string;
  name: string;
  count: number;
  sportId?: SportId;
  iconComponent: React.FC<{ className?: string }>;
  subLeagues?: { name: string; count: number }[];
}

export const TOP_SPORTS_LIST: SportMenuEntry[] = [
  {
    id: 'football',
    name: 'Football',
    count: 27,
    sportId: 'football',
    iconComponent: SoccerIcon,
    subLeagues: [
      { name: 'Argentina (4)', count: 4 },
      { name: 'Brazil (5)', count: 5 },
      { name: 'Colombia. Categoria Primera A (1)', count: 1 },
      { name: 'Venezuela. Primera Division (2)', count: 2 },
      { name: 'Bolivia Cup (1)', count: 1 },
      { name: 'Chile. Primera B (1)', count: 1 },
      { name: 'USA. MLS (6)', count: 6 },
      { name: 'Uruguay. Primera Division (1)', count: 1 },
      { name: 'England. Premier League (3)', count: 3 },
      { name: 'Spain. La Liga (3)', count: 3 },
    ],
  },
  {
    id: 'tennis',
    name: 'Tennis',
    count: 12,
    sportId: 'tennis',
    iconComponent: TennisIcon,
    subLeagues: [
      { name: 'ATP. Indian Wells (5)', count: 5 },
      { name: 'WTA. Indian Wells (4)', count: 4 },
      { name: 'Challenger Tour (3)', count: 3 },
    ],
  },
  {
    id: 'basketball',
    name: 'Basketball',
    count: 16,
    sportId: 'basketball',
    iconComponent: BasketballIcon,
    subLeagues: [
      { name: 'NBA. Regular Season (8)', count: 8 },
      { name: 'EuroLeague (4)', count: 4 },
      { name: 'Spain. Liga ACB (4)', count: 4 },
    ],
  },
  {
    id: 'ice-hockey',
    name: 'Ice Hockey',
    count: 1,
    sportId: 'ice-hockey',
    iconComponent: HockeyIcon,
    subLeagues: [
      { name: 'NHL (1)', count: 1 },
    ],
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    count: 11,
    sportId: 'volleyball',
    iconComponent: VolleyballIcon,
    subLeagues: [
      { name: 'CEV Champions League (5)', count: 5 },
      { name: 'Italy. SuperLega (3)', count: 3 },
      { name: 'Brazil. Superliga (3)', count: 3 },
    ],
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    count: 17,
    sportId: 'table-tennis',
    iconComponent: TableTennisIcon,
    subLeagues: [
      { name: 'Setka Cup. Men (8)', count: 8 },
      { name: 'TT Cup. Men (6)', count: 6 },
      { name: 'Czech Liga Pro (3)', count: 3 },
    ],
  },
  {
    id: 'cricket',
    name: 'Cricket',
    count: 7,
    sportId: 'cricket',
    iconComponent: CricketIcon,
    subLeagues: [
      { name: 'Indian Premier League (IPL) (3)', count: 3 },
      { name: 'ICC World Cup Qualifiers (2)', count: 2 },
      { name: 'T20 Blast (2)', count: 2 },
    ],
  },
  {
    id: 'esports',
    name: 'Esports',
    count: 8,
    sportId: 'esports',
    iconComponent: EsportsIcon,
    subLeagues: [
      { name: 'Dota 2. ESL One (3)', count: 3 },
      { name: 'CS2. ESL Pro League (3)', count: 3 },
      { name: 'League of Legends. LCK (2)', count: 2 },
    ],
  },
];

export const ATOZ_SPORTS_LIST: SportMenuEntry[] = [
  {
    id: 'athletics',
    name: 'Athletics',
    count: 3,
    iconComponent: AthleticsIcon,
    subLeagues: [{ name: 'World Athletics Continental Tour (3)', count: 3 }],
  },
  {
    id: 'badminton',
    name: 'Badminton',
    count: 4,
    iconComponent: BadmintonIcon,
    subLeagues: [{ name: 'BWF World Tour (4)', count: 4 }],
  },
  {
    id: 'baseball',
    name: 'Baseball',
    count: 8,
    iconComponent: BaseballIcon,
    subLeagues: [
      { name: 'MLB (5)', count: 5 },
      { name: 'Japan. NPB (3)', count: 3 },
    ],
  },
  {
    id: 'beach-volleyball',
    name: 'Beach Volleyball',
    count: 2,
    iconComponent: BeachVolleyIcon,
    subLeagues: [{ name: 'FIVB Beach Pro Tour (2)', count: 2 }],
  },
  {
    id: 'boat-racing',
    name: 'Boat Racing',
    count: 2,
    iconComponent: BoatRacingIcon,
    subLeagues: [{ name: 'F1H2O World Championship (2)', count: 2 }],
  },
  {
    id: 'fifa',
    name: 'FIFA',
    count: 76,
    sportId: 'esports',
    iconComponent: EsportsIcon,
    subLeagues: [
      { name: 'FIFA 24. eSports Battle (38)', count: 38 },
      { name: 'FIFA. GT Sports League (24)', count: 24 },
      { name: 'FIFA. Cyber Stars (14)', count: 14 },
    ],
  },
  {
    id: 'handball',
    name: 'Handball',
    count: 1,
    iconComponent: HandballIcon,
    subLeagues: [{ name: 'EHF Champions League (1)', count: 1 }],
  },
  {
    id: 'horse-racing',
    name: 'Horse Racing',
    count: 2,
    iconComponent: HorseRacingIcon,
    subLeagues: [
      { name: 'UK. Ascot Live (1)', count: 1 },
      { name: 'Australia. Flemington (1)', count: 1 },
    ],
  },
  {
    id: 'martial-arts',
    name: 'Martial Arts',
    count: 6,
    iconComponent: MartialArtsIcon,
    subLeagues: [
      { name: 'UFC Fight Night (4)', count: 4 },
      { name: 'Bellator MMA (2)', count: 2 },
    ],
  },
  {
    id: 'motorsport',
    name: 'Motorsport',
    count: 3,
    iconComponent: MotorsportIcon,
    subLeagues: [{ name: 'Formula 1. Grand Prix Live (3)', count: 3 }],
  },
  {
    id: 'rugby',
    name: 'Rugby',
    count: 5,
    iconComponent: RugbyIcon,
    subLeagues: [{ name: 'Six Nations (3)', count: 3 }, { name: 'Super Rugby (2)', count: 2 }],
  },
  {
    id: 'snooker',
    name: 'Snooker',
    count: 4,
    iconComponent: SnookerIcon,
    subLeagues: [{ name: 'World Championship (4)', count: 4 }],
  },
  {
    id: 'water-polo',
    name: 'Water Polo',
    count: 2,
    iconComponent: WaterPoloIcon,
    subLeagues: [{ name: 'LEN Champions League (2)', count: 2 }],
  },
];

interface SidebarPopoutMenuProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onClose?: () => void;
}

export const SidebarPopoutMenu: React.FC<SidebarPopoutMenuProps> = ({
  isPinned,
  onTogglePin,
}) => {
  const { activeSport, setActiveSport, setActiveSubTab, setSearchQuery } = useBetting();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    football: true, // Expanded by default like in video
  });
  const [activeMainTab, setActiveMainTab] = useState<'TOP' | 'LIVE' | 'SPORTS'>('LIVE');
  const [activeSubFilter, setActiveSubFilter] = useState<'all' | 'live'>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleSelectSport = (item: SportMenuEntry) => {
    if (item.sportId) {
      setActiveSport(item.sportId);
    } else {
      setActiveSport('all');
      setSearchQuery(item.name);
    }
    setActiveSubTab('matches');
  };

  const handleSelectLeague = (leagueName: string, item: SportMenuEntry) => {
    if (item.sportId) {
      setActiveSport(item.sportId);
    }
    // Clean string from count e.g. "Argentina (4)" -> "Argentina"
    const cleaned = leagueName.replace(/\s*\(\d+\)$/, '');
    setSearchQuery(cleaned);
    setActiveSubTab('matches');
  };

  const filterList = (items: SportMenuEntry[]) => {
    if (!filterSearch.trim()) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.subLeagues?.some((sl) => sl.name.toLowerCase().includes(filterSearch.toLowerCase()))
    );
  };

  const topListFiltered = filterList(TOP_SPORTS_LIST);
  const atozListFiltered = filterList(ATOZ_SPORTS_LIST);

  return (
    <div
      id="sidebar-popout-drawer"
      className="w-64 sm:w-72 bg-white h-full flex flex-col border-r border-neutral-300 shadow-2xl z-20 select-none text-[#1e2329]"
    >
      {/* 1. Top Tabs Bar: TOP | LIVE | SPORTS matching 1xBet video exact layout */}
      <div className="bg-[#1b4470] text-white flex items-stretch text-xs font-black tracking-tight border-b border-[#14365b]">
        {(['TOP', 'LIVE', 'SPORTS'] as const).map((tab) => {
          const isActive = activeMainTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`flex-1 py-2 text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[#14365b] text-white font-extrabold shadow-inner'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}

        {/* Pin button */}
        <button
          onClick={onTogglePin}
          className={`px-2 py-1 flex items-center justify-center transition-colors cursor-pointer border-l border-[#14365b] ${
            isPinned
              ? 'bg-[#ffc600] text-black'
              : 'text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
          title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar Open'}
        >
          {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Sub-bar: All 684 | 232 Filter & Search */}
      <div className="bg-[#eef2f6] px-3 py-1.5 flex items-center justify-between border-b border-neutral-200 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubFilter('all')}
            className={`text-xs font-bold cursor-pointer transition-colors ${
              activeSubFilter === 'all' ? 'text-[#1b4470]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            All <span className="font-mono text-neutral-800">684</span>
          </button>
          <span className="text-neutral-300">|</span>
          <button
            onClick={() => setActiveSubFilter('live')}
            className={`text-xs font-bold cursor-pointer transition-colors ${
              activeSubFilter === 'live' ? 'text-[#1b4470]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span className="font-mono text-neutral-800">232</span>
          </button>
        </div>

        {/* Search Toggle / Input */}
        <div className="relative flex items-center w-28">
          <Search className="w-3 h-3 text-neutral-400 absolute left-1.5 pointer-events-none" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white border border-neutral-300 rounded pl-5 pr-1 py-0.5 text-[11px] text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#1b4470]"
          />
        </div>
      </div>

      {/* 3. Section Header: Top */}
      <div className="bg-[#e2e8f0] px-3 py-1 text-neutral-600 font-bold text-[11px] uppercase tracking-wider border-b border-neutral-200">
        Top
      </div>

      {/* 4. Main Categories Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs bg-white">
        {/* Top Popular Sports List */}
        {topListFiltered.map((item) => {
          const isExpanded = expandedCategories[item.id];
          const isCurrentActive = activeSport === item.sportId;
          const IconComp = item.iconComponent;

          return (
            <div key={item.id} className="group/item">
              <div
                onClick={() => handleSelectSport(item)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors border-b border-neutral-100 ${
                  isCurrentActive
                    ? 'bg-[#eaf1f8] font-bold text-[#1b4470]'
                    : 'hover:bg-[#f3f7fb] text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 flex items-center justify-center text-neutral-700 group-hover/item:text-[#1b4470] shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="truncate font-semibold text-xs text-neutral-900">
                    {item.name} <span className="text-neutral-500 font-normal">({item.count})</span>
                  </span>
                </div>

                <button
                  onClick={(e) => toggleExpand(item.id, e)}
                  className="p-1 text-neutral-400 hover:text-neutral-800 rounded hover:bg-neutral-200/60 transition-colors cursor-pointer"
                  title="Expand sub-leagues"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#1b4470]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Sub-leagues accordion exactly matching video at 00:05 */}
              {isExpanded && item.subLeagues && (
                <div className="bg-[#f8fafc] border-b border-neutral-200 py-1 pl-7 pr-2 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                  {item.subLeagues.map((sl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLeague(sl.name, item)}
                      className="w-full text-left py-1 px-2 rounded text-[11px] text-neutral-700 hover:text-[#1b4470] hover:bg-[#eaf1f8] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{sl.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Section Header: Categories from A to Z */}
        <div className="bg-[#e2e8f0] px-3 py-1.5 text-neutral-600 font-bold text-[11px] tracking-tight border-y border-neutral-200 flex items-center justify-between sticky top-0 z-10">
          <span>Categories from A to Z</span>
        </div>

        {/* A to Z Categories list */}
        {atozListFiltered.map((item) => {
          const isExpanded = expandedCategories[item.id];
          const isCurrentActive = activeSport === item.sportId && item.sportId !== undefined;
          const IconComp = item.iconComponent;

          return (
            <div key={item.id} className="group/item">
              <div
                onClick={() => handleSelectSport(item)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors border-b border-neutral-100 ${
                  isCurrentActive
                    ? 'bg-[#eaf1f8] font-bold text-[#1b4470]'
                    : 'hover:bg-[#f3f7fb] text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 flex items-center justify-center text-neutral-700 group-hover/item:text-[#1b4470] shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="truncate font-medium text-xs text-neutral-900">
                    {item.name} <span className="text-neutral-500 font-normal">({item.count})</span>
                  </span>
                </div>

                <button
                  onClick={(e) => toggleExpand(item.id, e)}
                  className="p-1 text-neutral-400 hover:text-neutral-800 rounded hover:bg-neutral-200/60 transition-colors cursor-pointer"
                  title="Expand leagues"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#1b4470]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Sub-leagues list */}
              {isExpanded && item.subLeagues && (
                <div className="bg-[#f8fafc] border-b border-neutral-200 py-1 pl-7 pr-2 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                  {item.subLeagues.map((sl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLeague(sl.name, item)}
                      className="w-full text-left py-1 px-2 rounded text-[11px] text-neutral-700 hover:text-[#1b4470] hover:bg-[#eaf1f8] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{sl.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
