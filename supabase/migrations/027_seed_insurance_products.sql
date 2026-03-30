-- ============================================================================
-- 027: Seed insurance_products table with default product catalog
-- ============================================================================
-- These match the fallback products in src/app/farm/insurance/products/page.tsx
-- so the DB becomes the source of truth once seeded.

INSERT INTO insurance_products (id, name, type, description, coverage_details, premium_range, deductible_percent, waiting_period_days, eligibility, active)
VALUES
  (
    uuid_generate_v4(),
    'Crop Shield Basic',
    'crop',
    'Essential crop protection against drought, flood, and pest damage. Ideal for smallholder farmers growing staple crops.',
    '{"details": ["Drought damage (rainfall below 60% of average)", "Flood damage (waterlogging > 72 hours)", "Pest infestation (verified by agronomist)", "Hail damage", "Fire (accidental)"]}',
    '{"min": 15, "max": 45, "currency": "USD"}',
    10,
    14,
    ARRAY['AFU member in good standing', 'Farm size 0.5 - 20 hectares', 'Crops registered on platform'],
    true
  ),
  (
    uuid_generate_v4(),
    'Crop Shield Premium',
    'crop',
    'Comprehensive crop coverage with higher limits and additional perils including market price drops and disease.',
    '{"details": ["All Basic plan coverage", "Crop disease (verified diagnosis)", "Market price decline (> 30% drop)", "Input loss (seed/fertilizer spoilage)", "Replanting costs", "Revenue guarantee up to 80%"]}',
    '{"min": 35, "max": 90, "currency": "USD"}',
    5,
    7,
    ARRAY['AFU member for 6+ months', 'Complete KYC verification', 'Active crop tracking on platform'],
    true
  ),
  (
    uuid_generate_v4(),
    'Livestock Guardian',
    'livestock',
    'Protect your livestock investment against disease, theft, and natural disasters. Covers cattle, goats, sheep, and poultry.',
    '{"details": ["Disease-related death (verified by vet)", "Theft (with police report)", "Natural disaster (flood, drought stress)", "Predator attack", "Accidental injury", "Emergency veterinary costs"]}',
    '{"min": 20, "max": 80, "currency": "USD"}',
    15,
    21,
    ARRAY['AFU member in good standing', 'Livestock registered with ear tags/photos', 'Vaccination records up to date'],
    true
  ),
  (
    uuid_generate_v4(),
    'Equipment Protect',
    'equipment',
    'Insurance for farming equipment and machinery against breakdowns, theft, and damage. Covers owned and rented equipment.',
    '{"details": ["Mechanical breakdown", "Theft (with police report)", "Fire and lightning damage", "Flood damage", "Vandalism", "Transit damage (during transport)"]}',
    '{"min": 25, "max": 120, "currency": "USD"}',
    10,
    7,
    ARRAY['AFU member in good standing', 'Equipment registered on platform', 'Equipment value verified'],
    true
  ),
  (
    uuid_generate_v4(),
    'Weather Index',
    'weather-index',
    'Automatic payouts based on satellite weather data. No claims process needed — payments trigger automatically when conditions are met.',
    '{"details": ["Rainfall deficit (< 70% of 10-year average)", "Excess rainfall (> 150% of average)", "Temperature extremes (> 40C or < 5C for 3+ days)", "Automatic satellite monitoring", "No claims paperwork required", "Payout within 14 days of trigger"]}',
    '{"min": 10, "max": 35, "currency": "USD"}',
    0,
    0,
    ARRAY['AFU member in good standing', 'Farm GPS coordinates registered', 'Active for current growing season'],
    true
  ),
  (
    uuid_generate_v4(),
    'Comprehensive Farm Shield',
    'crop',
    'All-in-one protection combining crop, livestock, and equipment coverage at a bundled discount. Best value for diversified farms.',
    '{"details": ["Full Crop Shield Premium coverage", "Full Livestock Guardian coverage", "Basic Equipment Protect coverage", "15% bundle discount on premiums", "Priority claims processing", "Dedicated claims officer"]}',
    '{"min": 60, "max": 200, "currency": "USD"}',
    5,
    7,
    ARRAY['AFU member for 12+ months', 'Complete KYC verification', 'Min 2 hectares farm size', 'Active crop + livestock records'],
    true
  ),
  (
    uuid_generate_v4(),
    'Transit & Trade Shield',
    'equipment',
    'Protection for agricultural goods in transit to market. Covers spoilage, theft, and damage during transport from farm to buyer.',
    '{"details": ["Cargo theft during transport", "Spoilage from cold chain failure", "Road accident damage", "Loading/unloading damage", "Delay compensation (perishables)", "Cross-border transit coverage"]}',
    '{"min": 12, "max": 55, "currency": "USD"}',
    5,
    3,
    ARRAY['AFU member in good standing', 'Active trade orders on platform', 'Transport route registered'],
    true
  ),
  (
    uuid_generate_v4(),
    'Smallholder Starter',
    'crop',
    'Affordable entry-level coverage designed for farmers with less than 1 hectare. Subsidized premiums through AFU partnership with development agencies.',
    '{"details": ["Drought damage (severe only)", "Flood damage (total crop loss)", "Free agronomist consultation", "Mobile money payout", "No paperwork - voice-based claims", "Season-long coverage"]}',
    '{"min": 5, "max": 15, "currency": "USD"}',
    0,
    7,
    ARRAY['AFU member in good standing', 'Farm size under 1 hectare', 'Registered on mobile platform'],
    true
  )
ON CONFLICT DO NOTHING;
