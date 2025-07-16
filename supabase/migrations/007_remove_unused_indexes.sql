-- Migration to remove unused indexes that are causing Supabase performance warnings
-- This migration removes indexes that are not being used by the application queries

-- Remove the email index from profiles table
-- The application only queries profiles by id (primary key), never by email
DROP INDEX IF EXISTS idx_profiles_email;

-- Note: The referral_codes table and its index were already removed in migration 003
-- but if the index still exists somehow, we can safely drop it again
DROP INDEX IF EXISTS idx_referral_codes_code; 