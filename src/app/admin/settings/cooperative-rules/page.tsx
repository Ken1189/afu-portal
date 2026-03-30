'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──
interface CooperativeRules {
  min_members: number;
  max_members: number;
  annual_fee: number;
  voting_quorum_percent: number;
  leader_term_months: number;
  financial_year_start: string;
}

const DEFAULT_RULES: CooperativeRules = {
  min_members: 10,
  max_members: 500,
  annual_fee: 25,
  voting_quorum_percent: 51,
  leader_term_months: 24,
  financial_year_start: 'January',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CONFIG_KEY = 'cooperative_rules';

export default function CooperativeRulesConfigPage() {
  const [rules, setRules] = useState<CooperativeRules>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('site_config').select('value').eq('key', CONFIG_KEY).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data?.value) setRules(data.value);
      } catch {
        showToast('error', 'Failed to load config. Using defaults.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase.from('site_config').select('id').eq('key', CONFIG_KEY).single();
      if (existing) {
        const { error } = await supabase.from('site_config').update({ value: rules, updated_at: new Date().toISOString() }).eq('key', CONFIG_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_config').insert({ key: CONFIG_KEY, value: rules, description: 'Cooperative rules configuration' });
        if (error) throw error;
      }
      showToast('success', 'Cooperative rules saved successfully.');
    } catch {
      showToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5DB347' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="p-2 rounded-xl" style={{ backgroundColor: '#5DB34720' }}>
          <Users className="w-6 h-6" style={{ color: '#5DB347' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Cooperative Rules</h1>
          <p className="text-sm text-gray-500">Configure rules and requirements for farmer cooperatives</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Members</label>
            <input
              type="number" min={1} value={rules.min_members}
              onChange={e => setRules({ ...rules, min_members: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum number of members to form a cooperative</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Members</label>
            <input
              type="number" min={1} value={rules.max_members}
              onChange={e => setRules({ ...rules, max_members: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum number of members per cooperative</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fee (USD)</label>
            <input
              type="number" min={0} step={0.01} value={rules.annual_fee}
              onChange={e => setRules({ ...rules, annual_fee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Annual membership fee per member</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voting Quorum (%)</label>
            <input
              type="number" min={1} max={100} value={rules.voting_quorum_percent}
              onChange={e => setRules({ ...rules, voting_quorum_percent: parseInt(e.target.value) || 51 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Percentage of members needed for a valid vote</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leader Term (months)</label>
            <input
              type="number" min={1} value={rules.leader_term_months}
              onChange={e => setRules({ ...rules, leader_term_months: parseInt(e.target.value) || 12 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Duration of elected leadership terms</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year Start</label>
            <select
              value={rules.financial_year_start}
              onChange={e => setRules({ ...rules, financial_year_start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Month when the financial year begins</p>
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#5DB347' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
}
