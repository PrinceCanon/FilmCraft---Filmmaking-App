/* 
# Add Props and Vehicles Tables

1. New Tables
  - `props_fc2024` - Production props
  - `vehicles_fc2024` - Production vehicles

2. Security
  - Enable RLS on all tables
  - Add "Guest Access" policies (Allow All)
*/

-- Props Table
CREATE TABLE IF NOT EXISTS props_fc2024 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects_fc2024(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE props_fc2024 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest Access Props" ON props_fc2024 
FOR ALL USING (true) WITH CHECK (true);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles_fc2024 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects_fc2024(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles_fc2024 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest Access Vehicles" ON vehicles_fc2024 
FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_props_project ON props_fc2024(project_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_project ON vehicles_fc2024(project_id);