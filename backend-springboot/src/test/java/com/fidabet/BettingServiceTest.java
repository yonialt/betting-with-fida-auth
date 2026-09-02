package com.fidabet;

import com.fidabet.dto.BetDTOs;
import com.fidabet.model.User;
import com.fidabet.repository.UserRepository;
import com.fidabet.service.BettingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
@Transactional
class BettingServiceTest {

    @Autowired
    private BettingService bettingService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testPlaceBetAndCashout() {
        User user = userRepository.findByUsername("Player_8831").orElseThrow();
        BigDecimal initialBalance = user.getBalance();

        BetDTOs.BetSelectionRequest sel = BetDTOs.BetSelectionRequest.builder()
                .id("arg1-w1")
                .matchId("arg-1")
                .odds(new BigDecimal("1.11"))
                .build();

        BetDTOs.PlaceBetRequest request = BetDTOs.PlaceBetRequest.builder()
                .stake(new BigDecimal("100.00"))
                .betType("single")
                .items(List.of(sel))
                .build();

        BetDTOs.BetDto bet = bettingService.placeBet(user.getId(), request);
        assertNotNull(bet);
        assertEquals("active", bet.getStatus());

        BigDecimal balanceAfterBet = initialBalance.subtract(new BigDecimal("100.00"));
        User userAfterBet = userRepository.findById(user.getId()).orElseThrow();
        assertEquals(balanceAfterBet, userAfterBet.getBalance());

        // Test Cashout
        BetDTOs.CashoutResponse cashoutResp = bettingService.cashoutBet(user.getId(), bet.getId());
        assertNotNull(cashoutResp);
        assertEquals(bet.getId(), cashoutResp.getBetId());

        User afterCashoutUser = userRepository.findById(user.getId()).orElseThrow();
        BigDecimal expectedFinalBalance = balanceAfterBet.add(cashoutResp.getCashoutAmount());
        assertEquals(expectedFinalBalance, afterCashoutUser.getBalance());
    }
}
