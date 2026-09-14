/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BettingProvider, useBetting } from './context/BettingContext';
import { Header } from './components/Header';
import { PromoBillboard } from './components/PromoBillboard';
import { LeftSidebar } from './components/LeftSidebar';
import { SubHeader } from './components/SubHeader';
import { SportFilterBar } from './components/SportFilterBar';
import { MatchList } from './components/MatchList';
import { EventDetailedView } from './components/EventDetailedView';
import { BetSlip } from './components/BetSlip';
import { MarketDetailsModal } from './components/MarketDetailsModal';
import { LiveMatchTrackerModal } from './components/LiveMatchTrackerModal';
import { AuthModal } from './components/AuthModal';
import { BonusesModal } from './components/BonusesModal';
import { SettingsModal } from './components/SettingsModal';
import { CasinoLobby } from './components/CasinoLobby';
import { TelebirrDepositModal } from './components/TelebirrDepositModal';
import { ApiFootballRedisModal } from './components/ApiFootballRedisModal';
import { AgeVerificationGate } from './components/AgeVerificationGate';
import { PartnersPanel } from './components/PartnersPanel';
import { Footer } from './components/Footer';
import { PolymarketPage } from './components/polymarket/PolymarketPage';
import { AdminPage } from './components/admin/AdminPage';
import PolymarketAdmin from './components/admin/PolymarketAdmin';

// Seed the admin page with real data references via globals (read-only, one-time).
// The admin component reads these to populate initial editable values without
// importing the heavy real data modules at edit time.
(function attachPolymarketAdminSeeds() {
  if (typeof window !== 'undefined') {
    // Prevent double-seed if the admin page is visited multiple times
    if (!window['__polymarket_admin_seeded__']) {
      window['__polymarket_admin_seeded__'] = true;
      window['__polymarket_hero_slides__'] = window['__polymarket_hero_slides__'] || [];
      window['__polymarket_hot_topics__'] = window['__polymarket_hot_topics__'] || [];
      window['__polymarket_ethiopia_seed__'] = window['__polymarket_ethiopia_seed__'] || [];
      window['__polymarket_breaking_seed__'] = window['__polymarket_breaking_seed__'] || [];
    }
  }
})();

// Attach the real data to globals so the admin editor can seed its initial values.
// This runs once on module load; the admin component reads these globals.
(function populateAdminGlobals() {
  if (typeof window === 'undefined') return;
  // Only populate once
  if (window['__polymarket_admin_globals_populated__']) return;
  window['__polymarket_admin_globals_populated__'] = true;

  try {
    const HERO_CAROUSEL_SLIDES = require('./data/polymarketExtendedData').HERO_CAROUSEL_SLIDES;
    window['__polymarket_hero_slides__'] = HERO_CAROUSEL_SLIDES || [];
  } catch {}
  try {
    const POLYMARKET_HOT_TOPICS = require('./data/polymarketData').POLYMARKET_HOT_TOPICS;
    window['__polymarket_hot_topics__'] = POLYMARKET_HOT_TOPICS || [];
  } catch {}
  try {
    const { ETHIOPIAN_MARKETS_DATA } = require('./components/polymarket/views/PolymarketEthiopiaView');
    window['__polymarket_ethiopia_seed__'] = ETHIOPIAN_MARKETS_DATA || [];
  } catch {}
  try {
    const { BREAKING_NEWS_ITEMS } = require('./data/polymarketExtendedData');
    window['__polymarket_breaking_seed__'] = BREAKING_NEWS_ITEMS || [];
  } catch {}
  try {
    const { WEATHER_CITY_MARKETS } = require('./data/polymarketExtendedData');
    window['__polymarket_weather_cities_seed__'] = WEATHER_CITY_MARKETS || [];
  } catch {}
  try {
    const { WEATHER_EVENT_MARKETS } = require('./data/polymarketExtendedData');
    window['__polymarket_weather_events_seed__'] = WEATHER_EVENT_MARKETS || [];
  } catch {}
  try {
    const { ART_MARKETS } = require('./data/polymarketExtendedData');
    window['__polymarket_art_seed__'] = ART_MARKETS || [];
  } catch {}
  try {
    const { PERP_TOKENS } = require('./data/polymarketExtendedData');
    window['__polymarket_perps_seed__'] = PERP_TOKENS || [];
  } catch {}
})();
import { ProfilePage } from './components/ProfilePage';
import { TelebirrWithdrawModal } from './components/TelebirrWithdrawModal';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ToastNotification: React.FC = () => {
  const { notification } = useBetting();
  if (!notification) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
      <div
        className={`px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2 border ${
          notification.type === 'success'
            ? 'bg-neutral-900 text-white border-neutral-700'
            : notification.type === 'warning'
            ? 'bg-amber-900 text-white border-amber-700'
            : 'bg-neutral-800 text-white border-neutral-700'
        }`}
      >
        {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-[#ffc600]" />}
        {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
        {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
        <span>{notification.message}</span>
      </div>
    </div>
  );
};

const BettingAppContent: React.FC = () => {
  const {
    activeCenterView,
    appMode,
    apiFootballModalOpen,
    setApiFootballModalOpen,
    isBetSlipCollapsed,
  } = useBetting();

  const [currentPath, setCurrentPath] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  React.useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Dedicated /admin route hosting the Free Match & Odds API · Redis Cache Engine
  // and the Polymarket admin editor at /admin/polymarket
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    // Polymarket admin sub-route
    if (currentPath === '/admin/polymarket' || currentPath.startsWith('/admin/polymarket')) {
      return (
        <>
          <PolymarketAdmin onBack={() => navigateTo('/')} />
          <ToastNotification />
        </>
      );
    }
    return (
      <>
        <AdminPage onBack={() => navigateTo('/')} />
        <ToastNotification />
      </>
    );
  }

  // Dedicated /profile route: user portfolio (predictions, positions, P/L).
  // Opened from the sportsbook header profile capsule.
  if (currentPath === '/profile' || currentPath.startsWith('/profile')) {
    return (
      <>
        <ProfilePage onBack={() => navigateTo('/')} />
        <AuthModal />
        <TelebirrDepositModal />
        <TelebirrWithdrawModal />
        <SettingsModal />
        <ToastNotification />
      </>
    );
  }

  if (appMode === 'polymarket') {
    return (
      <>
        <PolymarketPage />

        {/* Global Interactive Modals so deposit, settings, wallet, auth work seamlessly */}
        <AuthModal />
        <BonusesModal />
        <SettingsModal />
        <TelebirrDepositModal />
        <ApiFootballRedisModal
          isOpen={apiFootballModalOpen}
          onClose={() => setApiFootballModalOpen(false)}
        />
        <ToastNotification />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#eaedf1] text-[#222] font-sans antialiased">
      {/* Top Main Navigation Header (Row 1 & Row 2 Navbars) */}
      <Header />

      {/* Hero Promotional Billboard & Mini Games Row */}
      <PromoBillboard />

      {/* Main 3-Column Layout: Left Rail + Center Matches & Sports Filters + Right Bet Slip */}
      <div className="flex-1 flex flex-row overflow-hidden max-w-[1920px] w-full mx-auto">
        {/* Left Icon Rail */}
        <LeftSidebar />

        {/* Center Live Matches Area / Event Detailed View */}
        <main
          className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#eaedf1] p-2 sm:p-2.5 transition-all duration-200"
          style={{
            marginLeft: '0px',
            marginRight: isBetSlipCollapsed ? '45px' : '0px',
          }}
        >
          {activeCenterView === 'event' ? (
            <EventDetailedView />
          ) : (
            /* Huge Box containing Third Navbar (SubHeader + SportFilterBar) and Game Matches (MatchList) */
            <div
              id="huge-match-box"
              className="w-full bg-white rounded-md shadow-xs border border-[#153a63]/40 overflow-hidden flex flex-col"
            >
              {/* Row 1 of Box: Third Navbar with Tabs & Search */}
              <SubHeader />

              {/* Row 2 of Box: Sports Filter Bar with Live Stream Toggle & Sports */}
              <SportFilterBar />

              {/* Box Body: Game Matches Table */}
              <MatchList />
            </div>
          )}
        </main>

        {/* Right Sidebar: Bet Slip & My Bets */}
        <BetSlip />
      </div>

      {/* Partners Showcase Panel */}
      <PartnersPanel />

      {/* Main Footer */}
      <Footer />

      {/* Global Interactive Modals */}
      <MarketDetailsModal />
      <LiveMatchTrackerModal />
      <AuthModal />
      <BonusesModal />
      <SettingsModal />
      <CasinoLobby />
      <TelebirrDepositModal />
      <ApiFootballRedisModal
        isOpen={apiFootballModalOpen}
        onClose={() => setApiFootballModalOpen(false)}
      />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <BettingProvider>
      <AgeVerificationGate>
        <BettingAppContent />
      </AgeVerificationGate>
    </BettingProvider>
  );
}
