export type Mood = 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'stressed';

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: Mood;
  reflection: string | null;
  suggestions: string[];
  color_hint: string | null;
  is_reframed: boolean;
  unlock_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyLetter {
  id: string;
  user_id: string;
  content: string;
  week_start: string;
  week_end: string;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  privacy_mode: boolean;
  kind_friend_mode: boolean;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  updated_at: string;
}

export interface AIAnalysisResponse {
  mood: Mood;
  reflection: string;
  suggestions: string[];
  colorHint: string;
}

export interface CreateEntryRequest {
  content: string;
  unlock_at?: string | null;
}

export interface MoodStats {
  happy: number;
  calm: number;
  neutral: number;
  sad: number;
  anxious: number;
  stressed: number;
}

export interface WeeklySummary {
  totalEntries: number;
  moodDistribution: MoodStats;
  dominantMood: Mood;
  weekStart: string;
  weekEnd: string;
}
