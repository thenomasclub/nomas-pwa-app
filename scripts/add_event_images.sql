-- SQL script to add image URLs to events
-- Run this in your Supabase Dashboard -> SQL Editor

-- First, check what events you have:
SELECT id, title, type, image_url FROM events ORDER BY date;

-- Template to update a specific event with an image URL:
-- UPDATE events 
-- SET image_url = 'your-image-url-here'
-- WHERE id = 'your-event-id-here';

-- Examples of adding image URLs to events:

-- Example 1: Add image to a specific event by title
-- UPDATE events 
-- SET image_url = 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/events/pilates-class.jpg'
-- WHERE title = 'Morning Pilates Class';

-- Example 2: Add image to a specific event by ID
-- UPDATE events 
-- SET image_url = 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/events/padel-tournament.jpg'
-- WHERE id = '12345678-1234-1234-1234-123456789012';

-- Example 3: Add default images by event type
-- UPDATE events 
-- SET image_url = 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/events/default-run.jpg'
-- WHERE type = 'run' AND image_url IS NULL;

-- UPDATE events 
-- SET image_url = 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/events/default-pilates.jpg'
-- WHERE type = 'pilates' AND image_url IS NULL;

-- UPDATE events 
-- SET image_url = 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/events/default-padel.jpg'
-- WHERE type = 'padel' AND image_url IS NULL;

-- UPDATE events 
-- SET image_url = 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/events/default-event.jpg'
-- WHERE type = 'event' AND image_url IS NULL;

-- Check results after updating:
SELECT id, title, type, image_url FROM events WHERE image_url IS NOT NULL ORDER BY date;
