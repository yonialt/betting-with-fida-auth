import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MATCHES } from './src/data/initialMatches';
import { Match, PlacedBet, UserProfile, BetSlipItem } from './src/types';
import { redisCache } from './src/server/redisCache';
import { apiFootballService } from './src/server/apiFootballService';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- In-Memory State ---
let currentUser: UserProfile = {
  isLoggedIn: true,
  username: 'Player_8831',
  userId: 'ID: 88319402',
  balance: 14500.0,
  currency: 'ETB',
  bonusBalance: 250.0,
  phone: '+251911223344',
  isAgeVerified: true,
  ageVerificationStatus: 'verified',
};

let matches: Match[] = [...INITIAL_MATCHES];

let placedBets: PlacedBet[] = [
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
        odds: 1.3,
        isLive: true,
      },
    ],
    totalOdds: 1.3,
    stake: 100,
    potentialWin: 130,
    currency: 'ETB',
    status: 'active',
    cashoutValue: 122.5,
  },
];

let transactions: any[] = [
  {
    id: 'TX-99201',
    type: 'deposit',
    amount: 5000,
    currency: 'ETB',
    status: 'completed',
    paymentMethod: 'telebirr',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'TX-99202',
    type: 'deposit',
    amount: 9500,
    currency: 'ETB',
    status: 'completed',
    paymentMethod: 'cbe_birr',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

let favoriteMatchIds: Set<string> = new Set(['arg-1']);

let userSettings = {
  oddsFormat: 'decimal',
  language: 'en',
  soundEffects: true,
  autoAcceptOddsChanges: true,
  compactView: false,
};

// --- API Routes ---

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body || {};
  if (username) {
    currentUser.username = username;
  }
  currentUser.isLoggedIn = true;
  res.json({
    token: 'fidabet_jwt_mock_token_88319402',
    refreshToken: 'fidabet_refresh_mock_token_88319402',
    user: currentUser,
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, phone } = req.body || {};
  if (username) currentUser.username = username;
  if (phone) currentUser.phone = phone;
  currentUser.isLoggedIn = true;
  res.json({
    token: 'fidabet_jwt_mock_token_' + Date.now(),
    refreshToken: 'fidabet_refresh_mock_token_' + Date.now(),
    user: currentUser,
  });
});

app.post('/api/auth/refresh', (_req, res) => {
  res.json({
    token: 'fidabet_jwt_mock_token_refreshed_' + Date.now(),
    refreshToken: 'fidabet_refresh_mock_token_refreshed_' + Date.now(),
  });
});

app.post('/api/auth/forgot-password', (_req, res) => {
  res.json({ message: 'Password reset instructions sent' });
});

app.post('/api/auth/verify-otp', (_req, res) => {
  res.json({ verified: true });
});

// Age Verification (Fayda)
app.get('/api/age-verification/status', (_req, res) => {
  res.json({
    verified: currentUser.isAgeVerified ?? true,
    status: currentUser.ageVerificationStatus === 'verified' ? 'VERIFIED' : 'NONE',
    latestVerification: {
      status: 'VERIFIED',
      reason: 'Fayda Ethiopian National ID Verified (Legal Age 21+)',
      age: 24,
      fullName: 'Abebe Kebede',
    },
  });
});

app.post('/api/age-verification/verify', (req, res) => {
  const { faydaId } = req.body || {};
  currentUser.isAgeVerified = true;
  currentUser.ageVerificationStatus = 'verified';
  res.json({
    verified: true,
    status: 'VERIFIED',
    message: `Fayda National ID (${faydaId || 'verified'}) confirmed. Legal age requirement (21+) satisfied.`,
    age: 24,
    fullName: 'Abebe Kebede',
    dateOfBirth: '2000-05-12',
  });
});

app.post('/api/age-verification/skip-demo', (_req, res) => {
  currentUser.isAgeVerified = true;
  currentUser.ageVerificationStatus = 'verified';
  res.json({
    verified: true,
    status: 'VERIFIED',
    message: 'Demo mode: Age verification bypassed.',
  });
});

// User Profile
app.get('/api/user/profile', (_req, res) => {
  res.json(currentUser);
});

app.put('/api/user/profile', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json(currentUser);
});

app.post('/api/user/kyc', (_req, res) => {
  res.json({ status: 'APPROVED', message: 'KYC documents received and verified' });
});

// Wallet
app.get('/api/wallet/balance', (_req, res) => {
  res.json({
    balance: currentUser.balance,
    bonusBalance: currentUser.bonusBalance,
    currency: currentUser.currency,
  });
});

app.post('/api/wallet/deposit', (req, res) => {
  const { amount = 0, paymentMethod = 'telebirr' } = req.body || {};
  const depositAmt = parseFloat(amount) || 0;
  currentUser.balance = +(currentUser.balance + depositAmt).toFixed(2);
  const tx = {
    id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    type: 'deposit',
    amount: depositAmt,
    currency: currentUser.currency,
    status: 'completed',
    paymentMethod,
    timestamp: new Date().toISOString(),
  };
  transactions.unshift(tx);
  res.json({
    status: 'SUCCESS',
    transactionId: tx.id,
    amount: depositAmt,
    balance: currentUser.balance,
  });
});

app.post('/api/wallet/withdraw', (req, res) => {
  const { amount = 0, paymentMethod = 'telebirr' } = req.body || {};
  const withdrawAmt = parseFloat(amount) || 0;
  if (currentUser.balance < withdrawAmt) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  currentUser.balance = +(currentUser.balance - withdrawAmt).toFixed(2);
  const tx = {
    id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
    type: 'withdrawal',
    amount: withdrawAmt,
    currency: currentUser.currency,
    status: 'completed',
    paymentMethod,
    timestamp: new Date().toISOString(),
  };
  transactions.unshift(tx);
  res.json({
    status: 'SUCCESS',
    transactionId: tx.id,
    amount: withdrawAmt,
    balance: currentUser.balance,
  });
});

app.get('/api/wallet/transactions', (_req, res) => {
  res.json(transactions);
});

// Matches & Odds with Redis Cache-Aside & API-Football
app.get('/api/matches/live', async (req, res) => {
  const { sport } = req.query;
  const sportStr = (sport as string) || 'all';
  try {
    const live = await apiFootballService.getLiveMatches(sportStr);
    res.json(live);
  } catch (err: any) {
    let filtered = matches.filter((m) => m.isLive);
    if (sport && sport !== 'all') {
      filtered = filtered.filter((m) => m.sport === sport);
    }
    res.json(filtered);
  }
});

app.get('/api/matches/upcoming', async (req, res) => {
  const { sport } = req.query;
  const sportStr = (sport as string) || 'all';
  try {
    const upcoming = await apiFootballService.getUpcomingMatches(sportStr);
    res.json({
      content: upcoming,
      totalElements: upcoming.length,
      totalPages: 1,
      size: upcoming.length,
      number: 0,
    });
  } catch (err) {
    let filtered = matches;
    if (sport && sport !== 'all') {
      filtered = filtered.filter((m) => m.sport === sport);
    }
    res.json({
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      size: filtered.length,
      number: 0,
    });
  }
});

app.get('/api/matches/search', (req, res) => {
  const query = (req.query.query as string || '').toLowerCase();
  const results = matches.filter(
    (m) =>
      m.team1.toLowerCase().includes(query) ||
      m.team2.toLowerCase().includes(query) ||
      m.league.toLowerCase().includes(query)
  );
  res.json(results);
});

app.get('/api/matches/:id', (req, res) => {
  const match = matches.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

app.get('/api/matches/:id/markets', async (req, res) => {
  try {
    const markets = await apiFootballService.getMatchMarkets(req.params.id);
    if (markets && markets.length > 0) {
      return res.json(markets);
    }
  } catch {}

  const match = matches.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Generate market groups based on match odds
  const marketGroups = [
    {
      id: 'mg-1x2',
      name: '1X2 (Match Winner)',
      markets: [
        {
          id: 'm-1x2',
          name: '1X2',
          odds: [match.odds.w1, match.odds.x, match.odds.w2].filter(Boolean),
        },
      ],
    },
    {
      id: 'mg-double-chance',
      name: 'Double Chance',
      markets: [
        {
          id: 'm-dc',
          name: 'Double Chance',
          odds: [match.odds.x1, match.odds.w12, match.odds.x2].filter(Boolean),
        },
      ],
    },
    {
      id: 'mg-totals',
      name: 'Total Goals / Points',
      markets: [
        {
          id: 'm-total-over',
          name: 'Total Over',
          odds: [match.odds.totalOver].filter(Boolean),
        },
        {
          id: 'm-total-under',
          name: 'Total Under',
          odds: [match.odds.totalUnder].filter(Boolean),
        },
      ],
    },
  ];
  res.json(marketGroups);
});

// --- API-Football & Redis Control Endpoints ---
app.get('/api/football/status', async (_req, res) => {
  const fbStatus = apiFootballService.getStatus();
  const cacheStats = await redisCache.getStats();
  res.json({
    apiFootball: fbStatus,
    redis: cacheStats,
  });
});

app.post('/api/football/sync', async (_req, res) => {
  try {
    const result = await apiFootballService.syncAllFromApi();
    const cacheStats = await redisCache.getStats();
    res.json({
      success: true,
      ...result,
      cacheStats,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/football/configure', (req, res) => {
  const { apiKey, provider } = req.body || {};
  if (apiKey !== undefined) {
    apiFootballService.setApiKey(apiKey, provider || 'api-sports');
  }
  res.json({
    success: true,
    status: apiFootballService.getStatus(),
  });
});

app.get('/api/football/cache/keys', async (_req, res) => {
  const keys = await redisCache.getKeyDetails();
  const stats = await redisCache.getStats();
  res.json({ keys, stats });
});

app.post('/api/football/cache/flush', async (req, res) => {
  const { pattern } = req.body || {};
  if (pattern) {
    const count = await redisCache.delPattern(pattern);
    res.json({ success: true, deletedCount: count, pattern });
  } else {
    await redisCache.flushAll();
    res.json({ success: true, message: 'Redis cache completely flushed.' });
  }
});

app.post('/api/football/drift', async (req, res) => {
  const { matchId } = req.body || {};
  try {
    const driftResult = await apiFootballService.triggerOddsDrift(matchId);
    res.json({ success: true, ...driftResult });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/matches/:id/stats', (req, res) => {
  const match = matches.find((m) => m.id === req.params.id);
  res.json({
    matchId: req.params.id,
    possession1: 54,
    possession2: 46,
    shotsOnTarget1: 6,
    shotsOnTarget2: 3,
    corners1: 7,
    corners2: 4,
    fouls1: 9,
    fouls2: 12,
    yellowCards1: 1,
    yellowCards2: 2,
    redCards1: 0,
    redCards2: 0,
    currentScore: match ? `${match.score1}:${match.score2}` : '0:0',
  });
});

app.get('/api/matches/:id/events', (req, res) => {
  const match = matches.find((m) => m.id === req.params.id);
  res.json([
    {
      id: 'ev-1',
      matchId: req.params.id,
      minute: '24',
      type: 'goal',
      team: match?.team1 || 'Home',
      player: 'Player 1',
      description: 'Goal scored from inside the penalty area',
    },
    {
      id: 'ev-2',
      matchId: req.params.id,
      minute: '41',
      type: 'yellow_card',
      team: match?.team2 || 'Away',
      player: 'Player 2',
      description: 'Tactical foul in midfield',
    },
  ]);
});

// Bets & Betting
app.post('/api/bets/place', (req, res) => {
  const { stake, betType, items } = req.body || {};
  const stakeNum = parseFloat(stake) || 0;
  if (stakeNum <= 0) {
    return res.status(400).json({ error: 'Invalid stake amount' });
  }
  if (currentUser.balance < stakeNum) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  currentUser.balance = +(currentUser.balance - stakeNum).toFixed(2);
  const totalOdds = (items as BetSlipItem[]).reduce((acc, it) => acc * it.odds, 1);
  const potentialWin = +(stakeNum * totalOdds).toFixed(2);

  const newBet: PlacedBet = {
    id: `BET-${Math.floor(100000 + Math.random() * 900000)}`,
    placedAt: 'Just now',
    type: betType || 'single',
    items: items || [],
    totalOdds: +totalOdds.toFixed(2),
    stake: stakeNum,
    potentialWin,
    currency: currentUser.currency,
    status: 'active',
    cashoutValue: +(stakeNum * 0.95).toFixed(2),
  };

  placedBets.unshift(newBet);
  res.json(newBet);
});

app.get('/api/bets/history', (req, res) => {
  const { status } = req.query;
  let list = placedBets;
  if (status) {
    list = list.filter((b) => b.status === status);
  }
  res.json(list);
});

app.get('/api/bets/:id', (req, res) => {
  const bet = placedBets.find((b) => b.id === req.params.id);
  if (!bet) return res.status(404).json({ error: 'Bet not found' });
  res.json(bet);
});

app.post('/api/bets/:id/cashout', (req, res) => {
  const bet = placedBets.find((b) => b.id === req.params.id);
  if (!bet) return res.status(404).json({ error: 'Bet not found' });
  if (bet.status !== 'active') return res.status(400).json({ error: 'Bet cannot be cashed out' });

  bet.status = 'cashed_out';
  currentUser.balance = +(currentUser.balance + bet.cashoutValue).toFixed(2);
  res.json({
    status: 'SUCCESS',
    betId: bet.id,
    cashoutValue: bet.cashoutValue,
    newBalance: currentUser.balance,
  });
});

app.get('/api/bets/:id/cashout-value', (req, res) => {
  const bet = placedBets.find((b) => b.id === req.params.id);
  if (!bet) return res.status(404).json({ error: 'Bet not found' });
  res.json({ cashoutValue: bet.cashoutValue });
});

// Favorites
app.get('/api/favorites', (_req, res) => {
  const favMatches = matches.filter((m) => favoriteMatchIds.has(m.id));
  res.json(favMatches);
});

app.post('/api/favorites/:matchId', (req, res) => {
  favoriteMatchIds.add(req.params.matchId);
  res.json({ success: true });
});

app.delete('/api/favorites/:matchId', (req, res) => {
  favoriteMatchIds.delete(req.params.matchId);
  res.json({ success: true });
});

// Settings
app.get('/api/settings', (_req, res) => {
  res.json(userSettings);
});

app.put('/api/settings', (req, res) => {
  userSettings = { ...userSettings, ...req.body };
  res.json(userSettings);
});

// Webhooks
app.post('/webhook/:provider', (req, res) => {
  res.json({ status: 'received', provider: req.params.provider });
});

// --- Server Lifecycle & Vite Middleware Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fida Bet Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
