import { Match, PlacedBet, UserProfile, BetSlipItem, MarketGroup, MatchStats, LiveMatchEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class FidaBetApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem('fidabet_token');
    this.refreshToken = localStorage.getItem('fidabet_refresh_token');
  }

  public setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('fidabet_token', token);
    localStorage.setItem('fidabet_refresh_token', refreshToken);
  }

  public clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('fidabet_token');
    localStorage.removeItem('fidabet_refresh_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const doFetch = async (tokenToSend?: string) => {
      const h = { ...headers };
      if (tokenToSend) h['Authorization'] = `Bearer ${tokenToSend}`;
      return fetch(url, { ...options, headers: h });
    };

    let response = await doFetch(this.token || undefined);

    // Invalid or expired token: clear the stored session and surface the error.
    // Never silently re-authenticate or auto-login on the user's behalf.
    if (response.status === 401 || response.status === 403) {
      console.log(`[API] Session rejected with ${response.status} on ${endpoint}; clearing stored token.`);
      this.clearTokens();
    }

    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const errData = await response.json();
        errMsg = errData.message || errData.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return response.json();
  }

  // --- Auth API ---
  public async login(username: string, password: string) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      this.setTokens(data.token, data.refreshToken);
    }
    return data;
  }

  public async register(payload: { username: string; email?: string; phone: string; password: string }) {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      this.setTokens(data.token, data.refreshToken);
    }
    return data;
  }

  // --- Session (restore on reload) ---
  // Returns { token, user } only when the stored token is still accepted by
  // the backend; throws (after clearing the token) otherwise.
  public async getSession() {
    return this.request<any>('/auth/session');
  }

  // --- User Profile & KYC ---
  public async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/user/profile');
  }

  // --- Wallet API ---
  public async getBalance() {
    return this.request<{ balance: number; bonusBalance: number; currency: string }>('/wallet/balance');
  }

  public async deposit(amount: number, paymentMethod: string = 'telebirr', phone?: string) {
    return this.request<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, phone }),
    });
  }

  public async withdraw(amount: number, paymentMethod: string, accountNumber: string) {
    return this.request<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, accountNumber }),
    });
  }

  public async getTransactions() {
    return this.request<any>('/wallet/transactions');
  }

  // --- Matches & Odds API ---
  public async getAllMatches(sport: string = 'all', status: string = 'all', timeFilter: string = 'all'): Promise<Match[]> {
    return this.request<Match[]>(`/matches?sport=${sport}&status=${status}&timeFilter=${timeFilter}`);
  }

  public async getLiveMatches(sport: string = 'all'): Promise<Match[]> {
    return this.request<Match[]>(`/matches/live?sport=${sport}`);
  }

  public async getUpcomingMatches(sport: string = 'all', timeFilter: string = 'all', page: number = 0, size: number = 50) {
    return this.request<any>(`/matches/upcoming?sport=${sport}&timeFilter=${timeFilter}&page=${page}&size=${size}`);
  }

  public async getMatchDetails(matchId: string): Promise<Match> {
    return this.request<Match>(`/matches/${matchId}`);
  }

  public async getMatchMarkets(matchId: string): Promise<MarketGroup[]> {
    return this.request<MarketGroup[]>(`/matches/${matchId}/markets`);
  }

  public async getMatchStats(matchId: string): Promise<MatchStats> {
    return this.request<MatchStats>(`/matches/${matchId}/stats`);
  }

  public async getMatchEvents(matchId: string): Promise<LiveMatchEvent[]> {
    return this.request<LiveMatchEvent[]>(`/matches/${matchId}/events`);
  }

  public async searchMatches(query: string): Promise<Match[]> {
    return this.request<Match[]>(`/matches/search?query=${encodeURIComponent(query)}`);
  }

  // --- Betting API ---
  public async placeBet(stake: number, betType: string, items: BetSlipItem[]): Promise<PlacedBet> {
    return this.request<PlacedBet>('/bets/place', {
      method: 'POST',
      body: JSON.stringify({ stake, betType, items }),
    });
  }

  public async getBetHistory(status?: string): Promise<any> {
    const statusParam = status ? `?status=${status}` : '';
    return this.request<any>(`/bets/history${statusParam}`);
  }

  public async cashoutBet(betId: string) {
    return this.request<any>(`/bets/${betId}/cashout`, {
      method: 'POST',
    });
  }

  // --- Favorites & Settings ---
  public async getFavorites(): Promise<Match[]> {
    return this.request<Match[]>('/favorites');
  }

  public async toggleFavorite(matchId: string, isFav: boolean) {
    return this.request<any>(`/favorites/${matchId}`, {
      method: isFav ? 'DELETE' : 'POST',
    });
  }

  public async getSettings() {
    return this.request<any>('/settings');
  }

  public async updateSettings(settings: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const fidaBetApi = new FidaBetApiClient();
