package com.fidabet.dto;

import java.util.List;

public class PolymarketEventDto {
    private String id;
    private String title;
    private String slug;
    private String category;
    private String volume;
    private String avatarUrl;
    private String badge;
    private String displayType;
    private List<MarketOutcomeDto> outcomes;

    public PolymarketEventDto() {}

    public PolymarketEventDto(String id, String title, String slug, String category, String volume,
                              String avatarUrl, String badge, String displayType, List<MarketOutcomeDto> outcomes) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.category = category;
        this.volume = volume;
        this.avatarUrl = avatarUrl;
        this.badge = badge;
        this.displayType = displayType;
        this.outcomes = outcomes;
    }

    public static PolymarketEventDtoBuilder builder() {
        return new PolymarketEventDtoBuilder();
    }

    public static class PolymarketEventDtoBuilder {
        private String id;
        private String title;
        private String slug;
        private String category;
        private String volume;
        private String avatarUrl;
        private String badge;
        private String displayType;
        private List<MarketOutcomeDto> outcomes;

        public PolymarketEventDtoBuilder id(String id) { this.id = id; return this; }
        public PolymarketEventDtoBuilder title(String title) { this.title = title; return this; }
        public PolymarketEventDtoBuilder slug(String slug) { this.slug = slug; return this; }
        public PolymarketEventDtoBuilder category(String category) { this.category = category; return this; }
        public PolymarketEventDtoBuilder volume(String volume) { this.volume = volume; return this; }
        public PolymarketEventDtoBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public PolymarketEventDtoBuilder badge(String badge) { this.badge = badge; return this; }
        public PolymarketEventDtoBuilder displayType(String displayType) { this.displayType = displayType; return this; }
        public PolymarketEventDtoBuilder outcomes(List<MarketOutcomeDto> outcomes) { this.outcomes = outcomes; return this; }

        public PolymarketEventDto build() {
            return new PolymarketEventDto(id, title, slug, category, volume, avatarUrl, badge, displayType, outcomes);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getVolume() { return volume; }
    public void setVolume(String volume) { this.volume = volume; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getDisplayType() { return displayType; }
    public void setDisplayType(String displayType) { this.displayType = displayType; }

    public List<MarketOutcomeDto> getOutcomes() { return outcomes; }
    public void setOutcomes(List<MarketOutcomeDto> outcomes) { this.outcomes = outcomes; }
}
