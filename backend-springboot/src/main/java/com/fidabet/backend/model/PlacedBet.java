package com.fidabet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** A placed bet (single/accumulator/system). Mirrors the frontend {@code PlacedBet} type. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlacedBet {
    private String id;
    private String placedAt;
    /** single | accumulator | system */
    private String type;
    private List<BetSlipItem> items;
    private double totalOdds;
    private double stake;
    private double potentialWin;
    private String currency;
    /** active | pending | won | lost | cashed_out */
    private String status;
    private Double cashoutValue;
    /** ISO-8601 settlement time (present once the bet is settled). */
    private String settledAt;
    /** Payout credited for settled bets (0 for a loss). */
    private Double payout;
}
