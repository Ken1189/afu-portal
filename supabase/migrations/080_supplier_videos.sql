-- Supplier videos: each supplier can upload promotional / product demo videos
CREATE TABLE IF NOT EXISTS supplier_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  video_url TEXT,              -- direct upload URL (Supabase Storage)
  thumbnail_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_videos_supplier ON supplier_videos(supplier_id);

-- RLS
ALTER TABLE supplier_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view published supplier videos
CREATE POLICY "Public can view supplier videos"
  ON supplier_videos FOR SELECT USING (true);

-- Suppliers can manage their own videos
CREATE POLICY "Suppliers manage own videos"
  ON supplier_videos FOR ALL
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE profile_id = auth.uid()
    )
  );

-- Admins can manage all
CREATE POLICY "Admins manage all supplier videos"
  ON supplier_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
