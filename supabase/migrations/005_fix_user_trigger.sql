-- Fix the handle_new_user function to properly handle user metadata
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 