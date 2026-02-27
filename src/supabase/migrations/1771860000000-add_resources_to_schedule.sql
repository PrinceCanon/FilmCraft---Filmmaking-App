/* 
# Add Resource Assignment to Schedule

1. Changes
  - Add columns to link cast, crew, and equipment to schedule items
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_schedule_fc2024' 
    AND column_name = 'cast_needed'
  ) THEN
    ALTER TABLE production_schedule_fc2024 
    ADD COLUMN cast_needed jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN crew_needed jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN equipment_needed jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;