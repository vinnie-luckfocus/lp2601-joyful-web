-- Joyful Baseball League - Initial Database Schema
-- PostgreSQL 15+
-- Created: 2026-04-08

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TEAMS TABLE
-- Stores team information (A队, B队, etc.)
-- ============================================
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    division VARCHAR(50), -- '大联盟' (Major League) / '小联盟' (Minor League)
    wins INTEGER DEFAULT 0 CHECK (wins >= 0),
    losses INTEGER DEFAULT 0 CHECK (losses >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Baseball teams in the league';
COMMENT ON COLUMN teams.division IS 'League division: 大联盟 (Major) or 小联盟 (Minor)';

-- ============================================
-- USERS TABLE
-- Stores players, admins, and staff members
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    jersey_number INTEGER CHECK (jersey_number > 0 AND jersey_number <= 99),
    position VARCHAR(50), -- e.g., '投手', '捕手', '一垒手', etc.
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('admin', 'player', 'coach', 'staff')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Players, admins, coaches, and staff members';
COMMENT ON COLUMN users.role IS 'User role: admin, player, coach, staff';
COMMENT ON COLUMN users.position IS 'Baseball position (in Chinese or English)';

-- ============================================
-- GAMES TABLE
-- Stores scheduled games and results
-- ============================================
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(100) NOT NULL,
    home_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    home_score INTEGER CHECK (home_score >= 0),
    away_score INTEGER CHECK (away_score >= 0),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure home and away teams are different
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

COMMENT ON TABLE games IS 'Scheduled games and match results';
COMMENT ON COLUMN games.status IS 'Game status: scheduled, ongoing, completed, cancelled, postponed';

-- ============================================
-- GAME ATTENDANCE TABLE
-- Tracks player attendance for each game
-- ============================================
CREATE TABLE game_attendance (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'declined', 'tentative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Prevent duplicate attendance records
    CONSTRAINT unique_game_attendance UNIQUE (game_id, user_id)
);

COMMENT ON TABLE game_attendance IS 'Player attendance tracking for each game';
COMMENT ON COLUMN game_attendance.status IS 'Attendance status: confirmed, pending, declined, tentative';

-- ============================================
-- BATTING RECORDS TABLE
-- Individual batting statistics per game
-- ============================================
CREATE TABLE batting_records (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    at_bats INTEGER DEFAULT 0 CHECK (at_bats >= 0),
    hits INTEGER DEFAULT 0 CHECK (hits >= 0),
    doubles INTEGER DEFAULT 0 CHECK (doubles >= 0),
    triples INTEGER DEFAULT 0 CHECK (triples >= 0),
    home_runs INTEGER DEFAULT 0 CHECK (home_runs >= 0),
    rbis INTEGER DEFAULT 0 CHECK (rbis >= 0), -- Runs Batted In
    runs INTEGER DEFAULT 0 CHECK (runs >= 0),
    strikeouts INTEGER DEFAULT 0 CHECK (strikeouts >= 0),
    walks INTEGER DEFAULT 0 CHECK (walks >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one batting record per player per game
    CONSTRAINT unique_batting_record UNIQUE (game_id, user_id),
    -- Stats consistency: hits cannot exceed at-bats
    CONSTRAINT valid_hits CHECK (hits <= at_bats),
    -- Extra base hits are part of hits
    CONSTRAINT valid_extra_hits CHECK (doubles + triples + home_runs <= hits)
);

COMMENT ON TABLE batting_records IS 'Individual batting statistics for each game';
COMMENT ON COLUMN batting_records.rbis IS 'Runs Batted In';

-- ============================================
-- VIDEOS TABLE
-- Game video uploads and metadata
-- ============================================
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error', 'deleted')),
    file_size_bytes BIGINT,
    duration_seconds INTEGER CHECK (duration_seconds > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE videos IS 'Game video uploads and metadata';
COMMENT ON COLUMN videos.status IS 'Video processing status: processing, ready, error, deleted';

-- ============================================
-- VIDEO HIGHLIGHTS TABLE
-- Marked highlight moments within videos
-- ============================================
CREATE TABLE video_highlights (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time INTEGER NOT NULL CHECK (start_time >= 0), -- Start time in seconds
    end_time INTEGER NOT NULL CHECK (end_time > 0), -- End time in seconds
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure end_time is after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

COMMENT ON TABLE video_highlights IS 'Marked highlight moments within videos';
COMMENT ON COLUMN video_highlights.start_time IS 'Highlight start time in seconds from video start';
COMMENT ON COLUMN video_highlights.end_time IS 'Highlight end time in seconds from video start';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users table indexes
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_username ON users(username);

-- Games table indexes
CREATE INDEX idx_games_home_team_id ON games(home_team_id);
CREATE INDEX idx_games_away_team_id ON games(away_team_id);
CREATE INDEX idx_games_scheduled_at ON games(scheduled_at);
CREATE INDEX idx_games_status ON games(status);

-- Game attendance indexes
CREATE INDEX idx_attendance_game_id ON game_attendance(game_id);
CREATE INDEX idx_attendance_user_id ON game_attendance(user_id);
CREATE INDEX idx_attendance_status ON game_attendance(status);

-- Batting records indexes
CREATE INDEX idx_batting_game_id ON batting_records(game_id);
CREATE INDEX idx_batting_user_id ON batting_records(user_id);

-- Videos indexes
CREATE INDEX idx_videos_game_id ON videos(game_id);
CREATE INDEX idx_videos_uploaded_by ON videos(uploaded_by);
CREATE INDEX idx_videos_status ON videos(status);

-- Video highlights indexes
CREATE INDEX idx_highlights_video_id ON video_highlights(video_id);
CREATE INDEX idx_highlights_created_by ON video_highlights(created_by);

-- ============================================
-- TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables to auto-update updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_attendance_updated_at BEFORE UPDATE ON game_attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batting_records_updated_at BEFORE UPDATE ON batting_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_highlights_updated_at BEFORE UPDATE ON video_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Team standings view
CREATE VIEW team_standings AS
SELECT
    t.id,
    t.name,
    t.division,
    t.wins,
    t.losses,
    CASE WHEN (t.wins + t.losses) > 0
        THEN ROUND((t.wins::numeric / (t.wins + t.losses)) * 100, 2)
        ELSE 0
    END AS win_percentage
FROM teams t
ORDER BY win_percentage DESC, t.wins DESC;

-- Player batting stats summary view
CREATE VIEW player_batting_stats AS
SELECT
    u.id AS user_id,
    u.name AS player_name,
    u.jersey_number,
    t.name AS team_name,
    COUNT(br.id) AS games_played,
    COALESCE(SUM(br.at_bats), 0) AS total_at_bats,
    COALESCE(SUM(br.hits), 0) AS total_hits,
    COALESCE(SUM(br.doubles), 0) AS total_doubles,
    COALESCE(SUM(br.triples), 0) AS total_triples,
    COALESCE(SUM(br.home_runs), 0) AS total_home_runs,
    COALESCE(SUM(br.rbis), 0) AS total_rbis,
    COALESCE(SUM(br.runs), 0) AS total_runs,
    COALESCE(SUM(br.walks), 0) AS total_walks,
    COALESCE(SUM(br.strikeouts), 0) AS total_strikeouts,
    CASE WHEN SUM(br.at_bats) > 0
        THEN ROUND((SUM(br.hits)::numeric / SUM(br.at_bats)), 3)
        ELSE 0
    END AS batting_average
FROM users u
LEFT JOIN teams t ON u.team_id = t.id
LEFT JOIN batting_records br ON u.id = br.user_id
WHERE u.role = 'player'
GROUP BY u.id, u.name, u.jersey_number, t.name;

COMMENT ON VIEW team_standings IS 'Current team standings with win percentages';
COMMENT ON VIEW player_batting_stats IS 'Aggregated batting statistics for all players';
