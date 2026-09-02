export type SportId =
  | 'football'
  | 'tennis'
  | 'basketball'
  | 'ice-hockey'
  | 'volleyball'
  | 'table-tennis'
  | 'cricket'
  | 'esports';

export type SubTabId = 'matches' | 'recommended' | 'upcoming' | '1st-period' | '2nd-period';

export type BetType = 'single' | 'accumulator' | 'system' | 'chain';

export type OddsAcceptanceMode = 'increase' | 'any' | 'ask';

export type OddsFormat = 'decimal' | 'fractional' | 'american' | 'hongkong' | 'malay' | 'indonesian';

export type OddsDisplayMode = 'simple' | 'detailed';

export interface OddsItem {
  id: string;
  label: string; // e.g., '1', 'X', '2', '1X', '2X', '12', 'Over 2.5', 'Under 2.5'
  name: string; // descriptive name e.g., 'Defensa y Justicia', 'Draw', 'Platense'
  marketName: string; // e.g., '1X2', 'Double Chance', 'Total Goals'
  value: number;
  isLocked?: boolean;
  previousValue?: number;
  trend?: 'up' | 'down' | 'same';
  lastUpdated?: number;
}

export interface MarketGroup {
  id: string;
  name: string;
  items: OddsItem[];
}

export interface MatchStats {
  possession?: [number, number];
  shotsOnTarget?: [number, number];
  shotsOffTarget?: [number, number];
  corners?: [number, number];
  yellowCards?: [number, number];
  redCards?: [number, number];
  fouls?: [number, number];
  attacks?: [number, number];
  dangerousAttacks?: [number, number];
  setScores?: string[]; // For tennis e.g. ["6-4", "3-6", "4-2"]
  currentPoints?: string; // For tennis e.g. "40-30"
}

export interface LiveMatchEvent {
  minute: number;
  type: 'goal' | 'card' | 'corner' | 'sub' | 'shot' | 'ace' | 'break';
  text: string;
  team: 1 | 2;
}

export interface SubGame {
  id: string;
  name: string;
  extraMarketsCount?: number;
  odds?: {
    w1?: OddsItem;
    x?: OddsItem;
    w2?: OddsItem;
    x1?: OddsItem;
    x2?: OddsItem;
    w12?: OddsItem;
    totalOver?: OddsItem;
    totalUnder?: OddsItem;
    totalVal?: string;
  };
}

export interface Match {
  id: string;
  matchCode: string; // e.g. '154749'
  sport: SportId;
  league: string; // e.g. 'Argentina. Primera Division'
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  timeDisplay: string; // e.g. '87:08'
  seconds: number;
  period: string; // e.g. '2nd half · Group Stage. Round 7'
  isLive: boolean;
  hasLiveStream: boolean;
  isFavorite?: boolean;
  extraMarketsCount: number; // e.g. +88
  periodScores?: { p1?: [number, number]; p2?: [number, number]; p3?: [number, number] };
  venue?: string; // e.g. 'Jose Dellagiovanna (Buenos Aires)'
  referee?: string;
  subGames?: SubGame[];
  // Quick table odds
  odds: {
    w1: OddsItem;
    x?: OddsItem;
    w2: OddsItem;
    x1?: OddsItem;
    x2?: OddsItem;
    w12?: OddsItem;
    totalOver?: OddsItem;
    totalUnder?: OddsItem;
    totalVal?: string;
  };
  allMarkets?: MarketGroup[];
  stats?: MatchStats;
  events?: LiveMatchEvent[];
  currentAction?: string; // e.g. 'Defensa y Justicia dangerous attack', 'Ball in midfield'
}

export interface BetSlipItem {
  id: string; // selection ID
  matchId: string;
  matchCode: string;
  league: string;
  matchTitle: string;
  currentScore: string;
  marketName: string;
  selectionName: string;
  selectionLabel: string;
  odds: number;
  isLive: boolean;
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
  currency: string;
  status: 'active' | 'won' | 'lost' | 'cashed_out';
  cashoutValue: number;
}

export interface UserProfile {
  isLoggedIn: boolean;
  username: string;
  userId: string;
  balance: number;
  currency: string;
  bonusBalance: number;
  phone?: string;
  isAgeVerified?: boolean;
  ageVerificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
}
