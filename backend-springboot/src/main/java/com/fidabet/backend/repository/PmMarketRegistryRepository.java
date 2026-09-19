package com.fidabet.backend.repository;

import com.fidabet.backend.entity.PmMarketRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PmMarketRegistryRepository extends JpaRepository<PmMarketRegistry, Long> {

    Optional<PmMarketRegistry> findByMarketId(String marketId);

    List<PmMarketRegistry> findByStatus(String status);

    List<PmMarketRegistry> findByStatusIn(List<String> statuses);
}
