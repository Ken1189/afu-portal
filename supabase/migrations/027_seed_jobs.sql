-- ============================================================================
-- AFU PORTAL — MIGRATION 027: SEED JOB LISTINGS
-- Inserts the first 40 key roles (executive + regional + field) into job_listings
-- Also relaxes CHECK constraints to accommodate corporate roles
-- ============================================================================

-- Relax job_type constraint to allow 'Full-time', 'Contract', etc.
ALTER TABLE job_listings DROP CONSTRAINT IF EXISTS job_listings_job_type_check;
ALTER TABLE job_listings ADD CONSTRAINT job_listings_job_type_check
  CHECK (job_type IN ('seasonal', 'permanent', 'specialist', 'equipment_operator', 'processing', 'Full-time', 'Contract', 'Part-time'));

-- Relax pay_type constraint to allow 'annual', 'negotiable', etc.
ALTER TABLE job_listings DROP CONSTRAINT IF EXISTS job_listings_pay_type_check;
ALTER TABLE job_listings ADD CONSTRAINT job_listings_pay_type_check
  CHECK (pay_type IN ('daily', 'weekly', 'monthly', 'per_engagement', 'negotiable', 'annual'));

-- ============================================================================
-- SEED: 40 key roles (C-Suite, Tech, Ops, Commercial, Regional, Country, Field)
-- ============================================================================

INSERT INTO job_listings (id, title, description, sector, job_type, country, region, pay_type, pay_rate, currency, duration_description, workers_needed, farm_name, status, is_approved, created_at)
VALUES
  -- C-Suite (5)
  (gen_random_uuid(), 'Chief Financial Officer (CFO)',
   'Build and lead financial operations across 20 African countries. Manage $500M seed deployment, treasury operations, multi-currency mobile money, and investor-grade reporting. Experience with agricultural finance and African markets required.',
   'Executive', 'Full-time', 'Remote', 'Harare, Zimbabwe', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-20T00:00:00Z'),

  (gen_random_uuid(), 'Chief Risk Officer (CRO)',
   E'Build credit risk models for smallholder lending, design parametric insurance products, and manage Lloyd''s of London coverholder compliance. Bridge between traditional insurance and cutting-edge agritech.',
   'Executive', 'Full-time', 'Remote', 'Harare, Zimbabwe', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-20T00:00:00Z'),

  (gen_random_uuid(), 'Chief Legal Officer (CLO)',
   E'Navigate multi-layered corporate structure: Netherlands Foundation, Mauritius Holdings, country cooperatives, Lloyd''s coverholder, and trade finance contracts across 20 African jurisdictions.',
   'Executive', 'Full-time', 'Remote', 'Mauritius / Netherlands', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-20T00:00:00Z'),

  (gen_random_uuid(), 'Chief Commercial Officer (CCO)',
   'Build the buyer network, negotiate export contracts, manage commodity pricing, and run the trade desk. Ensure every farmer on the platform has a guaranteed offtake buyer.',
   'Executive', 'Full-time', 'Nairobi / Harare', NULL, 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-20T00:00:00Z'),

  (gen_random_uuid(), 'Chief People Officer (CPO)',
   'Scale AFU from 2 people to 1,000+ across 20 African countries in 5 years. Build talent engine, establish competitive compensation across markets, and create the culture that makes AFU the employer of choice in African agritech.',
   'Executive', 'Full-time', 'Remote', 'Travel across Africa', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-20T00:00:00Z'),

  -- Technology & Product (5)
  (gen_random_uuid(), 'VP Engineering',
   'Lead and grow the engineering team from 2 to 25+ developers. Scale a 200+ page Next.js platform with 40+ database tables, AI integration, and mobile money APIs to handle millions of farmers across 20 countries.',
   'Technology', 'Full-time', 'Remote', NULL, 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Technology', 'open', true, '2026-03-19T00:00:00Z'),

  (gen_random_uuid(), 'VP Product',
   E'Own the product roadmap across 5 portals serving illiterate smallholders to commercial farm managers. Design progressive disclosure (Seedling→Pioneer), multilingual UX, and offline-first mobile experiences.',
   'Technology', 'Full-time', 'Remote', 'Periodic field visits to Africa', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Technology', 'open', true, '2026-03-19T00:00:00Z'),

  (gen_random_uuid(), 'Director of Data & AI',
   'Build credit scoring models using satellite and mobile money data, scale the AI crop doctor, develop yield prediction from satellite imagery, and create the multilingual farmer advisory chatbot.',
   'Technology', 'Full-time', 'Remote', NULL, 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Technology', 'open', true, '2026-03-19T00:00:00Z'),

  (gen_random_uuid(), 'Director of Blockchain',
   'Build the EDMA blockchain platform on Polygon: AFUSD stablecoin, RWA tokenization for farm assets, carbon credit trading, supply chain traceability, and smart contracts for automated insurance payouts.',
   'Technology', 'Full-time', 'Remote', NULL, 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Technology', 'open', true, '2026-03-19T00:00:00Z'),

  (gen_random_uuid(), 'Director of InfoSec',
   'Build the information security program across sensitive financial data, farmer PII, and payment transactions in 20 countries. SOC 2, ISO 27001, GDPR, POPIA, and PCI-DSS compliance.',
   'Technology', 'Full-time', 'Remote', NULL, 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Technology', 'open', true, '2026-03-19T00:00:00Z'),

  -- Operations (3)
  (gen_random_uuid(), 'VP Operations',
   'Build the operational machine across 20 African countries: farming operations, lending, insurance, trade finance, and supply chain all running simultaneously. Scale from 2 to 20 countries within 36 months.',
   'Operations', 'Full-time', 'Harare, Zimbabwe', 'Travel across Africa', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Operations', 'open', true, '2026-03-18T00:00:00Z'),

  (gen_random_uuid(), 'Director of Supply Chain',
   'Build supplier networks for farming inputs across 20 countries. Manage equipment procurement, cold chain for perishable exports, warehouse receipt systems, and last-mile delivery to smallholder farmers.',
   'Operations', 'Full-time', 'Harare, Zimbabwe', 'Travel across Africa', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Operations', 'open', true, '2026-03-18T00:00:00Z'),

  (gen_random_uuid(), 'Director of Farmer Success',
   E'Design the farmer onboarding journey, build training programs for the Seedling→Pioneer progression, establish multilingual support operations, and track farmer outcomes across yield, income, and satisfaction.',
   'Operations', 'Full-time', 'Harare, Zimbabwe', 'Travel across Africa', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Operations', 'open', true, '2026-03-18T00:00:00Z'),

  -- Commercial (3)
  (gen_random_uuid(), 'VP Business Development',
   E'Open doors: government MOUs, DFI partnerships (IFC, AfDB, CDC), institutional investor relationships, Lloyd''s syndicates, and strategic alliances. Lead market entry for new countries.',
   'Commercial', 'Full-time', 'Nairobi / Johannesburg', 'Extensive travel', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Commercial', 'open', true, '2026-03-18T00:00:00Z'),

  (gen_random_uuid(), 'Director of Trade Finance',
   'Manage SBLC origination, Letters of Credit processing, banking partner coordination, FX operations, export pre-financing, and warehouse receipt financing for agricultural commodity exports.',
   'Finance', 'Full-time', 'Remote', 'Mauritius', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Finance', 'open', true, '2026-03-18T00:00:00Z'),

  (gen_random_uuid(), 'Senior Commodity Trader',
   'Trade physical agricultural commodities from 20 African countries into global markets. Manage positions in maize, soya, blueberries, macadamia, cashew, cocoa, coffee. Execute spot and forward contracts, hedge price risk, and build the counterparty network.',
   'Commercial', 'Full-time', 'Nairobi / Johannesburg', 'Extensive travel', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Trade Desk', 'open', true, '2026-03-18T00:00:00Z'),

  -- Regional Directors (3)
  (gen_random_uuid(), E'Regional Director \u2014 Southern Africa',
   'Oversee Zimbabwe, Botswana, Mozambique, and Zambia. Own the regional P&L, ensure the Zimbabwe pilot succeeds as the template for all countries, and build cross-border trade operations within SADC.',
   'Regional', 'Full-time', 'Zimbabwe', 'Harare', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Southern Africa', 'open', true, '2026-03-17T00:00:00Z'),

  (gen_random_uuid(), E'Regional Director \u2014 East Africa',
   E'Oversee Uganda, Kenya, and Tanzania. Launch Uganda with 19,000 pre-identified farmers, leverage Kenya''s fintech ecosystem, and scale to 100,000+ farmers within 3 years across the EAC.',
   'Regional', 'Full-time', 'Kenya', 'Nairobi', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU East Africa', 'open', true, '2026-03-17T00:00:00Z'),

  (gen_random_uuid(), E'Regional Director \u2014 West Africa',
   E'Oversee Ghana, Nigeria, and Senegal \u2014 AFU''s largest total addressable market (40M+ farmers in Nigeria alone). Navigate anglophone and francophone markets, cocoa and cashew value chains.',
   'Regional', 'Full-time', 'Ghana', 'Accra', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU West Africa', 'open', true, '2026-03-17T00:00:00Z'),

  -- Country Directors (2)
  (gen_random_uuid(), E'Country Director \u2014 Zimbabwe (Pilot)',
   'The most important Country Director role. Launch the Watson & Fine blueberry export program, onboard the first 5,000 smallholder farmers, register the cooperative, and build the proof-of-concept that unlocks the next $450M+ in deployment.',
   'Country', 'Full-time', 'Zimbabwe', 'Harare', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Zimbabwe', 'open', true, '2026-03-16T00:00:00Z'),

  (gen_random_uuid(), E'Country Director \u2014 Uganda',
   E'Launch Uganda operations with 19,000 pre-identified farmers. Build the team, register the cooperative, establish MTN MoMo/Airtel Money operations, and scale coffee, maize, and banana value chains.',
   'Country', 'Full-time', 'Uganda', 'Kampala', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU Uganda', 'open', true, '2026-03-16T00:00:00Z'),

  -- Country Management (7)
  (gen_random_uuid(), 'Country Operations Manager',
   'Manage day-to-day operations in-country: farmer onboarding, input distribution, crop collection, field team supervision, and logistics coordination. You are the engine that makes a country run.',
   'Country', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Country Ops', 'open', true, '2026-03-15T00:00:00Z'),

  (gen_random_uuid(), 'Country Finance Manager',
   'Manage loan disbursements, collections, mobile money operations, insurance premium collections, and financial reporting at the country level. Experience with microfinance or agricultural lending in Africa required.',
   'Finance', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Country Finance', 'open', true, '2026-03-15T00:00:00Z'),

  (gen_random_uuid(), 'Country Agronomist Lead',
   'The agricultural brain of the country operation. Assess farms, advise farmers, train extension workers, ensure export quality standards (GlobalGAP, HACCP), and provide technical input for credit and insurance decisions.',
   'Agronomy', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Agronomy', 'open', true, '2026-03-15T00:00:00Z'),

  (gen_random_uuid(), 'Country Commercial Manager',
   E'Find the buyers, negotiate prices, ensure every farmer''s harvest has a home. Build local buyer relationships, negotiate offtake agreements with guaranteed minimum prices, and manage the AFU Fresh marketplace.',
   'Commercial', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Country Commercial', 'open', true, '2026-03-15T00:00:00Z'),

  (gen_random_uuid(), 'Country Insurance Officer',
   E'Manage crop insurance sales, process claims, conduct farm assessments, monitor weather data for parametric triggers, and prepare Lloyd''s coverholder reports. Protect farmers from the risks that can wipe out a season.',
   'Insurance', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Insurance', 'open', true, '2026-03-15T00:00:00Z'),

  (gen_random_uuid(), 'Country Compliance Officer',
   'Manage KYC/AML compliance, cooperative governance, regulatory filings, data protection, and audit preparation at the country level. Ensure AFU operates legally and ethically in every market.',
   'Legal', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Compliance', 'open', true, '2026-03-15T00:00:00Z'),

  (gen_random_uuid(), 'Country Ambassador Coordinator',
   'Recruit, train, and manage a network of local ambassadors who sign up farmers, provide basic support, and build trust in communities. Manage compensation, events, and community engagement programs.',
   'Community', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 10, 'AFU Community', 'open', true, '2026-03-15T00:00:00Z'),

  -- Field Operations (3)
  (gen_random_uuid(), 'Field Agronomist',
   'On the ground with farmers every day. Visit farms, test soil, advise on crops, monitor for disease, deliver training, and use the AFU mobile app to record data. Motorcycle licence required.',
   'Agronomy', 'Full-time', 'Multiple Countries', 'Rural locations', 'annual', NULL, 'USD', 'Permanent', 100, 'AFU Field Operations', 'open', true, '2026-03-14T00:00:00Z'),

  (gen_random_uuid(), 'Loan Officer',
   'Assess farmers for creditworthiness, verify character references, monitor loan usage, and manage collections. In the African context, community reputation matters as much as financials. Integrity is non-negotiable.',
   'Finance', 'Full-time', 'Multiple Countries', 'Various', 'annual', NULL, 'USD', 'Permanent', 50, 'AFU Field Operations', 'open', true, '2026-03-14T00:00:00Z'),

  (gen_random_uuid(), 'Warehouse Manager',
   E'Manage receiving, grading, weighing, and storage of agricultural commodities. Warehouse receipt finance means your inventory records are financial instruments \u2014 accuracy is everything. Cold chain experience preferred.',
   'Operations', 'Full-time', 'Multiple Countries', 'Processing hub locations', 'annual', NULL, 'USD', 'Permanent', 20, 'AFU Processing', 'open', true, '2026-03-14T00:00:00Z'),

  -- Central HQ (2)
  (gen_random_uuid(), 'Marketing & Communications Lead',
   E'Build the AFU brand: investor materials, farmer-facing campaigns in multiple languages, social media, PR, and partnership co-branding with Lloyd''s, our banking partners, and government partners.',
   'Marketing', 'Full-time', 'Remote', 'Travel to Africa', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-13T00:00:00Z'),

  (gen_random_uuid(), 'Customer Support Lead',
   'Build the support function from scratch: multilingual phone, WhatsApp, in-app chat, and email support across 20 countries. Train the AI chatbot, track farmer satisfaction, and build the knowledge base.',
   'Operations', 'Full-time', 'Remote', 'Harare, Zimbabwe', 'annual', NULL, 'USD', 'Permanent', 1, 'AFU HQ', 'open', true, '2026-03-13T00:00:00Z'),

  -- Farm Managers - Arable (key countries, 5)
  (gen_random_uuid(), E'Farm Manager \u2014 Arable',
   E'Manage arable farming operations across AFU partner farms in Zimbabwe. Oversee planting, crop rotation, irrigation scheduling, and harvest for maize, soya, blueberries, macadamia, and tobacco. Supervise seasonal labour teams of 20-50 workers. Ensure compliance with export quality standards (GlobalGAP, HACCP). Minimum 5 years commercial farm management experience in Southern Africa.',
   'Farm Management', 'Full-time', 'Zimbabwe', 'Mashonaland / Manicaland', 'monthly', NULL, 'USD', 'Permanent', 3, 'AFU Zimbabwe', 'open', true, '2026-03-25T00:00:00Z'),

  (gen_random_uuid(), E'Farm Manager \u2014 Arable',
   'Lead arable operations on AFU partner farms in Botswana focusing on sorghum, groundnuts, sesame, and cotton. Manage dryland and irrigated cropping systems in semi-arid conditions. Minimum 5 years arable farm management experience.',
   'Farm Management', 'Full-time', 'Botswana', 'Chobe / North-West', 'monthly', NULL, 'BWP', 'Permanent', 2, 'AFU Botswana', 'open', true, '2026-03-25T00:00:00Z'),

  (gen_random_uuid(), E'Farm Manager \u2014 Arable',
   'Manage arable operations across AFU partner farms in Kenya. Oversee production of avocados, coffee, maize, and horticultural crops for both domestic and export markets. Minimum 5 years experience managing commercial farms in East Africa.',
   'Farm Management', 'Full-time', 'Kenya', 'Rift Valley / Central', 'monthly', NULL, 'KES', 'Permanent', 3, 'AFU Kenya', 'open', true, '2026-03-25T00:00:00Z'),

  (gen_random_uuid(), E'Farm Manager \u2014 Arable',
   'Lead arable farming operations on AFU partner farms in Tanzania. Manage production of cassava, sesame, cashews, rice, and avocados. Kiswahili fluency essential. Minimum 5 years farm management experience in East Africa.',
   'Farm Management', 'Full-time', 'Tanzania', 'Morogoro / Iringa / Coast', 'monthly', NULL, 'USD', 'Permanent', 3, 'AFU Tanzania', 'open', true, '2026-03-25T00:00:00Z'),

  (gen_random_uuid(), E'Farm Manager \u2014 Arable',
   'Manage arable operations for AFU in Uganda focusing on coffee (Robusta and Arabica), cashews, maize, and beans. Coordinate with 19,000+ pre-identified farmers in the out-grower network. Minimum 5 years experience in Ugandan agriculture.',
   'Farm Management', 'Full-time', 'Uganda', 'Central / Eastern', 'monthly', NULL, 'UGX', 'Permanent', 2, 'AFU Uganda', 'open', true, '2026-03-25T00:00:00Z')

ON CONFLICT DO NOTHING;
