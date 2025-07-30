-- Fix pricing to show 200,000 IDR correctly
-- Run this in Supabase SQL Editor

-- Update all Padel Night events to have correct price (200,000 IDR = 20,000,000 cents)
UPDATE events 
SET price_cents = 20000000 
WHERE title = 'Padel Night' AND price_cents = 200000;

-- Update any other paid events that might have incorrect pricing
-- Add more UPDATE statements here if needed for other event types

-- Show the updated events with their new pricing
SELECT 
    title,
    price_cents,
    CASE 
        WHEN is_free THEN 'FREE'
        ELSE CONCAT((price_cents / 100)::TEXT, ' IDR')
    END as formatted_price
FROM events 
WHERE title = 'Padel Night'
ORDER BY date; 