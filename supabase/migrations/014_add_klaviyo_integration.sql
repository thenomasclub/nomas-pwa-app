-- Migration: Add Klaviyo integration to user creation trigger
-- This updates the handle_new_user function to also add users to Klaviyo

-- Enable http extension to make API calls from database functions
CREATE EXTENSION IF NOT EXISTS http;

-- Update the handle_new_user function to include Klaviyo integration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    klaviyo_response http_response;
    first_name TEXT;
    last_name TEXT;
    display_name TEXT;
BEGIN
    -- First, create the profile as before
    INSERT INTO public.profiles (id, email, display_name, profile_picture_url, date_of_birth)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'profile_picture',
        (NEW.raw_user_meta_data->>'date_of_birth')::DATE
    );

    -- Extract names from metadata
    display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
    first_name := NEW.raw_user_meta_data->>'first_name';
    last_name := NEW.raw_user_meta_data->>'last_name';

    -- If no separate first/last name, try to split display name
    IF first_name IS NULL AND display_name IS NOT NULL THEN
        first_name := split_part(display_name, ' ', 1);
        IF display_name LIKE '% %' THEN
            last_name := substring(display_name FROM position(' ' IN display_name) + 1);
        END IF;
    END IF;

    -- Add user to Klaviyo (async call - don't fail if this fails)
    BEGIN
        SELECT * INTO klaviyo_response FROM http((
            'POST',
            current_setting('app.app_supabase_url') || '/functions/v1/add-to-klaviyo',
            ARRAY[
                http_header('Authorization', 'Bearer ' || current_setting('app.app_supabase_anon_key')),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'email', NEW.email,
                'firstName', first_name,
                'lastName', last_name,
                'membershipTier', 'free'
            )::text
        ));

        -- Log success (optional)
        RAISE LOG 'Klaviyo integration response: % %', klaviyo_response.status, klaviyo_response.content;

    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Klaviyo integration failed: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add existing users to Klaviyo (optional utility function)
CREATE OR REPLACE FUNCTION public.sync_user_to_klaviyo(user_id UUID)
RETURNS json AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    profile_record profiles%ROWTYPE;
    klaviyo_response http_response;
    first_name TEXT;
    last_name TEXT;
BEGIN
    -- Get user and profile data
    SELECT * INTO user_record FROM auth.users WHERE id = user_id;
    SELECT * INTO profile_record FROM profiles WHERE id = user_id;

    IF user_record.id IS NULL THEN
        RETURN json_build_object('error', 'User not found');
    END IF;

    -- Extract names
    first_name := user_record.raw_user_meta_data->>'first_name';
    last_name := user_record.raw_user_meta_data->>'last_name';
    
    IF first_name IS NULL AND profile_record.display_name IS NOT NULL THEN
        first_name := split_part(profile_record.display_name, ' ', 1);
        IF profile_record.display_name LIKE '% %' THEN
            last_name := substring(profile_record.display_name FROM position(' ' IN profile_record.display_name) + 1);
        END IF;
    END IF;

    -- Call Klaviyo function
    SELECT * INTO klaviyo_response FROM http((
        'POST',
        current_setting('app.app_supabase_url') || '/functions/v1/add-to-klaviyo',
        ARRAY[
            http_header('Authorization', 'Bearer ' || current_setting('app.app_supabase_anon_key')),
            http_header('Content-Type', 'application/json')
        ],
        'application/json',
        json_build_object(
            'email', user_record.email,
            'firstName', first_name,
            'lastName', last_name,
            'membershipTier', COALESCE(profile_record.membership_tier, 'free')
        )::text
    ));

    RETURN json_build_object(
        'status', klaviyo_response.status,
        'response', klaviyo_response.content::json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to document the integration
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile and adds user to Klaviyo mailing list';
COMMENT ON FUNCTION public.sync_user_to_klaviyo(UUID) IS 'Manually sync an existing user to Klaviyo';
