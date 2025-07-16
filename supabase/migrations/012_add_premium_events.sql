-- Migration: Add premium event support
-- Premium events require payment from ALL users (including premium members)
-- Examples: Weekend getaways, special experiences, external trips

-- Add premium event column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_premium_event BOOLEAN DEFAULT false;

-- Create index for efficient premium event queries
CREATE INDEX IF NOT EXISTS idx_events_is_premium_event ON events(is_premium_event);

-- Add comment to document the new field
COMMENT ON COLUMN events.is_premium_event IS 'If true, ALL users (including premium members) must pay for this event';

-- Update existing events to be non-premium by default
UPDATE events 
SET is_premium_event = false 
WHERE is_premium_event IS NULL; 