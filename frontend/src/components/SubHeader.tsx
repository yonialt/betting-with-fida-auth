import React from 'react';
import { Home, Trophy, ChevronRight, Search, CircleDot } from 'lucide-react';
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
  } = useBetting();

  const tabs: { id: SubTabId; label: string }[] = [
    { id: 'matches', label: 'Matches' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'upcoming', label: 'Upcoming events' },
    { id: '1st-period', label: '1st period' },
    { id: '2nd-period', label: '2nd period' },
  ];

  return (
    <div
      id="sub-header"
      className="w-full bg-[#13355a] border-b border-[#0f2946] px-2 sm:px-3 py-1 flex flex-wrap items-center justify-between gap-2 text-xs select-none"
    >
      {/* Left: Breadcrumbs & Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {/* Breadcrumb Trail: [Home Box] > Football > Trophy */}
        <div className="flex items-center gap-1 text-neutral-300 shrink-0 pr-2 border-r border-[#204975]">
          <button
            id="breadcrumb-home"
            className="w-7 h-7 bg-[#1c4878] hover:bg-[#255c96] rounded flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Home"
            onClick={() => {
              setActiveCenterView('matches');
              setActiveSubTab('matches');
            }}
          >
            <Home className="w-4 h-4 text-white" />
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <button
            id="breadcrumb-football"
            className="p-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Football"
          >
            <CircleDot className="w-4 h-4 text-neutral-300" />
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <button
            id="breadcrumb-leagues"
            className="p-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Leagues"
          >
            <Trophy className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        {/* Sub Tabs: Matches, Recommended, Upcoming events, 1st period, 2nd period */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
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
                className={`relative px-2.5 sm:px-3 py-1.5 font-bold text-xs sm:text-[13px] transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-5px] left-1 right-1 h-[2.5px] bg-[#a3e635] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Search Input */}
      <div className="relative shrink-0 w-full sm:w-56 md:w-64">
        <div className="relative flex items-center">
          <input
            id="input-search-match"
            type="text"
            placeholder="Search by match"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d2238] border border-[#204975] text-white rounded-full pl-3 pr-8 py-1 text-xs placeholder-neutral-400 focus:outline-none focus:border-[#0091ff] transition-all"
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
