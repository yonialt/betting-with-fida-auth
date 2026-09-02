package com.fidabet.dto;

public class MarketOutcomeDto {
    private String name;
    private int probability; // e.g. 76 for 76%
    private int yesPrice;    // in cents
    private int noPrice;     // in cents

    public MarketOutcomeDto() {}

    public MarketOutcomeDto(String name, int probability, int yesPrice, int noPrice) {
        this.name = name;
        this.probability = probability;
        this.yesPrice = yesPrice;
        this.noPrice = noPrice;
    }

    public static MarketOutcomeDtoBuilder builder() {
        return new MarketOutcomeDtoBuilder();
    }

    public static class MarketOutcomeDtoBuilder {
        private String name;
        private int probability;
        private int yesPrice;
        private int noPrice;

        public MarketOutcomeDtoBuilder name(String name) { this.name = name; return this; }
        public MarketOutcomeDtoBuilder probability(int probability) { this.probability = probability; return this; }
        public MarketOutcomeDtoBuilder yesPrice(int yesPrice) { this.yesPrice = yesPrice; return this; }
        public MarketOutcomeDtoBuilder noPrice(int noPrice) { this.noPrice = noPrice; return this; }

        public MarketOutcomeDto build() {
            return new MarketOutcomeDto(name, probability, yesPrice, noPrice);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getProbability() { return probability; }
    public void setProbability(int probability) { this.probability = probability; }

    public int getYesPrice() { return yesPrice; }
    public void setYesPrice(int yesPrice) { this.yesPrice = yesPrice; }

    public int getNoPrice() { return noPrice; }
    public void setNoPrice(int noPrice) { this.noPrice = noPrice; }
}
