package com.fidabet.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OddsItemDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String label;
    private String name;
    private String marketName;
    private Double value;
    private Double previousValue;
    private String change; // "up" | "down" | null
    private String trend;  // "up" | "down" | "same"
    private Boolean isLocked;
    private Long lastUpdated;
}
