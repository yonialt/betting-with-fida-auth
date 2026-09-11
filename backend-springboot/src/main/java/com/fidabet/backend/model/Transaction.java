package com.fidabet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Wallet transaction record. Mirrors the object shape returned by Express /api/wallet/*. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Transaction {
    private String id;
    /** deposit | withdrawal */
    private String type;
    private double amount;
    private String currency;
    /** completed | pending | failed */
    private String status;
    private String paymentMethod;
    private String timestamp;
}
