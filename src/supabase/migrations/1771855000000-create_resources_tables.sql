/* 
# Create Resources Tables

1. New Tables
  - `cast_fc2024` - Cast members and actors
  - `crew_fc2024` - Crew members and their positions
  - `equipment_fc2024` - Production equipment

2. Security
  - Enable RLS on all tables
  - Add "Guest Access" policies (Allow All)
*/

-- Cast Table
CREATE TABLE IF NOT EXISTS cast_fc2024 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects_fc2024(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  contact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cast_fc2024 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest Access Cast" ON cast_fc2024 
FOR ALL USING (true) WITH CHECK (true);

-- Crew Table
CREATE TABLE IF NOT EXISTS crew_fc2024 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects_fc2024(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  position text NOT NULL,
  contact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crew_fc2024 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest Access Crew" ON crew_fc2024 
FOR ALL USING (true) WITH CHECK (true);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment_fc2024 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects_fc2024(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_fc2024 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest Access Equipment" ON equipment_fc2024 
FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cast_project ON cast_fc2024(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_project ON crew_fc2024(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_project ON equipment_fc2024(project_id);