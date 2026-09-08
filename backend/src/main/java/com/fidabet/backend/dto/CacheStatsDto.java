package com.fidabet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CacheStatsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long hits;
    private Long misses;
    private Long totalRequests;
    private Double hitRatePercentage;
    private Integer activeKeysCount;
    private String redisStatus;
    private Long uptimeSeconds;
    private String lastSyncTimestamp;
    private List<KeyDetail> sampleKeys;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeyDetail implements Serializable {
        private String key;
        private Long ttlSeconds;
        private String cacheRegion;
    }
}
