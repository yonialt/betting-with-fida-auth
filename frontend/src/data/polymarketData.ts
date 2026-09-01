import { PolymarketMarket, PolymarketHotTopic } from '../types/polymarket';

export const POLYMARKET_HERO: PolymarketMarket = {
  id: 'pm-hero-fed-decision',
  title: 'Fed Decision in September?',
  category: 'Politics',
  subcategory: 'Fomc',
  iconType: 'person',
  iconBg: '#1e293b',
  imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=128&h=128&fit=crop',
  volume: '$74,190,103 Vol.',
  displayType: 'chart_hero',
  outcomes: [
    { name: '25 bps increase', probability: 57, yesPrice: 58, noPrice: 43 },
    { name: 'No change', probability: 42, yesPrice: 42, noPrice: 58 },
    { name: '50+ bps increase', probability: 1, yesPrice: 1, noPrice: 99 },
    { name: '25 bps decrease', probability: 1, yesPrice: 1, noPrice: 99 },
  ],
  chartData: {
    labels: [
      'Jul 1', 'Jul 4', 'Jul 8', 'Jul 12', 'Jul 15', 'Jul 19', 'Jul 23', 'Jul 27', 'Jul 30',
      'Aug 2', 'Aug 5', 'Aug 9', 'Aug 13', 'Aug 16', 'Aug 20', 'Aug 23', 'Aug 26', 'Aug 29',
      'Sep 1', 'Sep 4', 'Sep 7', 'Sep 10', 'Sep 13', 'Sep 15, 2026'
    ],
    series: [
      {
        name: '25 bps increase',
        color: '#38bdf8', // light sky blue
        currentVal: 57.0,
        data: [
          32.0, 71.0, 74.0, 68.0, 70.0, 73.5, 75.0, 71.0, 70.5,
          42.0, 43.0, 46.0, 44.0, 41.0, 64.0, 62.0, 52.0, 50.0,
          48.0, 63.0, 61.0, 48.0, 55.0, 57.0,
        ],
      },
      {
        name: 'No change',
        color: '#2563eb', // deep blue
        currentVal: 42.0,
        data: [
          68.0, 29.0, 26.0, 32.0, 30.0, 26.5, 25.0, 29.0, 29.5,
          58.0, 57.0, 54.0, 56.0, 59.0, 36.0, 38.0, 48.0, 50.0,
          52.0, 37.0, 39.0, 52.0, 45.0, 42.0,
        ],
      },
      {
        name: '50+ bps increase',
        color: '#eab308', // yellow
        currentVal: 0.5,
        data: [
          0.5, 0.4, 0.6, 0.5, 0.4, 0.5, 0.8, 0.7, 0.6,
          0.5, 0.4, 0.6, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4,
          0.4, 0.5, 0.5, 0.4, 0.5, 0.5,
        ],
      },
      {
        name: '25 bps decrease',
        color: '#f97316', // orange
        currentVal: 0.5,
        data: [
          28.0, 5.0, 3.2, 2.5, 2.0, 1.8, 1.5, 1.2, 1.0,
          0.8, 0.7, 0.6, 0.5, 0.5, 0.5, 0.5, 0.4, 0.4,
          0.4, 0.4, 0.4, 0.4, 0.4, 0.5,
        ],
      },
    ],
  },
};

export const POLYMARKET_HOT_TOPICS: PolymarketHotTopic[] = [
  { rank: 1, name: 'Arsenal', volume: '$6M today', isHot: true },
  { rank: 2, name: 'Fable', volume: '$276K today', isHot: true },
  { rank: 3, name: 'Messi', volume: '$613K today', isHot: true },
  { rank: 4, name: 'Roma', volume: '$1M today', isHot: true },
  { rank: 5, name: 'Barcelona', volume: '$4M today', isHot: true },
];

export const POLYMARKET_ALL_MARKETS: PolymarketMarket[] = [
  {
    id: 'pm-1',
    title: 'Fed Decision in September?',
    category: 'Finance',
    volume: '$74M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: '25 bps increase', probability: 56, yesPrice: 56, noPrice: 44 },
      { name: 'No change', probability: 43, yesPrice: 43, noPrice: 57 },
    ],
  },
  {
    id: 'pm-2',
    title: 'BTC Up or Down 5m',
    category: 'Crypto',
    iconType: 'bitcoin',
    volume: '$1.8M Vol.',
    displayType: 'up_down_btc',
    isLive: true,
    liveTag: 'LIVE Bitcoin',
    outcomes: [
      { name: 'Up', probability: 51, yesPrice: 51, noPrice: 49 },
      { name: 'Down', probability: 49, yesPrice: 49, noPrice: 51 },
    ],
  },
  {
    id: 'pm-3',
    title: "2026 Men's US Open Winner (Tennis)",
    category: 'Sports',
    volume: '$15M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Carlos Alcaraz', probability: 34, yesPrice: 34, noPrice: 66 },
      { name: 'Alexander Zverev', probability: 23, yesPrice: 23, noPrice: 77 },
    ],
  },
  {
    id: 'pm-4',
    title: 'Gen.G vs. KT Rolster',
    category: 'Esports',
    iconType: 'esports',
    volume: '$690K Vol.',
    timeInfo: 'LoL · 11:00 AM',
    displayType: 'versus_match',
    outcomes: [
      { name: 'Gen.G', probability: 83, badge: 'G', yesPrice: 83, noPrice: 17 },
      { name: 'KT Rolster', probability: 18, badge: 'K', yesPrice: 18, noPrice: 82 },
    ],
  },
  {
    id: 'pm-5',
    title: 'Russia x Ukraine ceasefire agreement by...?',
    category: 'Geopolitics',
    volume: '$6M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'June 30, 2027', probability: 51, yesPrice: 51, noPrice: 49 },
      { name: 'March 31, 2027', probability: 39, yesPrice: 39, noPrice: 61 },
    ],
  },
  {
    id: 'pm-6',
    title: 'US announces end of Iranian blockade by...?',
    category: 'Geopolitics',
    volume: '$24M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'December 31', probability: 64, yesPrice: 64, noPrice: 36 },
      { name: 'October 31', probability: 40, yesPrice: 40, noPrice: 60 },
    ],
  },
  {
    id: 'pm-7',
    title: 'Who will Trump pick as the next Press Secretary?',
    category: 'Politics',
    volume: '$202K Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Anna Kelly', probability: 26, yesPrice: 26, noPrice: 74 },
      { name: 'Scott Jennings', probability: 19, yesPrice: 19, noPrice: 81 },
    ],
  },
  {
    id: 'pm-8',
    title: 'Lindsay Clancy convicted of murder?',
    category: 'Culture',
    iconType: 'person',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    volume: '$116K Vol.',
    displayType: 'binary_buttons',
    outcomes: [
      { name: 'Yes', probability: 30, yesPrice: 30, noPrice: 70 },
      { name: 'No', probability: 70, yesPrice: 70, noPrice: 30 },
    ],
  },
  {
    id: 'pm-9',
    title: 'Will the Fed cut rates in November?',
    category: 'Economy',
    volume: '$43M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Yes, 25 bps', probability: 61, yesPrice: 61, noPrice: 39 },
      { name: 'No cut', probability: 32, yesPrice: 32, noPrice: 68 },
    ],
  },
  {
    id: 'pm-10',
    title: 'Will Iran nuclear talks succeed by year end?',
    category: 'Iran',
    volume: '$18M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Yes', probability: 47, yesPrice: 47, noPrice: 53 },
      { name: 'No', probability: 53, yesPrice: 53, noPrice: 47 },
    ],
  },
  {
    id: 'pm-11',
    title: '2024 US Presidential Election Winner',
    category: 'Politics',
    volume: '$130M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Donald Trump', probability: 54, yesPrice: 54, noPrice: 46 },
      { name: 'Kamala Harris', probability: 46, yesPrice: 46, noPrice: 54 },
    ],
  },
  {
    id: 'pm-12',
    title: 'Will Bitcoin exceed $100K before 2026?',
    category: 'Crypto',
    volume: '$22M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Yes', probability: 63, yesPrice: 63, noPrice: 37 },
      { name: 'No', probability: 37, yesPrice: 37, noPrice: 63 },
    ],
  },
  {
    id: 'pm-13',
    title: 'Champions League Winner 2024/25',
    category: 'Sports',
    volume: '$9M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Manchester City', probability: 28, yesPrice: 28, noPrice: 72 },
      { name: 'Real Madrid', probability: 22, yesPrice: 22, noPrice: 78 },
      { name: 'Arsenal', probability: 18, yesPrice: 18, noPrice: 82 },
    ],
  },
  {
    id: 'pm-14',
    title: 'Next UK General Election Winner',
    category: 'Politics',
    volume: '$11M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Labour', probability: 71, yesPrice: 71, noPrice: 29 },
      { name: 'Conservatives', probability: 15, yesPrice: 15, noPrice: 85 },
    ],
  },
  {
    id: 'pm-15',
    title: 'Will Elon Musk remain at Tesla CEO through 2025?',
    category: 'Tech',
    volume: '$7M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Yes', probability: 78, yesPrice: 78, noPrice: 22 },
      { name: 'No', probability: 22, yesPrice: 22, noPrice: 78 },
    ],
  },
  {
    id: 'pm-16',
    title: 'Will SpaceX Starship reach orbit in 2024?',
    category: 'Tech',
    volume: '$5M Vol.',
    displayType: 'multi_outcome',
    outcomes: [
      { name: 'Yes', probability: 82, yesPrice: 82, noPrice: 18 },
      { name: 'No', probability: 18, yesPrice: 18, noPrice: 82 },
    ],
  },
];

export const POLYMARKET_CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: 'TrendingUp', badge: 'HOT' },
  { id: 'politics', name: 'Politics', icon: 'Vote' },
  { id: 'crypto', name: 'Crypto', icon: 'Coins' },
  { id: 'sports', name: 'Sports', icon: 'Trophy' },
  { id: 'economy', name: 'Economy & Fed', icon: 'Landmark' },
  { id: 'tech', name: 'AI & Tech', icon: 'Cpu' },
  { id: 'breaking', name: 'Breaking', icon: 'Activity' },
  { id: 'culture', name: 'Culture', icon: 'Tv' },
];

export const POLYMARKET_TAG_PILLS = [
  'All',
  'Politics',
  'Crypto',
  'Sports',
  'Fed',
  'Tech',
];
