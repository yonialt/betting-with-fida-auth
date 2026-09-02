package com.fidabet.repository;

import com.fidabet.model.BetSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BetSelectionRepository extends JpaRepository<BetSelection, String> {
    List<BetSelection> findByBetId(String betId);
    List<BetSelection> findByMatchId(String matchId);
}
