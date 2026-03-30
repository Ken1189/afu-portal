'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ── Toast ─────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────

interface ContactConfig {
  primary_email: string;
  support_email: string;
  phone: string;
  hq_address: string;
  hq_city: string;
  hq_country: string;
  operations: string;
}

const defaultConfig: ContactConfig = {
  primary_email: 'peterw@africanfarmingunion.org',
  support_email: 'devonk@africanfarmingunion.org',
  phone: '',
  hq_address: '',
  hq_city: 'Gaborone',
  hq_country: 'Botswana',
  operations: 'Botswana, Zimbabwe, Tanzania',
};

// ── Main Page ─────────────────────────────────────────────

export default function ContactInfoAdminPage() {
  const supabase = createClient();
  const [form, setForm] = useState<ContactConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('site_config').select('*').eq('key', 'contact_info').single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (parsed && typeof parsed === 'object') {
            setForm({ ...defaultConfig, ...parsed });
          }
        }
      } catch {
        // keep defaults
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!form.primary_email.trim()) {
      setToast({ message: 'Primary email is required', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('site_config').upsert({
        key: 'contact_info',
        value: JSON.stringify(form),
        description: 'Contact information displayed on /contact page',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
      if (error) throw error;
      setToast({ message: 'Contact information saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save contact info', type: 'error' });
    }
    setSaving(false);
  };

  const update = (field: keyof ContactConfig, value: string) => setForm(f => ({ ...f, [field]: value }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/settings" className="text-gray-400 hover:text-[#1B2A4A] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Mail className="w-6 h-6 text-[#5DB347]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Contact Information</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8 ml-8">
        Manage contact details displayed on the /contact page and in error messages.
      </p>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Primary Email *</label>
            <input
              type="email"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
              value={form.primary_email}
              onChange={e => update('primary_email', e.target.value)}
              placeholder="info@africanfarmingunion.org"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Support Email</label>
            <input
              type="email"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
              value={form.support_email}
              onChange={e => update('support_email', e.target.value)}
              placeholder="support@africanfarmingunion.org"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Phone Number</label>
          <input
            type="tel"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="+267 XXX XXXX"
          />
        </div>

        <hr className="border-gray-100" />

        <h3 className="text-sm font-bold text-[#1B2A4A]">Headquarters</h3>

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Street Address</label>
          <input
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
            value={form.hq_address}
            onChange={e => update('hq_address', e.target.value)}
            placeholder="Plot 123, Main Mall"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">City</label>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
              value={form.hq_city}
              onChange={e => update('hq_city', e.target.value)}
              placeholder="Gaborone"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Country</label>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
              value={form.hq_country}
              onChange={e => update('hq_country', e.target.value)}
              placeholder="Botswana"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Operations Regions</label>
          <input
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
            value={form.operations}
            onChange={e => update('operations', e.target.value)}
            placeholder="Botswana, Zimbabwe, Tanzania"
          />
          <p className="text-xs text-gray-400 mt-1">Comma-separated list of countries/regions where AFU operates.</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 shadow-md shadow-[#5DB347]/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Contact Info
          </button>
        </div>
      </div>
    </div>
  );
}
