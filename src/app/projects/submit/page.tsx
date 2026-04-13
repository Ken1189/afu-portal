'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sprout, User, FileText, MapPin, HandCoins,
  ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  ChevronDown,
} from 'lucide-react';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';

/* ─── Constants ─── */
const STEPS = ['About You', 'Project Details', 'Location & Funding', 'Support & Submit'];

const ROLE_OPTIONS = [
  'Project Founder',
  'Researcher',
  'Project Manager',
  'Partner Organisation',
  'Farmer/Producer',
  'NGO/Development Agency',
];

const CATEGORY_OPTIONS = [
  'Agronomy/Crops',
  'Livestock',
  'Technology/AgTech',
  'Climate/Sustainability',
  'Processing/Value Addition',
  'Trade/Export',
  'Forestry',
  'Aquaculture',
];

const STAGE_OPTIONS = [
  'Concept/Idea',
  'Pilot/Testing',
  'Operational',
  'Scaling Up',
];

const BENEFICIARY_OPTIONS = [
  { value: 'smallholders', label: 'Smallholder farmers' },
  { value: 'women_farmers', label: 'Women farmers' },
  { value: 'youth', label: 'Youth' },
  { value: 'cooperatives', label: 'Cooperatives' },
  { value: 'community', label: 'Community/village' },
  { value: 'commercial', label: 'Commercial farmers' },
];

const FUNDING_RANGES = [
  '$1K - $10K',
  '$10K - $50K',
  '$50K - $100K',
  '$100K - $500K',
  '$500K - $1M',
  '$1M+',
];

const EXISTING_FUNDING_OPTIONS = [
  'Self-funded',
  'Grant/Donor',
  'Government',
  'Bank loan',
  'None yet',
];

const TIMELINE_OPTIONS = ['6 months', '1 year', '2 years', '3+ years'];

const SUPPORT_OPTIONS = [
  { value: 'funding', label: 'Funding/Investment' },
  { value: 'inputs', label: 'Input Supply' },
  { value: 'market_access', label: 'Market Access/Offtake' },
  { value: 'training', label: 'Training/Capacity Building' },
  { value: 'insurance', label: 'Crop/Livestock Insurance' },
  { value: 'processing', label: 'Processing Facilities' },
  { value: 'logistics', label: 'Logistics/Transport' },
  { value: 'technology', label: 'Technology/Data' },
];

const REFERRAL_OPTIONS = [
  'Search engine',
  'Social media',
  'Word of mouth',
  'AFU event',
  'Partner organisation',
  'News/media',
  'Other',
];

const COUNTRIES = [...ALL_AFRICAN_COUNTRIES].sort();

/* ─── Types ─── */
interface FormData {
  // Step 1
  full_name: string;
  email: string;
  phone: string;
  country: string;
  organisation: string;
  role_in_project: string;
  // Step 2
  project_name: string;
  project_category: string;
  project_stage: string;
  project_description: string;
  target_beneficiaries: string[];
  beneficiary_count: string;
  // Step 3
  project_country: string;
  project_region: string;
  is_multi_country: boolean;
  project_countries: string[];
  funding_required: boolean;
  funding_amount: string;
  funding_purpose: string;
  existing_funding: string;
  timeline: string;
  // Step 4
  support_needed: string[];
  impact_description: string;
  proposal_url: string;
  referral_source: string;
  agreed_to_terms: boolean;
}

const EMPTY_FORM: FormData = {
  full_name: '',
  email: '',
  phone: '',
  country: '',
  organisation: '',
  role_in_project: '',
  project_name: '',
  project_category: '',
  project_stage: '',
  project_description: '',
  target_beneficiaries: [],
  beneficiary_count: '',
  project_country: '',
  project_region: '',
  is_multi_country: false,
  project_countries: [],
  funding_required: false,
  funding_amount: '',
  funding_purpose: '',
  existing_funding: '',
  timeline: '',
  support_needed: [],
  impact_description: '',
  proposal_url: '',
  referral_source: '',
  agreed_to_terms: false,
};

/* ─── Component ─── */
export default function ProjectSubmitPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormData, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key: 'target_beneficiaries' | 'support_needed' | 'project_countries', item: string) => {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item] };
    });
  };

  const canProceed = () => {
    if (step === 0) return form.full_name && form.email && form.country;
    if (step === 1) return form.project_name && form.project_description;
    if (step === 2) return form.project_country;
    if (step === 3) return form.agreed_to_terms;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          organisation: form.organisation || null,
          role_in_project: form.role_in_project || null,
          project_name: form.project_name,
          project_category: form.project_category || null,
          project_stage: form.project_stage || null,
          project_description: form.project_description,
          target_beneficiaries: form.target_beneficiaries.join(', ') || null,
          beneficiary_count: form.beneficiary_count ? parseInt(form.beneficiary_count) : null,
          project_country: form.project_country,
          project_region: form.project_region || null,
          project_countries: form.is_multi_country ? form.project_countries : [],
          funding_required: form.funding_required,
          funding_amount: form.funding_required ? form.funding_amount : null,
          funding_purpose: form.funding_required ? form.funding_purpose : null,
          existing_funding: form.existing_funding || null,
          support_needed: form.support_needed,
          proposal_url: form.proposal_url || null,
          timeline: form.timeline || null,
          impact_description: form.impact_description || null,
          referral_source: form.referral_source || null,
          agreed_to_terms: form.agreed_to_terms,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fdf6] to-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#5DB347' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#1B2A4A' }}>Project Submitted!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Thank you for submitting your agricultural project. Our team will review your proposal and get back to you within 5-7 business days.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: '#5DB347' }}
          >
            Return Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fdf6] to-white">
      {/* Hero */}
      <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #1B2A4A, #2D4A7A)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(93,179,71,0.2)' }}>
            <Sprout className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Submit Your Agricultural Project</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Tell us about your project and how AFU can support it through funding, inputs, market access, or partnerships.
          </p>
        </div>
      </section>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  i === step ? 'text-[#5DB347]' : i < step ? 'text-[#1B2A4A] cursor-pointer' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step ? 'bg-[#5DB347] text-white' : i === step ? 'bg-[#5DB347]/10 text-[#5DB347] ring-2 ring-[#5DB347]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ background: '#5DB347', width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Step 1: About You */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5DB347' }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>About You</h2>
                  <p className="text-gray-500 text-sm">Tell us who you are</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="+263 77 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <div className="relative">
                    <select
                      value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
                  <input
                    type="text"
                    value={form.organisation}
                    onChange={(e) => set('organisation', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="Company or organisation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                  <div className="relative">
                    <select
                      value={form.role_in_project}
                      onChange={(e) => set('role_in_project', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select your role</option>
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5DB347' }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>Project Details</h2>
                  <p className="text-gray-500 text-sm">Describe your project</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={form.project_name}
                  onChange={(e) => set('project_name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="Name of your project"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Category</label>
                  <div className="relative">
                    <select
                      value={form.project_category}
                      onChange={(e) => set('project_category', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Stage</label>
                  <div className="relative">
                    <select
                      value={form.project_stage}
                      onChange={(e) => set('project_stage', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select stage</option>
                      {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description *</label>
                <textarea
                  value={form.project_description}
                  onChange={(e) => set('project_description', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                  placeholder="Describe your project: what it does, who it helps, and your vision for its impact..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Beneficiaries</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BENEFICIARY_OPTIONS.map((b) => (
                    <label key={b.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      form.target_beneficiaries.includes(b.value)
                        ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.target_beneficiaries.includes(b.value)}
                        onChange={() => toggleArrayItem('target_beneficiaries', b.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        form.target_beneficiaries.includes(b.value)
                          ? 'border-[#5DB347] bg-[#5DB347]'
                          : 'border-gray-300'
                      }`}>
                        {form.target_beneficiaries.includes(b.value) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{b.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Beneficiary Count</label>
                <input
                  type="number"
                  value={form.beneficiary_count}
                  onChange={(e) => set('beneficiary_count', e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="e.g. 500"
                  min={0}
                />
              </div>
            </div>
          )}

          {/* Step 3: Location & Funding */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5DB347' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>Location & Funding</h2>
                  <p className="text-gray-500 text-sm">Where and how</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Country *</label>
                  <div className="relative">
                    <select
                      value={form.project_country}
                      onChange={(e) => set('project_country', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Region</label>
                  <input
                    type="text"
                    value={form.project_region}
                    onChange={(e) => set('project_region', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                    placeholder="e.g. Northern Region"
                  />
                </div>
              </div>

              {/* Multi-country toggle */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => set('is_multi_country', !form.is_multi_country)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.is_multi_country ? 'bg-[#5DB347]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${form.is_multi_country ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Multi-country project</span>
                </label>
                {form.is_multi_country && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-14">
                    {COUNTRIES.map((c) => (
                      <label key={c} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                        form.project_countries.includes(c)
                          ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.project_countries.includes(c)}
                          onChange={() => toggleArrayItem('project_countries', c)}
                          className="sr-only"
                        />
                        <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${
                          form.project_countries.includes(c) ? 'border-[#5DB347] bg-[#5DB347]' : 'border-gray-300'
                        }`}>
                          {form.project_countries.includes(c) && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {c}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Funding toggle */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => set('funding_required', !form.funding_required)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.funding_required ? 'bg-[#5DB347]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${form.funding_required ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Funding required</span>
                </label>

                {form.funding_required && (
                  <div className="space-y-4 pl-14">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Funding Amount</label>
                      <div className="relative">
                        <select
                          value={form.funding_amount}
                          onChange={(e) => set('funding_amount', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                        >
                          <option value="">Select range</option>
                          {FUNDING_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">What will funding be used for?</label>
                      <textarea
                        value={form.funding_purpose}
                        onChange={(e) => set('funding_purpose', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                        placeholder="Describe how the funds will be allocated..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Existing Funding Source</label>
                  <div className="relative">
                    <select
                      value={form.existing_funding}
                      onChange={(e) => set('existing_funding', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select source</option>
                      {EXISTING_FUNDING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Timeline</label>
                  <div className="relative">
                    <select
                      value={form.timeline}
                      onChange={(e) => set('timeline', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                    >
                      <option value="">Select timeline</option>
                      {TIMELINE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: AFU Support & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5DB347' }}>
                  <HandCoins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1B2A4A' }}>AFU Support & Submit</h2>
                  <p className="text-gray-500 text-sm">How can we help?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What support do you need from AFU?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SUPPORT_OPTIONS.map((s) => (
                    <label key={s.value} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                      form.support_needed.includes(s.value)
                        ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.support_needed.includes(s.value)}
                        onChange={() => toggleArrayItem('support_needed', s.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        form.support_needed.includes(s.value) ? 'border-[#5DB347] bg-[#5DB347]' : 'border-gray-300'
                      }`}>
                        {form.support_needed.includes(s.value) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Impact</label>
                <textarea
                  value={form.impact_description}
                  onChange={(e) => set('impact_description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none resize-none"
                  placeholder="Describe the expected impact of your project on the community and agriculture..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Document URL</label>
                <input
                  type="url"
                  value={form.proposal_url}
                  onChange={(e) => set('proposal_url', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none"
                  placeholder="https://drive.google.com/... or similar link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about AFU?</label>
                <div className="relative">
                  <select
                    value={form.referral_source}
                    onChange={(e) => set('referral_source', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none appearance-none bg-white"
                  >
                    <option value="">Select option</option>
                    {REFERRAL_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-gray-200 hover:border-[#5DB347]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={form.agreed_to_terms}
                  onChange={(e) => set('agreed_to_terms', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <span className="text-sm text-gray-600">
                  I confirm the information provided is accurate and I agree to AFU&apos;s{' '}
                  <Link href="/legal/terms" className="text-[#5DB347] underline">Terms of Service</Link>{' '}
                  and{' '}
                  <Link href="/legal/privacy" className="text-[#5DB347] underline">Privacy Policy</Link>. *
                </span>
              </label>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-0 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ background: '#5DB347' }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ background: '#5DB347' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Project
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
