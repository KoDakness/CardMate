/*
  # Create rounds table with policy checks

  1. New Tables
    - `rounds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `course_id` (uuid, references courses.id)
      - `date` (timestamp)
      - `scores` (jsonb array of scores)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `rounds` table
    - Add policies for authenticated users to:
      - Read their own rounds
      - Create new rounds
      - Update their own rounds
*/

-- Create the rounds table if it doesn't exist
CREATE TABLE IF NOT EXISTS rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  course_id uuid NOT NULL REFERENCES courses(id),
  date timestamptz DEFAULT now(),
  scores jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own rounds" ON rounds;
  DROP POLICY IF EXISTS "Users can insert own rounds" ON rounds;
  DROP POLICY IF EXISTS "Users can update own rounds" ON rounds;
END $$;

-- Create policies
CREATE POLICY "Users can read own rounds"
  ON rounds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rounds"
  ON rounds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rounds"
  ON rounds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);