package com.fidabet.controller;

import com.fidabet.dto.UserDTOs;
import com.fidabet.security.UserPrincipal;
import com.fidabet.service.SettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingController {

    private final SettingService settingService;

    public SettingController(SettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping
    public ResponseEntity<UserDTOs.UserSettingsDto> getSettings(@AuthenticationPrincipal UserPrincipal principal) {
        UserDTOs.UserSettingsDto settings = settingService.getUserSettings(principal.getId());
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<UserDTOs.UserSettingsDto> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserDTOs.UserSettingsDto dto) {
        UserDTOs.UserSettingsDto updated = settingService.updateUserSettings(principal.getId(), dto);
        return ResponseEntity.ok(updated);
    }
}
