-- Simple script to fix events with proper weekly spacing
-- Run this in Supabase SQL Editor

-- First, delete all existing events
DELETE FROM events;

-- Insert Monday Morning Runs (12 weeks) - starting from August 4th, 2025 (Monday)
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured, is_free, price_cents, pricing_note)
VALUES 
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-08-04 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-08-11 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-08-18 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-08-25 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-09-01 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-09-08 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-09-15 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-09-22 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-09-29 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-10-06 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-10-13 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members'),
    ('Monday Morning Run', 'Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.', 'run', '2025-10-20 06:15:00+00', 45, 'KEEN CAFE, Pererenan', 999, false, true, 0, 'Free for all members');

-- Insert Thursday Padel Nights (12 weeks) - starting from August 7th, 2025 (Thursday)
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured, is_free, price_cents, pricing_note)
VALUES 
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-08-07 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-08-14 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-08-21 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-08-28 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-09-04 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-09-11 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-09-18 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-09-25 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-10-02 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-10-09 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-10-16 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session'),
    ('Padel Night', 'Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.', 'padel', '2025-10-23 17:30:00+00', 120, 'JUNGLE PADLE, CANGGU', 24, true, false, 20000000, '200,000 IDR per session');

-- Insert Friday Girls Only Runs (12 weeks) - starting from August 8th, 2025 (Friday)
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured, is_free, price_cents, pricing_note)
VALUES 
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-08-08 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-08-15 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-08-22 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-08-29 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-09-05 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-09-12 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-09-19 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-09-26 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-10-03 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-10-10 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-10-17 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only'),
    ('Girls Only Morning Run', 'Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.', 'run', '2025-10-24 07:00:00+00', 45, 'KYND, CANGGU', 999, false, true, 0, 'Free for all members - Women only');

-- Show summary
SELECT 
    title,
    COUNT(*) as event_count,
    MIN(date) as first_event,
    MAX(date) as last_event,
    CASE 
        WHEN is_free THEN 'FREE'
        ELSE CONCAT((price_cents / 100)::TEXT, ' IDR')
    END as price
FROM events 
GROUP BY title, is_free, price_cents
ORDER BY MIN(date); 