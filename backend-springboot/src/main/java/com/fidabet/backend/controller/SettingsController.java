package com.fidabet.backend.controller;

import com.fidabet.backend.service.SettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Settings endpoints (/api/settings). Protected by the token filter. */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settings;

    public SettingsController(SettingsService settings) {
        this.settings = settings;
    }

    @GetMapping
    public Map<String, Object> get() {
        return settings.get();
    }

    @PutMapping
    public Map<String, Object> update(@RequestBody(required = false) Map<String, Object> body) {
        return settings.update(body);
    }
}
