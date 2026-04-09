-- Migration: Add captain_id to teams table
-- Created: 2026-04-10

ALTER TABLE teams
ADD COLUMN captain_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN teams.captain_id IS 'Team captain (foreign key to users)';
