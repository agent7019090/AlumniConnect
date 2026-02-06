-- Migration: Add canonical profile columns for production
-- Purpose: Ensure profiles table has all required fields for mentor matching, onboarding, and messaging

-- Add missing columns to profiles table (if they don't exist)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS current_company TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_role TEXT,
ADD COLUMN IF NOT EXISTS target_companies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure role column exists (should already exist from auth)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- Create index on availability for faster mentor filtering
CREATE INDEX IF NOT EXISTS idx_profiles_availability_role 
ON profiles(availability DESC, role);

-- Create index on student_id, mentor_id for faster conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_student_mentor 
ON conversations(student_id, mentor_id);

-- Update any existing null full_name values from name column
UPDATE profiles
SET full_name = name
WHERE full_name IS NULL AND name IS NOT NULL;

-- Ensure all mentors have availability set to true by default
UPDATE profiles
SET availability = true
WHERE role = 'mentor' AND availability IS NULL;

-- Mark profiles as completed if they have role set
UPDATE profiles
SET profile_completed = true
WHERE profile_completed IS NULL OR profile_completed = false;

-- Add created_at defaults if missing
UPDATE profiles
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE profiles
SET updated_at = NOW()
WHERE updated_at IS NULL;
