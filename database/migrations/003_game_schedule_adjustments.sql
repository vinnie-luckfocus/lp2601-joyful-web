-- Game Schedule Schema Adjustments
-- Adds composite index on game_attendance for attendee count aggregation

-- UP MIGRATION
CREATE INDEX IF NOT EXISTS idx_attendance_game_status ON game_attendance(game_id, status);

-- DOWN MIGRATION
-- DROP INDEX IF EXISTS idx_attendance_game_status;
