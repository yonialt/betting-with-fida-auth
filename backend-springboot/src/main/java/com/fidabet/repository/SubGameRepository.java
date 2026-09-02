package com.fidabet.repository;

import com.fidabet.model.SubGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubGameRepository extends JpaRepository<SubGame, String> {
    List<SubGame> findByMatchId(String matchId);
}
