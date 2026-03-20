-- Migration 004: Notification Queue table for auditing and retry logic

BEGIN;

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES members(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_recipient ON notification_queue(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created ON notification_queue(created_at DESC);

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (no direct user access)
CREATE POLICY "Service role full access on notification_queue"
  ON notification_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view notification logs
CREATE POLICY "Admins can view notification queue"
  ON notification_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

COMMIT;
