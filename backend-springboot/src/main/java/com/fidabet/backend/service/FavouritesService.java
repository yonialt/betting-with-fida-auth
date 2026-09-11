package com.fidabet.backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Favourite-match store (/api/favorites), ported from the Express in-memory {@code favoriteMatchIds}
 * set. Resolves ids against {@link MatchService} to return full match objects.
 */
@Service
public class FavouritesService {

    private final MatchService matchService;
    private final Set<String> favouriteIds = ConcurrentHashMap.newKeySet();

    public FavouritesService(MatchService matchService) {
        this.matchService = matchService;
        favouriteIds.add("arg-1"); // mirrors the Express seed
    }

    public List<Map<String, Object>> getFavourites() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (String id : favouriteIds) {
            matchService.getById(id).ifPresent(out::add);
        }
        return out;
    }

    public void add(String matchId) {
        favouriteIds.add(matchId);
    }

    public void remove(String matchId) {
        favouriteIds.remove(matchId);
    }
}
