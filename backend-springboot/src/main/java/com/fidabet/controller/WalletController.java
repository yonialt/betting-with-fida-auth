package com.fidabet.controller;

import com.fidabet.dto.WalletDTOs;
import com.fidabet.model.Transaction;
import com.fidabet.security.UserPrincipal;
import com.fidabet.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance")
    public ResponseEntity<WalletDTOs.BalanceResponse> getBalance(@AuthenticationPrincipal UserPrincipal principal) {
        WalletDTOs.BalanceResponse balance = walletService.getBalance(principal.getId());
        return ResponseEntity.ok(balance);
    }

    @PostMapping("/deposit")
    public ResponseEntity<WalletDTOs.DepositResponse> deposit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WalletDTOs.DepositRequest request) {
        WalletDTOs.DepositResponse response = walletService.deposit(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Transaction> withdraw(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WalletDTOs.WithdrawRequest request) {
        Transaction transaction = walletService.withdraw(principal.getId(), request);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<WalletDTOs.TransactionDto>> getTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<WalletDTOs.TransactionDto> transactions = walletService.getTransactions(principal.getId(), pageable);
        return ResponseEntity.ok(transactions);
    }
}
