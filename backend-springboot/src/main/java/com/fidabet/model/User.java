package com.fidabet.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(unique = true, length = 100)
    private String email;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(length = 10, nullable = false)
    private String currency = "ETB";

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "bonus_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal bonusBalance = BigDecimal.ZERO;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, length = 20)
    private String role = "USER";

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public User() {}

    public User(String id, String username, String email, String phone, String passwordHash, String currency,
                BigDecimal balance, BigDecimal bonusBalance, Boolean isVerified, Boolean isActive, String role,
                Long version, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.currency = currency != null ? currency : "ETB";
        this.balance = balance != null ? balance : BigDecimal.ZERO;
        this.bonusBalance = bonusBalance != null ? bonusBalance : BigDecimal.ZERO;
        this.isVerified = isVerified != null ? isVerified : false;
        this.isActive = isActive != null ? isActive : true;
        this.role = role != null ? role : "USER";
        this.version = version != null ? version : 0L;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String id;
        private String username;
        private String email;
        private String phone;
        private String passwordHash;
        private String currency = "ETB";
        private BigDecimal balance = BigDecimal.ZERO;
        private BigDecimal bonusBalance = BigDecimal.ZERO;
        private Boolean isVerified = false;
        private Boolean isActive = true;
        private String role = "USER";
        private Long version = 0L;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public UserBuilder currency(String currency) { this.currency = currency; return this; }
        public UserBuilder balance(BigDecimal balance) { this.balance = balance; return this; }
        public UserBuilder bonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; return this; }
        public UserBuilder isVerified(Boolean isVerified) { this.isVerified = isVerified; return this; }
        public UserBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder version(Long version) { this.version = version; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            return new User(id, username, email, phone, passwordHash, currency, balance, bonusBalance, isVerified, isActive, role, version, createdAt, updatedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public BigDecimal getBonusBalance() { return bonusBalance; }
    public void setBonusBalance(BigDecimal bonusBalance) { this.bonusBalance = bonusBalance; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
