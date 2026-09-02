package com.fidabet.repository;

import com.fidabet.model.MatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchEventRepository extends JpaRepository<MatchEvent, String> {
    List<MatchEvent> findByMatchIdOrderByMinuteAsc(String matchId);
}
