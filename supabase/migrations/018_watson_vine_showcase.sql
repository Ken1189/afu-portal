-- ============================================================
-- 018: Watson & Fine showcase farms
-- Insert Watson & Fine Group and Watson Cassava Starch
-- as real farmer_public_profiles with is_showcase = true
-- ============================================================

INSERT INTO farmer_public_profiles (
  slug,
  display_name,
  story,
  hero_photo_url,
  country,
  region,
  crops,
  farm_size_ha,
  is_showcase
) VALUES (
  'watson-and-fine',
  'Watson & Fine Group',
  'Watson & Fine is a diversified commercial farming operation and the founding farm behind AFU. Led by Peter Watson, the group spans 120 hectares across Mashonaland with operations in high-value horticulture, tree crops, and livestock. As AFU''s flagship partner farm, Watson & Fine serves as the model for what integrated, technology-enabled commercial agriculture looks like in Zimbabwe.',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&h=400&fit=crop',
  'Zimbabwe',
  'Mashonaland',
  ARRAY['Blueberries', 'Macadamia', 'Citrus', 'Cattle'],
  120,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO farmer_public_profiles (
  slug,
  display_name,
  story,
  hero_photo_url,
  country,
  region,
  crops,
  farm_size_ha,
  is_showcase
) VALUES (
  'watson-cassava',
  'Watson Cassava Starch',
  'A dedicated cassava production and starch extraction operation supplying industrial starch to regional manufacturers. The farm demonstrates AFU''s processing hub model — growing the raw material and adding value before it leaves the farm gate.',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&h=400&fit=crop',
  'Zimbabwe',
  'Mashonaland East',
  ARRAY['Cassava', 'Starch Processing'],
  45,
  true
)
ON CONFLICT (slug) DO NOTHING;
