'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
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
  Clock,
  MapPin,
  Languages,
  ShieldCheck,
} from 'lucide-react';
import { AFU_COUNTRIES, COUNTRY_DATA } from '@/lib/countries';

const COUNTRIES = AFU_COUNTRIES;

const CURRENCIES = COUNTRY_DATA.filter((c) => c.isAfuOperating).map((c) => ({
  code: c.currency,
  symbol: c.currencySymbol,
  country: c.name,
})).filter((v, i, a) => a.findIndex((t) => t.code === v.code) === i);

const PRACTICE_TYPES = [
  'Solo Practitioner',
  'Clinic',
  'Mobile Vet',
  'Veterinary Hospital',
];

const SPECIES = [
  'Cattle', 'Poultry', 'Goats', 'Sheep', 'Pigs',
  'Equine', 'Aquaculture', 'Wildlife', 'Dogs/Cats',
];

const SERVICES_OFFERED = [
  'Consultation', 'Vaccination', 'Surgery', 'AI/Breeding',
  'Lab Diagnostics', 'Emergency Care', 'Herd Health Management', 'Disease Surveillance',
];

const LANGUAGES = [
  'English', 'French', 'Swahili', 'Shona', 'Ndebele',
  'Hausa', 'Yoruba', 'Zulu', 'Afrikaans', 'Portuguese', 'Amharic',
];

const AVAILABILITY_OPTIONS = [
  'Full-time', 'Part-time', 'On-call', 'Weekends Only',
];

const REFERRAL_SOURCES = [
  'AFU Website', 'Social Media', 'Referral from Colleague',
  'Agricultural Event', 'Government Agency', 'NGO Partner', 'Other',
];

const YEARS_OPTIONS = [
  '0-2 years', '3-5 years', '6-10 years', '11-15 years', '16-20 years', '20+ years',
];

const STEP_LABELS = ['Personal', 'Practice', 'Specialisation', 'Availability'];

export default function VetApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    practice_name: '',
    practice_type: '',
    licence_number: '',
    licence_country: '',
    qualifications: '',
    years_experience: '',
    species: [] as string[],
    services_offered: [] as string[],
    service_radius_km: '',
    languages_spoken: [] as string[],
    availability: '',
    emergency_available: false,
    consultation_fee: '',
    fee_currency: 'USD',
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
    if (type === 'checkbox' && name !== 'terms_accepted' && name !== 'emergency_available') return;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const toggleArrayField = (field: 'species' | 'services_offered' | 'languages_spoken', value: string) => {
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
        if (!form.practice_name || !form.practice_type || !form.licence_number || !form.years_experience) {
          setError('Please fill in all required fields.');
          return false;
        }
        return true;
      case 2:
        if (!form.species.length || !form.services_offered.length) {
          setError('Please select at least one species and one service.');
          return false;
        }
        return true;
      case 3:
        if (!form.availability || !form.terms_accepted) {
          setError('Please select availability and accept the terms.');
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

    // Anti-spam checks
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
          provider_type: 'vet',
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          provider_details: {
            practice_name: form.practice_name,
            practice_type: form.practice_type,
            licence_number: form.licence_number,
            licence_country: form.licence_country,
            qualifications: form.qualifications,
            years_experience: form.years_experience,
            species: form.species,
            services_offered: form.services_offered,
            service_radius_km: form.service_radius_km ? Number(form.service_radius_km) : null,
            languages_spoken: form.languages_spoken,
            availability: form.availability,
            emergency_available: form.emergency_available,
            consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
            fee_currency: form.fee_currency,
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
            Thank you for applying to join AFU as a veterinary service provider. Our team will review your
            application and contact you within 5 business days.
          </p>
          <Link
            href="/services/veterinary"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Veterinary Services
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
            <Stethoscope className="w-4 h-4" />
            Veterinary Provider Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Join AFU as a Veterinary Service Provider
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Provide essential animal health services to farmers across Africa through the AFU platform.
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
        {/* Honeypot */}
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
                        placeholder="Dr. Jane Mwangi"
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
                        placeholder="jane@example.com"
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
                        placeholder="+263 77 123 4567"
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

            {/* Step 2 — Practice */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#5DB347]" />
                  Practice Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name *</label>
                    <input
                      type="text"
                      name="practice_name"
                      value={form.practice_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                      placeholder="Mwangi Veterinary Clinic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Type *</label>
                    <select
                      name="practice_type"
                      value={form.practice_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select type</option>
                      {PRACTICE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Licence Number *</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="licence_number"
                        value={form.licence_number}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="VET-2024-1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Licence Country</label>
                    <select
                      name="licence_country"
                      value={form.licence_country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                  <textarea
                    name="qualifications"
                    value={form.qualifications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm resize-none"
                    placeholder="BVSc, MVSc, certifications..."
                  />
                </div>
              </div>
            )}

            {/* Step 3 — Specialisation */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#5DB347]" />
                  Specialisation
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleArrayField('species', s)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.species.includes(s)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SERVICES_OFFERED.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleArrayField('services_offered', s)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.services_offered.includes(s)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        name="service_radius_km"
                        value={form.service_radius_km}
                        onChange={handleChange}
                        min={0}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Languages className="w-4 h-4 inline mr-1" />
                    Languages Spoken
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayField('languages_spoken', lang)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.languages_spoken.includes(lang)
                            ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Availability */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
                <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#5DB347]" />
                  Availability &amp; Terms
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                    <select
                      name="availability"
                      value={form.availability}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                    >
                      <option value="">Select availability</option>
                      {AVAILABILITY_OPTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, emergency_available: !prev.emergency_available }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        form.emergency_available ? 'bg-[#5DB347]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          form.emergency_available ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Available for emergencies</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="consultation_fee"
                        value={form.consultation_fee}
                        onChange={handleChange}
                        min={0}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm"
                        placeholder="50"
                      />
                      <select
                        name="fee_currency"
                        value={form.fee_currency}
                        onChange={handleChange}
                        className="w-24 px-2 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm appearance-none bg-white"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                    </div>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
                  <textarea
                    name="motivation"
                    value={form.motivation}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none text-sm resize-none"
                    placeholder="Why do you want to join AFU as a veterinary provider?"
                  />
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
              href="/services/veterinary"
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
