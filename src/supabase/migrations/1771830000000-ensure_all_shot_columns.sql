/* 
# Ensure All Shot List Columns Exist

1. Purpose
   - Add all missing columns to shot_lists_fc2024 table
   - This is a comprehensive fix for schema cache errors
   
2. Columns Added (if missing)
   - selection_text: TEXT - Stores selected script text for quick shots
   - block_id: TEXT - Links shot to specific script block
   - shot_angle: TEXT - Camera angle (Eye Level, High Angle, etc.)
   - lens: TEXT - Lens choice (35mm, 50mm, etc.)
   - order_index: BIGINT - For manual ordering of shots (using BIGINT for timestamps)
   - status: TEXT - Shot status (pending, completed, etc.)
   
3. Safety
   - Uses IF NOT EXISTS checks
   - No data loss
   - Safe to run multiple times
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
  END IF;
END $$;

-- Add block_id column if it doesn't exist
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
  END IF;
END $$;

-- Add shot_angle column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'shot_angle'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN shot_angle TEXT DEFAULT 'Eye Level';
  END IF;
END $$;

-- Add lens column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'lens'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN lens TEXT DEFAULT '35mm';
  END IF;
END $$;

-- Add order_index column as BIGINT if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'order_index'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN order_index BIGINT DEFAULT 0;
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'status'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Create index on order_index for better sorting performance
CREATE INDEX IF NOT EXISTS shot_lists_order_idx ON shot_lists_fc2024(order_index);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS shot_lists_status_idx ON shot_lists_fc2024(status);