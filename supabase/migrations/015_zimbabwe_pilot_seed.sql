-- ============================================================================
-- AFU PORTAL — MIGRATION 015: ZIMBABWE PILOT SEED DATA
-- Realistic seed data for the Zimbabwe pilot launch.
-- Includes farmer profiles, training courses, market prices, and equipment.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. ZIMBABWE FARMER PUBLIC PROFILES (for the sponsor page)
--    Six Zimbabwe-based farmers with realistic backgrounds.
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO farmer_public_profiles (
  slug, display_name, story, farm_description,
  hero_photo_url, photo_urls, country, region,
  crops, farm_size_ha, family_members_supported, years_farming,
  is_active, is_featured,
  monthly_funding_needed, monthly_funding_received, total_sponsors
) VALUES
(
  'grace-moyo-mashonaland',
  'Grace Moyo',
  'Grace inherited a small plot in Mashonaland East from her grandmother and has steadily expanded it into a productive maize and groundnut operation. After joining AFU''s mentorship programme she adopted row-planting techniques that doubled her maize yield in a single season. She now supplies local grain traders and reinvests profits into her children''s school fees.',
  'A 3.5-hectare mixed-crop farm in the fertile Mashonaland East lowveld. Grace practises intercropping of maize and groundnuts with composted cattle manure, achieving above-average yields for the district.',
  'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1501004318855-e73e6e1a1593?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Mashonaland East',
  ARRAY['Maize', 'Groundnuts'],
  3.5, 6, 14,
  true, true,
  150.00, 0.00, 0
),
(
  'tendai-chirwa',
  'Tendai Chirwa',
  'Tendai is a second-generation tobacco farmer in Manicaland who diversified into maize after volatile auction prices nearly bankrupted him. Through AFU''s financial literacy training he learned to hedge his income across two crops and now consistently turns a profit. He is working toward contract farming agreements with regional processors.',
  'A 5-hectare farm in the Manicaland highlands growing flue-cured Virginia tobacco alongside dryland maize. Tendai uses a combination of curing barns and open-air drying racks for his tobacco crop.',
  'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Manicaland',
  ARRAY['Tobacco', 'Maize'],
  5.0, 5, 18,
  true, true,
  250.00, 0.00, 0
),
(
  'rumbidzai-ngwenya',
  'Rumbidzai Ngwenya',
  'Rumbidzai farms a compact 2-hectare plot near Masvingo where she grows drought-tolerant sorghum and pearl millet. She joined AFU to access improved seed varieties and has since become a seed multiplier for her community, distributing certified stock to neighbouring smallholders each planting season.',
  'A dryland smallholding near Great Zimbabwe focused on climate-resilient grain production. Rumbidzai employs minimum-tillage techniques and mulching to conserve moisture in the semi-arid Masvingo lowveld.',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Masvingo',
  ARRAY['Sorghum', 'Millet'],
  2.0, 4, 9,
  true, false,
  100.00, 0.00, 0
),
(
  'simba-chikwanha',
  'Simba Chikwanha',
  'Simba manages an 8-hectare farm in the Midlands where he grows cotton and sunflower under contract-farming arrangements. He was one of the first farmers in his district to adopt mechanical planting and has since helped 20 neighbours gain access to shared equipment through an AFU-backed cooperative.',
  'An 8-hectare Midlands farm producing seed cotton and sunflower for oil processing. Simba uses ox-drawn rippers for conservation tillage and supplements income with sunflower pressing at a nearby community mill.',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Midlands',
  ARRAY['Cotton', 'Sunflower'],
  8.0, 7, 22,
  true, true,
  300.00, 0.00, 0
),
(
  'nyasha-mutasa',
  'Nyasha Mutasa',
  'Nyasha left a teaching career to take over her family farm in Mashonaland West. She introduced winter wheat under irrigation and summer soybeans, creating a year-round income stream. AFU''s agronomy advisors helped her optimise fertiliser use, cutting input costs by 25 percent while maintaining yield.',
  'A 4.5-hectare irrigated farm in Mashonaland West rotating winter wheat with summer soybeans. Nyasha uses centre-pivot irrigation fed by a borehole and practises precision nutrient management.',
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1586771107445-d3190d36fe06?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Mashonaland West',
  ARRAY['Wheat', 'Soybeans'],
  4.5, 3, 7,
  true, false,
  200.00, 0.00, 0
),
(
  'tatenda-moyo',
  'Tatenda Moyo',
  'Tatenda runs a mixed cattle-and-crop operation in Matabeleland South, a region historically known for livestock. He has invested in improved Brahman-cross genetics and supplementary maize feed to increase calving rates. With AFU''s trade-finance support he is preparing his first live-cattle export consignment to Mozambique.',
  'A 6-hectare mixed farm in Matabeleland South combining a 40-head Brahman-cross cattle herd with rain-fed maize for both human consumption and livestock feed. Tatenda manages rotational grazing paddocks and a small feedlot.',
  'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1501004318855-e73e6e1a1593?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Matabeleland South',
  ARRAY['Cattle', 'Maize'],
  6.0, 8, 25,
  true, true,
  350.00, 0.00, 0
);


-- ────────────────────────────────────────────────────────────────────────────
-- 2. TRAINING COURSES — Zimbabwe-focused agriculture education
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO courses (
  title, description, category, difficulty, duration_minutes,
  modules_count, is_published, country_scope
) VALUES
(
  'Zimbabwe Crop Calendar & Planting Guide',
  'A comprehensive guide to Zimbabwe''s agro-ecological zones, optimal planting windows for major crops, and seasonal management practices. Covers Mashonaland, Matabeleland, Manicaland, and Midlands regions with rainfall data and soil-type recommendations.',
  'farm-basics', 'beginner', 90,
  6, true, ARRAY['Zimbabwe']
),
(
  'Financial Literacy for Smallholder Farmers',
  'Learn to manage farm income and expenses, build savings, understand loan terms, and plan for seasonal cash-flow gaps. Includes practical exercises on record-keeping and budgeting tailored to Zimbabwean smallholders.',
  'financial-literacy', 'beginner', 120,
  8, true, ARRAY['Zimbabwe']
),
(
  'Digital Tools for Modern Farming',
  'An introduction to mobile-based farm management apps, weather forecast services, satellite crop monitoring, and digital marketplaces. Hands-on modules guide farmers through AFU''s platform features and third-party tools available in Zimbabwe.',
  'digital-agriculture', 'intermediate', 75,
  5, true, ARRAY['Zimbabwe']
),
(
  'Export Markets & Trade Compliance',
  'Understand phytosanitary requirements, ZIMRA export procedures, COMESA preferential tariffs, and quality standards for key Zimbabwean export commodities including tobacco, cotton, and horticultural products.',
  'advanced-trading', 'advanced', 150,
  10, true, ARRAY['Zimbabwe']
);


-- ────────────────────────────────────────────────────────────────────────────
-- 3. MARKET PRICES — Current Zimbabwe commodity prices
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO market_prices (commodity, market_location, country, price, currency, unit, date, source) VALUES
('Maize',              'Harare', 'Zimbabwe', 280.00,  'USD', 'tonne', CURRENT_DATE, 'Zimbabwe Grain Millers Association'),
('Tobacco (Virginia)',  'Harare', 'Zimbabwe',   4.50,  'USD', 'kg',    CURRENT_DATE, 'Tobacco Industry & Marketing Board'),
('Cotton (Seed)',       'Harare', 'Zimbabwe',   0.85,  'USD', 'kg',    CURRENT_DATE, 'Cotton Company of Zimbabwe'),
('Sorghum',            'Harare', 'Zimbabwe', 320.00,  'USD', 'tonne', CURRENT_DATE, 'Zimbabwe Grain Millers Association'),
('Groundnuts',         'Harare', 'Zimbabwe', 1200.00, 'USD', 'tonne', CURRENT_DATE, 'Agricultural Marketing Authority'),
('Soybeans',           'Harare', 'Zimbabwe', 650.00,  'USD', 'tonne', CURRENT_DATE, 'Agricultural Marketing Authority'),
('Wheat',              'Harare', 'Zimbabwe', 380.00,  'USD', 'tonne', CURRENT_DATE, 'Zimbabwe Grain Millers Association'),
('Sunflower',          'Harare', 'Zimbabwe', 550.00,  'USD', 'tonne', CURRENT_DATE, 'Agricultural Marketing Authority');


-- ────────────────────────────────────────────────────────────────────────────
-- 4. EQUIPMENT — Items available for hire in Zimbabwe
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO equipment (name, type, description, daily_rate, currency, location, country, status, specifications) VALUES
(
  'Tractor — John Deere 5E Series',
  'tractor',
  '75 HP utility tractor suitable for ploughing, harrowing, and haulage. Includes a 3-point hitch and PTO for implement attachment. Serviced and maintained by AFU''s Harare depot.',
  45.00, 'USD', 'Harare', 'Zimbabwe', 'available',
  '{"horsepower": 75, "fuel": "diesel", "implements_included": ["plough", "harrow"]}'::jsonb
),
(
  'Solar Irrigation Pump',
  'irrigator',
  'Portable solar-powered centrifugal pump capable of delivering 15,000 litres per hour from boreholes or rivers. Ideal for smallholder drip and sprinkler systems. Includes 4 solar panels and mounting frame.',
  15.00, 'USD', 'Masvingo', 'Zimbabwe', 'available',
  '{"flow_rate_lph": 15000, "power_source": "solar", "panels": 4}'::jsonb
),
(
  'Seed Drill — 4-Row Mechanical',
  'plough',
  'Tractor-mounted 4-row mechanical seed drill for precision planting of maize, sorghum, soybeans, and sunflower. Adjustable row spacing (60-90 cm) and seed rate. Reduces seed waste by up to 30% compared to hand broadcasting.',
  25.00, 'USD', 'Bulawayo', 'Zimbabwe', 'available',
  '{"rows": 4, "row_spacing_cm": "60-90", "compatible_crops": ["maize", "sorghum", "soybeans", "sunflower"]}'::jsonb
);
