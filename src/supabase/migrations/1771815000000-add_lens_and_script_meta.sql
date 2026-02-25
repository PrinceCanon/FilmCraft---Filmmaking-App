/* 
# Advanced Script & Camera Metadata
1. New Columns
  - `lens` (TEXT) to `shot_lists_fc2024` for technical planning
  - `script_reference` (TEXT) to `shot_lists_fc2024` to link shots to specific script lines
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shot_lists_fc2024' AND column_name = 'lens'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN lens TEXT DEFAULT '35mm';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shot_lists_fc2024' AND column_name = 'script_reference'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN script_reference TEXT;
  END IF;
END $$;