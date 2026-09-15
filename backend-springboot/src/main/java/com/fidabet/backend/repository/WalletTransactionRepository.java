package com.fidabet.backend.repository;

import com.fidabet.backend.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByUser_IdOrderByTimestampDesc(Long userId);

    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.user.id = :userId ORDER BY wt.timestamp DESC")
    List<WalletTransaction> findByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(wt) FROM WalletTransaction wt WHERE wt.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
