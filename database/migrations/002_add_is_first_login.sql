-- Add is_first_login column to users table
-- This flag is used to enforce password change on first login

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;
