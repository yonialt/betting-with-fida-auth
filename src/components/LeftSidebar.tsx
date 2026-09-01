import React, { useState, useRef } from 'react';
import { useBetting } from '../context/BettingContext';
import { SidebarPopoutMenu, TOP_SPORTS_LIST, ATOZ_SPORTS_LIST, SportMenuEntry } from './SidebarPopoutMenu';

export const LeftSidebar: React.FC = () => {
  const {
    activeSport,
    setActiveSport,
    setActiveSubTab,
  } = useBetting();

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleIconClick = (sport: SportMenuEntry) => {
    if (sport.sportId) {
      setActiveSport(sport.sportId);
    } else {
      setActiveSport('all');
    }
    setActiveSubTab('matches');
  };

  const showPopout = isHovered || isPinned;

  return (
    <div
      id="left-sidebar-wrapper"
      className="relative flex shrink-0 z-10 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Left Narrow Sport Icon-Only Rail */}
      <aside
        id="left-icon-rail"
        className="w-10 bg-white border-r border-neutral-200 flex flex-col justify-between items-center shrink-0 h-full z-10 overflow-hidden"
      >
        {/* Top dummy blue header matching popout height */}
        <div className="w-full bg-[#1b4470] h-8 flex items-center justify-center border-b border-[#14365b]">
          <span className="text-[#ffc600] font-black text-xs italic tracking-tighter">1X</span>
        </div>

        {/* Sub-header spacer */}
        <div className="w-full bg-[#eef2f6] h-7 border-b border-neutral-200 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        {/* Sports Icon Column */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden divide-y divide-neutral-100 flex flex-col items-center">
          {/* Top Sports Icons */}
          {TOP_SPORTS_LIST.map((sport) => {
            const Icon = sport.iconComponent;
            const isActive = activeSport === sport.sportId;

            return (
              <button
                key={sport.id}
                id={`rail-sport-${sport.id}`}
                onClick={() => handleIconClick(sport)}
                title={`${sport.name} (${sport.count})`}
                className={`relative w-full py-2 flex items-center justify-center cursor-pointer transition-colors group ${
                  isActive
                    ? 'bg-[#eaf1f8] text-[#1b4470] border-l-3 border-[#1b4470]'
                    : 'text-neutral-600 hover:text-[#1b4470] hover:bg-[#f3f7fb]'
                }`}
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-115" />

                {/* Tooltip on hover when popout is not active */}
                {!showPopout && (
                  <div className="absolute left-full ml-1.5 px-2 py-1 bg-[#1e2329] text-white text-[11px] font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {sport.name} <span className="text-amber-400 font-normal">({sport.count})</span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Section Divider Spacer */}
          <div className="w-full bg-[#e2e8f0] h-5.5 flex items-center justify-center">
            <span className="text-[9px] font-extrabold text-neutral-500 font-mono">A-Z</span>
          </div>

          {/* A-Z Sports Icons */}
          {ATOZ_SPORTS_LIST.map((sport) => {
            const Icon = sport.iconComponent;
            const isActive = activeSport === sport.sportId && sport.sportId !== undefined;

            return (
              <button
                key={sport.id}
                id={`rail-sport-${sport.id}`}
                onClick={() => handleIconClick(sport)}
                title={`${sport.name} (${sport.count})`}
                className={`relative w-full py-2 flex items-center justify-center cursor-pointer transition-colors group ${
                  isActive
                    ? 'bg-[#eaf1f8] text-[#1b4470] border-l-3 border-[#1b4470]'
                    : 'text-neutral-600 hover:text-[#1b4470] hover:bg-[#f3f7fb]'
                }`}
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-115" />

                {!showPopout && (
                  <div className="absolute left-full ml-1.5 px-2 py-1 bg-[#1e2329] text-white text-[11px] font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {sport.name} <span className="text-amber-400 font-normal">({sport.count})</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Yellow Badge: 684 */}
        <div className="w-full p-1 bg-white border-t border-neutral-200">
          <div
            id="active-events-counter"
            title="684 Live Sports Events Active Right Now"
            className="w-full bg-[#ffc600] hover:bg-[#f0ba00] text-black font-extrabold text-[11px] py-1 rounded text-center cursor-pointer transition-colors shadow-xs"
          >
            684
          </div>
        </div>
      </aside>

      {/* 2. Hover Pop-out Categories & Sports Drawer */}
      {showPopout && (
        <div
          id="popout-sidebar-container"
          className="absolute left-10 top-0 bottom-0 z-20 h-full shadow-2xl animate-in fade-in slide-in-from-left-1 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <SidebarPopoutMenu
            isPinned={isPinned}
            onTogglePin={() => setIsPinned(!isPinned)}
            onClose={() => setIsHovered(false)}
          />
        </div>
      )}
    </div>
  );
};
