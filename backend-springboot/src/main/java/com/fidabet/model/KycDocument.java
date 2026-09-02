package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_documents")
public class KycDocument {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(name = "file_url", length = 255)
    private String fileUrl;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public KycDocument() {}

    public KycDocument(String id, String userId, String documentType, String documentNumber, String fileUrl, String status, LocalDateTime verifiedAt, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.fileUrl = fileUrl;
        this.status = status != null ? status : "PENDING";
        this.verifiedAt = verifiedAt;
        this.createdAt = createdAt;
    }

    public static KycDocumentBuilder builder() {
        return new KycDocumentBuilder();
    }

    public static class KycDocumentBuilder {
        private String id;
        private String userId;
        private String documentType;
        private String documentNumber;
        private String fileUrl;
        private String status = "PENDING";
        private LocalDateTime verifiedAt;
        private LocalDateTime createdAt;

        public KycDocumentBuilder id(String id) { this.id = id; return this; }
        public KycDocumentBuilder userId(String userId) { this.userId = userId; return this; }
        public KycDocumentBuilder documentType(String documentType) { this.documentType = documentType; return this; }
        public KycDocumentBuilder documentNumber(String documentNumber) { this.documentNumber = documentNumber; return this; }
        public KycDocumentBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public KycDocumentBuilder status(String status) { this.status = status; return this; }
        public KycDocumentBuilder verifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; return this; }
        public KycDocumentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public KycDocument build() {
            return new KycDocument(id, userId, documentType, documentNumber, fileUrl, status, verifiedAt, createdAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
