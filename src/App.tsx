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
import { LoginModal } from './components/LoginModal';
import { AuthModal } from './components/AuthModal';
import { BonusesModal } from './components/BonusesModal';
import { SettingsModal } from './components/SettingsModal';
import { TelebirrDepositModal } from './components/TelebirrDepositModal';
import { ApiFootballRedisModal } from './components/ApiFootballRedisModal';
import { AgeVerificationGate } from './components/AgeVerificationGate';
import { PartnersPanel } from './components/PartnersPanel';
import { Footer } from './components/Footer';
import { PolymarketPage } from './components/polymarket/PolymarketPage';
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
  const { activeCenterView, appMode, apiFootballModalOpen, setApiFootballModalOpen } = useBetting();

  if (appMode === 'polymarket') {
    return (
      <>
        <PolymarketPage />
        <AuthModal />
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
          className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#eaedf1] p-2 sm:p-2.5"
          style={{
            marginLeft: '0px',
            marginRight: '0px',
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
      <LoginModal />
      <AuthModal />
      <BonusesModal />
      <SettingsModal />
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
