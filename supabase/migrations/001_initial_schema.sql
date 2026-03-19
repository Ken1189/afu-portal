-- ============================================================================
-- AFU PORTAL — INITIAL DATABASE SCHEMA
-- Sprint 1: Foundation tables for members, suppliers, products, orders
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE membership_tier AS ENUM (
  'student',
  'new_enterprise',
  'smallholder',
  'farmer_grower',
  'commercial'
);

CREATE TYPE member_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'expired'
);

CREATE TYPE supplier_status AS ENUM (
  'pending',
  'active',
  'suspended'
);

CREATE TYPE supplier_category AS ENUM (
  'input-supplier',
  'equipment',
  'logistics',
  'processing',
  'technology',
  'financial-services'
);

CREATE TYPE sponsorship_tier AS ENUM (
  'platinum',
  'gold',
  'silver',
  'bronze'
);

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE payment_method AS ENUM (
  'card',
  'mobile_money',
  'bank_transfer',
  'cash'
);

CREATE TYPE loan_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'disbursed',
  'repaying',
  'completed',
  'defaulted',
  'rejected'
);

CREATE TYPE user_role AS ENUM (
  'member',
  'supplier',
  'admin',
  'super_admin'
);

CREATE TYPE application_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected'
);

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'member',
  country         TEXT,
  region          TEXT,
  address         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- MEMBERS
-- ============================================================================

CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id       TEXT NOT NULL UNIQUE,  -- e.g. AFU-2024-001
  tier            membership_tier NOT NULL DEFAULT 'new_enterprise',
  status          member_status NOT NULL DEFAULT 'pending',
  farm_name       TEXT,
  farm_size_ha    DECIMAL(10,2),
  primary_crops   TEXT[],
  livestock_types TEXT[],
  join_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date     DATE,
  bio             TEXT,
  certifications  TEXT[],
  credit_score    INTEGER DEFAULT 0,
  total_spent     DECIMAL(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_profile ON members(profile_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_tier ON members(tier);
CREATE INDEX idx_members_country ON members USING btree ((
  (SELECT country FROM profiles WHERE profiles.id = members.profile_id)
));

-- ============================================================================
-- MEMBERSHIP APPLICATIONS
-- ============================================================================

CREATE TABLE membership_applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  country         TEXT NOT NULL,
  region          TEXT,
  farm_name       TEXT,
  farm_size_ha    DECIMAL(10,2),
  primary_crops   TEXT[],
  requested_tier  membership_tier NOT NULL DEFAULT 'smallholder',
  status          application_status NOT NULL DEFAULT 'pending',
  notes           TEXT,
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_status ON membership_applications(status);

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

CREATE TABLE suppliers (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_name            TEXT NOT NULL,
  contact_name            TEXT NOT NULL,
  email                   TEXT NOT NULL,
  phone                   TEXT,
  website                 TEXT,
  logo_url                TEXT,
  category                supplier_category NOT NULL,
  status                  supplier_status NOT NULL DEFAULT 'pending',
  country                 TEXT NOT NULL,
  region                  TEXT,
  description             TEXT,
  verified                BOOLEAN NOT NULL DEFAULT false,
  is_founding             BOOLEAN NOT NULL DEFAULT false,
  sponsorship_tier        sponsorship_tier,
  commission_rate         DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  member_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  rating                  DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count            INTEGER NOT NULL DEFAULT 0,
  products_count          INTEGER NOT NULL DEFAULT 0,
  total_sales             DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_orders            INTEGER NOT NULL DEFAULT 0,
  certifications          TEXT[],
  join_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_country ON suppliers(country);

-- ============================================================================
-- PRODUCTS (marketplace)
-- ============================================================================

CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id       UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  category          supplier_category NOT NULL,
  price             DECIMAL(10,2) NOT NULL,
  member_price      DECIMAL(10,2),
  discount_percent  DECIMAL(5,2) DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'USD',
  unit              TEXT DEFAULT 'unit',
  sku               TEXT,
  image_url         TEXT,
  images            TEXT[],
  in_stock          BOOLEAN NOT NULL DEFAULT true,
  stock_quantity    INTEGER DEFAULT 0,
  sold_count        INTEGER NOT NULL DEFAULT 0,
  rating            DECIMAL(3,2) DEFAULT 0,
  review_count      INTEGER DEFAULT 0,
  featured          BOOLEAN NOT NULL DEFAULT false,
  tags              TEXT[],
  specifications    JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT NOT NULL UNIQUE,
  member_id       UUID NOT NULL REFERENCES members(id),
  status          order_status NOT NULL DEFAULT 'pending',
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping        DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax             DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USD',
  shipping_address JSONB,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id),
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID REFERENCES orders(id),
  member_id         UUID REFERENCES members(id),
  amount            DECIMAL(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  method            payment_method,
  status            payment_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  gateway_response  JSONB,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================================
-- COMMISSIONS (supplier earnings)
-- ============================================================================

CREATE TABLE commissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id),
  order_id        UUID NOT NULL REFERENCES orders(id),
  order_item_id   UUID REFERENCES order_items(id),
  sale_amount     DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_supplier ON commissions(supplier_id);

-- ============================================================================
-- LOANS / FINANCING
-- ============================================================================

CREATE TABLE loans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id),
  loan_number     TEXT NOT NULL UNIQUE,
  loan_type       TEXT NOT NULL, -- 'working_capital', 'invoice_finance', 'equipment'
  amount          DECIMAL(14,2) NOT NULL,
  interest_rate   DECIMAL(5,2) NOT NULL,
  term_months     INTEGER NOT NULL,
  status          loan_status NOT NULL DEFAULT 'draft',
  purpose         TEXT,
  collateral      TEXT,
  approved_by     UUID REFERENCES profiles(id),
  approved_at     TIMESTAMPTZ,
  disbursed_at    TIMESTAMPTZ,
  due_date        DATE,
  amount_repaid   DECIMAL(14,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loans_member ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  details         JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'info',  -- info, success, warning, error
  read            BOOLEAN NOT NULL DEFAULT false,
  action_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Members: own data or admin
CREATE POLICY "Members can view own data" ON members
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage members" ON members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Suppliers: public read for active, owner can edit, admin full access
CREATE POLICY "Anyone can view active suppliers" ON suppliers
  FOR SELECT USING (status = 'active');
CREATE POLICY "Supplier owners can view own" ON suppliers
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Supplier owners can update own" ON suppliers
  FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Products: public read, supplier owner can manage, admin full access
CREATE POLICY "Anyone can view in-stock products" ON products
  FOR SELECT USING (in_stock = true);
CREATE POLICY "Supplier owners can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = products.supplier_id AND profile_id = auth.uid())
  );
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Orders: own orders or admin
CREATE POLICY "Members can view own orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE id = orders.member_id AND profile_id = auth.uid())
  );
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Notifications: own only
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Audit log: admin only
CREATE POLICY "Admins can view audit log" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON membership_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate member ID sequence
CREATE SEQUENCE member_id_seq START 1;

CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.member_id = 'AFU-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(nextval('member_id_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_member_id BEFORE INSERT ON members
  FOR EACH ROW WHEN (NEW.member_id IS NULL OR NEW.member_id = '')
  EXECUTE FUNCTION generate_member_id();

-- Generate order number
CREATE SEQUENCE order_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- Generate loan number
CREATE SEQUENCE loan_number_seq START 100;

CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.loan_number = 'LN-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(nextval('loan_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loan_number BEFORE INSERT ON loans
  FOR EACH ROW WHEN (NEW.loan_number IS NULL OR NEW.loan_number = '')
  EXECUTE FUNCTION generate_loan_number();

-- ============================================================================
-- DONE
-- ============================================================================
