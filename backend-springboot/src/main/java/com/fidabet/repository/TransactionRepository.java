package com.fidabet.repository;

import com.fidabet.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Optional<Transaction> findByTransactionId(String transactionId);
    Optional<Transaction> findByReferenceId(String referenceId);
    List<Transaction> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
