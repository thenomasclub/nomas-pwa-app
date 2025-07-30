-- Insert recurring weekly events for the next 12 weeks
-- Run this in Supabase SQL Editor after running delete-events.sql

-- Helper function to get next occurrence of a day of the week
CREATE OR REPLACE FUNCTION get_next_occurrence(target_day INTEGER, target_time TIME)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    next_date DATE;
    result TIMESTAMP WITH TIME ZONE;
    days_to_add INTEGER;
BEGIN
    -- Calculate days until next occurrence
    days_to_add = (target_day - EXTRACT(DOW FROM CURRENT_DATE) + 7) % 7;
    
    -- If today is the target day, get next week
    IF days_to_add = 0 THEN
        days_to_add = 7;
    END IF;
    
    -- Get the next occurrence of the target day
    next_date = CURRENT_DATE + INTERVAL '1 day' * days_to_add;
    
    -- Combine date with time
    result = (next_date + target_time) AT TIME ZONE 'UTC';
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert Monday Morning Runs (12 weeks)
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured, is_free, price_cents, pricing_note)
SELECT 
    'Monday Morning Run',
    'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.',
    'run',
    get_next_occurrence(1, '06:15:00') + (INTERVAL '1 week' * (generate_series(0, 11))),
    45,
    'KEEN CAFE, Pererenan',
    999,
    false,
    true,
    0,
    'Free for all members'
FROM generate_series(0, 11);

-- Insert Thursday Padel Nights (12 weeks)
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured, is_free, price_cents, pricing_note)
SELECT 
    'Padel Night',
    'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.',
    'padel',
    get_next_occurrence(4, '17:30:00') + (INTERVAL '1 week' * (generate_series(0, 11))),
    120,
    'JUNGLE PADLE, CANGGU',
    24,
    true,
    false,
    20000000,
    '200,000 IDR per session'
FROM generate_series(0, 11);

-- Insert Friday Girls Only Runs (12 weeks)
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured, is_free, price_cents, pricing_note)
SELECT 
    'Girls Only Morning Run',
    'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.',
    'run',
    get_next_occurrence(5, '07:00:00') + (INTERVAL '1 week' * (generate_series(0, 11))),
    45,
    'KYND, CANGGU',
    999,
    false,
    true,
    0,
    'Free for all members - Women only'
FROM generate_series(0, 11);

-- Clean up the helper function
DROP FUNCTION get_next_occurrence(INTEGER, TIME);

-- Show summary
SELECT 
    title,
    COUNT(*) as event_count,
    MIN(date) as first_event,
    MAX(date) as last_event
FROM events 
GROUP BY title 
ORDER BY MIN(date); 