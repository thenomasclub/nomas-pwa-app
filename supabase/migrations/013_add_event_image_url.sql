-- Migration: Add image_url column to events table
-- This allows storing image URLs for event background images

-- Add image_url column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the new field
COMMENT ON COLUMN events.image_url IS 'URL for event background image (from Supabase storage or external source)';

-- Create index for efficient image URL queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_events_image_url ON events(image_url) WHERE image_url IS NOT NULL;
