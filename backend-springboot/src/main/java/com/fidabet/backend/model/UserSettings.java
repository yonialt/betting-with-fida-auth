package com.fidabet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** User preferences. Mirrors the Express in-memory {@code userSettings} object. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSettings {
    private String oddsFormat;      // decimal | fractional | american
    private String language;        // en | am
    private boolean soundEffects;
    private boolean autoAcceptOddsChanges;
    private boolean compactView;
}
