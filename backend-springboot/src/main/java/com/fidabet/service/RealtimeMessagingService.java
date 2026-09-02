package com.fidabet.service;

import com.fidabet.dto.MatchDTOs;
import com.fidabet.dto.WalletDTOs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RealtimeMessagingService {

    private static final Logger log = LoggerFactory.getLogger(RealtimeMessagingService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeMessagingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastOddsUpdate(String matchId, Object oddsData) {
        String destination = "/topic/match/" + matchId + "/odds";
        log.debug("Broadcasting odds update to {}", destination);
        messagingTemplate.convertAndSend(destination, oddsData);
    }

    public void broadcastScoreUpdate(String matchId, Map<String, Object> scoreData) {
        String destination = "/topic/match/" + matchId + "/score";
        log.debug("Broadcasting score update to {}", destination);
        messagingTemplate.convertAndSend(destination, scoreData);
    }

    public void broadcastMatchEvent(String matchId, MatchDTOs.LiveMatchEventDto eventDto) {
        String destination = "/topic/match/" + matchId + "/events";
        log.debug("Broadcasting match event to {}", destination);
        messagingTemplate.convertAndSend(destination, eventDto);
    }

    public void broadcastMatchStats(String matchId, MatchDTOs.MatchStatsDto statsDto) {
        String destination = "/topic/match/" + matchId + "/stats";
        log.debug("Broadcasting match stats to {}", destination);
        messagingTemplate.convertAndSend(destination, statsDto);
    }

    public void broadcastCashoutUpdate(String matchId, Object cashoutData) {
        String destination = "/topic/match/" + matchId + "/cashout";
        log.debug("Broadcasting cashout update to {}", destination);
        messagingTemplate.convertAndSend(destination, cashoutData);
    }

    public void sendUserBalanceUpdate(String userId, WalletDTOs.BalanceResponse balanceResponse) {
        String destination = "/topic/user/" + userId + "/balance";
        log.debug("Sending user balance update to {}", destination);
        messagingTemplate.convertAndSend(destination, balanceResponse);
    }

    public void sendUserBetUpdate(String userId, Object betData) {
        String destination = "/topic/user/" + userId + "/bets";
        log.debug("Sending user bet update to {}", destination);
        messagingTemplate.convertAndSend(destination, betData);
    }
}
