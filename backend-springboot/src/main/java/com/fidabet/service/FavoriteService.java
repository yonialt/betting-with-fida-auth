package com.fidabet.service;

import com.fidabet.dto.MatchDTOs;
import com.fidabet.model.UserFavorite;
import com.fidabet.repository.UserFavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;
    private final MatchService matchService;

    public FavoriteService(UserFavoriteRepository userFavoriteRepository, MatchService matchService) {
        this.userFavoriteRepository = userFavoriteRepository;
        this.matchService = matchService;
    }

    public List<MatchDTOs.MatchDto> getUserFavorites(String userId) {
        List<UserFavorite> favorites = userFavoriteRepository.findByUserId(userId);
        return favorites.stream()
                .map(f -> matchService.getMatchDetails(f.getMatchId(), userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(String userId, String matchId) {
        if (!userFavoriteRepository.existsByUserIdAndMatchId(userId, matchId)) {
            UserFavorite fav = UserFavorite.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .matchId(matchId)
                    .build();
            userFavoriteRepository.save(fav);
        }
    }

    @Transactional
    public void removeFavorite(String userId, String matchId) {
        userFavoriteRepository.deleteByUserIdAndMatchId(userId, matchId);
    }
}
