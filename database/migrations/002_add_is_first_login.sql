-- Add is_first_login column to users table
-- Created: 2026-04-09

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;
