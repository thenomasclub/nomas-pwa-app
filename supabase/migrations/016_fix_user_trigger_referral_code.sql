-- Migration: Fix handle_new_user function to remove referral_code reference
-- The referral_code column was removed in migration 003 but 014 still references it

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    klaviyo_response http_response;
    first_name TEXT;
    last_name TEXT;
    display_name TEXT;
    supabase_url TEXT;
    supabase_key TEXT;
BEGIN
    -- First, create the profile without referral_code
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

    -- Get Supabase settings from environment
    BEGIN
        SELECT current_setting('app.app_supabase_url', true) INTO supabase_url;
        SELECT current_setting('app.app_supabase_anon_key', true) INTO supabase_key;
        
        -- Fallback to hardcoded values if settings not available
        IF supabase_url IS NULL OR supabase_url = '' THEN
            supabase_url := 'https://uhkksexuecjfzmgdbwax.supabase.co';
        END IF;
        
        IF supabase_key IS NULL OR supabase_key = '' THEN
            supabase_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa2tzZXh1ZWNqZnptZ2Rid2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMzUyNjcsImV4cCI6MjA2NTYxMTI2N30.RfuUEAu6EMU5LWu9O_sTpH5L_oRH7Z6KfAIql_UL_Bk';
        END IF;
    END;

    -- Add user to Klaviyo (async call - don't fail if this fails)
    BEGIN
        SELECT * INTO klaviyo_response FROM http((
            'POST',
            supabase_url || '/functions/v1/add-to-klaviyo',
            ARRAY[
                http_header('Authorization', 'Bearer ' || supabase_key),
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

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile and adds user to Klaviyo mailing list (fixed referral_code issue)';
