-- ============================================================
-- Investment Opportunities table
-- Admin can CRUD opportunities shown in the investor portal
-- ============================================================

CREATE TABLE IF NOT EXISTS investment_opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'Debt',        -- 'Debt Fund', 'Equity', 'Insurance', 'Debt'
  description     TEXT,
  target          DECIMAL(15,2) DEFAULT 0,             -- target raise amount
  min_investment  DECIMAL(15,2) DEFAULT 100000,
  target_irr      TEXT DEFAULT '18-22%',
  term            TEXT DEFAULT '3 years',
  subscribed_percent DECIMAL(5,2) DEFAULT 0,
  subscribed_amount  DECIMAL(15,2) DEFAULT 0,
  status          TEXT DEFAULT 'Open',                 -- 'Open', 'Fully Subscribed', 'Closed'
  sector          TEXT,
  country         TEXT,
  risk_level      TEXT DEFAULT 'Medium',               -- 'Low', 'Medium', 'High'
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;

-- Public read for investor portal
CREATE POLICY "Anyone can read investment opportunities"
  ON investment_opportunities FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins can manage investment opportunities"
  ON investment_opportunities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Seed from the investor portal fallback data
INSERT INTO investment_opportunities (name, type, description, target, min_investment, target_irr, term, subscribed_percent, subscribed_amount, status, sector, risk_level) VALUES
('AFU Agricultural Debt Fund II', 'Debt Fund', 'Senior secured lending to pre-vetted agricultural cooperatives across Sub-Saharan Africa. Backed by warehouse receipts, crop insurance, and first-lien security over agricultural assets.', 5000000, 100000, '18-22%', '3 years', 68, 3400000, 'Open', 'Agriculture', 'Medium'),
('AFU Insurance Premium Pool', 'Insurance', 'Co-investment vehicle providing parametric crop and livestock insurance across 20 African countries.', 2000000, 250000, '14-18%', '2 years (rolling)', 45, 900000, 'Open', 'Insurance', 'Low'),
('AFU Direct Farm Equity — Batch 3', 'Equity', 'Direct equity stakes in high-potential commercial farms identified through AFU''s cooperative network. Focus on high-value horticulture, aquaculture, and specialty crops.', 1500000, 500000, '25-35%', '5-7 years', 33, 500000, 'Open', 'Agriculture', 'High'),
('AFU Trade Finance Facility', 'Debt', 'Short-term trade finance for agricultural commodities export. Self-liquidating 90-180 day facilities secured by confirmed letters of credit and export contracts.', 3000000, 100000, '16-20%', '180 days (revolving)', 100, 3000000, 'Fully Subscribed', 'Trade', 'Medium'),
('AFU Blended Finance Vehicle', 'Debt Fund', 'First-loss capital from DFI partners (IFC, AfDB) absorbs initial risk, with private investors in mezzanine and senior tranches. Targeted at climate-smart agriculture and smallholder digitization.', 10000000, 1000000, '12-16%', '5 years', 22, 2200000, 'Open', 'Climate', 'Low');
