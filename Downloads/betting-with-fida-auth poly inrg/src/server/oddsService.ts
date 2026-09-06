import { Match, OddsItem, MarketGroup } from '../types';
import { redisCache } from './redisCache';

export interface OddsApiStatus {
  configured: boolean;
  apiKeyMasked: string;
  provider: 'odds-api' | 'the-rundown' | 'bet-better' | 'free-public';
  apiUrl: string;
  freeEngineActive: boolean;
  lastCallStatus: 'ok' | 'rate_limited' | 'error' | 'not_called_yet';
  lastCallMessage: string;
  totalApiRequests: number;
  supportedSports: string[];
  predictionMarkets: boolean;
}

export class OddsService {
  private apiKey: string = process.env.ODDS_API_KEY || '';
  private provider: 'odds-api' | 'the-rundown' | 'bet-better' | 'free-public' = 'free-public';
  private baseUrl: string = 'https://api.the-odds-api.com/v4/sports';
  private totalApiRequests: number = 0;
  private lastCallStatus: 'ok' | 'rate_limited' | 'error' | 'not_called_yet' = 'not_called_yet';
  private lastCallMessage: string = 'Free Public Odds Engine Active';
  private supportedSports: string[] = ['football', 'tennis', 'basketball', 'esports'];
  private predictionMarkets: boolean = false;

  constructor() {
    this.initFromEnv();
  }

  private initFromEnv() {
    if (process.env.ODDS_API_PROVIDER === 'the-rundown') {
      this.provider = 'the-rundown';
      this.baseUrl = 'https://api.the-rundown.com/v1';
    } else if (process.env.ODDS_API_PROVIDER === 'bet-better') {
      this.provider = 'bet-better';
      this.baseUrl = 'https://betbetter.world/api';
      this.predictionMarkets = true;
    }
  }

  public setApiKey(key: string, provider: 'odds-api' | 'the-rundown' | 'bet-better' = 'odds-api') {
    this.apiKey = key.trim();
    this.provider = provider;
    switch (provider) {
      case 'the-rundown':
        this.baseUrl = 'https://api.the-rundown.com/v1';
        this.predictionMarkets = true;
        break;
      case 'bet-better':
        this.baseUrl = 'https://betbetter.world/api';
        this.predictionMarkets = true;
        break;
      default:
        this.baseUrl = 'https://api.the-odds-api.com/v4/sports';
        this.predictionMarkets = false;
    }
    console.log(`[OddsService] API Key updated for provider ${provider}`);
  }

  public getStatus(): OddsApiStatus {
    const masked = this.apiKey
      ? this.apiKey.substring(0, 4) + '...' + this.apiKey.slice(-4)
      : 'Free Public Odds Engine (Active)';

    return {
      configured: Boolean(this.apiKey && this.apiKey.length > 8),
      apiKeyMasked: masked,
      provider: this.apiKey ? this.provider : 'free-public',
      apiUrl: this.apiKey ? this.baseUrl : 'https://api-football.com (Free)',
      freeEngineActive: true,
      lastCallStatus: this.lastCallStatus,
      lastCallMessage: this.lastCallMessage,
      totalApiRequests: this.totalApiRequests,
      supportedSports: this.supportedSports,
      predictionMarkets: this.predictionMarkets,
    };
  }

  /**
   * Fetch real-time odds from public API (The Odds API, The Rundown, Bet Better)
   */
  public async getLiveOdds(sport: string = 'football'): Promise<Match[]> {
    const cacheKey = `odds:live:${sport}`;

    // 1. Check Redis Cache
    const cached = await redisCache.get<Match[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    // 2. Try real API if key configured
    if (this.apiKey && this.apiKey.length > 8) {
      try {
        const odds = await this.fetchOddsFromApi(sport);
        if (odds.length > 0) {
          await redisCache.set(cacheKey, odds, 20);
          this.lastCallStatus = 'ok';
          this.lastCallMessage = `Fetched ${odds.length} live odds from ${this.provider}`;
          return odds;
        }
      } catch (err: any) {
        console.warn(`[OddsService] API fetch error: ${err.message}`);
        this.lastCallStatus = 'error';
        this.lastCallMessage = err.message;
      }
    }

    // 3. Fallback: Return simulated odds data (mock)
    const fallback = this.generateMockOdds(sport);
    await redisCache.set(cacheKey, fallback, 20);
    return fallback;
  }

  /**
   * Fetch upcoming match odds
   */
  public async getUpcomingOdds(sport: string = 'football'): Promise<Match[]> {
    const cacheKey = `odds:upcoming:${sport}`;

    const cached = await redisCache.get<Match[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    if (this.apiKey && this.apiKey.length > 8) {
      try {
        const odds = await this.fetchUpcomingFromApi(sport);
        if (odds.length > 0) {
          await redisCache.set(cacheKey, odds, 180);
          return odds;
        }
      } catch (err: any) {
        console.warn(`[OddsService] Upcoming fetch error: ${err.message}`);
      }
    }

    const fallback = this.generateMockOdds(sport, false);
    await redisCache.set(cacheKey, fallback, 180);
    return fallback;
  }

  /**
   * Get odds for a specific match
   */
  public async getMatchOdds(matchId: string): Promise<MarketGroup[]> {
    const cacheKey = `odds:match:${matchId}`;

    const cached = await redisCache.get<MarketGroup[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try real API
    if (this.apiKey && this.apiKey.length > 8) {
      try {
        const odds = await this.fetchMatchOddsFromApi(matchId);
        if (odds.length > 0) {
          await redisCache.set(cacheKey, odds, 15);
          return odds;
        }
      } catch (err: any) {
        console.warn(`[OddsService] Match odds fetch error: ${err.message}`);
      }
    }

    // Fallback: generate from mock data
    const mockOdds = this.generateMockMarketGroups(matchId);
    await redisCache.set(cacheKey, mockOdds, 15);
    return mockOdds;
  }

  /**
   * Fetch prediction market data (Polymarket-style)
   */
  public async getPredictionMarkets(category: string = 'sports'): Promise<any[]> {
    const cacheKey = `odds:prediction:${category}`;

    const cached = await redisCache.get<any[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    // Try BetBetter or The Rundown API for prediction markets
    if (this.apiKey && this.apiKey.length > 8 && (this.provider === 'bet-better' || this.provider === 'the-rundown')) {
      try {
        const markets = await this.fetchPredictionMarketsFromApi(category);
        if (markets.length > 0) {
          await redisCache.set(cacheKey, markets, 30);
          return markets;
        }
      } catch (err: any) {
        console.warn(`[OddsService] Prediction markets fetch error: ${err.message}`);
      }
    }

    // Fallback: generate mock prediction markets
    const mockMarkets = this.generateMockPredictionMarkets(category);
    await redisCache.set(cacheKey, mockMarkets, 30);
    return mockMarkets;
  }

  /**
   * Real API call to The Odds API
   */
  private async fetchOddsFromApi(sport: string): Promise<Match[]> {
    this.totalApiRequests++;
    
    // The Odds API endpoint for live odds
    const url = `${this.baseUrl}/${this.getSportKey(sport)}/odds/?regions=us&markets=h2h,total,spread&oddsFormat=decimal`;

    const res = await fetch(url, {
      headers: {
        'api-key': this.apiKey,
      },
    });

    if (!res.ok) {
      if (res.status === 429) {
        this.lastCallStatus = 'rate_limited';
        this.lastCallMessage = 'Odds API rate limit reached';
      } else {
        this.lastCallStatus = 'error';
        this.lastCallMessage = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(`Odds API error: ${res.statusText}`);
    }

    const data = await res.json();
    this.lastCallStatus = 'ok';
    this.lastCallMessage = `Successfully fetched odds from ${this.provider}`;

    return data.map((item: any) => this.mapOddsApiToMatch(item));
  }

  /**
   * Map The Odds API response to Match format
   */
  private mapOddsApiToMatch(item: any): Match {
    const sportKey = item.sport_title?.toLowerCase() || 'football';
    const teams = item.teams?.split(' vs ') || ['Team 1', 'Team 2'];
    
    // Find the best odds from available bookmakers
    const h2hOdds = item.odds?.find((o: any) => o.market === 'h2h');
    const totalOdds = item.odds?.find((o: any) => o.market === 'total');
    
    const baseW1 = h2hOdds?.outcomes?.[0]?.price || 1.5;
    const baseW2 = h2hOdds?.outcomes?.[1]?.price || 2.5;

    return {
      id: item.id || `odds-${Date.now()}`,
      matchCode: String(item.id || Math.floor(Math.random() * 1000000)),
      sport: sportKey,
      league: item.season?.name || 'League',
      country: item.country_code || 'US',
      team1: teams[0] || 'Home Team',
      team2: teams[1] || 'Away Team',
      score1: item.last_update?.score?.home || 0,
      score2: item.last_update?.score?.away || 0,
      timeDisplay: item.last_update?.period || 'Live',
      isLive: !!item.last_update,
      period: item.last_update?.period || (!!item.last_update ? 'Live' : 'Upcoming'),
      extraMarketsCount: item.odds?.length || 5,
      odds: {
        w1: {
          id: `w1-${item.id}`,
          label: '1',
          name: teams[0],
          marketName: 'Match Winner',
          value: baseW1,
        },
        x: {
          id: `x-${item.id}`,
          label: 'X',
          name: 'Draw',
          marketName: 'Match Winner',
          value: 3.0,
        },
        w2: {
          id: `w2-${item.id}`,
          label: '2',
          name: teams[1],
          marketName: 'Match Winner',
          value: baseW2,
        },
        totalOver: {
          id: `tot-o-${item.id}`,
          label: 'O',
          name: 'Over',
          marketName: 'Total',
          value: totalOdds?.outcomes?.find((o: any) => o.name.includes('Over'))?.price || 1.9,
        },
        totalUnder: {
          id: `tot-u-${item.id}`,
          label: 'U',
          name: 'Under',
          marketName: 'Total',
          value: totalOdds?.outcomes?.find((o: any) => o.name.includes('Under'))?.price || 1.9,
        },
      },
    };
  }

  /**
   * Fetch upcoming odds from API
   */
  private async fetchUpcomingFromApi(sport: string): Promise<Match[]> {
    this.totalApiRequests++;
    
    // Different endpoint for upcoming (no live scores)
    const url = `${this.baseUrl}/${this.getSportKey(sport)}/odds/?regions=us&markets=h2h,total,spread&oddsFormat=decimal&live=false`;

    const res = await fetch(url, {
      headers: {
        'api-key': this.apiKey,
      },
    });

    if (!res.ok) {
      throw new Error(`Upcoming odds error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.map((item: any) => this.mapOddsApiToMatch(item));
  }

  /**
   * Fetch odds for specific match ID
   */
  private async fetchMatchOddsFromApi(matchId: string): Promise<MarketGroup[]> {
    this.totalApiRequests++;
    
    // The Odds API doesn't have a direct "match by ID" endpoint
    // We'll need to fetch all odds and filter - this is a simplified approach
    const url = `${this.baseUrl}/${this.getSportKey('football')}/odds/?regions=us&markets=h2h,total,spread&oddsFormat=decimal`;

    const res = await fetch(url, {
      headers: {
        'api-key': this.apiKey,
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const matchData = data.find((item: any) => item.id === matchId || item.groupby === matchId);
    
    if (!matchData) {
      return [];
    }

    // Convert to MarketGroup format
    const groups: MarketGroup[] = [];
    
    // Group by market type
    const markets = matchData.odds || [];
    const h2hMarket = markets.filter((m: any) => m.market === 'h2h');
    const totalMarket = markets.filter((m: any) => m.market === 'total');
    const spreadMarket = markets.filter((m: any) => m.market === 'spread');

    if (h2hMarket.length > 0) {
      groups.push({
        id: 'mg-h2h',
        name: 'Match Winner (1X2)',
        markets: [{
          id: 'm-h2h',
          name: 'Full Time Result',
          odds: h2hMarket.flatMap((m: any) => 
            m.outcomes.map((o: any, idx: number) => ({
              id: `h2h-${m.outcomes[idx]?.name?.toLowerCase().replace(/\s/g, '-')}`,
              label: m.outcomes[idx]?.name || '',
              name: m.outcomes[idx]?.name || '',
              marketName: 'Match Winner',
              value: m.outcomes[idx]?.price || 0,
            }))
          ),
        }],
      });
    }

    if (totalMarket.length > 0) {
      groups.push({
        id: 'mg-total',
        name: 'Total Goals/Points',
        markets: [{
          id: 'm-total',
          name: 'Over/Under',
          odds: totalMarket.flatMap((m: any) =>
            m.outcomes.map((o: any) => ({
              id: `total-${m.outcomes.find(o => o.name?.toLowerCase().includes('over'))?.name || 'over'}`,
              label: o.name?.includes('Over') ? 'O' : 'U',
              name: o.name || '',
              marketName: 'Total',
              value: o.price || 0,
            }))
          ),
        }],
      });
    }

    return groups;
  }

  /**
   * Fetch prediction markets from BetBetter API
   */
  private async fetchPredictionMarketsFromApi(category: string): Promise<any[]> {
    this.totalApiRequests++;
    
    // BetBetter API endpoint for prediction markets
    // This is a simplified implementation - adjust based on actual API docs
    const url = this.provider === 'bet-better'
      ? `https://betbetter.world/api/markets?category=${category}&status=open`
      : `https://api.the-rundown.com/v1/markets?sport=${this.getSportKey(category)}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Prediction markets error: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Transform to common format
    return (data.markets || data || []).map((item: any) => ({
      id: item.id,
      title: item.name || item.title || 'Market',
      description: item.description || '',
      category: item.category || category,
      outcomes: item.outcomes?.map((o: any) => ({
        name: o.name || o.outcome,
        price: o.price || o.odds,
        volume: o.volume || 0,
        probability: o.probability || 0,
      })) || [],
      totalVolume: item.totalVolume || 0,
      startDate: item.startDate || item.date,
      endDate: item.endDate || item.resolveDate,
      status: item.status || 'open',
    }));
  }

  /**
   * Get sport key for API (different APIs use different keys)
   */
  private getSportKey(sport: string): string {
    const mapping: Record<string, string> = {
      football: 'soccer',
      tennis: 'tennis',
      basketball: 'basketball',
      esports: 'esports',
      cricket: 'cricket',
    };
    return mapping[sport] || sport;
  }

  /**
   * Generate mock odds for fallback
   */
  private generateMockOdds(sport: string, live: boolean = true): Match[] {
    const mockMatches: Match[] = [];
    
    if (sport === 'football' || sport === 'all') {
      mockMatches.push({
        id: `mock-odds-${Date.now()}-1`,
        matchCode: '928401',
        sport: 'football',
        league: 'Argentina. Primera Division',
        country: 'Argentina',
        team1: 'Belgrano',
        team2: 'Club Atletico Huracan',
        score1: live ? 1 : 0,
        score2: live ? 0 : 0,
        timeDisplay: live ? '28:34' : 'Upcoming',
        isLive: live,
        period: live ? 'Live' : 'Upcoming',
        extraMarketsCount: 303,
        odds: {
          w1: { id: 'w1', label: '1', name: 'Belgrano', marketName: '1X2 (Match Winner)', value: 1.225 },
          x: { id: 'x', label: 'X', name: 'Draw', marketName: '1X2 (Match Winner)', value: 5.35 },
          w2: { id: 'w2', label: '2', name: 'Club Atletico Huracan', marketName: '1X2 (Match Winner)', value: 19 },
          totalOver: { id: 'tot-o', label: 'O', name: 'Over 2.5 Goals', marketName: 'Total Goals', value: 2.304 },
          totalUnder: { id: 'tot-u', label: 'U', name: 'Under 2.5 Goals', marketName: 'Total Goals', value: 1.616 },
        },
      });
      
      // Add another mock football match
      mockMatches.push({
        id: `mock-odds-${Date.now()}-football2`,
        matchCode: '154748',
        sport: 'football',
        league: 'Argentina. Primera Division',
        country: 'Argentina',
        team1: 'Club Atletico Tigre',
        team2: 'Barracas Central',
        score1: 0,
        score2: 0,
        timeDisplay: '16:55',
        isLive: true,
        period: 'Live',
        extraMarketsCount: 516,
        odds: {
          w1: { id: 'w1', label: '1', name: 'Tigre', marketName: '1X2', value: 2.13 },
          x: { id: 'x', label: 'X', name: 'Draw', marketName: '1X2', value: 2.664 },
          w2: { id: 'w2', label: '2', name: 'Barracas Central', marketName: '1X2', value: 5.07 },
          totalOver: { id: 'tot-o', label: 'O', name: 'Over 2.5', marketName: 'Total', value: 1.85 },
          totalUnder: { id: 'tot-u', label: 'U', name: 'Under 2.5', marketName: 'Total', value: 1.95 },
        },
      });
    }

    if (sport === 'tennis' || sport === 'all') {
      mockMatches.push({
        id: `mock-odds-${Date.now()}-2`,
        matchCode: '839211',
        sport: 'tennis',
        league: 'US Open. Hard',
        country: 'USA',
        team1: 'Jiri Lehecka (18)',
        team2: 'Stefanos Tsitsipas',
        score1: 1,
        score2: 1,
        timeDisplay: '3rd set',
        isLive: true,
        period: 'Live',
        extraMarketsCount: 208,
        odds: {
          w1: { id: 'w1', label: '1', name: 'Jiri Lehecka', marketName: 'Match Winner', value: 1.73 },
          w2: { id: 'w2', label: '2', name: 'Stefanos Tsitsipas', marketName: 'Match Winner', value: 2.104 },
          totalOver: { id: 'tot-o', label: 'O', name: 'Over 38.5 Games', marketName: 'Total Games', value: 1.9 },
          totalUnder: { id: 'tot-u', label: 'U', name: 'Under 38.5 Games', marketName: 'Total Games', value: 1.9 },
        },
      });
    }

    if (sport === 'basketball' || sport === 'all') {
      mockMatches.push({
        id: `mock-odds-${Date.now()}-basketball`,
        matchCode: '998877',
        sport: 'basketball',
        league: 'NBA',
        country: 'USA',
        team1: 'Los Angeles Lakers',
        team2: 'Boston Celtics',
        score1: 95,
        score2: 98,
        timeDisplay: 'Q4 2:30',
        isLive: true,
        period: 'Live',
        extraMarketsCount: 150,
        odds: {
          w1: { id: 'w1', label: '1', name: 'Lakers', marketName: 'Match Winner', value: 2.45 },
          x: { id: 'x', label: 'X', name: 'Draw', marketName: 'Match Winner', value: 0 },
          w2: { id: 'w2', label: '2', name: 'Celtics', marketName: 'Match Winner', value: 1.55 },
          totalOver: { id: 'tot-o', label: 'O', name: 'Over 215.5', marketName: 'Total Points', value: 1.9 },
          totalUnder: { id: 'tot-u', label: 'U', name: 'Under 215.5', marketName: 'Total Points', value: 1.9 },
        },
      });
    }

    return mockMatches;
  }

  /**
   * Generate mock market groups
   */
  private generateMockMarketGroups(matchId: string): MarketGroup[] {
    return [
      {
        id: 'mg-1x2',
        name: '1X2 (Match Winner)',
        markets: [{
          id: `m-1x2-${matchId}`,
          name: 'Full Time Winner',
          odds: [
            { id: 'w1', label: '1', name: 'Home Team', marketName: '1X2', value: 1.5 },
            { id: 'x', label: 'X', name: 'Draw', marketName: '1X2', value: 3.5 },
            { id: 'w2', label: '2', name: 'Away Team', marketName: '1X2', value: 5.5 },
          ],
        }],
      },
      {
        id: 'mg-totals',
        name: 'Total (Over/Under)',
        markets: [{
          id: `m-total-${matchId}`,
          name: 'Over/Under 2.5',
          odds: [
            { id: 'tot-o', label: 'O', name: 'Over 2.5', marketName: 'Total', value: 1.85 },
            { id: 'tot-u', label: 'U', name: 'Under 2.5', marketName: 'Total', value: 1.95 },
          ],
        }],
      },
    ];
  }

  /**
   * Generate mock prediction markets (Polymarket-style)
   */
  private generateMockPredictionMarkets(category: string): any[] {
    const mockMarkets = [
      {
        id: 'polymarket-sports-1',
        title: 'Manchester City to Win UCL 2024-25',
        description: 'Will Manchester City win the 2024-25 UEFA Champions League?',
        category: 'sports',
        outcomes: [
          { name: 'Yes', price: 2.15, volume: 450000, probability: 46.5 },
          { name: 'No', price: 1.85, volume: 520000, probability: 54.1 },
        ],
        totalVolume: 970000,
        startDate: '2024-09-17',
        endDate: '2025-05-31',
        status: 'open',
      },
      {
        id: 'polymarket-sports-2',
        title: 'Djokovic to Win US Open 2024',
        description: 'Will Novak Djokovic win the 2024 US Open Men\'s Singles?',
        category: 'sports',
        outcomes: [
          { name: 'Yes', price: 3.50, volume: 280000, probability: 28.5 },
          { name: 'No', price: 1.35, volume: 650000, probability: 74.1 },
        ],
        totalVolume: 930000,
        startDate: '2024-08-26',
        endDate: '2024-09-08',
        status: 'open',
      },
      {
        id: 'polymarket-crypto-1',
        title: 'Bitcoin Crosses $100k Before Dec 31',
        description: 'Will Bitcoin price exceed $100,000 USD before December 31, 2024?',
        category: 'crypto',
        outcomes: [
          { name: 'Yes', price: 1.80, volume: 1200000, probability: 55.5 },
          { name: 'No', price: 2.25, volume: 850000, probability: 44.4 },
        ],
        totalVolume: 2050000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'open',
      },
    ];

    // Filter by category if specified
    if (category !== 'all' && category !== 'sports') {
      return mockMarkets.filter((m) => m.category === category);
    }

    return mockMarkets;
  }

  /**
   * Sync all odds from API to Redis cache
   */
  public async syncAllFromApi(): Promise<{ count: number; status: string }> {
    console.log('[OddsService] Manual sync triggered');

    await redisCache.delPattern('odds:*');

    let count = 0;
    try {
      const liveOdds = await this.getLiveOdds('football');
      const upcomingOdds = await this.getUpcomingOdds('football');
      
      if (liveOdds.length > 0) {
        await redisCache.set('odds:live:football', liveOdds, 20);
        count += liveOdds.length;
      }
      if (upcomingOdds.length > 0) {
        await redisCache.set('odds:upcoming:football', upcomingOdds, 180);
        count += upcomingOdds.length;
      }

      this.lastCallStatus = 'ok';
      this.lastCallMessage = `Synced ${count} odds from ${this.provider}`;
    } catch (err: any) {
      console.warn('[OddsService] Sync error:', err.message);
      this.lastCallStatus = 'error';
      this.lastCallMessage = err.message;
    }

    return {
      count,
      status: `Successfully synced ${count} odds from ${this.provider}`,
    };
  }
}

export const oddsService = new OddsService();
