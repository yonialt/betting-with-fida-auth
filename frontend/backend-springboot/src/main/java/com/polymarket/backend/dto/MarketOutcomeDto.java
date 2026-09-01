package com.polymarket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketOutcomeDto {
    private String name;
    private int probability; // e.g. 76 for 76%
    private int yesPrice;    // in cents
    private int noPrice;     // in cents
}
