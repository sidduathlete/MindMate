/*
  # Mental Health Companion Database Schema

  ## Overview
  Complete database schema for a mental health companion app with mood tracking,
  chat history, journal entries, and meditation progress.

  ## Tables Created

  ### 1. users
  - `id` (uuid, primary key): Unique user identifier linked to auth.users
  - `username` (text): Display name
  - `email` (text): User email
  - `created_at` (timestamptz): Account creation timestamp
  - `last_login` (timestamptz): Last login timestamp
  - `preferences` (jsonb): User preferences (notifications, themes, etc.)

  ### 2. mood_entries
  - `id` (uuid, primary key): Unique mood entry identifier
  - `user_id` (uuid, foreign key): References users.id
  - `mood_score` (integer): Mood rating (1-10)
  - `mood_label` (text): Mood description (happy, anxious, calm, etc.)
  - `energy_level` (integer): Energy rating (1-10)
  - `stress_level` (integer): Stress rating (1-10)
  - `notes` (text): Optional user notes about their mood
  - `triggers` (text[]): Array of mood triggers
  - `activities` (text[]): Array of daily activities
  - `created_at` (timestamptz): Entry timestamp

  ### 3. chat_messages
  - `id` (uuid, primary key): Unique message identifier
  - `user_id` (uuid, foreign key): References users.id
  - `session_id` (uuid): Groups messages by conversation session
  - `role` (text): 'user' or 'assistant'
  - `content` (text): Message content
  - `sentiment_score` (numeric): AI-detected sentiment (-1 to 1)
  - `crisis_flag` (boolean): True if crisis keywords detected
  - `created_at` (timestamptz): Message timestamp

  ### 4. journal_entries
  - `id` (uuid, primary key): Unique journal entry identifier
  - `user_id` (uuid, foreign key): References users.id
  - `title` (text): Entry title
  - `content` (text): Journal content
  - `mood_at_time` (text): Mood when writing
  - `gratitude_items` (text[]): Things user is grateful for
  - `created_at` (timestamptz): Entry timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### 5. meditation_sessions
  - `id` (uuid, primary key): Unique session identifier
  - `user_id` (uuid, foreign key): References users.id
  - `duration_minutes` (integer): Session length
  - `meditation_type` (text): Type (breathing, body scan, etc.)
  - `completed` (boolean): Whether session was completed
  - `mood_before` (integer): Mood score before session
  - `mood_after` (integer): Mood score after session
  - `created_at` (timestamptz): Session timestamp

  ### 6. coping_strategies
  - `id` (uuid, primary key): Unique strategy identifier
  - `user_id` (uuid, foreign key): References users.id
  - `strategy_name` (text): Strategy title
  - `description` (text): Strategy details
  - `effectiveness_rating` (integer): User rating (1-5)
  - `times_used` (integer): Usage counter
  - `created_at` (timestamptz): Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  email text UNIQUE,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mood_score integer CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label text NOT NULL,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  notes text DEFAULT '',
  triggers text[] DEFAULT ARRAY[]::text[],
  activities text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sentiment_score numeric DEFAULT 0,
  crisis_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT '',
  content text NOT NULL,
  mood_at_time text DEFAULT '',
  gratitude_items text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes integer NOT NULL,
  meditation_type text NOT NULL,
  completed boolean DEFAULT false,
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meditation sessions"
  ON meditation_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meditation sessions"
  ON meditation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meditation sessions"
  ON meditation_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create coping_strategies table
CREATE TABLE IF NOT EXISTS coping_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  strategy_name text NOT NULL,
  description text NOT NULL,
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coping_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coping strategies"
  ON coping_strategies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coping strategies"
  ON coping_strategies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coping strategies"
  ON coping_strategies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own coping strategies"
  ON coping_strategies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);
