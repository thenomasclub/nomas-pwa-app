-- Create profiles table to store extended user information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    profile_picture_url TEXT,
    date_of_birth DATE,
    referral_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);

-- Add trigger for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, profile_picture_url, date_of_birth, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'profile_picture',
        (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
        NEW.raw_user_meta_data->>'referral_code'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: You also need to create a storage bucket for avatars in the Supabase dashboard
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket named "avatars"
-- 3. Set it to public
-- 4. Add these policies for the avatars bucket:
--    - Allow authenticated users to upload: (bucket_id = 'avatars' AND auth.role() = 'authenticated')
--    - Allow public read access: bucket_id = 'avatars' 