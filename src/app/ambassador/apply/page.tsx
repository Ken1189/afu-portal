'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  FileText,
  Link2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { WORLD_COUNTRIES, ALL_AFRICAN_COUNTRIES, GLOBAL_OPTION } from '@/lib/countries';

const AFRICAN_MARKETS = [GLOBAL_OPTION, ...ALL_AFRICAN_COUNTRIES];

// Ambassador categories — reflects real mix (most ambassadors aren't farmers)
const SECTORS = [
  { value: 'Fundraising', label: 'Fundraising' },
  { value: 'Sponsorship', label: 'Sponsorship' },
  { value: 'Social Impact', label: 'Social Impact' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Venture Capital', label: 'Venture Capital' },
  { value: 'Private Investment', label: 'Private Investment' },
  { value: 'Development Finance', label: 'Development Finance' },
  { value: 'Impact Investing', label: 'Impact Investing' },
  { value: 'Academia', label: 'Academia' },
  { value: 'Business Development', label: 'Business Development' },
  { value: 'Sales & Marketing', label: 'Sales & Marketing' },
  { value: 'Agronomy', label: 'Agronomy' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Banking & Insurance', label: 'Banking & Insurance' },
  { value: 'Agribusiness', label: 'Agribusiness' },
  { value: 'Food Processing', label: 'Food Processing' },
  { value: 'Government & Policy', label: 'Government & Policy' },
  { value: 'Diplomatic & Trade Relations', label: 'Diplomatic & Trade Relations' },
  { value: 'NGO / Development', label: 'NGO / Development' },
  { value: 'Humanitarian & Aid', label: 'Humanitarian & Aid' },
  { value: 'Technology', label: 'Technology' },
  { value: 'AgriTech', label: 'AgriTech' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'Media & Communications', label: 'Media & Communications' },
  { value: 'Public Relations', label: 'Public Relations' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Compliance & Regulation', label: 'Compliance & Regulation' },
  { value: 'Logistics & Trade', label: 'Logistics & Trade' },
  { value: 'Supply Chain', label: 'Supply Chain' },
  { value: 'Export & Import', label: 'Export & Import' },
  { value: 'Commodities Trading', label: 'Commodities Trading' },
  { value: 'Farming', label: 'Farming' },
  { value: 'Livestock', label: 'Livestock' },
  { value: 'Forestry & Timber', label: 'Forestry & Timber' },
  { value: 'Fisheries & Aquaculture', label: 'Fisheries & Aquaculture' },
  { value: 'Mining & Resources', label: 'Mining & Resources' },
  { value: 'Real Estate & Land', label: 'Real Estate & Land' },
  { value: 'Renewable Energy', label: 'Renewable Energy' },
  { value: 'Water & Irrigation', label: 'Water & Irrigation' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education & Training', label: 'Education & Training' },
  { value: 'Tourism & Hospitality', label: 'Tourism & Hospitality' },
  { value: 'Construction & Engineering', label: 'Construction & Engineering' },
  { value: 'Retail & Distribution', label: 'Retail & Distribution' },
  { value: 'Carbon Credits & Climate', label: 'Carbon Credits & Climate' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Diaspora & Remittances', label: 'Diaspora & Remittances' },
  { value: 'Other', label: 'Other' },
];

const COUNTRIES = [...WORLD_COUNTRIES, 'Other'].sort();

export default function AmbassadorApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    region: '',
    sector: '',
    bio: '',
    socialLinks: '',
    website: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    instagram: '',
    twitter: '',
  });
  const [servesCountries, setServesCountries] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [formLoadedAt] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already an ambassador — redirect to dashboard
  useEffect(() => {
    async function checkAmbassadorStatus() {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('ambassadors')
          .select('id, status')
          .eq('user_id', user.id)
          .single();

        if (data) {
          if (data.status === 'active' || data.status === 'approved') {
            router.replace('/ambassador');
            return;
          }
          if (data.status === 'pending') {
            // Already applied — show the pending message
            setSuccess(true);
          }
        }
      } catch {
        // Not an ambassador — continue to form
      } finally {
        setCheckingStatus(false);
      }
    }

    checkAmbassadorStatus();
  }, [user, router]);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot — bots that fill the hidden field get silently rejected
    if (honeypot) return;

    // Timing check — reject submissions faster than 5 seconds
    if (Date.now() - formLoadedAt < 5000) return;

    // Gibberish detection
    const gibberishPattern = /^[A-Za-z]{15,}$/;
    if ([form.fullName, form.bio].some(f => f && gibberishPattern.test(f.trim()))) {
      setError('Please enter valid information.');
      return;
    }

    setError('');

    if (!form.fullName || !form.email || !form.country || !form.sector) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Primary: insert into ambassadors table with ALL form data
      const insertData: Record<string, unknown> = {
        full_name: form.fullName,
        email: form.email,
        phone: form.phone || null,
        country: form.country,
        region: form.region || null,
        regions: servesCountries.length > 0 ? servesCountries : null,
        sector: form.sector || null,
        bio: form.bio || null,
        motivation: form.bio || null,
        status: 'pending',
        tier: 'bronze',
        total_earned: 0,
        total_referrals: 0,
      };

      // If user is logged in, link to their user_id
      if (user) {
        insertData.user_id = user.id;
      }

      const { error: ambError } = await supabase
        .from('ambassadors')
        .insert(insertData);

      // Also insert into membership_applications for admin review
      await supabase
        .from('membership_applications')
        .insert({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          region: form.region || null,
          application_type: 'ambassador',
          requested_tier: 'ambassador',
          status: 'pending',
          notes: `[AMBASSADOR APPLICATION] Sector: ${form.sector} | Bio: ${form.bio || 'N/A'} | Website: ${form.website || 'N/A'} | Facebook: ${form.facebook || 'N/A'} | TikTok: ${form.tiktok || 'N/A'} | LinkedIn: ${form.linkedin || 'N/A'} | Instagram: ${form.instagram || 'N/A'} | Twitter: ${form.twitter || 'N/A'}`,
          profile_id: user?.id || null,
        });

      if (ambError) {
        // If ambassadors insert failed, at least membership_applications went through
        console.warn('Ambassador insert failed, using membership_applications:', ambError.message);
      } else if (user) {
        // Also save the extended info to site_config so it persists
        const configKey = `ambassador_settings_${user.id}`;
        await supabase.from('site_config').upsert(
          {
            key: configKey,
            value: {
              bio: form.bio || '',
              website: form.website || '',
              facebook: form.facebook || '',
              tiktok: form.tiktok || '',
              linkedin: form.linkedin || '',
              twitter: form.twitter || '',
              instagram: form.instagram || '',
              public_profile: true,
              application_sector: form.sector,
              application_social: form.socialLinks,
            },
          },
          { onConflict: 'key' }
        );
      }

      // Send email notifications (fire and forget)
      fetch('/api/ambassador/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          country: form.country,
          phone: form.phone,
          sector: form.sector,
          bio: form.bio,
          region: form.region,
        }),
      }).catch(() => {});

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-3">Application Submitted</h1>
          <p className="text-gray-600 mb-2">
            Your ambassador application is under review. We will be in touch soon.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            You will receive an email once your application has been processed. This usually takes 1-3 business days.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
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
            <Award className="w-4 h-4" />
            Ambassador Program
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Become an AFU Ambassador
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Represent the African Farming Union in your community and help us transform agriculture across Africa.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-4 -mt-8 relative z-10 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-sm p-4 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot - hidden from real users, bots fill it */}
            <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                  placeholder="e.g. Grace Moyo"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                    placeholder="+263 7X XXX XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Country + Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <select
                    id="country"
                    name="country"
                    required
                    value={form.country}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow appearance-none"
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                  Region
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <input
                    id="region"
                    name="region"
                    type="text"
                    value={form.region}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                    placeholder="e.g. Mashonaland West"
                  />
                </div>
              </div>
            </div>

            {/* Countries You'll Serve */}
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-2">
                African Countries You&apos;ll Serve
              </label>
              <p className="text-xs text-gray-500 mb-2">
                You can be based anywhere in the world. Select the African countries where you&apos;ll represent AFU.
              </p>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50/50">
                {AFRICAN_MARKETS.map((c) => {
                  const isGlobal = c === GLOBAL_OPTION;
                  const allSelected = ALL_AFRICAN_COUNTRIES.every((ac) => servesCountries.includes(ac));
                  const checked = isGlobal ? allSelected : servesCountries.includes(c);
                  return (
                    <label key={c} className={`flex items-center gap-2 text-sm cursor-pointer hover:text-[#5DB347] ${isGlobal ? 'col-span-full font-semibold text-[#5DB347] border-b border-gray-200 pb-2 mb-1' : 'text-[#1B2A4A]'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (isGlobal) {
                            setServesCountries(allSelected ? [] : [...ALL_AFRICAN_COUNTRIES]);
                          } else {
                            setServesCountries((prev) =>
                              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                            );
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      {isGlobal ? 'Global (All African Countries)' : c}
                    </label>
                  );
                })}
              </div>
              {servesCountries.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {servesCountries.length} {servesCountries.length === 1 ? 'country' : 'countries'} selected
                </p>
              )}
            </div>

            {/* Category / Field of expertise */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Category / Field of Expertise <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <select
                  id="sector"
                  name="sector"
                  required
                  value={form.sector}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow appearance-none"
                >
                  <option value="">Select your category</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio / Motivation */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Why do you want to be an ambassador? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  required
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow resize-none"
                  placeholder="Share your background, experience with agriculture, and what motivates you to represent AFU..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Social Media & Web Presence
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input name="website" type="url" value={form.website} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    placeholder="Website URL" />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <input name="facebook" type="url" value={form.facebook} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    placeholder="Facebook URL" />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  <input name="tiktok" type="url" value={form.tiktok} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    placeholder="TikTok URL" />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  <input name="linkedin" type="url" value={form.linkedin} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    placeholder="LinkedIn URL" />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                  <input name="instagram" type="url" value={form.instagram} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    placeholder="Instagram URL" />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <input name="twitter" type="url" value={form.twitter} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347]"
                    placeholder="X (Twitter) URL" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#5DB347]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By submitting, you agree to represent AFU with integrity. No account is created until your application is approved.
          </p>
        </div>
      </section>
    </div>
  );
}
