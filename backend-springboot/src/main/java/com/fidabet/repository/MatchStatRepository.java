package com.fidabet.repository;

import com.fidabet.model.MatchStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchStatRepository extends JpaRepository<MatchStat, String> {
    Optional<MatchStat> findByMatchId(String matchId);
}
