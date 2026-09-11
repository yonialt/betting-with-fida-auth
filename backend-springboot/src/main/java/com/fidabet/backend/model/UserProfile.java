package com.fidabet.backend.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * In-memory user profile. Mirrors the frontend {@code UserProfile} TS type exactly
 * so the JSON contract consumed by fidaBetApi.ts is preserved byte-for-byte.
 *
 * Note the explicit {@link JsonProperty} on the boolean flags: Jackson would otherwise
 * drop the {@code is} prefix (isLoggedIn -> "loggedIn"), breaking the client contract.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
// Serialize/deserialize by FIELD name so the JSON keys are exactly the field names
// (isLoggedIn, isAgeVerified). This side-steps Jackson's boolean "is"-getter renaming,
// which would otherwise emit "loggedIn" and break the frontend contract.
@JsonAutoDetect(
        fieldVisibility = JsonAutoDetect.Visibility.ANY,
        getterVisibility = JsonAutoDetect.Visibility.NONE,
        isGetterVisibility = JsonAutoDetect.Visibility.NONE)
public class UserProfile {

    @JsonProperty("isLoggedIn")
    private boolean isLoggedIn;

    private String username;
    private String userId;
    private double balance;
    private String currency;
    private double bonusBalance;
    private String phone;
    private String email;

    @JsonProperty("isAgeVerified")
    private Boolean isAgeVerified;

    /** verified | pending | unverified */
    private String ageVerificationStatus;
}
