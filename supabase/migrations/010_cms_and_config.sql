-- ============================================================================
-- AFU PORTAL — MIGRATION 010: CMS, FEATURE FLAGS & SITE CONFIGURATION
-- ============================================================================

-- 1. SITE CONTENT — Editable content blocks for all public pages
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,           -- 'homepage', 'about', 'services', 'sponsor', etc.
  section TEXT NOT NULL,         -- 'hero', 'stats', 'services', 'flywheel', etc.
  key TEXT NOT NULL,             -- 'title', 'subtitle', 'cta_text', 'stat_1_value', etc.
  value TEXT NOT NULL,           -- The actual content
  content_type TEXT DEFAULT 'text', -- 'text', 'html', 'image_url', 'number', 'json'
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section, key)
);

CREATE INDEX idx_site_content_page ON site_content(page);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON site_content FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- 2. FEATURE FLAGS — Toggle features on/off per country
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,      -- 'mpesa_payments', 'blockchain_staking', 'crop_scanner', etc.
  name TEXT NOT NULL,            -- Human-readable: 'M-Pesa Payments'
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  countries TEXT[] DEFAULT '{}', -- Empty = all countries. ['KE','TZ'] = Kenya + Tanzania only
  category TEXT DEFAULT 'general', -- 'payments', 'features', 'integrations', 'experimental'
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read feature flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins manage feature flags" ON feature_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- 3. SITE CONFIG — Key-value store for system settings
CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,        -- 'general', 'payments', 'notifications', 'branding', 'loans', 'membership'
  key TEXT UNIQUE NOT NULL,      -- 'default_currency', 'support_email', 'max_loan_amount', etc.
  value TEXT NOT NULL,
  value_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  label TEXT NOT NULL,           -- Human-readable label for admin UI
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admins manage site config" ON site_config FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- 4. NOTIFICATION TEMPLATES — Editable email/SMS templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,      -- 'welcome_email', 'loan_approved', 'payment_reminder', etc.
  name TEXT NOT NULL,
  channel TEXT NOT NULL,         -- 'email', 'sms', 'push', 'whatsapp'
  subject TEXT,                  -- For email
  body TEXT NOT NULL,            -- Template with {{variable}} placeholders
  variables TEXT[] DEFAULT '{}', -- Available variables: ['member_name', 'loan_amount', etc.]
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notification templates" ON notification_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- 5. BROADCAST MESSAGES — Scheduled mass communications
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL,         -- 'in_app', 'email', 'sms', 'push'
  target_audience TEXT DEFAULT 'all', -- 'all', 'members', 'suppliers', 'country:ZW', 'tier:gold', 'crop:maize'
  target_countries TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',   -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage broadcasts" ON broadcasts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Triggers
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_broadcasts_updated_at BEFORE UPDATE ON broadcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SEED: Homepage content
INSERT INTO site_content (page, section, key, value, content_type) VALUES
('homepage', 'hero', 'title_line1', 'Africa''s Agriculture', 'text'),
('homepage', 'hero', 'title_highlight', 'Development Bank', 'text'),
('homepage', 'hero', 'title_line2', '+ Operating Platform', 'text'),
('homepage', 'hero', 'subtitle', 'The vertically integrated agri dev bank and execution engine that Africa has been missing. Capital → inputs → production → processing → offtake — one platform, one loop.', 'text'),
('homepage', 'hero', 'cta_primary_text', 'Become a Member', 'text'),
('homepage', 'hero', 'cta_primary_url', '/apply', 'text'),
('homepage', 'hero', 'cta_secondary_text', 'Watch Demo', 'text'),
('homepage', 'hero', 'phase_badge', 'Phase 1: Botswana • Zimbabwe • Tanzania', 'text'),
('homepage', 'stats', 'stat_1_value', '60%', 'text'),
('homepage', 'stats', 'stat_1_label', 'of world''s uncultivated arable land is in Africa', 'text'),
('homepage', 'stats', 'stat_2_value', '$1B+', 'text'),
('homepage', 'stats', 'stat_2_label', 'of food imported annually across Africa', 'text'),
('homepage', 'stats', 'stat_3_value', '40%', 'text'),
('homepage', 'stats', 'stat_3_label', 'of food lost post-harvest due to weak infrastructure', 'text'),
('homepage', 'stats', 'stat_4_label', 'active AFU members across 10 countries', 'text'),
('homepage', 'services', 'title', 'One Platform, Complete Value Chain', 'text'),
('homepage', 'services', 'subtitle', 'A vertically integrated agriculture development platform — the specialized agri dev bank and execution engine Africa has been missing.', 'text'),
('homepage', 'sponsor', 'title', 'Sponsor an African Farmer', 'text'),
('homepage', 'sponsor', 'subtitle', 'Your monthly contribution transforms a smallholder into a thriving agri-business.', 'text'),
('about', 'hero', 'title', 'About AFU', 'text'),
('about', 'hero', 'subtitle', 'Pan-African Agriculture Development Platform', 'text'),
('sponsor', 'hero', 'title', 'Sponsor an African Farmer', 'text'),
('sponsor', 'hero', 'subtitle', 'Your monthly contribution funds a real farmer''s inputs, insurance, and offtake — transforming a smallholder into a thriving agri-business.', 'text');

-- SEED: Feature flags
INSERT INTO feature_flags (key, name, description, enabled, countries, category) VALUES
('mpesa_payments', 'M-Pesa Payments', 'Enable M-Pesa mobile money payments', true, ARRAY['KE','TZ'], 'payments'),
('ecocash_payments', 'EcoCash Payments', 'Enable EcoCash mobile money payments', true, ARRAY['ZW'], 'payments'),
('orange_money', 'Orange Money', 'Enable Orange Money payments', false, ARRAY['BW','SL'], 'payments'),
('mtn_momo', 'MTN Mobile Money', 'Enable MTN MoMo payments', false, ARRAY['NG','ZM','UG'], 'payments'),
('airtel_money', 'Airtel Money', 'Enable Airtel Money payments', true, ARRAY['TZ','ZM','KE','UG'], 'payments'),
('stripe_payments', 'Card Payments (Stripe)', 'Enable international card payments', true, ARRAY[]::TEXT[], 'payments'),
('blockchain_staking', 'EDM Staking', 'Enable EDMA blockchain staking feature', false, ARRAY[]::TEXT[], 'features'),
('crop_scanner', 'AI Crop Scanner', 'Enable AI-powered crop disease detection', true, ARRAY[]::TEXT[], 'features'),
('weather_alerts', 'Weather Alerts', 'Enable weather-based farm alerts', true, ARRAY[]::TEXT[], 'features'),
('whatsapp_bot', 'WhatsApp Bot', 'Enable WhatsApp chatbot for farmers', false, ARRAY[]::TEXT[], 'integrations'),
('ussd_channel', 'USSD Menu', 'Enable USSD shortcode for feature phones', false, ARRAY['KE','TZ','ZW','UG'], 'integrations'),
('farm_map', 'Farm Intelligence Map', 'Interactive map of all farms', true, ARRAY[]::TEXT[], 'features'),
('export_compliance', 'Export Documentation', 'Enable export compliance and documentation', true, ARRAY[]::TEXT[], 'features'),
('commodity_tokenization', 'RWA Tokenization', 'Enable real-world asset tokenization', false, ARRAY[]::TEXT[], 'experimental'),
('credit_scoring_v2', 'Advanced Credit Scoring', 'ML-powered credit scoring model', false, ARRAY[]::TEXT[], 'experimental');

-- SEED: Site config
INSERT INTO site_config (category, key, value, value_type, label, description) VALUES
('general', 'platform_name', 'African Farming Union', 'string', 'Platform Name', 'The display name of the platform'),
('general', 'support_email', 'support@afu.org', 'string', 'Support Email', 'Main support email address'),
('general', 'support_phone', '+267 71 234 567', 'string', 'Support Phone', 'Main support phone number'),
('general', 'default_currency', 'USD', 'string', 'Default Currency', 'Default currency for pricing'),
('general', 'maintenance_mode', 'false', 'boolean', 'Maintenance Mode', 'Put the entire site in maintenance mode'),
('branding', 'primary_color', '#5DB347', 'string', 'Primary Color', 'Main brand color (hex)'),
('branding', 'secondary_color', '#8CB89C', 'string', 'Secondary Color', 'Secondary brand color (hex)'),
('branding', 'logo_url', '/afu-logo.jpeg', 'string', 'Logo URL', 'Path to the main logo file'),
('loans', 'max_loan_amount', '50000', 'number', 'Max Loan Amount (USD)', 'Maximum loan amount per member'),
('loans', 'default_interest_rate', '12', 'number', 'Default Interest Rate (%)', 'Default annual interest rate for new loans'),
('loans', 'max_term_months', '36', 'number', 'Max Loan Term (months)', 'Maximum loan repayment term'),
('membership', 'smallholder_price', '5', 'number', 'Smallholder Monthly Fee (USD)', 'Monthly membership fee for smallholder tier'),
('membership', 'commercial_price', '50', 'number', 'Commercial Monthly Fee (USD)', 'Monthly membership fee for commercial tier'),
('membership', 'enterprise_price', '200', 'number', 'Enterprise Monthly Fee (USD)', 'Monthly membership fee for enterprise tier'),
('notifications', 'welcome_email_enabled', 'true', 'boolean', 'Welcome Email', 'Send welcome email on registration'),
('notifications', 'loan_reminder_days', '7', 'number', 'Loan Reminder Days', 'Days before due date to send loan reminder'),
('payments', 'transaction_fee_percent', '2.5', 'number', 'Transaction Fee (%)', 'Platform transaction fee percentage');

-- SEED: Notification templates
INSERT INTO notification_templates (key, name, channel, subject, body, variables, is_active) VALUES
('welcome_member', 'Welcome New Member', 'email', 'Welcome to AFU, {{member_name}}!', E'Dear {{member_name}},\n\nWelcome to the African Farming Union! Your {{membership_tier}} membership is now active.\n\nYour member ID is {{member_id}}.\n\nGet started by:\n1. Completing your farm profile\n2. Browsing available training courses\n3. Exploring the marketplace\n\nWe are excited to have you on board!\n\nBest regards,\nThe AFU Team', ARRAY['member_name','membership_tier','member_id'], true),
('loan_approved', 'Loan Approved', 'email', 'Your AFU Loan Has Been Approved', E'Dear {{member_name}},\n\nGreat news! Your loan application for {{loan_amount}} {{currency}} has been approved.\n\nLoan Details:\n- Amount: {{loan_amount}} {{currency}}\n- Interest Rate: {{interest_rate}}%\n- Term: {{term_months}} months\n- Monthly Payment: {{monthly_payment}} {{currency}}\n\nFunds will be disbursed within 48 hours.\n\nBest regards,\nAFU Finance Team', ARRAY['member_name','loan_amount','currency','interest_rate','term_months','monthly_payment'], true),
('payment_reminder', 'Payment Reminder', 'sms', NULL, E'AFU Reminder: Your loan payment of {{amount}} {{currency}} is due on {{due_date}}. Pay via M-Pesa or your AFU dashboard. Ref: {{loan_number}}', ARRAY['amount','currency','due_date','loan_number'], true),
('harvest_season', 'Harvest Season Alert', 'push', NULL, E'Harvest time approaching! Your {{crop}} in {{plot_name}} is expected to be ready for harvest on {{harvest_date}}. Check your farm dashboard for details.', ARRAY['crop','plot_name','harvest_date'], true),
('sponsor_thank_you', 'Sponsor Thank You', 'email', 'Thank You for Sponsoring {{farmer_name}}', E'Dear {{sponsor_name}},\n\nThank you for your generous {{tier}} sponsorship of {{farmer_name}} from {{country}}!\n\nYour monthly contribution of ${{amount}} will help fund:\n{{impact_description}}\n\nYou will receive monthly updates directly from {{farmer_name}} showing the impact of your support.\n\nWith gratitude,\nThe AFU Team', ARRAY['sponsor_name','farmer_name','country','tier','amount','impact_description'], true),
('weather_alert', 'Weather Alert', 'sms', NULL, E'AFU Weather Alert: {{alert_type}} expected in {{region}}, {{country}} on {{date}}. {{recommendation}}', ARRAY['alert_type','region','country','date','recommendation'], true);
