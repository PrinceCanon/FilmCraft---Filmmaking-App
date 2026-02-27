/* 
# Add Date Ranges and Post-Production Support

1. Changes
  - Add `end_date` column to support date ranges for tasks
  - Add `completion_status` to track milestone completion
  - Add `milestone_type` for post-production milestones
  
2. Post-Production Milestone Types
  - Assembly Edit
  - Rough Cut
  - Fine Cut
  - Picture Lock
  - Sound Design
  - Color Grading
  - VFX
  - Music Composition
  - Final Mix
  - Mastering
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'production_schedule_fc2024' 
    AND column_name = 'end_date'
  ) THEN
    ALTER TABLE production_schedule_fc2024 
    ADD COLUMN end_date date,
    ADD COLUMN completion_status text DEFAULT 'pending',
    ADD COLUMN milestone_type text;
  END IF;
END $$;