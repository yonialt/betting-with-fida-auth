export interface PolymarketOutcome {
  name: string;
  probability: number;
  yesPrice: number;
  noPrice: number;
  price?: number;
  badge?: string;
  change?: string;
  volume?: string;
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

export interface PolymarketMarket {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  iconType?: string;
  iconBg?: string;
  imageUrl?: string;
  avatarUrl?: string;
  volume: string;
  displayType:
    | 'chart_hero'
    | 'up_down_btc'
    | 'versus_match'
    | 'binary_buttons'
    | 'multi_outcome'
    | string;
  isLive?: boolean;
  liveTag?: string;
  timeInfo?: string;
  outcomes: PolymarketOutcome[];
  chartData?: PolymarketChartData;
  commentsCount?: number;
  liquidity?: string;
  endDate?: string;
  slug?: string;
  active?: boolean;
}

export interface PolymarketHotTopic {
  rank: number;
  name: string;
  volume: string;
  isHot?: boolean;
}

export interface PolymarketTradeState {
  market: PolymarketMarket;
  outcome?: PolymarketOutcome;
  side: 'yes' | 'no' | 'team1' | 'team2' | string;
  price?: number;
}
