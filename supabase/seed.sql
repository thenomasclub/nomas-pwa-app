-- Insert sample events
INSERT INTO events (title, description, type, date, duration_minutes, location, max_slots, is_featured) VALUES
    -- Running events
    ('Morning Run - Central Park', 'Start your day with an energizing 5K run through Central Park', 'run', 
     NOW() + INTERVAL '1 day' + TIME '07:00:00', 60, 'Central Park Main Entrance', 20, true),
    
    ('Sunset Beach Run', 'Enjoy a scenic run along the beach as the sun sets', 'run',
     NOW() + INTERVAL '2 days' + TIME '18:30:00', 45, 'Santa Monica Beach', 15, false),
    
    ('Weekend Trail Run', 'Challenge yourself with a trail run through the hills', 'run',
     NOW() + INTERVAL '5 days' + TIME '08:00:00', 90, 'Griffith Park Trails', 12, true),
    
    -- Pilates events
    ('Core Power Pilates', 'Strengthen your core with this intensive pilates session', 'pilates',
     NOW() + INTERVAL '1 day' + TIME '09:00:00', 60, 'Nomas Studio A', 10, true),
    
    ('Beginner Pilates', 'Perfect for those new to pilates or returning after a break', 'pilates',
     NOW() + INTERVAL '3 days' + TIME '10:00:00', 45, 'Nomas Studio A', 12, false),
    
    ('Advanced Mat Pilates', 'Take your practice to the next level', 'pilates',
     NOW() + INTERVAL '4 days' + TIME '17:00:00', 60, 'Nomas Studio B', 8, false),
    
    -- Padel events
    ('Padel Doubles Tournament', 'Join our friendly doubles tournament', 'padel',
     NOW() + INTERVAL '6 days' + TIME '14:00:00', 120, 'Nomas Padel Courts', 16, true),
    
    ('Padel for Beginners', 'Learn the basics of this exciting sport', 'padel',
     NOW() + INTERVAL '2 days' + TIME '16:00:00', 90, 'Nomas Padel Court 1', 8, false),
    
    ('Mixed Doubles Practice', 'Improve your game in a relaxed setting', 'padel',
     NOW() + INTERVAL '7 days' + TIME '11:00:00', 90, 'Nomas Padel Courts', 12, false),
    
    -- Special events
    ('Wellness Workshop: Nutrition Basics', 'Learn about balanced nutrition for active lifestyles', 'event',
     NOW() + INTERVAL '3 days' + TIME '19:00:00', 90, 'Nomas Community Room', 30, true),
    
    ('Community BBQ & Social', 'Meet other Nomas members at our monthly social', 'event',
     NOW() + INTERVAL '8 days' + TIME '13:00:00', 180, 'Nomas Rooftop Terrace', 50, true),
    
    ('Yoga & Meditation Retreat', 'A half-day retreat to reset and recharge', 'event',
     NOW() + INTERVAL '10 days' + TIME '09:00:00', 240, 'Nomas Wellness Center', 20, false); 