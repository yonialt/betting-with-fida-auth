import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBetting } from '../context/BettingContext';
import { SidebarPopoutMenu, TOP_SPORTS_LIST, ATOZ_SPORTS_LIST, SportMenuEntry } from './SidebarPopoutMenu';

/** Tailwind's `lg` breakpoint: below it the icon rail becomes a slide-in drawer. */
const DESKTOP_SIDEBAR_QUERY = '(min-width: 1024px)';

/** Live events figure shared by the desktop rail's yellow badge and the mobile drawer header. */
const ACTIVE_EVENTS_COUNT = 684;

/** Tracks a CSS media query so we can render the desktop rail or the mobile drawer. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const LeftSidebar: React.FC = () => {
  const {
    activeSport,
    setActiveSport,
    setActiveSubTab,
  } = useBetting();

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Phones & tablets: the hover rail is replaced by a slide-in sports drawer
  // (same pattern as the mobile bet slip bottom sheet).
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery(DESKTOP_SIDEBAR_QUERY);

  // Auto-close the drawer if the viewport grows into the desktop layout.
  useEffect(() => {
    if (isDesktop) setIsMobileDrawerOpen(false);
  }, [isDesktop]);

  // Close the drawer on Escape for keyboard accessibility.
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileDrawerOpen]);

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

  /* ------------------------------------------------------------------ *
   * Phones & tablets: edge handle + slide-in drawer. Rendered through
   * a portal so the page containers can never clip or offset it.
   * ------------------------------------------------------------------ */
  if (!isDesktop) {
    const mobileUI = (
      <>
        {/* Edge handle: always-visible circular logo affordance on the left screen edge */}
        <button
          id="btn-mobile-left-sidebar"
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-controls="mobile-sports-drawer"
          aria-expanded={isMobileDrawerOpen}
          aria-label="Open sports menu"
          className="fixed left-2 top-[45%] -translate-y-1/2 z-30 lg:hidden w-14 h-14 flex items-center justify-center bg-transparent border-0 shadow-none active:scale-90 transition-all cursor-pointer"
        >
          <img src="/hagerawi-logo.svg" alt="" className="h-11 w-11 object-contain pointer-events-none" />
        </button>

        {/* Backdrop behind the open drawer */}
        {isMobileDrawerOpen && (
          <div
            id="mobile-sports-backdrop"
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Slide-in sports drawer */}
        <aside
          id="mobile-sports-drawer"
          role="dialog"
          aria-modal={isMobileDrawerOpen}
          aria-label="Sports menu"
          className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[300px] bg-white border-r border-neutral-300 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Blue header matching the desktop rail's top block, with the
              live-events counter carried over from the rail's yellow badge */}
          <div className="w-full shrink-0 bg-[#1b4470] h-10 flex items-center pl-3 pr-1.5 border-b border-[#14365b]">
            <img src="/hagerawi-logo.svg" alt="Hagerawi Logo" className="h-5 w-auto object-contain shrink-0" />

            {/* Live events badge (same figure & styling as the desktop rail's yellow counter) */}
            <div
              id="mobile-drawer-active-events-counter"
              title={`${ACTIVE_EVENTS_COUNT} Live Sports Events Active Right Now`}
              className="ml-auto mr-1.5 flex items-center gap-1.5 bg-[#ffc600] text-black font-extrabold text-[11px] pl-2 pr-2.5 py-1 rounded-full shadow-xs cursor-default select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black/80 animate-pulse" aria-hidden="true" />
              {ACTIVE_EVENTS_COUNT}
            </div>

            <button
              id="btn-close-mobile-sports-drawer"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-md text-neutral-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full categories & sports list (shared with the desktop popout) */}
          <div className="flex-1 min-h-0">
            <SidebarPopoutMenu
              isPinned={false}
              onTogglePin={() => {}}
              fullWidth
              hidePin
              onSportSelect={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </aside>
      </>
    );

    return typeof document !== 'undefined' ? createPortal(mobileUI, document.body) : null;
  }

  return (
    <div
      id="left-sidebar-wrapper"
      className="relative hidden lg:flex shrink-0 z-10 select-none"
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
          <img src="/hagerawi-logo.svg" alt="Hagerawi Logo" className="h-5 w-auto object-contain" />
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
            title={`${ACTIVE_EVENTS_COUNT} Live Sports Events Active Right Now`}
            className="w-full bg-[#ffc600] hover:bg-[#f0ba00] text-black font-extrabold text-[11px] py-1 rounded text-center cursor-pointer transition-colors shadow-xs"
          >
            {ACTIVE_EVENTS_COUNT}
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
