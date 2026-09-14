package com.fidabet.backend.dto;

import java.util.List;
import java.util.Map;

/**
 * Top-level admin data payload: a map from category id to an ordered list of market records.
 * Mirrors the frontend {@code Record<AdminCategory, AdminMarketRecord[]>} shape.
 */
public class PolymarketAdminDataDto {

    private Map<String, List<AdminMarketRecordDto>> data;

    public Map<String, List<AdminMarketRecordDto>> getData() {
        return data;
    }

    public void setData(Map<String, List<AdminMarketRecordDto>> data) {
        this.data = data;
    }

    public static class AdminMarketRecordDto {
        private String id;
        private String title;
        private String category;
        private String subcategory;
        private String volume;
        private Double chance;
        private Double yesPrice;
        private Double noPrice;
        private String description;
        private String endsDate;
        private String imageUrl;
        private String logoUrl;
        private List<AdminOutcomeRowDto> outcomes;
        private Boolean isHot;
        private Boolean featured;
        private String icon;
        private String accent;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSubcategory() { return subcategory; }
        public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
        public String getVolume() { return volume; }
        public void setVolume(String volume) { this.volume = volume; }
        public Double getChance() { return chance; }
        public void setChance(Double chance) { this.chance = chance; }
        public Double getYesPrice() { return yesPrice; }
        public void setYesPrice(Double yesPrice) { this.yesPrice = yesPrice; }
        public Double getNoPrice() { return noPrice; }
        public void setNoPrice(Double noPrice) { this.noPrice = noPrice; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEndsDate() { return endsDate; }
        public void setEndsDate(String endsDate) { this.endsDate = endsDate; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getLogoUrl() { return logoUrl; }
        public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
        public List<AdminOutcomeRowDto> getOutcomes() { return outcomes; }
        public void setOutcomes(List<AdminOutcomeRowDto> outcomes) { this.outcomes = outcomes; }
        public Boolean getIsHot() { return isHot; }
        public void setIsHot(Boolean isHot) { this.isHot = isHot; }
        public Boolean getFeatured() { return featured; }
        public void setFeatured(Boolean featured) { this.featured = featured; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public String getAccent() { return accent; }
        public void setAccent(String accent) { this.accent = accent; }
    }

    public static class AdminOutcomeRowDto {
        private String id;
        private String name;
        private Double probability;
        private Double yesPrice;
        private Double noPrice;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Double getProbability() { return probability; }
        public void setProbability(Double probability) { this.probability = probability; }
        public Double getYesPrice() { return yesPrice; }
        public void setYesPrice(Double yesPrice) { this.yesPrice = yesPrice; }
        public Double getNoPrice() { return noPrice; }
        public void setNoPrice(Double noPrice) { this.noPrice = noPrice; }
    }
}
