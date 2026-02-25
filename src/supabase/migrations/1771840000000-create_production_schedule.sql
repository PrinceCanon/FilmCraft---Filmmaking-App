/*
# Production Schedule Table

1. New Tables
  - `production_schedule_fc2024`
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key)
    - `title` (text)
    - `type` (text) - prep, shoot, review
    - `date` (date)
    - `start_time` (time)
    - `end_time` (time)
    - `location` (text)
    - `notes` (text)
    - `weather_consideration` (boolean)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

2. Security
  - Enable RLS on `production_schedule_fc2024` table
  - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS production_schedule_fc2024 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects_fc2024(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'shoot',
  date date NOT NULL,
  start_time time DEFAULT '09:00',
  end_time time DEFAULT '17:00',
  location text,
  notes text,
  weather_consideration boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE production_schedule_fc2024 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedule for their projects"
  ON production_schedule_fc2024 FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects_fc2024 
      WHERE user_id = auth.uid() 
      OR guest_code IN (
        SELECT guest_code FROM guest_access_fc2024 WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert schedule for their projects"
  ON production_schedule_fc2024 FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects_fc2024 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update schedule for their projects"
  ON production_schedule_fc2024 FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects_fc2024 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedule for their projects"
  ON production_schedule_fc2024 FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects_fc2024 WHERE user_id = auth.uid()
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_production_schedule_project_date 
  ON production_schedule_fc2024(project_id, date);