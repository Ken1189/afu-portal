'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, Save, Loader2, CheckCircle2, AlertCircle, Truck } from 'lucide-react';

interface PricingRow {
  id: string;
  country: string;
  vehicle_type: string;
  base_rate: number;
  per_km_rate: number;
  min_fee: number;
  platform_commission_pct: number;
  is_active: boolean;
}

const VEHICLE_LABELS: Record<string, string> = {
  bicycle: 'Bicycle',
  motorcycle: 'Motorcycle',
  car: 'Car',
  van: 'Van / Pickup',
  truck: 'Truck',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function FooberPricingAdmin() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [edited, setEdited] = useState<Record<string, Partial<PricingRow>>>({});
  const supabase = createClient();

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('foober_pricing').select('*').order('vehicle_type');
    setRows((data as PricingRow[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  const handleChange = (id: string, field: keyof PricingRow, value: string | boolean) => {
    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: typeof value === 'string' ? Number(value) : value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const ids = Object.keys(edited);
    for (const id of ids) {
      await supabase.from('foober_pricing').update({ ...edited[id], updated_at: new Date().toISOString() }).eq('id', id);
    }
    setEdited({});
    setToast({ message: `Updated ${ids.length} pricing row(s)`, type: 'success' });
    fetchPricing();
    setSaving(false);
  };

  const hasChanges = Object.keys(edited).length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Foober Pricing</h1>
          <p className="text-sm text-gray-500 mt-1">Configure delivery rates per vehicle type</p>
        </div>
        {hasChanges && (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4a9a39] disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No pricing configured. Run migration 095 to seed defaults.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const e = edited[row.id] || {};
            return (
              <div key={row.id} className={`bg-white rounded-xl border p-4 ${row.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-5 h-5 text-[#5DB347]" />
                  <div>
                    <span className="font-semibold text-[#1B2A4A]">{VEHICLE_LABELS[row.vehicle_type] || row.vehicle_type}</span>
                    <span className="text-xs text-gray-400 ml-2">{row.country === 'default' ? 'Global Default' : row.country}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Base Rate ($)</label>
                    <input
                      type="number" step="0.01"
                      value={e.base_rate ?? row.base_rate}
                      onChange={(ev) => handleChange(row.id, 'base_rate', ev.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Per KM Rate ($)</label>
                    <input
                      type="number" step="0.01"
                      value={e.per_km_rate ?? row.per_km_rate}
                      onChange={(ev) => handleChange(row.id, 'per_km_rate', ev.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Min Fee ($)</label>
                    <input
                      type="number" step="0.01"
                      value={e.min_fee ?? row.min_fee}
                      onChange={(ev) => handleChange(row.id, 'min_fee', ev.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Commission (%)</label>
                    <input
                      type="number" step="0.01"
                      value={((e.platform_commission_pct ?? row.platform_commission_pct) * 100).toFixed(0)}
                      onChange={(ev) => handleChange(row.id, 'platform_commission_pct', (Number(ev.target.value) / 100).toString())}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500">
          <strong>Formula:</strong> fee = max(min_fee, (base_rate + distance_km x per_km_rate) x size_multiplier)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Size multipliers: Small 1.0x, Medium 1.2x, Large 1.5x, Extra Large 2.0x
        </p>
      </div>
    </div>
  );
}
