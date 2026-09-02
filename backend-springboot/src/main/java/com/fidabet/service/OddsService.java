package com.fidabet.service;

import com.fidabet.dto.AdminDTOs;
import com.fidabet.dto.MatchDTOs;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.model.Match;
import com.fidabet.model.Odds;
import com.fidabet.repository.MatchRepository;
import com.fidabet.repository.OddsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OddsService {

    private static final Logger log = LoggerFactory.getLogger(OddsService.class);

    private final OddsRepository oddsRepository;
    private final MatchRepository matchRepository;
    private final RealtimeMessagingService realtimeMessagingService;
    private final EventPublisherService eventPublisherService;
    private final Random random = new Random();

    public OddsService(
            OddsRepository oddsRepository,
            MatchRepository matchRepository,
            RealtimeMessagingService realtimeMessagingService,
            EventPublisherService eventPublisherService) {
        this.oddsRepository = oddsRepository;
        this.matchRepository = matchRepository;
        this.realtimeMessagingService = realtimeMessagingService;
        this.eventPublisherService = eventPublisherService;
    }

    public List<MatchDTOs.OddsItemDto> getOddsForMatch(String matchId) {
        return oddsRepository.findByMatchId(matchId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MatchDTOs.OddsItemDto updateOdds(String oddsId, BigDecimal newValue, Boolean isLocked) {
        Odds odds = oddsRepository.findById(oddsId)
                .orElseThrow(() -> new ResourceNotFoundException("Odds not found: " + oddsId));

        BigDecimal prev = odds.getValue();
        odds.setPreviousValue(prev);
        odds.setValue(newValue);

        String trend = newValue.compareTo(prev) > 0 ? "up" : newValue.compareTo(prev) < 0 ? "down" : "same";
        odds.setTrend(trend);

        if (isLocked != null) {
            odds.setIsLocked(isLocked);
        }
        odds.setLastUpdated(System.currentTimeMillis());

        Odds saved = oddsRepository.save(odds);

        MatchDTOs.OddsItemDto dto = mapToDto(saved);

        // Broadcast to WebSocket and Kafka
        realtimeMessagingService.broadcastOddsUpdate(saved.getMatchId(), dto);
        eventPublisherService.publishEvent("fida-bet.odds.updates", saved.getMatchId(), dto);

        return dto;
    }

    @Transactional
    public List<MatchDTOs.OddsItemDto> bulkUpdateOdds(AdminDTOs.BulkOddsUpdateRequest request) {
        List<MatchDTOs.OddsItemDto> result = new ArrayList<>();
        for (AdminDTOs.SingleOddsUpdate update : request.getUpdates()) {
            result.add(updateOdds(update.getOddsId(), update.getValue(), update.getIsLocked()));
        }
        return result;
    }

    /**
     * Micro-odds simulation for realistic real-time betting experience
     * Executes every 6 seconds on active live matches
     */
    @Scheduled(fixedDelay = 6000)
    @Transactional
    public void simulateLiveOddsFluctuation() {
        List<Match> liveMatches = matchRepository.findByIsLiveTrue();
        if (liveMatches.isEmpty()) return;

        // Pick one random live match
        Match match = liveMatches.get(random.nextInt(liveMatches.size()));
        List<Odds> oddsList = oddsRepository.findByMatchId(match.getId());
        if (oddsList.isEmpty()) return;

        // Pick 1 random odds item to shift slightly
        Odds item = oddsList.get(random.nextInt(oddsList.size()));
        if (Boolean.TRUE.equals(item.getIsLocked())) return;

        double delta = (random.nextDouble() * 0.08 - 0.04);
        double currentVal = item.getValue().doubleValue();
        double newVal = Math.max(1.01, Math.round((currentVal + delta) * 100.0) / 100.0);

        BigDecimal newOddsVal = BigDecimal.valueOf(newVal).setScale(2, RoundingMode.HALF_UP);
        if (newOddsVal.compareTo(item.getValue()) != 0) {
            updateOdds(item.getId(), newOddsVal, item.getIsLocked());
        }
    }

    private MatchDTOs.OddsItemDto mapToDto(Odds o) {
        return MatchDTOs.OddsItemDto.builder()
                .id(o.getId())
                .label(o.getLabel())
                .name(o.getName())
                .marketName(o.getMarketName())
                .value(o.getValue())
                .previousValue(o.getPreviousValue())
                .trend(o.getTrend())
                .isLocked(o.getIsLocked())
                .lastUpdated(o.getLastUpdated())
                .build();
    }
}
