-- Fix message_templates: add missing columns expected by admin templates page
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]';
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- is_active may have been added as TEXT by migration 035 — fix to BOOLEAN
DO $$
BEGIN
  -- Add if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_templates' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE message_templates ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  ELSE
    -- If it exists as TEXT, convert to BOOLEAN
    IF (
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'message_templates' AND column_name = 'is_active'
    ) = 'text' THEN
      ALTER TABLE message_templates
        ALTER COLUMN is_active DROP DEFAULT,
        ALTER COLUMN is_active TYPE BOOLEAN USING (
          CASE WHEN is_active IN ('true', 't', '1') THEN true ELSE false END
        ),
        ALTER COLUMN is_active SET DEFAULT true;
    END IF;
  END IF;
END $$;
