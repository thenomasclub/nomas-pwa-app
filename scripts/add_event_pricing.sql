-- Manual SQL script to add event pricing support
-- Run this in your Supabase Dashboard SQL Editor

-- Add pricing columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_note TEXT;

-- Add payment tracking to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' 
CHECK (payment_status IN ('not_required', 'pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER DEFAULT 0;

-- Create index for efficient pricing queries
CREATE INDEX IF NOT EXISTS idx_events_is_free ON events(is_free);
CREATE INDEX IF NOT EXISTS idx_events_price_cents ON events(price_cents);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add comments to document the new fields
COMMENT ON COLUMN events.is_free IS 'Whether this event is free for all members';
COMMENT ON COLUMN events.price_cents IS 'Price in cents (0 for free events)';
COMMENT ON COLUMN events.pricing_note IS 'Additional pricing information or notes';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status for individual event bookings';
COMMENT ON COLUMN bookings.stripe_payment_intent_id IS 'Stripe payment intent ID for this booking';
COMMENT ON COLUMN bookings.amount_paid_cents IS 'Amount paid in cents for this booking';

-- Update existing events to be free by default
UPDATE events 
SET is_free = true, price_cents = 0 
WHERE is_free IS NULL;

-- Update existing bookings to have no payment required
UPDATE bookings 
SET payment_status = 'not_required', amount_paid_cents = 0 
WHERE payment_status IS NULL;

-- Example: Set some events as paid (run these after adding the columns)
-- UPDATE events SET is_free = false, price_cents = 2500, pricing_note = 'Premium workshop' WHERE title LIKE '%workshop%';
-- UPDATE events SET is_free = false, price_cents = 1500, pricing_note = 'Special event' WHERE title LIKE '%special%'; 