package com.fidabet.service;

import com.fidabet.dto.UserDTOs;
import com.fidabet.model.UserSetting;
import com.fidabet.repository.UserSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SettingService {

    private final UserSettingRepository userSettingRepository;

    public SettingService(UserSettingRepository userSettingRepository) {
        this.userSettingRepository = userSettingRepository;
    }

    public UserDTOs.UserSettingsDto getUserSettings(String userId) {
        UserSetting setting = userSettingRepository.findByUserId(userId)
                .orElseGet(() -> UserSetting.builder()
                        .id(UUID.randomUUID().toString())
                        .userId(userId)
                        .oddsFormat("decimal")
                        .oddsAcceptanceMode("increase")
                        .oddsDisplayMode("simple")
                        .notificationsEnabled(true)
                        .theme("dark")
                        .build());

        return mapToDto(setting);
    }

    @Transactional
    public UserDTOs.UserSettingsDto updateUserSettings(String userId, UserDTOs.UserSettingsDto dto) {
        UserSetting setting = userSettingRepository.findByUserId(userId)
                .orElseGet(() -> UserSetting.builder()
                        .id(UUID.randomUUID().toString())
                        .userId(userId)
                        .build());

        if (dto.getOddsFormat() != null) setting.setOddsFormat(dto.getOddsFormat());
        if (dto.getOddsAcceptanceMode() != null) setting.setOddsAcceptanceMode(dto.getOddsAcceptanceMode());
        if (dto.getOddsDisplayMode() != null) setting.setOddsDisplayMode(dto.getOddsDisplayMode());
        setting.setNotificationsEnabled(dto.isNotificationsEnabled());
        if (dto.getTheme() != null) setting.setTheme(dto.getTheme());

        UserSetting saved = userSettingRepository.save(setting);
        return mapToDto(saved);
    }

    private UserDTOs.UserSettingsDto mapToDto(UserSetting s) {
        return UserDTOs.UserSettingsDto.builder()
                .oddsFormat(s.getOddsFormat())
                .oddsAcceptanceMode(s.getOddsAcceptanceMode())
                .oddsDisplayMode(s.getOddsDisplayMode())
                .notificationsEnabled(s.getNotificationsEnabled())
                .theme(s.getTheme())
                .build();
    }
}
