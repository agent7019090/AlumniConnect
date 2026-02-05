-- Migration: Add company, title, and skills columns to profiles

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS company text;

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS title text;

ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT ARRAY[]::text[];

-- No default for company/title; skills defaults to empty array
