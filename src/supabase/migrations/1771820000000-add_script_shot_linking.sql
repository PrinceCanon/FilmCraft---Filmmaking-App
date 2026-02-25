/* 
# Script-to-Shot Linking Enhancements
1. New Columns
  - `block_id` (TEXT) to `shot_lists_fc2024` for direct block referencing
  - `selection_text` (TEXT) to `shot_lists_fc2024` for range tracking
2. Changes
  - Ensure real-time is enabled for shot_lists to reflect script edits
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shot_lists_fc2024' AND column_name = 'block_id'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN block_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shot_lists_fc2024' AND column_name = 'selection_text'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN selection_text TEXT;
  END IF;
END $$;

-- Ensure Realtime is active for shots
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE shot_lists_fc2024;
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Already added
  END IF;
END $$;