-- 058_reviews_columns.sql
-- Adds columns needed for the supplier review submission flow.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID;

NOTIFY pgrst, 'reload schema';
