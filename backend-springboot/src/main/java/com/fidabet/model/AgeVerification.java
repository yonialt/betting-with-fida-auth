package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "age_verifications")
public class AgeVerification {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "fayda_id", length = 12)
    private String faydaId;

    @Column(name = "full_name", length = 200)
    private String fullName;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private Boolean isAdult = false; // true if 18+

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(length = 500)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AgeVerification() {}

    public AgeVerification(String id, String userId, String faydaId, String fullName,
                           String dateOfBirth, Integer age, Boolean isAdult, String status,
                           LocalDateTime verifiedAt, String reason, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.faydaId = faydaId;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.age = age;
        this.isAdult = isAdult;
        this.status = status;
        this.verifiedAt = verifiedAt;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public static AgeVerificationBuilder builder() {
        return new AgeVerificationBuilder();
    }

    public static class AgeVerificationBuilder {
        private String id;
        private String userId;
        private String faydaId;
        private String fullName;
        private String dateOfBirth;
        private Integer age;
        private Boolean isAdult = false;
        private String status = "PENDING";
        private LocalDateTime verifiedAt;
        private String reason;
        private LocalDateTime createdAt;

        public AgeVerificationBuilder id(String id) { this.id = id; return this; }
        public AgeVerificationBuilder userId(String userId) { this.userId = userId; return this; }
        public AgeVerificationBuilder faydaId(String faydaId) { this.faydaId = faydaId; return this; }
        public AgeVerificationBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AgeVerificationBuilder dateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public AgeVerificationBuilder age(Integer age) { this.age = age; return this; }
        public AgeVerificationBuilder isAdult(Boolean isAdult) { this.isAdult = isAdult; return this; }
        public AgeVerificationBuilder status(String status) { this.status = status; return this; }
        public AgeVerificationBuilder verifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; return this; }
        public AgeVerificationBuilder reason(String reason) { this.reason = reason; return this; }
        public AgeVerificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AgeVerification build() {
            return new AgeVerification(id, userId, faydaId, fullName, dateOfBirth, age, isAdult, status, verifiedAt, reason, createdAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getFaydaId() { return faydaId; }
    public void setFaydaId(String faydaId) { this.faydaId = faydaId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public Boolean getIsAdult() { return isAdult; }
    public void setIsAdult(Boolean isAdult) { this.isAdult = isAdult; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
