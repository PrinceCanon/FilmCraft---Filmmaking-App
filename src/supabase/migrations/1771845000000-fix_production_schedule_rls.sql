/* 
# Fix Production Schedule RLS and Schema

1. New Tables
  - `production_schedule_fc2024` (re-verification)
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key)
    - `title` (text)
    - `type` (text)
    - `date` (date)
    - `start_time` (time)
    - `end_time` (time)
    - `location` (text)
    - `notes` (text)
    - `weather_consideration` (boolean)

2. Security
  - Enable RLS
  - Add "Guest Access" policies (Allow All) to match existing project tables
  - This fixes the "unable to run query" error caused by missing columns in policies
*/

-- Create the table if it doesn't exist
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

-- Enable RLS
ALTER TABLE production_schedule_fc2024 ENABLE ROW LEVEL SECURITY;

-- Drop any restrictive policies if they were partially created
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view schedule for their projects" ON production_schedule_fc2024;
  DROP POLICY IF EXISTS "Users can insert schedule for their projects" ON production_schedule_fc2024;
  DROP POLICY IF EXISTS "Users can update schedule for their projects" ON production_schedule_fc2024;
  DROP POLICY IF EXISTS "Users can delete schedule for their projects" ON production_schedule_fc2024;
  DROP POLICY IF EXISTS "Guest Access Schedule" ON production_schedule_fc2024;
END $$;

-- Create Guest Access Policy (Matches the pattern in 1771787652674-fix_guest_access.sql)
CREATE POLICY "Guest Access Schedule" ON production_schedule_fc2024 
FOR ALL USING (true) WITH CHECK (true);

-- Ensure index exists for performance
CREATE INDEX IF NOT EXISTS idx_prod_sched_proj_date ON production_schedule_fc2024(project_id, date);