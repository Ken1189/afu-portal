-- ================================================================
-- 026_seed_cms_content.sql
-- Seed CMS tables with existing hardcoded content as baseline data
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- ================================================================

-- ── 1. Testimonials ──
INSERT INTO testimonials (name, role, quote, photo_url, rating, is_featured, is_published, display_order)
VALUES
  (
    'Tendai Moyo',
    'Blueberry Farmer, Zimbabwe',
    'AFU connected me with EU buyers and financed my cold chain. My export revenue tripled in one season.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    5, true, true, 1
  ),
  (
    'Amina Bakari',
    'Cassava Processor, Tanzania',
    'The processing hub access changed everything. We now sell dried cassava chips to three countries instead of raw tubers locally.',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face',
    5, true, true, 2
  ),
  (
    'Kabo Mothibi',
    'Sesame Grower, Botswana',
    'From seed to sale, AFU handled the inputs, training, and buyer contracts. I just focused on growing.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    5, true, true, 3
  )
ON CONFLICT DO NOTHING;


-- ── 2. Managed Partners ──
INSERT INTO managed_partners (name, logo_url, category, is_featured, is_published, display_order)
VALUES
  ('Stripe',       NULL, 'technology', true, true, 1),
  ('Supabase',     NULL, 'technology', true, true, 2),
  ('Vercel',       NULL, 'technology', true, true, 3),
  ('Google AI',    NULL, 'technology', true, true, 4),
  ('M-Pesa',       NULL, 'telecom',    true, true, 5),
  ('EcoCash',      NULL, 'telecom',    true, true, 6),
  ('MTN MoMo',     NULL, 'telecom',    true, true, 7),
  ('Resend',       NULL, 'technology', true, true, 8),
  ('Lloyd''s',     NULL, 'insurance',  true, true, 9),
  ('Airtel Money', NULL, 'telecom',    true, true, 10),
  ('Orange Money', NULL, 'telecom',    true, true, 11),
  ('TypeScript',   NULL, 'technology', true, true, 12)
ON CONFLICT DO NOTHING;


-- ── 3. FAQ Items ──
INSERT INTO faq_items (category, question, answer, display_order, is_published)
VALUES
  (
    'general',
    'What is the African Farming Union?',
    'The African Farming Union (AFU) is an integrated agricultural development platform providing financing, inputs, insurance, processing, guaranteed offtake, and training to smallholder and commercial farmers across Africa.',
    1, true
  ),
  (
    'general',
    'Which countries does AFU operate in?',
    'AFU currently operates across 9 African countries including Zimbabwe, Botswana, Tanzania, Kenya, Nigeria, Ghana, Uganda, Zambia, and Mozambique, with expansion planned to 20 countries.',
    2, true
  ),
  (
    'membership',
    'How do I join AFU?',
    'You can apply for membership through our website by clicking "Join Our Farming Family" on the homepage. You will need to provide details about your farm, crops, and location. Our team will review your application and contact you.',
    3, true
  ),
  (
    'finance',
    'What financing options are available?',
    'AFU offers working capital loans, crop financing, equipment leasing, invoice finance, and trade finance. Financing is tailored to your crop cycle and repayment comes from the sale of your harvest through our guaranteed offtake programme.',
    4, true
  ),
  (
    'services',
    'How does guaranteed offtake work?',
    'AFU arranges buyers for your crops before you plant. You receive a guaranteed price and market for your harvest, which removes the uncertainty of selling and allows you to focus on growing.',
    5, true
  ),
  (
    'insurance',
    'Is crop insurance included?',
    'Yes, AFU provides crop and asset insurance through our Lloyd''s of London coverholder arrangement. Insurance premiums can be built into your financing package so there is no upfront cost.',
    6, true
  ),
  (
    'payments',
    'What payment methods does AFU support?',
    'AFU supports M-Pesa, EcoCash, MTN MoMo, Airtel Money, Orange Money, bank transfers, and card payments depending on your country. We meet farmers where they are.',
    7, true
  ),
  (
    'general',
    'How do I become an AFU ambassador?',
    'Experienced farmers with a track record of success can apply to become AFU ambassadors. Visit our Ambassadors page and click "Become an Ambassador" to start the application process.',
    8, true
  )
ON CONFLICT DO NOTHING;


-- ── 4. Verify job_listings table exists (DO NOT insert jobs — too many rows) ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_listings') THEN
    RAISE NOTICE 'WARNING: job_listings table does not exist. Run migration 016 first.';
  END IF;
END $$;
