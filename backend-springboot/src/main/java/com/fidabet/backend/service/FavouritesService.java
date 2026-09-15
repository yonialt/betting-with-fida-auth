package com.fidabet.backend.service;

import com.fidabet.backend.entity.Favorite;
import com.fidabet.backend.entity.User;
import com.fidabet.backend.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Favourite-match store backed by PostgreSQL.
 * Resolves ids against MatchService to return full match objects.
 * Persists favorites per user; the acting user comes from the request bearer token.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FavouritesService {

    private final MatchService matchService;
    private final UserAccountService userAccountService;
    private final FavoriteRepository favoriteRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFavourites() {
        User user = userAccountService.resolveUser(TokenContext.token());
        List<Favorite> favorites = favoriteRepository.findAllByUserId(user.getId());
        List<Map<String, Object>> out = new ArrayList<>();
        for (Favorite favorite : favorites) {
            matchService.getById(favorite.getMatchId()).ifPresent(out::add);
        }
        return out;
    }

    @Transactional
    public void add(String matchId) {
        User user = userAccountService.resolveUser(TokenContext.token());
        Optional<Favorite> existing = favoriteRepository.findByUser_IdAndMatchId(user.getId(), matchId);
        if (existing.isEmpty()) {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .matchId(matchId)
                    .build();
            favoriteRepository.save(favorite);
            log.info("Added favorite: {} for user {}", matchId, user.getId());
        }
    }

    @Transactional
    public void remove(String matchId) {
        User user = userAccountService.resolveUser(TokenContext.token());
        Optional<Favorite> existing = favoriteRepository.findByUser_IdAndMatchId(user.getId(), matchId);
        existing.ifPresent(favorite -> {
            favoriteRepository.delete(favorite);
            log.info("Removed favorite: {} for user {}", matchId, user.getId());
        });
    }
}
