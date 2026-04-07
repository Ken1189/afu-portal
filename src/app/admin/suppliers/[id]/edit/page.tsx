'use client';

// ════════════════════════════════════════════════════════════════════════════
// AFU Admin — Edit Supplier
// ────────────────────────────────────────────────────────────────────────────
// Fetches an existing supplier row by id, presents a form bound to the
// editable fields, and writes updates back via Supabase. All numeric fields
// are coerced safely; nullable fields stay nullable. Errors are surfaced
// inline so the user is never bounced to the global error page.
// ════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SupplierCategory, SupplierStatus, SponsorshipTier } from '@/lib/supabase/types';
import type { SupplierRow } from '@/lib/supabase/use-suppliers';

const CATEGORIES: SupplierCategory[] = [
  'input-supplier',
  'equipment',
  'logistics',
  'processing',
  'technology',
  'financial-services',
];

const STATUSES: SupplierStatus[] = ['pending', 'active', 'suspended', 'rejected'];
const TIERS: SponsorshipTier[] = ['platinum', 'gold', 'silver', 'bronze'];

type FormState = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  logo_url: string;
  category: SupplierCategory;
  status: SupplierStatus;
  country: string;
  region: string;
  description: string;
  verified: boolean;
  is_founding: boolean;
  sponsorship_tier: SponsorshipTier | '';
  commission_rate: string;
  member_discount_percent: string;
  certifications: string;
};

function rowToForm(row: SupplierRow): FormState {
  return {
    company_name: row.company_name ?? '',
    contact_name: row.contact_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    website: row.website ?? '',
    logo_url: row.logo_url ?? '',
    category: row.category ?? 'input-supplier',
    status: row.status ?? 'pending',
    country: row.country ?? '',
    region: row.region ?? '',
    description: row.description ?? '',
    verified: !!row.verified,
    is_founding: !!row.is_founding,
    sponsorship_tier: (row.sponsorship_tier ?? '') as SponsorshipTier | '',
    commission_rate: String(row.commission_rate ?? ''),
    member_discount_percent: String(row.member_discount_percent ?? ''),
    certifications: Array.isArray(row.certifications) ? row.certifications.join(', ') : '',
  };
}

function formToUpdate(form: FormState): Partial<SupplierRow> {
  const numericRate = Number(form.commission_rate);
  const numericDiscount = Number(form.member_discount_percent);
  return {
    company_name: form.company_name.trim(),
    contact_name: form.contact_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    website: form.website.trim() || null,
    logo_url: form.logo_url.trim() || null,
    category: form.category,
    status: form.status,
    country: form.country.trim(),
    region: form.region.trim() || null,
    description: form.description.trim() || null,
    verified: form.verified,
    is_founding: form.is_founding,
    sponsorship_tier: (form.sponsorship_tier || null) as SponsorshipTier | null,
    commission_rate: Number.isFinite(numericRate) ? numericRate : 0,
    member_discount_percent: Number.isFinite(numericDiscount) ? numericDiscount : 0,
    certifications: form.certifications
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
  };
}

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error('[admin/suppliers/edit] fetch error:', error);
          setLoadError(error.message);
        } else if (!data) {
          setLoadError('Supplier not found');
        } else {
          setForm(rowToForm(data as SupplierRow));
        }
      } catch (err) {
        console.error('[admin/suppliers/edit] exception:', err);
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const updates = formToUpdate(form);
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);
      if (error) {
        console.error('[admin/suppliers/edit] update error:', error);
        setSaveError(error.message);
      } else {
        router.push(`/admin/suppliers/${id}`);
      }
    } catch (err) {
      console.error('[admin/suppliers/edit] update exception:', err);
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading supplier...</p>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-navy mb-2">Unable to load supplier</h2>
        <p className="text-sm text-gray-500 mb-4">{loadError ?? 'Unknown error'}</p>
        <Link href="/admin/suppliers" className="text-teal hover:text-teal-dark text-sm font-medium">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/suppliers/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Supplier
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-navy mb-1">Edit Supplier</h1>
        <p className="text-sm text-gray-500 mb-6">Update supplier profile and admin settings.</p>

        {saveError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company Name" required>
            <input
              type="text"
              required
              value={form.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Contact Name" required>
            <input
              type="text"
              required
              value={form.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Website">
            <input
              type="url"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Logo URL">
            <input
              type="url"
              value={form.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Category" required>
            <select
              required
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value as SupplierCategory)}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Status" required>
            <select
              required
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as SupplierStatus)}
              className="input"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Country" required>
            <input
              type="text"
              required
              value={form.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Region">
            <input
              type="text"
              value={form.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Commission Rate (%)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.commission_rate}
              onChange={(e) => handleChange('commission_rate', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Member Discount (%)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.member_discount_percent}
              onChange={(e) => handleChange('member_discount_percent', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Sponsorship Tier">
            <select
              value={form.sponsorship_tier}
              onChange={(e) => handleChange('sponsorship_tier', e.target.value as SponsorshipTier | '')}
              className="input"
            >
              <option value="">None</option>
              {TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Certifications (comma separated)">
            <input
              type="text"
              value={form.certifications}
              onChange={(e) => handleChange('certifications', e.target.value)}
              className="input"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => handleChange('verified', e.target.checked)}
            />
            Verified
          </label>

          <label className="flex items-center gap-2 text-sm text-navy">
            <input
              type="checkbox"
              checked={form.is_founding}
              onChange={(e) => handleChange('is_founding', e.target.checked)}
            />
            Founding member
          </label>

          <div className="md:col-span-2 flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy hover:bg-navy/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/admin/suppliers/${id}`}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1B2A4A;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #8CB89C;
          box-shadow: 0 0 0 3px rgba(140, 184, 156, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
