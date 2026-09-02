package com.fidabet.controller;

import com.fidabet.dto.AdminDTOs;
import com.fidabet.dto.MatchDTOs;
import com.fidabet.dto.WalletDTOs;
import com.fidabet.service.AdminService;
import com.fidabet.service.OddsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final OddsService oddsService;

    public AdminController(AdminService adminService, OddsService oddsService) {
        this.adminService = adminService;
        this.oddsService = oddsService;
    }

    // --- Matches Management ---
    @GetMapping("/matches")
    public ResponseEntity<Page<MatchDTOs.MatchDto>> getMatches(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllMatches(pageable));
    }

    @PostMapping("/matches")
    public ResponseEntity<MatchDTOs.MatchDto> createMatch(@Valid @RequestBody AdminDTOs.CreateMatchRequest request) {
        MatchDTOs.MatchDto match = adminService.createMatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(match);
    }

    @PutMapping("/matches/{id}/score")
    public ResponseEntity<MatchDTOs.MatchDto> updateMatchScore(
            @PathVariable String id,
            @Valid @RequestBody AdminDTOs.UpdateMatchScoreRequest request) {
        MatchDTOs.MatchDto match = adminService.updateMatchScore(id, request);
        return ResponseEntity.ok(match);
    }

    @PutMapping("/matches/{id}/status")
    public ResponseEntity<MatchDTOs.MatchDto> updateMatchStatus(
            @PathVariable String id,
            @Valid @RequestBody AdminDTOs.UpdateMatchStatusRequest request) {
        MatchDTOs.MatchDto match = adminService.updateMatchStatus(id, request);
        return ResponseEntity.ok(match);
    }

    // --- Odds Management ---
    @GetMapping("/odds/{matchId}")
    public ResponseEntity<List<MatchDTOs.OddsItemDto>> getOddsForMatch(@PathVariable String matchId) {
        return ResponseEntity.ok(oddsService.getOddsForMatch(matchId));
    }

    @PutMapping("/odds/{id}")
    public ResponseEntity<MatchDTOs.OddsItemDto> updateSingleOdds(
            @PathVariable String id,
            @RequestBody AdminDTOs.SingleOddsUpdate update) {
        MatchDTOs.OddsItemDto odds = oddsService.updateOdds(id, update.getValue(), update.getIsLocked());
        return ResponseEntity.ok(odds);
    }

    @PostMapping("/odds/bulk-update")
    public ResponseEntity<List<MatchDTOs.OddsItemDto>> bulkUpdateOdds(@RequestBody AdminDTOs.BulkOddsUpdateRequest request) {
        List<MatchDTOs.OddsItemDto> updated = oddsService.bulkUpdateOdds(request);
        return ResponseEntity.ok(updated);
    }

    // --- Users Management ---
    @GetMapping("/users")
    public ResponseEntity<Page<AdminDTOs.AdminUserDto>> getUsers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminDTOs.AdminUserDto> getUser(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/balance")
    public ResponseEntity<AdminDTOs.AdminUserDto> adjustBalance(
            @PathVariable String id,
            @RequestBody Map<String, BigDecimal> body) {
        BigDecimal balance = body.get("balance");
        return ResponseEntity.ok(adminService.adjustUserBalance(id, balance));
    }

    // --- Transactions Management ---
    @GetMapping("/transactions")
    public ResponseEntity<Page<WalletDTOs.TransactionDto>> getTransactions(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllTransactions(pageable));
    }

    @PostMapping("/transactions/{id}/approve")
    public ResponseEntity<WalletDTOs.TransactionDto> approveTransaction(@PathVariable String id) {
        return ResponseEntity.ok(adminService.approveTransaction(id));
    }

    // --- Reports & GGR ---
    @GetMapping("/reports/daily")
    public ResponseEntity<AdminDTOs.AdminReportDto> getDailyReport() {
        return ResponseEntity.ok(adminService.getDailyReport());
    }
}
