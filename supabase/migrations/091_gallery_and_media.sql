-- Gallery Items & Media Articles
-- Two new content tables for public gallery and media/press coverage

-- ── Gallery Items ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',  -- general, farming, events, team, partners, facilities
  country TEXT,
  photographer TEXT,
  date_taken DATE,
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Public read for visible items
CREATE POLICY "Anyone can read visible gallery items"
  ON gallery_items FOR SELECT
  USING (visible = true);

-- Admin full access
CREATE POLICY "Admins can manage gallery items"
  ON gallery_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE INDEX idx_gallery_items_category ON gallery_items (category);
CREATE INDEX idx_gallery_items_visible ON gallery_items (visible);
CREATE INDEX idx_gallery_items_display_order ON gallery_items (display_order);

GRANT SELECT ON gallery_items TO anon, authenticated;
GRANT ALL ON gallery_items TO authenticated;

-- ── Media Articles ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  publication TEXT NOT NULL,      -- e.g. "Reuters", "Bloomberg", "The Herald"
  article_url TEXT,
  excerpt TEXT,
  image_url TEXT,
  published_date DATE,
  article_type TEXT DEFAULT 'press',  -- press, blog_feature, tv, radio, podcast, award
  country TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE media_articles ENABLE ROW LEVEL SECURITY;

-- Public read for visible articles
CREATE POLICY "Anyone can read visible media articles"
  ON media_articles FOR SELECT
  USING (visible = true);

-- Admin full access
CREATE POLICY "Admins can manage media articles"
  ON media_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE INDEX idx_media_articles_type ON media_articles (article_type);
CREATE INDEX idx_media_articles_visible ON media_articles (visible);
CREATE INDEX idx_media_articles_featured ON media_articles (is_featured);
CREATE INDEX idx_media_articles_published_date ON media_articles (published_date DESC);

GRANT SELECT ON media_articles TO anon, authenticated;
GRANT ALL ON media_articles TO authenticated;
