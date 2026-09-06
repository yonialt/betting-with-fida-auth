import { PolymarketMarket, PolymarketHotTopic, PolymarketComment } from '../types/polymarket';

export interface PolymarketSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  prob?: number;
  change?: string;
  flag?: string;
  type: 'market' | 'profile';
  sparkline?: number[];
}

export const POLYMARKET_SEARCH_AUTOCOMPLETE: PolymarketSearchItem[] = [
  {
    id: 'pm-eth-5m',
    title: '5 Minute Ethereum Polymarkets',
    subtitle: 'Trade on whether Ethereum will go up or down in the next 5 minutes.',
    type: 'market',
    sparkline: [45, 48, 52, 50, 48],
  },
  {
    id: 'pm-ethiopia-pm',
    title: 'Next Prime Minister of Ethiopia?',
    subtitle: 'Abiy Ahmed',
    prob: 97,
    date: 'December 31, 2026',
    flag: '🇪🇹',
    type: 'market',
    sparkline: [95, 96, 96.5, 97, 97],
  },
  {
    id: 'pm-ebola-2026',
    title: 'Which countries will have Ebola case in 2026?',
    subtitle: '55% Ethiopia',
    prob: 55,
    type: 'market',
    sparkline: [30, 40, 45, 52, 55],
  },
  {
    id: 'pm-megeth',
    title: 'MEGetH airdrop by...?',
    subtitle: 'December 2026',
    prob: 26,
    type: 'market',
    sparkline: [15, 20, 22, 28, 26],
  },
  {
    id: 'pm-ecuador-ghana',
    title: 'Ecuador vs. Ghana',
    subtitle: 'International Friendly',
    prob: 19,
    type: 'market',
  },
  {
    id: 'pm-ethena-2026',
    title: 'What price will Ethena hit in 2026?',
    prob: 55,
    change: '+ 0.20',
    type: 'market',
    sparkline: [35, 40, 44, 50, 55],
  },
  {
    id: 'pm-ethena-sep',
    title: 'What price will Ethena hit in September?',
    prob: 25,
    change: '+ 0.12',
    type: 'market',
    sparkline: [12, 18, 20, 22, 25],
  },
];

export const POLYMARKET_HERO: PolymarketMarket = {
  id: 'pm-hero-fed-decision',
  title: 'Fed Decision in September?',
  category: 'Politics',
  subcategory: 'Fomc',
  iconType: 'person',
  iconBg: '#1e293b',
  imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=128&h=128&fit=crop',
  volume: '$99,274,089 Vol. • Sep 15, 2026',
  displayType: 'chart_hero',
  outcomes: [
    { name: '50+ bps decrease', probability: 0.4, change: '-38%', yesPrice: 0.4, noPrice: 99.7, volume: '$13,163,792 Vol.' },
    { name: '25 bps decrease', probability: 0.4, change: '-38%', yesPrice: 0.4, noPrice: 99.7, volume: '$30,746,572 Vol.' },
    { name: 'No change', probability: 50, change: '-1%', yesPrice: 50, noPrice: 51, volume: '$3,246,154 Vol.' },
    { name: '25 bps increase', probability: 51, change: '+23%', yesPrice: 51, noPrice: 50, volume: '$18,611,811 Vol.' },
  ],
  rulesText: "The FED interest rates are defined in this market by the upper bound of the target federal funds range. The decisions on the target federal funds range are made by the Federal Open Market Committee (FOMC) meetings. This market will resolve to the amount of basis points the upper bound of the target federal funds rate is changed by versus the level it was prior to the Federal Reserve's September 2026 meeting. If the target federal funds rate is changed to a level not expressed in the displayed options, the change will be rounded up to the nearest option.",
  resolutionSource: 'Federal Open Market Committee (FOMC)',
  resolverAddress: 'UMA 0x9fc47De9D...',
  marketOpened: 'May 13, 2016, 5:10 PM ET',
  commentsCount: 8976,
  commentsList: [
    {
      id: 'c-fed-1',
      author: 'WhaleWatch-48493',
      timeAgo: '29m ago',
      text: 'TheReturnOfDarthMouth holds $3,078,057.91 on 25 bps decrease outcome No. Unrealized profit: $42,067.31. They turned $3,035,990.61 into over $3,078,057.91.',
      likes: 0,
      sharesOutcome: '25 bps decrease No',
    },
    {
      id: 'c-fed-2',
      author: 'betjunkie',
      timeAgo: '1d ago',
      text: 'No Change is a buy below 55c',
      likes: 0,
    },
    {
      id: 'c-fed-3',
      author: 'Hughms2000',
      timeAgo: '2d ago',
      text: 'Coin flip...',
      likes: 1,
    },
  ],
  chartData: {
    labels: [
      'Jul 1', 'Jul 8', 'Jul 15', 'Jul 22', 'Jul 29',
      'Aug 5', 'Aug 12', 'Aug 19', 'Aug 26',
      'Sep 2', 'Sep 9', 'Sep 15, 2026'
    ],
    series: [
      {
        name: '25 bps increase',
        color: '#38bdf8', // blue
        currentVal: 51.0,
        data: [30, 48, 62, 58, 65, 45, 42, 56, 49, 61, 48, 51],
      },
      {
        name: 'No change',
        color: '#f97316', // orange
        currentVal: 50.0,
        data: [70, 52, 38, 42, 35, 55, 58, 44, 51, 39, 52, 50],
      },
      {
        name: '50+ bps increase',
        color: '#eab308',
        currentVal: 0.4,
        data: [0.5, 0.4, 0.4, 0.5, 0.6, 0.4, 0.5, 0.4, 0.5, 0.4, 0.4, 0.4],
      },
      {
        name: '25 bps decrease',
        color: '#a855f7',
        currentVal: 0.4,
        data: [25, 4, 2, 1.5, 1.2, 0.8, 0.6, 0.5, 0.5, 0.4, 0.4, 0.4],
      },
    ],
  },
};

export const ETHIOPIA_PM_MARKET: PolymarketMarket = {
  id: 'pm-ethiopia-pm',
  title: 'Next Prime Minister of Ethiopia?',
  category: 'Elections',
  subcategory: 'Ethiopia',
  countryFlag: '🇪🇹',
  volume: '$285,817,256 Vol. • May 31, 2026',
  displayType: 'multi_outcome',
  commentsCount: 43,
  outcomes: [
    {
      name: 'Abiy Ahmed',
      probability: 97,
      change: '+11%',
      yesPrice: 97.1,
      noPrice: 4.1,
      volume: '$142,743 Vol.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    },
    {
      name: 'Belete Molla',
      probability: 1,
      change: '-42%',
      yesPrice: 0.8,
      noPrice: 99.8,
      volume: '$32,288,756 Vol.',
    },
    {
      name: 'Gedion Timothewos',
      probability: 1,
      change: '-62%',
      yesPrice: 1.3,
      noPrice: 99.8,
      volume: '$15,933,718 Vol.',
    },
    {
      name: 'Berhanu Nega',
      probability: 1,
      change: '-1%',
      yesPrice: 0.4,
      noPrice: 99.8,
      volume: '$14,896,151 Vol.',
    },
    {
      name: 'Aleso Mengesho',
      probability: 1,
      yesPrice: 0.6,
      noPrice: 99.6,
      volume: '$13,577,152 Vol.',
    },
    {
      name: 'Shimelis Abdisa',
      probability: 1,
      yesPrice: 0.5,
      noPrice: 99.5,
      volume: '$41,422,322 Vol.',
    },
    {
      name: 'Adanech Abiebie',
      probability: 0.4,
      yesPrice: 0.5,
      noPrice: 99.8,
      volume: '$89,454,616 Vol.',
    },
    {
      name: 'Demeke Mekonnen',
      probability: 0.4,
      yesPrice: 0.4,
      noPrice: 99.9,
      volume: '$29,298,548 Vol.',
    },
  ],
  rulesText: 'General elections are scheduled to be held in Ethiopia on June 1, 2026. This market will resolve to the next individual who officially assumes the office of Prime Minister of Ethiopia following the 2026 General elections.',
  resolutionSource: 'National Election Board of Ethiopia / Federal Parliamentary Assembly',
  resolverAddress: 'UMA 0x9fc47De9D...',
  marketOpened: 'Apr 27, 2024, 5:49 PM ET',
  commentsList: [
    {
      id: 'c-eth-1',
      author: 'riverroosery733',
      timeAgo: '22d ago',
      text: 'so many volume, why ?',
      likes: 0,
    },
    {
      id: 'c-eth-2',
      author: 'mrodw1',
      timeAgo: '1mo ago',
      text: 'When does it resolve?',
      likes: 2,
    },
    {
      id: 'c-eth-3',
      author: 'cryptopoking',
      timeAgo: '2mo ago',
      text: 'what is ethiopia',
      likes: 0,
    },
    {
      id: 'c-eth-4',
      author: 'Tomgaine',
      timeAgo: '2mo ago',
      text: 'kk',
      likes: 0,
    },
    {
      id: 'c-eth-5',
      author: 'ElonFork',
      timeAgo: '2mo ago',
      text: 'WOW! Ethiopia is nice! Nice and beautifull',
      likes: 1,
      replies: [
        {
          id: 'c-eth-5-1',
          author: 'billsmurlfks',
          timeAgo: '1mo ago',
          text: '@ElonFork not and beautifull',
          likes: 0,
        },
      ],
    },
  ],
  chartData: {
    labels: [
      'May 1', 'May 8', 'May 15', 'May 22', 'May 29',
      'Jun 5', 'Jun 12', 'Jun 19', 'Jun 26',
      'Jul 1', 'Jul 5', 'Jul 8', 'Jul 12', 'Jul 16', 'Jul 20', 'Jul 24', 'Jul 28', 'Jul 31',
      'Aug 4', 'Aug 8', 'Aug 12', 'Aug 16', 'Aug 20', 'Aug 24', 'Aug 28',
      'Sep 1', 'Sep 3', 'Sep 5', 'Sep 6',
    ],
    series: [
      {
        name: 'Abiy Ahmed',
        color: '#38bdf8',
        currentVal: 97.0,
        data: [
          96.2, 95.8, 96.5, 96.0, 95.7,
          96.4, 95.9, 94.8, 93.5,
          88.0, 81.2, 76.5, 78.4, 84.0, 88.5, 91.2, 93.0, 94.5,
          94.8, 95.0, 95.3, 95.1, 95.6, 95.9, 96.2,
          96.5, 96.8, 97.0, 97.0,
        ],
      },
      {
        name: 'Gedion Timothewos',
        color: '#f59e0b',
        currentVal: 1.3,
        data: [
          0.3, 0.3, 0.3, 0.3, 0.3,
          0.3, 0.3, 0.3, 0.3,
          0.3, 0.3, 0.3, 0.4, 0.6, 0.8, 1.2, 1.5, 1.8,
          1.8, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3,
          1.3, 1.3, 1.3, 1.3,
        ],
      },
      {
        name: 'Belete Molla',
        color: '#fb923c',
        currentVal: 0.8,
        data: [
          0.3, 0.3, 0.3, 0.3, 0.3,
          0.3, 0.3, 0.3, 0.3,
          0.3, 0.3, 0.3, 0.4, 0.5, 0.5, 0.6, 0.7, 0.7,
          0.7, 0.7, 0.6, 0.6, 0.7, 0.7, 0.8,
          0.8, 0.8, 0.8, 0.8,
        ],
      },
      {
        name: 'Berhanu Nega',
        color: '#ea580c',
        currentVal: 0.4,
        data: [
          0.5, 0.5, 0.5, 0.5, 0.5,
          0.5, 0.5, 0.5, 0.5,
          0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
          0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
          0.4, 0.4, 0.4, 0.4,
        ],
      },
    ],
  },
};

export const BTC_5M_MARKET: PolymarketMarket = {
  id: 'pm-btc-5m',
  title: 'BTC Up or Down 5m',
  category: 'Crypto',
  subcategory: '5 Min',
  timeRange: 'September 6, 9:55-10AM ET',
  iconType: 'bitcoin',
  volume: '$736 Vol.',
  displayType: 'up_down_btc',
  isLive: true,
  liveTag: 'LIVE Bitcoin',
  timerMins: 4,
  timerSecs: 21,
  priceToBeat: 79812.33,
  currentPrice: 79808.51,
  targetPrice: 79814.00,
  orderBookVolume: '$240 Vol.',
  commentsCount: 98342,
  outcomes: [
    { name: 'Up', probability: 51, yesPrice: 51, noPrice: 49 },
    { name: 'Down', probability: 49, yesPrice: 49, noPrice: 51 },
  ],
  rulesText: "This market will resolve to 'Up' if the time-weighted average price (TWAP) of Bitcoin, generated by Chainlink, of the time range specified in the title is greater than or equal to the price at the beginning of that range. Otherwise, it will resolve to 'Down'. The resolution source for this market is information from Chainlink, specifically the BTC/USD TWAP data stream available at data.chain.link/streams/btc-usd-twap-60s-streams. Please note that this market is about the price according to the TWAP Chainlink data stream for the asset pair BTC/USD, not according to any other sources or spot markets.",
  resolutionSource: 'Chainlink BTC/USD TWAP 60s Streams',
  resolutionSourceUrl: 'https://data.chain.link/streams/btc-usd-twap-60s-streams',
  marketOpened: 'Sep 5, 2026, 10:06 AM ET',
  commentsList: [
    {
      id: 'c-btc-1',
      author: 'Asianrobinhood',
      timeAgo: '3m ago',
      text: 'thin orderbook',
      likes: 0,
    },
    {
      id: 'c-btc-2',
      author: 'DarrenQ',
      timeAgo: '32m ago',
      text: "None of the orders are filling. Not market, one-top or limit. What's the deal???",
      likes: 1,
      replies: [
        {
          id: 'c-btc-2-1',
          author: '0x8286dc534d04670...',
          timeAgo: '18m ago',
          text: "@DarrenQ for me it's working",
          likes: 0,
        },
      ],
    },
    {
      id: 'c-btc-3',
      author: 'WhaleWatch-48493',
      timeAgo: '33m ago',
      text: 'The whales are very busy today',
      likes: 0,
    },
    {
      id: 'c-btc-4',
      author: 'Alizora',
      timeAgo: '50m ago',
      text: 'Never hold position till last never',
      likes: 0,
    },
  ],
};

export const POLYMARKET_HOT_TOPICS: PolymarketHotTopic[] = [
  { rank: 1, name: 'AfD', volume: '$425K today', isHot: true },
  { rank: 2, name: 'UFC', volume: '$2M today', isHot: true },
  { rank: 3, name: 'Sachsen', volume: '$914K today', isHot: true },
  { rank: 4, name: 'Arsenal', volume: '$1M today', isHot: true },
  { rank: 5, name: 'Roma', volume: '$1M today', isHot: true },
];

export const POLYMARKET_ALL_MARKETS: PolymarketMarket[] = [
  // 1. Fed Decision in September? (Card 1 in photo)
  {
    ...POLYMARKET_HERO,
    id: 'pm-hero-fed-decision',
    title: 'Fed Decision in September?',
    volume: '$100M Vol.',
    hasRepeat: true,
    hasGift: true,
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'No change', probability: 51, yesPrice: 51, noPrice: 49 },
      { name: '25 bps increase', probability: 50, yesPrice: 50, noPrice: 50 },
    ],
  },

  // 2. BTC Up or Down 5m (Card 2 in photo)
  {
    ...BTC_5M_MARKET,
    id: 'pm-btc-5m',
    title: 'BTC Up or Down 5m',
    gaugePercent: 50,
    gaugeLabel: 'Up',
    liveTag: 'LIVE · Bitcoin',
    isLive: true,
    displayType: 'up_down_btc',
    outcomes: [
      { name: 'Up', probability: 50, yesPrice: 50, noPrice: 50 },
      { name: 'Down', probability: 50, yesPrice: 50, noPrice: 50 },
    ],
  },

  // 3. 2026 Men's US Open Winner (Tennis) (Card 3 in photo)
  {
    id: 'pm-us-open',
    title: "2026 Men's US Open Winner (Tennis)",
    category: 'Sports',
    volume: '$21M Vol.',
    displayType: 'multi_outcome',
    logoType: 'us_open',
    outcomes: [
      { name: 'Carlos Alcaraz', probability: 47, yesPrice: 47, noPrice: 53 },
      { name: 'Alexander Zverev', probability: 25, yesPrice: 25, noPrice: 75 },
    ],
  },

  // 4. Spirit vs MOUZ (Card 4 in photo)
  {
    id: 'pm-spirit-mouz',
    title: 'Spirit vs MOUZ',
    category: 'Esports',
    subcategory: 'CS2',
    volume: '$8M Vol. · CS2',
    matchStatus: 'GAME 4',
    displayType: 'match_versus',
    outcomes: [
      { name: 'Spirit', probability: 83, badge: '2', logoType: 'spirit', buttonTheme: 'slate', yesPrice: 83, noPrice: 17 },
      { name: 'MOUZ', probability: 18, badge: '1', logoType: 'mouz', buttonTheme: 'red', yesPrice: 18, noPrice: 82 },
    ],
  },

  // 5. G2 Esports vs Karmine Corp (Card 5 in photo)
  {
    id: 'pm-g2-karmine',
    title: 'G2 Esports vs Karmine Corp',
    category: 'Esports',
    subcategory: 'LoL',
    volume: '$2M Vol. · LoL',
    matchStatus: 'GAME 4',
    displayType: 'match_versus',
    outcomes: [
      { name: 'G2 Esports', probability: 73, badge: '2', logoType: 'g2', buttonTheme: 'red', yesPrice: 73, noPrice: 27 },
      { name: 'Karmine Corp', probability: 28, badge: '1', logoType: 'karmine', shortName: 'Karmine', buttonTheme: 'slate', yesPrice: 28, noPrice: 72 },
    ],
  },

  // 6. Brewers vs Reds (Card 6 in photo)
  {
    id: 'pm-brewers-reds',
    title: 'Brewers vs Reds',
    category: 'Sports',
    subcategory: 'MLB',
    volume: '$919K Vol. · MLB',
    matchStatus: 'BOT 5TH',
    displayType: 'match_versus',
    outcomes: [
      { name: 'Brewers', probability: 30, badge: '6', logoType: 'brewers', buttonTheme: 'blue', yesPrice: 30, noPrice: 70 },
      { name: 'Reds', probability: 71, badge: '6', logoType: 'reds', buttonTheme: 'red', yesPrice: 71, noPrice: 29 },
    ],
  },

  // 7. Tigers vs Guardians (Card 7 in photo)
  {
    id: 'pm-tigers-guardians',
    title: 'Tigers vs Guardians',
    category: 'Sports',
    subcategory: 'MLB',
    volume: '$890K Vol. · MLB',
    matchStatus: 'BOT 1ST',
    displayType: 'match_versus',
    outcomes: [
      { name: 'Tigers', probability: 59, badge: '2', logoType: 'tigers', buttonTheme: 'blue', yesPrice: 59, noPrice: 41 },
      { name: 'Guardians', probability: 42, badge: '0', logoType: 'guardians', buttonTheme: 'red', yesPrice: 42, noPrice: 58 },
    ],
  },

  // 8. M. Kostyuk vs L. Noskova (Card 8 in photo)
  {
    id: 'pm-kostyuk-noskova',
    title: 'M. Kostyuk vs L. Noskova',
    category: 'Sports',
    subcategory: 'WTA Tour',
    volume: '$534K Vol. · WTA Tour',
    matchStatus: 'S2',
    displayType: 'match_versus',
    outcomes: [
      { name: 'M. Kostyuk', probability: 40, badge: '5 1', countryFlag: '🇺🇦', buttonTheme: 'olive', yesPrice: 40, noPrice: 60 },
      { name: 'L. Noskova', probability: 61, badge: '7 1', countryFlag: '🇨🇿', buttonTheme: 'red', yesPrice: 61, noPrice: 39 },
    ],
  },

  // 9. Next Prime Minister of Ethiopia?
  ETHIOPIA_PM_MARKET,

  // 10. Everton vs Man Utd
  {
    id: 'pm-everton-manu',
    title: 'Everton vs Man Utd',
    category: 'Sports',
    subcategory: 'Premier League',
    volume: '$9M Vol.',
    timeInfo: 'Premier League · 91-45',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Everton', probability: 21, yesPrice: 21, noPrice: 79 },
      { name: 'Draw', probability: 46, yesPrice: 46, noPrice: 54 },
      { name: 'Man Utd', probability: 46, yesPrice: 46, noPrice: 54 },
    ],
  },

  // 11. Clemson vs. LSU
  {
    id: 'pm-clemson-lsu',
    title: 'Clemson vs. LSU',
    category: 'CFB',
    subcategory: 'Football • College Football',
    volume: '$524K Vol.',
    scoreHome: 10,
    scoreAway: 51,
    matchStatus: 'FINAL',
    displayType: 'football_match',
    outcomes: [
      { name: 'Clemson +9.5', probability: 0.1, yesPrice: 0.1, noPrice: 99.9 },
      { name: 'LSU -9.5', probability: 100, yesPrice: 100, noPrice: 0 },
    ],
  },

  // 12. OpenAI announces it has achieved AGI before 2027?
  {
    id: 'pm-openai-agi-2027',
    title: 'OpenAI announces it has achieved AGI before 2027?',
    category: 'Tech',
    volume: '$5M Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 15, yesPrice: 15, noPrice: 85 },
      { name: 'No', probability: 85, yesPrice: 85, noPrice: 15 },
    ],
  },
];

export interface PolymarketCategoryItem {
  id: string;
  name: string;
  type?: 'icon' | 'text' | 'divider';
  iconType?: 'trending' | 'combos' | 'perps';
}

export const POLYMARKET_CATEGORIES: PolymarketCategoryItem[] = [
  { id: 'trending', name: 'Trending', type: 'icon', iconType: 'trending' },
  { id: 'combos', name: 'Combos', type: 'icon', iconType: 'combos' },
  { id: 'perps', name: 'Perps', type: 'icon', iconType: 'perps' },
  { id: 'breaking', name: 'Breaking', type: 'text' },
  { id: 'new', name: 'New', type: 'text' },
  { id: 'divider-1', name: '|', type: 'divider' },
  { id: 'politics', name: 'Politics', type: 'text' },
  { id: 'sports', name: 'Sports', type: 'text' },
  { id: 'crypto', name: 'Crypto', type: 'text' },
  { id: 'esports', name: 'Esports', type: 'text' },
  { id: 'iran', name: 'Iran', type: 'text' },
  { id: 'finance', name: 'Finance', type: 'text' },
  { id: 'geopolitics', name: 'Geopolitics', type: 'text' },
  { id: 'tech', name: 'Tech', type: 'text' },
  { id: 'culture', name: 'Culture', type: 'text' },
  { id: 'economy', name: 'Economy', type: 'text' },
  { id: 'weather', name: 'Weather', type: 'text' },
  { id: 'mentions', name: 'Mentions', type: 'text' },
  { id: 'elections', name: 'Elections', type: 'text' },
  { id: 'art', name: 'Art', type: 'text' },
];

export const POLYMARKET_TAG_PILLS = [
  'All',
  'Trump',
  'CFB',
  'F1: Italian GP',
  'Saxony-Anhalt',
  'Astra',
  'UFC: Paris Fight Night',
  'GTA VI',
  'Fed',
  'Iran',
  'Lacy & Marlon',
  'Apple Event',
  'September 8 and 9 Primaries',
];
