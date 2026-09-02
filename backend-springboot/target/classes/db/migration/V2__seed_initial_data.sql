-- V2__seed_initial_data.sql
-- Seed sports, leagues, default users, initial matches, odds, stats, events

-- Seed Default Users
-- BCrypt hash for 'password123' is $2a$10$wN3tVqS0lXpW4K/xVvGqEuV8jN4QZ1Wb9vH.iW9r4kK8sL0b1gW7e (or generic bcrypt standard)
-- Password for Player_8831: password123 ($2a$10$7EqJtq98hPqEX7fNZaFWoOhiM5895r9e8mN14Ua9Xl2K8g.iW0iTG)
-- Password for Admin_Fida: admin123 ($2a$10$7EqJtq98hPqEX7fNZaFWoOhiM5895r9e8mN14Ua9Xl2K8g.iW0iTG)

INSERT INTO users (id, username, email, phone, password_hash, currency, balance, bonus_balance, is_verified, is_active, role, version)
VALUES 
('user-88319402', 'Player_8831', 'player8831@fidabet.com', '+251911223344', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ETB', 14500.00, 250.00, true, true, 'USER', 0),
('admin-001', 'Admin_Fida', 'admin@fidabet.com', '+251900000001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ETB', 100000.00, 0.00, true, true, 'ADMIN', 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Sports
INSERT INTO sports (id, name, icon, display_order) VALUES
('football', 'Football', 'Soccer', 1),
('tennis', 'Tennis', 'Tennis', 2),
('basketball', 'Basketball', 'Basketball', 3),
('ice-hockey', 'Ice Hockey', 'Activity', 4),
('volleyball', 'Volleyball', 'CircleDot', 5),
('table-tennis', 'Table Tennis', 'Circle', 6),
('cricket', 'Cricket', 'Trophy', 7),
('esports', 'Esports', 'Gamepad2', 8)
ON CONFLICT (id) DO NOTHING;

-- Seed Leagues
INSERT INTO leagues (id, sport_id, name, country) VALUES
('arg-primera', 'football', 'Argentina. Primera Division', 'Argentina'),
('ger-bundesliga', 'football', 'Germany. Bundesliga', 'Germany'),
('eng-premier', 'football', 'England. Premier League', 'England'),
('atp-indian-wells', 'tennis', 'ATP. Indian Wells, USA', 'International'),
('usa-nba', 'basketball', 'USA. NBA', 'USA'),
('nhl-regular', 'ice-hockey', 'NHL. Regular Season', 'USA/Canada'),
('cs2-pgl', 'esports', 'CS2. PGL Major', 'International'),
('ita-superlega', 'volleyball', 'Italy. SuperLega', 'Italy'),
('icc-t20', 'cricket', 'ICC T20 World Cup', 'International')
ON CONFLICT (id) DO NOTHING;

-- Seed Matches
INSERT INTO matches (id, match_code, sport_id, league_id, league_name, team1, team2, score1, score2, time_display, seconds, period, is_live, has_live_stream, venue, referee, current_action, extra_markets_count, status)
VALUES
('arg-1', '154749', 'football', 'arg-primera', 'Argentina. Primera Division', 'Defensa y Justicia', 'Platense', 1, 0, '87:08', 5228, '2nd half · Group Stage. Round 7', true, true, 'Jose Dellagiovanna (Buenos Aires)', 'Nicolas Ramirez', 'Defensa y Justicia dangerous attack', 88, 'LIVE'),
('ger-1', '155234', 'football', 'ger-bundesliga', 'Germany. Bundesliga', 'Bayern München', 'Borussia Dortmund', 2, 0, '62:14', 3734, '2nd half · Round 24', true, true, 'Allianz Arena (Munich)', 'Felix Zwayer', 'Corner kick for Bayern München', 114, 'LIVE'),
('eng-1', '155891', 'football', 'eng-premier', 'England. Premier League', 'Arsenal', 'Manchester City', 1, 1, '41:20', 2480, '1st half · Matchday 28', true, true, 'Emirates Stadium (London)', 'Michael Oliver', 'Ball in midfield', 95, 'LIVE'),
('tennis-1', '156102', 'tennis', 'atp-indian-wells', 'ATP. Indian Wells, USA', 'Carlos Alcaraz', 'Jannik Sinner', 1, 1, 'Set 3 · 40:30', 4200, 'Semi-Final', true, true, 'Stadium 1 (Indian Wells)', 'Carlos Bernardes', 'Break point Alcaraz', 42, 'LIVE'),
('nba-1', '156784', 'basketball', 'usa-nba', 'USA. NBA', 'Boston Celtics', 'Los Angeles Lakers', 88, 82, '07:44', 464, '4th Quarter', true, true, 'TD Garden (Boston)', 'Scott Foster', 'Free throw Jayson Tatum', 64, 'LIVE'),
('nhl-1', '157291', 'ice-hockey', 'nhl-regular', 'NHL. Regular Season', 'Edmonton Oilers', 'Florida Panthers', 3, 2, '14:22', 862, '3rd Period', true, true, 'Rogers Place (Edmonton)', 'Kelly Sutherland', 'Power play Oilers', 52, 'LIVE'),
('esports-1', '158302', 'esports', 'cs2-pgl', 'CS2. PGL Major', 'Natus Vincere', 'FaZe Clan', 11, 9, 'Map 2 · Round 21', 1260, 'Grand Final (Best of 3)', true, true, 'Royal Arena (Copenhagen)', 'PGL Official', 'Bomb planted on A site', 38, 'LIVE'),
('volleyball-1', '159114', 'volleyball', 'ita-superlega', 'Italy. SuperLega', 'Trentino Volley', 'Sir Safety Perugia', 2, 1, 'Set 4 · 18:16', 3600, 'Regular Season', true, false, 'il T quotidiano Arena (Trento)', 'Stefano Cesare', 'Spike Trentino', 30, 'LIVE'),
('cricket-1', '160442', 'cricket', 'icc-t20', 'ICC T20 World Cup', 'India', 'Australia', 142, 118, '16.4 Overs', 4800, 'Super 8 Match', true, true, 'Kensington Oval (Barbados)', 'Richard Kettleborough', 'Boundary 4 runs India', 45, 'LIVE')
ON CONFLICT (id) DO NOTHING;

-- Seed Odds for Match arg-1
INSERT INTO odds (id, match_id, market_name, selection_key, label, name, odds_value, previous_value, trend, is_locked, version) VALUES
('arg1-w1', 'arg-1', '1X2', 'w1', '1', 'Defensa y Justicia', 1.11, 1.12, 'down', false, 0),
('arg1-x',  'arg-1', '1X2', 'x',  'X', 'Draw', 6.45, 6.20, 'up', false, 0),
('arg1-w2', 'arg-1', '1X2', 'w2', '2', 'Platense', 24.00, 22.00, 'up', false, 0),
('arg1-x1', 'arg-1', 'Double Chance', 'x1', '1X', 'Defensa y Justicia or Draw', 1.01, 1.01, 'same', false, 0),
('arg1-12', 'arg-1', 'Double Chance', 'w12', '12', 'Defensa y Justicia or Platense', 1.08, 1.08, 'same', false, 0),
('arg1-x2', 'arg-1', 'Double Chance', 'x2', '2X', 'Draw or Platense', 4.90, 4.60, 'up', false, 0),
('arg1-to', 'arg-1', 'Total Goals', 'totalOver', 'Over 1.5', 'Over 1.5 Goals', 2.38, 2.30, 'up', false, 0),
('arg1-tu', 'arg-1', 'Total Goals', 'totalUnder', 'Under 1.5', 'Under 1.5 Goals', 1.52, 1.55, 'down', false, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Odds for Match ger-1
INSERT INTO odds (id, match_id, market_name, selection_key, label, name, odds_value, previous_value, trend, is_locked, version) VALUES
('ger1-w1', 'ger-1', '1X2', 'w1', '1', 'Bayern München', 1.30, 1.35, 'down', false, 0),
('ger1-x',  'ger-1', '1X2', 'x',  'X', 'Draw', 4.80, 4.50, 'up', false, 0),
('ger1-w2', 'ger-1', '1X2', 'w2', '2', 'Borussia Dortmund', 8.50, 7.80, 'up', false, 0),
('ger1-x1', 'ger-1', 'Double Chance', 'x1', '1X', 'Bayern München or Draw', 1.06, 1.06, 'same', false, 0),
('ger1-12', 'ger-1', 'Double Chance', 'w12', '12', 'Bayern München or Borussia Dortmund', 1.14, 1.14, 'same', false, 0),
('ger1-x2', 'ger-1', 'Double Chance', 'x2', '2X', 'Draw or Borussia Dortmund', 3.15, 3.00, 'up', false, 0),
('ger1-to', 'ger-1', 'Total Goals', 'totalOver', 'Over 2.5', 'Over 2.5 Goals', 1.42, 1.40, 'up', false, 0),
('ger1-tu', 'ger-1', 'Total Goals', 'totalUnder', 'Under 2.5', 'Under 2.5 Goals', 2.70, 2.75, 'down', false, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Odds for Match eng-1
INSERT INTO odds (id, match_id, market_name, selection_key, label, name, odds_value, previous_value, trend, is_locked, version) VALUES
('eng1-w1', 'eng-1', '1X2', 'w1', '1', 'Arsenal', 2.45, 2.40, 'up', false, 0),
('eng1-x',  'eng-1', '1X2', 'x',  'X', 'Draw', 3.10, 3.10, 'same', false, 0),
('eng1-w2', 'eng-1', '1X2', 'w2', '2', 'Manchester City', 2.80, 2.85, 'down', false, 0),
('eng1-x1', 'eng-1', 'Double Chance', 'x1', '1X', 'Arsenal or Draw', 1.38, 1.38, 'same', false, 0),
('eng1-12', 'eng-1', 'Double Chance', 'w12', '12', 'Arsenal or Manchester City', 1.32, 1.32, 'same', false, 0),
('eng1-x2', 'eng-1', 'Double Chance', 'x2', '2X', 'Draw or Manchester City', 1.48, 1.50, 'down', false, 0),
('eng1-to', 'eng-1', 'Total Goals', 'totalOver', 'Over 2.5', 'Over 2.5 Goals', 1.85, 1.82, 'up', false, 0),
('eng1-tu', 'eng-1', 'Total Goals', 'totalUnder', 'Under 2.5', 'Under 2.5 Goals', 1.95, 1.98, 'down', false, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Match Stats for arg-1
INSERT INTO match_stats (id, match_id, possession_team1, possession_team2, shots_on_target_team1, shots_on_target_team2, shots_off_target_team1, shots_off_target_team2, corners_team1, corners_team2, yellow_cards_team1, yellow_cards_team2, red_cards_team1, red_cards_team2, fouls_team1, fouls_team2, attacks_team1, attacks_team2, dangerous_attacks_team1, dangerous_attacks_team2)
VALUES ('stat-arg-1', 'arg-1', 58, 42, 6, 2, 8, 4, 7, 3, 2, 3, 0, 0, 11, 14, 94, 72, 48, 29)
ON CONFLICT (id) DO NOTHING;

-- Seed Match Events for arg-1
INSERT INTO match_events (id, match_id, event_minute, event_type, event_text, team_side) VALUES
('evt-arg-1', 'arg-1', 34, 'goal', 'Goal! Nicolas Fernandez (Defensa y Justicia)', 1),
('evt-arg-2', 'arg-1', 52, 'card', 'Yellow card - I. Vazquez (Platense)', 2),
('evt-arg-3', 'arg-1', 68, 'sub', 'Substitution Platense: R. Martinez IN', 2),
('evt-arg-4', 'arg-1', 77, 'card', 'Yellow card - K. Gutierrez (Defensa y Justicia)', 1)
ON CONFLICT (id) DO NOTHING;

-- Seed User Initial Favorites
INSERT INTO user_favorites (id, user_id, match_id) VALUES
('fav-1', 'user-88319402', 'arg-1')
ON CONFLICT (user_id, match_id) DO NOTHING;

-- Seed User Initial Placed Bet
INSERT INTO bets (id, bet_code, user_id, bet_type, total_odds, stake, potential_win, currency, status, cashout_value, placed_at)
VALUES ('BET-849201', '849201', 'user-88319402', 'single', 1.30, 100.00, 130.00, 'ETB', 'active', 122.50, CURRENT_TIMESTAMP - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bet_selections (id, bet_id, match_id, match_code, league, match_title, current_score, market_name, selection_name, selection_label, odds, is_live, outcome)
VALUES ('sel-849201-1', 'BET-849201', 'ger-1', '155234', 'Germany. Bundesliga', 'Bayern München - Borussia Dortmund', '2:0', '1X2', 'Bayern München', 'W1', 1.30, true, 'PENDING')
ON CONFLICT (id) DO NOTHING;
