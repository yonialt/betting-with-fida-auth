package com.fidabet.backend.repository;

import com.fidabet.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    boolean existsByUsername(String username);

    List<User> findByIsLoggedInTrue();

    @Modifying
    @Query("UPDATE User u SET u.isLoggedIn = :loggedIn, u.updatedAt = :ts WHERE u.id = :userId")
    void updateLoginStatus(@Param("userId") Long userId, @Param("loggedIn") boolean loggedIn, @Param("ts") Instant ts);

    /**
     * Atomic credit. Returns the affected row count (1 on success).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.balance = u.balance + :delta, u.updatedAt = :ts WHERE u.id = :userId")
    int addBalance(@Param("userId") Long userId, @Param("delta") BigDecimal delta, @Param("ts") Instant ts);

    /**
     * Atomic conditional debit. Returns 1 when the balance was sufficient and was debited,
     * 0 when it was not — the balance check and the debit happen in a single SQL statement,
     * so concurrent requests can never double-spend or drive the balance negative.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.balance = u.balance - :delta, u.updatedAt = :ts WHERE u.id = :userId AND u.balance >= :delta")
    int tryDebitBalance(@Param("userId") Long userId, @Param("delta") BigDecimal delta, @Param("ts") Instant ts);

    @Modifying
    @Query("UPDATE User u SET u.bonusBalance = :bonusBalance, u.updatedAt = :ts WHERE u.id = :userId")
    void updateBonusBalance(@Param("userId") Long userId, @Param("bonusBalance") BigDecimal bonusBalance, @Param("ts") Instant ts);

    @Modifying
    @Query("UPDATE User u SET u.isAgeVerified = true, u.ageVerificationStatus = 'verified', u.updatedAt = :ts WHERE u.id = :userId")
    void markAgeVerified(@Param("userId") Long userId, @Param("ts") Instant ts);
}
