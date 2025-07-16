# Simplified Event Pricing Guide

## 🎯 **How It Works (No Stripe Price IDs Needed!)**

This implementation uses **Stripe Payment Intents** with custom amounts, which is much simpler than creating pre-defined price IDs.

### **✅ Benefits of This Approach:**

1. **No Stripe Dashboard Setup** - No need to create products/prices in Stripe
2. **Flexible Pricing** - Change prices directly in your database
3. **Simple Management** - Just update the `price_cents` field
4. **Real-time Pricing** - Prices update immediately without Stripe changes

## 🗄️ **Database Structure**

### **Events Table:**
```sql
is_free: BOOLEAN         -- true = free for everyone
is_premium_event: BOOLEAN -- true = ALL users pay (including premium members)
price_cents: INTEGER     -- 0 = free, 2500 = £25.00, 15000 = £150.00
pricing_note: TEXT       -- Optional notes like "Weekend getaway - ALL pay"
```

### **Bookings Table:**
```sql
payment_status: TEXT -- 'not_required', 'pending', 'paid', 'failed'
amount_paid_cents: INTEGER -- How much was actually paid
stripe_payment_intent_id: TEXT -- Stripe payment reference
```

## 💳 **Payment Flow**

### **For Free Members:**
1. User clicks "Join" on paid event
2. System checks: `is_free = false` + user is not premium
3. Creates Stripe Payment Intent with `amount: event.price_cents`
4. User pays the exact amount
5. Payment success → booking confirmed

### **For Premium Members:**
1. User clicks "Join" on regular paid event
2. System checks: user has active premium membership + event is NOT premium
3. Booking created immediately (no payment)
4. `payment_status = 'not_required'`

### **For Premium Events (Weekend Getaways):**
1. User clicks "Join" on premium event
2. System checks: `is_premium_event = true` 
3. Creates Stripe Payment Intent with `amount: event.price_cents`
4. ALL users pay (including premium members)
5. Payment success → booking confirmed

## 🛠️ **How to Set Event Pricing**

### **In Supabase Dashboard:**

1. **Go to Table Editor** → `events` table
2. **Edit any event** and set:
   - `is_free`: `true` (free) or `false` (paid)
   - `is_premium_event`: `true` (ALL pay) or `false` (premium members free)
   - `price_cents`: `0` (free) or amount in cents (e.g., `15000` for £150.00)
   - `pricing_note`: Optional description

### **Example SQL Commands:**

```sql
-- Make an event free for everyone
UPDATE events SET is_free = true, price_cents = 0 WHERE id = 'your-event-id';

-- Make a regular paid event £25.00 (free for premium members)
UPDATE events SET is_free = false, is_premium_event = false, price_cents = 2500 WHERE id = 'your-event-id';

-- Make a premium event £150.00 (ALL members pay, including premium)
UPDATE events SET is_free = false, is_premium_event = true, price_cents = 15000 WHERE id = 'your-event-id';

-- Make all workshops £20.00 (free for premium members)
UPDATE events SET is_free = false, is_premium_event = false, price_cents = 2000 WHERE type = 'workshop';

-- Make all weekend getaways premium events £150.00 (ALL pay)
UPDATE events SET is_free = false, is_premium_event = true, price_cents = 15000 WHERE title ILIKE '%weekend%';
```

## 📊 **Monitoring Payments**

### **View Payment Status:**
```sql
SELECT 
  e.title,
  p.email,
  b.payment_status,
  b.amount_paid_cents,
  b.created_at
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN profiles p ON b.user_id = p.id
WHERE b.payment_status != 'not_required'
ORDER BY b.created_at DESC;
```

### **View Event Revenue:**
```sql
SELECT 
  e.title,
  COUNT(b.id) as total_bookings,
  SUM(b.amount_paid_cents) / 100.0 as total_revenue_gbp
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id AND b.payment_status = 'paid'
WHERE e.is_free = false
GROUP BY e.id, e.title
ORDER BY total_revenue_gbp DESC;
```

## 🔧 **Technical Details**

### **Stripe Integration:**
- Uses **Payment Intents** (not Products/Prices)
- Amount comes directly from `event.price_cents`
- No pre-configuration needed in Stripe Dashboard
- Supports any currency and amount

### **Webhook Events:**
- `payment_intent.succeeded` → Updates booking to 'paid'
- `payment_intent.payment_failed` → Updates booking to 'failed'
- All events logged in `webhook_logs` table

## 🎉 **Advantages Over Price IDs:**

| **This Approach** | **Stripe Price IDs** |
|-------------------|----------------------|
| ✅ Change prices instantly | ❌ Need to create new prices in Stripe |
| ✅ No Stripe setup required | ❌ Must configure products/prices |
| ✅ Flexible pricing | ❌ Fixed pricing structure |
| ✅ Simple database updates | ❌ Complex Stripe API calls |
| ✅ Real-time price changes | ❌ Delayed price updates |

## 🚀 **Ready to Use!**

1. **Run the SQL script** in Supabase Dashboard
2. **Set event prices** using the examples above
3. **Deploy the edge function**: `npx supabase functions deploy create-event-payment`
4. **Test with a paid event** - users will be prompted for payment

The system is now ready for your hybrid pricing model with maximum flexibility! 🎯 