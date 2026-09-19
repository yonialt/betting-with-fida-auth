import { useCallback, useEffect, useState } from 'react';
import {
  polymarketTradingApi,
  PmPosition,
  PmTradeActivity,
  PmPortfolioSummary,
  PM_PORTFOLIO_CHANGED,
} from '../services/polymarketTradingApi';
import { useBetting } from '../context/BettingContext';

/**
 * Loads the backend-driven prediction-market portfolio for the signed-in user:
 * open positions, settled history, the activity ledger and the summary.
 * Refreshes when the signed-in identity changes and whenever a confirmed
 * prediction-market order fires the pm:portfolio-changed event — so a position
 * appears the moment its trade settles. Sportsbook state is never touched.
 */
export const usePolymarketPortfolio = () => {
  const { user } = useBetting();
  const [positions, setPositions] = useState<PmPosition[]>([]);
  const [history, setHistory] = useState<PmPosition[]>([]);
  const [activity, setActivity] = useState<PmTradeActivity[]>([]);
  const [summary, setSummary] = useState<PmPortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user.isLoggedIn) {
      setPositions([]);
      setHistory([]);
      setActivity([]);
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [pos, hist, act, sum] = await Promise.all([
        polymarketTradingApi.openPositions(),
        polymarketTradingApi.positionHistory(),
        polymarketTradingApi.activity(100),
        polymarketTradingApi.portfolio(),
      ]);
      setPositions(pos);
      setHistory(hist);
      setActivity(act);
      setSummary(sum);
    } catch (err: any) {
      setError(err?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [user.isLoggedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onPmChange = () => {
      refresh();
    };
    window.addEventListener(PM_PORTFOLIO_CHANGED, onPmChange);
    return () => window.removeEventListener(PM_PORTFOLIO_CHANGED, onPmChange);
  }, [refresh]);

  return { positions, history, activity, summary, loading, error, refresh };
};
