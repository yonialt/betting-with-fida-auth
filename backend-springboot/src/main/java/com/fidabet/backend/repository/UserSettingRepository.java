package com.fidabet.backend.repository;

import com.fidabet.backend.entity.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {

    Optional<UserSetting> findByUser_Id(Long userId);

    boolean existsByUser_Id(Long userId);
}
