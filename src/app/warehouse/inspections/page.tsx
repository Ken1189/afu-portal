'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Inspection {
  id: string;
  receipt_id: string;
  receipt_number: string | null;
  farmer_name: string | null;
  commodity: string | null;
  moisture_percent: number;
  foreign_matter_percent: number;
  damage_percent: number;
  aflatoxin_level: string;
  color_assessment: string;
  odor: string;
  grade: string;
  status: string;
  inspector_notes: string | null;
  created_at: string;
}

type GradeKey = 'A' | 'B' | 'C' | 'Reject';

interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  Reject: number;
}

function computeGrade(moisture: number, foreignMatter: number, damage: number, aflatoxin: string, odor: string): string {
  if (aflatoxin === 'reject' || odor === 'chemical') return 'Reject';
  if (moisture > 20 || foreignMatter > 5 || damage > 10) return 'Reject';
  if (moisture > 15 || foreignMatter > 3 || damage > 5) return 'C';
  if (moisture > 12 || foreignMatter > 1.5 || damage > 2) return 'B';
  return 'A';
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [pendingReceipts, setPendingReceipts] = useState<Array<{ id: string; receipt_number: string; farmer_name: string | null; commodity: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution>({ A: 0, B: 0, C: 0, Reject: 0 });

  // Inspection form state
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    moisture_percent: 12,
    foreign_matter_percent: 1,
    damage_percent: 1,
    aflatoxin_level: 'safe',
    color_assessment: 'good',
    odor: 'normal',
    inspector_notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Pending: receipts without completed inspections
      const { data: pending } = await supabase
        .from('warehouse_receipts')
        .select('id, receipt_number, farmer_name, commodity')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      // Completed inspections
      const { data: completed } = await supabase
        .from('quality_inspections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      setPendingReceipts(pending || []);
      setInspections((completed as Inspection[]) || []);

      // Grade distribution
      const dist: GradeDistribution = { A: 0, B: 0, C: 0, Reject: 0 };
      completed?.forEach((insp) => {
        const key = insp.grade as GradeKey;
        if (key in dist) dist[key]++;
      });
      setGradeDistribution(dist);
    } catch (err) {
      console.error('Fetch inspections error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInspect = async () => {
    if (!inspectingId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const grade = computeGrade(
        formData.moisture_percent,
        formData.foreign_matter_percent,
        formData.damage_percent,
        formData.aflatoxin_level,
        formData.odor
      );

      await supabase.from('quality_inspections').insert({
        receipt_id: inspectingId,
        ...formData,
        grade,
        status: 'completed',
      });

      // Update receipt status
      await supabase
        .from('warehouse_receipts')
        .update({ status: grade === 'Reject' ? 'rejected' : 'received', grade })
        .eq('id', inspectingId);

      setInspectingId(null);
      setFormData({
        moisture_percent: 12,
        foreign_matter_percent: 1,
        damage_percent: 1,
        aflatoxin_level: 'safe',
        color_assessment: 'good',
        odor: 'normal',
        inspector_notes: '',
      });
      fetchData();
    } catch (err) {
      console.error('Inspection save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const totalInspections = Object.values(gradeDistribution).reduce((a, b) => a + b, 0);
  const gradePercent = (val: number) => totalInspections > 0 ? Math.round((val / totalInspections) * 100) : 0;

  const filteredInspections = inspections.filter((insp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      insp.receipt_number?.toLowerCase().includes(q) ||
      insp.farmer_name?.toLowerCase().includes(q) ||
      insp.commodity?.toLowerCase().includes(q)
    );
  });

  const gradeColor = (g: string) => {
    switch (g) {
      case 'A': return 'text-green-700 bg-green-100';
      case 'B': return 'text-blue-700 bg-blue-100';
      case 'C': return 'text-yellow-700 bg-yellow-100';
      case 'Reject': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">Quality Inspections</h1>

      {/* Grade Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Grade Distribution ({totalInspections} total)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['A', 'B', 'C', 'Reject'] as const).map((g) => (
            <div key={g} className="text-center">
              <div className={`text-3xl font-black mb-1 ${
                g === 'A' ? 'text-green-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {gradeDistribution[g]}
              </div>
              <div className="text-sm text-gray-500 mb-2">Grade {g} ({gradePercent(gradeDistribution[g])}%)</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    g === 'A' ? 'bg-green-500' : g === 'B' ? 'bg-blue-500' : g === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${gradePercent(gradeDistribution[g])}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 rounded-xl font-medium text-base min-h-[48px] transition-colors ${
            activeTab === 'pending' ? 'bg-[#5DB347] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Pending ({pendingReceipts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 rounded-xl font-medium text-base min-h-[48px] transition-colors ${
            activeTab === 'history' ? 'bg-[#5DB347] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          History ({inspections.length})
        </button>
      </div>

      {/* Pending Inspections */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingReceipts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">All inspections are complete</p>
            </div>
          ) : (
            pendingReceipts.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1B2A4A] text-base">{r.receipt_number}</p>
                    <p className="text-sm text-gray-500">{r.farmer_name || 'Walk-in'} &middot; <span className="capitalize">{r.commodity}</span></p>
                  </div>
                  <button
                    onClick={() => setInspectingId(inspectingId === r.id ? null : r.id)}
                    className="px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-medium hover:bg-[#4ea03c] min-h-[44px]"
                  >
                    {inspectingId === r.id ? 'Cancel' : 'Inspect'}
                  </button>
                </div>

                {inspectingId === r.id && (
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Moisture %</label>
                        <span className="text-base font-bold">{formData.moisture_percent}%</span>
                      </div>
                      <input
                        type="range" min={0} max={30} step={0.5}
                        value={formData.moisture_percent}
                        onChange={(e) => setFormData((p) => ({ ...p, moisture_percent: parseFloat(e.target.value) }))}
                        className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-[#5DB347]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Foreign Matter %</label>
                        <span className="text-base font-bold">{formData.foreign_matter_percent}%</span>
                      </div>
                      <input
                        type="range" min={0} max={10} step={0.1}
                        value={formData.foreign_matter_percent}
                        onChange={(e) => setFormData((p) => ({ ...p, foreign_matter_percent: parseFloat(e.target.value) }))}
                        className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-[#5DB347]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">Damage / Broken %</label>
                        <span className="text-base font-bold">{formData.damage_percent}%</span>
                      </div>
                      <input
                        type="range" min={0} max={20} step={0.5}
                        value={formData.damage_percent}
                        onChange={(e) => setFormData((p) => ({ ...p, damage_percent: parseFloat(e.target.value) }))}
                        className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-[#5DB347]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Aflatoxin</label>
                        <select
                          value={formData.aflatoxin_level}
                          onChange={(e) => setFormData((p) => ({ ...p, aflatoxin_level: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-h-[44px]"
                        >
                          <option value="safe">Safe</option>
                          <option value="warning">Warning</option>
                          <option value="reject">Reject</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Color</label>
                        <select
                          value={formData.color_assessment}
                          onChange={(e) => setFormData((p) => ({ ...p, color_assessment: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-h-[44px]"
                        >
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Odor</label>
                        <select
                          value={formData.odor}
                          onChange={(e) => setFormData((p) => ({ ...p, odor: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-h-[44px]"
                        >
                          <option value="normal">Normal</option>
                          <option value="musty">Musty</option>
                          <option value="chemical">Chemical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Inspector Notes</label>
                      <textarea
                        value={formData.inspector_notes}
                        onChange={(e) => setFormData((p) => ({ ...p, inspector_notes: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
                        placeholder="Optional notes..."
                      />
                    </div>

                    {/* Computed grade preview */}
                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                      <span className="text-sm text-gray-600">Computed Grade:</span>
                      <span className={`text-2xl font-black px-3 py-1 rounded-lg ${gradeColor(
                        computeGrade(formData.moisture_percent, formData.foreign_matter_percent, formData.damage_percent, formData.aflatoxin_level, formData.odor)
                      )}`}>
                        {computeGrade(formData.moisture_percent, formData.foreign_matter_percent, formData.damage_percent, formData.aflatoxin_level, formData.odor)}
                      </span>
                    </div>

                    <button
                      onClick={handleInspect}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />}
                      {saving ? 'Saving...' : 'Submit Inspection'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inspections..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Farmer</th>
                  <th className="px-4 py-3 font-medium">Commodity</th>
                  <th className="px-4 py-3 font-medium">Moisture</th>
                  <th className="px-4 py-3 font-medium">FM</th>
                  <th className="px-4 py-3 font-medium">Damage</th>
                  <th className="px-4 py-3 font-medium">Aflatoxin</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">No inspections found</td>
                  </tr>
                ) : (
                  filteredInspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">{insp.receipt_number || '-'}</td>
                      <td className="px-4 py-3 text-sm">{insp.farmer_name || '-'}</td>
                      <td className="px-4 py-3 text-sm capitalize">{insp.commodity || '-'}</td>
                      <td className="px-4 py-3 text-sm">{insp.moisture_percent}%</td>
                      <td className="px-4 py-3 text-sm">{insp.foreign_matter_percent}%</td>
                      <td className="px-4 py-3 text-sm">{insp.damage_percent}%</td>
                      <td className="px-4 py-3 text-sm capitalize">{insp.aflatoxin_level}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${gradeColor(insp.grade)}`}>{insp.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(insp.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
