package com.fidabet.repository;

import com.fidabet.model.Odds;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OddsRepository extends JpaRepository<Odds, String> {
    List<Odds> findByMatchId(String matchId);
    Optional<Odds> findByMatchIdAndSelectionKey(String matchId, String selectionKey);
    List<Odds> findByMatchIdAndMarketId(String matchId, String marketId);
}
