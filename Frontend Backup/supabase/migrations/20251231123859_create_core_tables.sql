/*
  # MindSoothe Journal - Core Database Schema

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `journal_entries`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `content` (text) - journal entry content
  - `mood` (text) - detected mood
  - `reflection` (text) - AI-generated reflection
  - `suggestions` (jsonb) - AI-generated suggestions array
  - `color_hint` (text) - AI-generated color suggestion
  - `is_reframed` (boolean) - whether entry used kind friend mode
  - `unlock_at` (timestamptz) - time capsule unlock date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `weekly_letters`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `content` (text) - AI-generated letter
  - `week_start` (date)
  - `week_end` (date)
  - `created_at` (timestamptz)
  
  ### `user_settings`
  - `user_id` (uuid, primary key, references profiles)
  - `privacy_mode` (boolean)
  - `kind_friend_mode` (boolean)
  - `theme` (text)
  - `notifications_enabled` (boolean)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  mood text CHECK (mood IN ('happy', 'calm', 'neutral', 'sad', 'anxious', 'stressed')),
  reflection text,
  suggestions jsonb DEFAULT '[]'::jsonb,
  color_hint text,
  is_reframed boolean DEFAULT false,
  unlock_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create weekly_letters table
CREATE TABLE IF NOT EXISTS weekly_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own letters"
  ON weekly_letters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own letters"
  ON weekly_letters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  privacy_mode boolean DEFAULT false,
  kind_friend_mode boolean DEFAULT true,
  theme text DEFAULT 'light',
  notifications_enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_unlock_at ON journal_entries(unlock_at);
CREATE INDEX IF NOT EXISTS idx_weekly_letters_user_id ON weekly_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_letters_week_start ON weekly_letters(week_start);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and settings on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();