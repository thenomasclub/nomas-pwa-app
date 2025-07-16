-- Premium Event Management Scripts
-- Run these in your Supabase Dashboard SQL Editor

-- 1. View all events with their pricing structure
SELECT 
  id,
  title,
  type,
  date,
  is_free,
  is_premium_event,
  price_cents,
  CASE 
    WHEN is_free = true THEN 'Free for All'
    WHEN is_premium_event = true THEN 'Premium Event (ALL pay)'
    ELSE 'Paid Event (Free members pay)'
  END as pricing_type,
  CASE 
    WHEN price_cents = 0 THEN 'Free'
    ELSE '$' || (price_cents / 100.0)::text
  END as price_display,
  pricing_note
FROM events 
ORDER BY date DESC;

-- 2. Create a premium event (weekend getaway - $150)
-- UPDATE events SET 
--   is_free = false, 
--   is_premium_event = true, 
--   price_cents = 15000,
--   pricing_note = 'Weekend getaway - ALL members pay'
-- WHERE id = 'your-event-id';

-- 3. Create a regular paid event (workshop - $25, free for premium members)
-- UPDATE events SET 
--   is_free = false, 
--   is_premium_event = false, 
--   price_cents = 2500,
--   pricing_note = 'Workshop - Free for premium members'
-- WHERE id = 'your-event-id';

-- 4. Make all weekend getaways premium events
-- UPDATE events SET 
--   is_free = false, 
--   is_premium_event = true, 
--   price_cents = 15000,
--   pricing_note = 'Weekend getaway - ALL members pay'
-- WHERE title ILIKE '%weekend%' OR title ILIKE '%getaway%' OR title ILIKE '%retreat%';

-- 5. View booking payments by event type
SELECT 
  e.title,
  e.type,
  CASE 
    WHEN e.is_free = true THEN 'Free'
    WHEN e.is_premium_event = true THEN 'Premium Event'
    ELSE 'Regular Paid'
  END as event_type,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.payment_status = 'paid' THEN 1 END) as paid_bookings,
  COUNT(CASE WHEN b.payment_status = 'not_required' THEN 1 END) as free_bookings,
  SUM(CASE WHEN b.payment_status = 'paid' THEN b.amount_paid_cents ELSE 0 END) / 100.0 as total_revenue_usd
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id
GROUP BY e.id, e.title, e.type, e.is_free, e.is_premium_event
ORDER BY total_revenue_usd DESC;

-- 6. View who paid for premium events (should include premium members)
SELECT 
  e.title as event_title,
  p.email,
  p.membership_tier,
  b.payment_status,
  b.amount_paid_cents / 100.0 as amount_paid_usd,
  b.created_at
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN profiles p ON b.user_id = p.id
WHERE e.is_premium_event = true
ORDER BY b.created_at DESC;

-- 7. Revenue comparison: Premium events vs Regular events
SELECT 
  CASE 
    WHEN e.is_premium_event = true THEN 'Premium Events'
    WHEN e.is_free = false THEN 'Regular Paid Events'
    ELSE 'Free Events'
  END as event_category,
  COUNT(e.id) as event_count,
  COUNT(b.id) as total_bookings,
  SUM(CASE WHEN b.payment_status = 'paid' THEN b.amount_paid_cents ELSE 0 END) / 100.0 as total_revenue_usd,
  AVG(CASE WHEN b.payment_status = 'paid' THEN b.amount_paid_cents ELSE 0 END) / 100.0 as avg_revenue_per_booking
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id
GROUP BY 
  CASE 
    WHEN e.is_premium_event = true THEN 'Premium Events'
    WHEN e.is_free = false THEN 'Regular Paid Events'
    ELSE 'Free Events'
  END
ORDER BY total_revenue_usd DESC; 