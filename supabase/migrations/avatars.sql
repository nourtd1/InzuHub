-- Run this in your Supabase SQL Editor to setup Storage for avatars

-- 1. Create the 'avatars' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup RLS Policies for avatars

-- "Upload avatar propre"
CREATE POLICY "Upload avatar propre"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- "Lecture publique avatars"
CREATE POLICY "Lecture publique avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- "Suppression avatar propre"
CREATE POLICY "Suppression avatar propre"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Note: You might need to drop existing policies before running this if they conflict, 
-- or ensure that policies don't already exist.
