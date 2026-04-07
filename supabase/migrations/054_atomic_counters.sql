-- Atomic counter increment for supplier products
CREATE OR REPLACE FUNCTION increment_supplier_products(p_supplier_id UUID, p_delta INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE suppliers
  SET products_count = COALESCE(products_count, 0) + p_delta
  WHERE id = p_supplier_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic counter for farmer sponsors
CREATE OR REPLACE FUNCTION increment_farmer_sponsors(p_farmer_id UUID, p_amount DECIMAL DEFAULT 0)
RETURNS void AS $$
BEGIN
  UPDATE farmer_public_profiles
  SET active_sponsors = COALESCE(active_sponsors, 0) + 1,
      monthly_funding_received = COALESCE(monthly_funding_received, 0) + p_amount
  WHERE id = p_farmer_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic course enrollment counter
CREATE OR REPLACE FUNCTION increment_course_enrollment(p_course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET enrollment_count = COALESCE(enrollment_count, 0) + 1
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic supplier rating update
CREATE OR REPLACE FUNCTION update_supplier_rating(p_supplier_id UUID, p_new_rating DECIMAL)
RETURNS void AS $$
DECLARE
  current_count INTEGER;
  current_avg DECIMAL;
BEGIN
  SELECT review_count, rating INTO current_count, current_avg
  FROM suppliers WHERE id = p_supplier_id FOR UPDATE;

  current_count := COALESCE(current_count, 0);
  current_avg := COALESCE(current_avg, 0);

  -- Calculate new average: ((old_avg * old_count) + new_rating) / (old_count + 1)
  UPDATE suppliers
  SET rating = ((current_avg * current_count) + p_new_rating) / (current_count + 1),
      review_count = current_count + 1
  WHERE id = p_supplier_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic order creation: order + items in one transaction
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_member_id UUID,
  p_supplier_id UUID,
  p_total DECIMAL,
  p_status TEXT,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  -- Create order
  INSERT INTO orders (member_id, supplier_id, total, status, payment_status)
  VALUES (p_member_id, p_supplier_id, p_total, p_status, 'pending')
  RETURNING id INTO new_order_id;

  -- Insert items
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO order_items (order_id, supplier_id, product_id, quantity, unit_price, total_price)
    VALUES (
      new_order_id,
      p_supplier_id,
      (item->>'product_id')::UUID,
      (item->>'quantity')::INTEGER,
      (item->>'unit_price')::DECIMAL,
      (item->>'total_price')::DECIMAL
    );
  END LOOP;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- Add columns referenced
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS products_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0;
ALTER TABLE farmer_public_profiles ADD COLUMN IF NOT EXISTS active_sponsors INTEGER DEFAULT 0;
ALTER TABLE farmer_public_profiles ADD COLUMN IF NOT EXISTS monthly_funding_received DECIMAL(12,2) DEFAULT 0;

-- Add missing foreign keys
DO $$ BEGIN
  ALTER TABLE payouts ADD CONSTRAINT fk_payouts_processed_by
    FOREIGN KEY (processed_by) REFERENCES profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE commissions ADD CONSTRAINT fk_commissions_payout
    FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE receipt_financing ADD CONSTRAINT fk_receipt_financing_loan
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
