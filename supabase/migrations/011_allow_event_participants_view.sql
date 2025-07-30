-- Migration: Allow users to view profiles of other event participants
-- This migration adds a policy to allow users to view profiles of other users who have booked the same events

-- Add policy to allow viewing profiles of event participants
CREATE POLICY "Users can view profiles of event participants" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b1
            JOIN bookings b2 ON b1.event_id = b2.event_id
            WHERE b1.user_id = auth.uid()
            AND b2.user_id = profiles.id
            AND b1.status = 'confirmed'
            AND b2.status = 'confirmed'
        )
    );

-- Add policy to allow viewing profiles of users who have booked events (for event participants)
-- This allows viewing profiles of anyone who has booked any event
CREATE POLICY "Users can view profiles of event bookers" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE user_id = profiles.id
            AND status = 'confirmed'
        )
    ); 