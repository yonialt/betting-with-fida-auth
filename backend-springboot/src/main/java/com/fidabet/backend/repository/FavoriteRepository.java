package com.fidabet.backend.repository;

import com.fidabet.backend.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<Favorite> findByUser_IdAndMatchId(Long userId, String matchId);

    boolean existsByUser_IdAndMatchId(Long userId, String matchId);

    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId ORDER BY f.createdAt DESC")
    List<Favorite> findAllByUserId(@Param("userId") Long userId);
}
