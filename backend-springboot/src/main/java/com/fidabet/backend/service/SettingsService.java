package com.fidabet.backend.service;

import com.fidabet.backend.entity.User;
import com.fidabet.backend.entity.UserSetting;
import com.fidabet.backend.repository.UserSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * User preferences store backed by PostgreSQL.
 * Mirrors the Express userSettings object and its shallow-merge update semantics.
 * Creates default settings on first access if none exist; the acting user comes
 * from the request bearer token.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SettingsService {

    private final UserAccountService userAccountService;
    private final UserSettingRepository userSettingRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> get() {
        UserSetting setting = getUserSetting();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("oddsFormat", setting.getOddsFormat());
        result.put("language", setting.getLanguage());
        result.put("soundEffects", setting.getSoundEffects());
        result.put("autoAcceptOddsChanges", setting.getAutoAcceptOddsChanges());
        result.put("compactView", setting.getCompactView());
        return result;
    }

    @Transactional
    public Map<String, Object> update(Map<String, Object> patch) {
        UserSetting setting = getUserSetting();
        if (patch != null) {
            if (patch.containsKey("oddsFormat")) {
                setting.setOddsFormat(str(patch.get("oddsFormat")));
            }
            if (patch.containsKey("language")) {
                setting.setLanguage(str(patch.get("language")));
            }
            if (patch.containsKey("soundEffects")) {
                setting.setSoundEffects(bool(patch.get("soundEffects")));
            }
            if (patch.containsKey("autoAcceptOddsChanges")) {
                setting.setAutoAcceptOddsChanges(bool(patch.get("autoAcceptOddsChanges")));
            }
            if (patch.containsKey("compactView")) {
                setting.setCompactView(bool(patch.get("compactView")));
            }
            userSettingRepository.save(setting);
            log.info("Settings updated for user {}", setting.getUser().getId());
        }
        return get();
    }

    @Transactional(readOnly = true)
    protected UserSetting getUserSetting() {
        User user = userAccountService.resolveUser(TokenContext.token());
        UserSetting existing = userSettingRepository.findByUser_Id(user.getId()).orElse(null);
        if (existing != null) {
            return existing;
        }
        return createDefaultSettings(user);
    }

    @Transactional
    protected UserSetting createDefaultSettings(User user) {
        UserSetting setting = UserSetting.builder()
                .user(user)
                .oddsFormat("decimal")
                .language("en")
                .soundEffects(true)
                .autoAcceptOddsChanges(true)
                .compactView(false)
                .build();
        setting = userSettingRepository.save(setting);
        log.info("Created default settings for user {}", user.getId());
        return setting;
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean bool(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean b) return b;
        if (o instanceof Number n) return n.doubleValue() != 0;
        String s = String.valueOf(o).toLowerCase();
        return "true".equals(s) || "1".equals(s) || "yes".equals(s);
    }
}
