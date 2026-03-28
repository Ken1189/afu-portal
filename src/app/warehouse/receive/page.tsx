'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  User,
  UserPlus,
  Package,
  ClipboardCheck,
  CheckCircle2,
  Loader2,
  Printer,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ----- Types -----

interface FarmerResult {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  country: string | null;
  member_id?: string;
  tier?: string;
}

interface QualityData {
  moisture_percent: number;
  foreign_matter_percent: number;
  damage_percent: number;
  aflatoxin_level: 'safe' | 'warning' | 'reject';
  color_assessment: 'good' | 'fair' | 'poor';
  odor: 'normal' | 'musty' | 'chemical';
  grade: 'A' | 'B' | 'C' | 'Reject';
  grade_override: boolean;
}

interface ReceiptResult {
  receipt_number: string;
  farmer_name: string;
  commodity: string;
  net_weight_kg: number;
  grade: string;
  total_value: number;
  created_at: string;
}

const COMMODITIES = [
  'Maize', 'Soya Beans', 'Wheat', 'Rice', 'Sorghum', 'Millet',
  'Groundnuts', 'Sunflower', 'Sesame', 'Cowpeas', 'Pigeon Peas',
  'Cassava', 'Sweet Potatoes', 'Cocoa', 'Coffee', 'Cotton', 'Tobacco',
];

const STEPS = [
  { id: 1, label: 'Farmer', icon: User },
  { id: 2, label: 'Commodity', icon: Package },
  { id: 3, label: 'Quality', icon: ClipboardCheck },
  { id: 4, label: 'Confirm', icon: CheckCircle2 },
];

function computeGrade(q: QualityData): 'A' | 'B' | 'C' | 'Reject' {
  if (q.aflatoxin_level === 'reject') return 'Reject';
  if (q.odor === 'chemical') return 'Reject';
  if (q.moisture_percent > 20 || q.foreign_matter_percent > 5 || q.damage_percent > 10) return 'Reject';
  if (q.moisture_percent > 15 || q.foreign_matter_percent > 3 || q.damage_percent > 5) return 'C';
  if (q.moisture_percent > 12 || q.foreign_matter_percent > 1.5 || q.damage_percent > 2) return 'B';
  return 'A';
}

export default function ReceivePage() {
  const [step, setStep] = useState(1);

  // Step 1 — Farmer
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerResults, setFarmerResults] = useState<FarmerResult[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerResult | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Step 2 — Commodity
  const [commodity, setCommodity] = useState('');
  const [bags, setBags] = useState<number | ''>('');
  const [grossWeight, setGrossWeight] = useState<number | ''>('');
  const [tareWeight, setTareWeight] = useState<number | ''>(0);
  const [unitPrice, setUnitPrice] = useState<number | ''>(0);

  // Step 3 — Quality
  const [quality, setQuality] = useState<QualityData>({
    moisture_percent: 12,
    foreign_matter_percent: 1,
    damage_percent: 1,
    aflatoxin_level: 'safe',
    color_assessment: 'good',
    odor: 'normal',
    grade: 'A',
    grade_override: false,
  });

  // Step 4 — Submission
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);
  const [error, setError] = useState('');

  // Computed values
  const netWeight = (Number(grossWeight) || 0) - (Number(tareWeight) || 0);
  const estimatedValue = netWeight * (Number(unitPrice) || 0);
  const farmerName = isWalkIn ? walkInName : selectedFarmer?.full_name || '';

  // Search farmers
  const searchFarmers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setFarmerResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, country')
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(10);

      // Also fetch member info for matched profiles
      if (data && data.length > 0) {
        const profileIds = data.map((p) => p.id);
        const { data: members } = await supabase
          .from('members')
          .select('profile_id, member_id, tier')
          .in('profile_id', profileIds);

        const memberMap = new Map<string, { member_id: string; tier: string }>();
        members?.forEach((m) => memberMap.set(m.profile_id, { member_id: m.member_id, tier: m.tier }));

        const results: FarmerResult[] = data.map((p) => ({
          ...p,
          member_id: memberMap.get(p.id)?.member_id,
          tier: memberMap.get(p.id)?.tier,
        }));
        setFarmerResults(results);
      } else {
        setFarmerResults([]);
      }
    } catch {
      setFarmerResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Auto-fill price on commodity change
  const handleCommodityChange = async (val: string) => {
    setCommodity(val);
    if (!val) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('commodity_prices')
        .select('price_per_kg')
        .ilike('commodity', val)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setUnitPrice(data.price_per_kg);
    } catch {
      // Price table may not exist or no entry; operator can set manually
    }
  };

  // Update quality and auto-grade
  const updateQuality = (field: keyof QualityData, value: number | string | boolean) => {
    setQuality((prev) => {
      const updated = { ...prev, [field]: value };
      if (!updated.grade_override && field !== 'grade' && field !== 'grade_override') {
        updated.grade = computeGrade(updated);
      }
      return updated;
    });
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const body = {
        farmer_id: selectedFarmer?.id || null,
        farmer_name: farmerName,
        farmer_phone: isWalkIn ? walkInPhone : selectedFarmer?.phone || null,
        commodity,
        bags: Number(bags) || 0,
        gross_weight_kg: Number(grossWeight) || 0,
        tare_weight_kg: Number(tareWeight) || 0,
        net_weight_kg: netWeight,
        unit_price: Number(unitPrice) || 0,
        total_value: estimatedValue,
        quality_data: {
          moisture_percent: quality.moisture_percent,
          foreign_matter_percent: quality.foreign_matter_percent,
          damage_percent: quality.damage_percent,
          aflatoxin_level: quality.aflatoxin_level,
          color_assessment: quality.color_assessment,
          odor: quality.odor,
          grade: quality.grade,
        },
      };

      const res = await fetch('/api/warehouse/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create receipt');
      }

      const data = await res.json();
      setReceipt(data.receipt);
      setStep(5); // Success state
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setFarmerSearch('');
    setFarmerResults([]);
    setSelectedFarmer(null);
    setIsWalkIn(false);
    setWalkInName('');
    setWalkInPhone('');
    setCommodity('');
    setBags('');
    setGrossWeight('');
    setTareWeight(0);
    setUnitPrice(0);
    setQuality({
      moisture_percent: 12,
      foreign_matter_percent: 1,
      damage_percent: 1,
      aflatoxin_level: 'safe',
      color_assessment: 'good',
      odor: 'normal',
      grade: 'A',
      grade_override: false,
    });
    setReceipt(null);
    setError('');
  };

  const canProceedStep1 = isWalkIn ? walkInName.length >= 2 : !!selectedFarmer;
  const canProceedStep2 = commodity && Number(grossWeight) > 0 && Number(bags) > 0;
  const canProceedStep3 = true; // Quality always has defaults

  // ============== RENDER ==============

  // Success screen
  if (step === 5 && receipt) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">Receipt Issued</h2>
          <p className="text-gray-500 mb-6">Warehouse receipt created successfully.</p>

          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Receipt #</span>
              <span className="text-sm font-bold font-mono text-[#1B2A4A]">{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Farmer</span>
              <span className="text-sm font-medium">{receipt.farmer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Commodity</span>
              <span className="text-sm font-medium capitalize">{receipt.commodity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Net Weight</span>
              <span className="text-sm font-bold">{receipt.net_weight_kg.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Grade</span>
              <span className={`text-sm font-bold ${
                receipt.grade === 'A' ? 'text-green-600' : receipt.grade === 'B' ? 'text-blue-600' : receipt.grade === 'C' ? 'text-yellow-600' : 'text-red-600'
              }`}>{receipt.grade}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-sm text-gray-500">Total Value</span>
              <span className="text-lg font-bold text-[#5DB347]">
                ${receipt.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-[#1B2A4A] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#243658] transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={resetForm}
              className="w-full flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Receive Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link href="/warehouse" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1B2A4A] mb-4 min-h-[44px] text-base">
        <ArrowLeft className="w-5 h-5" />
        Dashboard
      </Link>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-0.5 ${done ? 'bg-[#5DB347]' : 'bg-gray-200'}`} />}
              <button
                onClick={() => done && setStep(s.id)}
                disabled={!done}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                  active ? 'bg-[#5DB347] text-white' : done ? 'bg-green-100 text-green-700 cursor-pointer' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Farmer Identification */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-xl font-bold text-[#1B2A4A]">Step 1: Farmer Identification</h2>

          {!isWalkIn ? (
            <>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={farmerSearch}
                  onChange={(e) => {
                    setFarmerSearch(e.target.value);
                    searchFarmers(e.target.value);
                  }}
                  placeholder="Search by name, phone, or member ID..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347] focus:border-transparent min-h-[56px]"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                )}
              </div>

              {/* Search results */}
              {farmerResults.length > 0 && !selectedFarmer && (
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y">
                  {farmerResults.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelectedFarmer(f);
                        setFarmerResults([]);
                      }}
                      className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 text-left min-h-[56px]"
                    >
                      <div className="w-10 h-10 bg-[#5DB347] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {f.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1B2A4A] text-base">{f.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {f.phone || 'No phone'} {f.member_id && `\u00b7 ${f.member_id}`} {f.country && `\u00b7 ${f.country}`}
                        </p>
                      </div>
                      {f.tier && (
                        <span className="text-xs font-medium bg-[#5DB347]/10 text-[#5DB347] px-2.5 py-1 rounded-full capitalize">
                          {f.tier}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected farmer */}
              {selectedFarmer && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#5DB347] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {selectedFarmer.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#1B2A4A] text-lg">{selectedFarmer.full_name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedFarmer.phone || 'No phone'} {selectedFarmer.tier && `\u00b7 ${selectedFarmer.tier}`} {selectedFarmer.country && `\u00b7 ${selectedFarmer.country}`}
                    </p>
                  </div>
                  <button onClick={() => setSelectedFarmer(null)} className="p-2 hover:bg-green-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <span className="text-sm text-green-700 font-medium">Change</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsWalkIn(true)}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#5DB347] hover:text-[#5DB347] transition-colors text-base font-medium min-h-[56px]"
              >
                <UserPlus className="w-5 h-5" />
                New Walk-in (Unregistered Farmer)
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Farmer's full name"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[56px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+260 xxx xxx xxxx"
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[56px]"
                  />
                </div>
              </div>
              <button
                onClick={() => { setIsWalkIn(false); setWalkInName(''); setWalkInPhone(''); }}
                className="text-sm text-[#5DB347] hover:underline font-medium min-h-[44px]"
              >
                Search existing farmers instead
              </button>
            </>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next: Commodity Details
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: Commodity Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-xl font-bold text-[#1B2A4A]">Step 2: Commodity Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity *</label>
            <select
              value={commodity}
              onChange={(e) => handleCommodityChange(e.target.value)}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[56px] bg-white"
            >
              <option value="">Select commodity</option>
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bags / Containers *</label>
            <input
              type="number"
              inputMode="numeric"
              value={bags}
              onChange={(e) => setBags(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="0"
              min={0}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl text-3xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[64px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Weight (kg) *</label>
              <input
                type="number"
                inputMode="decimal"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0"
                min={0}
                step={0.1}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[56px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tare Weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={tareWeight}
                onChange={(e) => setTareWeight(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0"
                min={0}
                step={0.1}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[56px]"
              />
            </div>
          </div>

          <div className="bg-[#1B2A4A] rounded-xl p-4 text-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Net Weight</span>
              <span className="text-3xl font-bold">{netWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (per kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[56px]"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-green-700 font-medium">Estimated Value</span>
              <span className="text-2xl font-bold text-green-700">
                ${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-700 text-lg min-h-[56px] hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="flex-[2] flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Quality
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Quality Inspection */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-xl font-bold text-[#1B2A4A]">Step 3: Quality Inspection</h2>

          {/* Sliders */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Moisture %</label>
              <span className="text-lg font-bold text-[#1B2A4A]">{quality.moisture_percent}%</span>
            </div>
            <input
              type="range"
              min={0} max={30} step={0.5}
              value={quality.moisture_percent}
              onChange={(e) => updateQuality('moisture_percent', parseFloat(e.target.value))}
              className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-[#5DB347] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>15%</span><span>30%</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Foreign Matter %</label>
              <span className="text-lg font-bold text-[#1B2A4A]">{quality.foreign_matter_percent}%</span>
            </div>
            <input
              type="range"
              min={0} max={10} step={0.1}
              value={quality.foreign_matter_percent}
              onChange={(e) => updateQuality('foreign_matter_percent', parseFloat(e.target.value))}
              className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-[#5DB347] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>5%</span><span>10%</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Damage / Broken %</label>
              <span className="text-lg font-bold text-[#1B2A4A]">{quality.damage_percent}%</span>
            </div>
            <input
              type="range"
              min={0} max={20} step={0.5}
              value={quality.damage_percent}
              onChange={(e) => updateQuality('damage_percent', parseFloat(e.target.value))}
              className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-[#5DB347] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0%</span><span>10%</span><span>20%</span></div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aflatoxin Level</label>
              <select
                value={quality.aflatoxin_level}
                onChange={(e) => updateQuality('aflatoxin_level', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px] bg-white"
              >
                <option value="safe">Safe</option>
                <option value="warning">Warning</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Assessment</label>
              <select
                value={quality.color_assessment}
                onChange={(e) => updateQuality('color_assessment', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px] bg-white"
              >
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odor</label>
              <select
                value={quality.odor}
                onChange={(e) => updateQuality('odor', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px] bg-white"
              >
                <option value="normal">Normal</option>
                <option value="musty">Musty</option>
                <option value="chemical">Chemical</option>
              </select>
            </div>
          </div>

          {/* Auto Grade */}
          <div className={`rounded-xl p-5 border-2 ${
            quality.grade === 'A' ? 'bg-green-50 border-green-300' :
            quality.grade === 'B' ? 'bg-blue-50 border-blue-300' :
            quality.grade === 'C' ? 'bg-yellow-50 border-yellow-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Auto Grade</p>
                <p className={`text-4xl font-black ${
                  quality.grade === 'A' ? 'text-green-700' :
                  quality.grade === 'B' ? 'text-blue-700' :
                  quality.grade === 'C' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>{quality.grade}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Override:</label>
                <select
                  value={quality.grade_override ? quality.grade : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setQuality((prev) => ({ ...prev, grade: e.target.value as 'A' | 'B' | 'C' | 'Reject', grade_override: true }));
                    } else {
                      setQuality((prev) => {
                        const auto = computeGrade(prev);
                        return { ...prev, grade: auto, grade_override: false };
                      });
                    }
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-h-[44px]"
                >
                  <option value="">Auto</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-700 text-lg min-h-[56px] hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!canProceedStep3}
              className="flex-[2] flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Confirm
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-xl font-bold text-[#1B2A4A]">Step 4: Confirm &amp; Issue Receipt</h2>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-[#1B2A4A] text-base">Farmer</h3>
              <p className="text-lg">{farmerName}</p>
              {(isWalkIn ? walkInPhone : selectedFarmer?.phone) && (
                <p className="text-sm text-gray-500">{isWalkIn ? walkInPhone : selectedFarmer?.phone}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-[#1B2A4A] text-base">Commodity</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Commodity</span>
                <span className="font-medium capitalize text-right">{commodity}</span>
                <span className="text-gray-500">Bags</span>
                <span className="font-medium text-right">{bags}</span>
                <span className="text-gray-500">Gross Weight</span>
                <span className="font-medium text-right">{Number(grossWeight).toLocaleString()} kg</span>
                <span className="text-gray-500">Tare Weight</span>
                <span className="font-medium text-right">{Number(tareWeight).toLocaleString()} kg</span>
                <span className="text-gray-500 font-bold">Net Weight</span>
                <span className="font-bold text-right text-lg">{netWeight.toLocaleString()} kg</span>
                <span className="text-gray-500">Unit Price</span>
                <span className="font-medium text-right">${Number(unitPrice).toFixed(2)}/kg</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-[#1B2A4A] text-base">Quality Inspection</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Moisture</span>
                <span className="font-medium text-right">{quality.moisture_percent}%</span>
                <span className="text-gray-500">Foreign Matter</span>
                <span className="font-medium text-right">{quality.foreign_matter_percent}%</span>
                <span className="text-gray-500">Damage</span>
                <span className="font-medium text-right">{quality.damage_percent}%</span>
                <span className="text-gray-500">Aflatoxin</span>
                <span className="font-medium text-right capitalize">{quality.aflatoxin_level}</span>
                <span className="text-gray-500">Color</span>
                <span className="font-medium text-right capitalize">{quality.color_assessment}</span>
                <span className="text-gray-500">Odor</span>
                <span className="font-medium text-right capitalize">{quality.odor}</span>
                <span className="text-gray-500 font-bold">Grade</span>
                <span className={`font-black text-right text-xl ${
                  quality.grade === 'A' ? 'text-green-600' : quality.grade === 'B' ? 'text-blue-600' : quality.grade === 'C' ? 'text-yellow-600' : 'text-red-600'
                }`}>{quality.grade}</span>
              </div>
            </div>

            <div className="bg-[#5DB347]/10 border-2 border-[#5DB347] rounded-xl p-5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#1B2A4A]">Total Value</span>
                <span className="text-3xl font-black text-[#5DB347]">
                  ${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-700 text-lg min-h-[56px] hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Issuing Receipt...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Issue Receipt
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
