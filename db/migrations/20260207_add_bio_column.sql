-- Migration: Add bio column to profiles
-- Adds a text "bio" column for user personal statements

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Backfill empty bio values to NULL (no-op if column already null)
UPDATE profiles SET bio = NULL WHERE bio = '';
