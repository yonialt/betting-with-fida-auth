-- V1__initial_schema.sql
-- Fida Bet Core Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB',
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    bonus_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL,
    version BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS kyc_documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    file_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_documents(user_id);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    txn_type VARCHAR(30) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB' NOT NULL,
    status VARCHAR(20) NOT NULL,
    reference_id VARCHAR(100),
    payment_provider VARCHAR(50),
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_txn_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_reference_id ON transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_txn_created_at ON transactions(created_at);

CREATE TABLE IF NOT EXISTS sports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    display_order INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS leagues (
    id VARCHAR(100) PRIMARY KEY,
    sport_id VARCHAR(50) NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100),
    logo VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sport_id VARCHAR(50) NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    logo VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(100) PRIMARY KEY,
    match_code VARCHAR(20) NOT NULL,
    sport_id VARCHAR(50) NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    league_id VARCHAR(100) REFERENCES leagues(id),
    league_name VARCHAR(150) NOT NULL,
    team1 VARCHAR(150) NOT NULL,
    team2 VARCHAR(150) NOT NULL,
    score1 INT DEFAULT 0 NOT NULL,
    score2 INT DEFAULT 0 NOT NULL,
    time_display VARCHAR(20) DEFAULT '00:00' NOT NULL,
    seconds INT DEFAULT 0 NOT NULL,
    period VARCHAR(100),
    is_live BOOLEAN DEFAULT false NOT NULL,
    has_live_stream BOOLEAN DEFAULT false NOT NULL,
    venue VARCHAR(150),
    referee VARCHAR(150),
    current_action VARCHAR(255),
    extra_markets_count INT DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING' NOT NULL,
    start_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_sport_live ON matches(sport_id, is_live);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE TABLE IF NOT EXISTS sub_games (
    id VARCHAR(100) PRIMARY KEY,
    match_id VARCHAR(100) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    extra_markets_count INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS markets (
    id VARCHAR(100) PRIMARY KEY,
    match_id VARCHAR(100) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    market_type VARCHAR(50),
    is_locked BOOLEAN DEFAULT false NOT NULL,
    display_order INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS odds (
    id VARCHAR(100) PRIMARY KEY,
    match_id VARCHAR(100) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    market_id VARCHAR(100) REFERENCES markets(id) ON DELETE CASCADE,
    sub_game_id VARCHAR(100) REFERENCES sub_games(id) ON DELETE CASCADE,
    market_name VARCHAR(100) NOT NULL,
    selection_key VARCHAR(50) NOT NULL,
    label VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    odds_value DECIMAL(8,3) NOT NULL,
    previous_value DECIMAL(8,3),
    trend VARCHAR(10) DEFAULT 'same' NOT NULL,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    version BIGINT DEFAULT 0 NOT NULL,
    last_updated BIGINT
);

CREATE INDEX IF NOT EXISTS idx_odds_match_id ON odds(match_id);

CREATE TABLE IF NOT EXISTS bets (
    id VARCHAR(64) PRIMARY KEY,
    bet_code VARCHAR(64) UNIQUE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bet_type VARCHAR(20) NOT NULL,
    total_odds DECIMAL(10,2) NOT NULL,
    stake DECIMAL(15,2) NOT NULL,
    potential_win DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB' NOT NULL,
    status VARCHAR(20) NOT NULL,
    cashout_value DECIMAL(15,2),
    placed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bets_user_status ON bets(user_id, status);

CREATE TABLE IF NOT EXISTS bet_selections (
    id VARCHAR(64) PRIMARY KEY,
    bet_id VARCHAR(64) NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
    match_id VARCHAR(100) NOT NULL REFERENCES matches(id),
    match_code VARCHAR(20),
    league VARCHAR(150),
    match_title VARCHAR(255),
    current_score VARCHAR(50),
    market_name VARCHAR(100),
    selection_name VARCHAR(150),
    selection_label VARCHAR(50),
    odds DECIMAL(8,3) NOT NULL,
    is_live BOOLEAN DEFAULT false NOT NULL,
    outcome VARCHAR(20) DEFAULT 'PENDING' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bet_selections_bet_id ON bet_selections(bet_id);

CREATE TABLE IF NOT EXISTS match_events (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(100) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_minute INT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    event_text VARCHAR(255) NOT NULL,
    team_side INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);

CREATE TABLE IF NOT EXISTS match_stats (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(100) NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    possession_team1 INT DEFAULT 50,
    possession_team2 INT DEFAULT 50,
    shots_on_target_team1 INT DEFAULT 0,
    shots_on_target_team2 INT DEFAULT 0,
    shots_off_target_team1 INT DEFAULT 0,
    shots_off_target_team2 INT DEFAULT 0,
    corners_team1 INT DEFAULT 0,
    corners_team2 INT DEFAULT 0,
    yellow_cards_team1 INT DEFAULT 0,
    yellow_cards_team2 INT DEFAULT 0,
    red_cards_team1 INT DEFAULT 0,
    red_cards_team2 INT DEFAULT 0,
    fouls_team1 INT DEFAULT 0,
    fouls_team2 INT DEFAULT 0,
    attacks_team1 INT DEFAULT 0,
    attacks_team2 INT DEFAULT 0,
    dangerous_attacks_team1 INT DEFAULT 0,
    dangerous_attacks_team2 INT DEFAULT 0,
    set_scores_json TEXT,
    current_points VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id VARCHAR(100) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_match_favorite UNIQUE (user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_user_fav_user_id ON user_favorites(user_id);

CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    odds_format VARCHAR(20) DEFAULT 'decimal' NOT NULL,
    odds_acceptance_mode VARCHAR(20) DEFAULT 'increase' NOT NULL,
    odds_display_mode VARCHAR(20) DEFAULT 'simple' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    theme VARCHAR(20) DEFAULT 'dark' NOT NULL
);
