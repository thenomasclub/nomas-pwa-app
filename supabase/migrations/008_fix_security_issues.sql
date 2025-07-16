-- Migration to fix security issues identified by Supabase Security Advisor
-- This migration addresses function search path security and auth configuration

-- Fix search_path security for functions
-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- 2. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        display_name, 
        profile_picture_url, 
        date_of_birth,
        membership_tier
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name', 
            NEW.email
        ),
        NEW.raw_user_meta_data->>'profile_picture',
        CASE 
            WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
            ELSE NULL
        END,
        'free'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; 