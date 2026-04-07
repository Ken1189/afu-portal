-- Recompute supplier average rating and review count from the reviews table
DROP FUNCTION IF EXISTS update_supplier_rating(UUID, DECIMAL);
DROP FUNCTION IF EXISTS update_supplier_rating(UUID, NUMERIC);
CREATE OR REPLACE FUNCTION update_supplier_rating(supplier_id UUID, new_rating NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg NUMERIC;
  v_count INTEGER;
BEGIN
  -- Recompute aggregates from the reviews table for this supplier
  SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2),
         COALESCE(COUNT(*), 0)::INTEGER
    INTO v_avg, v_count
  FROM reviews
  WHERE reviews.supplier_id = update_supplier_rating.supplier_id;

  -- Update the suppliers table with the recomputed values
  UPDATE suppliers
  SET rating = v_avg,
      review_count = v_count
  WHERE id = update_supplier_rating.supplier_id;

  -- Best-effort: also update members table if a matching row exists
  BEGIN
    UPDATE members
    SET rating = v_avg,
        review_count = v_count
    WHERE id = update_supplier_rating.supplier_id;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;
END;
$$;

NOTIFY pgrst, 'reload schema';
