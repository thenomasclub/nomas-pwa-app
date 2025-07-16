-- Migration to set up storage bucket for profile pictures
-- This creates the avatars bucket and sets up proper security policies

-- Insert the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for the avatars bucket

-- Policy 1: Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- Policy 2: Allow public read access to avatars
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy 3: Allow users to update their own avatars
-- The folder structure will be: userId/avatar.ext
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
); 