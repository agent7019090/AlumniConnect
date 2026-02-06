# Database Migrations for AlumniInReach

This folder contains SQL migrations needed to set up the Supabase database schema for the AlumniInReach platform.

## Files

### `001_add_profile_columns.sql`
**Purpose:** Adds missing columns to the `profiles` table for production use.

**Columns added:**
- `full_name` (TEXT): Canonical mentor/student name
- `current_company` (TEXT): Current company of mentor
- `position` (TEXT): Job position/title of mentor
- `experience_years` (INTEGER): Years of experience
- `skills` (TEXT[]): Array of technical skills
- `target_role` (TEXT): Target job role for students
- `target_companies` (TEXT[]): Array of target companies for students
- `availability` (BOOLEAN DEFAULT true): Mentor availability flag
- `profile_completed` (BOOLEAN DEFAULT false): Onboarding completion flag
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Record update time

**Indexes created:**
- `idx_profiles_availability_role` - Fast filtering of available mentors
- `idx_conversations_student_mentor` - Fast conversation lookups

### `002_rls_policies.sql`
**Purpose:** Sets up Row Level Security (RLS) policies for secure data access.

**Policies:**
- **Profiles:**
  - Users can view all mentor profiles (for discovery)
  - Users can only update/insert their own profile
  
- **Conversations:**
  - Only participants can view conversations
  - Only participants can update conversations
  - Both students and mentors can create conversations

- **Messages:**
  - Users can only view messages in conversations they participate in
  - Users can only send messages in conversations they participate in
  - Users can only edit/delete their own messages

## How to Apply Migrations

### Option 1: Supabase Dashboard (Manual)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `001_add_profile_columns.sql`
5. Click **Run**
6. Create another query and paste `002_rls_policies.sql`
7. Click **Run**

### Option 2: Supabase CLI
If you have Supabase CLI installed:

```bash
# Create a new migration
supabase migration new add_profile_columns
# Copy contents of 001_add_profile_columns.sql into the file

# Push migrations to database
supabase db push
```

### Option 3: Direct PostgreSQL (if you have psql installed)
```bash
# Set your Supabase connection string
export PGPASSWORD="your-password"
psql -h db.yourproject.supabase.co -U postgres -d postgres < 001_add_profile_columns.sql
psql -h db.yourproject.supabase.co -U postgres -d postgres < 002_rls_policies.sql
```

## Important Notes

- **Backup first:** Always backup your database before applying migrations to production
- **Apply in order:** Run `001_add_profile_columns.sql` first, then `002_rls_policies.sql`
- **Idempotent:** Both migrations use `IF NOT EXISTS` to prevent errors if run multiple times
- **Migration time:** For large tables, adding indexes may take a few seconds

## Verification

After applying migrations, verify the schema:

```sql
-- Check columns in profiles table
\d profiles

-- Check RLS is enabled
SELECT * FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true;

-- Check policies
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'conversations', 'messages');
```

## Troubleshooting

**Error: "Column already exists"**
- The migration includes `IF NOT EXISTS` clauses, so this shouldn't happen. If it does, the column likely needs to be renamed or removed first.

**Error: "Could not find the 'availability' column"**
- This error in the app means the migration hasn't been applied yet. Run `001_add_profile_columns.sql` first.

**RLS policy conflicts**
- If you see `new row violates row level security policy`, check that:
  - The user is authenticated (has a valid `auth.uid()`)
  - The row being inserted matches the policy conditions (e.g., `auth.uid() = id` for profiles)

**For help:**
- Check Supabase documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- Contact support or check logs in the Supabase dashboard
