/**
 * Prediction-market trading API client (/api/pm/*).
 *
 * Talks to the dedicated prediction-market backend pipeline — orders, positions,
 * activity, portfolio and market resolution. Completely separate from the
 * sportsbook /api/bets/* endpoints used by BetSlip/placeBet.
 */
import { fidaBetApi } from './fidaBetApi';

export interface PmOrderRequest {
  action: 'BUY' | 'SELL';
  marketId: string;
  marketTitle?: string;
  category?: string;
  side: 'yes' | 'no';
  outcomeName?: string;
  priceCents: number;
  amount?: number;  // ETB, BUY
  shares?: number;  // SELL
}

export interface PmOrderReceipt {
  status: string;
  reference: string;
  action: 'BUY' | 'SELL';
  marketId: string;
  marketTitle: string;
  side: 'yes' | 'no';
  outcomeName: string;
  shares: number;
  priceCents: number | null;
  amount: number;
  positionShares: number;
  avgPriceCents: number;
  balance: number;
  realizedPnl?: number;
  executedAt: string;
}

export interface PmPosition {
  id: number;
  marketId: string;
  marketTitle: string;
  category?: string;
  side: 'yes' | 'no';
  outcomeName: string;
  shares: number;
  avgPriceCents: number;
  /** Live market price for this side (backend quote; NO = 100 − YES). */
  currentPriceCents: number;
  lastPriceCents?: number | null;
  costBasis: number;
  currentValue: number;
  unrealizedPnl: number;
  /** Unrealized P/L as a percentage of the average entry price. */
  pnlPercent: number;
  status: 'open' | 'won' | 'lost' | 'closed';
  /** CLOSED = sold before resolution; SETTLED_WON/SETTLED_LOST = market resolved. */
  closeStatus?: 'closed' | 'settled_won' | 'settled_lost';
  /** Price the exit happened at (sell price, or 100/0 on settlement). */
  exitPriceCents?: number | null;
  realizedPnl?: number;
  resolvedAt?: string | null;
  openedAt: string;
}

export interface PmTradeActivity {
  reference: string;
  marketId: string;
  marketTitle: string;
  category?: string;
  side: 'yes' | 'no';
  outcomeName: string;
  action: 'BUY' | 'SELL' | 'RESOLVE_WIN' | 'RESOLVE_LOSS';
  shares: number;
  priceCents?: number | null;
  amount: number;
  executedAt: string;
}

export interface PmPortfolioSummary {
  openPositions: number;
  openCost: number;
  openValue: number;
  unrealizedPnl: number;
  won: number;
  lost: number;
  realizedPnl: number;
  cash: number;
  currency: string;
}

const BASE = '/api/pm';

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = fidaBetApi.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      msg = data.message || data.error || msg;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
};

export const polymarketTradingApi = {
  /** Confirm a BUY or SELL order on the trading panel. */
  placeOrder(req: PmOrderRequest): Promise<PmOrderReceipt> {
    return request<PmOrderReceipt>('/orders', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  openPositions(): Promise<PmPosition[]> {
    return request<PmPosition[]>('/positions');
  },

  positionHistory(): Promise<PmPosition[]> {
    return request<PmPosition[]>('/history');
  },

  activity(limit = 50): Promise<PmTradeActivity[]> {
    return request<PmTradeActivity[]>(`/activity?limit=${limit}`);
  },

  portfolio(): Promise<PmPortfolioSummary> {
    return request<PmPortfolioSummary>('/portfolio');
  },
};

/** Fired after any confirmed prediction-market order so consumers can refresh. */
export const PM_PORTFOLIO_CHANGED = 'pm:portfolio-changed';
