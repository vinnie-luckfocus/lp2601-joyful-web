-- Migration: Add tactics board tables
-- Created: 2026-04-10

CREATE TABLE game_tactics (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    general_notes TEXT,
    signals JSONB DEFAULT '{}',
    defense_strategy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_game_tactics UNIQUE (game_id)
);

COMMENT ON TABLE game_tactics IS 'Tactical notes and strategy for each game';
COMMENT ON COLUMN game_tactics.signals IS 'JSON object of signal keys and descriptions';

CREATE TABLE game_lineups (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batting_order INTEGER NOT NULL CHECK (batting_order >= 1 AND batting_order <= 9),
    position VARCHAR(50) NOT NULL,
    jersey_number VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_game_batting_order UNIQUE (game_id, batting_order)
);

COMMENT ON TABLE game_lineups IS 'Batting order and defensive positions per game';

CREATE INDEX idx_game_lineups_game_id ON game_lineups(game_id);
CREATE INDEX idx_game_lineups_user_id ON game_lineups(user_id);

CREATE TRIGGER update_game_tactics_updated_at BEFORE UPDATE ON game_tactics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_lineups_updated_at BEFORE UPDATE ON game_lineups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
