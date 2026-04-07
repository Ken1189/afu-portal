-- 056_user_preferences.sql
-- Per-user preferences: notification channels, currency, language, timezone.

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email_notifications JSONB DEFAULT '{"orders":true,"payments":true,"training":true,"system":true,"marketing":false}'::jsonb,
  sms_notifications JSONB DEFAULT '{"orders":true,"payments":true,"training":false,"system":false,"marketing":false}'::jsonb,
  whatsapp_notifications JSONB DEFAULT '{"orders":false,"payments":false,"training":false,"system":false,"marketing":false}'::jsonb,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

NOTIFY pgrst, 'reload schema';
