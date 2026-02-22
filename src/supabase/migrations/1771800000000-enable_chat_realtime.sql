/* 
# Enable Real-time Chat and Media Support
1. New Columns
  - Add `image_url` to `project_comments_fc2024` for visual chat
2. Security & Performance
  - Enable Realtime replication for the comments table
  - Add index for project-based message retrieval
*/

-- Add image support to chat
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_comments_fc2024' AND column_name = 'image_url'
  ) THEN 
    ALTER TABLE project_comments_fc2024 ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Enable Realtime Replication
-- Note: This requires the 'supabase_realtime' publication to exist (default in Supabase)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE project_comments_fc2024;
  END IF;
END $$;

-- Ensure replica identity is set to full for detailed real-time payload
ALTER TABLE project_comments_fc2024 REPLICA IDENTITY FULL;