/**
 * Local mock feed service for testing real-time market data
 * (Price ticks, OHLCV candles, and orderbook snapshots)
 *
 * NOTE: Local test feed only — not wired to production external APIs.
 */

export interface CandleData {
  time: number; // Unix timestamp in seconds (UTCTimestamp)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderbookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderbookDepthData {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  spread: number;
  midPrice: number;
}

/**
 * Generate historical candle data for a given symbol and base price
 */
export function generateHistoricalCandles(
  basePrice: number = 79820,
  count: number = 80,
  intervalSeconds: number = 300 // 5-minute candles
): CandleData[] {
  const candles: CandleData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * intervalSeconds;

  let currentPrice = basePrice * 0.985;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalSeconds;
    const volatility = currentPrice * 0.0025;
    const change = (Math.random() - 0.48) * volatility;
    const open = Number(currentPrice.toFixed(2));
    const close = Number((open + change).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * volatility * 0.8).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * volatility * 0.8).toFixed(2));
    const volume = Math.floor(15000 + Math.random() * 85000);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  // Sort ascending by time to strictly satisfy lightweight-charts requirement
  return candles.sort((a, b) => a.time - b.time);
}

/**
 * Generate realistic synthetic orderbook depth around a mid price
 */
export function generateOrderbookDepth(midPrice: number = 79825): OrderbookDepthData {
  const bids: OrderbookLevel[] = [];
  const asks: OrderbookLevel[] = [];

  let cumBidTotal = 0;
  let cumAskTotal = 0;

  // 15 bid levels descending
  for (let i = 1; i <= 15; i++) {
    const price = Number((midPrice - i * 3.5).toFixed(2));
    const size = Number((0.5 + Math.random() * 2.8 + i * 0.2).toFixed(3));
    cumBidTotal += size;
    bids.push({ price, size, total: Number(cumBidTotal.toFixed(3)) });
  }

  // 15 ask levels ascending
  for (let i = 1; i <= 15; i++) {
    const price = Number((midPrice + i * 3.5).toFixed(2));
    const size = Number((0.5 + Math.random() * 2.8 + i * 0.2).toFixed(3));
    cumAskTotal += size;
    asks.push({ price, size, total: Number(cumAskTotal.toFixed(3)) });
  }

  const bestBid = bids[0]?.price || midPrice - 1;
  const bestAsk = asks[0]?.price || midPrice + 1;
  const spread = Number((bestAsk - bestBid).toFixed(2));

  return {
    bids,
    asks,
    spread,
    midPrice,
  };
}

/**
 * Create a live simulated feed subscriber
 * Returns an unsubscribe callback.
 */
export function subscribeToMockPriceFeed(
  initialPrice: number,
  onTick: (tick: { time: number; price: number; volumeDelta: number }) => void,
  intervalMs: number = 1500
): () => void {
  let lastPrice = initialPrice;

  const timer = setInterval(() => {
    const jitter = (Math.random() - 0.49) * (lastPrice * 0.0006);
    lastPrice = Number((lastPrice + jitter).toFixed(2));
    const volumeDelta = Math.floor(50 + Math.random() * 300);

    onTick({
      time: Math.floor(Date.now() / 1000),
      price: lastPrice,
      volumeDelta,
    });
  }, intervalMs);

  return () => clearInterval(timer);
}
