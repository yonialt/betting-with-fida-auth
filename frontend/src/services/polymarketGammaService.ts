import { PolymarketMarket, PolymarketOutcome } from '../types/polymarket';
import { POLYMARKET_ALL_MARKETS } from '../data/polymarketData';

// Public Gamma API base URL
const GAMMA_BASE_URL = 'https://gamma-api.polymarket.com';

interface GammaMarket {
  id: string;
  question: string;
  conditionId?: string;
  slug?: string;
  outcomePrices?: string; // stringified JSON array like '["0.565", "0.435"]'
  outcomes?: string; // stringified JSON array like '["Yes", "No"]'
  groupItemTitle?: string;
  volume?: number | string;
  volume24hr?: number | string;
  clobTokenIds?: string;
  active?: boolean;
  closed?: boolean;
}

interface GammaTag {
  id: string;
  label: string;
  slug: string;
}

interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  volume?: number | string;
  volume24hr?: number | string;
  liquidity?: number | string;
  category?: string;
  image?: string;
  icon?: string;
  tags?: GammaTag[];
  markets?: GammaMarket[];
  active?: boolean;
  closed?: boolean;
}

function formatVolume(val?: number | string): string {
  if (!val) return '$0 Vol';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '$0 Vol';
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B Vol`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M Vol`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K Vol`;
  }
  return `$${num.toFixed(0)} Vol`;
}

function parseJsonSafe<T>(str: any, fallback: T): T {
  if (!str) return fallback;
  if (typeof str === 'object') return str as T;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

// Convert Gamma API Event to PolymarketMarket
export function transformGammaEvent(event: GammaEvent): PolymarketMarket {
  const markets = event.markets || [];
  const primaryMarket = markets[0];
  const tags = event.tags || [];

  // Determine category
  let category = event.category || 'General';
  if (category === 'undefined' || !category) {
    const tagLabels = tags.map((t) => t.label.toLowerCase());
    if (tagLabels.some((t) => t.includes('crypto') || t.includes('bitcoin') || t.includes('ethereum'))) {
      category = 'Crypto';
    } else if (tagLabels.some((t) => t.includes('sport') || t.includes('soccer') || t.includes('nfl') || t.includes('mlb') || t.includes('tennis'))) {
      category = 'Sports';
    } else if (tagLabels.some((t) => t.includes('politic') || t.includes('election') || t.includes('trump') || t.includes('president'))) {
      category = 'Politics';
    } else if (tagLabels.some((t) => t.includes('esport') || t.includes('game') || t.includes('league'))) {
      category = 'Esports';
    } else if (tagLabels.some((t) => t.includes('tech') || t.includes('ai') || t.includes('model'))) {
      category = 'Tech';
    } else if (tagLabels.some((t) => t.includes('economy') || t.includes('fed') || t.includes('rate'))) {
      category = 'Finance';
    } else {
      category = tags[0]?.label || 'Trending';
    }
  }

  // Determine displayType and outcomes
  const outcomes: PolymarketOutcome[] = [];
  let displayType: PolymarketMarket['displayType'] = 'binary_buttons';

  if (event.title.toLowerCase().includes('btc') && event.title.toLowerCase().includes('5min')) {
    displayType = 'up_down_btc';
  } else if (markets.length > 2) {
    displayType = 'multi_outcome';
    // Multi-candidate / multi-option market
    markets.slice(0, 5).forEach((m) => {
      const prices = parseJsonSafe<string[]>(m.outcomePrices, ['0.5', '0.5']);
      const prob = Math.round(parseFloat(prices[0] || '0.5') * 100) || 50;
      const name = m.groupItemTitle || m.question.replace(/^Will /, '').replace(/\?$/, '');
      outcomes.push({
        name,
        probability: prob,
        yesPrice: prob,
        noPrice: 100 - prob,
      });
    });
  } else if (primaryMarket) {
    const rawOutcomes = parseJsonSafe<string[]>(primaryMarket.outcomes, ['Yes', 'No']);
    const prices = parseJsonSafe<string[]>(primaryMarket.outcomePrices, ['0.5', '0.5']);

    if (
      rawOutcomes.length === 2 &&
      rawOutcomes[0]?.toLowerCase() !== 'yes' &&
      rawOutcomes[1]?.toLowerCase() !== 'no'
    ) {
      displayType = 'versus_match';
      const prob1 = Math.round(parseFloat(prices[0] || '0.5') * 100) || 50;
      const prob2 = Math.round(parseFloat(prices[1] || '0.5') * 100) || 50;
      outcomes.push({
        name: rawOutcomes[0],
        probability: prob1,
        yesPrice: prob1,
        noPrice: 100 - prob1,
      });
      outcomes.push({
        name: rawOutcomes[1],
        probability: prob2,
        yesPrice: prob2,
        noPrice: 100 - prob2,
      });
    } else {
      displayType = 'binary_buttons';
      const probYes = Math.round(parseFloat(prices[0] || '0.5') * 100) || 50;
      const probNo = 100 - probYes;
      outcomes.push({
        name: 'Yes',
        probability: probYes,
        yesPrice: probYes,
        noPrice: probNo,
      });
      outcomes.push({
        name: 'No',
        probability: probNo,
        yesPrice: probNo,
        noPrice: probYes,
      });
    }
  }

  // Fallback outcomes if none created
  if (outcomes.length === 0) {
    outcomes.push(
      { name: 'Yes', probability: 50, yesPrice: 50, noPrice: 50 },
      { name: 'No', probability: 50, yesPrice: 50, noPrice: 50 }
    );
  }

  const vol = formatVolume(event.volume24hr || event.volume);

  return {
    id: `gamma-${event.id || event.slug}`,
    title: event.title,
    category,
    volume: vol,
    displayType,
    outcomes,
    avatarUrl: event.image || event.icon,
    iconType: 'default',
    badge: tags[0]?.label,
  };
}

/**
 * Fetch top events from Polymarket Gamma API
 */
export async function fetchPolymarketGammaEvents(options?: {
  limit?: number;
  tag?: string;
  order?: string;
}): Promise<PolymarketMarket[]> {
  try {
    const limit = options?.limit || 24;
    const order = options?.order || 'volume24hr';
    let url = `${GAMMA_BASE_URL}/events?order=${order}&ascending=false&limit=${limit}&active=true&closed=false`;
    if (options?.tag && options.tag !== 'All') {
      url += `&tag_slug=${encodeURIComponent(options.tag.toLowerCase())}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gamma API responded with ${response.status}`);
    }

    const events: GammaEvent[] = await response.json();
    if (!Array.isArray(events) || events.length === 0) {
      return POLYMARKET_ALL_MARKETS;
    }

    return events.map(transformGammaEvent);
  } catch (err) {
    console.warn('Polymarket Gamma API fetch failed, using fallback market dataset:', err);
    return POLYMARKET_ALL_MARKETS;
  }
}
