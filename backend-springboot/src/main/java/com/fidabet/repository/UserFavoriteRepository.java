package com.fidabet.repository;

import com.fidabet.model.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, String> {
    List<UserFavorite> findByUserId(String userId);
    Optional<UserFavorite> findByUserIdAndMatchId(String userId, String matchId);
    void deleteByUserIdAndMatchId(String userId, String matchId);
    boolean existsByUserIdAndMatchId(String userId, String matchId);
}
