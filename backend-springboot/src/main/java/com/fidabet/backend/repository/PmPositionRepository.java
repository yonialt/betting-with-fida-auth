package com.fidabet.backend.repository;

import com.fidabet.backend.entity.PmPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PmPositionRepository extends JpaRepository<PmPosition, Long> {

    Optional<PmPosition> findByUser_IdAndMarketIdAndSide(Long userId, String marketId, String side);

    List<PmPosition> findByUser_IdOrderByOpenedAtDesc(Long userId);

    List<PmPosition> findByUser_IdAndStatusOrderByOpenedAtDesc(Long userId, String status);

    List<PmPosition> findByMarketIdAndStatus(String marketId, String status);

    @Query("SELECT p FROM PmPosition p WHERE p.user.id = :userId AND p.status = 'open' AND p.shares > 0 ORDER BY p.openedAt DESC")
    List<PmPosition> findOpenByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM PmPosition p WHERE p.user.id = :userId AND p.status IN ('won','lost','closed') ORDER BY p.resolvedAt DESC, p.openedAt DESC")
    List<PmPosition> findHistoryByUserId(@Param("userId") Long userId);
}
