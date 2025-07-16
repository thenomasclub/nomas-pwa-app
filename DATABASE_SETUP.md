# Database Setup Guide

This guide explains how to set up the database to save all user profile data including profile pictures and date of birth.

## Required Database Changes

### 1. Apply the Profiles Table Migration

You need to run the SQL migration in `supabase/migrations/002_create_profiles_table.sql` to create the profiles table and trigger.

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/002_create_profiles_table.sql`
4. Click **Run** to execute the migration

#### Option B: Using Supabase CLI (if you have it set up)

```bash
npx supabase migration up
```

### 2. Set Up Storage Bucket for Profile Pictures

#### Create the Avatars Bucket

1. In your Supabase Dashboard, go to **Storage**
2. Click **Create bucket**
3. Name it `avatars`
4. Set **Public bucket** to `true`
5. Click **Create bucket**

#### Set Up Storage Policies

1. In the Storage section, click on the `avatars` bucket
2. Go to **Policies** tab
3. Add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

**Policy 3: Allow users to update their own avatars**
```sql
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Verify Setup

After applying the migration and setting up storage, test the signup process:

1. Try creating a new account with:
   - Email and password
   - Profile picture upload
   - Date of birth
   

2. Check that data is saved in:
   - `auth.users` table (email, user_metadata)
   - `profiles` table (all profile information)
   - `avatars` storage bucket (profile picture file)

## What This Setup Enables

### User Profile Data Storage

- **Email**: Stored in both `auth.users` and `profiles` tables
- **Display Name**: Auto-generated from email prefix, stored in `profiles`
- **Profile Picture**: 
  - File uploaded to `avatars` storage bucket
  - Public URL stored in `profiles.profile_picture_url`
- **Date of Birth**: Stored in `profiles.date_of_birth`


### Automatic Profile Creation

The database trigger automatically creates a profile record whenever a new user signs up, extracting data from the user metadata and storing it in structured database fields.

### Security

- Row Level Security (RLS) ensures users can only access their own profile data
- Storage policies control who can upload and view profile pictures
- All sensitive operations require authentication

## Troubleshooting

### Migration Fails
- Check that you have sufficient permissions in Supabase
- Ensure the `update_updated_at_column()` function exists (from migration 001)

### Storage Upload Fails
- Verify the `avatars` bucket exists and is public
- Check that storage policies are correctly configured
- Ensure the bucket has sufficient storage quota

### Profile Not Created
- Check that the trigger `on_auth_user_created` exists
- Verify the `handle_new_user()` function was created successfully
- Look for errors in the Supabase logs

## Next Steps

Once this is set up, all user registrations will automatically:
1. Create an auth user
2. Upload profile picture to storage (if provided)
3. Create a profile record with all information
4. Enable users to view and edit their profile data

The app is now ready to fully save and manage user profile information! 