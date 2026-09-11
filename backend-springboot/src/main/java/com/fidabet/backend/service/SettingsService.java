package com.fidabet.backend.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * User preferences store (/api/settings). Mirrors the Express {@code userSettings} object and its
 * shallow-merge update semantics ({@code userSettings = { ...userSettings, ...req.body }}).
 */
@Service
public class SettingsService {

    private final Map<String, Object> settings = new LinkedHashMap<>();

    public SettingsService() {
        settings.put("oddsFormat", "decimal");
        settings.put("language", "en");
        settings.put("soundEffects", true);
        settings.put("autoAcceptOddsChanges", true);
        settings.put("compactView", false);
    }

    public synchronized Map<String, Object> get() {
        return new LinkedHashMap<>(settings);
    }

    public synchronized Map<String, Object> update(Map<String, Object> patch) {
        if (patch != null) {
            settings.putAll(patch);
        }
        return new LinkedHashMap<>(settings);
    }
}
