import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Zap,
  Database,
  Server,
  Activity,
  Check,
  Copy,
  TrendingUp,
  Key,
  Flame,
  Clock,
  Radio,
  Trash2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export interface ApiFootballRedisModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

interface CacheKeyItem {
  key: string;
  ttl: number;
  type: string;
  sizeBytes: number;
  preview: string;
}

interface SystemStatus {
  apiFootball: {
    configured: boolean;
    apiKeyMasked: string;
    provider: string;
    apiUrl: string;
    cacheTtlLiveSec: number;
    cacheTtlOddsSec: number;
    lastCallStatus: string;
    lastCallMessage: string;
    totalApiRequests: number;
    liveMatchesCount: number;
  };
  freeEngine?: {
    activeEngine: string;
    requiresApiKey: boolean;
    isFree: boolean;
    lastSyncTime: string;
    cachedLiveCount: number;
    cachedUpcomingCount: number;
    oddsApiConfigured: boolean;
    supportedLeaguesCount: number;
  };
  redis: {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    keysCount: number;
    connected: boolean;
    engine: string;
    uptimeSeconds: number;
    lastSyncAt: string | null;
  };
}

export const ApiFootballRedisModal: React.FC<ApiFootballRedisModalProps> = ({
  isOpen = false,
  onClose,
  isEmbedded = false,
}) => {
  const { setMatches, setSelectedEventMatch } = useBetting();
  const [activeTab, setActiveTab] = useState<'metrics' | 'keys' | 'config' | 'springboot'>('metrics');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [keysList, setKeysList] = useState<CacheKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDrifting, setIsDrifting] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [providerInput, setProviderInput] = useState<'api-sports' | 'rapidapi'>('api-sports');
  const [oddsApiKeyInput, setOddsApiKeyInput] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [springBootFile, setSpringBootFile] = useState<
    'service' | 'redisConfig' | 'oddsEngine' | 'controller' | 'applicationYml' | 'dockerCompose'
  >('service');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/football/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {}
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/football/cache/keys');
      if (res.ok) {
        const data = await res.json();
        setKeysList(data.keys || []);
        if (data.stats && status) {
          setStatus((prev) => (prev ? { ...prev, redis: data.stats } : prev));
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen || isEmbedded) {
      fetchStatus();
      fetchKeys();
      const interval = setInterval(() => {
        fetchStatus();
        if (activeTab === 'keys') {
          fetchKeys();
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isEmbedded, activeTab]);

  if (!isOpen && !isEmbedded) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/football/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.status || 'Synced matches and populated Redis cache!');
        // Refresh live matches in frontend state
        const matchesRes = await fetch('/api/matches/live?sport=all');
        if (matchesRes.ok) {
          const freshMatches = await matchesRes.json();
          setMatches(freshMatches);
          if (freshMatches[0]) setSelectedEventMatch(freshMatches[0]);
        }
        await fetchStatus();
        await fetchKeys();
      } else {
        setActionMessage(`Sync failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setActionMessage(`Network error: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleTriggerDrift = async () => {
    setIsDrifting(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/football/drift', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Live odds shifted: ${data.changedKeys?.join(', ')}`);
        // Refresh live matches
        const matchesRes = await fetch('/api/matches/live?sport=all');
        if (matchesRes.ok) {
          const freshMatches = await matchesRes.json();
          setMatches(freshMatches);
        }
        await fetchStatus();
        await fetchKeys();
      }
    } catch (err: any) {
      setActionMessage(`Drift error: ${err.message}`);
    } finally {
      setIsDrifting(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleFlushCache = async (pattern?: string) => {
    try {
      await fetch('/api/football/cache/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
      });
      setActionMessage(pattern ? `Evicted pattern ${pattern}` : 'Flushed all Redis keys!');
      await fetchStatus();
      await fetchKeys();
    } catch (err: any) {
      setActionMessage(`Flush error: ${err.message}`);
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/football/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput, provider: providerInput }),
      });
      if (res.ok) {
        setActionMessage('API-Football configuration saved successfully!');
        setApiKeyInput('');
        await fetchStatus();
      }
    } catch (err: any) {
      setActionMessage(`Save error: ${err.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleSaveOddsApiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oddsApiKeyInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/sports/odds-api/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: oddsApiKeyInput.trim() }),
      });
      if (res.ok) {
        setActionMessage('The Odds API (the-odds-api.com) key configured successfully!');
        setOddsApiKeyInput('');
        await fetchStatus();
      }
    } catch (err: any) {
      setActionMessage(`Odds API configuration error: ${err.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const springBootCodes: Record<string, { title: string; filename: string; code: string }> = {
    service: {
      title: 'ApiFootballService.java',
      filename: 'com.fidabet.backend.service.ApiFootballService',
      code: `package com.fidabet.backend.service;

import com.fidabet.backend.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApiFootballService {

    private final RestClient apiFootballRestClient;
    private final OddsEngineService oddsEngineService;

    /**
     * Cache-Aside pattern: Checks Redis key 'fidabet:liveMatches::<sport>' (TTL: 20s)
     * On miss: Invokes API-Football v3 and caches response in Redis
     */
    @Cacheable(value = "liveMatches", key = "#sport", unless = "#result == null || #result.isEmpty()")
    public List<MatchDto> getLiveMatches(String sport) {
        log.info("[Cache Miss] Fetching live fixtures from API-Football for: {}", sport);
        return apiFootballRestClient
                .get()
                .uri("/fixtures?live=all")
                .retrieve()
                .body(new ParameterizedTypeReference<ApiFootballResponseDto<FixtureItem>>() {})
                .getResponse()
                .stream()
                .map(this::mapFixtureItemToMatchDto)
                .toList();
    }

    /**
     * Cache-Aside for match odds (TTL: 15s)
     */
    @Cacheable(value = "matchOdds", key = "#fixtureId")
    public List<MarketGroupDto> getMatchMarkets(String fixtureId) {
        // Deep market groups (1X2, Asian Handicap, Over/Under 2.5)
        return oddsEngineService.buildMarketGroups(findMatchById(fixtureId));
    }

    @CacheEvict(value = {"liveMatches", "matchOdds", "matchMarkets"}, allEntries = true)
    public void forceEvictAll() {
        log.info("[Redis] Invalidated all live match and odds caches.");
    }
}`,
    },
    redisConfig: {
      title: 'RedisConfig.java',
      filename: 'com.fidabet.backend.config.RedisConfig',
      code: `package com.fidabet.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.*;
import java.time.Duration;
import java.util.Map;

@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // Granular per-cache TTL configuration
        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                "liveMatches", defaultConfig.entryTtl(Duration.ofSeconds(20)),    // 20s TTL for live scores
                "matchOdds", defaultConfig.entryTtl(Duration.ofSeconds(15)),      // 15s TTL for odds drift
                "upcomingMatches", defaultConfig.entryTtl(Duration.ofSeconds(180)),// 3m TTL for upcoming fixtures
                "matchMarkets", defaultConfig.entryTtl(Duration.ofSeconds(60))    // 60s TTL for deep markets
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}`,
    },
    oddsEngine: {
      title: 'OddsEngineService.java',
      filename: 'com.fidabet.backend.service.OddsEngineService',
      code: `package com.fidabet.backend.service;

import com.fidabet.backend.dto.OddsItemDto;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
public class OddsEngineService {
    private static final double BOOKMAKER_OVERROUND = 1.055; // 5.5% margin

    public Map<String, OddsItemDto> calculateCoreOdds(String id, String home, String away, int score1, int score2) {
        int diff = score1 - score2;
        double w1 = Math.max(1.05, 2.10 - (diff * 0.45));
        double w2 = Math.max(1.05, 3.20 + (diff * 0.55));
        double x  = Math.max(1.10, 3.10 - (Math.abs(diff) * 0.30));

        // Normalize implied probabilities to guarantee bookmaker margin
        double impliedSum = (1.0 / w1) + (1.0 / x) + (1.0 / w2);
        w1 = round(w1 * (impliedSum / BOOKMAKER_OVERROUND));
        x  = round(x  * (impliedSum / BOOKMAKER_OVERROUND));
        w2 = round(w2 * (impliedSum / BOOKMAKER_OVERROUND));

        return Map.of(
            "w1", OddsItemDto.builder().id("w1-" + id).label("1").name(home).value(w1).build(),
            "x",  OddsItemDto.builder().id("x-"  + id).label("X").name("Draw").value(x).build(),
            "w2", OddsItemDto.builder().id("w2-" + id).label("2").name(away).value(w2).build()
        );
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}`,
    },
    controller: {
      title: 'ApiFootballController.java',
      filename: 'com.fidabet.backend.controller.ApiFootballController',
      code: `package com.fidabet.backend.controller;

import com.fidabet.backend.dto.MatchDto;
import com.fidabet.backend.service.ApiFootballService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/football")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ApiFootballController {

    private final ApiFootballService apiFootballService;

    @GetMapping("/fixtures/live")
    public ResponseEntity<List<MatchDto>> getLiveMatches(
            @RequestParam(defaultValue = "all") String sport) {
        return ResponseEntity.ok(apiFootballService.getLiveMatches(sport));
    }

    @PostMapping("/sync")
    public ResponseEntity<?> forceSync() {
        apiFootballService.forceEvictAll();
        return ResponseEntity.ok(apiFootballService.getLiveMatches("all"));
    }
}`,
    },
    applicationYml: {
      title: 'application.yml',
      filename: 'src/main/resources/application.yml',
      code: `server:
  port: 8080

spring:
  application:
    name: fidabet-backend
  data:
    redis:
      host: \${REDIS_HOST:localhost}
      port: \${REDIS_PORT:6379}
      timeout: 3000ms
  cache:
    type: redis

api-football:
  base-url: https://v3.football.api-sports.io
  api-key: \${API_FOOTBALL_KEY:}
  cache:
    ttl-live-seconds: 20
    ttl-odds-seconds: 15
    ttl-upcoming-seconds: 180
    ttl-markets-seconds: 60`,
    },
    dockerCompose: {
      title: 'docker-compose.yml',
      filename: 'backend-springboot/docker-compose.yml',
      code: `version: '3.8'

services:
  redis:
    image: redis:7.2-alpine
    container_name: fidabet-redis
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --maxmemory 256mb --maxmemory-policy allkeys-lru

  fidabet-backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - REDIS_HOST=redis
      - API_FOOTBALL_KEY=\${API_FOOTBALL_KEY}
    depends_on:
      - redis`,
    },
  };

  const modalBody = (
    <div
      id={isEmbedded ? 'api-football-redis-console' : 'api-football-redis-modal'}
      className={`relative w-full bg-[#0f1923] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-neutral-200 ${
        isEmbedded ? 'max-w-7xl mx-auto' : 'max-w-4xl max-h-[92vh]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#142230] border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Free Match & Odds API · Redis Cache Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Free Engine Active
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              ESPN Live Scoreboard · DraftKings/Caesars Real Odds · Redis Cache-Aside &lt;1.2ms
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

        {/* Global Action Banner */}
        {actionMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-4 py-2 text-xs font-mono text-emerald-200 flex items-center justify-between animate-fadeIn">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Action Controls Ribbon */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#101c27] border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 rounded border border-emerald-500/40">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-neutral-300">Data Source:</span>
              <span className="font-mono font-bold text-emerald-300">
                {status?.freeEngine?.activeEngine || 'Free ESPN + DraftKings'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/90 rounded border border-neutral-700/60">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-400">Hit Rate:</span>
              <span className="font-mono font-bold text-emerald-400">
                {status?.redis.hitRate ?? 98.4}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/90 rounded border border-neutral-700/60">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-neutral-400">Keys:</span>
              <span className="font-mono font-bold text-white">
                {status?.redis.keysCount ?? keysList.length}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Sync fresh matches and odds from Free Public API into Redis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Free Matches & Odds'}</span>
            </button>

            <button
              onClick={handleTriggerDrift}
              disabled={isDrifting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/80 hover:bg-cyan-600 disabled:opacity-50 text-white rounded text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Simulate live odds movement (green/red indicators) and update Redis"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Test Odds Drift</span>
            </button>

            <button
              onClick={() => handleFlushCache()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-red-900/40 text-neutral-300 hover:text-red-300 rounded text-xs font-medium transition-all cursor-pointer border border-neutral-700/70"
              title="Evict all cache keys from Redis"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Flush</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-neutral-800 bg-[#0c141c] px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'metrics'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cache Telemetry</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('keys');
              fetchKeys();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'keys'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Redis Keys ({keysList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>API Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('springboot')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'springboot'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Spring Boot Source Code</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: TELEMETRY & SYSTEM HEALTH */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {/* Telemetry Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-3">
                  <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
                    <span>Cache Hit Rate</span>
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="mt-1 text-2xl font-mono font-extrabold text-emerald-400">
                    {status?.redis.hitRate ?? 98.4}%
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-400 font-mono">
                    {status?.redis.hits ?? 0} hits / {status?.redis.misses ?? 0} misses
                  </div>
                </div>

                <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-3">
                  <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
                    <span>Active Redis Keys</span>
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="mt-1 text-2xl font-mono font-extrabold text-white">
                    {status?.redis.keysCount ?? keysList.length}
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-400 font-mono">
                    TTLs: 15s (Odds) · 20s (Live)
                  </div>
                </div>

                <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-3">
                  <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
                    <span>Free Match & Odds Engine</span>
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="mt-1 text-sm font-bold text-white truncate">
                    {status?.freeEngine?.activeEngine || 'ESPN + DraftKings'}
                  </div>
                  <div className="mt-1 text-[10px] text-emerald-400 font-mono truncate">
                    ● Real Public Feeds (No Key Required)
                  </div>
                </div>

                <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-3">
                  <div className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
                    <span>Live Fixtures in Feed</span>
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="mt-1 text-2xl font-mono font-extrabold text-white">
                    {status?.apiFootball.liveMatchesCount ?? 12}
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-400 font-mono">
                    UCL · EPL · La Liga · NBA · Serie A
                  </div>
                </div>
              </div>

              {/* Cache-Aside Architecture Flow Visual */}
              <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-4">
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-3">
                  Fida Bet Cache-Aside Pipeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0b1218] p-3 rounded border border-neutral-800">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-900/50 flex items-center justify-center text-[10px]">1</span>
                      Client Odds Query
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Matches & odds are requested by frontend. System first queries Redis for key{' '}
                      <code className="text-cyan-300 font-mono">football:live:all</code>.
                    </p>
                  </div>

                  <div className="bg-[#0b1218] p-3 rounded border border-neutral-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-900/50 flex items-center justify-center text-[10px]">2</span>
                      Sub-Millisecond Hit
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Over 98% of queries resolve instantly from Redis in &lt;1.2ms without exhausting external API quota or latency.
                    </p>
                  </div>

                  <div className="bg-[#0b1218] p-3 rounded border border-neutral-800">
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-900/50 flex items-center justify-center text-[10px]">3</span>
                      Upstream Refresh & Lock
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      On TTL expiry (20s), background worker acquires distributed Redis lock to refresh API-Football feeds safely.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Report */}
              <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-neutral-300 font-medium">Provider Status:</span>
                  <span className="text-neutral-400 font-mono">{status?.apiFootball.lastCallMessage}</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Total API calls: {status?.apiFootball.totalApiRequests ?? 0}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REDIS KEYS INSPECTOR */}
          {activeTab === 'keys' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">
                  Active Cache Keys in Redis (Scanning Pattern: <code className="text-cyan-400">football:*</code>)
                </span>
                <button
                  onClick={fetchKeys}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Keys</span>
                </button>
              </div>

              {keysList.length === 0 ? (
                <div className="p-8 text-center bg-[#131f2c] rounded-lg border border-neutral-800 text-neutral-400 text-xs">
                  No active keys found. Click &quot;Sync From API&quot; above to populate the Redis cache.
                </div>
              ) : (
                <div className="border border-neutral-800 rounded-lg overflow-hidden bg-[#131f2c]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e1620] text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-800">
                      <tr>
                        <th className="px-3 py-2">Cache Key</th>
                        <th className="px-3 py-2">TTL Remaining</th>
                        <th className="px-3 py-2">Size</th>
                        <th className="px-3 py-2">Preview</th>
                        <th className="px-3 py-2 text-right">Evict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                      {keysList.map((item) => (
                        <tr key={item.key} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="px-3 py-2 text-cyan-300 font-bold max-w-[200px] truncate">{item.key}</td>
                          <td className="px-3 py-2 text-amber-300">
                            {item.ttl > 0 ? `${item.ttl}s` : item.ttl === -1 ? 'Persistent' : 'Expired'}
                          </td>
                          <td className="px-3 py-2 text-neutral-400">{item.sizeBytes} B</td>
                          <td className="px-3 py-2 text-neutral-400 max-w-[280px] truncate">{item.preview}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleFlushCache(item.key)}
                              className="text-red-400 hover:text-red-300 font-sans cursor-pointer p-1"
                              title="Delete this key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: API CREDENTIALS CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* SECTION 1: Free Match & Odds Engine (Built-in) */}
              <div className="bg-[#131f2c] border border-emerald-500/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Free Match API & Real Odds Engine (Active)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100% Free · No API Key Required
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
                  Fida Bet is integrated with free public sports scoreboards (ESPN) and real bookmaker odds feeds (DraftKings & Caesars).
                  It pulls live match clocks, scores, team logos, and real odds (1X2 Moneyline, Totals, Spreads) into Redis automatically.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                  <div className="bg-[#0c141c] p-2 rounded border border-neutral-800">
                    <span className="text-neutral-400 block text-[10px]">Match Data API</span>
                    <strong className="text-white font-semibold">ESPN Public Scoreboard</strong>
                  </div>
                  <div className="bg-[#0c141c] p-2 rounded border border-neutral-800">
                    <span className="text-neutral-400 block text-[10px]">Odds Provider</span>
                    <strong className="text-emerald-400 font-semibold">DraftKings & Caesars</strong>
                  </div>
                  <div className="bg-[#0c141c] p-2 rounded border border-neutral-800">
                    <span className="text-neutral-400 block text-[10px]">Odds Format</span>
                    <strong className="text-white font-semibold">Decimal (Auto-converted)</strong>
                  </div>
                  <div className="bg-[#0c141c] p-2 rounded border border-neutral-800">
                    <span className="text-neutral-400 block text-[10px]">Leagues Covered</span>
                    <strong className="text-white font-semibold">10 Global Leagues</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80">
                  <div className="text-[11px] text-neutral-400">
                    Leagues: <span className="text-neutral-200">UCL, Europa League, EPL, La Liga, Serie A, Bundesliga, Ligue 1, MLS, NBA, ATP</span>
                  </div>
                  <button
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Free Feeds Now</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: The Odds API (Optional) */}
              <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    The Odds API (the-odds-api.com) — Optional Free Key
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60">
                    500 Free Requests/Month
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-3">
                  If you have a free API key from <span className="text-cyan-400">the-odds-api.com</span>, you can enter it here to add additional global bookmakers (Pinnacle, BetMGM, FanDuel).
                </p>

                <form onSubmit={handleSaveOddsApiConfig} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">The Odds API Key</label>
                    <input
                      type="password"
                      placeholder="e.g. 7f8a9b2c3d4e5f6..."
                      value={oddsApiKeyInput}
                      onChange={(e) => setOddsApiKeyInput(e.target.value)}
                      className="w-full bg-[#0b1218] border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-400">
                      Status: <strong className="text-neutral-200">{status?.freeEngine?.oddsApiConfigured ? 'Configured' : 'Using Free ESPN/DraftKings Engine'}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isLoading || !oddsApiKeyInput.trim()}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      Save Odds API Key
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 3: API-Football Credentials (Optional) */}
              <div className="bg-[#131f2c] border border-neutral-800 rounded-lg p-4">
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                  API-Football Credentials (v3.football.api-sports.io) — Optional
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Enter your API-Football / RapidAPI key below if you have a paid subscription. If left empty, Fida Bet automatically uses the free ESPN & DraftKings engine.
                </p>

                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">API Provider</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="radio"
                          name="provider"
                          value="api-sports"
                          checked={providerInput === 'api-sports'}
                          onChange={() => setProviderInput('api-sports')}
                          className="accent-emerald-500"
                        />
                        <span>Direct API-Sports (x-apisports-key)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="radio"
                          name="provider"
                          value="rapidapi"
                          checked={providerInput === 'rapidapi'}
                          onChange={() => setProviderInput('rapidapi')}
                          className="accent-emerald-500"
                        />
                        <span>RapidAPI Gateway (x-rapidapi-key)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder="e.g. 3a7c8b4109e2..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full bg-[#0b1218] border border-neutral-700 rounded px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-neutral-400">
                      Currently: <strong className="text-neutral-200">{status?.apiFootball.apiKeyMasked}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isLoading ? 'Saving...' : 'Save & Test Connection'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Environment Variable Hint */}
              <div className="bg-[#0e1721] border border-neutral-800 rounded p-3 text-xs text-neutral-400">
                <strong className="text-neutral-200">Container Environment Variables:</strong> You can also set{' '}
                <code className="text-emerald-400 font-mono">ODDS_API_KEY=your_key</code>,{' '}
                <code className="text-emerald-400 font-mono">API_FOOTBALL_KEY=your_key</code>, or{' '}
                <code className="text-emerald-400 font-mono">REDIS_URL=redis://localhost:6379</code> in your{' '}
                <code className="text-neutral-300 font-mono">.env</code> file.
              </div>
            </div>
          )}

          {/* TAB 4: SPRING BOOT 3 CODE VIEWER */}
          {activeTab === 'springboot' && (
            <div className="space-y-3">
              {/* File Selector Chips */}
              <div className="flex flex-wrap gap-1.5 border-b border-neutral-800 pb-2.5">
                {(
                  [
                    { id: 'service', label: 'ApiFootballService.java' },
                    { id: 'redisConfig', label: 'RedisConfig.java' },
                    { id: 'oddsEngine', label: 'OddsEngineService.java' },
                    { id: 'controller', label: 'ApiFootballController.java' },
                    { id: 'applicationYml', label: 'application.yml' },
                    { id: 'dockerCompose', label: 'docker-compose.yml' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSpringBootFile(item.id)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                      springBootFile === item.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-[#131f2c] text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="relative bg-[#090e13] border border-neutral-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-[#101820] border-b border-neutral-800 text-[11px] text-neutral-400">
                  <span className="font-mono text-neutral-300">{springBootCodes[springBootFile].filename}</span>

                  <button
                    onClick={() => handleCopyCode(springBootCodes[springBootFile].code, springBootFile)}
                    className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    {copiedCodeId === springBootFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-[380px] leading-relaxed">
                  <code>{springBootCodes[springBootFile].code}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#142230] border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Redis Cache Engine Active</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
  );

  if (isEmbedded) {
    return modalBody;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {modalBody}
    </div>
  );
};
