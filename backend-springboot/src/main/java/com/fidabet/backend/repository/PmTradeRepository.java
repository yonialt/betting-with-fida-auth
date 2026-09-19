package com.fidabet.backend.repository;

import com.fidabet.backend.entity.PmTrade;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PmTradeRepository extends JpaRepository<PmTrade, Long> {

    List<PmTrade> findByUser_IdOrderByExecutedAtDesc(Long userId);

    List<PmTrade> findByUser_IdAndMarketIdOrderByExecutedAtDesc(Long userId, String marketId);

    List<PmTrade> findByMarketId(String marketId);

    // Tie-break by id so two trades in the same millisecond keep insertion order.
    @Query("SELECT t FROM PmTrade t WHERE t.user.id = :userId ORDER BY t.executedAt DESC, t.id DESC")
    List<PmTrade> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);
}
