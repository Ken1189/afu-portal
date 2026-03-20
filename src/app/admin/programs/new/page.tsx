'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Sprout,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────

type InclusionType = 'inputs' | 'insurance' | 'offtake' | 'financing' | 'advisory';

interface Inclusion {
  type: InclusionType;
  title: string;
  description: string;
  value_estimate: string;
  currency: string;
}

// ── Constants ─────────────────────────────────────────────────────────────

const COUNTRY_CROPS: Record<string, string[]> = {
  Uganda: ['Coffee', 'Cashews', 'Cocoa'],
  Zimbabwe: ['Blueberries', 'Sugarcane', 'Peas'],
  Tanzania: ['Coffee', 'Cashews'],
  Botswana: ['Sorghum', 'Millet'],
  Zambia: ['Maize', 'Soybeans'],
  Kenya: ['Tea', 'Horticulture'],
  Ghana: ['Cocoa', 'Cassava'],
  Nigeria: ['Sesame', 'Groundnuts'],
  'South Africa': ['Citrus', 'Wheat'],
};

const CURRENCIES = ['USD', 'ZWL', 'UGX', 'TZS', 'BWP', 'KES', 'GHS', 'NGN', 'ZAR'];

const INCLUSION_TYPES: InclusionType[] = ['inputs', 'insurance', 'offtake', 'financing', 'advisory'];

const DEFAULT_INCLUSIONS: Inclusion[] = [
  { type: 'inputs', title: 'Input Supply', description: 'Seeds, fertilisers, and agrochemicals sourced from certified suppliers.', value_estimate: '', currency: 'USD' },
  { type: 'insurance', title: 'Crop Insurance', description: 'Weather-indexed insurance covering production losses.', value_estimate: '', currency: 'USD' },
  { type: 'offtake', title: 'Guaranteed Offtake', description: 'Confirmed buyer at agreed price per kg at harvest.', value_estimate: '', currency: 'USD' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Section wrapper ───────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-polished bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="text-teal">{icon}</span>
        <h2 className="font-semibold text-navy">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white';

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminNewProgramPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Section 1 — Program Details
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [crop, setCrop] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('1');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Section 2 — Schedule
  const [plantingStart, setPlantingStart] = useState('');
  const [plantingEnd, setPlantingEnd] = useState('');
  const [expectedHarvest, setExpectedHarvest] = useState('');

  // Section 3 — Capacity
  const [maxParticipants, setMaxParticipants] = useState('');
  const [minFarmSizeHa, setMinFarmSizeHa] = useState('');
  const [region, setRegion] = useState('');

  // Section 4 — Offtake
  const [offtakeBuyer, setOfftakeBuyer] = useState('');
  const [offtakePricePerKg, setOfftakePricePerKg] = useState('');
  const [offtakeCurrency, setOfftakeCurrency] = useState('USD');

  // Section 5 — Financing
  const [financingAvailable, setFinancingAvailable] = useState(false);
  const [financingPercent, setFinancingPercent] = useState(50);

  // Section 6 — Inclusions
  const [inclusions, setInclusions] = useState<Inclusion[]>(DEFAULT_INCLUSIONS);

  // ── Country → Crop sync ──────────────────────────────────────────────
  const availableCrops = country ? (COUNTRY_CROPS[country] ?? []) : [];

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setCrop(''); // reset crop when country changes
  };

  // ── Inclusion management ─────────────────────────────────────────────
  const addInclusion = () => {
    setInclusions(prev => [
      ...prev,
      { type: 'inputs', title: '', description: '', value_estimate: '', currency: 'USD' },
    ]);
  };

  const updateInclusion = (index: number, field: keyof Inclusion, value: string) => {
    setInclusions(prev =>
      prev.map((inc, i) => (i === index ? { ...inc, [field]: value } : inc))
    );
  };

  const removeInclusion = (index: number) => {
    setInclusions(prev => prev.filter((_, i) => i !== index));
  };

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!country) errs.country = 'Country is required';
    if (!crop) errs.crop = 'Crop is required';
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (publishStatus: 'draft' | 'active') => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        country,
        crop,
        crop_variety: cropVariety.trim() || null,
        season_number: seasonNumber ? parseInt(seasonNumber, 10) : null,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        planting_start: plantingStart || null,
        planting_end: plantingEnd || null,
        expected_harvest: expectedHarvest || null,
        max_participants: maxParticipants ? parseInt(maxParticipants, 10) : null,
        min_farm_size_ha: minFarmSizeHa ? parseFloat(minFarmSizeHa) : null,
        region: region.trim() || null,
        offtake_buyer: offtakeBuyer.trim() || null,
        offtake_price_per_kg: offtakePricePerKg ? parseFloat(offtakePricePerKg) : null,
        offtake_currency: offtakeCurrency,
        financing_available: financingAvailable,
        financing_percent: financingAvailable ? financingPercent : null,
        status: publishStatus,
        inclusions: inclusions
          .filter(inc => inc.title.trim())
          .map(inc => ({
            type: inc.type,
            title: inc.title.trim(),
            description: inc.description.trim() || null,
            value_estimate: inc.value_estimate ? parseFloat(inc.value_estimate) : null,
            currency: inc.currency || null,
          })),
      };

      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create program');
      }

      router.push('/admin/programs');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl"
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/admin/programs"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-navy"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">Create Program</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up a new agricultural program</p>
        </div>
      </motion.div>

      {/* ── Validation errors summary ─────────────────────────────────── */}
      {Object.keys(errors).length > 0 && (
        <motion.div variants={fadeUp} className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700 mb-1">Please fix the following:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.values(errors).map((e, i) => (
              <li key={i} className="text-sm text-red-600">{e}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ── Section 1: Program Details ─────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Section icon={<Sprout className="w-4 h-4" />} title="Program Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label required>Program Title</Label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Uganda Coffee Season 3 — Arabica Cooperative"
                className={`${inputClass} ${errors.title ? 'border-red-400' : ''}`}
              />
            </div>

            <div>
              <Label required>Country</Label>
              <select
                value={country}
                onChange={e => handleCountryChange(e.target.value)}
                className={`${inputClass} ${errors.country ? 'border-red-400' : ''}`}
              >
                <option value="">Select country...</option>
                {Object.keys(COUNTRY_CROPS).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label required>Crop</Label>
              <select
                value={crop}
                onChange={e => setCrop(e.target.value)}
                disabled={!country}
                className={`${inputClass} ${errors.crop ? 'border-red-400' : ''} disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">{country ? 'Select crop...' : 'Select country first'}</option>
                {availableCrops.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Crop Variety</Label>
              <input
                type="text"
                value={cropVariety}
                onChange={e => setCropVariety(e.target.value)}
                placeholder="e.g. Arabica SL28"
                className={inputClass}
              />
            </div>

            <div>
              <Label>Season Number</Label>
              <input
                type="number"
                value={seasonNumber}
                onChange={e => setSeasonNumber(e.target.value)}
                min={1}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the program goals, what members can expect, and key details..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Image URL</Label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 2: Schedule ────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Section icon={<Calendar className="w-4 h-4" />} title="Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Planting Start</Label>
              <input
                type="date"
                value={plantingStart}
                onChange={e => setPlantingStart(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <Label>Planting End</Label>
              <input
                type="date"
                value={plantingEnd}
                onChange={e => setPlantingEnd(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <Label>Expected Harvest</Label>
              <input
                type="date"
                value={expectedHarvest}
                onChange={e => setExpectedHarvest(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 3: Capacity ────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Section icon={<Users className="w-4 h-4" />} title="Capacity">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Max Participants</Label>
              <input
                type="number"
                value={maxParticipants}
                onChange={e => setMaxParticipants(e.target.value)}
                min={1}
                placeholder="e.g. 100"
                className={inputClass}
              />
            </div>
            <div>
              <Label>Min Farm Size (ha)</Label>
              <input
                type="number"
                value={minFarmSizeHa}
                onChange={e => setMinFarmSizeHa(e.target.value)}
                min={0}
                step={0.1}
                placeholder="e.g. 0.5"
                className={inputClass}
              />
            </div>
            <div>
              <Label>Region</Label>
              <input
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="e.g. Western Uganda"
                className={inputClass}
              />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 4: Offtake ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Section icon={<ShoppingCart className="w-4 h-4" />} title="Offtake">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Label>Buyer Name</Label>
              <input
                type="text"
                value={offtakeBuyer}
                onChange={e => setOfftakeBuyer(e.target.value)}
                placeholder="e.g. Exporters Ltd"
                className={inputClass}
              />
            </div>
            <div>
              <Label>Price per kg</Label>
              <input
                type="number"
                value={offtakePricePerKg}
                onChange={e => setOfftakePricePerKg(e.target.value)}
                min={0}
                step={0.01}
                placeholder="e.g. 2.50"
                className={inputClass}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <select
                value={offtakeCurrency}
                onChange={e => setOfftakeCurrency(e.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 5: Financing ───────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Section icon={<DollarSign className="w-4 h-4" />} title="Financing">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFinancingAvailable(!financingAvailable)}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal/30 ${
                  financingAvailable ? 'bg-teal' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    financingAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="text-sm font-medium text-navy cursor-pointer" onClick={() => setFinancingAvailable(!financingAvailable)}>
                Financing available for this program
              </label>
            </div>

            {financingAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <Label>Financing Coverage ({financingPercent}%)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={financingPercent}
                      onChange={e => setFinancingPercent(Number(e.target.value))}
                      className="flex-1 h-2 accent-teal cursor-pointer"
                    />
                    <span className="text-sm font-bold text-navy w-12 text-right tabular-nums">
                      {financingPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Percentage of input costs covered by program financing.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </Section>
      </motion.div>

      {/* ── Section 6: Inclusions ─────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Section icon={<Package className="w-4 h-4" />} title="Inclusions">
          <div className="space-y-3">
            {inclusions.map((inc, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Inclusion {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeInclusion(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <select
                      value={inc.type}
                      onChange={e => updateInclusion(index, 'type', e.target.value)}
                      className={inputClass}
                    >
                      {INCLUSION_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <input
                      type="text"
                      value={inc.title}
                      onChange={e => updateInclusion(index, 'title', e.target.value)}
                      placeholder="e.g. Input Supply Package"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Description</Label>
                    <input
                      type="text"
                      value={inc.description}
                      onChange={e => updateInclusion(index, 'description', e.target.value)}
                      placeholder="Brief description of what's included..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label>Estimated Value</Label>
                    <input
                      type="number"
                      value={inc.value_estimate}
                      onChange={e => updateInclusion(index, 'value_estimate', e.target.value)}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <Label>Currency</Label>
                    <select
                      value={inc.currency}
                      onChange={e => updateInclusion(index, 'currency', e.target.value)}
                      className={inputClass}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addInclusion}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:text-teal hover:border-teal transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Inclusion
            </button>
          </div>
        </Section>
      </motion.div>

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pb-8">
        <Link
          href="/admin/programs"
          className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-navy hover:bg-gray-50 transition-colors text-center"
        >
          Cancel
        </Link>

        <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 border border-navy/20 rounded-lg text-sm font-medium text-navy hover:bg-navy/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('active')}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-teal text-white rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
            Save &amp; Publish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
