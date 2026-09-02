package com.fidabet.repository;

import com.fidabet.model.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeagueRepository extends JpaRepository<League, String> {
    List<League> findBySportId(String sportId);
}
