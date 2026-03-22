-- Migration 014: Performance indexes for frequently filtered columns
-- These indexes speed up the admin dashboard, filter bar, and list pages

-- Loans: filtered by status, member_id
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at DESC);

-- Members: filtered by status, tier, profile_id
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);
CREATE INDEX IF NOT EXISTS idx_members_profile_id ON members(profile_id);

-- Payments: filtered by status, user_id
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- KYC Documents: filtered by status, user_id
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);

-- Applications: filtered by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON membership_applications(created_at DESC);

-- Notifications: filtered by recipient, read status
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- Audit log: filtered by entity
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Farmer references: filtered by farmer
CREATE INDEX IF NOT EXISTS idx_farmer_references_farmer ON farmer_references(farmer_id);

-- Farmer tiers: filtered by user
CREATE INDEX IF NOT EXISTS idx_farmer_tiers_user ON farmer_tiers(user_id);

-- Profiles: filtered by role, country
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Insurance: filtered by farmer, status
CREATE INDEX IF NOT EXISTS idx_insurance_policies_farmer ON insurance_policies(farmer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);

-- Equipment bookings: filtered by user, status
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_user ON equipment_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_status ON equipment_bookings(status);

-- Farm activities: filtered by plot
CREATE INDEX IF NOT EXISTS idx_farm_activities_plot ON farm_activities(plot_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_user ON farm_activities(user_id);
