package com.fidabet.backend.controller;

import com.fidabet.backend.service.UserAccountService;
import com.fidabet.backend.service.WalletService;
import com.fidabet.backend.support.Bodies;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Wallet endpoints (/api/wallet/*). Protected by the token filter. */
@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService wallet;
    private final UserAccountService users;

    public WalletController(WalletService wallet, UserAccountService users) {
        this.wallet = wallet;
        this.users = users;
    }

    @GetMapping("/balance")
    public Map<String, Object> balance() {
        return users.balanceView();
    }

    @PostMapping("/deposit")
    public Map<String, Object> deposit(@RequestBody(required = false) Map<String, Object> body) {
        double amount = Bodies.toDouble(body, "amount", 0);
        String method = Bodies.toStr(body, "paymentMethod", "telebirr");
        return wallet.deposit(amount, method);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody(required = false) Map<String, Object> body) {
        double amount = Bodies.toDouble(body, "amount", 0);
        String method = Bodies.toStr(body, "paymentMethod", "telebirr");
        Map<String, Object> result = wallet.withdraw(amount, method);
        if (result == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Insufficient balance"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/transactions")
    public Object transactions() {
        return wallet.transactions();
    }
}
