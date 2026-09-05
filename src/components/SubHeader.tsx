import React from 'react';
import {
  Home,
  Trophy,
  ChevronRight,
  Search,
  CircleDot,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { SubTabId } from '../types';

export const SubHeader: React.FC = () => {
  const {
    activeSubTab,
    setActiveSubTab,
    searchQuery,
    setSearchQuery,
    activeCenterView,
    setActiveCenterView,
    isBetSlipCollapsed,
    setIsBetSlipCollapsed,
    betSlip,
  } = useBetting();

  const tabs: { id: SubTabId; label: string; icon?: string }[] = [
    { id: 'matches', label: 'All Matches' },
    { id: 'live', label: 'In-Play Live', icon: '🔴' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow (1 Day)' },
    { id: 'day2', label: 'In 2 Days (+48h)' },
    { id: 'upcoming', label: 'All Upcoming' },
    { id: 'recommended', label: 'Favorites' },
  ];

  return (
    <div
      id="sub-header"
      className="w-full bg-[#13355a] border-b border-[#0f2946] px-1 py-0 flex items-center justify-between gap-1 text-xs select-none"
      style={{
        marginTop: '0px',
        marginLeft: '0px',
      }}
    >
      {/* Left: Breadcrumbs & Navigation Tabs */}
      <div className="flex items-center gap-0.5 min-w-0">
        {/* Breadcrumb Trail */}
        <div
          className="flex items-center gap-0.5 text-neutral-300 shrink-0 pr-1 border-r border-[#204975]"
          style={{ marginTop: '6px' }}
        >
          <button
            id="breadcrumb-home"
            className="w-6 h-6 bg-[#1c4878] hover:bg-[#255c96] rounded flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            title="Home"
            onClick={() => {
              setActiveCenterView('matches');
              setActiveSubTab('matches');
            }}
          >
            <Home className="w-3.5 h-3.5 text-white" />
          </button>

          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />

          <button
            id="breadcrumb-football"
            className="p-0.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Football"
          >
            <CircleDot className="w-3.5 h-3.5 text-neutral-300" />
          </button>

          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />

          <button
            id="breadcrumb-leagues"
            className="p-0.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Leagues"
          >
            <Trophy className="w-3.5 h-3.5 text-neutral-300" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-0 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`subtab-${tab.id}`}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setActiveCenterView('matches');
                }}
                className={`relative px-2 sm:px-2.5 py-1 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${isActive
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                  }`}
              >
                <span>{tab.label}</span>

                {isActive && (
                  <span className="absolute bottom-[-1px] left-1 right-1 h-[2px] bg-[#a3e635] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Search Input */}
      <div className="relative shrink-0 w-44 sm:w-48 md:w-52">
        <div className="relative flex items-center">
          <input
            id="input-search-match"
            type="text"
            placeholder="Search by match"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6 bg-[#0d2238] border border-[#204975] text-white rounded-full pl-2.5 pr-8 py-0.5 text-xs placeholder-neutral-400 focus:outline-none focus:border-[#0091ff] transition-all"
            style={{
              borderWidth: '3px',
              marginLeft: '37px',
            }}
          />

          <Search className="w-3.5 h-3.5 absolute right-2.5 text-neutral-400 pointer-events-none" />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-7 text-neutral-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};