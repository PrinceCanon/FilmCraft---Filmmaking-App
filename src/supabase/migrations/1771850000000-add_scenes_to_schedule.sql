/* 
# Add scenes_to_shoot column to production schedule

1. Changes
  - Add `scenes_to_shoot` JSONB array column to store scene numbers assigned to each shoot day
  
2. Notes
  - This allows linking schedule items to specific scenes
  - Stores array of scene numbers like [1, 2, 5]
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_schedule_fc2024' 
    AND column_name = 'scenes_to_shoot'
  ) THEN
    ALTER TABLE production_schedule_fc2024 
    ADD COLUMN scenes_to_shoot jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;