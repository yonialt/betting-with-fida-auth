package com.fidabet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class BetDTOs {

    public static class BetSelectionRequest {
        @NotNull(message = "Odds ID is required")
        private String id;

        @NotNull(message = "Match ID is required")
        private String matchId;

        private String matchCode;
        private String league;
        private String matchTitle;
        private String currentScore;
        private String marketName;
        private String selectionName;
        private String selectionLabel;

        @NotNull(message = "Odds value is required")
        private BigDecimal odds;

        private Boolean isLive;

        public BetSelectionRequest() {}

        public BetSelectionRequest(String id, String matchId, String matchCode, String league, String matchTitle,
                                   String currentScore, String marketName, String selectionName, String selectionLabel,
                                   BigDecimal odds, Boolean isLive) {
            this.id = id;
            this.matchId = matchId;
            this.matchCode = matchCode;
            this.league = league;
            this.matchTitle = matchTitle;
            this.currentScore = currentScore;
            this.marketName = marketName;
            this.selectionName = selectionName;
            this.selectionLabel = selectionLabel;
            this.odds = odds;
            this.isLive = isLive;
        }

        public static BetSelectionRequestBuilder builder() {
            return new BetSelectionRequestBuilder();
        }

        public static class BetSelectionRequestBuilder {
            private String id;
            private String matchId;
            private String matchCode;
            private String league;
            private String matchTitle;
            private String currentScore;
            private String marketName;
            private String selectionName;
            private String selectionLabel;
            private BigDecimal odds;
            private Boolean isLive;

            public BetSelectionRequestBuilder id(String id) { this.id = id; return this; }
            public BetSelectionRequestBuilder matchId(String matchId) { this.matchId = matchId; return this; }
            public BetSelectionRequestBuilder matchCode(String matchCode) { this.matchCode = matchCode; return this; }
            public BetSelectionRequestBuilder league(String league) { this.league = league; return this; }
            public BetSelectionRequestBuilder matchTitle(String matchTitle) { this.matchTitle = matchTitle; return this; }
            public BetSelectionRequestBuilder currentScore(String currentScore) { this.currentScore = currentScore; return this; }
            public BetSelectionRequestBuilder marketName(String marketName) { this.marketName = marketName; return this; }
            public BetSelectionRequestBuilder selectionName(String selectionName) { this.selectionName = selectionName; return this; }
            public BetSelectionRequestBuilder selectionLabel(String selectionLabel) { this.selectionLabel = selectionLabel; return this; }
            public BetSelectionRequestBuilder odds(BigDecimal odds) { this.odds = odds; return this; }
            public BetSelectionRequestBuilder isLive(Boolean isLive) { this.isLive = isLive; return this; }

            public BetSelectionRequest build() {
                return new BetSelectionRequest(id, matchId, matchCode, league, matchTitle, currentScore, marketName, selectionName, selectionLabel, odds, isLive);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getMatchId() { return matchId; }
        public void setMatchId(String matchId) { this.matchId = matchId; }

        public String getMatchCode() { return matchCode; }
        public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

        public String getLeague() { return league; }
        public void setLeague(String league) { this.league = league; }

        public String getMatchTitle() { return matchTitle; }
        public void setMatchTitle(String matchTitle) { this.matchTitle = matchTitle; }

        public String getCurrentScore() { return currentScore; }
        public void setCurrentScore(String currentScore) { this.currentScore = currentScore; }

        public String getMarketName() { return marketName; }
        public void setMarketName(String marketName) { this.marketName = marketName; }

        public String getSelectionName() { return selectionName; }
        public void setSelectionName(String selectionName) { this.selectionName = selectionName; }

        public String getSelectionLabel() { return selectionLabel; }
        public void setSelectionLabel(String selectionLabel) { this.selectionLabel = selectionLabel; }

        public BigDecimal getOdds() { return odds; }
        public void setOdds(BigDecimal odds) { this.odds = odds; }

        public Boolean getIsLive() { return isLive; }
        public void setIsLive(Boolean isLive) { this.isLive = isLive; }
    }

    public static class PlaceBetRequest {
        @NotNull(message = "Stake amount is required")
        @DecimalMin(value = "1.00", message = "Minimum stake is ETB 1.00")
        private BigDecimal stake;

        private String betType = "single";

        @NotEmpty(message = "At least one selection is required")
        private List<BetSelectionRequest> items;

        private String promoCode;

        public PlaceBetRequest() {}

        public PlaceBetRequest(BigDecimal stake, String betType, List<BetSelectionRequest> items, String promoCode) {
            this.stake = stake;
            this.betType = betType != null ? betType : "single";
            this.items = items;
            this.promoCode = promoCode;
        }

        public static PlaceBetRequestBuilder builder() {
            return new PlaceBetRequestBuilder();
        }

        public static class PlaceBetRequestBuilder {
            private BigDecimal stake;
            private String betType = "single";
            private List<BetSelectionRequest> items;
            private String promoCode;

            public PlaceBetRequestBuilder stake(BigDecimal stake) { this.stake = stake; return this; }
            public PlaceBetRequestBuilder betType(String betType) { this.betType = betType; return this; }
            public PlaceBetRequestBuilder items(List<BetSelectionRequest> items) { this.items = items; return this; }
            public PlaceBetRequestBuilder promoCode(String promoCode) { this.promoCode = promoCode; return this; }

            public PlaceBetRequest build() {
                return new PlaceBetRequest(stake, betType, items, promoCode);
            }
        }

        public BigDecimal getStake() { return stake; }
        public void setStake(BigDecimal stake) { this.stake = stake; }

        public String getBetType() { return betType; }
        public void setBetType(String betType) { this.betType = betType; }

        public List<BetSelectionRequest> getItems() { return items; }
        public void setItems(List<BetSelectionRequest> items) { this.items = items; }

        public String getPromoCode() { return promoCode; }
        public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    }

    public static class BetSlipItemDto {
        private String id;
        private String matchId;
        private String matchCode;
        private String league;
        private String matchTitle;
        private String currentScore;
        private String marketName;
        private String selectionName;
        private String selectionLabel;
        private BigDecimal odds;
        private boolean isLive;
        private BigDecimal stake;

        public BetSlipItemDto() {}

        public BetSlipItemDto(String id, String matchId, String matchCode, String league, String matchTitle,
                              String currentScore, String marketName, String selectionName, String selectionLabel,
                              BigDecimal odds, boolean isLive, BigDecimal stake) {
            this.id = id;
            this.matchId = matchId;
            this.matchCode = matchCode;
            this.league = league;
            this.matchTitle = matchTitle;
            this.currentScore = currentScore;
            this.marketName = marketName;
            this.selectionName = selectionName;
            this.selectionLabel = selectionLabel;
            this.odds = odds;
            this.isLive = isLive;
            this.stake = stake;
        }

        public static BetSlipItemDtoBuilder builder() {
            return new BetSlipItemDtoBuilder();
        }

        public static class BetSlipItemDtoBuilder {
            private String id;
            private String matchId;
            private String matchCode;
            private String league;
            private String matchTitle;
            private String currentScore;
            private String marketName;
            private String selectionName;
            private String selectionLabel;
            private BigDecimal odds;
            private boolean isLive;
            private BigDecimal stake;

            public BetSlipItemDtoBuilder id(String id) { this.id = id; return this; }
            public BetSlipItemDtoBuilder matchId(String matchId) { this.matchId = matchId; return this; }
            public BetSlipItemDtoBuilder matchCode(String matchCode) { this.matchCode = matchCode; return this; }
            public BetSlipItemDtoBuilder league(String league) { this.league = league; return this; }
            public BetSlipItemDtoBuilder matchTitle(String matchTitle) { this.matchTitle = matchTitle; return this; }
            public BetSlipItemDtoBuilder currentScore(String currentScore) { this.currentScore = currentScore; return this; }
            public BetSlipItemDtoBuilder marketName(String marketName) { this.marketName = marketName; return this; }
            public BetSlipItemDtoBuilder selectionName(String selectionName) { this.selectionName = selectionName; return this; }
            public BetSlipItemDtoBuilder selectionLabel(String selectionLabel) { this.selectionLabel = selectionLabel; return this; }
            public BetSlipItemDtoBuilder odds(BigDecimal odds) { this.odds = odds; return this; }
            public BetSlipItemDtoBuilder isLive(boolean isLive) { this.isLive = isLive; return this; }
            public BetSlipItemDtoBuilder stake(BigDecimal stake) { this.stake = stake; return this; }

            public BetSlipItemDto build() {
                return new BetSlipItemDto(id, matchId, matchCode, league, matchTitle, currentScore, marketName, selectionName, selectionLabel, odds, isLive, stake);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getMatchId() { return matchId; }
        public void setMatchId(String matchId) { this.matchId = matchId; }

        public String getMatchCode() { return matchCode; }
        public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

        public String getLeague() { return league; }
        public void setLeague(String league) { this.league = league; }

        public String getMatchTitle() { return matchTitle; }
        public void setMatchTitle(String matchTitle) { this.matchTitle = matchTitle; }

        public String getCurrentScore() { return currentScore; }
        public void setCurrentScore(String currentScore) { this.currentScore = currentScore; }

        public String getMarketName() { return marketName; }
        public void setMarketName(String marketName) { this.marketName = marketName; }

        public String getSelectionName() { return selectionName; }
        public void setSelectionName(String selectionName) { this.selectionName = selectionName; }

        public String getSelectionLabel() { return selectionLabel; }
        public void setSelectionLabel(String selectionLabel) { this.selectionLabel = selectionLabel; }

        public BigDecimal getOdds() { return odds; }
        public void setOdds(BigDecimal odds) { this.odds = odds; }

        public boolean isLive() { return isLive; }
        public void setLive(boolean live) { isLive = live; }

        public BigDecimal getStake() { return stake; }
        public void setStake(BigDecimal stake) { this.stake = stake; }
    }

    public static class BetDto {
        private String id;
        private String placedAt;
        private String type;
        private List<BetSlipItemDto> items;
        private BigDecimal totalOdds;
        private BigDecimal stake;
        private BigDecimal potentialWin;
        private String currency;
        private String status;
        private BigDecimal cashoutValue;

        public BetDto() {}

        public BetDto(String id, String placedAt, String type, List<BetSlipItemDto> items, BigDecimal totalOdds,
                      BigDecimal stake, BigDecimal potentialWin, String currency, String status, BigDecimal cashoutValue) {
            this.id = id;
            this.placedAt = placedAt;
            this.type = type;
            this.items = items;
            this.totalOdds = totalOdds;
            this.stake = stake;
            this.potentialWin = potentialWin;
            this.currency = currency;
            this.status = status;
            this.cashoutValue = cashoutValue;
        }

        public static BetDtoBuilder builder() {
            return new BetDtoBuilder();
        }

        public static class BetDtoBuilder {
            private String id;
            private String placedAt;
            private String type;
            private List<BetSlipItemDto> items;
            private BigDecimal totalOdds;
            private BigDecimal stake;
            private BigDecimal potentialWin;
            private String currency;
            private String status;
            private BigDecimal cashoutValue;

            public BetDtoBuilder id(String id) { this.id = id; return this; }
            public BetDtoBuilder placedAt(String placedAt) { this.placedAt = placedAt; return this; }
            public BetDtoBuilder type(String type) { this.type = type; return this; }
            public BetDtoBuilder items(List<BetSlipItemDto> items) { this.items = items; return this; }
            public BetDtoBuilder totalOdds(BigDecimal totalOdds) { this.totalOdds = totalOdds; return this; }
            public BetDtoBuilder stake(BigDecimal stake) { this.stake = stake; return this; }
            public BetDtoBuilder potentialWin(BigDecimal potentialWin) { this.potentialWin = potentialWin; return this; }
            public BetDtoBuilder currency(String currency) { this.currency = currency; return this; }
            public BetDtoBuilder status(String status) { this.status = status; return this; }
            public BetDtoBuilder cashoutValue(BigDecimal cashoutValue) { this.cashoutValue = cashoutValue; return this; }

            public BetDto build() {
                return new BetDto(id, placedAt, type, items, totalOdds, stake, potentialWin, currency, status, cashoutValue);
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getPlacedAt() { return placedAt; }
        public void setPlacedAt(String placedAt) { this.placedAt = placedAt; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public List<BetSlipItemDto> getItems() { return items; }
        public void setItems(List<BetSlipItemDto> items) { this.items = items; }

        public BigDecimal getTotalOdds() { return totalOdds; }
        public void setTotalOdds(BigDecimal totalOdds) { this.totalOdds = totalOdds; }

        public BigDecimal getStake() { return stake; }
        public void setStake(BigDecimal stake) { this.stake = stake; }

        public BigDecimal getPotentialWin() { return potentialWin; }
        public void setPotentialWin(BigDecimal potentialWin) { this.potentialWin = potentialWin; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public BigDecimal getCashoutValue() { return cashoutValue; }
        public void setCashoutValue(BigDecimal cashoutValue) { this.cashoutValue = cashoutValue; }
    }

    public static class CashoutResponse {
        private String betId;
        private BigDecimal cashoutAmount;
        private BigDecimal newBalance;
        private String currency;
        private String message;

        public CashoutResponse() {}

        public CashoutResponse(String betId, BigDecimal cashoutAmount, BigDecimal newBalance, String currency, String message) {
            this.betId = betId;
            this.cashoutAmount = cashoutAmount;
            this.newBalance = newBalance;
            this.currency = currency;
            this.message = message;
        }

        public static CashoutResponseBuilder builder() {
            return new CashoutResponseBuilder();
        }

        public static class CashoutResponseBuilder {
            private String betId;
            private BigDecimal cashoutAmount;
            private BigDecimal newBalance;
            private String currency;
            private String message;

            public CashoutResponseBuilder betId(String betId) { this.betId = betId; return this; }
            public CashoutResponseBuilder cashoutAmount(BigDecimal cashoutAmount) { this.cashoutAmount = cashoutAmount; return this; }
            public CashoutResponseBuilder newBalance(BigDecimal newBalance) { this.newBalance = newBalance; return this; }
            public CashoutResponseBuilder currency(String currency) { this.currency = currency; return this; }
            public CashoutResponseBuilder message(String message) { this.message = message; return this; }

            public CashoutResponse build() {
                return new CashoutResponse(betId, cashoutAmount, newBalance, currency, message);
            }
        }

        public String getBetId() { return betId; }
        public void setBetId(String betId) { this.betId = betId; }

        public BigDecimal getCashoutAmount() { return cashoutAmount; }
        public void setCashoutAmount(BigDecimal cashoutAmount) { this.cashoutAmount = cashoutAmount; }

        public BigDecimal getNewBalance() { return newBalance; }
        public void setNewBalance(BigDecimal newBalance) { this.newBalance = newBalance; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class CashoutValueResponse {
        private String betId;
        private BigDecimal cashoutValue;
        private boolean isEligible;

        public CashoutValueResponse() {}

        public CashoutValueResponse(String betId, BigDecimal cashoutValue, boolean isEligible) {
            this.betId = betId;
            this.cashoutValue = cashoutValue;
            this.isEligible = isEligible;
        }

        public static CashoutValueResponseBuilder builder() {
            return new CashoutValueResponseBuilder();
        }

        public static class CashoutValueResponseBuilder {
            private String betId;
            private BigDecimal cashoutValue;
            private boolean isEligible;

            public CashoutValueResponseBuilder betId(String betId) { this.betId = betId; return this; }
            public CashoutValueResponseBuilder cashoutValue(BigDecimal cashoutValue) { this.cashoutValue = cashoutValue; return this; }
            public CashoutValueResponseBuilder isEligible(boolean isEligible) { this.isEligible = isEligible; return this; }

            public CashoutValueResponse build() {
                return new CashoutValueResponse(betId, cashoutValue, isEligible);
            }
        }

        public String getBetId() { return betId; }
        public void setBetId(String betId) { this.betId = betId; }

        public BigDecimal getCashoutValue() { return cashoutValue; }
        public void setCashoutValue(BigDecimal cashoutValue) { this.cashoutValue = cashoutValue; }

        public boolean isEligible() { return isEligible; }
        public void setEligible(boolean eligible) { isEligible = eligible; }
    }
}
