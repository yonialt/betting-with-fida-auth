import { PolymarketMarket, PolymarketOutcome } from '../types/polymarket';
import { POLYMARKET_ALL_MARKETS, marketLogoUrl } from '../data/polymarketData';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export interface FetchGammaOptions {
  limit?: number;
  tag?: string;
  order?: string;
}

function formatVolume(val: number | string | undefined): string {
  if (!val) return '0 ETB Vol.';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0 ETB Vol.';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B ETB Vol.`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M ETB Vol.`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K ETB Vol.`;
  return `${Math.round(num)} ETB Vol.`;
}

function parseJsonSafe<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function normalizeGammaText(value?: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function compactGammaText(value?: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '').trim();
}

function resolveGammaProjectId(event: any): string | undefined {
  const rawText = [
    event?.id,
    event?.slug,
    event?.ticker,
    event?.title,
    event?.category,
    event?.tags?.map((tag: any) => tag?.label || tag?.slug || tag?.name).join(' '),
  ].filter(Boolean).join(' ');

  const text = compactGammaText(rawText);

  if (!text) return undefined;

  const keyMatches = Object.keys(marketLogoUrl).find((key) => {
    const compactKey = compactGammaText(key);
    return !!compactKey && text.includes(compactKey.replace(/^pm/, ''));
  });

  if (keyMatches) return keyMatches;

  const rules: Array<[RegExp, string]> = [
    [/red\s*sea|sea\s*port|port\s*access/, 'pm-eth-redsea'],
    [/coffee.*export|export.*coffee/, 'pm-eth-coffee-export'],
    [/birr|fx.*etb|etb.*fx/, 'pm-eth-birr-fx'],
    [/bitcoin.*mining|mining.*bitcoin|hash.*rate/, 'pm-eth-bitcoin-mining'],
    [/gerd|dam.*capacity|capacity.*dam/, 'pm-eth-gerd-capacity'],
    [/weather.*addis|addis.*weather|temperature.*addis/, 'pm-eth-weather-addis-temp'],
    [/openai.*agi|agi.*2027/, 'pm-openai-agi-2027'],
    [/hurricane|named.*storm/, 'weath-atlantic-named-hurricanes'],
    [/warmest.*year|global.*warming|copernicus|noaa/, 'weath-global-2026-warmest'],
    [/russia.*ukraine|ukraine.*ceasefire|ceasefire/, 'russia-ukraine-ceasefire'],
    [/bitcoin|btc/, 'pm-btc-5m'],
  ];

  for (const [regex, id] of rules) {
    if (regex.test(normalizeGammaText(rawText))) {
      return id;
    }
  }

  return undefined;
}

function resolveGammaMarketLogo(event: any): string | undefined {
  const projectId = resolveGammaProjectId(event);
  if (projectId && marketLogoUrl[projectId]) return marketLogoUrl[projectId];

  const text = normalizeGammaText(
    [event?.title, event?.ticker, event?.slug, event?.category, event?.tags?.map((tag: any) => tag?.label).join(' ')].join(' ')
  );

  const directMatch = Object.entries(marketLogoUrl).find(([key, logo]) => {
    const compactKey = compactGammaText(key);
    return compactKey && text.includes(compactKey.replace(/^pm/, '')) && !!logo;
  });

  return directMatch?.[1];
}

export async function fetchPolymarketGammaEvents(
  options: FetchGammaOptions = {}
): Promise<PolymarketMarket[]> {
  const { limit = 28, tag, order = 'volume24hr' } = options;

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      order,
      ascending: 'false',
      active: 'true',
      closed: 'false',
    });

    if (tag && tag.toLowerCase() !== 'all') {
      params.append('tag_slug', tag.toLowerCase());
    }

    const res = await fetch(`${GAMMA_API_BASE}/events?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Gamma API] HTTP ${res.status} returned. Falling back to local data.`);
      return POLYMARKET_ALL_MARKETS;
    }

    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) {
      return POLYMARKET_ALL_MARKETS;
    }

    const mapped: PolymarketMarket[] = events.map((event: any, idx: number) => {
      const marketsList = Array.isArray(event.markets) ? event.markets : [];
      const primaryCategory =
        event.tags?.[0]?.label || event.category || 'General';

      let outcomes: PolymarketOutcome[] = [];
      let displayType = 'multi_outcome';

      if (marketsList.length === 1) {
        const m = marketsList[0];
        const rawOutcomes = parseJsonSafe<string[]>(m.outcomes, ['Yes', 'No']);
        const rawPrices = parseJsonSafe<string[]>(m.outcomePrices, ['0.5', '0.5']);

        const yesPriceFloat = parseFloat(rawPrices[0] || '0.5');
        const noPriceFloat = parseFloat(rawPrices[1] || '0.5');
        const yesPercent = Math.round(yesPriceFloat * 100);
        const noPercent = 100 - yesPercent;

        outcomes = [
          {
            name: rawOutcomes[0] || 'Yes',
            probability: yesPercent,
            yesPrice: yesPercent,
            noPrice: noPercent,
          },
          {
            name: rawOutcomes[1] || 'No',
            probability: noPercent,
            yesPrice: noPercent,
            noPrice: yesPercent,
          },
        ];
        displayType = 'binary_buttons';
      } else if (marketsList.length > 1) {
        // Multi-outcome market (e.g. US Open winner, Fed Decision dates, etc.)
        outcomes = marketsList.slice(0, 4).map((m: any) => {
          const rawPrices = parseJsonSafe<string[]>(m.outcomePrices, ['0.5', '0.5']);
          const yesPriceFloat = parseFloat(rawPrices[0] || '0.5');
          const prob = Math.round(yesPriceFloat * 100);

          return {
            name: m.groupItemTitle || m.question || 'Option',
            probability: prob,
            yesPrice: prob,
            noPrice: 100 - prob,
          };
        });
        displayType = 'multi_outcome';
      } else {
        // Fallback outcomes if markets array is empty
        outcomes = [
          { name: 'Yes', probability: 50, yesPrice: 50, noPrice: 50 },
          { name: 'No', probability: 50, yesPrice: 50, noPrice: 50 },
        ];
      }

      const projectMarketId = resolveGammaProjectId(event) || String(event.id || `gamma-${idx}`);
      const resolvedLogo = resolveGammaMarketLogo(event);
      const finalImage = resolvedLogo || event.image || event.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&h=64&fit=crop';

      return {
        id: projectMarketId,
        title: event.title || event.ticker || 'Prediction Market',
        category: primaryCategory,
        volume: formatVolume(event.volume || event.volume24hr),
        displayType,
        avatarUrl: finalImage,
        imageUrl: finalImage,
        logoUrl: resolvedLogo,
        isLive: Boolean(event.active),
        outcomes,
        slug: event.slug,
        timeInfo: 'Active',
      };
    });

    return mapped;
  } catch (err) {
    console.warn('[Gamma API] Error loading live Polymarket events:', err);
    return POLYMARKET_ALL_MARKETS;
  }
}
