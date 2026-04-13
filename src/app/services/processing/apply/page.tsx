'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Factory,
  User,
  Mail,
  Phone,
  Globe,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Zap,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';
import { AFU_COUNTRIES } from '@/lib/countries';

const COUNTRIES = AFU_COUNTRIES;

const PROCESSING_TYPES = [
  'Milling', 'Drying', 'Cold Storage', 'Packaging', 'Juicing/Pressing',
  'Oil Extraction', 'Sorting/Grading', 'Roasting', 'Fermentation',
];

const COMMODITIES = [
  'Maize', 'Wheat', 'Sorghum', 'Rice', 'Coffee', 'Tea', 'Cocoa',
  'Tobacco', 'Cashew Nuts', 'Sesame', 'Soybean', 'Groundnuts',
  'Sunflower', 'Macadamia', 'Blueberries', 'Avocado', 'Cotton',
  'Sugarcane', 'Beef Cattle',
];

const POWER_SOURCES = [
  'Grid', 'Solar', 'Generator', 'Hybrid',
];

const CERTIFICATIONS = [
  'HACCP', 'ISO 22000', 'GMP', 'Organic Certified', 'Fair Trade',
  'BRC', 'FSSC 22000', 'None',
];

const REFERRAL_SOURCES = [
  'AFU Website', 'Social Media', 'Referral from Colleague',
  'Trade Event', 'Government Agency', 'NGO Partner', 'Other',
];

const YEARS_OPTIONS = [
  '0-2 years', '3-5 years', '6-10 years', '11-15 years', '16-20 years', '20+ years',
];

const STEP_LABELS = ['Personal', 'Facility', 'Capacity', 'Certifications'];

export default function ProcessingApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    facility_name: '',
    facility_location: '',
    gps_lat: '',
    gps_lng: '',
    processing_types: [] as string[],
    years_experience: '',
    capacity_mt_per_day: '',
    storage_capacity_mt: '',
    current_utilisation: 50,
    equipment_description: '',
    power_source: '',
    commodities_processed: [] as string[],
    accepts_toll_processing: false,
    min_batch_mt: '',
    certifications: [] as string[],
    website: '',
    motivation: '',
    referral_source: '',
    terms_accepted: false,
  });
  const [honeypot, setHoneypot] = useState('');
  const [formLoadedAt] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name !== 'terms_accepted') return;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const toggleArrayField = (
    field: 'processing_types' | 'commodities_processed' | 'certifications',
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!form.full_name || !form.email || !form.phone || !form.country) {
          setError('Please fill in all required fields.');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          setError('Please enter a valid email address.');
          return false;
        }
        return true;
      case 1:
        if (!form.facility_name || !form.facility_location || !form.processing_types.length) {
          setError('Please fill in facility details and select at least one processing type.');
          return false;
        }
        return true;
      case 2:
        if (!form.commodities_processed.length) {
          setError('Please select at least one commodity.');
          return false;
        }
        return true;
      case 3:
        if (!form.terms_accepted) {
          setError('Please accept the terms to continue.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setError('');
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (honeypot) return;
    if (Date.now() - formLoadedAt < 3000) {
      setError('Please take your time filling out the form.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/service-providers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: 'processing',
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          provider_details: {
            facility_name: form.facility_name,
            facility_location: form.facility_location,
            gps_lat: form.gps_lat ? Number(form.gps_lat) : null,
            gps_lng: form.gps_lng ? Number(form.gps_lng) : null,
            processing_types: form.processing_types,
            years_experience: form.years_experience,
            capacity_mt_per_day: form.capacity_mt_per_day ? Number(form.capacity_mt_per_day) : null,
            storage_capacity_mt: form.storage_capacity_mt ? Number(form.storage_capacity_mt) : null,
            current_utilisation: form.current_utilisation,
            equipment_description: form.equipment_description,
            power_source: form.power_source,
            commodities_processed: form.commodities_processed,
            accepts_toll_processing: form.accepts_toll_processing,
            min_batch_mt: form.min_batch_mt ? Number(form.min_batch_mt) : null,
            certifications: form.certifications,
            website: form.website,
            motivation: form.motivation,
            referral_source: form.referral_source,
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-3">Application Received!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for registering your processing facility with AFU. Our team will review your
            application and contact you within 5 business days.
          </p>
          <Link
            href="/services/processing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Processing Services
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative py-16 px-4"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)' }}
      >
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
            <Factory className="w-4 h-4" />
            Processing Hub Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Register Your Processing Facility with AFU
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Connect your processing facility to Africa&apos;s largest farming network and access a steady supply of raw commodities.
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i <= step
                      ? 'bg-[#5DB347] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-[#1B2A4A]' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-1 ${i < step ? 'bg-[#5DB347]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8">
        <input
          type="text"
          name="website_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1 — Personal */}
            {step === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#5DB347]" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="Peter Banda"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="peter@facility.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="+260 97 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Facility */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#5DB347]" />
                  Facility Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name *</label>
                    <input
                      type="text"
                      name="facility_name"
                      value={form.facility_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="Banda Processing Hub"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="facility_location"
                        value={form.facility_location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="Lusaka, Zambia"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS Latitude (optional)</label>
                    <input
                      type="number"
                      name="gps_lat"
                      value={form.gps_lat}
                      onChange={handleChange}
                      step="any"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="-15.4167"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS Longitude (optional)</label>
                    <input
                      type="number"
                      name="gps_lng"
                      value={form.gps_lng}
                      onChange={handleChange}
                      step="any"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="28.2833"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <select
                      name="years_experience"
                      value={form.years_experience}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select experience</option>
                      {YEARS_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Types *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PROCESSING_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleArrayField('processing_types', t)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.processing_types.includes(t)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Capacity */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-[#5DB347]" />
                  Capacity &amp; Operations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (MT/day)</label>
                    <input
                      type="number"
                      name="capacity_mt_per_day"
                      value={form.capacity_mt_per_day}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Capacity (MT)</label>
                    <input
                      type="number"
                      name="storage_capacity_mt"
                      value={form.storage_capacity_mt}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Utilisation: {form.current_utilisation}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.current_utilisation}
                    onChange={(e) => setForm((prev) => ({ ...prev, current_utilisation: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5DB347]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Description</label>
                  <textarea
                    name="equipment_description"
                    value={form.equipment_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm resize-none"
                    placeholder="Describe your processing equipment, capacity, and condition..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Zap className="w-4 h-4 inline mr-1" />
                      Power Source
                    </label>
                    <select
                      name="power_source"
                      value={form.power_source}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select power source</option>
                      {POWER_SOURCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Batch (MT)</label>
                    <input
                      type="number"
                      name="min_batch_mt"
                      value={form.min_batch_mt}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commodities Processed *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {COMMODITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayField('commodities_processed', c)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.commodities_processed.includes(c)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, accepts_toll_processing: !prev.accepts_toll_processing }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.accepts_toll_processing ? 'bg-[#5DB347]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.accepts_toll_processing ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Accepts toll processing</span>
                </div>
              </div>
            )}

            {/* Step 4 — Certifications */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#5DB347]" />
                  Certifications &amp; Final Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications Held</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CERTIFICATIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayField('certifications', c)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.certifications.includes(c)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="https://facility.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
                  <textarea
                    name="motivation"
                    value={form.motivation}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm resize-none"
                    placeholder="Why do you want to register your facility with AFU?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                  <select
                    name="referral_source"
                    value={form.referral_source}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                  >
                    <option value="">How did you hear about us?</option>
                    {REFERRAL_SOURCES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={form.terms_accepted}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the AFU{' '}
                    <Link href="/terms" className="text-[#5DB347] underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#5DB347] underline">Privacy Policy</Link>. *
                  </span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <Link
              href="/services/processing"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Link>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
