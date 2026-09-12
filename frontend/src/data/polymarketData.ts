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
  volume: '99,274,089 ETB Vol. • Sep 15, 2026',
  displayType: 'chart_hero',
  outcomes: [
    { name: '50+ bps decrease', probability: 0.4, change: '-38%', yesPrice: 0.4, noPrice: 99.7, volume: '13,163,792 ETB Vol.' },
    { name: '25 bps decrease', probability: 0.4, change: '-38%', yesPrice: 0.4, noPrice: 99.7, volume: '30,746,572 ETB Vol.' },
    { name: 'No change', probability: 50, change: '-1%', yesPrice: 50, noPrice: 51, volume: '3,246,154 ETB Vol.' },
    { name: '25 bps increase', probability: 51, change: '+23%', yesPrice: 51, noPrice: 50, volume: '18,611,811 ETB Vol.' },
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
      text: 'TheReturnOfDarthMouth holds 3,078,057.91 ETB on 25 bps decrease outcome No. Unrealized profit: 42,067.31 ETB. They turned 3,035,990.61 ETB into over 3,078,057.91 ETB.',
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
  volume: '285,817,256 ETB Vol. • May 31, 2026',
  displayType: 'multi_outcome',
  commentsCount: 43,
  outcomes: [
    {
      name: 'Abiy Ahmed',
      probability: 97,
      change: '+11%',
      yesPrice: 97.1,
      noPrice: 4.1,
      volume: '142,743 ETB Vol.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    },
    {
      name: 'Belete Molla',
      probability: 1,
      change: '-42%',
      yesPrice: 0.8,
      noPrice: 99.8,
      volume: '32,288,756 ETB Vol.',
    },
    {
      name: 'Gedion Timothewos',
      probability: 1,
      change: '-62%',
      yesPrice: 1.3,
      noPrice: 99.8,
      volume: '15,933,718 ETB Vol.',
    },
    {
      name: 'Berhanu Nega',
      probability: 1,
      change: '-1%',
      yesPrice: 0.4,
      noPrice: 99.8,
      volume: '14,896,151 ETB Vol.',
    },
    {
      name: 'Aleso Mengesho',
      probability: 1,
      yesPrice: 0.6,
      noPrice: 99.6,
      volume: '13,577,152 ETB Vol.',
    },
    {
      name: 'Shimelis Abdisa',
      probability: 1,
      yesPrice: 0.5,
      noPrice: 99.5,
      volume: '41,422,322 ETB Vol.',
    },
    {
      name: 'Adanech Abiebie',
      probability: 0.4,
      yesPrice: 0.5,
      noPrice: 99.8,
      volume: '89,454,616 ETB Vol.',
    },
    {
      name: 'Demeke Mekonnen',
      probability: 0.4,
      yesPrice: 0.4,
      noPrice: 99.9,
      volume: '29,298,548 ETB Vol.',
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
  volume: '736 ETB Vol.',
  displayType: 'up_down_btc',
  isLive: true,
  liveTag: 'LIVE Bitcoin',
  timerMins: 4,
  timerSecs: 21,
  priceToBeat: 79812.33,
  currentPrice: 79808.51,
  targetPrice: 79814.00,
  orderBookVolume: '240 ETB Vol.',
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
  { rank: 1, name: 'AfD', volume: '425K ETB today', isHot: true, icon: '🇩🇪' },
  { rank: 2, name: 'Fed Decision', volume: '2M ETB today', isHot: true, icon: '🏦' },
  { rank: 3, name: 'Sachsen', volume: '914K ETB today', isHot: true, icon: '🏛️' },
  { rank: 4, name: 'Bitcoin', volume: '1M ETB today', isHot: true, icon: '₿' },
  { rank: 5, name: 'Ethiopia 🇪🇹', volume: '1M ETB today', isHot: true, icon: '🇪🇹' },
  { rank: 6, name: 'GERD', volume: '680K ETB today', isHot: true, icon: '⚡' },
  { rank: 7, name: 'OpenAI', volume: '520K ETB today', isHot: true, icon: '🤖' },
  { rank: 8, name: 'Red Sea', volume: '410K ETB today', isHot: true, icon: '🌊' },
  { rank: 9, name: 'Midterms', volume: '780K ETB today', isHot: true, icon: '🗳️' },
  { rank: 10, name: 'Coffee', volume: '350K ETB today', isHot: true, icon: '☕' },
  { rank: 11, name: 'Addis Ababa', volume: '890K ETB today', isHot: true, icon: '🏙️' },
  { rank: 12, name: 'Fuel', volume: '620K ETB today', isHot: true, icon: '⛽' },
  { rank: 13, name: 'Birr FX', volume: '540K ETB today', isHot: true, icon: '💱' },
  { rank: 14, name: 'Elections', volume: '480K ETB today', isHot: true, icon: '🗳️' },
];

export const POLYMARKET_ALL_MARKETS: PolymarketMarket[] = [
  // 1. Fed Decision in September? (Card 1 in photo)
  {
    ...POLYMARKET_HERO,
    id: 'pm-hero-fed-decision',
    title: 'Fed Decision in September?',
    volume: '100M ETB Vol.',
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

  // 3. Next Prime Minister of Ethiopia?
  ETHIOPIA_PM_MARKET,

  // 4. GERD Full Capacity 100% (Tech & Energy)
  {
    id: 'pm-eth-gerd-capacity',
    title: 'Grand Ethiopian Renaissance Dam (GERD) generation hits 100% capacity in 2026?',
    category: 'Tech',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=128&h=128&fit=crop',
    volume: '67.3M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 89, yesPrice: 89, noPrice: 11 },
      { name: 'No', probability: 11, yesPrice: 11, noPrice: 89 },
    ],
  },

  // 12. NBE Birr Rate USD/ETB (Economy)
  {
    id: 'pm-eth-birr-fx',
    title: 'National Bank of Ethiopia Official Birr (USD/ETB) exceeds 150 before end of 2026?',
    category: 'Economy',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&h=128&fit=crop',
    volume: '24.6M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 64, yesPrice: 64, noPrice: 36 },
      { name: 'No', probability: 36, yesPrice: 36, noPrice: 64 },
    ],
  },

  // 13. Red Sea Port Access Accord (Geopolitics)
  {
    id: 'pm-eth-redsea',
    title: 'Ethiopia secures official Red Sea port access accord before 2027?',
    category: 'Geopolitics',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=128&h=128&fit=crop',
    volume: '42.1M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 74, yesPrice: 74, noPrice: 26 },
      { name: 'No', probability: 26, yesPrice: 26, noPrice: 74 },
    ],
  },

  // 14. Ethiopia Bitcoin Mining Hashrate (Crypto)
  {
    id: 'pm-eth-bitcoin-mining',
    title: 'Ethiopia becomes top 3 Bitcoin mining hash-rate hub in Africa by Q4 2026?',
    category: 'Crypto',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=128&h=128&fit=crop',
    volume: '19.8M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 78, yesPrice: 78, noPrice: 22 },
      { name: 'No', probability: 22, yesPrice: 22, noPrice: 78 },
    ],
  },

  // 15. Coffee Export Revenue 1.8B ETB (Culture & Agriculture)
  {
    id: 'pm-eth-coffee-export',
    title: 'Ethiopian coffee export revenue exceeds 1.8 ETB Billion in fiscal year 2025/26?',
    category: 'Culture',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=128&h=128&fit=crop',
    volume: '14.1M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 72, yesPrice: 72, noPrice: 28 },
      { name: 'No', probability: 28, yesPrice: 28, noPrice: 72 },
    ],
  },

  // 16b. Kiremt Monsoon Rainfall (Weather & Ethiopia)
  {
    id: 'pm-eth-kiremt-rainfall',
    title: 'National Kiremt monsoon rainfall in Ethiopian highlands above normal average in 2026?',
    category: 'Weather',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=128&h=128&fit=crop',
    volume: '6.2M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 58, yesPrice: 58, noPrice: 42 },
      { name: 'No', probability: 42, yesPrice: 42, noPrice: 58 },
    ],
  },

  // 16c. Addis Ababa Temperature (Weather & Ethiopia)
  {
    id: 'pm-eth-weather-addis-temp',
    title: 'Addis Ababa daily maximum temperature exceeds 28.5°C during Bega dry season?',
    category: 'Weather',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=128&h=128&fit=crop',
    volume: '3.4M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 48, yesPrice: 48, noPrice: 52 },
      { name: 'No', probability: 52, yesPrice: 52, noPrice: 48 },
    ],
  },

  // 16d. Lake Tana Elevation Surplus (Weather & Ethiopia)
  {
    id: 'pm-eth-weather-tana-surplus',
    title: 'Lake Tana water reservoir level remains in surplus zone through Q4 2026?',
    category: 'Weather',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=128&h=128&fit=crop',
    volume: '4.8M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 81, yesPrice: 81, noPrice: 19 },
      { name: 'No', probability: 19, yesPrice: 19, noPrice: 81 },
    ],
  },

  // 16e. Ethiopian General Election 40M Voters (Politics & Ethiopia)
  {
    id: 'pm-eth-election-turnout',
    title: '2026 Ethiopian General Election voter turnout exceeds 40 Million registered voters?',
    category: 'Politics',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=128&h=128&fit=crop',
    volume: '21.5M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 68, yesPrice: 68, noPrice: 32 },
      { name: 'No', probability: 32, yesPrice: 32, noPrice: 68 },
    ],
  },

  // 16f. Ethiopian Securities Exchange ESX IPOs (Economy & Ethiopia)
  {
    id: 'pm-eth-esx-ipos',
    title: 'Ethiopian Securities Exchange (ESX) lists at least 5 public corporate IPOs in 2026?',
    category: 'Economy',
    subcategory: 'Ethiopia',
    countryFlag: '🇪🇹',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&h=128&fit=crop',
    volume: '16.8M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 79, yesPrice: 79, noPrice: 21 },
      { name: 'No', probability: 21, yesPrice: 21, noPrice: 79 },
    ],
  },

  // 16g. Global 2026 Warmest Year (Weather & Global)
  {
    id: 'weath-global-2026-warmest',
    title: '2026 ranks among the top 3 warmest years in recorded history (NOAA/Copernicus)?',
    category: 'Weather',
    subcategory: 'Global',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d9e0e6510?w=128&h=128&fit=crop',
    volume: '31.4M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 86, yesPrice: 86, noPrice: 14 },
      { name: 'No', probability: 14, yesPrice: 14, noPrice: 86 },
    ],
  },

  // 16h. Atlantic Hurricane Season 18+ named storms (Weather)
  {
    id: 'weath-atlantic-named-hurricanes',
    title: 'Atlantic Hurricane Season produces 18 or more named tropical storms in 2026?',
    category: 'Weather',
    subcategory: 'Hurricanes',
    imageUrl: 'https://images.unsplash.com/photo-1527482937786-6c94007b1c4c?w=128&h=128&fit=crop',
    volume: '19.2M ETB Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 63, yesPrice: 63, noPrice: 37 },
      { name: 'No', probability: 37, yesPrice: 37, noPrice: 63 },
    ],
  },

  // 17. OpenAI announces it has achieved AGI before 2027?
  {
    id: 'pm-openai-agi-2027',
    title: 'OpenAI announces it has achieved AGI before 2027?',
    category: 'Tech',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=128&h=128&fit=crop',
    volume: '5M ETB Vol.',
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
  { id: 'perps', name: 'Perps', type: 'icon', iconType: 'perps' },
  { id: 'breaking', name: 'Breaking', type: 'text' },
  { id: 'new', name: 'New', type: 'text' },
  { id: 'divider-1', name: '|', type: 'divider' },
  { id: 'ethiopia', name: 'Ethiopia 🇪🇹', type: 'text' },
  { id: 'politics', name: 'Politics', type: 'text' },
  { id: 'crypto', name: 'Crypto', type: 'text' },
  { id: 'finance', name: 'Finance', type: 'text' },
  { id: 'geopolitics', name: 'Geopolitics', type: 'text' },
  { id: 'tech', name: 'Tech', type: 'text' },
  { id: 'culture', name: 'Culture', type: 'text' },
  { id: 'economy', name: 'Economy', type: 'text' },
  { id: 'weather', name: 'Weather', type: 'text' },
  { id: 'elections', name: 'Elections', type: 'text' },
];

export const POLYMARKET_TAG_PILLS = [
  'All',
  'Ethiopia 🇪🇹',
  'Fed Decision',
  'Bitcoin',
  'GERD',
  'OpenAI',
  'Red Sea',
  'Coffee',
  'Addis Ababa',
  'Birr',
  'Elections',
  'Weather',
  'Politics',
  'Economy',
  'Tech',
  'Geopolitics',
  'Culture',
];
