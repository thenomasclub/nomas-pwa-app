-- Migration: Add bookings_count column to events table for better performance
-- This migration adds a bookings_count column and triggers to keep it updated automatically

-- Add bookings_count column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0;

-- Create index for efficient bookings_count queries
CREATE INDEX IF NOT EXISTS idx_events_bookings_count ON events(bookings_count);

-- Add comment to document the new field
COMMENT ON COLUMN events.bookings_count IS 'Cached count of confirmed bookings for this event (auto-updated by triggers)';

-- Function to update bookings_count for an event
CREATE OR REPLACE FUNCTION update_event_bookings_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the bookings_count for the affected event(s)
    IF TG_OP = 'DELETE' THEN
        -- Handle deletion
        UPDATE events 
        SET bookings_count = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE event_id = OLD.event_id 
            AND status = 'confirmed'
        )
        WHERE id = OLD.event_id;
        
        RETURN OLD;
    ELSE
        -- Handle INSERT and UPDATE
        UPDATE events 
        SET bookings_count = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE event_id = NEW.event_id 
            AND status = 'confirmed'
        )
        WHERE id = NEW.event_id;
        
        -- If this is an UPDATE and the event_id changed, update the old event too
        IF TG_OP = 'UPDATE' AND OLD.event_id != NEW.event_id THEN
            UPDATE events 
            SET bookings_count = (
                SELECT COUNT(*) 
                FROM bookings 
                WHERE event_id = OLD.event_id 
                AND status = 'confirmed'
            )
            WHERE id = OLD.event_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update bookings_count
DROP TRIGGER IF EXISTS trigger_update_event_bookings_count_insert ON bookings;
DROP TRIGGER IF EXISTS trigger_update_event_bookings_count_update ON bookings;
DROP TRIGGER IF EXISTS trigger_update_event_bookings_count_delete ON bookings;

CREATE TRIGGER trigger_update_event_bookings_count_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_event_bookings_count();

CREATE TRIGGER trigger_update_event_bookings_count_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_event_bookings_count();

CREATE TRIGGER trigger_update_event_bookings_count_delete
    AFTER DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_event_bookings_count();

-- Backfill existing events with current booking counts
UPDATE events 
SET bookings_count = (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE bookings.event_id = events.id 
    AND bookings.status = 'confirmed'
);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 018: Successfully added bookings_count column and triggers';
END $$;
