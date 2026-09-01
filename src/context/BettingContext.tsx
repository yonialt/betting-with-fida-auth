import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Match,
  OddsItem,
  BetSlipItem,
  PlacedBet,
  SportId,
  SubTabId,
  BetType,
  OddsAcceptanceMode,
  UserProfile,
} from '../types';
import { INITIAL_MATCHES } from '../data/initialMatches';

interface BettingContextType {
  matches: Match[];
  betSlip: BetSlipItem[];
  placedBets: PlacedBet[];
  user: UserProfile;
  activeSport: SportId | 'all';
  onlyWithStreams: boolean;
  activeSubTab: SubTabId;
  searchQuery: string;
  favorites: Set<string>;
  stakeAmount: number;
  betType: BetType;
  oddsAcceptanceMode: OddsAcceptanceMode;
  promoCode: string;
  activeTabSlip: 'slip' | 'mybets';
  selectedMatchForModal: Match | null;
  selectedMatchForTracker: Match | null;
  selectedEventMatch: Match | null;
  appMode: '1xbet' | 'polymarket';
  setAppMode: (mode: '1xbet' | 'polymarket') => void;
  oddsDisplayMode: 'simple' | 'detailed';
  setOddsDisplayMode: (mode: 'simple' | 'detailed') => void;
  activeCenterView: 'matches' | 'event';
  loginModalOpen: boolean;
  bonusesModalOpen: boolean;
  settingsModalOpen: boolean;
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;

  // Actions
  setActiveSport: (sport: SportId | 'all') => void;
  setOnlyWithStreams: (val: boolean | ((prev: boolean) => boolean)) => void;
  setActiveSubTab: (tab: SubTabId) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (matchId: string) => void;
  toggleSelection: (match: Match, oddsItem: OddsItem) => void;
  removeSelection: (selectionId: string) => void;
  clearSlip: () => void;
  setStakeAmount: (amount: number | ((prev: number) => number)) => void;
  setBetType: (type: BetType) => void;
  setOddsAcceptanceMode: (mode: OddsAcceptanceMode) => void;
  setPromoCode: (code: string) => void;
  setActiveTabSlip: (tab: 'slip' | 'mybets') => void;
  setSelectedMatchForModal: (match: Match | null) => void;
  setSelectedMatchForTracker: (match: Match | null) => void;
  setSelectedEventMatch: (match: Match | null) => void;
  setActiveCenterView: (view: 'matches' | 'event') => void;
  openDetailedEvent: (match: Match) => void;
  closeDetailedEvent: () => void;
  setLoginModalOpen: (open: boolean) => void;
  setBonusesModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  placeBet: () => boolean;
  cashoutBet: (betId: string) => void;
  isOddsSelected: (oddsId: string) => boolean;
  depositFunds: (amount: number) => void;
  totalOdds: number;
  potentialWin: number;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

// Preload initial bet slip item to match user screenshot precisely:
// Defensa y Justicia vs Platense [1:0], 1.11 (1X2: W1)
const INITIAL_SLIP: BetSlipItem[] = [
  {
    id: 'arg1-w1',
    matchId: 'arg-1',
    matchCode: '154749',
    league: 'Argentina. Primera Division',
    matchTitle: 'Defensa y Justicia - Platense',
    currentScore: '1:0',
    marketName: '1X2',
    selectionName: 'Defensa y Justicia',
    selectionLabel: 'W1',
    odds: 1.11,
    isLive: true,
  },
];

export const BettingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>(INITIAL_SLIP);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([
    {
      id: 'BET-849201',
      placedAt: '10 mins ago',
      type: 'single',
      items: [
        {
          id: 'ger1-w1-init',
          matchId: 'ger-1',
          matchCode: '155234',
          league: 'Germany. Bundesliga',
          matchTitle: 'Bayern München - Borussia Dortmund',
          currentScore: '2:0',
          marketName: '1X2',
          selectionName: 'Bayern München',
          selectionLabel: 'W1',
          odds: 1.30,
          isLive: true,
        },
      ],
      totalOdds: 1.30,
      stake: 100,
      potentialWin: 130,
      currency: 'ETB',
      status: 'active',
      cashoutValue: 122.5,
    },
  ]);

  const [user, setUser] = useState<UserProfile>({
    isLoggedIn: true,
    username: 'Player_8831',
    userId: 'ID: 88319402',
    balance: 14500.00,
    currency: 'ETB',
    bonusBalance: 250.00,
  });

  const [activeSport, setActiveSport] = useState<SportId | 'all'>('all');
  const [onlyWithStreams, setOnlyWithStreams] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('matches');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['arg-1']));
  const [stakeAmount, setStakeAmount] = useState<number>(50); // Default 50 ETB as in screenshot
  const [betType, setBetType] = useState<BetType>('single');
  const [oddsAcceptanceMode, setOddsAcceptanceMode] = useState<OddsAcceptanceMode>('increase');
  const [promoCode, setPromoCode] = useState<string>('');
  const [activeTabSlip, setActiveTabSlip] = useState<'slip' | 'mybets'>('slip');
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [selectedMatchForTracker, setSelectedMatchForTracker] = useState<Match | null>(null);
  const [selectedEventMatch, setSelectedEventMatch] = useState<Match | null>(INITIAL_MATCHES[0]);
  const [activeCenterView, setActiveCenterView] = useState<'matches' | 'event'>('matches');
  const [appMode, setAppMode] = useState<'1xbet' | 'polymarket'>('1xbet');
  const [oddsDisplayMode, setOddsDisplayMode] = useState<'simple' | 'detailed'>('simple');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [bonusesModalOpen, setBonusesModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const openDetailedEvent = (match: Match) => {
    setSelectedEventMatch(match);
    setActiveCenterView('event');
  };

  const closeDetailedEvent = () => {
    setActiveCenterView('matches');
  };

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Live Timer Simulation: ticks match seconds every second
  useEffect(() => {
    const timer = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (!m.isLive) return m;
          const newSeconds = m.seconds + 1;
          const mins = Math.floor(newSeconds / 60);
          const secs = newSeconds % 60;
          const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

          return {
            ...m,
            seconds: newSeconds,
            timeDisplay: m.sport === 'tennis' ? m.timeDisplay : timeDisplay,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Micro-odds fluctuation simulation (realistic subtle live betting movements every 6-10s)
  useEffect(() => {
    const oddsTimer = setInterval(() => {
      setMatches((prevMatches) => {
        // Randomly pick 1 match to shift an odd slightly
        const matchIndex = Math.floor(Math.random() * prevMatches.length);
        const match = prevMatches[matchIndex];
        if (!match || !match.isLive) return prevMatches;

        const oddsKeys = Object.keys(match.odds) as (keyof typeof match.odds)[];
        const randomKey = oddsKeys[Math.floor(Math.random() * oddsKeys.length)];
        const currentItem = match.odds[randomKey];
        if (!currentItem || typeof currentItem === 'string') return prevMatches;

        const delta = (Math.random() * 0.08 - 0.04); // subtle fluctuation
        const newVal = Math.max(1.01, +(currentItem.value + delta).toFixed(3));
        const trend = newVal > currentItem.value ? 'up' : newVal < currentItem.value ? 'down' : 'same';

        const updatedOdds = {
          ...match.odds,
          [randomKey]: {
            ...currentItem,
            previousValue: currentItem.value,
            value: newVal,
            trend,
            lastUpdated: Date.now(),
          },
        };

        // Also update selection in bet slip if present
        setBetSlip((prevSlip) =>
          prevSlip.map((slipItem) => {
            if (slipItem.id === currentItem.id) {
              return { ...slipItem, odds: newVal };
            }
            return slipItem;
          })
        );

        return prevMatches.map((m, idx) => (idx === matchIndex ? { ...m, odds: updatedOdds } : m));
      });
    }, 7000);

    return () => clearInterval(oddsTimer);
  }, []);

  // Check if an odds item is currently in the bet slip
  const isOddsSelected = (oddsId: string) => {
    return betSlip.some((item) => item.id === oddsId);
  };

  // Toggle selection in bet slip
  const toggleSelection = (match: Match, oddsItem: OddsItem) => {
    if (isOddsSelected(oddsItem.id)) {
      setBetSlip((prev) => prev.filter((item) => item.id !== oddsItem.id));
      setNotification({ message: `Removed ${oddsItem.name} from bet slip`, type: 'info' });
    } else {
      const newItem: BetSlipItem = {
        id: oddsItem.id,
        matchId: match.id,
        matchCode: match.matchCode,
        league: match.league,
        matchTitle: `${match.team1} - ${match.team2}`,
        currentScore: `${match.score1}:${match.score2}`,
        marketName: oddsItem.marketName,
        selectionName: oddsItem.name,
        selectionLabel: oddsItem.label === '1' ? 'W1' : oddsItem.label === '2' ? 'W2' : oddsItem.label,
        odds: oddsItem.value,
        isLive: match.isLive,
      };

      setBetSlip((prev) => [...prev, newItem]);

      // Switch to Bet Slip tab automatically
      setActiveTabSlip('slip');
      setNotification({ message: `Added ${match.team1} vs ${match.team2} (${oddsItem.label}: ${oddsItem.value})`, type: 'success' });
    }
  };

  const removeSelection = (selectionId: string) => {
    setBetSlip((prev) => prev.filter((item) => item.id !== selectionId));
  };

  const clearSlip = () => {
    setBetSlip([]);
    setNotification({ message: 'Bet slip cleared', type: 'info' });
  };

  const toggleFavorite = (matchId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) {
        next.delete(matchId);
      } else {
        next.add(matchId);
      }
      return next;
    });
  };

  // Calculate total odds
  const totalOdds =
    betSlip.length === 0
      ? 1.0
      : betSlip.length === 1
      ? betSlip[0].odds
      : +betSlip.reduce((acc, item) => acc * item.odds, 1).toFixed(2);

  const potentialWin = +(stakeAmount * totalOdds).toFixed(2);

  // Place Bet execution
  const placeBet = (): boolean => {
    if (betSlip.length === 0) {
      setNotification({ message: 'Your bet slip is empty!', type: 'warning' });
      return false;
    }
    if (stakeAmount <= 0) {
      setNotification({ message: 'Please enter a valid stake amount', type: 'warning' });
      return false;
    }
    if (user.balance < stakeAmount) {
      setNotification({ message: 'Insufficient balance! Please deposit funds.', type: 'warning' });
      setLoginModalOpen(true);
      return false;
    }

    // Deduct user balance
    setUser((prev) => ({
      ...prev,
      balance: +(prev.balance - stakeAmount).toFixed(2),
    }));

    const newPlacedBet: PlacedBet = {
      id: `BET-${Math.floor(100000 + Math.random() * 900000)}`,
      placedAt: 'Just now',
      type: betSlip.length > 1 ? 'accumulator' : 'single',
      items: [...betSlip],
      totalOdds,
      stake: stakeAmount,
      potentialWin,
      currency: user.currency,
      status: 'active',
      cashoutValue: +(stakeAmount * 0.95).toFixed(2),
    };

    setPlacedBets((prev) => [newPlacedBet, ...prev]);
    setBetSlip([]);
    setActiveTabSlip('mybets');

    // Confetti effect!
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8, x: 0.85 },
        colors: ['#ffc600', '#00b0ff', '#ffffff'],
      });
    } catch {
      // ignore in headless
    }

    setNotification({
      message: `Bet placed successfully! Potential win: ${potentialWin} ${user.currency}`,
      type: 'success',
    });
    return true;
  };

  const cashoutBet = (betId: string) => {
    const bet = placedBets.find((b) => b.id === betId);
    if (!bet || bet.status !== 'active') return;

    setUser((prev) => ({
      ...prev,
      balance: +(prev.balance + bet.cashoutValue).toFixed(2),
    }));

    setPlacedBets((prev) =>
      prev.map((b) => (b.id === betId ? { ...b, status: 'cashed_out' } : b))
    );

    setNotification({
      message: `Successfully cashed out ${bet.cashoutValue} ${bet.currency}!`,
      type: 'success',
    });
  };

  const depositFunds = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: +(prev.balance + amount).toFixed(2),
    }));
    setNotification({
      message: `Successfully deposited ${amount} ${user.currency}!`,
      type: 'success',
    });
  };

  return (
    <BettingContext.Provider
      value={{
        matches,
        betSlip,
        placedBets,
        user,
        activeSport,
        onlyWithStreams,
        activeSubTab,
        searchQuery,
        favorites,
        stakeAmount,
        betType,
        oddsAcceptanceMode,
        promoCode,
        activeTabSlip,
        selectedMatchForModal,
        selectedMatchForTracker,
        selectedEventMatch,
        appMode,
        setAppMode,
        oddsDisplayMode,
        setOddsDisplayMode,
        activeCenterView,
        loginModalOpen,
        bonusesModalOpen,
        settingsModalOpen,
        notification,
        setActiveSport,
        setOnlyWithStreams,
        setActiveSubTab,
        setSearchQuery,
        toggleFavorite,
        toggleSelection,
        removeSelection,
        clearSlip,
        setStakeAmount,
        setBetType,
        setOddsAcceptanceMode,
        setPromoCode,
        setActiveTabSlip,
        setSelectedMatchForModal,
        setSelectedMatchForTracker,
        setSelectedEventMatch,
        setActiveCenterView,
        openDetailedEvent,
        closeDetailedEvent,
        setLoginModalOpen,
        setBonusesModalOpen,
        setSettingsModalOpen,
        placeBet,
        cashoutBet,
        isOddsSelected,
        depositFunds,
        totalOdds,
        potentialWin,
      }}
    >
      {children}
    </BettingContext.Provider>
  );
};

export const useBetting = (): BettingContextType => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};
