import { PolymarketMarket, PolymarketComment } from '../types/polymarket';

// 1. Eight Hero Carousel Slides (as viewed from 00:00 to 00:20 in the video)
export interface HeroSlideItem {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  chanceBadge?: string;
  volume: string;
  chartType: 'step' | 'line' | 'target_twap' | 'multi_line';
  outcomes: {
    name: string;
    probability: number;
    color: string;
    yesPrice?: number;
    noPrice?: number;
    side?: 'yes' | 'no';
  }[];
  commentsTicker: {
    user: string;
    text: string;
    amount?: string;
    positive?: boolean;
  }[];
  resolutionDate?: string;
  priceToBeat?: number;
  currentPrice?: number;
  endsIn?: string;
  upMultiplier?: string;
  downMultiplier?: string;
  prevSlideLabel?: string;
  nextSlideLabel?: string;
}

export const HERO_CAROUSEL_SLIDES: HeroSlideItem[] = [
  // Slide 0: Fed Decision in September?
  {
    id: 'fed-decision',
    category: 'Politics',
    subcategory: 'Fomc',
    title: 'Fed Decision in September?',
    volume: '100M ETB Vol',
    chartType: 'step',
    prevSlideLabel: 'Sports',
    nextSlideLabel: 'Clarity Act',
    outcomes: [
      { name: '25 bps decrease', probability: 0.4, color: '#38bdf8' },
      { name: 'No change', probability: 51, color: '#3b82f6' },
      { name: '25 bps increase', probability: 50, color: '#eab308' },
      { name: '50+ bps increase', probability: 1, color: '#ef4444' },
    ],
    commentsTicker: [
      { user: 'JohnA', text: 'No matter the result, its an honor to gamble with you fellow degens', amount: '+5 ETB', positive: true },
      { user: 'TheAllKnowingSeer', text: 'We shall win.', amount: '+1 ETB', positive: true },
      { user: 'JeanneDelETH', text: 'Foolproof across the casino, thats the intended way, amex', amount: '+133 ETB', positive: true },
      { user: 'MarketMaker99', text: 'Rate cuts locked in for late September cycle', amount: '+112 ETB', positive: true },
    ],
  },
  // Slide: Addis Ababa federally administered city (Ethiopia)
  {
    id: 'eth-addis-federal-city',
    category: 'Politics',
    subcategory: 'Ethiopia',
    title: 'Addis Ababa becomes a federally administered city before 2029?',
    chanceBadge: '26% chance',
    volume: '18M ETB Vol',
    chartType: 'line',
    resolutionDate: 'Ends Jan 1, 2029',
    prevSlideLabel: 'Fed Decision',
    nextSlideLabel: 'National Service',
    outcomes: [
      { name: 'Yes', probability: 26, color: '#10b981', yesPrice: 26, noPrice: 74, side: 'yes' },
      { name: 'No', probability: 74, color: '#ef4444', yesPrice: 74, noPrice: 26, side: 'no' },
    ],
    commentsTicker: [
      { user: 'AddisWatch', text: 'City charter reform is back on the parliamentary agenda', amount: '+40 ETB', positive: true },
      { user: 'HornAnalyst', text: 'Federal-city status would reshape Addis boundary politics', amount: '+22 ETB', positive: true },
      { user: 'PolisETH', text: 'Unlikely before the 2026 election dust settles', amount: '+9 ETB', positive: true },
    ],
  },
  // Slide: Ethiopia mandatory national military service
  {
    id: 'eth-military-service',
    category: 'Politics',
    subcategory: 'Ethiopia · Defense',
    title: 'Ethiopia enacts mandatory national military service before 2029?',
    chanceBadge: '29% chance',
    volume: '16M ETB Vol',
    chartType: 'line',
    resolutionDate: 'Ends Jan 1, 2029',
    prevSlideLabel: 'Addis Ababa',
    nextSlideLabel: 'Red Sea Access',
    outcomes: [
      { name: 'Yes', probability: 29, color: '#10b981', yesPrice: 29, noPrice: 71, side: 'yes' },
      { name: 'No', probability: 71, color: '#ef4444', yesPrice: 71, noPrice: 29, side: 'no' },
    ],
    commentsTicker: [
      { user: 'DefenseDesk', text: 'Conscription debate resurfaces amid regional security posture', amount: '+31 ETB', positive: true },
      { user: 'AbayView', text: 'No draft law tabled yet; voluntary recruitment still the norm', amount: '+12 ETB', positive: true },
      { user: 'MekelleMind', text: 'Watching the next defense proclamation closely', amount: '+7 ETB', positive: true },
    ],
  },
  // Slide: Ethiopia Red Sea port access accord
  {
    id: 'eth-red-sea-access',
    category: 'Politics',
    subcategory: 'Ethiopia · Maritime',
    title: 'Ethiopia secures official Red Sea port access accord before 2027?',
    chanceBadge: '74% chance',
    volume: '42M ETB Vol',
    chartType: 'line',
    resolutionDate: 'Ends Dec 31, 2026',
    prevSlideLabel: 'National Service',
    nextSlideLabel: 'Clarity Act',
    outcomes: [
      { name: 'Yes', probability: 74, color: '#10b981', yesPrice: 74, noPrice: 26, side: 'yes' },
      { name: 'No', probability: 26, color: '#ef4444', yesPrice: 26, noPrice: 74, side: 'no' },
    ],
    commentsTicker: [
      { user: 'RedSeaWatch', text: 'Memoranda signed but ratified sovereign access still pending', amount: '+88 ETB', positive: true },
      { user: 'GulfDesk', text: 'Naval leasing framework rumored for Q4', amount: '+40 ETB', positive: true },
      { user: 'PortsAnalyst', text: 'Regional pushback remains the key risk', amount: '+15 ETB', positive: true },
    ],
  },
  // Slide 1: Clarity Act (H.R.3633) signed into law in 2026?
  {
    id: 'clarity-act',
    category: 'Crypto',
    subcategory: 'Regulation',
    title: 'Clarity Act (H.R.3633) signed into law in 2026?',
    chanceBadge: '16% chance',
    volume: '14M ETB Vol',
    chartType: 'line',
    resolutionDate: 'Ends Jan 1, 2027',
    prevSlideLabel: 'Fed Decision',
    nextSlideLabel: 'BTC 5min Up or Down',
    outcomes: [
      { name: 'Yes', probability: 16, color: '#10b981', yesPrice: 16, noPrice: 84, side: 'yes' },
      { name: 'No', probability: 84, color: '#ef4444', yesPrice: 84, noPrice: 16, side: 'no' },
    ],
    commentsTicker: [
      { user: 'returnMySollo', text: 'Clarity Act signed July', amount: '+112 ETB', positive: true },
      { user: 'State-Asphalt', text: 'Nope. Will never get enough Democrat votes now that they started slush fund for Jan 6 rioters and...', amount: '+100 ETB', positive: true },
      { user: 'SenatorPalpatine', text: 'Then why did you buy 10 shares?', amount: '+250 ETB', positive: true },
      { user: 'Nigel364', text: 'crypto bill has strong bipartisan momentum in committee', amount: '+90 ETB', positive: true },
    ],
  },
  // Slide 2: Bitcoin Up or Down
  {
    id: 'btc-up-down',
    category: 'Crypto',
    subcategory: '5 Min',
    title: 'Bitcoin Up or Down',
    volume: '11M ETB Vol',
    chartType: 'target_twap',
    priceToBeat: 79829,
    currentPrice: 79829,
    endsIn: '3:53',
    upMultiplier: 'UP 2.74X',
    downMultiplier: 'DOWN 1.57X',
    prevSlideLabel: 'Clarity Act',
    nextSlideLabel: 'Midterms',
    outcomes: [
      { name: 'Up', probability: 51, color: '#f59e0b', yesPrice: 51, noPrice: 49 },
      { name: 'Down', probability: 49, color: '#ef4444', yesPrice: 49, noPrice: 51 },
    ],
    commentsTicker: [
      { user: 'skibidi-dbidi', text: 'bop', amount: '+8 ETB', positive: true },
      { user: 'wsggng', text: 'Actually true', amount: '+1 ETB', positive: true },
      { user: 'Noted-Purchase', text: 'Perp is healthier than everything.', amount: '+2 ETB', positive: true },
      { user: 'ghochu', text: 'you can like only one comment a time', amount: '+7 ETB', positive: true },
    ],
  },
  // Slide 3: Balance of Power: 2026 Midterms
  {
    id: 'midterms-balance-power',
    category: 'Politics',
    subcategory: 'US Election',
    title: 'Balance of Power: 2026 Midterms',
    volume: '11M ETB Vol',
    chartType: 'multi_line',
    resolutionDate: 'Ends Nov 3, 2026',
    prevSlideLabel: 'BTC 5min Up or Down',
    nextSlideLabel: 'Best AI',
    outcomes: [
      { name: 'Democrats Sweep', probability: 51, color: '#3b82f6' },
      { name: 'D Senate, R House', probability: 1, color: '#a855f7' },
      { name: 'R Senate, D House', probability: 36, color: '#06b6d4' },
      { name: 'Republicans Sweep', probability: 12, color: '#ef4444' },
    ],
    commentsTicker: [
      { user: 'AP News', text: 'Midterm mail ballots start to go to voters as litigation over Trump order creates uncertainty', amount: '+14 ETB', positive: true },
      { user: 'Bloomberg', text: 'Trump Seeks to Move Case to Conviction for Midterms', amount: '+8 ETB', positive: true },
      { user: 'Constitutionalist', text: 'Senate map is razor thin across 4 key swing states', amount: '+3 ETB', positive: true },
    ],
  },
  // Slide 4: Which company has the best AI model end of September?
  {
    id: 'best-ai-september',
    category: 'Tech',
    subcategory: 'AI',
    title: 'Which company has the best AI model end of September?',
    volume: '2M ETB Vol',
    chartType: 'step',
    prevSlideLabel: 'Midterms',
    nextSlideLabel: 'Iron Blockade',
    outcomes: [
      { name: 'Anthropic', probability: 84, color: '#38bdf8' },
      { name: 'OpenAI', probability: 14, color: '#10b981' },
      { name: 'Google', probability: 2, color: '#f59e0b' },
      { name: 'Meta', probability: 0.5, color: '#a855f7' },
    ],
    commentsTicker: [
      { user: 'pooperman', text: 'If you actually used LMArena, Grok will say its an outdated model. Congrats, you played yourself.', amount: '+50 ETB', positive: true },
      { user: 'DYING-IN-XXTYLE-PART...', text: '-50% on your position lol', amount: '+8 ETB', positive: true },
      { user: 'BoneWong', text: 'Sonnet 3.5 update is unbeatable on coding benchmarks', amount: '+350 ETB', positive: true },
      { user: 'DeepMindEnthusiast', text: 'Gemini Flash 2.0 release could shake up the leaderboard', amount: '+17 ETB', positive: true },
    ],
  },
  // Slide 5: CS2 Spirit vs MOUZ
  {
    id: 'cs2-spirit-mouz',
    category: 'Esports',
    subcategory: 'CS2 BLAST Open',
    title: 'Spirit vs MOUZ · Game 4 of 5',
    volume: '4.4M ETB Vol',
    chartType: 'line',
    prevSlideLabel: 'Best AI',
    nextSlideLabel: 'Brewers vs Reds',
    outcomes: [
      { name: 'Spirit', probability: 83, color: '#38bdf8', yesPrice: 83, noPrice: 17 },
      { name: 'MOUZ', probability: 17, color: '#ef4444', yesPrice: 17, noPrice: 83 },
    ],
    commentsTicker: [
      { user: 'DonkCS', text: 'Donk with 1.45 rating on Mirage is unfair', amount: '+210 ETB', positive: true },
      { user: 'siuhyFan', text: 'MOUZ force buy comeback incoming on map 4', amount: '+40 ETB', positive: true },
    ],
  },
  // Slide 6: Brewers vs Reds
  {
    id: 'mlb-brewers-reds',
    category: 'Sports',
    subcategory: 'MLB',
    title: 'Brewers vs Reds · Bot 5th',
    volume: '938.1K ETB Vol',
    chartType: 'line',
    prevSlideLabel: 'Spirit vs MOUZ',
    nextSlideLabel: 'Taiwan Invasion',
    outcomes: [
      { name: 'Brewers (88-55)', probability: 15, color: '#3b82f6', yesPrice: 15, noPrice: 85 },
      { name: 'Reds (68-74)', probability: 86, color: '#ef4444', yesPrice: 86, noPrice: 14 },
    ],
    commentsTicker: [
      { user: 'EllyDeLaCruz', text: 'Bases loaded 2 outs in bottom of the 5th', amount: '+85 ETB', positive: true },
      { user: 'BrewCrew99', text: 'Bullpen warming up, still have 4 innings', amount: '+12 ETB', positive: true },
    ],
  },
  // Slide 7: Will China invade Taiwan by end of 2026?
  {
    id: 'china-taiwan-2026',
    category: 'Geopolitics',
    subcategory: 'Asia-Pacific',
    title: 'Will China invade Taiwan by end of 2026?',
    chanceBadge: '4% chance',
    volume: '4.1M ETB Vol',
    chartType: 'line',
    resolutionDate: 'Ends Dec 31, 2026',
    prevSlideLabel: 'Brewers vs Reds',
    nextSlideLabel: 'Fed Decision',
    outcomes: [
      { name: 'Yes', probability: 4, color: '#10b981', yesPrice: 4, noPrice: 96, side: 'yes' },
      { name: 'No', probability: 96, color: '#ef4444', yesPrice: 96, noPrice: 4, side: 'no' },
    ],
    commentsTicker: [
      { user: 'TaipeiTrader', text: 'Status quo remains overwhelming consensus for now', amount: '+940 ETB', positive: true },
      { user: 'GeopoliticsDaily', text: 'Naval exercises in strait recorded routine volume', amount: '+25 ETB', positive: true },
    ],
  },
];

// 2. Combos Live Matches & Sports (From 00:20 - 00:30 in the video)
export interface CombosSportCategory {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export const COMBOS_SPORTS_CATEGORIES: CombosSportCategory[] = [
  { id: 'all', name: 'All', count: 409 },
  { id: 'nfl', name: 'NFL', count: 4 },
  { id: 'mlb', name: 'MLB', count: 6 },
  { id: 'college_football', name: 'College Football', count: 4 },
  { id: 'ufc', name: 'UFC', count: 4 },
  { id: 'soccer', name: 'Soccer', count: 312 },
  { id: 'tennis', name: 'Tennis', count: 27 },
  { id: 'cricket', name: 'Cricket', count: 25 },
  { id: 'basketball', name: 'Basketball', count: 4 },
  { id: 'pickleball', name: 'Pickleball', count: 2 },
  { id: 'esports', name: 'Esports', count: 27 },
];

export interface CombosLiveMatch {
  id: string;
  sport: string;
  league: string;
  volume: string;
  status: string;
  team1: { name: string; score?: number | string; badge?: string };
  team2: { name: string; score?: number | string; badge?: string };
  moneyline: { team1Odds: string; team2Odds: string };
  spread: { label1: string; odds1: string; label2: string; odds2: string };
  total: { label1: string; odds1: string; label2: string; odds2: string };
}

export const COMBOS_LIVE_MATCHES: CombosLiveMatch[] = [
  {
    id: 'cs2-spirit-mouz',
    sport: 'Esports',
    league: 'CS2 · BLAST Open',
    volume: '4.4M ETB Vol',
    status: '4/5 Esports',
    team1: { name: 'Spirit', score: 5, badge: 'TS' },
    team2: { name: 'MOUZ', score: 1, badge: 'MOUZ' },
    moneyline: { team1Odds: '1.15X', team2Odds: '7.14X' },
    spread: { label1: 'TS7 -1.5', odds1: '78%', label2: 'MOUZ +1.5', odds2: '16%' },
    total: { label1: 'O 4.5', odds1: '0.84', label2: 'U 4.5', odds2: '72%' },
  },
  {
    id: 'cs2-bounty-imperial',
    sport: 'Esports',
    league: 'CS2 · CCT South America',
    volume: '12.9K ETB Vol',
    status: '3/3 Esports',
    team1: { name: 'Bounty Hunte...', score: 5, badge: 'BHE' },
    team2: { name: 'Imperial', score: 4, badge: 'IMP' },
    moneyline: { team1Odds: '2.27X', team2Odds: '1000.00X' },
    spread: { label1: 'BHE +1.5', odds1: '99.9%', label2: 'IMP11 -1.5', odds2: '0.1%' },
    total: { label1: 'O 2.5', odds1: '0.84', label2: 'U 2.5', odds2: '0.16' },
  },
  {
    id: 'lol-karmin-furia',
    sport: 'Esports',
    league: 'LoL · CBLOL',
    volume: '24.9K ETB Vol',
    status: 'Game 2 of 5 Esports',
    team1: { name: 'Karmin Corp', score: 4, badge: 'KC' },
    team2: { name: 'FURIA', score: 1, badge: 'FUR' },
    moneyline: { team1Odds: '3.13X', team2Odds: '29.41X' },
    spread: { label1: 'KC', odds1: '32%', label2: 'FUR -1.5', odds2: '1.25', },
    total: { label1: 'KC', odds1: '+2.5', label2: 'RED +1.5', odds2: '49%' },
  },
  {
    id: 'mlb-brewers-reds',
    sport: 'MLB',
    league: 'MLB',
    volume: '938.1K ETB Vol',
    status: 'Bot 4th',
    team1: { name: 'Brewers (88-55)', score: 'MIL' },
    team2: { name: 'Reds (68-74)', score: 'CIN' },
    moneyline: { team1Odds: 'MIL 15%', team2Odds: 'CIN 86%' },
    spread: { label1: 'MIL +3.5', odds1: '66%', label2: 'CIN -3.5', odds2: '36%' },
    total: { label1: 'O 11.5', odds1: '52%', label2: 'U 11.5', odds2: '48%' },
  },
  {
    id: 'mlb-braves-phillies',
    sport: 'MLB',
    league: 'MLB',
    volume: '97.34K ETB Vol',
    status: 'Mid 2nd',
    team1: { name: 'Braves (84-58)', score: 'ATL' },
    team2: { name: 'Phillies (80-62)', score: 'PHI' },
    moneyline: { team1Odds: 'ATL 30%', team2Odds: 'PHI 80%' },
    spread: { label1: 'ATL +1.5', odds1: '77%', label2: 'PHI -1.5', odds2: '65%' },
    total: { label1: 'O 8.5', odds1: '35%', label2: 'U 8.5', odds2: '71%' },
  },
  {
    id: 'mlb-redsox-orioles',
    sport: 'MLB',
    league: 'MLB',
    volume: '608.6K ETB Vol',
    status: 'Bot 2nd',
    team1: { name: 'Red Sox (70-65)', score: 'BOS' },
    team2: { name: 'Orioles (69-74)', score: 'BAL' },
    moneyline: { team1Odds: 'BOS 74%', team2Odds: 'BAL 25%' },
    spread: { label1: 'BOS -2.5', odds1: '47%', label2: 'BAL +2.5', odds2: '54%' },
    total: { label1: 'O 9.5', odds1: '55%', label2: 'U 9.5', odds2: '46%' },
  },
];

// 3. Perps Tokens List (From 00:31 - 00:35 in the video)
export interface PerpToken {
  symbol: string;
  name?: string;
  price: string;
  change: string;
  positive: boolean;
  volume: string;
  isLive: boolean;
  category: 'Crypto' | 'Stocks' | 'Commodities' | 'Indices';
  logoBg: string;
}

export const PERP_TOKENS: PerpToken[] = [
  { symbol: 'PUMP', price: '0.003852 ETB', change: '-0.000180 ETB (4.46%)', positive: false, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#10b981' },
  { symbol: 'ZEC', price: '1,213.3 ETB', change: '+170.19 ETB (17.39%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#f59e0b' },
  { symbol: 'FARTCOIN', price: '0.18298 ETB', change: '-0.015213 ETB (7.10%)', positive: false, volume: '2M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#8b5cf6' },
  { symbol: 'KSHIB', price: '0.005433 ETB', change: '-0.000109 ETB (1.71%)', positive: false, volume: '2M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#ef4444' },
  { symbol: 'BTC', price: '79,785 ETB', change: '+174.00 ETB (0.21%)', positive: true, volume: '2M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#f59e0b' },
  { symbol: 'ZRO', price: '1.0956 ETB', change: '+0.0303 ETB (2.84%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#3b82f6' },
  { symbol: 'SOL', price: '106.41 ETB', change: '+2.52 ETB (2.43%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#14b8a6' },
  { symbol: 'LIT', price: '4.6786 ETB', change: '-0.0919 ETB (1.96%)', positive: false, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#6366f1' },
  { symbol: 'NEAR', price: '2.3776 ETB', change: '+0.1400 ETB (6.26%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#06b6d4' },
  { symbol: 'ETH', price: '2,492.5 ETB', change: '+14.50 ETB (0.58%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#627eea' },
  { symbol: 'HYPE', price: '87.89 ETB', change: '+2.374 ETB (2.78%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#ec4899' },
  { symbol: 'CRCL', price: '104.04 ETB', change: '+2.29 ETB (2.25%)', positive: true, volume: '1M ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#38bdf8' },
  { symbol: 'MSTR', price: '143.81 ETB', change: '+0.12 ETB (0.08%)', positive: true, volume: '961K ETB Vol.', isLive: true, category: 'Stocks', logoBg: '#dc2626' },
  { symbol: 'COIN', price: '185.74 ETB', change: '-0.16 ETB (0.08%)', positive: false, volume: '888K ETB Vol.', isLive: true, category: 'Stocks', logoBg: '#0284c7' },
  { symbol: 'DOGE', price: '0.089112 ETB', change: '-0.000349 ETB (0.39%)', positive: false, volume: '800K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#eab308' },
  { symbol: 'TAO', price: '259.21 ETB', change: '+24.72 ETB (10.54%)', positive: true, volume: '771K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#10b981' },
  { symbol: 'SUI', price: '0.79772 ETB', change: '+0.06126 ETB (7.68%)', positive: true, volume: '768K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#0ea5e9' },
  { symbol: 'ADA', price: '0.21886 ETB', change: '-0.00248 ETB (1.12%)', positive: false, volume: '677K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#2563eb' },
  { symbol: 'AMD', price: '479.36 ETB', change: '+2.50 ETB (0.52%)', positive: true, volume: '671K ETB Vol.', isLive: true, category: 'Stocks', logoBg: '#b91c1c' },
  { symbol: 'GOLD', price: '4,430.8 ETB', change: '-7.10 ETB (0.16%)', positive: false, volume: '651K ETB Vol.', isLive: true, category: 'Commodities', logoBg: '#fbbf24' },
  { symbol: 'ONDO', price: '0.37825 ETB', change: '-0.00980 ETB (2.66%)', positive: false, volume: '604K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#475569' },
  { symbol: 'SKHY', price: '176.35 ETB', change: '-0.45 ETB (0.26%)', positive: false, volume: '601K ETB Vol.', isLive: true, category: 'Stocks', logoBg: '#059669' },
  { symbol: 'BNB', price: '747.98 ETB', change: '+29.80 ETB (4.04%)', positive: true, volume: '587K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#f59e0b' },
  { symbol: 'UNI', price: '7.1896 ETB', change: '+0.2665 ETB (3.71%)', positive: true, volume: '565K ETB Vol.', isLive: true, category: 'Crypto', logoBg: '#ff007a' },
];

// 4. Breaking News Top Movers (From 00:36 - 00:41 in the video)
export interface BreakingNewsItem {
  rank: number;
  title: string;
  probability: number;
  change: string;
  isUp: boolean;
  category: string;
  badge?: string;
  date?: string;
}

export const BREAKING_NEWS_ITEMS: BreakingNewsItem[] = [
  { rank: 1, title: 'Will Kimi Antonelli win the 2026 F1 Italian Grand Prix?', probability: 100, change: '95%', isUp: true, category: 'Sports', badge: 'F1' },
  { rank: 2, title: 'Will CDU win less than 20% of all valid second votes?', probability: 99, change: '87%', isUp: true, category: 'Politics', badge: 'CDU' },
  { rank: 3, title: 'Will the AfD win the 2026 Sachsen-Anhalt parliamentary election by at least 25%?', probability: 89, change: '70%', isUp: true, category: 'Politics', badge: 'AfD' },
  { rank: 4, title: 'Will Sven Schulze be the next Minister-President of Sachsen-Anhalt?', probability: 17, change: '56%', isUp: false, category: 'Politics' },
  { rank: 5, title: 'Will Apple release a foldable iPhone by September 30?', probability: 59, change: '38%', isUp: true, category: 'Tech' },
  { rank: 6, title: 'Will Google be the second-best Math AI lab at the end of October 2026?', probability: 26, change: '37%', isUp: false, category: 'Tech' },
  { rank: 7, title: 'Will Russia enter Ternuvate again by October 31?', probability: 90, change: '27%', isUp: true, category: 'World' },
  { rank: 8, title: 'Will Julianne Moore win Best Actress at the 99th Academy Awards?', probability: 53, change: '23%', isUp: true, category: 'Culture' },
  { rank: 9, title: 'Israel military action against Lebanon on September 9?', probability: 78, change: '25%', isUp: true, category: 'World' },
  { rank: 10, title: 'Will Waymo operate in 16-19 cities on December 31 2026?', probability: 28, change: '18%', isUp: false, category: 'Tech' },
  { rank: 11, title: 'SSI public model released by September 30, 2026?', probability: 9, change: '17%', isUp: false, category: 'Tech' },
  { rank: 12, title: 'Will CMI declare a Millennium Prize Problem solved by December 31, 2027?', probability: 26, change: '18%', isUp: true, category: 'Culture' },
  { rank: 13, title: "Will OpenAI's Astra Model debut on the Arena Leaderboard at a score of at least 1500?", probability: 28, change: '15%', isUp: false, category: 'Tech' },
  { rank: 14, title: 'Will Russia and Ukraine hold any diplomatic meeting by September 15, 2026?', probability: 22, change: '13%', isUp: false, category: 'World' },
];

// 5. Mention Polymarkets (From 01:57 - 02:04 in the video)
export interface MentionEvent {
  id: string;
  day: string;
  month: string;
  timeInfo: string;
  title: string;
  badgeImageUrl?: string;
  options: { label: string; count?: string; price?: number }[];
  moreCount: number;
}

export const MENTION_EVENTS: MentionEvent[] = [
  {
    id: 'mention-allin-sep4',
    day: '4',
    month: 'Sep',
    timeInfo: 'Fri, 11:00 PM · LIVE 4,244 ETB Vol.',
    title: 'What will be said on the next All-In Podcast? [September 4]',
    options: [
      { label: 'AI 50+ times' },
      { label: 'Hundred / Thousand / Million 10+ times' },
    ],
    moreCount: 9,
  },
  {
    id: 'mention-trump-sep6',
    day: '6',
    month: 'Sep',
    timeInfo: 'Sun, 11:00 PM · 12,343 ETB Vol.',
    title: 'What will Trump say this week? (August 31 - September 6)',
    options: [
      { label: '11,888' },
      { label: 'Droneport' },
    ],
    moreCount: 21,
  },
  {
    id: 'mention-elon-sep6',
    day: '6',
    month: 'Sep',
    timeInfo: 'Sun, 11:00 PM · + NEW',
    title: 'What will Elon post this week? (August 31 - September 6)',
    options: [
      { label: 'Mexico' },
      { label: 'Border' },
    ],
    moreCount: 10,
  },
  {
    id: 'mention-trump-post-sep6',
    day: '6',
    month: 'Sep',
    timeInfo: 'Sun, 11:00 PM · + NEW',
    title: 'What will Trump post this week? (August 31 - September 6)',
    options: [
      { label: 'Communist / Communism' },
      { label: 'Allah' },
    ],
    moreCount: 8,
  },
  {
    id: 'mention-bigbrother-sep7',
    day: '7',
    month: 'Sep',
    timeInfo: 'Mon, 1:00 AM · + NEW',
    title: 'What will be said during Episode 30 of Big Brother?',
    options: [
      { label: 'Veto 5+ times' },
      { label: 'Surprise' },
    ],
    moreCount: 12,
  },
  {
    id: 'mention-curtis-sep7',
    day: '7',
    month: 'Sep',
    timeInfo: 'Mon, 1:00 AM · + NEW',
    title: 'What will be said during the seventh episode of President Curtis: Season 1?',
    options: [
      { label: 'President 10+ times' },
      { label: 'Agent 5+ times' },
    ],
    moreCount: 12,
  },
  {
    id: 'mention-steel-sep8',
    day: '8',
    month: 'Sep',
    timeInfo: 'Tue, 5:00 PM · + NEW',
    title: 'What will Trump say during remarks at Steel Across America?',
    options: [
      { label: 'Hundred / Thousand 15+ times' },
      { label: 'First 5+ times' },
    ],
    moreCount: 18,
  },
  {
    id: 'mention-rogan-sep8',
    day: '8',
    month: 'Sep',
    timeInfo: 'Tue, 5:00 PM · + NEW',
    title: 'What will be said on the first Joe Rogan Experience episode of the week? [September 7]',
    options: [
      { label: 'People 200+ times' },
      { label: 'People 100+ times' },
    ],
    moreCount: 15,
  },
];

// 6. Weather Forecast Markets (From 01:49 - 01:56 in the video)
export interface WeatherCityMarket {
  id: string;
  city: string;
  date: string;
  volume: string;
  options: {
    temp: string;
    probability: number;
    yesPrice: number;
    noPrice: number;
  }[];
}

export const WEATHER_CITY_MARKETS: WeatherCityMarket[] = [
  {
    id: 'weather-addis-ababa',
    city: 'Addis Ababa 🇪🇹',
    date: 'September 7',
    volume: '48K ETB Vol. · Daily',
    options: [
      { temp: '23°C', probability: 58, yesPrice: 58.0, noPrice: 42.0 },
      { temp: '24°C', probability: 31, yesPrice: 31.0, noPrice: 69.0 },
      { temp: '25°C', probability: 11, yesPrice: 11.0, noPrice: 89.0 },
    ],
  },
  {
    id: 'weather-bahir-dar',
    city: 'Bahir Dar (Lake Tana) 🇪🇹',
    date: 'September 7',
    volume: '29K ETB Vol. · Daily',
    options: [
      { temp: '27°C', probability: 64, yesPrice: 64.0, noPrice: 36.0 },
      { temp: '28°C', probability: 28, yesPrice: 28.0, noPrice: 72.0 },
    ],
  },
  {
    id: 'weather-dire-dawa',
    city: 'Dire Dawa 🇪🇹',
    date: 'September 7',
    volume: '22K ETB Vol. · Daily',
    options: [
      { temp: '33°C', probability: 60, yesPrice: 60.0, noPrice: 40.0 },
      { temp: '34°C', probability: 35, yesPrice: 35.0, noPrice: 65.0 },
    ],
  },
  {
    id: 'weather-hawassa',
    city: 'Hawassa 🇪🇹',
    date: 'September 7',
    volume: '19K ETB Vol. · Daily',
    options: [
      { temp: '26°C', probability: 54, yesPrice: 54.0, noPrice: 46.0 },
      { temp: '27°C', probability: 36, yesPrice: 36.0, noPrice: 64.0 },
    ],
  },
  {
    id: 'weather-wellington',
    city: 'Wellington',
    date: 'September 7',
    volume: '69K ETB Vol. · Daily',
    options: [
      { temp: '10°C', probability: 56, yesPrice: 56.7, noPrice: 45.0 },
      { temp: '11°C', probability: 33, yesPrice: 33.0, noPrice: 67.0 },
    ],
  },
  {
    id: 'weather-tokyo',
    city: 'Tokyo',
    date: 'September 7',
    volume: '33K ETB Vol. · Daily',
    options: [
      { temp: '27°C', probability: 32, yesPrice: 32.0, noPrice: 68.0 },
      { temp: '26°C', probability: 26, yesPrice: 26.0, noPrice: 74.0 },
    ],
  },
  {
    id: 'weather-newyork',
    city: 'New York (Central Park)',
    date: 'September 7',
    volume: '51K ETB Vol. · Daily',
    options: [
      { temp: '77-78°F', probability: 52, yesPrice: 52.0, noPrice: 48.0 },
      { temp: '79-80°F', probability: 38, yesPrice: 38.0, noPrice: 62.0 },
    ],
  },
  {
    id: 'weather-dubai',
    city: 'Dubai',
    date: 'September 7',
    volume: '37K ETB Vol. · Daily',
    options: [
      { temp: '39°C', probability: 67, yesPrice: 67.0, noPrice: 33.0 },
      { temp: '40°C', probability: 28, yesPrice: 28.0, noPrice: 72.0 },
    ],
  },
  {
    id: 'weather-nairobi',
    city: 'Nairobi',
    date: 'September 7',
    volume: '25K ETB Vol. · Daily',
    options: [
      { temp: '24°C', probability: 59, yesPrice: 59.0, noPrice: 41.0 },
      { temp: '25°C', probability: 33, yesPrice: 33.0, noPrice: 67.0 },
    ],
  },
  {
    id: 'weather-shanghai',
    city: 'Shanghai',
    date: 'September 7',
    volume: '24K ETB Vol. · Daily',
    options: [
      { temp: '30°C', probability: 62, yesPrice: 62.0, noPrice: 38.0 },
      { temp: '31°C', probability: 29, yesPrice: 29.0, noPrice: 71.0 },
    ],
  },
  {
    id: 'weather-singapore',
    city: 'Singapore',
    date: 'September 7',
    volume: '24K ETB Vol. · Daily',
    options: [
      { temp: '33°C', probability: 80, yesPrice: 80.0, noPrice: 20.0 },
      { temp: '32°C', probability: 13, yesPrice: 13.0, noPrice: 87.0 },
    ],
  },
  {
    id: 'weather-beijing',
    city: 'Beijing',
    date: 'September 7',
    volume: '22K ETB Vol. · Daily',
    options: [
      { temp: '30°C', probability: 35, yesPrice: 35.0, noPrice: 65.0 },
      { temp: '29°C', probability: 26, yesPrice: 26.0, noPrice: 74.0 },
    ],
  },
  {
    id: 'weather-paris',
    city: 'Paris',
    date: 'September 7',
    volume: '21K ETB Vol. · Daily',
    options: [
      { temp: '28°C', probability: 51, yesPrice: 51.0, noPrice: 49.0 },
      { temp: '27°C', probability: 31, yesPrice: 31.0, noPrice: 69.0 },
    ],
  },
  {
    id: 'weather-london',
    city: 'London',
    date: 'September 7',
    volume: '19K ETB Vol. · Daily',
    options: [
      { temp: '24°C', probability: 49, yesPrice: 49.0, noPrice: 51.0 },
      { temp: '25°C', probability: 37, yesPrice: 37.0, noPrice: 63.0 },
    ],
  },
  {
    id: 'weather-cairo',
    city: 'Cairo',
    date: 'September 7',
    volume: '21K ETB Vol. · Daily',
    options: [
      { temp: '35°C', probability: 65, yesPrice: 65.0, noPrice: 35.0 },
      { temp: '36°C', probability: 27, yesPrice: 27.0, noPrice: 73.0 },
    ],
  },
  {
    id: 'weather-telaviv',
    city: 'Tel Aviv',
    date: 'September 7',
    volume: '19K ETB Vol. · Daily',
    options: [
      { temp: '32°C', probability: 60, yesPrice: 60.0, noPrice: 40.0 },
      { temp: '33°C', probability: 42, yesPrice: 42.0, noPrice: 58.0 },
    ],
  },
  {
    id: 'weather-miami',
    city: 'Miami',
    date: 'September 7',
    volume: '28K ETB Vol. · Daily',
    options: [
      { temp: '90-91°F', probability: 55, yesPrice: 55.0, noPrice: 45.0 },
      { temp: '92-93°F', probability: 28, yesPrice: 28.0, noPrice: 72.0 },
    ],
  },
];

export interface WeatherEventMarket {
  id: string;
  category: 'Precipitation' | 'Drought' | 'Global' | 'Hurricanes' | 'Earthquakes' | 'Tornadoes' | 'Pandemics';
  title: string;
  region: string;
  volume: string;
  chance: number;
  yesPrice: number;
  noPrice: number;
  endsDate: string;
  description: string;
}

export const WEATHER_EVENT_MARKETS: WeatherEventMarket[] = [
  {
    id: 'weath-eth-kiremt-above',
    category: 'Precipitation',
    title: 'Ethiopian Highlands Kiremt seasonal rainfall above 30-year climatological normal?',
    region: 'Ethiopia 🇪🇹',
    volume: '6.2M ETB Vol.',
    chance: 58,
    yesPrice: 58,
    noPrice: 42,
    endsDate: 'Oct 15, 2026',
    description: 'Resolves based on the Ethiopian Meteorology Institute (EMI) comprehensive rainy season review comparing cumulative rainfall to baseline.',
  },
  {
    id: 'weath-eth-tana-level',
    category: 'Drought',
    title: 'Lake Tana water reservoir level remains in surplus zone through Q4 2026?',
    region: 'Ethiopia 🇪🇹',
    volume: '4.8M ETB Vol.',
    chance: 81,
    yesPrice: 81,
    noPrice: 19,
    endsDate: 'Nov 30, 2026',
    description: 'Resolves to Yes if the Ministry of Water and Energy gauge readings confirm Lake Tana elevation stays above 1,786.0 meters.',
  },
  {
    id: 'weath-eth-awash-flood',
    category: 'Precipitation',
    title: 'Awash River Basin reaches red flood warning stage in 2026?',
    region: 'Ethiopia 🇪🇹',
    volume: '3.5M ETB Vol.',
    chance: 44,
    yesPrice: 44,
    noPrice: 56,
    endsDate: 'Sep 30, 2026',
    description: 'Resolves to Yes if the National Disaster Risk Management Commission issues an active Red Level flood stage alert for the Middle Awash.',
  },
  {
    id: 'weath-global-2026-warmest',
    category: 'Global',
    title: '2026 ranks among the top 3 warmest years in recorded history (NOAA/Copernicus)?',
    region: 'Global',
    volume: '31.4M ETB Vol.',
    chance: 86,
    yesPrice: 86,
    noPrice: 14,
    endsDate: 'Jan 15, 2027',
    description: 'Resolves according to the NOAA National Centers for Environmental Information and Copernicus Climate Change Service annual consensus report.',
  },
  {
    id: 'weath-lanina-q4',
    category: 'Global',
    title: 'NOAA officially confirms La Niña conditions through December 2026?',
    region: 'Pacific / Horn of Africa',
    volume: '14.9M ETB Vol.',
    chance: 72,
    yesPrice: 72,
    noPrice: 28,
    endsDate: 'Dec 31, 2026',
    description: 'Based on the Climate Prediction Center Oceanic Niño Index (ONI) running 3-month average of Sea Surface Temperatures.',
  },
  {
    id: 'weath-atlantic-named-hurricanes',
    category: 'Hurricanes',
    title: 'Atlantic Hurricane Season produces 18 or more named tropical storms in 2026?',
    region: 'North Atlantic',
    volume: '19.2M ETB Vol.',
    chance: 63,
    yesPrice: 63,
    noPrice: 37,
    endsDate: 'Nov 30, 2026',
    description: 'Resolves to Yes if the National Hurricane Center designates 18 or more tropical storms or hurricanes during the official calendar season.',
  },
  {
    id: 'weath-cat5-landfall',
    category: 'Hurricanes',
    title: 'Category 5 Hurricane makes direct continental landfall in North America or Caribbean?',
    region: 'Caribbean / US',
    volume: '11.8M ETB Vol.',
    chance: 34,
    yesPrice: 34,
    noPrice: 66,
    endsDate: 'Nov 30, 2026',
    description: 'Resolves according to post-storm tropical cyclone reports published by the National Hurricane Center.',
  },
  {
    id: 'weath-drought-mead-pool',
    category: 'Drought',
    title: 'Lake Mead water elevation drops below 1,040 feet before end of 2026?',
    region: 'North America',
    volume: '8.4M ETB Vol.',
    chance: 29,
    yesPrice: 29,
    noPrice: 71,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves based on the US Bureau of Reclamation daily water operations reports for Hoover Dam.',
  },
  {
    id: 'weath-eth-drought-horn',
    category: 'Drought',
    title: 'Horn of Africa regional drought emergency declared in Somali/Afar regions in 2026?',
    region: 'Ethiopia 🇪🇹',
    volume: '4.1M ETB Vol.',
    chance: 38,
    yesPrice: 38,
    noPrice: 62,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves to Yes if the IGAD Climate Prediction and Applications Centre (ICPAC) classifies Eastern Ethiopia in extreme severe drought.',
  },
  {
    id: 'weath-us-tornadoes-1400',
    category: 'Tornadoes',
    title: 'US confirmed tornadoes exceed 1,400 during 2026 (NOAA Storm Prediction Center)?',
    region: 'North America',
    volume: '5.6M ETB Vol.',
    chance: 49,
    yesPrice: 49,
    noPrice: 51,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves according to the NOAA Storm Prediction Center final annual tornado database count.',
  },
  {
    id: 'weath-earthquake-m8',
    category: 'Earthquakes',
    title: 'Magnitude 8.0+ major earthquake occurs along Pacific Ring of Fire in 2026?',
    region: 'Pacific Basin',
    volume: '12.7M ETB Vol.',
    chance: 51,
    yesPrice: 51,
    noPrice: 49,
    endsDate: 'Dec 31, 2026',
    description: 'Resolves based on the United States Geological Survey (USGS) Earthquake Hazards Program catalog.',
  },
];

// 7. Art Prediction Markets (From 02:25 - 02:30 in the video)
export interface ArtMarketCard {
  id: string;
  title: string;
  volume: string;
  chance?: string;
  options?: { name: string; probability: number; yesPrice: number; noPrice: number }[];
  partnerBadge: string;
}

export const ART_MARKETS: ArtMarketCard[] = [
  {
    id: 'art-banksy-ig',
    title: 'Will Banksy post to Instagram by September 30?',
    chance: '20% chance',
    volume: '13K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
  {
    id: 'art-turner-prize-2026',
    title: 'Turner Prize 2026 Winner',
    volume: '13K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
    options: [
      { name: 'Tanoa Sasraku', probability: 31, yesPrice: 31, noPrice: 69 },
      { name: 'Kira Freije', probability: 27, yesPrice: 27, noPrice: 73 },
    ],
  },
  {
    id: 'art-market-65b',
    title: 'Will global art market sales hit 65 ETB billion for 2026?',
    chance: '12% chance',
    volume: '18K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
  {
    id: 'art-ai-10m-auction',
    title: 'AI artwork hits 10M ETB at major auction in 2026?',
    chance: '13% chance',
    volume: '13K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
  {
    id: 'art-china-no2',
    title: 'Will China become the #2 global art market in 2026?',
    chance: '12% chance',
    volume: '14K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
  {
    id: 'art-top-selling-artist-2026',
    title: 'Who will be the top-selling artist by total auction sales in 2026?',
    volume: '35K ETB Vol. · Asked by Masterworks',
    partnerBadge: 'Asked by Masterworks',
    options: [
      { name: 'Pablo Picasso', probability: 93, yesPrice: 93, noPrice: 7 },
      { name: 'Jean-Michel Basquiat', probability: 4, yesPrice: 4, noPrice: 96 },
    ],
  },
  {
    id: 'art-sell-150m',
    title: 'Will an artwork sell for 150 ETB million by December 31?',
    chance: '54% chance',
    volume: '18K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
  {
    id: 'art-salvator-mundi',
    title: 'Will the Salvator Mundi be publicly exhibited by December 31?',
    chance: '10% chance',
    volume: '12K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
  {
    id: 'art-banksy-mural',
    title: 'Will Banksy create a new mural or street artwork by December 31?',
    chance: '69% chance',
    volume: '22K ETB Vol.',
    partnerBadge: 'Asked by Masterworks',
  },
];

// Frequently Asked Questions on Art / Pop Culture
export const ART_FAQS = [
  {
    q: 'What is Polymarket?',
    a: 'Polymarket is the worlds largest prediction market. It allows you to buy and sell shares on the outcome of future events across politics, culture, economics, crypto, and more.',
  },
  {
    q: 'What is a Art prediction market?',
    a: 'Art prediction markets allow collectors, enthusiasts, and traders to forecast auction prices, gallery milestones, institutional exhibitions, and prize outcomes.',
  },
  {
    q: 'What topics can I trade on in the Pop Culture category?',
    a: 'Topics range from award ceremonies (Oscars, Grammys), streaming benchmarks (Netflix, YouTube), box office totals, celebrity social media metrics, and viral cultural milestones.',
  },
  {
    q: 'How do Pop Culture odds on Polymarket work?',
    a: 'Each share pays out 1.00 ETB if the event occurs, or 0.00 ETB if it does not. The price directly reflects the collective probability (e.g. 54% chance).',
  },
  {
    q: 'Which Art markets are most active right now?',
    a: 'Currently, the Masterworks-sponsored Turner Prize 2026, Banksy street artwork verification, and the 150M ETB single-lot auction milestone are drawing top volume.',
  },
];
