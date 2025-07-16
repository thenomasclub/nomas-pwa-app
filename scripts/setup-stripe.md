# Stripe Setup Guide for Nomas PWA

This guide walks you through completing the Stripe integration setup.

## 1. Configure Stripe Products and Prices

### Get Your Price IDs from Stripe Dashboard

1. Go to your Stripe Dashboard → Products
2. Find your three membership products:
   - Nomas Exclusive Club - 1 Month
   - Nomas Exclusive Club - 3 Months  
   - Nomas Exclusive Club - 6 Months

3. Click on each product and copy the **Price ID** (starts with `price_`)

### Update the Webhook Function

Edit `supabase/functions/stripe-webhook/index.ts` and update the `priceToTier` mapping:

```typescript
const priceToTier: Record<string, string> = {
  "price_YOUR_MONTHLY_PRICE_ID": "monthly",
  "price_YOUR_QUARTERLY_PRICE_ID": "quarterly", 
  "price_YOUR_SEMIANNUAL_PRICE_ID": "semiannual",
};
```

## 2. Configure Stripe Webhooks

### Required Webhook Events

Set up a webhook endpoint in your Stripe Dashboard pointing to:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
```

**Enable these events:**

#### Subscription Management
- `customer.subscription.created`
- `customer.subscription.updated` 
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.trial_will_end`

#### Payment Handling
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

#### Customer Management
- `customer.updated`

#### Dispute Handling (Optional)
- `charge.dispute.created`

### Webhook Secret

1. Copy the webhook **Signing Secret** from Stripe Dashboard
2. Add it to your Supabase environment variables as `STRIPE_WEBHOOK_SECRET`

## 3. Configure Stripe Customer Portal

### Enable Customer Portal in Stripe

1. Go to Stripe Dashboard → Settings → Billing
2. Enable Customer Portal
3. Configure allowed features:
   - ✅ Update payment methods
   - ✅ Download invoices
   - ✅ Cancel subscriptions
   - ✅ View subscription history

### Required Business Information

Fill out your business information in Stripe Settings:
- Business name
- Support contact information
- Terms of service URL
- Privacy policy URL

## 4. Environment Variables

Ensure these are set in your Supabase project:

```bash
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. Test the Integration

### Testing Checklist

1. **Subscription Creation**
   - [ ] Create subscription via checkout
   - [ ] Verify webhook processes correctly
   - [ ] Check profile is updated with membership tier

2. **Payment Failures**
   - [ ] Use test card `4000000000000002` (declined)
   - [ ] Verify webhook handles `invoice.payment_failed`
   - [ ] Check profile shows "past_due" status

3. **Customer Portal**
   - [ ] Click "Manage Subscription" in profile
   - [ ] Verify redirect to Stripe portal
   - [ ] Test updating payment method
   - [ ] Test canceling subscription

4. **Subscription Status Changes**
   - [ ] Test subscription updates
   - [ ] Verify database reflects changes
   - [ ] Check frontend shows correct status

## 6. Monitoring

### Webhook Logs

Monitor webhook processing in your Supabase database:

```sql
-- View recent webhook logs
SELECT * FROM webhook_logs 
ORDER BY processed_at DESC 
LIMIT 50;

-- Check for failed webhooks
SELECT * FROM webhook_logs 
WHERE status = 'error'
ORDER BY processed_at DESC;
```

### Stripe Dashboard

Monitor in Stripe Dashboard:
- Events → View webhook delivery attempts
- Logs → Check for API errors
- Revenue Recognition → Track subscription metrics

## 7. Production Checklist

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Update webhook URL to production domain
- [ ] Test with real payment methods
- [ ] Configure proper business information
- [ ] Set up fraud protection rules
- [ ] Enable radar (if needed)
- [ ] Test dispute handling workflow

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure endpoint URL matches exactly

2. **Customer portal not working**
   - Verify business information is filled in Stripe
   - Check customer portal is enabled
   - Ensure customer has valid Stripe customer ID

3. **Payment status not updating**
   - Check webhook events are properly configured
   - Verify database migration ran successfully
   - Check webhook logs for errors

### Debug Webhook Issues

```typescript
// Add this to webhook function for debugging
console.log('Webhook Event:', {
  type: event.type,
  customer: (event.data.object as any).customer,
  subscription: (event.data.object as any).subscription,
});
``` 