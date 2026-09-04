import { Match, OddsItem, MarketGroup, MatchStats, LiveMatchEvent } from '../types';
import { INITIAL_MATCHES } from '../data/initialMatches';
import { redisCache } from './redisCache';

export interface ApiFootballStatus {
  configured: boolean;
  apiKeyMasked: string;
  provider: 'api-sports' | 'rapidapi' | 'demo-simulator';
  apiUrl: string;
  cacheTtlLiveSec: number;
  cacheTtlOddsSec: number;
  lastCallStatus: 'ok' | 'rate_limited' | 'error' | 'not_called_yet';
  lastCallMessage: string;
  totalApiRequests: number;
  liveMatchesCount: number;
}

export class ApiFootballService {
  private apiKey: string = process.env.API_FOOTBALL_KEY || '';
  private provider: 'api-sports' | 'rapidapi' = 'api-sports';
  private baseUrl: string = 'https://v3.football.api-sports.io';
  private totalApiRequests: number = 0;
  private lastCallStatus: 'ok' | 'rate_limited' | 'error' | 'not_called_yet' = 'not_called_yet';
  private lastCallMessage: string = 'System ready.';

  // In-memory working matches for live updates
  private simulatedMatches: Match[] = [...INITIAL_MATCHES];

  constructor() {
    this.initFromEnv();
    // Preload Redis with initial matches
    this.seedInitialCache();
  }

  private initFromEnv() {
    if (process.env.API_FOOTBALL_PROVIDER === 'rapidapi') {
      this.provider = 'rapidapi';
      this.baseUrl = 'https://api-football-v1.p.rapidapi.com/v3';
    }
  }

  private async seedInitialCache() {
    try {
      const cached = await redisCache.get<Match[]>('football:live:all');
      if (!cached) {
        await redisCache.set('football:live:all', this.simulatedMatches, 25);
      }
    } catch {}
  }

  public setApiKey(key: string, provider: 'api-sports' | 'rapidapi' = 'api-sports') {
    this.apiKey = key.trim();
    this.provider = provider;
    this.baseUrl = provider === 'rapidapi'
      ? 'https://api-football-v1.p.rapidapi.com/v3'
      : 'https://v3.football.api-sports.io';
    console.log(`[API-Football] API Key updated for provider ${provider}`);
  }

  public getStatus(): ApiFootballStatus {
    const masked = this.apiKey
      ? this.apiKey.substring(0, 4) + '...' + this.apiKey.slice(-4)
      : 'None (Simulation Active)';

    return {
      configured: Boolean(this.apiKey && this.apiKey.length > 8),
      apiKeyMasked: masked,
      provider: this.apiKey ? this.provider : 'demo-simulator',
      apiUrl: this.baseUrl,
      cacheTtlLiveSec: 20,
      cacheTtlOddsSec: 15,
      lastCallStatus: this.lastCallStatus,
      lastCallMessage: this.lastCallMessage,
      totalApiRequests: this.totalApiRequests,
      liveMatchesCount: this.simulatedMatches.filter(m => m.isLive).length,
    };
  }

  private getHeaders(): Record<string, string> {
    if (this.provider === 'rapidapi') {
      return {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      };
    }
    return {
      'x-apisports-key': this.apiKey,
    };
  }

  /**
   * Fetch Live Matches using Redis Cache-Aside Pattern
   */
  public async getLiveMatches(sport: string = 'football'): Promise<Match[]> {
    const cacheKey = `football:live:${sport}`;

    // 1. Check Redis Cache
    const cached = await redisCache.get<Match[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    // 2. Cache Miss: Attempt to fetch from API-Football
    if (this.apiKey && this.apiKey.length > 8) {
      try {
        const liveMatches = await this.fetchLiveFromApiFootball();
        if (liveMatches && liveMatches.length > 0) {
          // Store in Redis with 20s TTL
          await redisCache.set(cacheKey, liveMatches, 20);
          redisCache.markSyncCompleted();
          return liveMatches;
        }
      } catch (err: any) {
        console.warn('[API-Football] Error during live fetch, falling back to simulated engine:', err.message);
      }
    }

    // 3. Fallback: Return simulated live matches and cache for 25s
    const fallback = this.simulatedMatches.filter((m) => m.isLive && (sport === 'all' || m.sport === sport));
    await redisCache.set(cacheKey, fallback, 25);
    return fallback;
  }

  /**
   * Fetch Upcoming Matches with Redis Caching
   */
  public async getUpcomingMatches(sport: string = 'football'): Promise<Match[]> {
    const cacheKey = `football:upcoming:${sport}`;

    const cached = await redisCache.get<Match[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    if (this.apiKey && this.apiKey.length > 8) {
      try {
        const upcomingMatches = await this.fetchUpcomingFromApiFootball();
        if (upcomingMatches && upcomingMatches.length > 0) {
          await redisCache.set(cacheKey, upcomingMatches, 180); // 3 mins TTL
          return upcomingMatches;
        }
      } catch (err: any) {
        console.warn('[API-Football] Upcoming fetch fallback:', err.message);
      }
    }

    const fallback = this.simulatedMatches.filter((m) => sport === 'all' || m.sport === sport);
    await redisCache.set(cacheKey, fallback, 180);
    return fallback;
  }

  /**
   * Fetch Match Odds & Market Groups from Redis or API-Football
   */
  public async getMatchMarkets(matchId: string): Promise<MarketGroup[]> {
    const cacheKey = `football:markets:${matchId}`;

    const cached = await redisCache.get<MarketGroup[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if numeric fixture ID (real API-Football fixture)
    if (/^\d+$/.test(matchId) && this.apiKey && this.apiKey.length > 8) {
      try {
        const apiOdds = await this.fetchOddsFromApiFootball(matchId);
        if (apiOdds && apiOdds.length > 0) {
          await redisCache.set(cacheKey, apiOdds, 15);
          return apiOdds;
        }
      } catch (err: any) {
        console.warn(`[API-Football] Error fetching odds for ${matchId}:`, err.message);
      }
    }

    // Generate full market groups based on match odds
    const match = this.simulatedMatches.find((m) => m.id === matchId);
    if (!match) {
      return [];
    }

    const marketGroups: MarketGroup[] = [
      {
        id: 'mg-1x2',
        name: '1X2 (Match Result)',
        markets: [
          {
            id: `m-1x2-${matchId}`,
            name: 'Full Time Winner',
            odds: [match.odds.w1, match.odds.x, match.odds.w2].filter(Boolean) as OddsItem[],
          },
        ],
      },
      {
        id: 'mg-dc',
        name: 'Double Chance',
        markets: [
          {
            id: `m-dc-${matchId}`,
            name: 'Double Chance',
            odds: [match.odds.x1, match.odds.w12, match.odds.x2].filter(Boolean) as OddsItem[],
          },
        ],
      },
      {
        id: 'mg-totals',
        name: 'Total Goals (Over / Under 2.5)',
        markets: [
          {
            id: `m-totals-${matchId}`,
            name: 'Over/Under 2.5',
            odds: [match.odds.totalOver, match.odds.totalUnder].filter(Boolean) as OddsItem[],
          },
        ],
      },
      {
        id: 'mg-handicap',
        name: 'Asian Handicap',
        markets: [
          {
            id: `m-handicap-${matchId}`,
            name: 'Handicap (0.0)',
            odds: [match.odds.handicap1, match.odds.handicap2].filter(Boolean) as OddsItem[],
          },
        ],
      },
    ];

    await redisCache.set(cacheKey, marketGroups, 15);
    return marketGroups;
  }

  /**
   * Real API Call: Fetch Live Fixtures from API-Football
   */
  private async fetchLiveFromApiFootball(): Promise<Match[]> {
    this.totalApiRequests++;
    const url = `${this.baseUrl}/fixtures?live=all`;

    const res = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      if (res.status === 429) {
        this.lastCallStatus = 'rate_limited';
        this.lastCallMessage = 'API-Football rate limit reached. Using Redis cache.';
      } else {
        this.lastCallStatus = 'error';
        this.lastCallMessage = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(`API-Football error: ${res.status}`);
    }

    const data = await res.json();
    this.lastCallStatus = 'ok';
    this.lastCallMessage = `Fetched ${data.results || 0} live fixtures successfully.`;

    if (!data.response || !Array.isArray(data.response)) {
      return [];
    }

    return data.response.slice(0, 25).map((item: any) => this.mapApiFixtureToMatch(item));
  }

  /**
   * Real API Call: Fetch Upcoming Fixtures
   */
  private async fetchUpcomingFromApiFootball(): Promise<Match[]> {
    this.totalApiRequests++;
    const today = new Date().toISOString().split('T')[0];
    const url = `${this.baseUrl}/fixtures?date=${today}&next=20`;

    const res = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`API-Football upcoming error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.response || !Array.isArray(data.response)) {
      return [];
    }

    return data.response.slice(0, 20).map((item: any) => this.mapApiFixtureToMatch(item));
  }

  /**
   * Real API Call: Fetch Odds for a Specific Fixture
   */
  private async fetchOddsFromApiFootball(fixtureId: string): Promise<MarketGroup[]> {
    this.totalApiRequests++;
    const url = `${this.baseUrl}/odds?fixture=${fixtureId}`;

    const res = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`API-Football odds error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.response || data.response.length === 0) {
      return [];
    }

    const bookmaker = data.response[0]?.bookmakers?.[0];
    if (!bookmaker || !bookmaker.bets) {
      return [];
    }

    const groups: MarketGroup[] = [];

    for (const bet of bookmaker.bets) {
      const oddsItems: OddsItem[] = bet.values.map((v: any, idx: number) => ({
        id: `api-odds-${fixtureId}-${bet.id}-${idx}`,
        label: v.value,
        name: v.value,
        marketName: bet.name,
        value: parseFloat(v.odd),
        change: undefined,
        trend: 'same',
      }));

      groups.push({
        id: `mg-api-${bet.id}`,
        name: bet.name,
        markets: [
          {
            id: `m-api-${bet.id}`,
            name: bet.name,
            odds: oddsItems,
          },
        ],
      });
    }

    return groups;
  }

  /**
   * Map API-Football Raw Schema to Fida Bet Match Model
   */
  private mapApiFixtureToMatch(item: any): Match {
    const f = item.fixture || {};
    const league = item.league || {};
    const teams = item.teams || {};
    const goals = item.goals || {};
    const status = f.status?.short || 'NS';

    const isLive = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(status);
    const elapsed = f.status?.elapsed || 0;
    const timeDisplay = isLive ? `${elapsed}'` : (f.status?.long || 'Upcoming');

    const fixtureId = String(f.id);
    const team1Name = teams.home?.name || 'Home Team';
    const team2Name = teams.away?.name || 'Away Team';

    // Calculate baseline synthetic 1X2 odds if bookmaker odds not attached to fixture call
    const score1 = goals.home ?? 0;
    const score2 = goals.away ?? 0;
    const diff = score1 - score2;

    const baseW1 = Math.max(1.05, +(2.10 - diff * 0.45).toFixed(2));
    const baseW2 = Math.max(1.05, +(3.20 + diff * 0.55).toFixed(2));
    const baseX = Math.max(1.10, +(3.10 - Math.abs(diff) * 0.3).toFixed(2));

    return {
      id: fixtureId,
      matchCode: String(f.id).slice(-6),
      sport: 'football',
      league: `${league.country || 'Global'}. ${league.name || 'League'}`,
      country: league.country,
      flag: league.flag,
      team1: team1Name,
      team2: team2Name,
      team1Logo: teams.home?.logo,
      team2Logo: teams.away?.logo,
      score1,
      score2,
      timeDisplay,
      seconds: elapsed * 60,
      period: status,
      isLive,
      hasLiveStream: true,
      isFavorite: false,
      extraMarketsCount: 48,
      venue: f.venue?.name,
      referee: f.referee,
      odds: {
        w1: {
          id: `w1-${fixtureId}`,
          label: '1',
          name: team1Name,
          marketName: '1X2',
          value: baseW1,
          trend: 'same',
        },
        x: {
          id: `x-${fixtureId}`,
          label: 'X',
          name: 'Draw',
          marketName: '1X2',
          value: baseX,
          trend: 'same',
        },
        w2: {
          id: `w2-${fixtureId}`,
          label: '2',
          name: team2Name,
          marketName: '1X2',
          value: baseW2,
          trend: 'same',
        },
        x1: {
          id: `x1-${fixtureId}`,
          label: '1X',
          name: `${team1Name} or Draw`,
          marketName: 'Double Chance',
          value: +(1.25 + Math.random() * 0.1).toFixed(2),
        },
        w12: {
          id: `w12-${fixtureId}`,
          label: '12',
          name: `${team1Name} or ${team2Name}`,
          marketName: 'Double Chance',
          value: +(1.30 + Math.random() * 0.1).toFixed(2),
        },
        x2: {
          id: `x2-${fixtureId}`,
          label: 'X2',
          name: `Draw or ${team2Name}`,
          marketName: 'Double Chance',
          value: +(1.45 + Math.random() * 0.1).toFixed(2),
        },
        totalOver: {
          id: `tot-o-${fixtureId}`,
          label: 'Over 2.5',
          name: 'Over 2.5 Goals',
          marketName: 'Total Over/Under',
          value: 1.85,
        },
        totalUnder: {
          id: `tot-u-${fixtureId}`,
          label: 'Under 2.5',
          name: 'Under 2.5 Goals',
          marketName: 'Total Over/Under',
          value: 1.95,
        },
        handicap1: {
          id: `h1-${fixtureId}`,
          label: 'H1 (0.0)',
          name: `${team1Name} (0.0)`,
          marketName: 'Handicap',
          value: 1.90,
        },
        handicap2: {
          id: `h2-${fixtureId}`,
          label: 'H2 (0.0)',
          name: `${team2Name} (0.0)`,
          marketName: 'Handicap',
          value: 1.90,
        },
      },
    };
  }

  /**
   * Manual Force Sync from API Football to Redis
   */
  public async syncAllFromApi(): Promise<{ count: number; status: string }> {
    console.log('[API-Football] Manual sync triggered. Invalidating Redis cache...');

    // Invalidate Redis caches
    await redisCache.delPattern('football:*');

    let count = 0;
    if (this.apiKey && this.apiKey.length > 8) {
      try {
        const live = await this.fetchLiveFromApiFootball();
        if (live.length > 0) {
          await redisCache.set('football:live:all', live, 20);
          await redisCache.set('football:live:football', live, 20);
          count = live.length;
        }
      } catch (err: any) {
        console.warn('[API-Football] Sync fetch failed:', err.message);
      }
    }

    if (count === 0) {
      // Use fallback
      await redisCache.set('football:live:all', this.simulatedMatches, 25);
      count = this.simulatedMatches.length;
    }

    redisCache.markSyncCompleted();
    return {
      count,
      status: `Successfully synced ${count} matches to Redis cache.`,
    };
  }

  /**
   * Simulate Odds Drift & Market Changes (Updates Redis Cache)
   */
  public async triggerOddsDrift(matchId?: string): Promise<{ matchId: string; changedKeys: string[] }> {
    const target = matchId
      ? this.simulatedMatches.find(m => m.id === matchId)
      : this.simulatedMatches.find(m => m.isLive);

    if (!target) {
      throw new Error('No live match available for odds drift.');
    }

    const oddsToShift: ('w1' | 'x' | 'w2' | 'totalOver' | 'totalUnder')[] = ['w1', 'x', 'w2'];
    const changed: string[] = [];

    oddsToShift.forEach((key) => {
      const current = target.odds[key];
      if (current) {
        const delta = +(Math.random() * 0.12 - 0.06).toFixed(2);
        const newVal = Math.max(1.02, +(current.value + delta).toFixed(2));
        const trend = newVal > current.value ? 'up' : newVal < current.value ? 'down' : 'same';

        target.odds[key] = {
          ...current,
          change: trend === 'up' ? 'up' : trend === 'down' ? 'down' : undefined,
          trend,
          value: newVal,
        };
        changed.push(`${key}: ${current.value} -> ${newVal} (${trend})`);
      }
    });

    // Invalidate and refresh Redis
    await redisCache.set('football:live:all', this.simulatedMatches, 25);
    await redisCache.del(`football:markets:${target.id}`);

    return {
      matchId: target.id,
      changedKeys: changed,
    };
  }
}

export const apiFootballService = new ApiFootballService();
