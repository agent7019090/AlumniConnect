-- Row Level Security (RLS) Policies for AlumniInReach
-- These policies ensure users can only access and modify their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES
-- Policy: Users can read all mentor profiles
CREATE POLICY "users_can_read_mentor_profiles"
  ON profiles
  FOR SELECT
  USING (role = 'mentor' OR auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "users_can_update_own_profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "users_can_insert_own_profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CONVERSATIONS TABLE POLICIES
-- Policy: Students can insert conversations they're part of
CREATE POLICY "students_can_create_conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Mentors can create conversations
CREATE POLICY "mentors_can_create_conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

-- Policy: Users can view conversations they're part of
CREATE POLICY "users_can_view_own_conversations"
  ON conversations
  FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = mentor_id);

-- Policy: Users can update conversations they're part of
CREATE POLICY "users_can_update_own_conversations"
  ON conversations
  FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = mentor_id);

-- MESSAGES TABLE POLICIES
-- Policy: Users can insert messages in conversations they're part of
CREATE POLICY "users_can_insert_messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (student_id = auth.uid() OR mentor_id = auth.uid())
    )
  );

-- Policy: Users can view messages in conversations they're part of
CREATE POLICY "users_can_view_messages"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (student_id = auth.uid() OR mentor_id = auth.uid())
    )
  );

-- Policy: Users can only update/delete their own messages
CREATE POLICY "users_can_update_own_messages"
  ON messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "users_can_delete_own_messages"
  ON messages
  FOR DELETE
  USING (auth.uid() = sender_id);
