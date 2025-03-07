/*
  # Add cascade delete behavior to foreign keys

  1. Changes
    - Add ON DELETE CASCADE to scorecard_players_player_id_fkey
    - Add ON DELETE CASCADE to scorecard_players_scorecard_id_fkey
    - Add ON DELETE CASCADE to scorecards_course_id_fkey
    
  2. Purpose
    - Automatically delete related scorecard_players when a player is deleted
    - Automatically delete related scorecard_players when a scorecard is deleted
    - Automatically delete related scorecards when a course is deleted
*/

-- Drop existing foreign key constraints
ALTER TABLE scorecard_players
DROP CONSTRAINT IF EXISTS scorecard_players_player_id_fkey,
DROP CONSTRAINT IF EXISTS scorecard_players_scorecard_id_fkey;

ALTER TABLE scorecards
DROP CONSTRAINT IF EXISTS scorecards_course_id_fkey;

-- Re-create foreign key constraints with ON DELETE CASCADE
ALTER TABLE scorecard_players
ADD CONSTRAINT scorecard_players_player_id_fkey 
FOREIGN KEY (player_id) 
REFERENCES players(id) 
ON DELETE CASCADE;

ALTER TABLE scorecard_players
ADD CONSTRAINT scorecard_players_scorecard_id_fkey 
FOREIGN KEY (scorecard_id) 
REFERENCES scorecards(id) 
ON DELETE CASCADE;

ALTER TABLE scorecards
ADD CONSTRAINT scorecards_course_id_fkey 
FOREIGN KEY (course_id) 
REFERENCES courses(id) 
ON DELETE CASCADE;