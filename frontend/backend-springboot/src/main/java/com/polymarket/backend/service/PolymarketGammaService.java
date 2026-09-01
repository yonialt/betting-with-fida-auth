package com.polymarket.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polymarket.backend.dto.MarketOutcomeDto;
import com.polymarket.backend.dto.PolymarketEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PolymarketGammaService {

    private static final Logger log = LoggerFactory.getLogger(PolymarketGammaService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PolymarketGammaService(
            @Value("${polymarket.gamma.base-url:https://gamma-api.polymarket.com}") String baseUrl,
            ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.objectMapper = objectMapper;
    }

    @Cacheable(value = "gammaEvents", key = "#limit + '-' + #tag + '-' + #order")
    public List<PolymarketEventDto> getEvents(int limit, String tag, String order) {
        try {
            String uri = String.format("/events?order=%s&ascending=false&limit=%d&active=true&closed=false",
                    order != null ? order : "volume24hr", limit > 0 ? limit : 24);

            if (tag != null && !tag.isBlank() && !tag.equalsIgnoreCase("All")) {
                uri += "&tag_slug=" + tag.toLowerCase();
            }

            log.info("Fetching Polymarket Gamma events from endpoint: {}", uri);

            String rawJson = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(String.class);

            if (rawJson == null || rawJson.isBlank()) {
                return Collections.emptyList();
            }

            JsonNode eventsNode = objectMapper.readTree(rawJson);
            if (!eventsNode.isArray()) {
                return Collections.emptyList();
            }

            List<PolymarketEventDto> result = new ArrayList<>();
            for (JsonNode eventNode : eventsNode) {
                result.add(mapEventNodeToDto(eventNode));
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to fetch Polymarket Gamma events", e);
            return Collections.emptyList();
        }
    }

    private PolymarketEventDto mapEventNodeToDto(JsonNode node) {
        String id = node.path("id").asText();
        String title = node.path("title").asText("Untitled Market");
        String slug = node.path("slug").asText("");
        String image = node.path("image").asText(node.path("icon").asText(null));
        double volume = node.path("volume24hr").asDouble(node.path("volume").asDouble(0));

        List<MarketOutcomeDto> outcomes = new ArrayList<>();
        JsonNode marketsNode = node.path("markets");

        if (marketsNode.isArray() && marketsNode.size() > 1) {
            // Multi outcome market
            for (int i = 0; i < Math.min(marketsNode.size(), 5); i++) {
                JsonNode m = marketsNode.get(i);
                String subTitle = m.path("groupItemTitle").asText(m.path("question").asText());
                String priceStr = m.path("outcomePrices").asText("[\"0.5\"]");
                int prob = parseFirstPriceProbability(priceStr);
                outcomes.add(MarketOutcomeDto.builder()
                        .name(subTitle)
                        .probability(prob)
                        .yesPrice(prob)
                        .noPrice(100 - prob)
                        .build());
            }
        } else if (marketsNode.isArray() && !marketsNode.isEmpty()) {
            JsonNode primary = marketsNode.get(0);
            String priceStr = primary.path("outcomePrices").asText("[\"0.5\",\"0.5\"]");
            int probYes = parseFirstPriceProbability(priceStr);
            outcomes.add(new MarketOutcomeDto("Yes", probYes, probYes, 100 - probYes));
            outcomes.add(new MarketOutcomeDto("No", 100 - probYes, 100 - probYes, probYes));
        }

        return PolymarketEventDto.builder()
                .id("gamma-" + id)
                .title(title)
                .slug(slug)
                .category("Prediction Market")
                .volume(formatVolume(volume))
                .avatarUrl(image)
                .displayType(outcomes.size() > 2 ? "multi_outcome" : "binary_buttons")
                .outcomes(outcomes)
                .build();
    }

    private int parseFirstPriceProbability(String rawJson) {
        try {
            List<String> list = objectMapper.readValue(rawJson, new TypeReference<List<String>>() {});
            if (!list.isEmpty()) {
                double val = Double.parseDouble(list.get(0));
                return (int) Math.round(val * 100);
            }
        } catch (Exception ignored) {}
        return 50;
    }

    private String formatVolume(double vol) {
        if (vol >= 1_000_000_000) return String.format("$%.1fB Vol", vol / 1_000_000_000);
        if (vol >= 1_000_000) return String.format("$%.1fM Vol", vol / 1_000_000);
        if (vol >= 1_000) return String.format("$%.0fK Vol", vol / 1_000);
        return String.format("$%.0f Vol", vol);
    }
}
