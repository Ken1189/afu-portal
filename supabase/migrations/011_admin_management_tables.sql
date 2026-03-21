-- ============================================================================
-- AFU PORTAL — MIGRATION 011: ADMIN MANAGEMENT TABLES
-- Testimonials, FAQ, Managed Partners, Announcements, Legal Pages,
-- Sponsor Tiers, plus seed content for footer/nav/SEO in site_content
-- ============================================================================

-- 1. TESTIMONIALS — Success stories and quotes
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,                    -- 'Smallholder Farmer', 'Commercial Farmer', 'Supplier'
  country TEXT,
  quote TEXT NOT NULL,
  photo_url TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admins manage testimonials" ON testimonials FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE INDEX idx_testimonials_published ON testimonials(is_published, display_order);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 2. FAQ ITEMS — Grouped by category
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general', -- general, membership, payments, farming, loans, sponsorship
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read faq_items" ON faq_items FOR SELECT USING (true);
CREATE POLICY "Admins manage faq_items" ON faq_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE INDEX idx_faq_items_category ON faq_items(category, display_order);
CREATE INDEX idx_faq_items_published ON faq_items(is_published);

CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 3. MANAGED PARTNERS — Partner logos shown on partnerships page
CREATE TABLE IF NOT EXISTS managed_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  category TEXT DEFAULT 'technology', -- technology, banking, ngo, government, telecom, insurance, research
  country TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE managed_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read managed_partners" ON managed_partners FOR SELECT USING (true);
CREATE POLICY "Admins manage managed_partners" ON managed_partners FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE INDEX idx_managed_partners_category ON managed_partners(category);
CREATE INDEX idx_managed_partners_published ON managed_partners(is_published, display_order);

CREATE TRIGGER update_managed_partners_updated_at BEFORE UPDATE ON managed_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 4. ANNOUNCEMENTS — Site-wide banners
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  bg_color TEXT DEFAULT '#1B2A4A',  -- navy default
  text_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON announcements FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE INDEX idx_announcements_active ON announcements(is_active, display_order) WHERE is_active = true;

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 5. LEGAL PAGES — Terms, Privacy, etc. per country
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,     -- 'terms', 'privacy', 'cookies', 'aml-policy'
  title TEXT NOT NULL,
  content TEXT NOT NULL,         -- Markdown or HTML
  country TEXT,                  -- NULL = global, 'KE' = Kenya-specific
  version TEXT DEFAULT '1.0',
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read legal_pages" ON legal_pages FOR SELECT USING (true);
CREATE POLICY "Admins manage legal_pages" ON legal_pages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE INDEX idx_legal_pages_slug ON legal_pages(slug);
CREATE INDEX idx_legal_pages_published ON legal_pages(is_published);

CREATE TRIGGER update_legal_pages_updated_at BEFORE UPDATE ON legal_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 6. SPONSOR TIERS — Editable sponsorship tiers
CREATE TABLE IF NOT EXISTS sponsor_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,            -- 'Bronze', 'Silver', 'Gold', 'Corporate'
  price_usd DECIMAL(10,2) NOT NULL,
  billing_label TEXT DEFAULT '/month',
  description TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_popular BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  cta_text TEXT DEFAULT 'Choose',
  cta_url TEXT,
  icon TEXT,                     -- emoji or lucide icon name
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sponsor_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sponsor_tiers" ON sponsor_tiers FOR SELECT USING (true);
CREATE POLICY "Admins manage sponsor_tiers" ON sponsor_tiers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE INDEX idx_sponsor_tiers_published ON sponsor_tiers(is_published, display_order);

CREATE TRIGGER update_sponsor_tiers_updated_at BEFORE UPDATE ON sponsor_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ── Testimonials ──────────────────────────────────────────
INSERT INTO testimonials (name, role, country, quote, rating, is_featured, display_order) VALUES
('Grace Mwangi', 'Smallholder Farmer', 'KE', 'Before AFU, I could barely feed my family with my maize harvest. Now I have access to quality seeds, fertilizer on credit, and guaranteed buyers for my crop. My income has tripled in two years.', 5, true, 1),
('Tendai Moyo', 'Commercial Farmer', 'ZW', 'The financial tools from AFU helped me secure my first proper loan to buy irrigation equipment. My 50-hectare farm now produces year-round instead of relying on rain season alone.', 5, true, 2),
('Amara Diallo', 'Smallholder Farmer', 'SL', 'The training programs taught me modern techniques for rice cultivation. I went from 2 tonnes per hectare to over 5 tonnes. AFU changed my life and the lives of 30 other farmers in my cooperative.', 5, true, 3),
('Joseph Banda', 'Commercial Farmer', 'ZM', 'Export compliance was always a nightmare until AFU. Their documentation system handles everything — from phytosanitary certificates to customs clearance. I now export directly to European buyers.', 4, false, 4),
('Fatima Hassan', 'Smallholder Farmer', 'TZ', 'The crop insurance through AFU gave me peace of mind for the first time. When drought hit last year, I was compensated within weeks and could replant immediately instead of losing everything.', 5, true, 5),
('Kgosi Molefe', 'Supplier', 'BW', 'As a seed supplier, partnering with AFU connected me to thousands of farmers I could never have reached on my own. Their platform handles all the logistics and payments. It is a game changer for my business.', 4, false, 6);


-- ── FAQ Items ─────────────────────────────────────────────
INSERT INTO faq_items (category, question, answer, display_order) VALUES
('general', 'What is the African Farming Union (AFU)?', 'AFU is a vertically integrated agriculture development platform that provides financing, inputs, processing, offtake, trade finance, and training to farmers across Africa. We operate as both an agri-development bank and an execution engine across 10 countries.', 1),
('general', 'Which countries does AFU operate in?', 'AFU currently operates in 10 African countries: Botswana, Zimbabwe, Tanzania, Kenya, Uganda, Zambia, Sierra Leone, Nigeria, Mozambique, and South Africa. Phase 1 launched in Botswana, Zimbabwe, and Tanzania.', 2),
('membership', 'How do I become an AFU member?', 'Click "Become a Member" on the homepage and complete the application form. You will need to provide your farm details, identification documents, and choose a membership tier. Applications are reviewed within 5 business days.', 3),
('membership', 'What are the membership tiers and costs?', 'We offer three tiers: Smallholder ($5/month) for farms under 10 hectares, Commercial ($50/month) for 10-500 hectares, and Enterprise ($200/month) for large-scale operations over 500 hectares. Each tier includes increasing levels of services and financing.', 4),
('payments', 'What payment methods are accepted?', 'We accept M-Pesa, EcoCash, MTN Mobile Money, Orange Money, bank transfers, and international card payments via Stripe. Available methods vary by country to match local payment preferences.', 5),
('payments', 'How are loan repayments collected?', 'Loan repayments are automatically deducted from your harvest proceeds through our offtake arrangements. You can also make manual payments via mobile money or bank transfer through your AFU dashboard.', 6),
('farming', 'What types of crops does AFU support?', 'AFU supports a wide range of crops including maize, wheat, sorghum, rice, cassava, soybeans, sunflower, groundnuts, cotton, tobacco, tea, coffee, cocoa, and various horticultural products. Support varies by country and agro-ecological zone.', 7),
('farming', 'Does AFU provide seeds and fertilizer?', 'Yes. Through our input supply chain, members receive certified seeds, fertilizers, and crop protection products on credit. Costs are deducted from harvest proceeds, so no upfront payment is required.', 8),
('loans', 'What is the maximum loan amount?', 'Loan limits depend on your membership tier and credit score. Smallholders can access up to $5,000, Commercial farmers up to $50,000, and Enterprise members up to $500,000. All loans require completion of KYC verification.', 9),
('loans', 'What interest rates does AFU charge?', 'Our standard interest rate is 12% per annum, significantly below the 30-40% rates charged by most informal lenders in Africa. Rates may vary based on credit history, collateral, and loan term.', 10),
('sponsorship', 'How does farmer sponsorship work?', 'Sponsors choose a tier (Bronze $5/mo, Silver $100/mo, Gold $500/mo, or Corporate custom) and are matched with a real farmer. Funds go directly to the farmer''s input costs, insurance, and training. Sponsors receive monthly photo updates and impact reports.', 11),
('sponsorship', 'Can I choose which farmer to sponsor?', 'Yes. Once you select a sponsorship tier, you can browse available farmer profiles filtered by country, crop type, and farm size. You can also let AFU match you with a farmer who would benefit most from your support level.', 12);


-- ── Managed Partners ──────────────────────────────────────
INSERT INTO managed_partners (name, description, category, country, is_featured, display_order) VALUES
('First National Bank Botswana', 'Primary banking partner for Botswana operations, providing disbursement and collection services.', 'banking', 'BW', true, 1),
('Safaricom', 'M-Pesa integration partner for mobile money payments across East Africa.', 'telecom', 'KE', true, 2),
('Econet Wireless', 'EcoCash mobile money partner for Zimbabwe and regional operations.', 'telecom', 'ZW', true, 3),
('FAO - Food & Agriculture Organization', 'Technical advisory partner providing agronomic research and best practices.', 'ngo', NULL, true, 4),
('World Bank IFC', 'Development finance partner supporting agricultural SME lending programs.', 'ngo', NULL, true, 5),
('Syngenta', 'Global crop protection and seeds supplier providing certified agricultural inputs.', 'technology', NULL, false, 6),
('John Deere Africa', 'Equipment financing and mechanization partner for commercial operations.', 'technology', NULL, false, 7),
('African Risk Capacity', 'Climate risk insurance and weather index parametric coverage partner.', 'insurance', NULL, false, 8),
('MTN Group', 'Mobile money and connectivity partner across West and Southern Africa.', 'telecom', 'NG', false, 9),
('CGIAR', 'International agricultural research partnership for crop science and innovation.', 'research', NULL, false, 10);


-- ── Announcements ─────────────────────────────────────────
INSERT INTO announcements (message, link_url, link_text, bg_color, text_color, is_active, display_order) VALUES
('Now accepting applications in Tanzania! Join 2,000+ farmers already benefiting from AFU.', '/apply', 'Apply Now →', '#1B2A4A', '#ffffff', true, 1);


-- ── Legal Pages ───────────────────────────────────────────
INSERT INTO legal_pages (slug, title, content, version) VALUES
('terms', 'Terms of Service', E'# Terms of Service\n\n**Effective Date:** January 1, 2024\n**Version:** 1.0\n\n## 1. Acceptance of Terms\n\nBy accessing or using the African Farming Union (AFU) platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.\n\n## 2. Description of Services\n\nAFU provides a vertically integrated agriculture development platform including:\n- Membership management and farmer registration\n- Agricultural input supply chain financing\n- Crop and livestock insurance facilitation\n- Loan origination and management\n- Market access and offtake arrangement\n- Training and capacity building programs\n- Blockchain-based asset tokenization\n\n## 3. Eligibility\n\nTo use AFU services, you must:\n- Be at least 18 years of age\n- Be a resident of a country where AFU operates\n- Provide valid identification documents\n- Complete the KYC (Know Your Customer) verification process\n\n## 4. Member Accounts\n\nYou are responsible for maintaining the confidentiality of your account credentials. You agree to notify AFU immediately of any unauthorized use of your account.\n\n## 5. Financial Services\n\nAll loans and financial products are subject to credit approval. Interest rates, fees, and repayment terms are disclosed prior to loan disbursement. AFU reserves the right to modify lending criteria based on risk assessment.\n\n## 6. Limitation of Liability\n\nAFU shall not be liable for crop failures, natural disasters, market price fluctuations, or any indirect, incidental, or consequential damages arising from use of the platform.\n\n## 7. Governing Law\n\nThese terms are governed by the laws of Botswana, with disputes resolved through arbitration in Gaborone.\n\n## 8. Contact\n\nFor questions about these terms, contact legal@afu.org.', '1.0'),

('privacy', 'Privacy Policy', E'# Privacy Policy\n\n**Effective Date:** January 1, 2024\n**Version:** 1.0\n\n## 1. Information We Collect\n\nAFU collects the following types of information:\n\n### Personal Information\n- Full name, date of birth, and gender\n- National ID or passport number\n- Contact details (phone, email, address)\n- Farm location and GPS coordinates\n- Bank account and mobile money details\n\n### Farm Data\n- Farm size, crop types, and livestock inventory\n- Soil test results and satellite imagery\n- Harvest yields and production data\n- Equipment and infrastructure details\n\n### Financial Data\n- Credit history and scoring data\n- Loan applications and repayment records\n- Transaction history and payment records\n\n## 2. How We Use Your Information\n\nWe use collected information to:\n- Process membership applications and manage accounts\n- Assess creditworthiness for loan products\n- Provide agricultural advisory services\n- Facilitate market access and offtake arrangements\n- Comply with regulatory requirements (KYC/AML)\n- Improve our services through analytics\n\n## 3. Data Sharing\n\nWe may share your data with:\n- Banking and payment partners for transaction processing\n- Insurance providers for crop and livestock coverage\n- Government agencies as required by law\n- Research partners (anonymized and aggregated only)\n\nWe never sell your personal information to third parties.\n\n## 4. Data Security\n\nWe implement industry-standard security measures including encryption, secure servers, and regular audits to protect your data.\n\n## 5. Your Rights\n\nYou have the right to access, correct, or delete your personal data. Contact privacy@afu.org to exercise these rights.\n\n## 6. Contact\n\nData Protection Officer: privacy@afu.org', '1.0'),

('cookies', 'Cookie Policy', E'# Cookie Policy\n\n**Effective Date:** January 1, 2024\n\n## What Are Cookies\n\nCookies are small text files stored on your device when you visit our platform. They help us provide a better user experience.\n\n## Cookies We Use\n\n### Essential Cookies\n- **Session cookies:** Required for login and authentication\n- **Security cookies:** Protect against CSRF attacks\n- **Preference cookies:** Remember your language and country settings\n\n### Analytics Cookies\n- **Usage analytics:** Help us understand how farmers use the platform\n- **Performance monitoring:** Track page load times and errors\n\n### Marketing Cookies\n- We do not currently use any marketing or advertising cookies\n\n## Managing Cookies\n\nYou can control cookies through your browser settings. Note that disabling essential cookies may prevent you from using the platform.\n\n## Contact\n\nFor questions about our cookie policy, contact privacy@afu.org.', '1.0'),

('aml-policy', 'Anti-Money Laundering Policy', E'# Anti-Money Laundering (AML) Policy\n\n**Effective Date:** January 1, 2024\n**Version:** 1.0\n\n## 1. Purpose\n\nThis policy outlines AFU''s commitment to preventing money laundering and terrorist financing through our platform, in compliance with:\n- Financial Intelligence Agency (FIA) of Botswana regulations\n- FATF recommendations for financial institutions\n- Local regulations in all countries of operation\n\n## 2. Know Your Customer (KYC)\n\nAll members must complete KYC verification including:\n- Government-issued photo identification\n- Proof of address (utility bill or bank statement)\n- Farm ownership or lease documentation\n- Source of funds declaration for transactions over $10,000\n\n## 3. Transaction Monitoring\n\nAFU monitors all transactions for suspicious activity including:\n- Unusual transaction patterns or volumes\n- Transactions inconsistent with the member''s farming profile\n- Rapid movement of funds across multiple accounts\n- Structuring of transactions to avoid reporting thresholds\n\n## 4. Reporting\n\nSuspicious transactions are reported to the relevant Financial Intelligence Unit (FIU) in the member''s country of operation. AFU maintains records of all reports for a minimum of 7 years.\n\n## 5. Training\n\nAll AFU staff receive annual AML training covering identification of suspicious activities, reporting procedures, and regulatory updates.\n\n## 6. Contact\n\nCompliance Officer: compliance@afu.org', '1.0');


-- ── Sponsor Tiers ─────────────────────────────────────────
INSERT INTO sponsor_tiers (name, price_usd, billing_label, description, features, is_popular, display_order, cta_text, icon) VALUES
('Bronze', 5.00, '/month', 'Support a smallholder farmer with essential inputs', ARRAY['Monthly photo update from your farmer','Fund basic seed and fertilizer','Name on AFU supporter wall','Annual impact report'], false, 1, 'Sponsor Now', '🌱'),
('Silver', 100.00, '/month', 'Transform a farmer''s entire growing season', ARRAY['Everything in Bronze','Fund full season inputs and insurance','Quarterly video updates','Direct messaging with farmer','Tax-deductible receipt','Invitation to annual AFU gala'], true, 2, 'Sponsor Now', '🌾'),
('Gold', 500.00, '/month', 'Sponsor an entire farming cooperative', ARRAY['Everything in Silver','Fund a 10-farmer cooperative','Monthly detailed impact dashboard','Farm visit opportunity (travel separate)','Featured on AFU website','Priority access to AFU events','Dedicated relationship manager'], false, 3, 'Sponsor Now', '🏆'),
('Corporate', 0.00, '/month', 'Custom partnership for organizations', ARRAY['Custom sponsorship structure','Branded impact reporting','CSR integration and co-branding','Employee engagement programs','Board-level impact presentations','Dedicated account team','Custom farm visit programs'], false, 4, 'Contact Us', '🏢');


-- ── Site Content: Footer ──────────────────────────────────
INSERT INTO site_content (page, section, key, value, content_type) VALUES
('global', 'footer', 'address', '123 Agriculture House, Gaborone, Botswana', 'text'),
('global', 'footer', 'email', 'info@afu.org', 'text'),
('global', 'footer', 'phone', '+267 71 234 567', 'text'),
('global', 'footer', 'twitter_url', 'https://twitter.com/AFUAfrica', 'text'),
('global', 'footer', 'linkedin_url', 'https://linkedin.com/company/african-farming-union', 'text'),
('global', 'footer', 'facebook_url', 'https://facebook.com/AFUAfrica', 'text'),
('global', 'footer', 'youtube_url', 'https://youtube.com/@AFUAfrica', 'text'),
('global', 'footer', 'copyright', '2024 African Farming Union. All rights reserved.', 'text')
ON CONFLICT (page, section, key) DO NOTHING;

-- ── Site Content: SEO Metadata ────────────────────────────
INSERT INTO site_content (page, section, key, value, content_type) VALUES
('homepage', 'seo', 'title', 'AFU - Africa''s Agriculture Development Platform', 'text'),
('homepage', 'seo', 'description', 'The vertically integrated agri dev bank and execution engine transforming African agriculture across 10 countries.', 'text'),
('about', 'seo', 'title', 'About AFU - Pan-African Agriculture Development', 'text'),
('sponsor', 'seo', 'title', 'Sponsor an African Farmer - AFU', 'text')
ON CONFLICT (page, section, key) DO NOTHING;

-- ── Site Content: Navigation ──────────────────────────────
INSERT INTO site_content (page, section, key, value, content_type) VALUES
('global', 'nav', 'links', '[{"label":"Home","href":"/"},{"label":"About","href":"/about"},{"label":"Services","href":"/services"},{"label":"Countries","href":"/countries"},{"label":"Sponsor","href":"/sponsor"},{"label":"Partnerships","href":"/partnerships"},{"label":"Contact","href":"/contact"}]', 'json'),
('global', 'nav', 'cta_text', 'Become a Member', 'text'),
('global', 'nav', 'cta_url', '/apply', 'text')
ON CONFLICT (page, section, key) DO NOTHING;
