export interface PolymarketOutcome {
  name: string;
  probability: number; // e.g. 56 for 56%
  yesPrice?: number; // in cents e.g. 56
  noPrice?: number; // in cents e.g. 44
  badge?: string;
}

export interface PolymarketMarket {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  iconType?: 'default' | 'bitcoin' | 'esports' | 'person' | 'star' | 'trophy' | 'chart';
  iconBg?: string;
  iconText?: string;
  avatarUrl?: string;
  imageUrl?: string;
  volume: string;
  badge?: string;
  liveTag?: string;
  isLive?: boolean;
  timeInfo?: string;
  displayType: 'multi_outcome' | 'binary_buttons' | 'up_down_btc' | 'versus_match' | 'chart_hero';
  outcomes: PolymarketOutcome[];
  chartData?: {
    labels: string[];
    series: {
      name: string;
      color: string;
      currentVal: number;
      data: number[];
    }[];
  };
}

export interface PolymarketHotTopic {
  rank: number;
  name: string;
  volume: string;
  isHot: boolean;
}

export interface PolymarketTradeState {
  market: PolymarketMarket | null;
  outcome: PolymarketOutcome | null;
  side: 'yes' | 'no' | 'team1' | 'team2';
  price: number;
}
