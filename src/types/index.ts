export type SportId =
  | 'football'
  | 'tennis'
  | 'basketball'
  | 'ice-hockey'
  | 'volleyball'
  | 'table-tennis'
  | 'cricket'
  | 'esports'
  | string;

export type SubTabId =
  | 'matches'
  | 'live'
  | 'today'
  | 'tomorrow'
  | 'day2'
  | 'upcoming'
  | 'recommended'
  | '1st-period'
  | '2nd-period'
  | string;

export type TimeFilter = 'all' | 'live' | 'today' | 'tomorrow' | 'day2' | 'upcoming';

export type BetType = 'single' | 'accumulator' | 'system' | string;

export type OddsAcceptanceMode = 'increase' | 'any' | 'ask';

export interface OddsItem {
  id: string;
  label: string;
  name: string;
  marketName: string;
  value: number;
  isLocked?: boolean;
  change?: 'up' | 'down';
  trend?: 'up' | 'down' | 'same' | string;
}

export interface SubGame {
  id: string;
  name: string;
  extraMarketsCount?: number;
  odds?: {
    [key: string]: OddsItem | any;
  };
}

export interface MatchEvent {
  minute?: number | string;
  type?: string;
  text?: string;
  team?: number | string;
  player?: string;
  description?: string;
}

export interface Match {
  id: string;
  matchCode: string;
  sport: SportId;
  league: string;
  country?: string;
  flag?: string;
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  score1: number;
  score2: number;
  timeDisplay: string;
  seconds?: number;
  period: string;
  isLive: boolean;
  startTime?: string;
  timeCategory?: 'live' | 'today' | 'tomorrow' | 'day2' | 'later';
  dateLabel?: string;
  hasLiveStream?: boolean;
  isFavorite?: boolean;
  extraMarketsCount: number;
  venue?: string;
  referee?: string;
  currentAction?: string;
  servingTeam?: 1 | 2;
  totalLine?: string;
  handicapLine?: string;
  tennisScores?: {
    p1Sets: (number | string)[];
    p2Sets: (number | string)[];
    p1Points?: string;
    p2Points?: string;
  };
  periodScores?: { [key: string]: any } | string[] | number[] | [number, number][];
  events?: MatchEvent[];
  stats?: {
    attacks?: [number, number];
    dangerousAttacks?: [number, number];
    possession?: [number, number];
    shotsOnTarget?: [number, number];
    shotsOffTarget?: [number, number];
    corners?: [number, number];
    yellowCards?: [number, number];
    redCards?: [number, number];
    fouls?: [number, number];
    saves?: [number, number];
    xg?: [number, number];
    setScores?: string[];
    currentPoints?: string;
    [key: string]: any;
  };
  odds: {
    w1: OddsItem;
    x?: OddsItem;
    w2: OddsItem;
    x1?: OddsItem;
    w12?: OddsItem;
    x2?: OddsItem;
    totalOver?: OddsItem;
    totalUnder?: OddsItem;
    handicap1?: OddsItem;
    handicap2?: OddsItem;
    [key: string]: OddsItem | any;
  };
  subGames?: SubGame[];
}

export interface BetSlipItem {
  id: string;
  matchId: string;
  matchCode: string;
  league: string;
  matchTitle: string;
  currentScore: string;
  marketName: string;
  selectionName: string;
  selectionLabel: string;
  odds: number;
  isLive?: boolean;
  stake?: number;
}

export interface PlacedBet {
  id: string;
  placedAt: string;
  type: BetType;
  items: BetSlipItem[];
  totalOdds: number;
  stake: number;
  potentialWin: number;
  currency?: string;
  status: 'active' | 'pending' | 'won' | 'lost' | 'cashed_out';
  cashoutValue?: number;
}

export interface UserProfile {
  isLoggedIn: boolean;
  username: string;
  userId: string;
  balance: number;
  currency: string;
  bonusBalance: number;
  phone: string;
  email?: string;
  isAgeVerified?: boolean;
  ageVerificationStatus?: 'verified' | 'pending' | 'unverified';
}

export interface MarketGroup {
  id: string;
  name: string;
  markets: {
    id: string;
    name: string;
    odds: (OddsItem | undefined)[];
  }[];
}

export interface MatchStats {
  matchId: string;
  possession1: number;
  possession2: number;
  shotsOnTarget1: number;
  shotsOnTarget2: number;
  corners1: number;
  corners2: number;
  fouls1: number;
  fouls2: number;
  yellowCards1: number;
  yellowCards2: number;
  redCards1: number;
  redCards2: number;
  currentScore: string;
}

export interface LiveMatchEvent {
  id: string;
  matchId: string;
  minute: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'corner' | string;
  team: string;
  player: string;
  description: string;
}
