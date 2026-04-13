'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  User,
  Mail,
  Phone,
  Globe,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Truck,
  CreditCard,
  ShoppingCart,
} from 'lucide-react';
import { AFU_COUNTRIES } from '@/lib/countries';

const COUNTRIES = AFU_COUNTRIES;

const COMPANY_TYPES = [
  'Exporter',
  'Wholesaler',
  'Retailer',
  'Processor',
  'Government',
  'NGO',
];

const COMMODITIES = [
  'Maize', 'Wheat', 'Sorghum', 'Rice', 'Coffee', 'Tea', 'Cocoa',
  'Tobacco', 'Cashew Nuts', 'Sesame', 'Soybean', 'Groundnuts',
  'Sunflower', 'Macadamia', 'Blueberries', 'Avocado', 'Cotton',
  'Sugarcane', 'Beef Cattle',
];

const CONTRACT_TYPES = [
  'Spot', 'Forward', 'Long-term', 'Seasonal',
];

const QUALITY_CERTIFICATIONS = [
  'GlobalGAP', 'Organic', 'Fair Trade', 'Rainforest Alliance', 'HACCP', 'ISO 22000', 'None',
];

const PAYMENT_TERMS = [
  'Advance', 'On Delivery', '15 Days', '30 Days', '60 Days', '90 Days',
];

const DESTINATION_MARKETS = [
  'EU', 'UK', 'Middle East', 'Asia', 'North America', 'Africa Regional', 'Other',
];

const REFERRAL_SOURCES = [
  'AFU Website', 'Social Media', 'Referral from Colleague',
  'Trade Event', 'Government Agency', 'NGO Partner', 'Other',
];

const YEARS_OPTIONS = [
  '0-2 years', '3-5 years', '6-10 years', '11-15 years', '16-20 years', '20+ years',
];

const STEP_LABELS = ['Personal', 'Company', 'Requirements', 'Terms'];

export default function OfftakeApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    company_name: '',
    registration_number: '',
    company_type: '',
    website: '',
    years_experience: '',
    commodities_required: [] as string[],
    monthly_volume_mt: '',
    delivery_countries: [] as string[],
    delivery_locations: '',
    contract_type: '',
    quality_certifications: [] as string[],
    payment_terms: '',
    min_order_mt: '',
    has_cold_chain: false,
    transport_arranged: false,
    destination_markets: [] as string[],
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
    field: 'commodities_required' | 'delivery_countries' | 'quality_certifications' | 'destination_markets',
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
        if (!form.company_name || !form.company_type) {
          setError('Please fill in company name and type.');
          return false;
        }
        return true;
      case 2:
        if (!form.commodities_required.length) {
          setError('Please select at least one commodity.');
          return false;
        }
        return true;
      case 3:
        if (!form.payment_terms || !form.terms_accepted) {
          setError('Please select payment terms and accept the terms.');
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
          provider_type: 'offtake',
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          provider_details: {
            company_name: form.company_name,
            registration_number: form.registration_number,
            company_type: form.company_type,
            website: form.website,
            years_experience: form.years_experience,
            commodities_required: form.commodities_required,
            monthly_volume_mt: form.monthly_volume_mt ? Number(form.monthly_volume_mt) : null,
            delivery_countries: form.delivery_countries,
            delivery_locations: form.delivery_locations,
            contract_type: form.contract_type,
            quality_certifications: form.quality_certifications,
            payment_terms: form.payment_terms,
            min_order_mt: form.min_order_mt ? Number(form.min_order_mt) : null,
            has_cold_chain: form.has_cold_chain,
            transport_arranged: form.transport_arranged,
            destination_markets: form.destination_markets,
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
            Thank you for applying to become an AFU offtake partner. Our team will review your
            application and contact you within 5 business days.
          </p>
          <Link
            href="/services/offtake"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Offtake Services
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
            <Package className="w-4 h-4" />
            Offtake Partner Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Become an AFU Offtake Partner
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Source quality agricultural commodities directly from verified African farmers through AFU.
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
                        placeholder="John Okafor"
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
                        placeholder="john@company.com"
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
                        placeholder="+234 801 234 5678"
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

            {/* Step 2 — Company */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#5DB347]" />
                  Company Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company / Business Name *</label>
                    <input
                      type="text"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="Okafor Trading Ltd"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      name="registration_number"
                      value={form.registration_number}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="RC-123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Type *</label>
                    <select
                      name="company_type"
                      value={form.company_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select type</option>
                      {COMPANY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
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
                        placeholder="https://company.com"
                      />
                    </div>
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
              </div>
            )}

            {/* Step 3 — Requirements */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#5DB347]" />
                  Requirements
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commodities Required *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {COMMODITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayField('commodities_required', c)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.commodities_required.includes(c)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Volume (MT)</label>
                    <input
                      type="number"
                      name="monthly_volume_mt"
                      value={form.monthly_volume_mt}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                    <select
                      name="contract_type"
                      value={form.contract_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select type</option>
                      {CONTRACT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Countries</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayField('delivery_countries', c)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          form.delivery_countries.includes(c)
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Locations</label>
                  <textarea
                    name="delivery_locations"
                    value={form.delivery_locations}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm resize-none"
                    placeholder="Specific delivery points or regions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality Certifications Required</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {QUALITY_CERTIFICATIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayField('quality_certifications', c)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.quality_certifications.includes(c)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Terms */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#5DB347]" />
                  Payment &amp; Terms
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                    <select
                      name="payment_terms"
                      value={form.payment_terms}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select terms</option>
                      {PAYMENT_TERMS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order (MT)</label>
                    <input
                      type="number"
                      name="min_order_mt"
                      value={form.min_order_mt}
                      onChange={handleChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, has_cold_chain: !prev.has_cold_chain }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        form.has_cold_chain ? 'bg-[#5DB347]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.has_cold_chain ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Has cold chain capability</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, transport_arranged: !prev.transport_arranged }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        form.transport_arranged ? 'bg-[#5DB347]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.transport_arranged ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Transport arranged by buyer</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Destination Markets
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DESTINATION_MARKETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleArrayField('destination_markets', m)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.destination_markets.includes(m)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
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
                    placeholder="Why do you want to partner with AFU for offtake?"
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
              href="/services/offtake"
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
