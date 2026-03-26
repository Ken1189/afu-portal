-- Migration 021: Legal Assistance & Veterinary Services
-- Backend tables for legal case management and vet appointment booking

BEGIN;

-- ============================================================================
-- LEGAL ASSISTANCE
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE legal_case_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE legal_case_type AS ENUM (
    'land_dispute', 'contract_review', 'compliance', 'cooperative',
    'intellectual_property', 'employment', 'insurance_claim', 'trade_dispute', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE legal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS legal_cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_number     TEXT UNIQUE NOT NULL,
  case_type       legal_case_type NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          legal_case_status NOT NULL DEFAULT 'pending',
  priority        legal_priority NOT NULL DEFAULT 'medium',
  country_code    TEXT,
  region          TEXT,
  assigned_firm   TEXT,
  assigned_lawyer TEXT,
  lawyer_email    TEXT,
  lawyer_phone    TEXT,
  resolution      TEXT,
  resolved_at     TIMESTAMPTZ,
  documents       JSONB DEFAULT '[]',  -- array of { name, url, uploaded_at }
  notes           JSONB DEFAULT '[]',  -- array of { author, text, created_at }
  estimated_cost  NUMERIC(12, 2),
  actual_cost     NUMERIC(12, 2),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_cases_user ON legal_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_cases_status ON legal_cases(status);
CREATE INDEX IF NOT EXISTS idx_legal_cases_type ON legal_cases(case_type);
CREATE INDEX IF NOT EXISTS idx_legal_cases_priority ON legal_cases(priority);
CREATE INDEX IF NOT EXISTS idx_legal_cases_country ON legal_cases(country_code);
CREATE INDEX IF NOT EXISTS idx_legal_cases_created ON legal_cases(created_at);

-- Legal partner firms
CREATE TABLE IF NOT EXISTS legal_firms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  countries       TEXT[] DEFAULT '{}',
  contact_email   TEXT,
  contact_phone   TEXT,
  address         TEXT,
  rating          NUMERIC(3, 2) DEFAULT 0,
  total_cases     INTEGER DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- VETERINARY SERVICES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE vet_appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vet_service_type AS ENUM (
    'routine_checkup', 'vaccination', 'emergency', 'surgery',
    'breeding', 'nutrition', 'disease_treatment', 'deworming',
    'pregnancy_check', 'dental', 'consultation', 'lab_test'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS vet_appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_number TEXT UNIQUE NOT NULL,
  service_type    vet_service_type NOT NULL,
  animal_type     TEXT NOT NULL,  -- cattle, goat, poultry, pig, sheep, etc.
  animal_count    INTEGER NOT NULL DEFAULT 1,
  animal_ids      TEXT[],  -- references to livestock records
  description     TEXT NOT NULL,
  status          vet_appointment_status NOT NULL DEFAULT 'scheduled',
  priority        TEXT NOT NULL DEFAULT 'normal',  -- normal, urgent, emergency
  scheduled_date  TIMESTAMPTZ,
  completed_date  TIMESTAMPTZ,
  country_code    TEXT,
  region          TEXT,
  farm_location   TEXT,
  assigned_vet_id UUID REFERENCES auth.users(id),
  assigned_vet_name TEXT,
  vet_phone       TEXT,
  diagnosis       TEXT,
  treatment       TEXT,
  prescriptions   JSONB DEFAULT '[]',  -- array of { medicine, dosage, frequency, duration }
  follow_up_date  TIMESTAMPTZ,
  follow_up_notes TEXT,
  estimated_cost  NUMERIC(12, 2),
  actual_cost     NUMERIC(12, 2),
  documents       JSONB DEFAULT '[]',  -- lab results, photos, etc.
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_appts_user ON vet_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_appts_status ON vet_appointments(status);
CREATE INDEX IF NOT EXISTS idx_vet_appts_type ON vet_appointments(service_type);
CREATE INDEX IF NOT EXISTS idx_vet_appts_date ON vet_appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_vet_appts_vet ON vet_appointments(assigned_vet_id);
CREATE INDEX IF NOT EXISTS idx_vet_appts_country ON vet_appointments(country_code);
CREATE INDEX IF NOT EXISTS idx_vet_appts_created ON vet_appointments(created_at);

-- Vet partner clinics
CREATE TABLE IF NOT EXISTS vet_clinics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  countries       TEXT[] DEFAULT '{}',
  contact_email   TEXT,
  contact_phone   TEXT,
  address         TEXT,
  has_mobile_unit BOOLEAN DEFAULT FALSE,
  emergency_available BOOLEAN DEFAULT FALSE,
  rating          NUMERIC(3, 2) DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vaccination records (linked to livestock + vet appointments)
CREATE TABLE IF NOT EXISTS vaccination_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  appointment_id  UUID REFERENCES vet_appointments(id),
  animal_type     TEXT NOT NULL,
  animal_id       TEXT,  -- reference to livestock record
  vaccine_name    TEXT NOT NULL,
  batch_number    TEXT,
  administered_by TEXT,
  administered_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_due_date   TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacc_records_user ON vaccination_records(user_id);
CREATE INDEX IF NOT EXISTS idx_vacc_records_animal ON vaccination_records(animal_type, animal_id);
CREATE INDEX IF NOT EXISTS idx_vacc_records_next_due ON vaccination_records(next_due_date);

-- ============================================================================
-- SEED: Partner Firms & Clinics
-- ============================================================================

INSERT INTO legal_firms (name, specializations, countries, contact_email, is_active) VALUES
  ('Bowmans Africa', ARRAY['land_dispute', 'contract_review', 'compliance'], ARRAY['ZA', 'KE', 'UG', 'TZ', 'MZ'], 'africa@bowmanslaw.com', TRUE),
  ('ENSafrica', ARRAY['trade_dispute', 'intellectual_property', 'employment'], ARRAY['ZA', 'BW', 'GH', 'UG', 'RW'], 'info@ensafrica.com', TRUE),
  ('Werksmans Attorneys', ARRAY['contract_review', 'compliance', 'cooperative'], ARRAY['ZA', 'BW', 'NA'], 'info@werksmans.com', TRUE),
  ('Anjarwalla & Khanna', ARRAY['land_dispute', 'trade_dispute', 'contract_review'], ARRAY['KE', 'TZ', 'UG', 'RW'], 'nairobi@africalegalnetwork.com', TRUE),
  ('Scanlen & Holderness', ARRAY['land_dispute', 'insurance_claim', 'compliance'], ARRAY['ZW'], 'info@scanlenandholderness.com', TRUE),
  ('Armstrongs Attorneys', ARRAY['land_dispute', 'contract_review', 'employment'], ARRAY['BW'], 'info@armstrongs.bw', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO vet_clinics (name, specializations, countries, has_mobile_unit, emergency_available, is_active) VALUES
  ('AFU Vet Network - East Africa', ARRAY['cattle', 'goats', 'poultry'], ARRAY['KE', 'TZ', 'UG', 'RW'], TRUE, TRUE, TRUE),
  ('AFU Vet Network - Southern Africa', ARRAY['cattle', 'goats', 'pigs'], ARRAY['ZA', 'BW', 'ZW', 'MZ', 'NA'], TRUE, TRUE, TRUE),
  ('AFU Vet Network - West Africa', ARRAY['cattle', 'poultry', 'goats'], ARRAY['GH', 'NG', 'SL', 'GN', 'ML', 'CI', 'LR'], TRUE, FALSE, TRUE),
  ('GALVmed Africa Partners', ARRAY['vaccination', 'disease_prevention'], ARRAY['KE', 'TZ', 'UG', 'GH', 'NG'], FALSE, FALSE, TRUE),
  ('Livestock Vet Services Zimbabwe', ARRAY['cattle', 'goats', 'breeding'], ARRAY['ZW'], TRUE, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;

-- Users see their own legal cases
CREATE POLICY legal_cases_user_read ON legal_cases FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY legal_cases_user_insert ON legal_cases FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Everyone can see active firms/clinics
CREATE POLICY legal_firms_read ON legal_firms FOR SELECT USING (TRUE);
CREATE POLICY vet_clinics_read ON vet_clinics FOR SELECT USING (TRUE);

-- Users see their own vet appointments
CREATE POLICY vet_appts_user_read ON vet_appointments FOR SELECT
  USING (user_id = auth.uid() OR assigned_vet_id = auth.uid());
CREATE POLICY vet_appts_user_insert ON vet_appointments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users see their own vaccination records
CREATE POLICY vacc_records_user_read ON vaccination_records FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY vacc_records_user_insert ON vaccination_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DO $$ BEGIN
  CREATE TRIGGER legal_cases_updated_at BEFORE UPDATE ON legal_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER vet_appointments_updated_at BEFORE UPDATE ON vet_appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- HELPER: Generate case/appointment numbers
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LEG-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VET-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMIT;
