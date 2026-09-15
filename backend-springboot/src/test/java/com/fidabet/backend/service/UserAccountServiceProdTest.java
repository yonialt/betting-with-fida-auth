package com.fidabet.backend.service;

import com.fidabet.backend.entity.User;
import com.fidabet.backend.repository.BearerTokenRepository;
import com.fidabet.backend.repository.UserSettingRepository;
import com.fidabet.backend.repository.UserRepository;
import com.fidabet.backend.security.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Production path sanity check for UserAccountService.
 *
 * Verifies that register() creates its own persistent account with a database-backed
 * zero balance, that duplicate usernames are rejected, and that balance mutations
 * (credit/tryDebit) round-trip through the database without touching the demo path.
 */
@SpringBootTest
@Transactional
@org.springframework.test.context.ActiveProfiles("test")
class UserAccountServiceProdTest {

    @Autowired
    private UserAccountService userAccountService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSettingRepository userSettingRepository;

    @Autowired
    private BearerTokenRepository bearerTokenRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private SettingsService settingsService;

    @BeforeEach
    @AfterEach
    void cleanUp() {
        TokenContext.clear();
        bearerTokenRepository.deleteAll();
        userSettingRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createsPersistentUserOnRegister() {
        assertThat(userRepository.count()).isZero();

        User user = userAccountService.register("demo-user@fidabet.test", "+251911000000");

        assertThat(user).isNotNull();
        assertThat(user.getUsername()).isEqualTo("demo-user@fidabet.test");
        assertThat(user.getPhone()).isEqualTo("+251911000000");
        assertThat(user.getBalance()).isEqualByComparingTo(java.math.BigDecimal.ZERO);
        assertThat(user.getCurrency()).isEqualTo("ETB");
        assertThat(user.getIsAgeVerified()).isFalse();
        assertThat(user.getIsLoggedIn()).isTrue();

        assertThat(userRepository.count()).isEqualTo(1);
        Optional<User> saved = userRepository.findByUsername("demo-user@fidabet.test");
        assertThat(saved).isPresent();
    }

    @Test
    void rejectsDuplicateUsernameOnRegister() {
        userAccountService.register("dup@fidabet.test", null);
        assertThatThrownBy(() -> userAccountService.register("dup@fidabet.test", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void creditAndDebitRoundTripThroughDatabase() {
        User user = userAccountService.register("wallet@fidabet.test", null);

        double afterCredit = userAccountService.credit(user, 100.00);
        assertThat(afterCredit).isEqualTo(100.00);

        assertThat(userAccountService.tryDebit(user, 40.00)).isTrue();
        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getBalance()).isEqualByComparingTo(new java.math.BigDecimal("60.00"));

        // Over-debit is refused and leaves the balance untouched
        assertThat(userAccountService.tryDebit(user, 1000.00)).isFalse();
        reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getBalance()).isEqualByComparingTo(new java.math.BigDecimal("60.00"));
    }

    @Test
    void keepsBalanceAndSettingsIsolatedAcrossAccounts() {
        User first = userAccountService.register("first@fidabet.test", null);
        User second = userAccountService.register("second@fidabet.test", null);

        String firstToken = tokenService.issueAccessToken(first);
        TokenContext.set(firstToken);
        assertThat(settingsService.get()).containsEntry("language", "en");
        settingsService.update(Map.of("language", "am", "compactView", true));
        userAccountService.credit(first, 125.00);

        String secondToken = tokenService.issueAccessToken(second);
        TokenContext.set(secondToken);
        assertThat(userRepository.findById(second.getId()).orElseThrow().getBalance())
            .isEqualByComparingTo(java.math.BigDecimal.ZERO);
        assertThat(settingsService.get())
                .containsEntry("language", "en")
                .containsEntry("compactView", false);

        TokenContext.set(firstToken);
        assertThat(userRepository.findById(first.getId()).orElseThrow().getBalance())
            .isEqualByComparingTo(new java.math.BigDecimal("125.00"));
        assertThat(settingsService.get())
                .containsEntry("language", "am")
                .containsEntry("compactView", true);
    }
}
