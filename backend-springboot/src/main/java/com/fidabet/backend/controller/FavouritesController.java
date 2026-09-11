package com.fidabet.backend.controller;

import com.fidabet.backend.service.FavouritesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Favourite-match endpoints (/api/favorites). Protected by the token filter. */
@RestController
@RequestMapping("/api/favorites")
public class FavouritesController {

    private final FavouritesService favourites;

    public FavouritesController(FavouritesService favourites) {
        this.favourites = favourites;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return favourites.getFavourites();
    }

    @PostMapping("/{matchId}")
    public Map<String, Object> add(@PathVariable String matchId) {
        favourites.add(matchId);
        return Map.<String, Object>of("success", true);
    }

    @DeleteMapping("/{matchId}")
    public Map<String, Object> remove(@PathVariable String matchId) {
        favourites.remove(matchId);
        return Map.<String, Object>of("success", true);
    }
}
