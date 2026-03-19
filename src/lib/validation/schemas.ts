import { z } from 'zod';

// ─── Shared primitives ───────────────────────────────────────

const uuid = z.string().uuid();
const email = z.string().email();
const phone = z.string().max(30).optional().nullable();
const country = z.string().min(2).max(50);
const paginationParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).optional(),
});

// ─── Members ─────────────────────────────────────────────────

export const createMemberSchema = z.object({
  profile_id: uuid,
  tier: z.enum(['student', 'new_enterprise', 'smallholder', 'farmer_grower', 'commercial']).default('new_enterprise'),
  status: z.enum(['active', 'suspended', 'inactive']).default('active'),
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
  status: z.enum(['active', 'pending', 'suspended', 'inactive']).default('pending'),
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
  requested_tier: z.enum(['student', 'new_enterprise', 'smallholder', 'farmer_grower', 'commercial']).default('smallholder'),
});

export const listApplicationsParams = paginationParams.extend({
  status: z.string().optional(),
});

// ─── Admin Settings ──────────────────────────────────────────

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
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
