package com.fidabet.repository;

import com.fidabet.model.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketRepository extends JpaRepository<Market, String> {
    List<Market> findByMatchIdOrderByDisplayOrderAsc(String matchId);
}
