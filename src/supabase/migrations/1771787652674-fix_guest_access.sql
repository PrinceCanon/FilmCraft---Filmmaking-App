/* 
# Fix Guest Access and Table Schema
1. New Tables
  - `projects_fc2024`: Core project data
  - `shot_lists_fc2024`: Individual shots linked to projects
  - `scenes_fc2024`: Scene breakdown for production
  - `project_comments_fc2024`: Chat and notes
2. Security
  - Enable RLS on all tables
  - Add "Allow All" policies for guest access (since auth is disabled)
3. Changes
  - Ensure all columns have appropriate defaults to prevent null errors
*/

-- Projects Table
CREATE TABLE IF NOT EXISTS projects_fc2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  concept TEXT DEFAULT '',
  type TEXT DEFAULT 'Vlog',
  target_audience TEXT DEFAULT '',
  duration TEXT DEFAULT '1-3 minutes',
  key_message TEXT DEFAULT '',
  tone TEXT DEFAULT 'Casual',
  inspiration TEXT DEFAULT '',
  unique_angle TEXT DEFAULT '',
  phase TEXT DEFAULT 'ideation',
  story_structure JSONB DEFAULT '[]',
  locations JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  resources JSONB DEFAULT '{}',
  completed_shots JSONB DEFAULT '[]',
  script TEXT DEFAULT '',
  owner_id TEXT DEFAULT 'guest-user',
  scenes_generated BOOLEAN DEFAULT FALSE
);

-- Shot Lists Table
CREATE TABLE IF NOT EXISTS shot_lists_fc2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES projects_fc2024(id) ON DELETE CASCADE,
  scene_number INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  shot_type TEXT DEFAULT 'Medium Shot',
  camera_movement TEXT DEFAULT 'Static',
  description TEXT DEFAULT '',
  duration TEXT DEFAULT '30 seconds',
  priority TEXT DEFAULT 'Medium',
  notes TEXT DEFAULT '',
  image_url TEXT,
  status TEXT DEFAULT 'pending'
);

-- Scenes Table
CREATE TABLE IF NOT EXISTS scenes_fc2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES projects_fc2024(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  act TEXT DEFAULT 'setup',
  location TEXT DEFAULT 'TBD',
  location_type TEXT DEFAULT 'Indoor',
  resources JSONB DEFAULT '{}',
  checklist JSONB DEFAULT '{}',
  UNIQUE(project_id, scene_number)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS project_comments_fc2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES projects_fc2024(id) ON DELETE CASCADE,
  user_id TEXT DEFAULT 'guest-user',
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'general',
  shot_id UUID REFERENCES shot_lists_fc2024(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'
);

-- Security Policies
ALTER TABLE projects_fc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_lists_fc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes_fc2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments_fc2024 ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Guest Access Projects" ON projects_fc2024;
    DROP POLICY IF EXISTS "Guest Access Shots" ON shot_lists_fc2024;
    DROP POLICY IF EXISTS "Guest Access Scenes" ON scenes_fc2024;
    DROP POLICY IF EXISTS "Guest Access Comments" ON project_comments_fc2024;
END $$;

CREATE POLICY "Guest Access Projects" ON projects_fc2024 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Guest Access Shots" ON shot_lists_fc2024 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Guest Access Scenes" ON scenes_fc2024 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Guest Access Comments" ON project_comments_fc2024 FOR ALL USING (true) WITH CHECK (true);