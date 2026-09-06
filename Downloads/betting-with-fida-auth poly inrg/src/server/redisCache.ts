import Redis from 'ioredis';

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number; // percentage, e.g. 96.5
  keysCount: number;
  connected: boolean;
  engine: 'redis-server' | 'memory-redis-emulator';
  uptimeSeconds: number;
  lastSyncAt: string | null;
}

export interface CacheKeyInfo {
  key: string;
  ttl: number; // in seconds, -1 if no ttl, -2 if expired
  type: string;
  sizeBytes: number;
  preview: string;
}

interface MemoryCacheEntry {
  value: string;
  expiresAt: number | null; // epoch ms
  createdAt: number;
}

class RedisCacheManager {
  private client: Redis | null = null;
  private isConnectedToRealRedis = false;
  private memoryStore = new Map<string, MemoryCacheEntry>();
  private startTime = Date.now();
  private hits = 0;
  private misses = 0;
  private lastSyncAt: string | null = null;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && !redisUrl.includes('localhost')) {
      try {
        console.log(`[Redis] Connecting to Redis at ${redisUrl.replace(/\/\/[^@]*@/, '//***@')}`);
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 3000,
          lazyConnect: true,
        });

        this.client.connect().then(() => {
          this.isConnectedToRealRedis = true;
          console.log('[Redis] Connected to external Redis instance successfully.');
        }).catch((err) => {
          console.warn('[Redis] Could not connect to external Redis. Using high-performance in-memory Redis engine:', err.message);
          this.isConnectedToRealRedis = false;
        });

        this.client.on('error', (err) => {
          this.isConnectedToRealRedis = false;
        });
      } catch (err: any) {
        console.warn('[Redis] Initialization error, falling back to memory engine:', err.message);
        this.isConnectedToRealRedis = false;
      }
    } else {
      console.log('[Redis] Operating in high-performance in-memory Redis emulation mode (TTL & Key Scanning active).');
    }

    // Periodic cleanup of expired keys in memory store every 10 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryStore.entries()) {
        if (entry.expiresAt && entry.expiresAt <= now) {
          this.memoryStore.delete(key);
        }
      }
    }, 10000);
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.isConnectedToRealRedis && this.client) {
      try {
        const data = await this.client.get(key);
        if (data !== null) {
          this.hits++;
          return JSON.parse(data) as T;
        } else {
          this.misses++;
          return null;
        }
      } catch (err) {
        console.warn(`[Redis] Error getting key ${key}:`, err);
      }
    }

    // Memory fallback
    const entry = this.memoryStore.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.memoryStore.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return entry.value as unknown as T;
    }
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (this.isConnectedToRealRedis && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      } catch (err) {
        console.warn(`[Redis] Error setting key ${key}:`, err);
      }
    }

    // Memory store
    this.memoryStore.set(key, {
      value: serialized,
      expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
      createdAt: Date.now(),
    });
  }

  public async del(keyOrPattern: string): Promise<number> {
    if (keyOrPattern.includes('*')) {
      return this.delPattern(keyOrPattern);
    }

    if (this.isConnectedToRealRedis && this.client) {
      try {
        return await this.client.del(keyOrPattern);
      } catch (err) {
        console.warn(`[Redis] Error deleting key ${keyOrPattern}:`, err);
      }
    }

    const had = this.memoryStore.has(keyOrPattern);
    this.memoryStore.delete(keyOrPattern);
    return had ? 1 : 0;
  }

  public async delPattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    let count = 0;
    for (const key of keys) {
      if (this.isConnectedToRealRedis && this.client) {
        try {
          await this.client.del(key);
          count++;
        } catch {}
      } else {
        if (this.memoryStore.delete(key)) count++;
      }
    }
    return count;
  }

  public async keys(pattern: string = '*'): Promise<string[]> {
    if (this.isConnectedToRealRedis && this.client) {
      try {
        return await this.client.keys(pattern);
      } catch (err) {
        console.warn('[Redis] Error listing keys:', err);
      }
    }

    const regex = new RegExp('^' + pattern.replace(/[*]/g, '.*') + '$');
    const matching: string[] = [];
    const now = Date.now();

    for (const [k, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.memoryStore.delete(k);
        continue;
      }
      if (regex.test(k)) {
        matching.push(k);
      }
    }
    return matching;
  }

  public async getTtl(key: string): Promise<number> {
    if (this.isConnectedToRealRedis && this.client) {
      try {
        return await this.client.ttl(key);
      } catch {
        return -1;
      }
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return -2;
    if (!entry.expiresAt) return -1;
    const remainingMs = entry.expiresAt - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : -2;
  }

  public async getKeyDetails(): Promise<CacheKeyInfo[]> {
    const allKeys = await this.keys('*');
    const result: CacheKeyInfo[] = [];

    for (const k of allKeys.slice(0, 50)) {
      const ttl = await this.getTtl(k);
      let preview = '';
      let sizeBytes = 0;

      if (this.memoryStore.has(k)) {
        const entry = this.memoryStore.get(k)!;
        sizeBytes = entry.value.length;
        preview = entry.value.slice(0, 80) + (entry.value.length > 80 ? '...' : '');
      } else if (this.client) {
        try {
          const val = await this.client.get(k);
          if (val) {
            sizeBytes = val.length;
            preview = val.slice(0, 80) + (val.length > 80 ? '...' : '');
          }
        } catch {}
      }

      result.push({
        key: k,
        ttl,
        type: 'string/json',
        sizeBytes,
        preview,
      });
    }

    return result.sort((a, b) => b.ttl - a.ttl);
  }

  public async flushAll(): Promise<void> {
    if (this.isConnectedToRealRedis && this.client) {
      try {
        await this.client.flushall();
      } catch {}
    }
    this.memoryStore.clear();
    console.log('[Redis] Cache flushed.');
  }

  public markSyncCompleted() {
    this.lastSyncAt = new Date().toISOString();
  }

  public async getStats(): Promise<CacheStats> {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? Math.round((this.hits / totalRequests) * 1000) / 10 : 100;
    const currentKeys = await this.keys('*');

    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests,
      hitRate,
      keysCount: currentKeys.length,
      connected: true,
      engine: this.isConnectedToRealRedis ? 'redis-server' : 'memory-redis-emulator',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      lastSyncAt: this.lastSyncAt,
    };
  }
}

export const redisCache = new RedisCacheManager();
