package com.fidabet.backend.service;

import com.fidabet.backend.dto.PolymarketAdminDataDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Persists the Polymarket admin editor data in Redis under a single key so edits survive
 * across browser sessions and devices. Falls back to an in-memory map when Redis is unavailable.
 */
@Service
public class PolymarketAdminService {

    private static final String REDIS_KEY = "polymarket:admin:data";

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;
    private final String redisKey;
    private volatile Map<String, Object> memoryStore;

    public PolymarketAdminService(
            StringRedisTemplate redis,
            ObjectMapper mapper,
            @Value("${polymarket.admin.redis-key:#{null}}") String customKey) {
        this.redis = redis;
        this.mapper = mapper;
        this.redisKey = customKey != null ? customKey : REDIS_KEY;
    }

    /**
     * Load the currently persisted admin data. Returns {@code Optional.empty()} when nothing
     * has been saved yet.
     */
    public Optional<String> loadRaw() {
        String value = redis.opsForValue().get(redisKey);
        if (value != null && !value.isBlank()) {
            return Optional.of(value);
        }
        return Optional.empty();
    }

    /**
     * Save the full admin data payload. The payload is the same shape the frontend sends:
     * {@code { "hero": [...], "ethiopia": [...], ... }}.
     */
    public void save(String json) {
        try {
            redis.opsForValue().set(redisKey, json);
            memoryStore = null;
        } catch (Exception e) {
            // Fall back to in-memory when Redis is unavailable.
            try {
                memoryStore = mapper.readValue(json, Map.class);
            } catch (JsonProcessingException ex) {
                throw new RuntimeException("Unable to persist Polymarket admin data", e);
            }
        }
    }

    /**
     * Save a parsed DTO.
     */
    public void save(PolymarketAdminDataDto dto) {
        try {
            save(mapper.writeValueAsString(dto));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Unable to serialise Polymarket admin data", e);
        }
    }

    /**
     * Delete the stored admin data, reverting to the factory seed.
     */
    public void delete() {
        redis.delete(redisKey);
        memoryStore = null;
    }

    /**
     * In-memory fallback store (used only when Redis is unavailable).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getMemoryStore() {
        if (memoryStore == null) {
            memoryStore = Map.of();
        }
        return memoryStore;
    }

    public void setMemoryStore(Map<String, Object> store) {
        this.memoryStore = store;
    }
}
