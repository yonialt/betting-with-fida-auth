package com.fidabet.service;

import com.fidabet.dto.AdminDTOs;
import com.fidabet.dto.BetDTOs;
import com.fidabet.dto.MatchDTOs;
import com.fidabet.dto.WalletDTOs;
import com.fidabet.exception.ResourceNotFoundException;
import com.fidabet.model.*;
import com.fidabet.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final MatchRepository matchRepository;
    private final OddsRepository oddsRepository;
    private final UserRepository userRepository;
    private final BetRepository betRepository;
    private final BetSelectionRepository betSelectionRepository;
    private final TransactionRepository transactionRepository;
    private final RealtimeMessagingService realtimeMessagingService;
    private final EventPublisherService eventPublisherService;
    private final MatchService matchService;
    private final OddsService oddsService;

    public AdminService(
            MatchRepository matchRepository,
            OddsRepository oddsRepository,
            UserRepository userRepository,
            BetRepository betRepository,
            BetSelectionRepository betSelectionRepository,
            TransactionRepository transactionRepository,
            RealtimeMessagingService realtimeMessagingService,
            EventPublisherService eventPublisherService,
            MatchService matchService,
            OddsService oddsService) {
        this.matchRepository = matchRepository;
        this.oddsRepository = oddsRepository;
        this.userRepository = userRepository;
        this.betRepository = betRepository;
        this.betSelectionRepository = betSelectionRepository;
        this.transactionRepository = transactionRepository;
        this.realtimeMessagingService = realtimeMessagingService;
        this.eventPublisherService = eventPublisherService;
        this.matchService = matchService;
        this.oddsService = oddsService;
    }

    public Page<MatchDTOs.MatchDto> getAllMatches(Pageable pageable) {
        return matchRepository.findAll(pageable)
                .map(m -> matchService.mapToMatchDto(m, false));
    }

    @Transactional
    public MatchDTOs.MatchDto createMatch(AdminDTOs.CreateMatchRequest request) {
        String id = "match-" + UUID.randomUUID().toString().substring(0, 8);
        Match match = Match.builder()
                .id(id)
                .matchCode(request.getMatchCode())
                .sportId(request.getSportId())
                .leagueId(request.getLeagueId())
                .leagueName(request.getLeagueName())
                .team1(request.getTeam1())
                .team2(request.getTeam2())
                .score1(0)
                .score2(0)
                .timeDisplay("00:00")
                .seconds(0)
                .isLive(false)
                .hasLiveStream(false)
                .venue(request.getVenue())
                .referee(request.getReferee())
                .status("UPCOMING")
                .startTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now().plusDays(1))
                .extraMarketsCount(0)
                .build();

        Match saved = matchRepository.save(match);
        log.info("Admin created new match: {} vs {}", saved.getTeam1(), saved.getTeam2());
        return matchService.mapToMatchDto(saved, false);
    }

    @Transactional
    public MatchDTOs.MatchDto updateMatchScore(String matchId, AdminDTOs.UpdateMatchScoreRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        match.setScore1(request.getScore1());
        match.setScore2(request.getScore2());
        if (request.getTimeDisplay() != null) match.setTimeDisplay(request.getTimeDisplay());
        if (request.getPeriod() != null) match.setPeriod(request.getPeriod());
        if (request.getCurrentAction() != null) match.setCurrentAction(request.getCurrentAction());

        Match saved = matchRepository.save(match);

        // Broadcast score update to WebSocket
        Map<String, Object> scoreMap = Map.of(
                "matchId", matchId,
                "score1", match.getScore1(),
                "score2", match.getScore2(),
                "timeDisplay", match.getTimeDisplay(),
                "period", match.getPeriod() != null ? match.getPeriod() : "",
                "currentAction", match.getCurrentAction() != null ? match.getCurrentAction() : ""
        );
        realtimeMessagingService.broadcastScoreUpdate(matchId, scoreMap);
        eventPublisherService.publishEvent("fida-bet.match.score", matchId, scoreMap);

        return matchService.mapToMatchDto(saved, false);
    }

    @Transactional
    public MatchDTOs.MatchDto updateMatchStatus(String matchId, AdminDTOs.UpdateMatchStatusRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        match.setStatus(request.getStatus().toUpperCase());
        if (request.getIsLive() != null) {
            match.setIsLive(request.getIsLive());
        }

        Match saved = matchRepository.save(match);
        eventPublisherService.publishEvent("fida-bet.match.status", matchId, saved);

        return matchService.mapToMatchDto(saved, false);
    }

    public Page<AdminDTOs.AdminUserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(u -> AdminDTOs.AdminUserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .phone(u.getPhone())
                .balance(u.getBalance())
                .bonusBalance(u.getBonusBalance())
                .isVerified(u.getIsVerified())
                .isActive(u.getIsActive())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .build());
    }

    public AdminDTOs.AdminUserDto getUserById(String userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return AdminDTOs.AdminUserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .phone(u.getPhone())
                .balance(u.getBalance())
                .bonusBalance(u.getBonusBalance())
                .isVerified(u.getIsVerified())
                .isActive(u.getIsActive())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .build();
    }

    @Transactional
    public AdminDTOs.AdminUserDto adjustUserBalance(String userId, BigDecimal newBalance) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        u.setBalance(newBalance);
        User saved = userRepository.save(u);

        realtimeMessagingService.sendUserBalanceUpdate(userId, WalletDTOs.BalanceResponse.builder()
                .userId(userId)
                .balance(saved.getBalance())
                .bonusBalance(saved.getBonusBalance())
                .currency(saved.getCurrency())
                .build());

        return getUserById(userId);
    }

    public Page<WalletDTOs.TransactionDto> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByCreatedAtDesc(pageable).map(t -> WalletDTOs.TransactionDto.builder()
                .id(t.getId())
                .transactionId(t.getTransactionId())
                .type(t.getType())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .status(t.getStatus())
                .referenceId(t.getReferenceId())
                .paymentProvider(t.getPaymentProvider())
                .createdAt(t.getCreatedAt())
                .build());
    }

    @Transactional
    public WalletDTOs.TransactionDto approveTransaction(String transactionId) {
        Transaction txn = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        txn.setStatus("COMPLETED");
        Transaction saved = transactionRepository.save(txn);
        return WalletDTOs.TransactionDto.builder()
                .id(saved.getId())
                .transactionId(saved.getTransactionId())
                .type(saved.getType())
                .amount(saved.getAmount())
                .currency(saved.getCurrency())
                .status(saved.getStatus())
                .referenceId(saved.getReferenceId())
                .paymentProvider(saved.getPaymentProvider())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public AdminDTOs.AdminReportDto getDailyReport() {
        List<Bet> allBets = betRepository.findAll();
        long totalBets = allBets.size();
        BigDecimal totalVolume = allBets.stream().map(Bet::getStake).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPayout = allBets.stream()
                .filter(b -> "won".equalsIgnoreCase(b.getStatus()) || "cashed_out".equalsIgnoreCase(b.getStatus()))
                .map(b -> "won".equalsIgnoreCase(b.getStatus()) ? b.getPotentialWin() : b.getCashoutValue() != null ? b.getCashoutValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal ggr = totalVolume.subtract(totalPayout);
        long activeUsers = userRepository.count();

        return AdminDTOs.AdminReportDto.builder()
                .date(LocalDate.now().toString())
                .totalBets(totalBets)
                .totalVolume(totalVolume)
                .totalPayout(totalPayout)
                .grossGamingRevenue(ggr)
                .activeUsers(activeUsers)
                .additionalMetrics(Map.of("currency", "ETB", "margin", totalVolume.compareTo(BigDecimal.ZERO) > 0 ? ggr.divide(totalVolume, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal(100)) + "%" : "0%"))
                .build();
    }
}
