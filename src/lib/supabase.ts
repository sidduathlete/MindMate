import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
  last_login: string;
  preferences: Record<string, unknown>;
};

export type MoodEntry = {
  id: string;
  user_id: string;
  mood_score: number;
  mood_label: string;
  energy_level: number;
  stress_level: number;
  notes: string;
  triggers: string[];
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment_score: number;
  crisis_flag: boolean;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_at_time: string;
  gratitude_items: string[];
  created_at: string;
  updated_at: string;
};

export type MeditationSession = {
  id: string;
  user_id: string;
  duration_minutes: number;
  meditation_type: string;
  completed: boolean;
  mood_before: number;
  mood_after: number;
  created_at: string;
};
