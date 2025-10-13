
-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
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

CREATE POLICY "Users can access their own mood entries"
  ON mood_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sentiment_score numeric DEFAULT 0,
  crisis_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own chat messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT '',
  content text NOT NULL,
  mood_at_time text DEFAULT '',
  gratitude_items text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own journal entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes integer NOT NULL,
  meditation_type text NOT NULL,
  completed boolean DEFAULT false,
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own meditation sessions"
  ON meditation_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);
