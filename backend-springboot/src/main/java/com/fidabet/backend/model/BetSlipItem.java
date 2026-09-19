package com.fidabet.backend.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A single selection on the bet slip. Mirrors the frontend {@code BetSlipItem} type. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
// Field-based mapping so the "isLive" key is preserved verbatim (see UserProfile).
@JsonAutoDetect(
        fieldVisibility = JsonAutoDetect.Visibility.ANY,
        getterVisibility = JsonAutoDetect.Visibility.NONE,
        isGetterVisibility = JsonAutoDetect.Visibility.NONE)
public class BetSlipItem {
    private String id;
    private String matchId;
    private String matchCode;
    private String league;
    private String matchTitle;
    private String currentScore;
    private String marketName;
    private String selectionName;
    private String selectionLabel;
    private double odds;

    @JsonProperty("isLive")
    private Boolean isLive;

    private Double stake;

    /** Match kickoff time (ISO-8601) as known by the frontend, used to prove a match
     *  has actually started before any settlement is allowed to run. Optional. */
    private String startTime;
}
