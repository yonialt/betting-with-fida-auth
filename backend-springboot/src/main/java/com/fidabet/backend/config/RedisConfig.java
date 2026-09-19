package com.fidabet.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RedisConfig implements CachingConfigurer {

    @Value("${api-football.cache.ttl-live-seconds:20}")
    private long ttlLiveSeconds;

    @Value("${api-football.cache.ttl-odds-seconds:15}")
    private long ttlOddsSeconds;

    @Value("${api-football.cache.ttl-upcoming-seconds:180}")
    private long ttlUpcomingSeconds;

    @Value("${api-football.cache.ttl-markets-seconds:60}")
    private long ttlMarketsSeconds;

    /**
     * Redis-only ObjectMapper (default typing enabled for polymorphic cache values).
     * Deliberately NOT a @Bean: exposing it would replace Spring Boot's primary plain
     * ObjectMapper and break JSON parsing elsewhere (e.g. seed file loading).
     */
    private ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.activateDefaultTyping(
                mapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper());

        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper());

        // Default Cache Configuration: 60s
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

        // Per-Cache Granular TTL Specifications
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        // Live matches update very frequently (20 seconds TTL)
        cacheConfigs.put("liveMatches", defaultConfig.entryTtl(Duration.ofSeconds(ttlLiveSeconds)));

        // Live odds drift and market changes (15 seconds TTL)
        cacheConfigs.put("matchOdds", defaultConfig.entryTtl(Duration.ofSeconds(ttlOddsSeconds)));

        // Upcoming matches (3 minutes TTL)
        cacheConfigs.put("upcomingMatches", defaultConfig.entryTtl(Duration.ofSeconds(ttlUpcomingSeconds)));

        // Markets and groups (60 seconds TTL)
        cacheConfigs.put("matchMarkets", defaultConfig.entryTtl(Duration.ofSeconds(ttlMarketsSeconds)));

        // Match statistics & events (30 seconds TTL)
        cacheConfigs.put("matchStats", defaultConfig.entryTtl(Duration.ofSeconds(30)));
        cacheConfigs.put("matchEvents", defaultConfig.entryTtl(Duration.ofSeconds(20)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }

    /**
     * Lenient cache error handling: when Redis is unavailable, treat every cache
     * operation as a miss and invoke the underlying method instead of throwing.
     * With the strict default handler, a down Redis turned every @Cacheable call
     * (live matches, upcoming, markets — including the sportsbook settlement's
     * final-score lookups) into a hard failure even when the data source was fine.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, org.springframework.cache.Cache cache, Object key) {
                // Degrade to cache-miss: fall through to the data source.
            }

            @Override
            public void handleCachePutError(RuntimeException e, org.springframework.cache.Cache cache, Object key, Object value) {
                // Cache writes are best-effort: ignore when the store is down.
            }

            @Override
            public void handleCacheEvictError(RuntimeException e, org.springframework.cache.Cache cache, Object key) {
                // Ignore evict failures when the store is down.
            }

            @Override
            public void handleCacheClearError(RuntimeException e, org.springframework.cache.Cache cache) {
                // Ignore clear failures when the store is down.
            }
        };
    }
}
