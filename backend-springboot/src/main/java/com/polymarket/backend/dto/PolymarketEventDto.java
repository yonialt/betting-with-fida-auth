package com.polymarket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolymarketEventDto {
    private String id;
    private String title;
    private String slug;
    private String category;
    private String volume;
    private String avatarUrl;
    private String badge;
    private String displayType;
    private List<MarketOutcomeDto> outcomes;
}
