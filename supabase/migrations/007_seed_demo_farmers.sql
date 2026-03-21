-- ============================================================================
-- AFU PORTAL — MIGRATION 007: SEED DEMO FARMER PROFILES
-- Makes member_id nullable so demo profiles can exist without auth users.
-- When real members opt in via their dashboard, they get linked properly.
-- ============================================================================

-- Step 1: Make member_id nullable for seed/demo data
ALTER TABLE farmer_public_profiles ALTER COLUMN member_id DROP NOT NULL;

-- Step 2: Seed 6 demo farmer profiles across 6 AFU countries
INSERT INTO farmer_public_profiles (
  slug, display_name, story, farm_description,
  hero_photo_url, photo_urls, country, region,
  crops, farm_size_ha, family_members_supported, years_farming,
  is_active, is_featured,
  monthly_funding_needed, monthly_funding_received, total_sponsors
) VALUES
(
  'grace-moyo',
  'Grace Moyo',
  'Grace is a third-generation farmer in Matabeleland who has transformed her family''s traditional farm into a thriving commercial operation. After losing most of her crop to drought in 2019, she adopted conservation farming techniques through AFU''s training program and has since tripled her yield. Grace now mentors 15 other women farmers in her district and dreams of establishing a cooperative processing facility.',
  'Mixed crop and small livestock farm focusing on drought-resistant sorghum, groundnuts, and indigenous chickens. Grace uses conservation tillage and rainwater harvesting to maximize yields in the semi-arid Matabeleland region.',
  'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Matabeleland South',
  ARRAY['Sorghum', 'Groundnuts', 'Cowpeas', 'Indigenous Chickens'],
  4.5, 8, 22,
  true, true,
  150.00, 85.00, 3
),
(
  'joseph-odhiambo',
  'Joseph Odhiambo',
  'Joseph left his job in Nairobi to return to his family''s land in Kisumu County. Starting with just 2 hectares, he has built a model farm that combines traditional Luo farming knowledge with modern precision agriculture. His farm now supplies fresh vegetables to three supermarket chains and employs 8 local youth. Joseph''s vision is to prove that farming can be a first-choice career for young Africans.',
  'Intensive horticulture and fish farming operation using drip irrigation and greenhouse technology. Tilapia ponds integrated with vegetable gardens in an aquaponics-inspired system.',
  'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
  'Kenya', 'Kisumu County',
  ARRAY['Tomatoes', 'Kale', 'Capsicum', 'Tilapia', 'French Beans'],
  6.0, 12, 8,
  true, true,
  200.00, 120.00, 5
),
(
  'amina-hussein',
  'Amina Hussein',
  'Amina is a second-generation rice farmer in the Kilombero Valley, one of Tanzania''s most productive agricultural regions. After completing AFU''s financial literacy program, she secured her first formal loan and invested in improved rice varieties and mechanical threshers. Her yields have increased by 60% and she now exports premium rice to neighbouring countries.',
  'Irrigated rice paddy farm in the fertile Kilombero floodplain with supplementary vegetable gardens. Uses SRI (System of Rice Intensification) methods for maximum water efficiency.',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1586771107445-d3190d36fe06?w=600&h=400&fit=crop'],
  'Tanzania', 'Kilombero Valley',
  ARRAY['Rice', 'Maize', 'Vegetables', 'Cassava'],
  3.2, 6, 15,
  true, false,
  120.00, 45.00, 2
),
(
  'sipho-dlamini',
  'Sipho Dlamini',
  'Sipho runs one of Botswana''s few certified organic farms, supplying premium produce to hotels and restaurants in Gaborone. He pioneered the use of solar-powered drip irrigation in the Kalahari region and has become a vocal advocate for climate-smart agriculture. Through AFU, Sipho has connected with international organic buyers and is working toward EU organic certification.',
  'Certified organic vegetable and herb farm operating in the challenging semi-arid climate near Gaborone. Features solar-powered irrigation, composting systems, and indigenous pollinator gardens.',
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'],
  'Botswana', 'South-East District',
  ARRAY['Organic Vegetables', 'Herbs', 'Moringa', 'Citrus'],
  8.0, 5, 12,
  true, true,
  180.00, 95.00, 4
),
(
  'fatima-banda',
  'Fatima Banda',
  'Fatima leads a women''s farming cooperative of 30 members in Zambia''s Copperbelt Province. After years of subsistence farming, she joined AFU and learned about value-added processing. Her cooperative now produces packaged groundnut butter and dried vegetables sold across Zambia. Fatima''s goal is to build a processing facility that will create 50 permanent jobs for women in her community.',
  'Cooperative farm growing groundnuts, soybeans, and vegetables with a small-scale processing unit for value addition. Members share equipment and marketing through the cooperative structure.',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
  'Zambia', 'Copperbelt Province',
  ARRAY['Groundnuts', 'Soybeans', 'Sweet Potatoes', 'Leafy Vegetables'],
  12.0, 30, 18,
  true, false,
  250.00, 60.00, 2
),
(
  'emeka-nwosu',
  'Emeka Nwosu',
  'Emeka is a young agripreneur from Anambra State who returned from studying agricultural science in Lagos to modernize his family''s cassava farm. He introduced mechanized processing and now produces garri and cassava flour that meets export standards. Emeka uses AFU''s marketplace to connect with buyers across West Africa and is expanding into cassava-based animal feed production.',
  'Mechanized cassava farm with integrated processing facility producing garri, cassava flour, and animal feed pellets. Uses improved TME 419 cassava varieties for high starch content.',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop'],
  'Nigeria', 'Anambra State',
  ARRAY['Cassava', 'Maize', 'Plantain', 'Oil Palm'],
  5.0, 10, 5,
  true, false,
  175.00, 30.00, 1
);

-- Step 3: Seed some demo farmer updates
INSERT INTO farmer_updates (farmer_profile_id, title, content, photo_urls, program_stage)
SELECT
  fp.id,
  'Planting Season Update',
  'The rains have arrived and we have planted all our fields. The improved seed varieties from AFU''s input programme are showing excellent germination rates. We are expecting a bumper harvest this season!',
  ARRAY['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
  'Growing'
FROM farmer_public_profiles fp WHERE fp.slug = 'grace-moyo';

INSERT INTO farmer_updates (farmer_profile_id, title, content, photo_urls, program_stage)
SELECT
  fp.id,
  'New Greenhouse Completed',
  'Thanks to our sponsors, we have completed construction of a 200sqm greenhouse. This will allow year-round production of tomatoes and capsicum, increasing our revenue by an estimated 40%.',
  ARRAY['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop'],
  'Infrastructure'
FROM farmer_public_profiles fp WHERE fp.slug = 'joseph-odhiambo';

INSERT INTO farmer_updates (farmer_profile_id, title, content, photo_urls, program_stage)
SELECT
  fp.id,
  'Organic Certification Progress',
  'Great news! We have passed the first stage of EU organic certification inspection. The inspector was impressed with our composting systems and biodiversity practices. Full certification expected within 6 months.',
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'],
  'Certification'
FROM farmer_public_profiles fp WHERE fp.slug = 'sipho-dlamini';
