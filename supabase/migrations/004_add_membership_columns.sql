-- Add membership and Stripe columns to profiles table for scalable subscription management
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ; 