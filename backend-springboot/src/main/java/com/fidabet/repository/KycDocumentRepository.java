package com.fidabet.repository;

import com.fidabet.model.KycDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, String> {
    List<KycDocument> findByUserId(String userId);
    List<KycDocument> findByStatus(String status);
}
