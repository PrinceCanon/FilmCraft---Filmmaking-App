/* 
# Add Shot Angle and Production Enhancements
1. Changes
  - Add `shot_angle` column to `shot_lists_fc2024` table
  - Add `completed_at` column to `projects_fc2024` table
2. Security
  - Maintain existing RLS policies
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shot_lists_fc2024' AND column_name = 'shot_angle'
  ) THEN
    ALTER TABLE shot_lists_fc2024 ADD COLUMN shot_angle TEXT DEFAULT 'Eye Level';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects_fc2024' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE projects_fc2024 ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;