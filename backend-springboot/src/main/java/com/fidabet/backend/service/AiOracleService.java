package com.fidabet.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * AI Oracle, ported from the Express /api/ai/oracle route. Calls the Google Generative Language API
 * (gemini-2.5-flash) server-side when {@code GEMINI_API_KEY} is configured, and falls back to the
 * same deterministic heuristic otherwise.
 *
 * <p>Security improvement over the original: the API key stays on the server and is never shipped to
 * the browser.</p>
 */
@Service
public class AiOracleService {

    private static final Logger log = LoggerFactory.getLogger(AiOracleService.class);
    private static final String ENDPOINT =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}";

    private final String apiKey;
    private final RestClient restClient = RestClient.create();

    public AiOracleService(@Value("${GEMINI_API_KEY:${ai.gemini.api-key:}}") String apiKey) {
        this.apiKey = apiKey;
    }

    public String generate(String prompt, String marketContext) {
        String p = prompt == null ? "" : prompt;
        String ctx = (marketContext == null || marketContext.isBlank())
                ? "Prediction markets & live sports odds" : marketContext;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String full = "You are Polymarket AI Oracle, a quantitative analyst for sports odds and prediction markets.\n"
                        + "User prompt: \"" + p + "\"\n"
                        + "Context: \"" + ctx + "\"\n\n"
                        + "Provide a concise, data-driven analysis (maximum 2-3 sentences) with probability estimates and volume sentiment. Start with an appropriate emoji.";

                Map<String, Object> body = Map.of(
                        "contents", List.of(Map.of("parts", List.of(Map.of("text", full)))));

                @SuppressWarnings("unchecked")
                Map<String, Object> response = restClient.post()
                        .uri(ENDPOINT, apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(Map.class);

                String text = extractText(response);
                if (text != null && !text.isBlank()) {
                    return text;
                }
            } catch (Exception e) {
                log.warn("[Gemini AI] Error in Oracle endpoint: {}", e.getMessage());
            }
        }
        return heuristic(p);
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) return null;
        Object candidates = response.get("candidates");
        if (!(candidates instanceof List<?> list) || list.isEmpty()) return null;
        Object first = list.get(0);
        if (!(first instanceof Map<?, ?> cand)) return null;
        Object content = ((Map<String, Object>) cand).get("content");
        if (!(content instanceof Map<?, ?> contentMap)) return null;
        Object parts = ((Map<String, Object>) contentMap).get("parts");
        if (!(parts instanceof List<?> partsList) || partsList.isEmpty()) return null;
        Object part0 = partsList.get(0);
        if (!(part0 instanceof Map<?, ?> partMap)) return null;
        Object text = ((Map<String, Object>) partMap).get("text");
        return text == null ? null : String.valueOf(text);
    }

    /** Deterministic fallback identical to the Express heuristic. */
    private String heuristic(String prompt) {
        String pl = prompt.toLowerCase();
        String snippet = prompt.length() > 40 ? prompt.substring(0, 40) : prompt;
        String analysis = "🧠 Polymarket Market Analysis: Analyzing real-time order books and historical prediction volume for \""
                + snippet + "...\". Liquidity depth is strong with balanced 64/36 buy-to-sell ratios.";

        if (pl.contains("fed") || pl.contains("rate") || pl.contains("cut")) {
            analysis = "🧠 Fed Rates Forecast: Polymarket order flow currently prices a 56% probability of 25bps cut and 44% probability of 50bps cut. Key catalyst: upcoming CPI print and Jackson Hole remarks.";
        } else if (pl.contains("claude") || pl.contains("model") || pl.contains("mythos") || pl.contains("ai")) {
            analysis = "🧠 AI Release Market: \"October 31\" outcome holds a 96% win probability with massive liquidity ($971K volume). Historical delivery timelines suggest end of Q3/early Q4 target.";
        } else if (pl.contains("btc") || pl.contains("bitcoin") || pl.contains("crypto")) {
            analysis = "🧠 Crypto Momentum: Real-time order books indicate 78% bullish sentiment on BTC holding above key moving averages through today's settlement.";
        }
        return analysis;
    }
}
