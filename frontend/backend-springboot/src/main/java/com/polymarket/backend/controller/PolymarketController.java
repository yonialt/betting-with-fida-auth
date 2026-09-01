package com.polymarket.backend.controller;

import com.polymarket.backend.dto.PolymarketEventDto;
import com.polymarket.backend.service.PolymarketGammaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/polymarket")
@CrossOrigin(origins = "*")
public class PolymarketController {

    private final PolymarketGammaService gammaService;

    public PolymarketController(PolymarketGammaService gammaService) {
        this.gammaService = gammaService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Polymarket Spring Boot API Gateway",
                "connectedApi", "Polymarket Gamma REST API"
        ));
    }

    @GetMapping("/events")
    public ResponseEntity<List<PolymarketEventDto>> getEvents(
            @RequestParam(defaultValue = "24") int limit,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "volume24hr") String order) {
        List<PolymarketEventDto> events = gammaService.getEvents(limit, tag, order);
        return ResponseEntity.ok(events);
    }
}
