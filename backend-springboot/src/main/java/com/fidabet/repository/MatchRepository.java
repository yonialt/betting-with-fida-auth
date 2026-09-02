package com.fidabet.repository;

import com.fidabet.model.Match;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, String> {
    List<Match> findByIsLiveTrue();
    List<Match> findBySportIdAndIsLiveTrue(String sportId);
    Page<Match> findByIsLiveFalseAndStatus(String status, Pageable pageable);
    Page<Match> findBySportIdAndIsLiveFalseAndStatus(String sportId, String status, Pageable pageable);
    
    @Query("SELECT m FROM Match m WHERE LOWER(m.team1) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.team2) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.leagueName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Match> searchMatches(@Param("query") String query);
}
