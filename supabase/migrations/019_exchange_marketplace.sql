-- ============================================================================
-- AFU PORTAL — MIGRATION 019: BARTERING / EXCHANGE MARKETPLACE
-- Credit-based exchange system where farmers trade goods, services,
-- equipment, and produce using AFU Credits.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. CREDIT WALLETS (Each farmer has a credit balance)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  total_spent DECIMAL(12,2) DEFAULT 0.00,
  total_deposited DECIMAL(12,2) DEFAULT 0.00, -- cash → credits
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00, -- credits → cash

  currency TEXT DEFAULT 'AFU', -- AFU credits
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_wallets_user ON credit_wallets(user_id);

ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wallet" ON credit_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own wallet" ON credit_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access wallets" ON credit_wallets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "System can create wallets" ON credit_wallets FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. EXCHANGE LISTINGS (Items/services for trade)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exchange_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Listing details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('equipment', 'produce', 'services', 'land', 'storage', 'knowledge', 'livestock', 'seeds', 'other')),
  subcategory TEXT,

  -- Pricing
  price_credits DECIMAL(10,2) NOT NULL,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'per_day', 'per_hour', 'per_kg', 'per_unit', 'negotiable')),
  also_accepts_cash BOOLEAN DEFAULT false,
  cash_price DECIMAL(10,2), -- optional cash alternative

  -- Item details
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'for_parts')),
  quantity INTEGER DEFAULT 1,
  unit TEXT, -- kg, tonnes, hours, days, hectares
  photo_urls TEXT[] DEFAULT '{}',

  -- Location
  country TEXT NOT NULL,
  region TEXT,
  delivery_available BOOLEAN DEFAULT false,
  delivery_radius_km INTEGER,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'reserved', 'completed', 'expired', 'cancelled')),
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,

  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exchange_listings_seller ON exchange_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_exchange_listings_category ON exchange_listings(category);
CREATE INDEX IF NOT EXISTS idx_exchange_listings_country ON exchange_listings(country);
CREATE INDEX IF NOT EXISTS idx_exchange_listings_status ON exchange_listings(status);

ALTER TABLE exchange_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view active listings" ON exchange_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers manage own listings" ON exchange_listings FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Admins full access listings" ON exchange_listings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. EXCHANGE TRANSACTIONS (Credit transfers between users)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exchange_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES exchange_listings(id) ON DELETE SET NULL,

  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),

  credits_amount DECIMAL(10,2) NOT NULL,
  commission_credits DECIMAL(10,2) DEFAULT 0, -- AFU's 5% cut
  net_to_seller DECIMAL(10,2) NOT NULL,

  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'disputed', 'refunded', 'cancelled')),

  -- Review
  buyer_rating INTEGER CHECK (buyer_rating BETWEEN 1 AND 5),
  buyer_comment TEXT,
  seller_rating INTEGER CHECK (seller_rating BETWEEN 1 AND 5),
  seller_comment TEXT,

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exchange_transactions_buyer ON exchange_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_exchange_transactions_seller ON exchange_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_exchange_transactions_listing ON exchange_transactions(listing_id);

ALTER TABLE exchange_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON exchange_transactions FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);
CREATE POLICY "Buyers can create transactions" ON exchange_transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admins full access transactions" ON exchange_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. CREDIT LEDGER (Every credit movement — audit trail)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES credit_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),

  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'earn', 'spend', 'commission', 'refund', 'bonus', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL, -- positive = credit in, negative = credit out
  balance_after DECIMAL(12,2) NOT NULL,

  description TEXT NOT NULL,
  reference_id UUID, -- links to exchange_transactions or payment
  reference_type TEXT, -- 'exchange', 'deposit', 'withdrawal'

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_wallet ON credit_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_type ON credit_ledger(type);

ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ledger" ON credit_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert ledger" ON credit_ledger FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full access ledger" ON credit_ledger FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. SEED: SAMPLE EXCHANGE LISTINGS
-- ────────────────────────────────────────────────────────────────────────────

-- Note: These use a NULL seller_id since we don't have real user IDs yet.
-- They'll show as demo data in the UI.
