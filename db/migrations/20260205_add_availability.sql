-- Migration: Add availability column to profiles
-- Adds a boolean "availability" column with default TRUE for backward compatibility

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS availability boolean DEFAULT TRUE;

-- Ensure existing rows are set to true where availability is null
UPDATE profiles SET availability = TRUE WHERE availability IS NULL;