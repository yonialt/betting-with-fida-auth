package com.fidabet.repository;

import com.fidabet.model.AgeVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgeVerificationRepository extends JpaRepository<AgeVerification, String> {
    Optional<AgeVerification> findFirstByUserIdOrderByCreatedAtDesc(String userId);
    List<AgeVerification> findByUserId(String userId);
    Optional<AgeVerification> findByUserIdAndStatus(String userId, String status);
    boolean existsByUserIdAndStatus(String userId, String status);
}
