'use client';

import { useState } from 'react';
import { Database, Copy, Check, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

// ── Migration SQL Strings ────────────────────────────────────────────────────

const MIGRATION_013 = `-- Migration 013: Farmer References for KYC
-- Character references from community leaders, cooperative heads, or established farmers

CREATE TABLE IF NOT EXISTS farmer_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reference person details
  reference_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  relationship_other TEXT,
  phone_number TEXT NOT NULL,
  location TEXT,
  years_known INTEGER,

  -- Reference statement
  statement TEXT,

  -- Admin verification
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'contacted', 'verified', 'failed', 'unreachable')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  -- Whether this is primary or secondary reference
  is_primary BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_farmer_references_farmer ON farmer_references(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_references_status ON farmer_references(verification_status);

-- RLS
ALTER TABLE farmer_references ENABLE ROW LEVEL SECURITY;

-- Farmers can see and manage their own references
CREATE POLICY "Farmers can view own references" ON farmer_references
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own references" ON farmer_references
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own references" ON farmer_references
  FOR UPDATE USING (auth.uid() = farmer_id);

-- Admins can see and verify all references
CREATE POLICY "Admins can view all references" ON farmer_references
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update all references" ON farmer_references
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Service role bypass
CREATE POLICY "Service role full access" ON farmer_references
  FOR ALL USING (auth.role() = 'service_role');`;

const MIGRATION_014 = `-- Migration 014: Performance indexes for frequently filtered columns
-- These indexes speed up the admin dashboard, filter bar, and list pages

-- Loans: filtered by status, member_id
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at DESC);

-- Members: filtered by status, tier, profile_id
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_profile_id ON members(profile_id);

-- Payments: filtered by status, user_id
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- KYC Documents: filtered by status, user_id
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);

-- Applications: filtered by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON membership_applications(created_at DESC);

-- Notifications: filtered by recipient, read status
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- Audit log: filtered by entity
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Farmer references: filtered by farmer
CREATE INDEX IF NOT EXISTS idx_farmer_references_farmer ON farmer_references(farmer_id);

-- Farmer tiers: filtered by user
CREATE INDEX IF NOT EXISTS idx_farmer_tiers_user ON farmer_tiers(user_id);

-- Profiles: filtered by role, country
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Insurance: filtered by farmer, status
CREATE INDEX IF NOT EXISTS idx_insurance_policies_farmer ON insurance_policies(farmer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);

-- Equipment bookings: filtered by user, status
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_user ON equipment_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_status ON equipment_bookings(status);

-- Farm activities: filtered by plot
CREATE INDEX IF NOT EXISTS idx_farm_activities_plot ON farm_activities(plot_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_user ON farm_activities(user_id);`;

const MIGRATION_015 = `-- ============================================================================
-- AFU PORTAL - MIGRATION 015: ZIMBABWE PILOT SEED DATA
-- Realistic seed data for the Zimbabwe pilot launch.
-- ============================================================================

-- 1. ZIMBABWE FARMER PUBLIC PROFILES
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
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Mashonaland East',
  ARRAY['Maize', 'Groundnuts'],
  3.5, 6, 14,
  true, true,
  150.00, 0.00, 0
),
(
  'tendai-chirwa',
  'Tendai Chirwa',
  'Tendai is a second-generation tobacco farmer in Manicaland who diversified into maize after volatile auction prices nearly bankrupted him. Through AFU''s financial literacy training he learned to hedge his income across two crops and now consistently turns a profit.',
  'A 5-hectare farm in the Manicaland highlands growing flue-cured Virginia tobacco alongside dryland maize.',
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
  'Rumbidzai farms a compact 2-hectare plot near Masvingo where she grows drought-tolerant sorghum and pearl millet. She joined AFU to access improved seed varieties and has since become a seed multiplier for her community.',
  'A dryland smallholding near Great Zimbabwe focused on climate-resilient grain production.',
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
  'Simba manages an 8-hectare farm in the Midlands where he grows cotton and sunflower under contract-farming arrangements. He was one of the first farmers in his district to adopt mechanical planting.',
  'An 8-hectare Midlands farm producing seed cotton and sunflower for oil processing.',
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
  'Nyasha left a teaching career to take over her family farm in Mashonaland West. She introduced winter wheat under irrigation and summer soybeans, creating a year-round income stream.',
  'A 4.5-hectare irrigated farm in Mashonaland West rotating winter wheat with summer soybeans.',
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Mashonaland West',
  ARRAY['Wheat', 'Soybeans'],
  4.5, 3, 7,
  true, false,
  200.00, 0.00, 0
),
(
  'tatenda-moyo',
  'Tatenda Moyo',
  'Tatenda runs a mixed cattle-and-crop operation in Matabeleland South, a region historically known for livestock. He has invested in improved Brahman-cross genetics and supplementary maize feed to increase calving rates.',
  'A 6-hectare mixed farm in Matabeleland South combining a 40-head Brahman-cross cattle herd with rain-fed maize.',
  'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
  'Zimbabwe', 'Matabeleland South',
  ARRAY['Cattle', 'Maize'],
  6.0, 8, 25,
  true, true,
  350.00, 0.00, 0
);

-- 2. TRAINING COURSES
INSERT INTO courses (
  title, description, category, difficulty, duration_minutes,
  modules_count, is_published, country_scope
) VALUES
(
  'Zimbabwe Crop Calendar & Planting Guide',
  'A comprehensive guide to Zimbabwe''s agro-ecological zones, optimal planting windows for major crops, and seasonal management practices.',
  'farm-basics', 'beginner', 90, 6, true, ARRAY['Zimbabwe']
),
(
  'Financial Literacy for Smallholder Farmers',
  'Learn to manage farm income and expenses, build savings, understand loan terms, and plan for seasonal cash-flow gaps.',
  'financial-literacy', 'beginner', 120, 8, true, ARRAY['Zimbabwe']
),
(
  'Digital Tools for Modern Farming',
  'An introduction to mobile-based farm management apps, weather forecast services, satellite crop monitoring, and digital marketplaces.',
  'digital-agriculture', 'intermediate', 75, 5, true, ARRAY['Zimbabwe']
),
(
  'Export Markets & Trade Compliance',
  'Understand phytosanitary requirements, ZIMRA export procedures, COMESA preferential tariffs, and quality standards for key Zimbabwean export commodities.',
  'advanced-trading', 'advanced', 150, 10, true, ARRAY['Zimbabwe']
);

-- 3. MARKET PRICES
INSERT INTO market_prices (commodity, market_location, country, price, currency, unit, date, source) VALUES
('Maize',              'Harare', 'Zimbabwe', 280.00,  'USD', 'tonne', CURRENT_DATE, 'Zimbabwe Grain Millers Association'),
('Tobacco (Virginia)',  'Harare', 'Zimbabwe',   4.50,  'USD', 'kg',    CURRENT_DATE, 'Tobacco Industry & Marketing Board'),
('Cotton (Seed)',       'Harare', 'Zimbabwe',   0.85,  'USD', 'kg',    CURRENT_DATE, 'Cotton Company of Zimbabwe'),
('Sorghum',            'Harare', 'Zimbabwe', 320.00,  'USD', 'tonne', CURRENT_DATE, 'Zimbabwe Grain Millers Association'),
('Groundnuts',         'Harare', 'Zimbabwe', 1200.00, 'USD', 'tonne', CURRENT_DATE, 'Agricultural Marketing Authority'),
('Soybeans',           'Harare', 'Zimbabwe', 650.00,  'USD', 'tonne', CURRENT_DATE, 'Agricultural Marketing Authority'),
('Wheat',              'Harare', 'Zimbabwe', 380.00,  'USD', 'tonne', CURRENT_DATE, 'Zimbabwe Grain Millers Association'),
('Sunflower',          'Harare', 'Zimbabwe', 550.00,  'USD', 'tonne', CURRENT_DATE, 'Agricultural Marketing Authority');

-- 4. EQUIPMENT
INSERT INTO equipment (name, type, description, daily_rate, currency, location, country, status, specifications) VALUES
(
  'Tractor - John Deere 5E Series', 'tractor',
  '75 HP utility tractor suitable for ploughing, harrowing, and haulage.',
  45.00, 'USD', 'Harare', 'Zimbabwe', 'available',
  '{"horsepower": 75, "fuel": "diesel", "implements_included": ["plough", "harrow"]}'::jsonb
),
(
  'Solar Irrigation Pump', 'irrigator',
  'Portable solar-powered centrifugal pump capable of delivering 15,000 litres per hour.',
  15.00, 'USD', 'Masvingo', 'Zimbabwe', 'available',
  '{"flow_rate_lph": 15000, "power_source": "solar", "panels": 4}'::jsonb
),
(
  'Seed Drill - 4-Row Mechanical', 'plough',
  'Tractor-mounted 4-row mechanical seed drill for precision planting of maize, sorghum, soybeans, and sunflower.',
  25.00, 'USD', 'Bulawayo', 'Zimbabwe', 'available',
  '{"rows": 4, "row_spacing_cm": "60-90", "compatible_crops": ["maize", "sorghum", "soybeans", "sunflower"]}'::jsonb
);`;

// ── Migration entries ────────────────────────────────────────────────────────

interface MigrationEntry {
  id: string;
  title: string;
  description: string;
  sql: string;
}

const migrations: MigrationEntry[] = [
  {
    id: '013',
    title: '013 — Farmer References for KYC',
    description: 'Creates the farmer_references table for character references from community leaders, cooperative heads, or established farmers. Includes RLS policies.',
    sql: MIGRATION_013,
  },
  {
    id: '014',
    title: '014 — Performance Indexes',
    description: 'Adds indexes on frequently filtered columns across loans, members, payments, KYC documents, applications, notifications, audit log, farmer references, profiles, insurance, equipment bookings, and farm activities.',
    sql: MIGRATION_014,
  },
  {
    id: '015',
    title: '015 — Zimbabwe Pilot Seed Data',
    description: 'Seeds realistic Zimbabwe farmer profiles (6), training courses (4), market prices (8 commodities), and equipment listings (3) for the pilot launch.',
    sql: MIGRATION_015,
  },
];

// ── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-[#5DB347]/10 text-[#5DB347] border border-[#5DB347]/30 hover:bg-[#5DB347]/20'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy SQL
        </>
      )}
    </button>
  );
}

// ── Collapsible migration card ───────────────────────────────────────────────

function MigrationCard({ migration }: { migration: MigrationEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Database className="w-5 h-5 text-[#5DB347] shrink-0" />
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-base truncate">{migration.title}</h3>
            <p className="text-gray-400 text-sm mt-0.5">{migration.description}</p>
          </div>
        </div>
        {open ? (
          <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
        )}
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-gray-800 px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <CopyButton text={migration.sql} />
            <span className="text-xs text-gray-500">
              {migration.sql.split('\n').length} lines
            </span>
          </div>
          <pre className="bg-black/50 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 leading-relaxed max-h-[500px] overflow-y-auto">
            <code>{migration.sql}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RunMigrationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Database className="w-7 h-7 text-[#5DB347]" />
          Run Migrations
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Copy each migration SQL below and paste it into the{' '}
          <a
            href="https://supabase.com/dashboard/project/_/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5DB347] hover:underline inline-flex items-center gap-1"
          >
            Supabase SQL Editor
            <ExternalLink className="w-3.5 h-3.5" />
          </a>{' '}
          then click <strong className="text-white">Run</strong>. Run them in order (013 first, then 014, then 015).
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-[#5DB347]/5 border border-[#5DB347]/20 rounded-xl p-5">
        <h2 className="text-[#5DB347] font-semibold text-sm uppercase tracking-wider mb-3">
          How to run
        </h2>
        <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
          <li>Open your Supabase project dashboard</li>
          <li>Navigate to <strong className="text-white">SQL Editor</strong> in the left sidebar</li>
          <li>Click <strong className="text-white">New query</strong></li>
          <li>Click <strong className="text-white">Copy SQL</strong> below for the first migration</li>
          <li>Paste the SQL into the editor and click <strong className="text-white">Run</strong></li>
          <li>Repeat for each subsequent migration in order</li>
        </ol>
      </div>

      {/* Migration cards */}
      <div className="space-y-4">
        {migrations.map((m) => (
          <MigrationCard key={m.id} migration={m} />
        ))}
      </div>
    </div>
  );
}
