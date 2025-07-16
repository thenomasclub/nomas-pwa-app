-- Event Pricing Management Scripts
-- Run these in your Supabase Dashboard SQL Editor

-- 1. View current event pricing
SELECT 
  id,
  title,
  type,
  date,
  is_free,
  price_cents,
  CASE 
    WHEN price_cents = 0 THEN 'Free'
    ELSE '$' || (price_cents / 100.0)::text
  END as price_display,
  pricing_note
FROM events 
ORDER BY date DESC;

-- 2. Set an event as free
-- UPDATE events SET is_free = true, price_cents = 0 WHERE id = 'your-event-id';

-- 3. Set an event as paid ($25.00)
-- UPDATE events SET is_free = false, price_cents = 2500, pricing_note = 'Premium event' WHERE id = 'your-event-id';

-- 4. Set an event as paid ($15.00)
-- UPDATE events SET is_free = false, price_cents = 1500, pricing_note = 'Special event' WHERE id = 'your-event-id';

-- 5. Set all events of a specific type as paid
-- UPDATE events SET is_free = false, price_cents = 2000, pricing_note = 'Workshop fee' WHERE type = 'workshop';

-- 6. Set all events of a specific type as free
-- UPDATE events SET is_free = true, price_cents = 0, pricing_note = NULL WHERE type = 'run';

-- 7. View booking payment status
SELECT 
  b.id,
  e.title,
  p.email,
  b.payment_status,
  b.amount_paid_cents,
  CASE 
    WHEN b.amount_paid_cents = 0 THEN 'Free'
    ELSE '$' || (b.amount_paid_cents / 100.0)::text
  END as amount_paid_display,
  b.created_at
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN profiles p ON b.user_id = p.id
ORDER BY b.created_at DESC;

-- 8. View events with their booking counts and payment status
SELECT 
  e.title,
  e.type,
  e.date,
  e.is_free,
  CASE 
    WHEN e.price_cents = 0 THEN 'Free'
    ELSE '$' || (e.price_cents / 100.0)::text
  END as price_display,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.payment_status = 'paid' THEN 1 END) as paid_bookings,
  COUNT(CASE WHEN b.payment_status = 'pending' THEN 1 END) as pending_payments,
  COUNT(CASE WHEN b.payment_status = 'failed' THEN 1 END) as failed_payments
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id
GROUP BY e.id, e.title, e.type, e.date, e.is_free, e.price_cents
ORDER BY e.date DESC; 