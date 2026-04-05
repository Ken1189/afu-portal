-- Contacts enhancements for CRM
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'; -- manual, form, application, import, api
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS dnd BOOLEAN DEFAULT false; -- Do Not Disturb
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS notes_count INTEGER DEFAULT 0;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS messages_count INTEGER DEFAULT 0;
