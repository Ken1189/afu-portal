-- Unified Inbox: conversations + messages + automation rules

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_type TEXT DEFAULT 'lead', -- member, supplier, ambassador, investor, lead
  profile_id UUID,
  subject TEXT,
  status TEXT DEFAULT 'open', -- open, assigned, resolved, closed
  assigned_to UUID,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'inbound', -- inbound, outbound
  channel TEXT DEFAULT 'email', -- email, sms, whatsapp, form, system
  sender_name TEXT,
  sender_email TEXT,
  sender_phone TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  html_body TEXT,
  attachments JSONB,
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  message_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL, -- new_application, member_approved, ambassador_approved, supplier_approved, form_submitted, tag_added, inactivity, anniversary
  trigger_config JSONB DEFAULT '{}',
  action_type TEXT NOT NULL, -- send_email, send_sms, send_whatsapp, add_tag, assign_to, create_notification, update_status
  action_config JSONB DEFAULT '{}',
  delay_minutes INTEGER DEFAULT 0,
  created_by UUID,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_email ON conversations(contact_email);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_messages_created ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);

-- Disable RLS for now
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
GRANT ALL ON conversations TO anon;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_messages TO anon;
GRANT ALL ON conversation_messages TO authenticated;
GRANT ALL ON automation_rules TO anon;
GRANT ALL ON automation_rules TO authenticated;
