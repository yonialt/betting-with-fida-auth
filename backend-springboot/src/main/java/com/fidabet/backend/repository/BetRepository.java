package com.fidabet.backend.repository;

import com.fidabet.backend.entity.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {

    Optional<Bet> findByBetId(String betId);

    List<Bet> findByUser_IdOrderByPlacedAtDesc(Long userId);

    List<Bet> findByUser_IdAndStatusOrderByPlacedAtDesc(Long userId, String status);

    @Query("SELECT b FROM Bet b WHERE b.user.id = :userId ORDER BY b.placedAt DESC")
    List<Bet> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Bet b WHERE b.user.id = :userId AND b.status = :status ORDER BY b.placedAt DESC")
    List<Bet> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("SELECT COUNT(b) FROM Bet b WHERE b.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
