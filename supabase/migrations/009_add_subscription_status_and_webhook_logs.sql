-- Migration: Add subscription status tracking and webhook logging
-- This migration adds subscription_status to profiles and creates webhook_logs table

-- Add subscription_status column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' 
CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing', 'paused', 'incomplete', 'incomplete_expired'));

-- Create webhook_logs table for monitoring Stripe webhook events
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  details TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_webhook_logs_customer_id ON webhook_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- Enable RLS for webhook_logs (service role access only)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_logs (service role can read/write, users cannot access)
CREATE POLICY "Service role can manage webhook logs" ON webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Add comment to document the table
COMMENT ON TABLE webhook_logs IS 'Logs all Stripe webhook events for monitoring and debugging';
COMMENT ON COLUMN webhook_logs.event_type IS 'Stripe webhook event type (e.g., customer.subscription.updated)';
COMMENT ON COLUMN webhook_logs.customer_id IS 'Stripe customer ID or other identifier';
COMMENT ON COLUMN webhook_logs.status IS 'Processing status: success or error';
COMMENT ON COLUMN webhook_logs.details IS 'Additional details about the event processing';
COMMENT ON COLUMN webhook_logs.processed_at IS 'When the webhook was processed';

-- Update existing profiles to have default subscription_status
UPDATE profiles 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL 
  AND membership_tier != 'free';

UPDATE profiles 
SET subscription_status = 'canceled' 
WHERE subscription_status IS NULL 
  AND membership_tier = 'free' 
  AND stripe_customer_id IS NOT NULL; 