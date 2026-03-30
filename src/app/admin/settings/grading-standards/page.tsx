'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Wheat,
  Coffee,
  Leaf,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Grade {
  grade: string;
  description: string;
  price_premium_percent: number;
  moisture_max: number;
  foreign_matter_max: number;
}

interface CommodityGrading {
  commodity: string;
  grades: Grade[];
}

const EMPTY_GRADE: Grade = {
  grade: '',
  description: '',
  price_premium_percent: 0,
  moisture_max: 0,
  foreign_matter_max: 0,
};

const DEFAULT_STANDARDS: CommodityGrading[] = [
  {
    commodity: 'Maize',
    grades: [
      { grade: 'Grade A', description: 'Premium quality, minimal defects', price_premium_percent: 15, moisture_max: 12.5, foreign_matter_max: 0.5 },
      { grade: 'Grade B', description: 'Standard quality, minor defects acceptable', price_premium_percent: 5, moisture_max: 13.5, foreign_matter_max: 1.0 },
      { grade: 'Grade C', description: 'Basic quality, higher tolerance for defects', price_premium_percent: 0, moisture_max: 14.5, foreign_matter_max: 2.0 },
    ],
  },
  {
    commodity: 'Coffee',
    grades: [
      { grade: 'AA', description: 'Largest beans, 7.2mm screen, top specialty', price_premium_percent: 25, moisture_max: 11.0, foreign_matter_max: 0.2 },
      { grade: 'AB', description: 'Mixed large beans, 6.7mm screen', price_premium_percent: 15, moisture_max: 11.5, foreign_matter_max: 0.5 },
      { grade: 'PB', description: 'Peaberry, single round bean, unique flavor', price_premium_percent: 20, moisture_max: 11.0, foreign_matter_max: 0.3 },
      { grade: 'C', description: 'Smaller beans, commercial grade', price_premium_percent: 0, moisture_max: 12.5, foreign_matter_max: 1.0 },
    ],
  },
  {
    commodity: 'Cotton',
    grades: [
      { grade: 'Grade 1', description: 'Extra white, long staple, minimal trash', price_premium_percent: 20, moisture_max: 7.0, foreign_matter_max: 0.5 },
      { grade: 'Grade 2', description: 'White, medium staple, low trash', price_premium_percent: 10, moisture_max: 7.5, foreign_matter_max: 1.0 },
      { grade: 'Grade 3', description: 'Light spotted, medium staple', price_premium_percent: 3, moisture_max: 8.0, foreign_matter_max: 1.5 },
      { grade: 'Grade 4', description: 'Spotted or tinged, shorter staple', price_premium_percent: 0, moisture_max: 8.5, foreign_matter_max: 2.5 },
    ],
  },
];

// ── Toast Component ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
}

// ── Commodity icon helper ──────────────────────────────────────────────────
function CommodityIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes('coffee')) return <Coffee size={18} className="text-amber-700" />;
  if (lower.includes('cotton') || lower.includes('tea')) return <Leaf size={18} className="text-green-600" />;
  return <Wheat size={18} className="text-yellow-600" />;
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function GradingStandardsPage() {
  const supabase = createClient();

  const [standards, setStandards] = useState<CommodityGrading[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Expanded commodity sections
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingCommodity, setEditingCommodity] = useState<string | null>(null);
  const [editingGradeIdx, setEditingGradeIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Grade>(EMPTY_GRADE);

  // Add new commodity
  const [addingCommodity, setAddingCommodity] = useState(false);
  const [newCommodityName, setNewCommodityName] = useState('');

  // Add new grade
  const [addingGradeTo, setAddingGradeTo] = useState<string | null>(null);
  const [newGradeForm, setNewGradeForm] = useState<Grade>(EMPTY_GRADE);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'grading_standards')
      .single();

    if (error && error.code !== 'PGRST116') {
      setToast({ message: 'Failed to load grading standards', type: 'error' });
    }

    if (data?.value) {
      setStandards(data.value as CommodityGrading[]);
    } else {
      setStandards(DEFAULT_STANDARDS);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveStandards = useCallback(async (updated: CommodityGrading[]) => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .upsert(
        {
          key: 'grading_standards',
          value: updated,
          description: 'Quality grading standards per commodity',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setToast({ message: 'Failed to save grading standards', type: 'error' });
    } else {
      setStandards(updated);
      setToast({ message: 'Grading standards saved successfully', type: 'success' });
    }
    setSaving(false);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleExpand = (commodity: string) => {
    setExpanded((prev) => ({ ...prev, [commodity]: !prev[commodity] }));
  };

  const startEditGrade = (commodity: string, gradeIdx: number) => {
    const cg = standards.find((s) => s.commodity === commodity);
    if (cg) {
      setEditingCommodity(commodity);
      setEditingGradeIdx(gradeIdx);
      setEditForm({ ...cg.grades[gradeIdx] });
    }
  };

  const saveEditGrade = () => {
    if (editingCommodity === null || editingGradeIdx === null) return;
    const updated = standards.map((s) => {
      if (s.commodity !== editingCommodity) return s;
      const grades = [...s.grades];
      grades[editingGradeIdx!] = editForm;
      return { ...s, grades };
    });
    saveStandards(updated);
    setEditingCommodity(null);
    setEditingGradeIdx(null);
  };

  const deleteGrade = (commodity: string, gradeIdx: number) => {
    const updated = standards.map((s) => {
      if (s.commodity !== commodity) return s;
      return { ...s, grades: s.grades.filter((_, i) => i !== gradeIdx) };
    });
    saveStandards(updated);
  };

  const addGrade = (commodity: string) => {
    if (!newGradeForm.grade.trim()) return;
    const updated = standards.map((s) => {
      if (s.commodity !== commodity) return s;
      return { ...s, grades: [...s.grades, { ...newGradeForm }] };
    });
    saveStandards(updated);
    setAddingGradeTo(null);
    setNewGradeForm(EMPTY_GRADE);
  };

  const addCommodity = () => {
    if (!newCommodityName.trim()) return;
    const updated = [...standards, { commodity: newCommodityName.trim(), grades: [] }];
    saveStandards(updated);
    setAddingCommodity(false);
    setNewCommodityName('');
    setExpanded((prev) => ({ ...prev, [newCommodityName.trim()]: true }));
  };

  const deleteCommodity = (commodity: string) => {
    const updated = standards.filter((s) => s.commodity !== commodity);
    saveStandards(updated);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#5DB347]" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Award size={28} className="text-[#5DB347]" />
            Quality Grading Standards
          </h1>
          <p className="text-gray-500 mt-1">Manage quality grades and standards per commodity for warehouse operations</p>
        </div>
        <button
          onClick={() => setAddingCommodity(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl hover:bg-[#4ea23c] transition font-medium text-sm"
        >
          <Plus size={16} /> Add Commodity
        </button>
      </div>

      {/* Add Commodity Form */}
      {addingCommodity && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-3">New Commodity</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Commodity Name</label>
              <input
                type="text"
                value={newCommodityName}
                onChange={(e) => setNewCommodityName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                placeholder="e.g. Soybean"
              />
            </div>
            <button onClick={addCommodity} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition">
              <Save size={14} className="inline mr-1" /> Save
            </button>
            <button onClick={() => { setAddingCommodity(false); setNewCommodityName(''); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Commodity Sections */}
      {standards.map((cg) => (
        <div key={cg.commodity} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Commodity Header */}
          <button
            onClick={() => toggleExpand(cg.commodity)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <CommodityIcon name={cg.commodity} />
              <span className="font-semibold text-[#1B2A4A]">{cg.commodity}</span>
              <span className="text-xs bg-[#5DB347]/10 text-[#5DB347] px-2 py-0.5 rounded-full font-medium">
                {cg.grades.length} grade{cg.grades.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); deleteCommodity(cg.commodity); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Delete commodity"
              >
                <Trash2 size={15} />
              </button>
              {expanded[cg.commodity] ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </div>
          </button>

          {/* Grades Table */}
          {expanded[cg.commodity] && (
            <div className="border-t border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">Grade</th>
                      <th className="text-left px-5 py-3 font-medium">Description</th>
                      <th className="text-right px-5 py-3 font-medium">Premium %</th>
                      <th className="text-right px-5 py-3 font-medium">Max Moisture %</th>
                      <th className="text-right px-5 py-3 font-medium">Max Foreign Matter %</th>
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cg.grades.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        {editingCommodity === cg.commodity && editingGradeIdx === idx ? (
                          <>
                            <td className="px-5 py-3">
                              <input type="text" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                            </td>
                            <td className="px-5 py-3">
                              <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                            </td>
                            <td className="px-5 py-3">
                              <input type="number" value={editForm.price_premium_percent} onChange={(e) => setEditForm({ ...editForm, price_premium_percent: parseFloat(e.target.value) || 0 })}
                                className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                            </td>
                            <td className="px-5 py-3">
                              <input type="number" step="0.1" value={editForm.moisture_max} onChange={(e) => setEditForm({ ...editForm, moisture_max: parseFloat(e.target.value) || 0 })}
                                className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                            </td>
                            <td className="px-5 py-3">
                              <input type="number" step="0.1" value={editForm.foreign_matter_max} onChange={(e) => setEditForm({ ...editForm, foreign_matter_max: parseFloat(e.target.value) || 0 })}
                                className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={saveEditGrade} className="p-1.5 text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Save size={15} /></button>
                                <button onClick={() => { setEditingCommodity(null); setEditingGradeIdx(null); }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><X size={15} /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3 font-medium text-[#1B2A4A]">{g.grade}</td>
                            <td className="px-5 py-3 text-gray-600">{g.description}</td>
                            <td className="px-5 py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${g.price_premium_percent > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {g.price_premium_percent > 0 ? '+' : ''}{g.price_premium_percent}%
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-gray-600">{g.moisture_max}%</td>
                            <td className="px-5 py-3 text-right text-gray-600">{g.foreign_matter_max}%</td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => startEditGrade(cg.commodity, idx)} className="p-1.5 text-gray-400 hover:text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Pencil size={14} /></button>
                                <button onClick={() => deleteGrade(cg.commodity, idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Grade Form */}
              {addingGradeTo === cg.commodity ? (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Add New Grade</h4>
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Grade</label>
                      <input type="text" value={newGradeForm.grade} onChange={(e) => setNewGradeForm({ ...newGradeForm, grade: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. Grade A" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input type="text" value={newGradeForm.description} onChange={(e) => setNewGradeForm({ ...newGradeForm, description: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="Description" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Premium %</label>
                      <input type="number" value={newGradeForm.price_premium_percent} onChange={(e) => setNewGradeForm({ ...newGradeForm, price_premium_percent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Moisture %</label>
                      <input type="number" step="0.1" value={newGradeForm.moisture_max} onChange={(e) => setNewGradeForm({ ...newGradeForm, moisture_max: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Foreign Matter %</label>
                      <input type="number" step="0.1" value={newGradeForm.foreign_matter_max} onChange={(e) => setNewGradeForm({ ...newGradeForm, foreign_matter_max: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addGrade(cg.commodity)} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition">
                      <Save size={14} className="inline mr-1" /> Save Grade
                    </button>
                    <button onClick={() => { setAddingGradeTo(null); setNewGradeForm(EMPTY_GRADE); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 px-5 py-3">
                  <button
                    onClick={() => setAddingGradeTo(cg.commodity)}
                    className="flex items-center gap-1.5 text-sm text-[#5DB347] hover:text-[#4ea23c] font-medium transition"
                  >
                    <Plus size={14} /> Add Grade
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {standards.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Award size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No grading standards configured yet. Add a commodity to get started.</p>
        </div>
      )}

      {saving && (
        <div className="fixed bottom-6 right-6 bg-[#1B2A4A] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" /> Saving...
        </div>
      )}
    </div>
  );
}
