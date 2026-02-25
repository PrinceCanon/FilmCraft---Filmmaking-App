/* 
# Structured Screenplay & Production Data
1. New Columns
  - `script_json` (JSONB) to `projects_fc2024` for block-based screenplay
  - `checklist` (JSONB) to `projects_fc2024` for global project tasks
2. Metadata
  - Ensure all tables support cascade deletion (already set in previous migrations)
*/

-- Add structured script support
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects_fc2024' AND column_name = 'script_json'
  ) THEN 
    ALTER TABLE projects_fc2024 ADD COLUMN script_json JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects_fc2024' AND column_name = 'production_checklist'
  ) THEN 
    ALTER TABLE projects_fc2024 ADD COLUMN production_checklist JSONB DEFAULT '[]';
  END IF;
END $$;