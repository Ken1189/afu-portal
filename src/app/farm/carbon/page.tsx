'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Leaf,
  TreePine,
  Sprout,
  Wheat,
  Beef,
  Mountain,
  Waves,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Award,
  Info,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import LegalDisclaimer from '@/components/ui/LegalDisclaimer';

interface Practice {
  id: string;
  user_id: string;
  farm_id: string | null;
  practice_type: string;
  hectares: number | null;
  status: string | null;
  start_date: string | null;
  verified_at: string | null;
  credits_issued: number | null;
  co2_tonnes: number | null;
  created_at: string;
}

interface Farm {
  id: string;
  name: string;
}

const AVAILABLE_PRACTICES = [
  { key: 'agroforestry', name: 'Agroforestry', icon: TreePine, desc: 'Integrate trees with crops or livestock', rate: '3-8 t CO₂/ha/yr' },
  { key: 'cover_cropping', name: 'Cover Cropping', icon: Sprout, desc: 'Plant cover crops between seasons', rate: '0.5-2 t CO₂/ha/yr' },
  { key: 'no_till', name: 'No-Till Farming', icon: Wheat, desc: 'Minimize soil disturbance', rate: '0.4-1.5 t CO₂/ha/yr' },
  { key: 'biochar', name: 'Biochar Application', icon: Mountain, desc: 'Apply biochar to soils', rate: '2-5 t CO₂/ha/yr' },
  { key: 'rotational_grazing', name: 'Rotational Grazing', icon: Beef, desc: 'Rotate livestock to regenerate pasture', rate: '0.5-3 t CO₂/ha/yr' },
  { key: 'mangrove_restoration', name: 'Mangrove Restoration', icon: Waves, desc: 'Restore coastal mangroves', rate: '5-12 t CO₂/ha/yr' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  verified: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function FarmCarbonPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [practices, setPractices] = useState<Practice[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<string>('');
  const [farmId, setFarmId] = useState('');
  const [hectares, setHectares] = useState('');
  const [startDate, setStartDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [practicesRes, farmsRes] = await Promise.all([
        supabase
          .from('carbon_practices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('farms').select('id, name').eq('user_id', user.id),
      ]);
      setPractices((practicesRes.data as Practice[]) || []);
      setFarms((farmsRes.data as Farm[]) || []);
    } catch (err) {
      console.error('[farm/carbon] fetch error', err);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEnroll = (practiceKey: string) => {
    setSelectedPractice(practiceKey);
    setFarmId(farms[0]?.id || '');
    setHectares('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const submitEnroll = async () => {
    if (!user || !selectedPractice) return;
    if (!farmId) {
      setToast({ type: 'error', msg: 'Please select a farm' });
      return;
    }
    const hect = parseFloat(hectares);
    if (isNaN(hect) || hect <= 0) {
      setToast({ type: 'error', msg: 'Enter valid hectares' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('carbon_practices').insert({
        user_id: user.id,
        farm_id: farmId,
        practice_type: selectedPractice,
        hectares: hect,
        status: 'pending',
        start_date: startDate || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setToast({ type: 'success', msg: 'Practice enrolled — pending verification' });
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to enroll';
      setToast({ type: 'error', msg });
    }
    setSubmitting(false);
    setTimeout(() => setToast(null), 4000);
  };

  // Stats
  const totalCredits = practices.reduce((s, p) => s + (Number(p.credits_issued) || 0), 0);
  const totalCo2 = practices.reduce((s, p) => s + (Number(p.co2_tonnes) || 0), 0);
  const projectedAnnual = practices.reduce((s, p) => s + (Number(p.hectares) || 0) * 2, 0);
  const paymentsReceived = totalCredits * 15; // illustrative $15/credit

  const findPractice = (key: string) => AVAILABLE_PRACTICES.find((p) => p.key === key);

  return (
    <div className="px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#5DB347]" />
          Carbon Credits
        </h1>
        <p className="text-sm text-gray-500 mt-1">Earn from sustainable farming practices</p>
      </div>

      <LegalDisclaimer type="general" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#5DB347] rounded-2xl p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Earn from Sustainable Farming Practices</h2>
        <p className="text-sm opacity-90 max-w-2xl">
          Adopt regenerative practices, sequester carbon in your soil and trees, and earn verified
          carbon credits that pay you for protecting the planet. AFU connects you with verified
          buyers across global voluntary carbon markets.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Credits Earned', value: totalCredits.toLocaleString(), icon: Award, color: 'bg-[#5DB347]/10 text-[#5DB347]' },
          { label: 'Tonnes CO₂', value: totalCo2.toFixed(1), icon: Leaf, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Projected Annual', value: projectedAnnual.toFixed(0), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Payments Received', value: `$${paymentsReceived.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-[#1B2A4A]">{s.value}</p>
              <p className="text-[11px] text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Enrolled practices */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Your Enrolled Practices</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#5DB347] animate-spin" />
          </div>
        ) : practices.length === 0 ? (
          <div className="text-center py-10">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-[#1B2A4A] mb-1">No practices enrolled yet</h3>
            <p className="text-sm text-gray-500">Start earning by selecting a practice below.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="py-2">Practice</th>
                  <th className="py-2">Hectares</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Verified</th>
                  <th className="py-2">Credits</th>
                </tr>
              </thead>
              <tbody>
                {practices.map((p) => {
                  const meta = findPractice(p.practice_type);
                  return (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="py-3 font-medium text-[#1B2A4A]">{meta?.name || p.practice_type}</td>
                      <td className="py-3 text-gray-600">{Number(p.hectares || 0).toLocaleString()} ha</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[p.status || 'pending'] || 'bg-gray-100 text-gray-600'}`}>
                          {(p.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {p.verified_at ? new Date(p.verified_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 font-semibold text-[#5DB347]">{Number(p.credits_issued || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available practices */}
      <div>
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Available Practices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_PRACTICES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.key} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-[#5DB347]/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{p.desc}</p>
                <p className="text-[11px] text-[#5DB347] font-semibold mb-4">{p.rate}</p>
                <button
                  onClick={() => openEnroll(p.key)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-xl text-xs font-semibold hover:bg-[#449933] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Enroll
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification + payment info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAF8F3] rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-[#5DB347]" />
            <h3 className="font-bold text-[#1B2A4A]">Verification Process</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            After you enroll, AFU partner verifiers visit your farm or use satellite monitoring to
            confirm the practice. Verification can take 60-180 days depending on the practice type.
            Once verified, credits are issued to your wallet.
          </p>
        </div>
        <div className="bg-[#FAF8F3] rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#5DB347]" />
            <h3 className="font-bold text-[#1B2A4A]">How Payment Works</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Verified credits appear in your AFU wallet. AFU sells them on global voluntary carbon
            markets. You receive 70% of the sale price; the rest covers verification, monitoring
            and platform costs.
          </p>
        </div>
      </div>

      {/* Enrollment modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B2A4A]">
                Enroll: {findPractice(selectedPractice)?.name}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {farms.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  You need at least one farm to enroll.{' '}
                  <a href="/farm/farms" className="font-semibold underline">
                    Add a farm
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Farm</label>
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hectares</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={hectares}
                    onChange={(e) => setHectares(e.target.value)}
                    placeholder="e.g. 5.0"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEnroll}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#449933] disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enroll
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-[#5DB347] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
