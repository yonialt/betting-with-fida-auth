package com.fidabet.backend.controller;

import com.fidabet.backend.dto.PolymarketAdminDataDto;
import com.fidabet.backend.service.PolymarketAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Persists the Polymarket admin editor data so edits survive across devices.
 *
 * <ul>
 *   <li>{@code GET /api/polymarket-admin/data} — load currently persisted admin data</li>
 *   <li>{@code POST /api/polymarket-admin/data} — save the full admin payload</li>
 *   <li>{@code DELETE /api/polymarket-admin/data} — clear persisted data (revert to seed)</li>
 *   <li>{@code GET /api/polymarket-admin/seed} — factory seed derived from the real data files</li>
 * </ul>
 *
 * This endpoint is intentionally public: the admin editor is a browser-only tool and the
 * data is not sensitive. If you later want to restrict it, add the route to
 * {@link com.fidabet.backend.config.WebConfig#tokenAuthFilter} and guard with a token.
 */
@RestController
@RequestMapping("/api/polymarket-admin")
public class PolymarketAdminController {

    private final PolymarketAdminService adminService;

    public PolymarketAdminController(PolymarketAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/data")
    public ResponseEntity<String> getData() {
        return adminService.loadRaw()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/data")
    public ResponseEntity<String> saveData(@RequestBody PolymarketAdminDataDto dto) {
        adminService.save(dto);
        return ResponseEntity.ok("\"OK\"");
    }

    @DeleteMapping("/data")
    public ResponseEntity<Void> deleteData() {
        adminService.delete();
        return ResponseEntity.noContent().build();
    }

    /**
     * Factory seed derived from the real data files. The frontend uses this to initialise
     * the admin editor the first time it is opened, before any user edits exist.
     */
    @GetMapping("/seed")
    public ResponseEntity<Map<String, Object>> getSeed() {
        // The real seed is built on the frontend from the existing data modules.
        // This endpoint returns a minimal placeholder; the frontend fills in the real
        // values from its own data imports and only uses this endpoint as a "seed present"
        // signal. If you later move seed generation server-side, wire it here.
        return ResponseEntity.ok(Map.of(
                "hero", java.util.Collections.emptyList(),
                "trending", java.util.Collections.emptyList(),
                "ethiopia", java.util.Collections.emptyList(),
                "breaking", java.util.Collections.emptyList(),
                "finance", java.util.Collections.emptyList(),
                "weather-cities", java.util.Collections.emptyList(),
                "weather-events", java.util.Collections.emptyList(),
                "art", java.util.Collections.emptyList(),
                "perps", java.util.Collections.emptyList()
        ));
    }
}
