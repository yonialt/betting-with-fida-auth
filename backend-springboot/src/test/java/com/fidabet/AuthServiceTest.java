package com.fidabet;

import com.fidabet.dto.AuthDTOs;
import com.fidabet.model.User;
import com.fidabet.repository.UserRepository;
import com.fidabet.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testRegisterAndLogin() {
        AuthDTOs.RegisterRequest registerRequest = AuthDTOs.RegisterRequest.builder()
                .username("NewTester")
                .email("newtester@fidabet.com")
                .phone("+251922334455")
                .password("securePassword123")
                .build();

        AuthDTOs.AuthResponse regResponse = authService.register(registerRequest);
        assertNotNull(regResponse.getToken());
        assertNotNull(regResponse.getRefreshToken());
        assertEquals("NewTester", regResponse.getUser().getUsername());

        AuthDTOs.LoginRequest loginRequest = AuthDTOs.LoginRequest.builder()
                .username("NewTester")
                .password("securePassword123")
                .build();

        AuthDTOs.AuthResponse loginResponse = authService.login(loginRequest);
        assertNotNull(loginResponse.getToken());
        assertEquals("NewTester", loginResponse.getUser().getUsername());
    }
}
