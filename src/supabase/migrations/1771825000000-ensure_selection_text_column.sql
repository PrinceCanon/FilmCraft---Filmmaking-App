/* 
# Ensure Selection Text Column Exists

1. Purpose
   - Verify and add `selection_text` column to `shot_lists_fc2024` if missing
   - This column stores the script text that was selected when creating a quick shot
   
2. Changes
   - Add `selection_text` TEXT column if it doesn't exist
   - No data loss - purely additive
*/

-- Add selection_text column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'selection_text'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN selection_text TEXT;
    RAISE NOTICE 'Added selection_text column to shot_lists_fc2024';
  ELSE
    RAISE NOTICE 'selection_text column already exists';
  END IF;
END $$;

-- Also ensure block_id exists for script block linking
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'block_id'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN block_id TEXT;
    RAISE NOTICE 'Added block_id column to shot_lists_fc2024';
  ELSE
    RAISE NOTICE 'block_id column already exists';
  END IF;
END $$;