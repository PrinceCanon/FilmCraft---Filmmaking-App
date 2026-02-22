/* 
# Add Project Management & Security Fields
1. Changes
  - Add `password` column for project-specific access control
  - Add `is_archived` boolean for dashboard organization
  - Add `is_private` boolean for visibility control
2. Security
  - Maintain guest access for ease of use in this environment
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects_fc2024' AND column_name = 'password'
  ) THEN
    ALTER TABLE projects_fc2024 ADD COLUMN password TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects_fc2024' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE projects_fc2024 ADD COLUMN is_archived BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects_fc2024' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE projects_fc2024 ADD COLUMN is_private BOOLEAN DEFAULT false;
  END IF;
END $$;