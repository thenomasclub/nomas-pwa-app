-- Migration to remove referral code functionality
-- This migration removes all referral code related tables, columns, and policies

-- Drop the referral_codes table and its policies
DROP POLICY IF EXISTS "Active referral codes are viewable" ON referral_codes;
DROP TABLE IF EXISTS referral_codes;

-- Remove referral_code column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS referral_code;

-- Drop the index on referral_code in profiles table
DROP INDEX IF EXISTS idx_profiles_referral_code;

-- Update the handle_new_user function to remove referral_code handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, profile_picture_url, date_of_birth)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'profile_picture',
        (NEW.raw_user_meta_data->>'date_of_birth')::DATE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 