import { z } from 'zod';

// ─── Shared primitives ───────────────────────────────────────

export const uuid = z.string().uuid();
export const email = z.string().email();
export const phone = z.string().max(30).optional().nullable();
export const country = z.string().min(2).max(50);

export const currency = z.enum([
  'BWP', 'ZWG', 'TZS', 'KES', 'ZAR', 'NGN', 'ZMW', 'MZN', 'SLL', 'USD',
]);

export const membershipTier = z.enum([
  'student', 'new_enterprise', 'smallholder', 'farmer_grower', 'commercial',
]);

export const paginationParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).optional(),
});

// ─── Members ─────────────────────────────────────────────────

export const createMemberSchema = z.object({
  profile_id: uuid,
  tier: membershipTier.default('new_enterprise'),
  status: z.enum(['pending', 'active', 'suspended', 'expired']).default('active'),
  farm_name: z.string().max(200).optional().nullable(),
  farm_size_ha: z.coerce.number().min(0).optional().nullable(),
  primary_crops: z.array(z.string()).default([]),
  livestock_types: z.array(z.string()).default([]),
  bio: z.string().max(2000).optional().nullable(),
  certifications: z.array(z.string()).default([]),
});

export const listMembersParams = paginationParams.extend({
  status: z.string().optional(),
  tier: z.string().optional(),
  search: z.string().max(200).optional(),
});

// ─── Suppliers ───────────────────────────────────────────────

export const createSupplierSchema = z.object({
  company_name: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(200),
  email: email,
  phone: phone,
  website: z.string().url().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  category: z.string().min(1).max(100),
  status: z.enum(['active', 'pending', 'suspended']).default('pending'),
  country: country,
  region: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  verified: z.boolean().default(false),
  commission_rate: z.coerce.number().min(0).max(100).default(10),
  member_discount_percent: z.coerce.number().min(0).max(100).default(10),
  certifications: z.array(z.string()).default([]),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const listSuppliersParams = paginationParams.extend({
  status: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  tier: z.string().optional(),
  search: z.string().max(200).optional(),
});

// ─── Applications ────────────────────────────────────────────

export const createApplicationSchema = z.object({
  full_name: z.string().min(1).max(200),
  email: email,
  phone: phone,
  country: country,
  region: z.string().max(100).optional().nullable(),
  farm_name: z.string().max(200).optional().nullable(),
  farm_size_ha: z.coerce.number().min(0).optional().nullable(),
  primary_crops: z.array(z.string()).default([]),
  requested_tier: membershipTier.default('smallholder'),
  notes: z.string().max(5000).optional().nullable(),
});

export const listApplicationsParams = paginationParams.extend({
  status: z.string().optional(),
});

// ─── Payments ────────────────────────────────────────────────

export const paymentMethod = z.enum(['card', 'mobile-money', 'bank-transfer', 'ussd']);

export const paymentProvider = z.enum([
  'stripe', 'mpesa', 'ecocash', 'orange_money', 'mtn_momo', 'airtel_money', 'bank_transfer',
]);

export const paymentPurpose = z.enum([
  'loan_repayment', 'membership_fee', 'input_purchase', 'insurance_premium',
  'equipment_rental', 'transport', 'commission_payout', 'subscription',
  'marketplace_purchase', 'staking_deposit', 'other',
]);

export const initiatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(2).max(5),
  method: paymentMethod,
  provider: paymentProvider,
  purpose: paymentPurpose,
  description: z.string().max(500).optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  relatedEntityType: z.string().max(100).optional().nullable(),
  relatedEntityId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

// ─── Farm Plots ──────────────────────────────────────────────

export const cropStage = z.enum([
  'planning', 'planted', 'germinating', 'growing', 'flowering',
  'fruiting', 'harvesting', 'post_harvest', 'fallow',
]);

export const createFarmPlotSchema = z.object({
  name: z.string().min(1).max(200),
  size_ha: z.coerce.number().positive().optional().nullable(),
  crop: z.string().max(100).optional().nullable(),
  variety: z.string().max(100).optional().nullable(),
  stage: cropStage.default('planning'),
  planting_date: z.string().optional().nullable(),      // ISO date string
  expected_harvest: z.string().optional().nullable(),    // ISO date string
  health_score: z.coerce.number().int().min(0).max(100).optional().nullable(),
  soil_ph: z.coerce.number().min(0).max(14).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateFarmPlotSchema = createFarmPlotSchema.partial();

// ─── Admin Settings ──────────────────────────────────────────

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

// ─── Admin: Loan Approve/Reject ─────────────────────────────

export const loanApproveSchema = z.object({
  loanId: uuid,
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(1000).optional(),
});

// ─── Admin: Loan Disburse ───────────────────────────────────

export const loanDisburseSchema = z.object({
  loanId: uuid,
  amount: z.number().positive('Amount must be positive'),
  method: z.string().min(1, 'Disbursement method is required'),
  currency: z.string().length(3).default('USD'),
});

// ─── Admin: KYC Approve/Reject ──────────────────────────────

export const kycApproveSchema = z.object({
  memberId: uuid,
  action: z.enum(['approve', 'reject']),
  tier: z.number().int().min(1).max(3).optional(),
  notes: z.string().max(1000).optional(),
  documentId: z.string().uuid().optional(),
});

// ─── Validation helper ───────────────────────────────────────

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.flatten();
  const fieldErrors = Object.entries(errors.fieldErrors)
    .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
    .join('; ');
  return { success: false, error: fieldErrors || 'Validation failed' };
}

export function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): ValidationResult<T> {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return validate(schema, obj);
}
