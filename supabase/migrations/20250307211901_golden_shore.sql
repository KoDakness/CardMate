/*
  # Add scorecard storage with existence checks

  1. New Tables (if not exist)
    - `scorecards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `date` (timestamp)
      - `completed` (boolean)
      - `total_score` (integer)
      - `relative_to_par` (integer)
      - `created_at` (timestamp)

    - `scorecard_players`
      - `id` (uuid, primary key)
      - `scorecard_id` (uuid, references scorecards)
      - `player_id` (uuid, references players)
      - `scores` (jsonb array of scores)
      - `total_score` (integer)
      - `relative_to_par` (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their scorecards
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
  -- Create scorecards table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'scorecards') THEN
    CREATE TABLE scorecards (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES profiles(id) NOT NULL,
      course_id uuid REFERENCES courses(id) NOT NULL,
      date timestamptz DEFAULT now(),
      completed boolean DEFAULT false,
      total_score integer DEFAULT 0,
      relative_to_par integer DEFAULT 0,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;

    -- Create policies for scorecards
    CREATE POLICY "Users can create their own scorecards"
      ON scorecards
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view their own scorecards"
      ON scorecards
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own scorecards"
      ON scorecards
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Create scorecard_players table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'scorecard_players') THEN
    CREATE TABLE scorecard_players (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      scorecard_id uuid REFERENCES scorecards(id) NOT NULL,
      player_id uuid REFERENCES players(id) NOT NULL,
      scores jsonb DEFAULT '[]'::jsonb NOT NULL,
      total_score integer DEFAULT 0,
      relative_to_par integer DEFAULT 0
    );

    -- Enable RLS
    ALTER TABLE scorecard_players ENABLE ROW LEVEL SECURITY;

    -- Create policies for scorecard_players
    CREATE POLICY "Users can create scorecard players for their scorecards"
      ON scorecard_players
      FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM scorecards 
        WHERE scorecards.id = scorecard_players.scorecard_id 
        AND scorecards.user_id = auth.uid()
      ));

    CREATE POLICY "Users can view scorecard players for their scorecards"
      ON scorecard_players
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM scorecards 
        WHERE scorecards.id = scorecard_players.scorecard_id 
        AND scorecards.user_id = auth.uid()
      ));

    CREATE POLICY "Users can update scorecard players for their scorecards"
      ON scorecard_players
      FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM scorecards 
        WHERE scorecards.id = scorecard_players.scorecard_id 
        AND scorecards.user_id = auth.uid()
      ));
  END IF;
END $$;