package com.fidabet.repository;

import com.fidabet.model.Bet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BetRepository extends JpaRepository<Bet, String> {
    List<Bet> findByUserIdOrderByPlacedAtDesc(String userId);
    Page<Bet> findByUserIdOrderByPlacedAtDesc(String userId, Pageable pageable);
    Page<Bet> findByUserIdAndStatusOrderByPlacedAtDesc(String userId, String status, Pageable pageable);
    Optional<Bet> findByIdAndUserId(String id, String userId);
    List<Bet> findByStatus(String status);
    Page<Bet> findAllByOrderByPlacedAtDesc(Pageable pageable);
}
