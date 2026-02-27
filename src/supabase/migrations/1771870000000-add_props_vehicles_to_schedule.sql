/* 
# Add Props and Vehicles to Schedule

1. Changes
  - Add columns to link props and vehicles to schedule items
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_schedule_fc2024' 
    AND column_name = 'props_needed'
  ) THEN
    ALTER TABLE production_schedule_fc2024 
    ADD COLUMN props_needed jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN vehicles_needed jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;