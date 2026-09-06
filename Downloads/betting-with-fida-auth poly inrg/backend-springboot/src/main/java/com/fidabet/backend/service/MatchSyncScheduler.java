package com.fidabet.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class MatchSyncScheduler {

    private final ApiFootballService apiFootballService;
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${api-football.sync.enabled:true}")
    private boolean syncEnabled;

    private static final String DISTRIBUTED_LOCK_KEY = "lock:scheduler:football-sync";

    /**
     * Poll API-Football every 20 seconds.
     * Uses Redis distributed lock with 15s expiration to prevent split-brain execution across cluster.
     */
    @Scheduled(fixedRateString = "${api-football.sync.interval-ms:20000}")
    public void syncLiveFixturesTask() {
        if (!syncEnabled) {
            return;
        }

        Boolean acquired = false;
        try {
            // Acquire distributed lock: SETNX lock:scheduler:football-sync "locked" EX 15
            acquired = stringRedisTemplate.opsForValue().setIfAbsent(
                    DISTRIBUTED_LOCK_KEY,
                    "locked_by_" + Thread.currentThread().getName(),
                    Duration.ofSeconds(15)
            );
        } catch (Exception e) {
            log.debug("Redis lock acquisition bypassed: {}", e.getMessage());
            acquired = true;
        }

        if (Boolean.TRUE.equals(acquired)) {
            try {
                log.debug("[Scheduler] Acquired Redis distributed lock. Syncing live football fixtures...");
                apiFootballService.getLiveMatches("all");
            } catch (Exception e) {
                log.error("[Scheduler] Error in scheduled sync task: {}", e.getMessage());
            }
        } else {
            log.debug("[Scheduler] Another node holds the sync lock. Skipping this tick.");
        }
    }
}
