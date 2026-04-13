'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  User,
  GraduationCap,
  Wrench,
  Send,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
  Globe,
} from 'lucide-react';
import { ALL_AFRICAN_COUNTRIES } from '@/lib/countries';

/* ─── Constants ─── */

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Professional', icon: GraduationCap },
  { label: 'Skills & Preferences', icon: Wrench },
  { label: 'Profile & Submit', icon: Send },
];

const AFU_COUNTRIES = [...ALL_AFRICAN_COUNTRIES].sort();

const LANGUAGES = [
  'English', 'French', 'Swahili', 'Shona', 'Ndebele', 'Hausa',
  'Yoruba', 'Zulu', 'Afrikaans', 'Portuguese', 'Amharic', 'Arabic',
];

const SKILLS = [
  'Farming/Agronomy', 'Veterinary', 'Mechanics/Engineering', 'IT/Technology',
  'Finance/Accounting', 'Logistics/Transport', 'Sales/Marketing', 'Management/Admin',
  'Food Processing', 'Trading/Commodities', 'Research/Science', 'Training/Education',
];

const SECTORS = [
  'Crops & Agriculture', 'Livestock', 'Forestry', 'Game Farming',
  'Processing', 'Trading', 'Finance & Insurance', 'Logistics & Warehouse',
];

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select experience...' },
  { value: '0-1', label: '0 - 1 years' },
  { value: '1-3', label: '1 - 3 years' },
  { value: '3-5', label: '3 - 5 years' },
  { value: '5-10', label: '5 - 10 years' },
  { value: '10+', label: '10+ years' },
];

const EDUCATION_OPTIONS = [
  { value: '', label: 'Select education...' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'vocational', label: 'Vocational/Trade School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'degree', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Seasonal', 'Freelance'];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Select availability...' },
  { value: 'immediate', label: 'Immediately' },
  { value: '1_month', label: 'Within 1 month' },
  { value: '3_months', label: 'Within 3 months' },
  { value: 'negotiable', label: 'Negotiable' },
];

const SALARY_OPTIONS = [
  { value: '', label: 'Select range...' },
  { value: '$100-500/mo', label: '$100 - $500/month' },
  { value: '$500-1000/mo', label: '$500 - $1,000/month' },
  { value: '$1000-2000/mo', label: '$1,000 - $2,000/month' },
  { value: '$2000-5000/mo', label: '$2,000 - $5,000/month' },
  { value: '$5000+/mo', label: '$5,000+/month' },
  { value: 'negotiable', label: 'Negotiable' },
];

const REFERRAL_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'website', label: 'AFU Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'friend', label: 'Friend / Colleague' },
  { value: 'ambassador', label: 'AFU Ambassador' },
  { value: 'job_board', label: 'Job Board' },
  { value: 'news', label: 'News / Media' },
  { value: 'other', label: 'Other' },
];

/* ─── Types ─── */

interface FormData {
  // Step 1 — Personal
  full_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  date_of_birth: string;
  gender: string;
  // Step 2 — Professional
  job_title: string;
  experience_years: string;
  education_level: string;
  qualifications: string;
  languages: string[];
  // Step 3 — Skills & Preferences
  skills: string[];
  sectors: string[];
  employment_type: string;
  availability: string;
  salary_expectation: string;
  preferred_countries: string[];
  willing_to_relocate: boolean;
  // Step 4 — Profile & Submit
  bio: string;
  cv_url: string;
  photo_url: string;
  referral_source: string;
  agreed_to_terms: boolean;
  // Honeypot
  website_hp: string;
}

const INITIAL: FormData = {
  full_name: '', email: '', phone: '', country: '', region: '',
  date_of_birth: '', gender: '',
  job_title: '', experience_years: '', education_level: '', qualifications: '', languages: [],
  skills: [], sectors: [], employment_type: '', availability: '',
  salary_expectation: '', preferred_countries: [], willing_to_relocate: false,
  bio: '', cv_url: '', photo_url: '', referral_source: '', agreed_to_terms: false,
  website_hp: '',
};

/* ─── Component ─── */

export default function TalentSignupPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const loadTime = useRef(Date.now());

  // ── Helpers ──
  const set = (field: keyof FormData, value: unknown) =>
    setForm((p) => ({ ...p, [field]: value }));

  const toggleArray = (field: 'skills' | 'sectors' | 'preferred_countries' | 'languages', val: string) => {
    setForm((p) => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  // ── Validation ──
  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.full_name.trim()) return 'Full name is required';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required';
      if (!form.country) return 'Country is required';
    }
    if (step === 3) {
      if (!form.agreed_to_terms) return 'You must agree to the terms';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => Math.min(s + 1, 3));
  };

  const prev = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };

  // ── Submit ──
  const submit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }

    // Anti-spam checks
    if (form.website_hp) return; // honeypot filled
    if (Date.now() - loadTime.current < 3000) { setError('Please wait a moment before submitting.'); return; }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/jobs/talent-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          country: form.country,
          region: form.region.trim() || null,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          job_title: form.job_title.trim() || null,
          experience_years: form.experience_years || null,
          education_level: form.education_level || null,
          qualifications: form.qualifications.trim() || null,
          languages: form.languages,
          skills: form.skills,
          sectors: form.sectors,
          employment_type: form.employment_type || null,
          availability: form.availability || null,
          salary_expectation: form.salary_expectation || null,
          preferred_countries: form.preferred_countries,
          willing_to_relocate: form.willing_to_relocate,
          bio: form.bio.trim() || null,
          cv_url: form.cv_url.trim() || null,
          photo_url: form.photo_url.trim() || null,
          referral_source: form.referral_source || null,
          agreed_to_terms: form.agreed_to_terms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Input classes ──
  const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347] focus:ring-1 focus:ring-[#5DB347]/20 transition-colors';
  const labelCls = 'block text-sm font-medium text-[#1B2A4A] mb-1.5';
  const checkCls = 'w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]/40';

  // ── Success ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-[#5DB347]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-3">Profile Submitted!</h1>
          <p className="text-gray-500 mb-6">
            We&apos;ll review your profile and connect you with opportunities across Africa.
            You&apos;ll receive a confirmation email shortly.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-[#5DB347] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4a9a38] transition-colors"
          >
            Browse Jobs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ── Hero ── */}
      <section className="bg-[#1B2A4A] text-white py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-[#5DB347]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Briefcase className="w-7 h-7 text-[#5DB347]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Join Africa&apos;s Agricultural Workforce
          </h1>
          <p className="text-white/70 max-w-lg mx-auto">
            Register your skills and experience. We&apos;ll match you with farming,
            agribusiness, and agritech opportunities across 20 African countries.
          </p>
        </div>
      </section>

      {/* ── Step indicator ── */}
      <div className="max-w-3xl mx-auto px-4 -mt-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={s.label}
                  onClick={() => { if (i < step) setStep(i); }}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    active ? 'text-[#5DB347]' : done ? 'text-[#1B2A4A]' : 'text-gray-400'
                  } ${i < step ? 'cursor-pointer hover:text-[#5DB347]' : 'cursor-default'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    active ? 'bg-[#5DB347] text-white' :
                    done ? 'bg-[#1B2A4A] text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Honeypot */}
          <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website_hp">Website</label>
            <input
              id="website_hp"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website_hp}
              onChange={(e) => set('website_hp', e.target.value)}
            />
          </div>

          {/* ── Step 1: Personal ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Personal Information</h2>
              <p className="text-gray-500 text-sm mb-4">Tell us about yourself.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" className={inputCls} placeholder="John Mwangi" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" className={inputCls} placeholder="john@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" className={inputCls} placeholder="+263 77 123 4567" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Country *</label>
                  <select className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)}>
                    <option value="">Select country...</option>
                    {AFU_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Region / City</label>
                  <input type="text" className={inputCls} placeholder="Harare, Mashonaland East" value={form.region} onChange={(e) => set('region', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" className={inputCls} value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Professional ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Professional Background</h2>
              <p className="text-gray-500 text-sm mb-4">Share your experience and qualifications.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Current / Desired Job Title</label>
                  <input type="text" className={inputCls} placeholder="Farm Manager, Agronomist, etc." value={form.job_title} onChange={(e) => set('job_title', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Years of Experience</label>
                  <select className={inputCls} value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)}>
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Education Level</label>
                  <select className={inputCls} value={form.education_level} onChange={(e) => set('education_level', e.target.value)}>
                    {EDUCATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Qualifications / Certifications</label>
                <textarea className={inputCls + ' min-h-[80px]'} placeholder="List any relevant certifications, courses, or training..." value={form.qualifications} onChange={(e) => set('qualifications', e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Languages</label>
                <p className="text-xs text-gray-400 mb-2">Select all that apply.</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const sel = form.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArray('languages', lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          sel ? 'bg-[#5DB347] text-white border-[#5DB347]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5DB347]'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Skills & Preferences ── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Skills & Preferences</h2>
              <p className="text-gray-500 text-sm mb-4">What can you do and what are you looking for?</p>

              {/* Skills */}
              <div>
                <label className={labelCls}>Skills</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SKILLS.map((skill) => (
                    <label key={skill} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-[#5DB347]/40 cursor-pointer transition-colors">
                      <input type="checkbox" className={checkCls} checked={form.skills.includes(skill)} onChange={() => toggleArray('skills', skill)} />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sectors */}
              <div>
                <label className={labelCls}>Preferred Sectors</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SECTORS.map((sector) => (
                    <label key={sector} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-[#5DB347]/40 cursor-pointer transition-colors">
                      <input type="checkbox" className={checkCls} checked={form.sectors.includes(sector)} onChange={() => toggleArray('sectors', sector)} />
                      <span className="text-sm text-gray-700">{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Employment type */}
              <div>
                <label className={labelCls}>Employment Type</label>
                <div className="flex flex-wrap gap-3">
                  {EMPLOYMENT_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="employment_type"
                        value={t}
                        checked={form.employment_type === t}
                        onChange={(e) => set('employment_type', e.target.value)}
                        className="w-4 h-4 text-[#5DB347] focus:ring-[#5DB347]/40"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Availability</label>
                  <select className={inputCls} value={form.availability} onChange={(e) => set('availability', e.target.value)}>
                    {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Salary Expectation</label>
                  <select className={inputCls} value={form.salary_expectation} onChange={(e) => set('salary_expectation', e.target.value)}>
                    {SALARY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Preferred countries */}
              <div>
                <label className={labelCls}>Preferred Countries to Work In</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AFU_COUNTRIES.map((c) => (
                    <label key={c} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-[#5DB347]/40 cursor-pointer transition-colors text-sm">
                      <input type="checkbox" className={checkCls} checked={form.preferred_countries.includes(c)} onChange={() => toggleArray('preferred_countries', c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              {/* Relocate toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => set('willing_to_relocate', !form.willing_to_relocate)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.willing_to_relocate ? 'bg-[#5DB347]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.willing_to_relocate ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm text-gray-700">Willing to relocate for the right opportunity</span>
              </label>
            </div>
          )}

          {/* ── Step 4: Profile & Submit ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Profile & Submit</h2>
              <p className="text-gray-500 text-sm mb-4">Complete your profile and submit.</p>

              <div>
                <label className={labelCls}>Short Bio</label>
                <textarea
                  className={inputCls + ' min-h-[100px]'}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{form.bio.length}/1000 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>CV / Resume URL</label>
                  <input type="url" className={inputCls} placeholder="https://drive.google.com/your-cv" value={form.cv_url} onChange={(e) => set('cv_url', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Link to your CV on Google Drive, Dropbox, etc.</p>
                </div>
                <div>
                  <label className={labelCls}>Photo URL</label>
                  <input type="url" className={inputCls} placeholder="https://example.com/photo.jpg" value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Professional headshot (optional)</p>
                </div>
              </div>

              <div>
                <label className={labelCls}>How did you hear about us?</label>
                <select className={inputCls} value={form.referral_source} onChange={(e) => set('referral_source', e.target.value)}>
                  {REFERRAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-gray-100 bg-gray-50">
                <input
                  type="checkbox"
                  className={checkCls + ' mt-0.5'}
                  checked={form.agreed_to_terms}
                  onChange={(e) => set('agreed_to_terms', e.target.checked)}
                />
                <span className="text-sm text-gray-700">
                  I agree to the AFU{' '}
                  <Link href="/legal/terms" className="text-[#5DB347] underline">Terms of Service</Link>{' '}
                  and{' '}
                  <Link href="/legal/privacy" className="text-[#5DB347] underline">Privacy Policy</Link>.
                  I consent to AFU storing my data and sharing my profile with potential employers. *
                </span>
              </label>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-3">Application Summary</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="text-gray-500">Name:</div>
                  <div className="text-[#1B2A4A] font-medium">{form.full_name || '---'}</div>
                  <div className="text-gray-500">Email:</div>
                  <div className="text-[#1B2A4A]">{form.email || '---'}</div>
                  <div className="text-gray-500">Country:</div>
                  <div className="text-[#1B2A4A]">{form.country || '---'}</div>
                  <div className="text-gray-500">Job title:</div>
                  <div className="text-[#1B2A4A]">{form.job_title || '---'}</div>
                  <div className="text-gray-500">Experience:</div>
                  <div className="text-[#1B2A4A]">{form.experience_years || '---'}</div>
                  <div className="text-gray-500">Skills:</div>
                  <div className="text-[#1B2A4A]">{form.skills.length > 0 ? form.skills.join(', ') : '---'}</div>
                  <div className="text-gray-500">Employment:</div>
                  <div className="text-[#1B2A4A]">{form.employment_type || '---'}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mt-5 flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={prev} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link href="/jobs" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Jobs
              </Link>
            )}

            {step < 3 ? (
              <button onClick={next} className="flex items-center gap-2 bg-[#5DB347] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a9a38] transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#5DB347] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a9a38] transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
