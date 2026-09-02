package com.fidabet.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fidabet.dto.MatchDTOs;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.model.*;
import com.fidabet.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    private final MatchRepository matchRepository;
    private final OddsRepository oddsRepository;
    private final MarketRepository marketRepository;
    private final SubGameRepository subGameRepository;
    private final MatchStatRepository matchStatRepository;
    private final MatchEventRepository matchEventRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final ObjectMapper objectMapper;

    public MatchService(
            MatchRepository matchRepository,
            OddsRepository oddsRepository,
            MarketRepository marketRepository,
            SubGameRepository subGameRepository,
            MatchStatRepository matchStatRepository,
            MatchEventRepository matchEventRepository,
            UserFavoriteRepository userFavoriteRepository,
            ObjectMapper objectMapper) {
        this.matchRepository = matchRepository;
        this.oddsRepository = oddsRepository;
        this.marketRepository = marketRepository;
        this.subGameRepository = subGameRepository;
        this.matchStatRepository = matchStatRepository;
        this.matchEventRepository = matchEventRepository;
        this.userFavoriteRepository = userFavoriteRepository;
        this.objectMapper = objectMapper;
    }

    public List<MatchDTOs.MatchDto> getLiveMatches(String sport, String userId) {
        List<Match> matches = (sport != null && !sport.equalsIgnoreCase("all"))
                ? matchRepository.findBySportIdAndIsLiveTrue(sport.toLowerCase())
                : matchRepository.findByIsLiveTrue();

        Set<String> favorites = getUserFavoriteMatchIds(userId);
        return matches.stream()
                .map(m -> mapToMatchDto(m, favorites.contains(m.getId())))
                .collect(Collectors.toList());
    }

    public Page<MatchDTOs.MatchDto> getUpcomingMatches(String sport, Pageable pageable, String userId) {
        Page<Match> matches = (sport != null && !sport.equalsIgnoreCase("all"))
                ? matchRepository.findBySportIdAndIsLiveFalseAndStatus(sport.toLowerCase(), "UPCOMING", pageable)
                : matchRepository.findByIsLiveFalseAndStatus("UPCOMING", pageable);

        Set<String> favorites = getUserFavoriteMatchIds(userId);
        return matches.map(m -> mapToMatchDto(m, favorites.contains(m.getId())));
    }

    public MatchDTOs.MatchDto getMatchDetails(String matchId, String userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + matchId));

        boolean isFavorite = userId != null && userFavoriteRepository.existsByUserIdAndMatchId(userId, matchId);
        return mapToMatchDto(match, isFavorite);
    }

    public List<MatchDTOs.MarketGroupDto> getMatchMarkets(String matchId) {
        List<Odds> allOdds = oddsRepository.findByMatchId(matchId);
        Map<String, List<Odds>> grouped = allOdds.stream()
                .collect(Collectors.groupingBy(Odds::getMarketName, LinkedHashMap::new, Collectors.toList()));

        List<MatchDTOs.MarketGroupDto> groups = new ArrayList<>();
        int index = 1;
        for (Map.Entry<String, List<Odds>> entry : grouped.entrySet()) {
            List<MatchDTOs.OddsItemDto> items = entry.getValue().stream()
                    .map(this::mapToOddsItemDto)
                    .collect(Collectors.toList());

            groups.add(MatchDTOs.MarketGroupDto.builder()
                    .id("market-" + index++)
                    .name(entry.getKey())
                    .items(items)
                    .build());
        }
        return groups;
    }

    public MatchDTOs.MatchStatsDto getMatchStats(String matchId) {
        return matchStatRepository.findByMatchId(matchId)
                .map(this::mapToStatsDto)
                .orElse(null);
    }

    public List<MatchDTOs.LiveMatchEventDto> getMatchEvents(String matchId) {
        return matchEventRepository.findByMatchIdOrderByMinuteAsc(matchId).stream()
                .map(this::mapToEventDto)
                .collect(Collectors.toList());
    }

    public List<MatchDTOs.MatchDto> searchMatches(String query, String userId) {
        if (query == null || query.isBlank()) return Collections.emptyList();
        Set<String> favorites = getUserFavoriteMatchIds(userId);
        return matchRepository.searchMatches(query).stream()
                .map(m -> mapToMatchDto(m, favorites.contains(m.getId())))
                .collect(Collectors.toList());
    }

    private Set<String> getUserFavoriteMatchIds(String userId) {
        if (userId == null) return Collections.emptySet();
        return userFavoriteRepository.findByUserId(userId).stream()
                .map(UserFavorite::getMatchId)
                .collect(Collectors.toSet());
    }

    public MatchDTOs.MatchDto mapToMatchDto(Match match, boolean isFavorite) {
        List<Odds> oddsList = oddsRepository.findByMatchId(match.getId());
        MatchDTOs.QuickOddsDto quickOdds = buildQuickOdds(oddsList);
        List<MatchDTOs.MarketGroupDto> allMarkets = getMatchMarkets(match.getId());
        MatchDTOs.MatchStatsDto stats = getMatchStats(match.getId());
        List<MatchDTOs.LiveMatchEventDto> events = getMatchEvents(match.getId());
        List<MatchDTOs.SubGameDto> subGames = getSubGames(match.getId());

        return MatchDTOs.MatchDto.builder()
                .id(match.getId())
                .matchCode(match.getMatchCode())
                .sport(match.getSportId())
                .league(match.getLeagueName())
                .team1(match.getTeam1())
                .team2(match.getTeam2())
                .score1(match.getScore1())
                .score2(match.getScore2())
                .timeDisplay(match.getTimeDisplay())
                .seconds(match.getSeconds())
                .period(match.getPeriod())
                .isLive(match.getIsLive())
                .hasLiveStream(match.getHasLiveStream())
                .isFavorite(isFavorite)
                .extraMarketsCount(match.getExtraMarketsCount())
                .venue(match.getVenue())
                .referee(match.getReferee())
                .currentAction(match.getCurrentAction())
                .odds(quickOdds)
                .allMarkets(allMarkets)
                .stats(stats)
                .events(events)
                .subGames(subGames)
                .build();
    }

    private MatchDTOs.QuickOddsDto buildQuickOdds(List<Odds> oddsList) {
        Map<String, Odds> keyMap = oddsList.stream()
                .collect(Collectors.toMap(Odds::getSelectionKey, o -> o, (o1, o2) -> o1));

        return MatchDTOs.QuickOddsDto.builder()
                .w1(mapToOddsItemDto(keyMap.get("w1")))
                .x(mapToOddsItemDto(keyMap.get("x")))
                .w2(mapToOddsItemDto(keyMap.get("w2")))
                .x1(mapToOddsItemDto(keyMap.get("x1")))
                .x2(mapToOddsItemDto(keyMap.get("x2")))
                .w12(mapToOddsItemDto(keyMap.get("w12")))
                .totalOver(mapToOddsItemDto(keyMap.get("totalOver")))
                .totalUnder(mapToOddsItemDto(keyMap.get("totalUnder")))
                .totalVal("2.5")
                .build();
    }

    public MatchDTOs.OddsItemDto mapToOddsItemDto(Odds o) {
        if (o == null) return null;
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

    private MatchDTOs.MatchStatsDto mapToStatsDto(MatchStat s) {
        List<String> setScores = null;
        if (s.getSetScoresJson() != null) {
            try {
                setScores = objectMapper.readValue(s.getSetScoresJson(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        return MatchDTOs.MatchStatsDto.builder()
                .possession(new int[]{s.getPossessionTeam1() != null ? s.getPossessionTeam1() : 50, s.getPossessionTeam2() != null ? s.getPossessionTeam2() : 50})
                .shotsOnTarget(new int[]{s.getShotsOnTargetTeam1() != null ? s.getShotsOnTargetTeam1() : 0, s.getShotsOnTargetTeam2() != null ? s.getShotsOnTargetTeam2() : 0})
                .shotsOffTarget(new int[]{s.getShotsOffTargetTeam1() != null ? s.getShotsOffTargetTeam1() : 0, s.getShotsOffTargetTeam2() != null ? s.getShotsOffTargetTeam2() : 0})
                .corners(new int[]{s.getCornersTeam1() != null ? s.getCornersTeam1() : 0, s.getCornersTeam2() != null ? s.getCornersTeam2() : 0})
                .yellowCards(new int[]{s.getYellowCardsTeam1() != null ? s.getYellowCardsTeam1() : 0, s.getYellowCardsTeam2() != null ? s.getYellowCardsTeam2() : 0})
                .redCards(new int[]{s.getRedCardsTeam1() != null ? s.getRedCardsTeam1() : 0, s.getRedCardsTeam2() != null ? s.getRedCardsTeam2() : 0})
                .fouls(new int[]{s.getFoulsTeam1() != null ? s.getFoulsTeam1() : 0, s.getFoulsTeam2() != null ? s.getFoulsTeam2() : 0})
                .attacks(new int[]{s.getAttacksTeam1() != null ? s.getAttacksTeam1() : 0, s.getAttacksTeam2() != null ? s.getAttacksTeam2() : 0})
                .dangerousAttacks(new int[]{s.getDangerousAttacksTeam1() != null ? s.getDangerousAttacksTeam1() : 0, s.getDangerousAttacksTeam2() != null ? s.getDangerousAttacksTeam2() : 0})
                .setScores(setScores)
                .currentPoints(s.getCurrentPoints())
                .build();
    }

    private MatchDTOs.LiveMatchEventDto mapToEventDto(MatchEvent e) {
        return MatchDTOs.LiveMatchEventDto.builder()
                .minute(e.getMinute())
                .type(e.getType())
                .text(e.getText())
                .team(e.getTeam())
                .build();
    }

    private List<MatchDTOs.SubGameDto> getSubGames(String matchId) {
        return subGameRepository.findByMatchId(matchId).stream()
                .map(sg -> MatchDTOs.SubGameDto.builder()
                        .id(sg.getId())
                        .name(sg.getName())
                        .extraMarketsCount(sg.getExtraMarketsCount())
                        .build())
                .collect(Collectors.toList());
    }
}
