-- ============================================================================
-- 070_seed_farmer_profiles.sql
-- Seed 6 realistic farmer profiles for the sponsor-a-farmer feature.
-- Idempotent: ON CONFLICT (slug) DO NOTHING — safe to re-run.
--
-- Note: member_id was made nullable in migration 007 specifically so demo
-- profiles can exist without an auth user. We use distinct slugs (suffixed
-- with -afu) so this seed coexists with the older 007 demo seed.
-- ============================================================================

INSERT INTO farmer_public_profiles (
  slug, display_name, story, farm_description,
  hero_photo_url, photo_urls, country, region,
  crops, farm_size_ha, family_members_supported, years_farming,
  is_active, is_featured,
  monthly_funding_needed, monthly_funding_received, total_sponsors
) VALUES
(
  'grace-moyo-afu',
  'Grace Moyo',
  'Grace has been farming maize and groundnuts in Mashonaland West for 14 years. After joining AFU she accessed crop insurance and input financing, doubling her yield in two seasons. She now mentors three younger women farmers in her village and is saving for a second borehole.',
  'A 4.5-hectare smallholding rotating maize and groundnuts on red clay soils, with a borehole-fed drip system installed in 2024.',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&auto=format&fit=crop'],
  'Zimbabwe', 'Mashonaland West',
  ARRAY['Maize', 'Groundnuts'],
  4.5, 6, 14,
  true, true,
  75.00, 0.00, 0
),
(
  'joseph-odhiambo-afu',
  'Joseph Odhiambo',
  'Joseph runs a 7-hectare coffee and avocado farm on the slopes of Kilimanjaro. He inherited the land from his father and has been growing arabica for 15 years. AFU connected him to his first export buyer in 2025 and he is now expanding his Hass avocado plot.',
  'Shade-grown arabica coffee intercropped with Hass avocados on volcanic soils at 1,400m elevation.',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80&auto=format&fit=crop'],
  'Tanzania', 'Kilimanjaro',
  ARRAY['Coffee', 'Avocados'],
  7.0, 8, 15,
  true, true,
  120.00, 0.00, 0
),
(
  'amina-hussein-afu',
  'Amina Hussein',
  'Amina grows rice and vegetables on a 3-hectare plot in the Kilombero Valley. After joining AFU she received training in System of Rice Intensification (SRI) and tripled her per-hectare yield. She supports her four children entirely through farming.',
  'Lowland paddy rice rotated with seasonal vegetables — tomatoes, sukuma wiki, and onions — using SRI methods and a treadle pump.',
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80&auto=format&fit=crop'],
  'Kenya', 'Kilombero Valley',
  ARRAY['Rice', 'Vegetables'],
  3.0, 5, 8,
  true, false,
  85.00, 0.00, 0
),
(
  'sipho-dlamini-afu',
  'Sipho Dlamini',
  'Sipho runs a 120-hectare cattle and goat ranch in Botswana''s Central District. With 22 years of experience he was one of AFU''s early commercial members and now uses our trade finance instruments to export beef to South African and Middle Eastern markets.',
  'Mixed Brahman cattle and Boer goat operation on natural grazing, with rotational paddocks and a solar-powered borehole network.',
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80&auto=format&fit=crop'],
  'Botswana', 'Central District',
  ARRAY['Cattle', 'Goats'],
  120.0, 7, 22,
  true, true,
  200.00, 0.00, 0
),
(
  'fatima-diallo-afu',
  'Fatima Diallo',
  'Fatima grows tomatoes and peppers on a 2-hectare farm in the Ashanti region. She started six years ago with one greenhouse tunnel and is now AFU''s top vegetable supplier in Kumasi. Her dream is to add cold storage so she can reach Accra''s premium hotels.',
  'Two protected greenhouse tunnels plus open-field tomatoes and bird''s eye chillies, drip-irrigated from a shared community dam.',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80&auto=format&fit=crop'],
  'Ghana', 'Ashanti',
  ARRAY['Tomatoes', 'Peppers'],
  2.0, 4, 6,
  true, false,
  65.00, 0.00, 0
),
(
  'peter-kamau-afu',
  'Peter Kamau',
  'Peter farms 5 hectares of teff and sorghum in the Oromia highlands. Ten years of dryland farming taught him patience; AFU brought him drought-tolerant seed varieties and a guaranteed offtake contract with an Addis Ababa miller.',
  'Rainfed teff and sorghum rotation on terraced slopes, using zero-till methods and cover cropping to retain soil moisture between rains.',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop'],
  'Ethiopia', 'Oromia',
  ARRAY['Teff', 'Sorghum'],
  5.0, 6, 10,
  true, false,
  95.00, 0.00, 0
)
ON CONFLICT (slug) DO NOTHING;
