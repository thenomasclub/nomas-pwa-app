-- Migration: Simplify user trigger to fix database errors
-- Remove Klaviyo integration temporarily to isolate the issue

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple profile creation without external calls
    INSERT INTO public.profiles (id, email, display_name, profile_picture_url, date_of_birth)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'profile_picture',
        CASE 
            WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
            ELSE NULL
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Simple user profile creation without external integrations';
