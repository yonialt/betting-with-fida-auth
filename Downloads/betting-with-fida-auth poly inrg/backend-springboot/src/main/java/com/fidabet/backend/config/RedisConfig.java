package com.fidabet.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LsfGenericTypeIdResolver;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
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

    @Bean
    public ObjectMapper redisObjectMapper() {
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

    @Override
    public CacheErrorHandler errorHandler() {
        return new SimpleCacheErrorHandler();
    }
}
