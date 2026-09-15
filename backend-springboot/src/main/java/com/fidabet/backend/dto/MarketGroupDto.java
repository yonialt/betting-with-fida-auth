package com.fidabet.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MarketGroupDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private List<MarketDto> markets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private String id;
        private String name;
        private List<OddsItemDto> odds;

        public static MarketDto of(String id, String name, List<OddsItemDto> odds) {
            MarketDto dto = new MarketDto();
            dto.id = id;
            dto.name = name;
            dto.odds = odds;
            return dto;
        }
    }

    public static MarketGroupDto of(String id, String name, List<MarketDto> markets) {
        MarketGroupDto dto = new MarketGroupDto();
        dto.id = id;
        dto.name = name;
        dto.markets = markets;
        return dto;
    }
}
