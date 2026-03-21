'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Tag,
  FileText,
  Percent,
  DollarSign,
  Save,
  Loader2,
} from 'lucide-react';
import { useSuppliers } from '@/lib/supabase/use-suppliers';
import type { SupplierCategory } from '@/lib/supabase/types';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const categories: { value: SupplierCategory; label: string }[] = [
  { value: 'input-supplier', label: 'Input Supplier' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'processing', label: 'Processing' },
  { value: 'technology', label: 'Technology' },
  { value: 'financial-services', label: 'Financial Services' },
];

const countries = ['Botswana', 'Kenya', 'Mozambique', 'Nigeria', 'Sierra Leone', 'South Africa', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'];

export default function AddSupplierPage() {
  const router = useRouter();
  const { addSupplier } = useSuppliers();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    category: 'input-supplier' as SupplierCategory,
    country: 'Botswana',
    region: '',
    description: '',
    commission_rate: '10',
    member_discount_percent: '10',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.company_name || !form.contact_name || !form.email || !form.category || !form.country) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);

    const { data, error: insertError } = await addSupplier({
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone || undefined,
      website: form.website || undefined,
      category: form.category,
      country: form.country,
      region: form.region || undefined,
      description: form.description || undefined,
      commission_rate: parseFloat(form.commission_rate) || 10,
      member_discount_percent: parseFloat(form.member_discount_percent) || 10,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError);
    } else {
      router.push('/admin/suppliers');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <motion.div variants={fadeUp}>
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-navy">Add New Supplier</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a new supplier for the AFU marketplace. They will start in &ldquo;Pending&rdquo; status.
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100"
      >
        {/* Company Info */}
        <div className="p-6 space-y-5">
          <h2 className="text-sm font-semibold text-navy flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal" />
            Company Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                placeholder="e.g. Kalahari Seeds"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 resize-none"
              placeholder="Brief description of the supplier's offerings..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 space-y-5">
          <h2 className="text-sm font-semibold text-navy flex items-center gap-2">
            <User className="w-4 h-4 text-teal" />
            Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => updateField('contact_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                  placeholder="e.g. Thabo Mokoena"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                  placeholder="supplier@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                  placeholder="+267 71 234 567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                  placeholder="https://supplier.co.bw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="p-6 space-y-5">
          <h2 className="text-sm font-semibold text-navy flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal" />
            Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 bg-white"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Region / City</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                placeholder="e.g. Gaborone"
              />
            </div>
          </div>
        </div>

        {/* Commission & Discount */}
        <div className="p-6 space-y-5">
          <h2 className="text-sm font-semibold text-navy flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal" />
            Rates & Commissions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Commission Rate (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={form.commission_rate}
                  onChange={(e) => updateField('commission_rate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">AFU takes this percentage per sale</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                Member Discount (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={form.member_discount_percent}
                  onChange={(e) => updateField('member_discount_percent', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Discount for AFU members on this supplier</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 flex items-center justify-between bg-cream/50">
          <p className="text-xs text-gray-400">
            Supplier will be created with <strong>Pending</strong> status
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/suppliers"
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal hover:bg-teal-dark disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Supplier
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
