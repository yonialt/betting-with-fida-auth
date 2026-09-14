export interface PolymarketOutcome {
  name: string;
  probability: number;
  yesPrice: number;
  noPrice: number;
  price?: number;
  badge?: string;
  change?: string;
  volume?: string;
  avatar?: string;
  logoType?: string;
  buttonTheme?: string;
  shortName?: string;
  countryFlag?: string;
}

export interface PolymarketChartSeries {
  name: string;
  color: string;
  currentVal: number;
  data: number[];
}

export interface PolymarketChartData {
  labels: string[];
  series: PolymarketChartSeries[];
}

export interface PolymarketComment {
  id: string;
  author: string;
  avatar?: string;
  timeAgo: string;
  text: string;
  likes: number;
  badge?: string;
  verified?: boolean;
  sharesOutcome?: string;
  replies?: PolymarketComment[];
}

export interface PolymarketMarket {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  iconType?: string;
  iconBg?: string;
  imageUrl?: string;
  logoUrl?: string;
  avatarUrl?: string;
  logoFallbackType?: string;
  /** Derived official logo catalog mapping (marketId -> logoUrl). */
  logoCatalog?: Record<string, string>;
  countryFlag?: string;
  volume: string;
  displayType:
    | 'chart_hero'
    | 'up_down_btc'
    | 'versus_match'
    | 'match_versus'
    | 'binary_buttons'
    | 'multi_outcome'
    | 'football_match'
    | string;
  isLive?: boolean;
  liveTag?: string;
  hasRepeat?: boolean;
  hasGift?: boolean;
  gaugePercent?: number;
  gaugeLabel?: string;
  logoType?: string;
  timeInfo?: string;
  timeRange?: string;
  outcomes: PolymarketOutcome[];
  chartData?: PolymarketChartData;
  commentsCount?: number;
  liquidity?: string;
  endDate?: string;
  slug?: string;
  active?: boolean;
  // Detail page specifics
  rulesText?: string;
  resolutionSource?: string;
  resolutionSourceUrl?: string;
  resolverAddress?: string;
  marketOpened?: string;
  priceToBeat?: number;
  currentPrice?: number;
  targetPrice?: number;
  timerMins?: number;
  timerSecs?: number;
  orderBookVolume?: string;
  commentsList?: PolymarketComment[];
  scoreHome?: number;
  scoreAway?: number;
  matchStatus?: string;
}

export interface PolymarketHotTopic {
  rank: number;
  name: string;
  volume: string;
  isHot?: boolean;
  icon?: string;
}

export interface PolymarketTradeState {
  market: PolymarketMarket;
  outcome?: PolymarketOutcome;
  side: 'yes' | 'no' | 'team1' | 'team2' | 'up' | 'down' | string;
  price?: number;
}

