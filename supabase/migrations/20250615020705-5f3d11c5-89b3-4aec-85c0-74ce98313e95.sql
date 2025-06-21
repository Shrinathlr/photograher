
-- Create a public bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read profile photos
CREATE POLICY "Public read access to profile-photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Users can upload their own profile photo in their folder
CREATE POLICY "Users can upload their own profile photo"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (name LIKE CONCAT(auth.uid(), '/%'))
  );

-- Users can update their own profile photo in their folder
CREATE POLICY "Users can update their own profile photo"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND (name LIKE CONCAT(auth.uid(), '/%'))
  );

-- Add bio, location, and profile_photo_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
