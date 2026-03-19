-- ============================================================================
-- AFU PORTAL — SEED DATA
-- Run this after the migration to populate the DB with initial data.
-- This mirrors the mock data from src/lib/data/suppliers.ts
-- ============================================================================

-- ── Admin User (create profile manually — auth user created via Supabase dashboard) ──
-- Note: You must first create an admin user via Supabase Auth dashboard,
-- then update their profile role here using their UUID.

-- Example (replace UUID with actual admin user ID after signup):
-- UPDATE profiles SET role = 'super_admin', full_name = 'AFU Admin' WHERE email = 'admin@afu.org';

-- ── Seed Suppliers ────────────────────────────────────────────────────────

INSERT INTO suppliers (company_name, contact_name, email, phone, website, logo_url, category, status, country, region, description, verified, is_founding, sponsorship_tier, commission_rate, member_discount_percent, rating, review_count, products_count, total_sales, total_orders, certifications, join_date)
VALUES
  ('Kalahari Seeds', 'Thabo Mokoena', 'thabo@kalaharis.co.bw', '+267 71 234 567', 'https://kalaharis.co.bw', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&h=100&fit=crop', 'input-supplier', 'active', 'Botswana', 'Gaborone', 'Premium seed supplier specialising in drought-resistant hybrid varieties for Southern African climates. Certified seed testing lab on-site.', true, true, 'gold', 8.50, 15, 4.70, 124, 24, 1250000, 3200, ARRAY['ISO 9001', 'ISTA Certified'], '2024-03-15'),

  ('ZimEquip Solutions', 'Farai Chikwanha', 'farai@zimequip.co.zw', '+263 77 890 1234', 'https://zimequip.co.zw', 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=100&h=100&fit=crop', 'equipment', 'active', 'Zimbabwe', 'Harare', 'Leading farm equipment dealer offering solar-powered irrigation, tractors, and precision farming tools with 2-year warranty.', true, false, 'silver', 10.00, 12, 4.50, 89, 18, 2800000, 1540, ARRAY['ISO 14001'], '2024-06-01'),

  ('TanzaLogistics', 'Amina Mwakasege', 'amina@tanzalog.co.tz', '+255 78 456 7890', 'https://tanzalog.co.tz', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop', 'logistics', 'active', 'Tanzania', 'Dar es Salaam', 'Cold-chain logistics and grain haulage across East Africa. Own fleet of 45 refrigerated trucks and 120 dry-cargo vehicles.', true, true, 'platinum', 7.00, 10, 4.80, 201, 8, 4500000, 8900, ARRAY['HACCP', 'GDP Certified'], '2024-01-10'),

  ('AgroProcess BW', 'Keletso Pilane', 'keletso@agroprocess.co.bw', '+267 72 345 678', 'https://agroprocess.co.bw', 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=100&h=100&fit=crop', 'processing', 'active', 'Botswana', 'Francistown', 'State-of-the-art grain milling and oil extraction facility. Processes 500 tonnes per month with export-grade packaging.', true, false, 'gold', 9.00, 18, 4.60, 156, 12, 3200000, 4200, ARRAY['ISO 22000', 'FSSC 22000'], '2024-04-20'),

  ('FarmTech Africa', 'Sipho Ndlovu', 'sipho@farmtech.africa', '+263 71 567 8901', 'https://farmtech.africa', 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=100&h=100&fit=crop', 'technology', 'active', 'Zimbabwe', 'Bulawayo', 'IoT-enabled precision farming solutions. Soil sensors, drone mapping, and AI-powered crop advisory platform serving 2,000+ farms.', true, false, 'silver', 12.00, 20, 4.40, 78, 15, 890000, 2100, ARRAY['ISO 27001'], '2024-07-15'),

  ('Agri Finance Corp', 'Naledi Tau', 'naledi@agrifinance.co.bw', '+267 73 456 789', 'https://agrifinance.co.bw', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop', 'financial-services', 'active', 'Botswana', 'Gaborone', 'Specialised agricultural micro-finance provider offering crop insurance, input loans, and mobile-money integration.', true, true, 'platinum', 5.00, 8, 4.90, 312, 7, 8500000, 12400, ARRAY['NBFIRA Licensed', 'ISO 31000'], '2024-02-01'),

  ('Green Harvest Seeds', 'Tendai Murimi', 'tendai@greenharv.co.zw', '+263 78 234 5678', 'https://greenharv.co.zw', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop', 'input-supplier', 'active', 'Zimbabwe', 'Masvingo', 'Organic and conventional seed varieties with 95%+ germination rates. Smallholder-friendly pack sizes from 1kg upwards.', true, false, 'bronze', 10.00, 12, 4.30, 67, 20, 650000, 1800, ARRAY['Organic Certified'], '2024-08-10'),

  ('Safari Transport', 'Joseph Kimambo', 'joseph@safaritrans.co.tz', '+255 75 678 9012', 'https://safaritrans.co.tz', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=100&h=100&fit=crop', 'logistics', 'pending', 'Tanzania', 'Arusha', 'Regional logistics provider focusing on cross-border agricultural trade between Tanzania, Kenya, and Uganda.', false, false, NULL, 10.00, 10, 0, 0, 5, 0, 0, ARRAY[]::TEXT[], '2025-03-01'),

  ('BotswanaGrow Tech', 'Mpho Kgositsile', 'mpho@bwgrow.co.bw', '+267 74 567 890', 'https://bwgrow.co.bw', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=100&h=100&fit=crop', 'technology', 'pending', 'Botswana', 'Maun', 'Weather stations and soil monitoring for the Okavango Delta farming region. Solar-powered off-grid solutions.', false, false, NULL, 12.00, 15, 0, 0, 6, 0, 0, ARRAY[]::TEXT[], '2025-02-15'),

  ('MaizeKing Processors', 'Blessing Moyo', 'blessing@maizeking.co.zw', '+263 73 890 1234', 'https://maizeking.co.zw', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=100&h=100&fit=crop', 'processing', 'suspended', 'Zimbabwe', 'Gweru', 'Former large-scale maize processor. Operations suspended pending compliance review and facility upgrades.', false, false, 'bronze', 10.00, 10, 3.10, 45, 10, 420000, 890, ARRAY[]::TEXT[], '2024-05-01');

-- ============================================================================
-- NOTE: More seed data can be added as needed.
-- Products, orders, members etc. will be seeded separately or
-- created through the application UI once it's connected.
-- ============================================================================
