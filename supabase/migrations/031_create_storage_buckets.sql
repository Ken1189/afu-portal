-- ============================================================
-- 031: Create Supabase Storage buckets
-- Required for avatar uploads, media library, and public assets
-- ============================================================

-- Create buckets (public access for serving images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
-- Anyone can read avatars (public)
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Users can update their own avatar
CREATE POLICY "Users update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- RLS policies for media bucket
-- Anyone can read media (public)
CREATE POLICY "Public media access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Admins can manage media
CREATE POLICY "Admins manage media" ON storage.objects
FOR ALL USING (
  bucket_id = 'media'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- RLS policies for public-assets bucket
-- Anyone can read public assets
CREATE POLICY "Public assets access" ON storage.objects
FOR SELECT USING (bucket_id = 'public-assets');

-- Admins can manage public assets
CREATE POLICY "Admins manage public assets" ON storage.objects
FOR ALL USING (
  bucket_id = 'public-assets'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
