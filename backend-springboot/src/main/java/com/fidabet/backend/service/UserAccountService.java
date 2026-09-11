package com.fidabet.backend.service;

import com.fidabet.backend.model.UserProfile;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Holds the single in-memory user account, replacing the module-level {@code currentUser} state
 * in the Express server. Balance mutations are synchronised because Spring serves requests on
 * multiple threads (the Node event loop was single-threaded); this preserves correctness of the
 * deposit / withdraw / place-bet / cashout balance arithmetic.
 *
 * <p>State is intentionally in-memory to preserve the original demo behaviour. The service is the
 * single seam through which a real datastore (JPA repository, etc.) can later be introduced.</p>
 */
@Service
public class UserAccountService {

    private final Object lock = new Object();

    private final UserProfile currentUser = UserProfile.builder()
            .isLoggedIn(true)
            .username("Player_8831")
            .userId("ID: 88319402")
            .balance(14500.0)
            .currency("ETB")
            .bonusBalance(250.0)
            .phone("+251911223344")
            .isAgeVerified(true)
            .ageVerificationStatus("verified")
            .build();

    public UserProfile getCurrentUser() {
        synchronized (lock) {
            return currentUser;
        }
    }

    /** Mirrors POST /api/auth/login: optionally updates the username, marks the session logged in. */
    public UserProfile login(String username) {
        synchronized (lock) {
            if (username != null && !username.isBlank()) {
                currentUser.setUsername(username);
            }
            currentUser.setLoggedIn(true);
            return currentUser;
        }
    }

    /** Mirrors POST /api/auth/register. */
    public UserProfile register(String username, String phone) {
        synchronized (lock) {
            if (username != null && !username.isBlank()) {
                currentUser.setUsername(username);
            }
            if (phone != null && !phone.isBlank()) {
                currentUser.setPhone(phone);
            }
            currentUser.setLoggedIn(true);
            return currentUser;
        }
    }

    /** Mirrors PUT /api/user/profile: shallow-merge of provided fields. */
    public UserProfile updateProfile(Map<String, Object> patch) {
        synchronized (lock) {
            if (patch != null) {
                if (patch.containsKey("username")) currentUser.setUsername(str(patch.get("username")));
                if (patch.containsKey("phone")) currentUser.setPhone(str(patch.get("phone")));
                if (patch.containsKey("email")) currentUser.setEmail(str(patch.get("email")));
                if (patch.containsKey("currency")) currentUser.setCurrency(str(patch.get("currency")));
                if (patch.get("balance") instanceof Number n) currentUser.setBalance(n.doubleValue());
                if (patch.get("bonusBalance") instanceof Number n) currentUser.setBonusBalance(n.doubleValue());
            }
            return currentUser;
        }
    }

    public void markAgeVerified() {
        synchronized (lock) {
            currentUser.setIsAgeVerified(true);
            currentUser.setAgeVerificationStatus("verified");
        }
    }

    /** Wallet balance envelope: { balance, bonusBalance, currency }. */
    public Map<String, Object> balanceView() {
        synchronized (lock) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("balance", currentUser.getBalance());
            m.put("bonusBalance", currentUser.getBonusBalance());
            m.put("currency", currentUser.getCurrency());
            return m;
        }
    }

    public String currency() {
        synchronized (lock) {
            return currentUser.getCurrency();
        }
    }

    public double balance() {
        synchronized (lock) {
            return currentUser.getBalance();
        }
    }

    /** Add funds (deposit / cashout / bet-void). Returns the new balance, rounded to 2dp. */
    public double credit(double amount) {
        synchronized (lock) {
            double next = round2(currentUser.getBalance() + amount);
            currentUser.setBalance(next);
            return next;
        }
    }

    /**
     * Remove funds (withdraw / place-bet). Returns true and debits when sufficient; false and
     * leaves the balance untouched otherwise.
     */
    public boolean tryDebit(double amount) {
        synchronized (lock) {
            if (currentUser.getBalance() < amount) {
                return false;
            }
            currentUser.setBalance(round2(currentUser.getBalance() - amount));
            return true;
        }
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }
}
