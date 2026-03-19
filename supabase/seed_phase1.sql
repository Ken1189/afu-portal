-- ============================================================================
-- AFU PORTAL — PHASE 1 SEED DATA
-- Populates all new tables from Migration 002
-- ============================================================================

-- We need member IDs. Get them from the members table.
-- If no members exist yet, create placeholder member references.
-- This seed assumes at least one member exists (the farmer@afu.org test user).

-- ── COURSES ──────────────────────────────────────────────────────────────────

INSERT INTO courses (title, description, category, difficulty, duration_minutes, modules_count, instructor, rating, image_url, topics, published) VALUES
('Introduction to Sustainable Farming', 'Learn the fundamentals of sustainable agriculture practices for African climates.', 'agronomy', 'beginner', 60, 6, 'Dr. Amina Osei', 4.80, 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600', ARRAY['sustainability', 'soil health', 'water management'], true),
('Export Quality Standards — EU Market', 'Understanding phytosanitary requirements and quality certifications for European export markets.', 'compliance', 'intermediate', 90, 8, 'Prof. Tendai Murimi', 4.60, 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600', ARRAY['export', 'compliance', 'EU regulations'], true),
('Post-Harvest Handling & Cold Chain', 'Best practices for reducing post-harvest losses through proper handling and cold chain management.', 'agronomy', 'intermediate', 75, 8, 'Dr. Joseph Kimambo', 4.70, 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600', ARRAY['post-harvest', 'cold chain', 'storage'], true),
('Soil Health & Fertility Management', 'Comprehensive guide to soil testing, pH management, and organic fertility building.', 'agronomy', 'beginner', 45, 6, 'Dr. Keletso Pilane', 4.50, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', ARRAY['soil', 'fertilizer', 'composting'], true),
('Mobile Money for Farmers', 'Using M-Pesa, EcoCash, and Orange Money for farm business transactions.', 'finance', 'beginner', 30, 4, 'Naledi Tau', 4.90, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', ARRAY['mobile money', 'payments', 'financial literacy'], true),
('Precision Agriculture with IoT', 'Deploy soil sensors, weather stations, and drone technology for data-driven farming.', 'technology', 'advanced', 120, 10, 'Sipho Ndlovu', 4.40, 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=600', ARRAY['IoT', 'drones', 'precision farming'], true),
('Livestock Health Management', 'Disease prevention, vaccination schedules, and nutrition for cattle and small ruminants.', 'agronomy', 'intermediate', 60, 7, 'Dr. Farai Chikwanha', 4.30, 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600', ARRAY['livestock', 'veterinary', 'nutrition'], true),
('Farm Business Planning', 'Create a bankable farm business plan that attracts financing and partners.', 'business', 'beginner', 45, 5, 'Thabo Mokoena', 4.70, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', ARRAY['business plan', 'finance', 'strategy'], true),
('Climate-Smart Agriculture', 'Adapting to climate change through drought-tolerant varieties and water harvesting.', 'agronomy', 'intermediate', 90, 8, 'Dr. Amina Osei', 4.60, 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600', ARRAY['climate', 'drought', 'water harvesting'], true),
('Agricultural Insurance Essentials', 'Understanding crop, livestock, and asset insurance products for risk management.', 'finance', 'beginner', 40, 5, 'Naledi Tau', 4.50, 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=600', ARRAY['insurance', 'risk', 'claims'], true);

-- ── INSURANCE PRODUCTS ───────────────────────────────────────────────────────

INSERT INTO insurance_products (name, type, description, coverage_details, premium_range, deductible_percent, waiting_period_days, eligibility, active) VALUES
('CropGuard Basic', 'crop', 'Weather-index crop insurance covering drought and flood damage for staple crops.', '{"perils": ["drought", "flood", "hail"], "max_coverage_usd": 50000}', '{"min": 50, "max": 500, "currency": "USD"}', 5.00, 14, ARRAY['maize', 'sorghum', 'wheat', 'rice'], true),
('CropGuard Premium', 'crop', 'Comprehensive crop insurance with multi-peril coverage and yield guarantee.', '{"perils": ["drought", "flood", "hail", "pest", "disease"], "max_coverage_usd": 200000, "yield_guarantee_percent": 70}', '{"min": 200, "max": 2000, "currency": "USD"}', 3.00, 7, ARRAY['all crops'], true),
('LivestockShield', 'livestock', 'Mortality and theft coverage for cattle, goats, sheep, and poultry.', '{"perils": ["mortality", "theft", "disease"], "max_coverage_usd": 100000}', '{"min": 100, "max": 1000, "currency": "USD"}', 5.00, 30, ARRAY['cattle', 'goat', 'sheep', 'poultry'], true),
('FarmAsset Protect', 'asset', 'Covers farm equipment, buildings, and stored produce against damage and theft.', '{"perils": ["fire", "theft", "storm", "vandalism"], "max_coverage_usd": 500000}', '{"min": 150, "max": 3000, "currency": "USD"}', 10.00, 14, ARRAY['equipment', 'buildings', 'stored produce'], true),
('AgriHealth Plus', 'medical', 'Medical insurance for farming families covering hospital, outpatient, and maternity.', '{"coverage": ["hospitalization", "outpatient", "maternity", "dental"], "max_coverage_usd": 25000}', '{"min": 30, "max": 300, "currency": "USD"}', 0, 30, ARRAY['member families'], true),
('TradeGuard', 'trade', 'Export trade credit insurance covering buyer default and political risk.', '{"perils": ["buyer_default", "political_risk", "currency_inconvertibility"], "max_coverage_usd": 1000000}', '{"min": 500, "max": 10000, "currency": "USD"}', 5.00, 0, ARRAY['exporters'], true);

-- ── EQUIPMENT ────────────────────────────────────────────────────────────────

INSERT INTO equipment (name, type, description, daily_rate, currency, location, country, status, image_url, specifications) VALUES
('John Deere 5075E Tractor', 'tractor', '75HP utility tractor suitable for plowing, planting, and transport.', 150.00, 'USD', 'Gaborone', 'Botswana', 'available', 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600', '{"hp": 75, "fuel": "diesel", "hours": 1200}'),
('DJI Agras T40 Drone', 'drone', 'Agricultural spraying drone with 40L tank capacity and RTK positioning.', 200.00, 'USD', 'Harare', 'Zimbabwe', 'available', 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=600', '{"tank_capacity_l": 40, "flight_time_min": 20, "spray_width_m": 11}'),
('Solar Irrigation Pump 5HP', 'irrigation', 'Solar-powered irrigation system with 5HP pump and 50m head.', 75.00, 'USD', 'Dar es Salaam', 'Tanzania', 'available', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600', '{"hp": 5, "head_m": 50, "flow_lpm": 200, "solar_panels": 8}'),
('Claas Lexion 780 Harvester', 'harvester', 'Large-scale grain combine harvester with 12m header.', 500.00, 'USD', 'Nairobi', 'Kenya', 'available', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600', '{"header_width_m": 12, "grain_tank_l": 12000}'),
('Boom Sprayer 800L', 'sprayer', 'Tractor-mounted boom sprayer with 800L tank and 12m boom width.', 80.00, 'USD', 'Lusaka', 'Zambia', 'available', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', '{"tank_l": 800, "boom_width_m": 12}'),
('Massey Ferguson 385 Tractor', 'tractor', '85HP tractor ideal for medium to large farms.', 180.00, 'USD', 'Johannesburg', 'South Africa', 'available', 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600', '{"hp": 85, "fuel": "diesel"}'),
('Seed Drill Planter', 'planter', 'Precision seed drill for row crops with fertilizer attachment.', 90.00, 'USD', 'Francistown', 'Botswana', 'available', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600', '{"rows": 6, "row_spacing_cm": 75}'),
('Grain Dryer 10T', 'dryer', 'Batch grain dryer with 10 tonne capacity for post-harvest processing.', 120.00, 'USD', 'Maputo', 'Mozambique', 'available', 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=600', '{"capacity_tonnes": 10, "fuel": "lpg"}'),
('Knapsack Sprayer 20L', 'sprayer', 'Manual knapsack sprayer for smallholder pest and weed management.', 5.00, 'USD', 'Freetown', 'Sierra Leone', 'available', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', '{"capacity_l": 20, "type": "manual"}'),
('Water Tanker 5000L', 'irrigation', 'Mobile water tanker for irrigation and livestock watering.', 60.00, 'USD', 'Abuja', 'Nigeria', 'available', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600', '{"capacity_l": 5000}');

-- ── MARKET PRICES ────────────────────────────────────────────────────────────

INSERT INTO market_prices (commodity, market_location, country, price, currency, unit, date, source) VALUES
-- Botswana
('Maize', 'Gaborone', 'Botswana', 320.00, 'USD', 'tonne', CURRENT_DATE, 'Botswana Grain Board'),
('Sorghum', 'Gaborone', 'Botswana', 280.00, 'USD', 'tonne', CURRENT_DATE, 'Botswana Grain Board'),
('Beef', 'Gaborone', 'Botswana', 4.50, 'USD', 'kg', CURRENT_DATE, 'BMC Price Bulletin'),
-- Zimbabwe
('Maize', 'Harare', 'Zimbabwe', 290.00, 'USD', 'tonne', CURRENT_DATE, 'GMB'),
('Tobacco', 'Harare', 'Zimbabwe', 3.80, 'USD', 'kg', CURRENT_DATE, 'TIMB'),
('Soybean', 'Harare', 'Zimbabwe', 450.00, 'USD', 'tonne', CURRENT_DATE, 'GMB'),
-- Tanzania
('Rice', 'Dar es Salaam', 'Tanzania', 650.00, 'USD', 'tonne', CURRENT_DATE, 'NFRA'),
('Maize', 'Dar es Salaam', 'Tanzania', 310.00, 'USD', 'tonne', CURRENT_DATE, 'NFRA'),
('Cashew', 'Dar es Salaam', 'Tanzania', 2.20, 'USD', 'kg', CURRENT_DATE, 'CBT'),
-- Kenya
('Tea', 'Nairobi', 'Kenya', 2.80, 'USD', 'kg', CURRENT_DATE, 'KTDA'),
('Coffee', 'Nairobi', 'Kenya', 5.60, 'USD', 'kg', CURRENT_DATE, 'NCE'),
('Maize', 'Nairobi', 'Kenya', 340.00, 'USD', 'tonne', CURRENT_DATE, 'NCPB'),
-- South Africa
('Maize', 'Johannesburg', 'South Africa', 280.00, 'USD', 'tonne', CURRENT_DATE, 'SAFEX'),
('Wheat', 'Johannesburg', 'South Africa', 380.00, 'USD', 'tonne', CURRENT_DATE, 'SAFEX'),
('Citrus', 'Cape Town', 'South Africa', 1.20, 'USD', 'kg', CURRENT_DATE, 'CGA'),
-- Nigeria
('Cocoa', 'Lagos', 'Nigeria', 8.50, 'USD', 'kg', CURRENT_DATE, 'NCB'),
('Rice', 'Abuja', 'Nigeria', 700.00, 'USD', 'tonne', CURRENT_DATE, 'NFRA'),
('Cassava', 'Lagos', 'Nigeria', 120.00, 'USD', 'tonne', CURRENT_DATE, 'NCAM'),
-- Zambia
('Maize', 'Lusaka', 'Zambia', 260.00, 'USD', 'tonne', CURRENT_DATE, 'FRA'),
('Tobacco', 'Lusaka', 'Zambia', 3.50, 'USD', 'kg', CURRENT_DATE, 'TAZ'),
-- Mozambique
('Cashew', 'Maputo', 'Mozambique', 2.00, 'USD', 'kg', CURRENT_DATE, 'INCAJU'),
('Rice', 'Maputo', 'Mozambique', 580.00, 'USD', 'tonne', CURRENT_DATE, 'SIMA'),
-- Sierra Leone
('Rice', 'Freetown', 'Sierra Leone', 750.00, 'USD', 'tonne', CURRENT_DATE, 'MAFFS'),
('Cocoa', 'Freetown', 'Sierra Leone', 7.80, 'USD', 'kg', CURRENT_DATE, 'SLPMB');

-- ── COOPERATIVES ─────────────────────────────────────────────────────────────

INSERT INTO cooperatives (name, country, region, member_count, established_date, description, contact_email, status) VALUES
('Tuli Block Farmers Cooperative', 'Botswana', 'Tuli Block', 245, '2018-06-15', 'Cattle and crop farmers in the Tuli Block area pooling resources for input purchasing and market access.', 'tuliblock@coops.bw', 'active'),
('Chimanimani Coffee Growers', 'Zimbabwe', 'Manicaland', 180, '2015-03-20', 'Specialty coffee growers in the Eastern Highlands focusing on fair-trade certification.', 'chimcoffee@coops.zw', 'active'),
('Kilimanjaro Smallholders Union', 'Tanzania', 'Kilimanjaro', 520, '2012-01-10', 'Coffee and banana growers on the slopes of Mount Kilimanjaro.', 'kilismall@coops.tz', 'active'),
('Rift Valley Grain Cooperative', 'Kenya', 'Rift Valley', 380, '2016-09-05', 'Wheat and maize producers in Kenya''s grain basket pooling storage and transport.', 'rvgrain@coops.ke', 'active'),
('Limpopo Citrus Association', 'South Africa', 'Limpopo', 95, '2019-04-01', 'Emerging citrus farmers accessing EU export markets through collective grading facilities.', 'limpocitrus@coops.za', 'active'),
('Niger Delta Rice Growers', 'Nigeria', 'Rivers State', 450, '2014-07-22', 'Rice paddy farmers with shared milling and drying infrastructure.', 'ndrice@coops.ng', 'active'),
('Kafue Flats Livestock', 'Zambia', 'Southern Province', 210, '2017-11-30', 'Cattle ranchers managing communal grazing and veterinary services.', 'kafuelivestock@coops.zm', 'active'),
('Gaza Province Cashew Cooperative', 'Mozambique', 'Gaza', 320, '2013-05-18', 'Cashew nut producers with shared processing and export coordination.', 'gazacashew@coops.mz', 'active'),
('Kono Diamond District Cocoa Farmers', 'Sierra Leone', 'Kono', 175, '2020-02-28', 'Cocoa farmers transitioning from artisanal mining to sustainable agriculture.', 'konofarmer@coops.sl', 'active');

-- ── Historical market prices (last 7 days for trend data) ────────────────────

INSERT INTO market_prices (commodity, market_location, country, price, currency, unit, date, source) VALUES
('Maize', 'Gaborone', 'Botswana', 318.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '1 day', 'Botswana Grain Board'),
('Maize', 'Gaborone', 'Botswana', 315.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '2 days', 'Botswana Grain Board'),
('Maize', 'Gaborone', 'Botswana', 312.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '3 days', 'Botswana Grain Board'),
('Maize', 'Gaborone', 'Botswana', 310.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '4 days', 'Botswana Grain Board'),
('Maize', 'Gaborone', 'Botswana', 305.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '5 days', 'Botswana Grain Board'),
('Maize', 'Gaborone', 'Botswana', 308.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '6 days', 'Botswana Grain Board'),
('Maize', 'Gaborone', 'Botswana', 300.00, 'USD', 'tonne', CURRENT_DATE - INTERVAL '7 days', 'Botswana Grain Board'),
('Coffee', 'Nairobi', 'Kenya', 5.55, 'USD', 'kg', CURRENT_DATE - INTERVAL '1 day', 'NCE'),
('Coffee', 'Nairobi', 'Kenya', 5.50, 'USD', 'kg', CURRENT_DATE - INTERVAL '2 days', 'NCE'),
('Coffee', 'Nairobi', 'Kenya', 5.45, 'USD', 'kg', CURRENT_DATE - INTERVAL '3 days', 'NCE'),
('Coffee', 'Nairobi', 'Kenya', 5.40, 'USD', 'kg', CURRENT_DATE - INTERVAL '4 days', 'NCE'),
('Coffee', 'Nairobi', 'Kenya', 5.35, 'USD', 'kg', CURRENT_DATE - INTERVAL '5 days', 'NCE'),
('Cocoa', 'Lagos', 'Nigeria', 8.45, 'USD', 'kg', CURRENT_DATE - INTERVAL '1 day', 'NCB'),
('Cocoa', 'Lagos', 'Nigeria', 8.40, 'USD', 'kg', CURRENT_DATE - INTERVAL '2 days', 'NCB'),
('Cocoa', 'Lagos', 'Nigeria', 8.30, 'USD', 'kg', CURRENT_DATE - INTERVAL '3 days', 'NCB'),
('Cocoa', 'Lagos', 'Nigeria', 8.20, 'USD', 'kg', CURRENT_DATE - INTERVAL '4 days', 'NCB');
