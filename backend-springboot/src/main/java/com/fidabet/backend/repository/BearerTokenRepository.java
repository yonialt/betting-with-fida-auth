package com.fidabet.backend.repository;

import com.fidabet.backend.entity.BearerToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BearerTokenRepository extends JpaRepository<BearerToken, Long> {

    Optional<BearerToken> findByToken(String token);

    List<BearerToken> findByUser_Id(Long userId);

    @Query("SELECT bt FROM BearerToken bt WHERE bt.token = :token AND bt.isValid = true AND bt.expiresAt > CURRENT_TIMESTAMP")
    Optional<BearerToken> findValidToken(@Param("token") String token);

    @Modifying
    @Query("UPDATE BearerToken bt SET bt.isValid = false WHERE bt.token = :token")
    void invalidateToken(@Param("token") String token);

    @Modifying
    @Query("UPDATE BearerToken bt SET bt.isValid = false WHERE bt.user.id = :userId")
    void invalidateAllUserTokens(@Param("userId") Long userId);

    @Query("SELECT COUNT(bt) FROM BearerToken bt WHERE bt.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
