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
import { fidaBetApi } from '../services/fidaBetApi';
import { fidaBetWebSocket } from '../services/fidaBetWebSocket';

interface BettingContextType {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
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
  casinoView: 'none' | 'casino' | 'live-casino';
  setCasinoView: (view: 'none' | 'casino' | 'live-casino') => void;
  casinoCategory: string;
  setCasinoCategory: (category: string) => void;
  language: 'en' | 'am';
  setLanguage: (lang: 'en' | 'am') => void;
  toggleLanguage: () => void;
  polymarketDarkMode: boolean;
  togglePolymarketDarkMode: () => void;
  oddsDisplayMode: 'simple' | 'detailed';
  setOddsDisplayMode: (mode: 'simple' | 'detailed') => void;
  activeCenterView: 'matches' | 'event';
  loginModalOpen: boolean;
  bonusesModalOpen: boolean;
  settingsModalOpen: boolean;
  depositModalOpen: boolean;
  withdrawModalOpen: boolean;
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  isBetSlipCollapsed: boolean;
  setIsBetSlipCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleBetSlipCollapsed: () => void;

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
  setDepositModalOpen: (open: boolean) => void;
  setWithdrawModalOpen: (open: boolean) => void;
  apiFootballModalOpen: boolean;
  setApiFootballModalOpen: (open: boolean) => void;
  setNotification: (n: { message: string; type: 'success' | 'info' | 'warning' } | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  loginUser: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (payload: { username: string; phone: string; email?: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  ageVerified: boolean;
  markAgeVerified: () => void;
  logout: () => void;
  placeBet: () => boolean;
  cashoutBet: (betId: string) => void;
  isOddsSelected: (oddsId: string) => boolean;
  depositFunds: (amount: number) => void;
  withdrawFunds: (amount: number, accountNumber?: string) => boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  totalOdds: number;
  potentialWin: number;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

// localStorage key recording that this browser has passed Fayda age verification.
// Kept while logged in (so a verified user is not asked again), cleared on logout.
const AGE_VERIFIED_KEY = 'fidabet_age_verified';

// Signed-out visitor profile (used when the user logs out / switches account)
const GUEST_USER: UserProfile = {
  isLoggedIn: false,
  username: 'Guest',
  userId: '',
  balance: 0,
  currency: 'ETB',
  bonusBalance: 0,
  phone: '',
};

// Bet slip starts empty. Items are added only when the user actually picks
// an odds selection — nothing is pre-loaded, so a visitor who isn't betting
// sees no bets in their slip.
const INITIAL_SLIP: BetSlipItem[] = [];

export const BettingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>(INITIAL_SLIP);
  // No pre-placed bets. "My Bets" stays empty until the user places a real bet.
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);

  // Start signed-out: a session is only restored on reload when the stored
  // token is still accepted by the backend (see the mount effect below).
  const [user, setUser] = useState<UserProfile>(GUEST_USER);

  const [activeSport, setActiveSport] = useState<SportId | 'all'>('all');
  const [onlyWithStreams, setOnlyWithStreams] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('matches');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['arg-1']));
  const [stakeAmount, setStakeAmount] = useState<number>(50); // Default 50 ETB
  const [betType, setBetType] = useState<BetType>('single');
  const [oddsAcceptanceMode, setOddsAcceptanceMode] = useState<OddsAcceptanceMode>('increase');
  const [promoCode, setPromoCode] = useState<string>('');
  const [activeTabSlip, setActiveTabSlip] = useState<'slip' | 'mybets'>('slip');
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [selectedMatchForTracker, setSelectedMatchForTracker] = useState<Match | null>(null);
  const [selectedEventMatch, setSelectedEventMatch] = useState<Match | null>(INITIAL_MATCHES[0]);
  const [activeCenterView, setActiveCenterView] = useState<'matches' | 'event'>('matches');
  const [appMode, setAppMode] = useState<'1xbet' | 'polymarket'>('polymarket');
  // Casino / Live Casino lobby overlay (opened from the sportsbook top navigation)
  const [casinoView, setCasinoView] = useState<'none' | 'casino' | 'live-casino'>('none');
  const [casinoCategory, setCasinoCategory] = useState<string>('all');
  const [language, setLanguageState] = useState<'en' | 'am'>(() => {
    try {
      const saved = localStorage.getItem('hagerawi_language');
      return (saved === 'en' || saved === 'am') ? saved : 'am';
    } catch {
      return 'am';
    }
  });

  const setLanguage = (lang: 'en' | 'am') => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hagerawi_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  // Polymarket theme (dark = default). Persisted per browser.
  const [polymarketDarkMode, setPolymarketDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('polymarket_theme') !== 'light';
    } catch {
      return true;
    }
  });

  const togglePolymarketDarkMode = () => {
    setPolymarketDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('polymarket_theme', next ? 'dark' : 'light');
      } catch {
        // ignore
      }
      return next;
    });
  };
  const [oddsDisplayMode, setOddsDisplayMode] = useState<'simple' | 'detailed'>('simple');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [bonusesModalOpen, setBonusesModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [apiFootballModalOpen, setApiFootballModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isBetSlipCollapsed, setIsBetSlipCollapsed] = useState<boolean>(false);
  const [ageVerified, setAgeVerified] = useState<boolean>(() => {
    // Guests must pass the age gate again on every load: the stored flag only
    // lets a signed-in session skip it, so without a stored token we treat the
    // visitor as an unverified guest even if a flag was left behind.
    try {
      return localStorage.getItem(AGE_VERIFIED_KEY) === '1' && !!localStorage.getItem('fidabet_token');
    } catch {
      return false;
    }
  });

  const toggleBetSlipCollapsed = () => {
    setIsBetSlipCollapsed((prev) => !prev);
  };

  // Backend Integration: Fetch initial matches from backend if available (Live + Upcoming)
  useEffect(() => {
    let isMounted = true;
    const loadMatches = () => {
      fidaBetApi.getAllMatches('all')
        .then((data: any) => {
          const list: Match[] = Array.isArray(data) ? data : (data?.content || []);
          if (isMounted && list.length > 0) {
            setMatches(list);
            if (list[0]) {
              setSelectedEventMatch(list[0]);
            }
          }
        })
        .catch(() => {
          // Fallback to in-memory INITIAL_MATCHES cleanly
        });
    };

    loadMatches();
    const interval = setInterval(loadMatches, 45000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    // Connect WebSocket client for real-time STOMP topics
    try {
      fidaBetWebSocket.connect();
    } catch {}

    // Restore a session ONLY when a stored token is still accepted by the
    // backend. No silent auto-login: a visitor with no (or rejected) token
    // stays a guest, so logout + reload lands back on the guest/age-gate flow.
    (async () => {
      const existingToken = localStorage.getItem('fidabet_token');
      if (existingToken) {
        try {
          const session = await fidaBetApi.getSession();
          if (isMounted && session?.user) {
            applyAuthUser(session.user);
          }
        } catch {
          // getSession() returns 401 (and clears the stored token) when the
          // backend rejects it: the visitor is a guest again, so the age gate
          // must show instead of a restored session.
          if (isMounted) {
            setAgeVerified(false);
          }
        }
      }

      // Mirror the server's age-verification flag on the restored user.
      try {
        const token = localStorage.getItem('fidabet_token');
        if (token) {
          const verifyRes = await fetch('/api/age-verification/status', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            setUser((prev) => ({
              ...prev,
              isAgeVerified: verifyData.verified,
              ageVerificationStatus: verifyData.verified ? 'verified' : (verifyData.latestVerification?.status === 'REJECTED' ? 'rejected' : 'none'),
            }));
          }
        }
      } catch {}
    })();

    return () => {
      isMounted = false;
      try {
        fidaBetWebSocket.disconnect();
      } catch {}
    };
  }, []);

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

  // Micro-odds fluctuation simulation (subtle live betting movements every 7s)
  useEffect(() => {
    const oddsTimer = setInterval(() => {
      setMatches((prevMatches) => {
        const matchIndex = Math.floor(Math.random() * prevMatches.length);
        const match = prevMatches[matchIndex];
        if (!match || !match.isLive) return prevMatches;

        const oddsKeys = Object.keys(match.odds) as (keyof typeof match.odds)[];
        const randomKey = oddsKeys[Math.floor(Math.random() * oddsKeys.length)];
        const currentItem = match.odds[randomKey];
        if (!currentItem || typeof currentItem === 'string') return prevMatches;

        const delta = (Math.random() * 0.08 - 0.04);
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

        // Update selection in bet slip if present
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
      const isFav = next.has(matchId);
      if (isFav) {
        next.delete(matchId);
      } else {
        next.add(matchId);
      }
      fidaBetApi.toggleFavorite(matchId, isFav).catch(() => {});
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
    if (!user.isLoggedIn) {
      setNotification({ message: 'Please log in or sign up to place a bet', type: 'warning' });
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return false;
    }
    if (user.balance < stakeAmount) {
      setNotification({ message: 'Insufficient balance! Please deposit funds.', type: 'warning' });
      setDepositModalOpen(true);
      return false;
    }

    const currentSlip = [...betSlip];
    const betTypeChosen = betSlip.length > 1 ? 'accumulator' : 'single';

    // Deduct user balance in client state
    setUser((prev) => ({
      ...prev,
      balance: +(prev.balance - stakeAmount).toFixed(2),
    }));

    const newPlacedBet: PlacedBet = {
      id: `BET-${Math.floor(100000 + Math.random() * 900000)}`,
      placedAt: 'Just now',
      type: betTypeChosen,
      items: currentSlip,
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

    // Call backend placeBet API seamlessly
    fidaBetApi.placeBet(stakeAmount, betTypeChosen, currentSlip)
      .then((backendBet) => {
        if (backendBet && backendBet.id) {
          setPlacedBets((prev) => prev.map((b) => (b.id === newPlacedBet.id ? { ...b, id: backendBet.id } : b)));
        }
      })
      .catch(() => {
        // Kept in local state
      });

    // Confetti animation
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8, x: 0.85 },
        colors: ['#ffc600', '#00b0ff', '#ffffff'],
      });
    } catch {}

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

    fidaBetApi.cashoutBet(betId).catch(() => {});

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

    fidaBetApi.deposit(amount, 'telebirr').catch(() => {});

    setNotification({
      message: `Successfully deposited ${amount} ${user.currency}!`,
      type: 'success',
    });
  };

  // Withdraw funds to Telebirr. Validates against the current balance, deducts
  // it client-side, and best-effort calls the backend wallet/withdraw endpoint.
  const withdrawFunds = (amount: number, accountNumber?: string): boolean => {
    if (!amount || amount <= 0) {
      setNotification({ message: 'Enter a valid withdrawal amount', type: 'warning' });
      return false;
    }
    if (amount > user.balance) {
      setNotification({ message: 'Insufficient balance for this withdrawal', type: 'warning' });
      return false;
    }
    setUser((prev) => ({
      ...prev,
      balance: +(prev.balance - amount).toFixed(2),
    }));
    fidaBetApi.withdraw(amount, 'telebirr', accountNumber || user.phone || '').catch(() => {});
    setNotification({
      message: `Withdrawal of ${amount} ${user.currency} sent to Telebirr!`,
      type: 'success',
    });
    return true;
  };

  // Update the signed-in user's editable profile fields (name, email, phone).
  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    setNotification({ message: 'Profile updated successfully', type: 'success' });
  };

  // ---- Shared Sign up / Log in (one account across sport betting & Polymarket) ----
  const applyAuthUser = (rawUser: any) => {
    setUser({
      isLoggedIn: true,
      username: rawUser?.username || 'Player',
      userId: rawUser?.userId || rawUser?.id || '',
      balance: Number(rawUser?.balance) || 0,
      currency: rawUser?.currency || 'ETB',
      bonusBalance: Number(rawUser?.bonusBalance) || 0,
      phone: rawUser?.phone || '',
    });
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const loginUser = async (username: string, password: string) => {
    try {
      const data = await fidaBetApi.login(username.trim(), password);
      if (data?.token && data?.user) {
        applyAuthUser(data.user);
        setAuthModalOpen(false);
        setNotification({ message: `Welcome back, ${data.user.username}!`, type: 'success' });
        return { ok: true };
      }
      return { ok: false, error: (data && (data.message || data.error)) || 'Login failed' };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Unable to reach server. Please try again.' };
    }
  };

  const registerUser = async (payload: { username: string; phone: string; email?: string; password: string }) => {
    try {
      const data = await fidaBetApi.register(payload);
      if (data?.token && data?.user) {
        applyAuthUser(data.user);
        setAuthModalOpen(false);
        setNotification({ message: `Account created — welcome, ${data.user.username}!`, type: 'success' });
        return { ok: true };
      }
      return { ok: false, error: (data && (data.message || data.error)) || 'Registration failed' };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Unable to reach server. Please try again.' };
    }
  };

  // Record that this browser/session passed Fayda age verification.
  // Reset on logout so the age gate shows again for sign-out users.
  const markAgeVerified = () => {
    setAgeVerified(true);
    try {
      localStorage.setItem(AGE_VERIFIED_KEY, '1');
    } catch {}
  };

  const logout = () => {
    // Best-effort: also invalidate the token on the backend so a leftover copy
    // in another tab cannot restore the session later.
    const token = localStorage.getItem('fidabet_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    fidaBetApi.clearTokens();
    setUser(GUEST_USER);
    setAgeVerified(false);
    try {
      localStorage.removeItem(AGE_VERIFIED_KEY);
    } catch {}
    setLoginModalOpen(false);
    setNotification({ message: 'Logged out. See you soon!', type: 'info' });
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
        casinoView,
        setCasinoView,
        casinoCategory,
        setCasinoCategory,
        oddsDisplayMode,
        setOddsDisplayMode,
        activeCenterView,
        loginModalOpen,
        bonusesModalOpen,
        settingsModalOpen,
        depositModalOpen,
        apiFootballModalOpen,
        setApiFootballModalOpen,
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
        setDepositModalOpen,
        setNotification,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        loginUser,
        registerUser,
        ageVerified,
        markAgeVerified,
        logout,
        placeBet,
        cashoutBet,
        isOddsSelected,
        depositFunds,
        withdrawFunds,
        updateProfile,
        withdrawModalOpen,
        setWithdrawModalOpen,
        totalOdds,
        potentialWin,
        isBetSlipCollapsed,
        setIsBetSlipCollapsed,
        toggleBetSlipCollapsed,
        language,
        setLanguage,
        toggleLanguage,
        polymarketDarkMode,
        togglePolymarketDarkMode,
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
