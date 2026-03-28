'use client';

import { useState } from 'react';
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

const SECTORS = [
  { value: 'farming', label: 'Farming' },
  { value: 'business', label: 'Business' },
  { value: 'community', label: 'Community' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

export default function AmbassadorApplyPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    region: '',
    sector: '',
    bio: '',
    socialLinks: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.country || !form.sector) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Insert into membership_applications
      const { error: appError } = await supabase
        .from('membership_applications')
        .insert({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          region: form.region || null,
          requested_tier: 'new_enterprise',
          status: 'pending',
          notes: `[AMBASSADOR APPLICATION] Sector: ${form.sector} | Bio: ${form.bio || 'N/A'} | Social: ${form.socialLinks || 'N/A'}`,
        });

      if (appError) {
        // Try ambassadors table as fallback
        const { error: ambError } = await supabase
          .from('ambassadors')
          .insert({
            full_name: form.fullName,
            email: form.email,
            phone: form.phone || null,
            country: form.country,
            country_flag: '',
            sector: form.sector,
            bio: form.bio || null,
            status: 'pending',
          });

        if (ambError) {
          throw new Error(ambError.message);
        }
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
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-3">Application Submitted</h1>
          <p className="text-gray-600 mb-6">
            Your ambassador application is under review. We will be in touch soon.
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
                  <input
                    id="country"
                    name="country"
                    type="text"
                    required
                    value={form.country}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                    placeholder="e.g. Zimbabwe"
                  />
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

            {/* Sector */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Sector <span className="text-red-500">*</span>
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
                  <option value="">Select your sector</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Why do you want to be an ambassador?
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow resize-none"
                  placeholder="Share your background and motivation..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label htmlFor="socialLinks" className="block text-sm font-medium text-[#1B2A4A] mb-2">
                Social Media Links
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                <input
                  id="socialLinks"
                  name="socialLinks"
                  type="text"
                  value={form.socialLinks}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/40 focus:border-[#5DB347] transition-shadow"
                  placeholder="LinkedIn, Twitter, Facebook links"
                />
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
