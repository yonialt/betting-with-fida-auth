package com.fidabet.controller;

import com.fidabet.dto.MatchDTOs;
import com.fidabet.security.UserPrincipal;
import com.fidabet.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ResponseEntity<List<MatchDTOs.MatchDto>> getFavorites(@AuthenticationPrincipal UserPrincipal principal) {
        List<MatchDTOs.MatchDto> favorites = favoriteService.getUserFavorites(principal.getId());
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/{matchId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String matchId) {
        favoriteService.addFavorite(principal.getId(), matchId);
        return ResponseEntity.ok(Map.of("success", true, "matchId", matchId));
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String matchId) {
        favoriteService.removeFavorite(principal.getId(), matchId);
        return ResponseEntity.ok(Map.of("success", true, "matchId", matchId));
    }
}
