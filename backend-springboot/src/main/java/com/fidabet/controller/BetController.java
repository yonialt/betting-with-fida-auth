package com.fidabet.controller;

import com.fidabet.dto.BetDTOs;
import com.fidabet.security.UserPrincipal;
import com.fidabet.service.BettingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bets")
@CrossOrigin(origins = "*")
public class BetController {

    private final BettingService bettingService;

    public BetController(BettingService bettingService) {
        this.bettingService = bettingService;
    }

    @PostMapping("/place")
    public ResponseEntity<BetDTOs.BetDto> placeBet(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BetDTOs.PlaceBetRequest request) {
        BetDTOs.BetDto bet = bettingService.placeBet(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(bet);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<BetDTOs.BetDto>> getBetHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<BetDTOs.BetDto> history = bettingService.getBetHistory(principal.getId(), status, pageable);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BetDTOs.BetDto> getBet(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        BetDTOs.BetDto bet = bettingService.getBetById(principal.getId(), id);
        return ResponseEntity.ok(bet);
    }

    @PostMapping("/{id}/cashout")
    public ResponseEntity<BetDTOs.CashoutResponse> cashout(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        BetDTOs.CashoutResponse response = bettingService.cashoutBet(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/cashout-value")
    public ResponseEntity<BetDTOs.CashoutValueResponse> getCashoutValue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        BetDTOs.CashoutValueResponse response = bettingService.getCashoutValue(principal.getId(), id);
        return ResponseEntity.ok(response);
    }
}
