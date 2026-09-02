package com.fidabet.config;

import com.fidabet.model.*;
import com.fidabet.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SportRepository sportRepository;
    private final LeagueRepository leagueRepository;
    private final MatchRepository matchRepository;
    private final OddsRepository oddsRepository;
    private final MatchStatRepository matchStatRepository;
    private final MatchEventRepository matchEventRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final BetRepository betRepository;
    private final BetSelectionRepository betSelectionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            SportRepository sportRepository,
            LeagueRepository leagueRepository,
            MatchRepository matchRepository,
            OddsRepository oddsRepository,
            MatchStatRepository matchStatRepository,
            MatchEventRepository matchEventRepository,
            UserFavoriteRepository userFavoriteRepository,
            BetRepository betRepository,
            BetSelectionRepository betSelectionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sportRepository = sportRepository;
        this.leagueRepository = leagueRepository;
        this.matchRepository = matchRepository;
        this.oddsRepository = oddsRepository;
        this.matchStatRepository = matchStatRepository;
        this.matchEventRepository = matchEventRepository;
        this.userFavoriteRepository = userFavoriteRepository;
        this.betRepository = betRepository;
        this.betSelectionRepository = betSelectionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial users and data for Fida Bet...");
            seedUsers();
            seedSports();
            seedLeagues();
            seedMatches();
            seedOdds();
            seedMatchStats();
            seedMatchEvents();
            seedFavoritesAndBets();
            log.info("Initial data seeding completed successfully.");
        }
    }

    private void seedUsers() {
        User player = User.builder()
                .id("user-88319402")
                .username("Player_8831")
                .email("player8831@fidabet.com")
                .phone("+251911223344")
                .passwordHash(passwordEncoder.encode("password123"))
                .currency("ETB")
                .balance(new BigDecimal("14500.00"))
                .bonusBalance(new BigDecimal("250.00"))
                .isVerified(true)
                .isActive(true)
                .role("USER")
                .version(0L)
                .build();
        userRepository.save(player);

        User admin = User.builder()
                .id("admin-001")
                .username("Admin_Fida")
                .email("admin@fidabet.com")
                .phone("+251900000001")
                .passwordHash(passwordEncoder.encode("admin123"))
                .currency("ETB")
                .balance(new BigDecimal("100000.00"))
                .bonusBalance(BigDecimal.ZERO)
                .isVerified(true)
                .isActive(true)
                .role("ADMIN")
                .version(0L)
                .build();
        userRepository.save(admin);
    }

    private void seedSports() {
        sportRepository.save(Sport.builder().id("football").name("Football").icon("Soccer").displayOrder(1).build());
        sportRepository.save(Sport.builder().id("tennis").name("Tennis").icon("Tennis").displayOrder(2).build());
        sportRepository.save(Sport.builder().id("basketball").name("Basketball").icon("Basketball").displayOrder(3).build());
        sportRepository.save(Sport.builder().id("ice-hockey").name("Ice Hockey").icon("Activity").displayOrder(4).build());
        sportRepository.save(Sport.builder().id("volleyball").name("Volleyball").icon("CircleDot").displayOrder(5).build());
        sportRepository.save(Sport.builder().id("table-tennis").name("Table Tennis").icon("Circle").displayOrder(6).build());
        sportRepository.save(Sport.builder().id("cricket").name("Cricket").icon("Trophy").displayOrder(7).build());
        sportRepository.save(Sport.builder().id("esports").name("Esports").icon("Gamepad2").displayOrder(8).build());
    }

    private void seedLeagues() {
        leagueRepository.save(League.builder().id("arg-primera").sportId("football").name("Argentina. Primera Division").country("Argentina").build());
        leagueRepository.save(League.builder().id("ger-bundesliga").sportId("football").name("Germany. Bundesliga").country("Germany").build());
        leagueRepository.save(League.builder().id("eng-premier").sportId("football").name("England. Premier League").country("England").build());
        leagueRepository.save(League.builder().id("atp-indian-wells").sportId("tennis").name("ATP. Indian Wells, USA").country("International").build());
        leagueRepository.save(League.builder().id("usa-nba").sportId("basketball").name("USA. NBA").country("USA").build());
        leagueRepository.save(League.builder().id("nhl-regular").sportId("ice-hockey").name("NHL. Regular Season").country("USA/Canada").build());
        leagueRepository.save(League.builder().id("cs2-pgl").sportId("esports").name("CS2. PGL Major").country("International").build());
        leagueRepository.save(League.builder().id("ita-superlega").sportId("volleyball").name("Italy. SuperLega").country("Italy").build());
        leagueRepository.save(League.builder().id("icc-t20").sportId("cricket").name("ICC T20 World Cup").country("International").build());
    }

    private void seedMatches() {
        matchRepository.save(Match.builder()
                .id("arg-1")
                .matchCode("154749")
                .sportId("football")
                .leagueId("arg-primera")
                .leagueName("Argentina. Primera Division")
                .team1("Defensa y Justicia")
                .team2("Platense")
                .score1(1)
                .score2(0)
                .timeDisplay("87:08")
                .seconds(5228)
                .period("2nd half · Group Stage. Round 7")
                .isLive(true)
                .hasLiveStream(true)
                .venue("Jose Dellagiovanna (Buenos Aires)")
                .referee("Nicolas Ramirez")
                .currentAction("Defensa y Justicia dangerous attack")
                .extraMarketsCount(88)
                .status("LIVE")
                .build());

        matchRepository.save(Match.builder()
                .id("ger-1")
                .matchCode("155234")
                .sportId("football")
                .leagueId("ger-bundesliga")
                .leagueName("Germany. Bundesliga")
                .team1("Bayern München")
                .team2("Borussia Dortmund")
                .score1(2)
                .score2(0)
                .timeDisplay("62:14")
                .seconds(3734)
                .period("2nd half · Round 24")
                .isLive(true)
                .hasLiveStream(true)
                .venue("Allianz Arena (Munich)")
                .referee("Felix Zwayer")
                .currentAction("Corner kick for Bayern München")
                .extraMarketsCount(114)
                .status("LIVE")
                .build());

        matchRepository.save(Match.builder()
                .id("eng-1")
                .matchCode("155891")
                .sportId("football")
                .leagueId("eng-premier")
                .leagueName("England. Premier League")
                .team1("Arsenal")
                .team2("Manchester City")
                .score1(1)
                .score2(1)
                .timeDisplay("41:20")
                .seconds(2480)
                .period("1st half · Matchday 28")
                .isLive(true)
                .hasLiveStream(true)
                .venue("Emirates Stadium (London)")
                .referee("Michael Oliver")
                .currentAction("Ball in midfield")
                .extraMarketsCount(95)
                .status("LIVE")
                .build());

        matchRepository.save(Match.builder()
                .id("tennis-1")
                .matchCode("156102")
                .sportId("tennis")
                .leagueId("atp-indian-wells")
                .leagueName("ATP. Indian Wells, USA")
                .team1("Carlos Alcaraz")
                .team2("Jannik Sinner")
                .score1(1)
                .score2(1)
                .timeDisplay("Set 3 · 40:30")
                .seconds(4200)
                .period("Semi-Final")
                .isLive(true)
                .hasLiveStream(true)
                .venue("Stadium 1 (Indian Wells)")
                .referee("Carlos Bernardes")
                .currentAction("Break point Alcaraz")
                .extraMarketsCount(42)
                .status("LIVE")
                .build());

        matchRepository.save(Match.builder()
                .id("nba-1")
                .matchCode("156784")
                .sportId("basketball")
                .leagueId("usa-nba")
                .leagueName("USA. NBA")
                .team1("Boston Celtics")
                .team2("Los Angeles Lakers")
                .score1(88)
                .score2(82)
                .timeDisplay("07:44")
                .seconds(464)
                .period("4th Quarter")
                .isLive(true)
                .hasLiveStream(true)
                .venue("TD Garden (Boston)")
                .referee("Scott Foster")
                .currentAction("Free throw Jayson Tatum")
                .extraMarketsCount(64)
                .status("LIVE")
                .build());
    }

    private void seedOdds() {
        // arg-1 odds
        oddsRepository.save(Odds.builder().id("arg1-w1").matchId("arg-1").marketName("1X2").selectionKey("w1").label("1").name("Defensa y Justicia").value(new BigDecimal("1.11")).previousValue(new BigDecimal("1.12")).trend("down").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-x").matchId("arg-1").marketName("1X2").selectionKey("x").label("X").name("Draw").value(new BigDecimal("6.45")).previousValue(new BigDecimal("6.20")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-w2").matchId("arg-1").marketName("1X2").selectionKey("w2").label("2").name("Platense").value(new BigDecimal("24.00")).previousValue(new BigDecimal("22.00")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-x1").matchId("arg-1").marketName("Double Chance").selectionKey("x1").label("1X").name("Defensa y Justicia or Draw").value(new BigDecimal("1.01")).previousValue(new BigDecimal("1.01")).trend("same").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-12").matchId("arg-1").marketName("Double Chance").selectionKey("w12").label("12").name("Defensa y Justicia or Platense").value(new BigDecimal("1.08")).previousValue(new BigDecimal("1.08")).trend("same").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-x2").matchId("arg-1").marketName("Double Chance").selectionKey("x2").label("2X").name("Draw or Platense").value(new BigDecimal("4.90")).previousValue(new BigDecimal("4.60")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-to").matchId("arg-1").marketName("Total Goals").selectionKey("totalOver").label("Over 1.5").name("Over 1.5 Goals").value(new BigDecimal("2.38")).previousValue(new BigDecimal("2.30")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("arg1-tu").matchId("arg-1").marketName("Total Goals").selectionKey("totalUnder").label("Under 1.5").name("Under 1.5 Goals").value(new BigDecimal("1.52")).previousValue(new BigDecimal("1.55")).trend("down").isLocked(false).build());

        // ger-1 odds
        oddsRepository.save(Odds.builder().id("ger1-w1").matchId("ger-1").marketName("1X2").selectionKey("w1").label("1").name("Bayern München").value(new BigDecimal("1.30")).previousValue(new BigDecimal("1.35")).trend("down").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-x").matchId("ger-1").marketName("1X2").selectionKey("x").label("X").name("Draw").value(new BigDecimal("4.80")).previousValue(new BigDecimal("4.50")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-w2").matchId("ger-1").marketName("1X2").selectionKey("w2").label("2").name("Borussia Dortmund").value(new BigDecimal("8.50")).previousValue(new BigDecimal("7.80")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-x1").matchId("ger-1").marketName("Double Chance").selectionKey("x1").label("1X").name("Bayern München or Draw").value(new BigDecimal("1.06")).previousValue(new BigDecimal("1.06")).trend("same").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-12").matchId("ger-1").marketName("Double Chance").selectionKey("w12").label("12").name("Bayern München or Borussia Dortmund").value(new BigDecimal("1.14")).previousValue(new BigDecimal("1.14")).trend("same").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-x2").matchId("ger-1").marketName("Double Chance").selectionKey("x2").label("2X").name("Draw or Borussia Dortmund").value(new BigDecimal("3.15")).previousValue(new BigDecimal("3.00")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-to").matchId("ger-1").marketName("Total Goals").selectionKey("totalOver").label("Over 2.5").name("Over 2.5 Goals").value(new BigDecimal("1.42")).previousValue(new BigDecimal("1.40")).trend("up").isLocked(false).build());
        oddsRepository.save(Odds.builder().id("ger1-tu").matchId("ger-1").marketName("Total Goals").selectionKey("totalUnder").label("Under 2.5").name("Under 2.5 Goals").value(new BigDecimal("2.70")).previousValue(new BigDecimal("2.75")).trend("down").isLocked(false).build());
    }

    private void seedMatchStats() {
        matchStatRepository.save(MatchStat.builder()
                .id("stat-arg-1")
                .matchId("arg-1")
                .possessionTeam1(58)
                .possessionTeam2(42)
                .shotsOnTargetTeam1(6)
                .shotsOnTargetTeam2(2)
                .shotsOffTargetTeam1(8)
                .shotsOffTargetTeam2(4)
                .cornersTeam1(7)
                .cornersTeam2(3)
                .yellowCardsTeam1(2)
                .yellowCardsTeam2(3)
                .redCardsTeam1(0)
                .redCardsTeam2(0)
                .foulsTeam1(11)
                .foulsTeam2(14)
                .attacksTeam1(94)
                .attacksTeam2(72)
                .dangerousAttacksTeam1(48)
                .dangerousAttacksTeam2(29)
                .build());
    }

    private void seedMatchEvents() {
        matchEventRepository.save(MatchEvent.builder().id("evt-arg-1").matchId("arg-1").minute(34).type("goal").text("Goal! Nicolas Fernandez (Defensa y Justicia)").team(1).build());
        matchEventRepository.save(MatchEvent.builder().id("evt-arg-2").matchId("arg-1").minute(52).type("card").text("Yellow card - I. Vazquez (Platense)").team(2).build());
        matchEventRepository.save(MatchEvent.builder().id("evt-arg-3").matchId("arg-1").minute(68).type("sub").text("Substitution Platense: R. Martinez IN").team(2).build());
        matchEventRepository.save(MatchEvent.builder().id("evt-arg-4").matchId("arg-1").minute(77).type("card").text("Yellow card - K. Gutierrez (Defensa y Justicia)").team(1).build());
    }

    private void seedFavoritesAndBets() {
        userFavoriteRepository.save(UserFavorite.builder().id("fav-1").userId("user-88319402").matchId("arg-1").build());

        Bet bet = Bet.builder()
                .id("BET-849201")
                .betCode("849201")
                .userId("user-88319402")
                .type("single")
                .totalOdds(new BigDecimal("1.30"))
                .stake(new BigDecimal("100.00"))
                .potentialWin(new BigDecimal("130.00"))
                .currency("ETB")
                .status("active")
                .cashoutValue(new BigDecimal("122.50"))
                .placedAt(LocalDateTime.now().minusMinutes(10))
                .build();
        betRepository.save(bet);

        betSelectionRepository.save(BetSelection.builder()
                .id("sel-849201-1")
                .betId("BET-849201")
                .matchId("ger-1")
                .matchCode("155234")
                .league("Germany. Bundesliga")
                .matchTitle("Bayern München - Borussia Dortmund")
                .currentScore("2:0")
                .marketName("1X2")
                .selectionName("Bayern München")
                .selectionLabel("W1")
                .odds(new BigDecimal("1.30"))
                .isLive(true)
                .outcome("PENDING")
                .build());
    }
}
