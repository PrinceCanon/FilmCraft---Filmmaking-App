/* 
# Fix Order Index Type

1. Purpose
   - Change order_index from integer to bigint to support timestamp values
   - Timestamps from Date.now() exceed integer max value (2,147,483,647)
   
2. Changes
   - Alter order_index column type from integer to bigint
   - Safe operation - no data loss
*/

-- Change order_index to bigint to support large timestamp values
DO $$ 
BEGIN 
  -- Check if column exists and alter its type
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'shot_lists_fc2024' 
      AND column_name = 'order_index'
  ) THEN 
    ALTER TABLE shot_lists_fc2024 
    ALTER COLUMN order_index TYPE BIGINT;
    
    RAISE NOTICE 'Changed order_index to BIGINT';
  ELSE
    -- If column doesn't exist, create it as bigint
    ALTER TABLE shot_lists_fc2024 
    ADD COLUMN order_index BIGINT DEFAULT 0;
    
    RAISE NOTICE 'Created order_index as BIGINT';
  END IF;
END $$;

-- Recreate index if needed
DROP INDEX IF EXISTS shot_lists_order_idx;
CREATE INDEX shot_lists_order_idx ON shot_lists_fc2024(order_index);