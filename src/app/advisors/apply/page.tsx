'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Globe2,
  Briefcase,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const COUNTRIES = [
  'Zimbabwe', 'Kenya', 'Tanzania', 'Zambia', 'Mozambique',
  'Nigeria', 'Ghana', 'Uganda', 'Botswana', 'South Africa', 'Other',
];

const SPECIALIZATIONS = [
  'Crop Science & Agronomy',
  'Livestock & Animal Husbandry',
  'Agricultural Finance & Microfinance',
  'Supply Chain & Logistics',
  'Irrigation & Water Management',
  'Soil Science & Conservation',
  'Pest & Disease Management',
  'Climate-Smart Agriculture',
  'Organic Farming & Certification',
  'Agricultural Policy & Regulation',
  'Farm Mechanization & Technology',
  'Post-Harvest Processing',
  'Export Markets & Trade',
  'Cooperatives & Farmer Organisations',
  'Carbon Credits & Sustainability',
  'Other',
];

export default function AdvisorApplyPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    current_role: '',
    organization: '',
    years_experience: '',
    specializations: [] as string[],
    qualifications: '',
    bio: '',
    linkedin_url: '',
    motivation: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleSpecialization = (spec: string) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('CV file must be under 10MB');
        return;
      }
      setCvFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.full_name || !form.email || !form.country || !form.specializations.length || !form.bio) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      // Upload CV if provided
      let cvUrl = '';
      if (cvFile) {
        const ext = cvFile.name.split('.').pop();
        const path = `advisor-cvs/${Date.now()}-${form.full_name.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, cvFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
          cvUrl = urlData.publicUrl;
        }
      }

      // Submit advisor application
      const { error: insertError } = await supabase.from('membership_applications').insert({
        full_name: form.full_name,
        email: form.email.toLowerCase(),
        phone: form.phone,
        country: form.country,
        status: 'pending',
        type: 'advisor',
        notes: JSON.stringify({
          application_type: 'advisor',
          city: form.city,
          current_role: form.current_role,
          organization: form.organization,
          years_experience: form.years_experience,
          specializations: form.specializations,
          qualifications: form.qualifications,
          bio: form.bio,
          linkedin_url: form.linkedin_url,
          motivation: form.motivation,
          cv_url: cvUrl,
        }),
      });

      if (insertError) throw insertError;

      // Send notification email
      await fetch('/api/apply/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          type: 'Advisor Application',
          message: `Specialisations: ${form.specializations.join(', ')}\nExperience: ${form.years_experience} years\nRole: ${form.current_role} at ${form.organization}\nCV: ${cvUrl || 'Not uploaded'}`,
        }),
      }).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#5DB347]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">Application Received!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in joining the AFU Advisory Network, {form.full_name.split(' ')[0]}.
            Our team will review your application and get back to you within 5-7 business days.
          </p>
          <Link
            href="/advisors"
            className="inline-flex items-center gap-2 bg-[#1B2A4A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2A3A5C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Advisors
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2A3A5C] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/advisors" className="inline-flex items-center gap-1 text-gray-300 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Advisors
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Become an Advisor</h1>
          <p className="text-gray-300 text-lg">
            Share your expertise with African farmers. Join our advisory network and make a lasting impact on agricultural development across the continent.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#5DB347]" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text" name="full_name" value={form.full_name} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="Dr. Jane Okafor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                    placeholder="+263 77 123 4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <div className="relative">
                  <Globe2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    name="country" value={form.country} onChange={handleChange} required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none appearance-none bg-white"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Region</label>
                <input
                  type="text" name="city" value={form.city} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="Harare, Mashonaland West"
                />
              </div>
            </div>
          </div>

          {/* Professional Background */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#5DB347]" /> Professional Background
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Role / Title</label>
                <input
                  type="text" name="current_role" value={form.current_role} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="Senior Agronomist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                <input
                  type="text" name="organization" value={form.organization} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="Ministry of Agriculture / University of Nairobi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number" name="years_experience" value={form.years_experience} onChange={handleChange}
                  min="0" max="60"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                <input
                  type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="https://linkedin.com/in/janeokafor"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications & Certifications</label>
                <input
                  type="text" name="qualifications" value={form.qualifications} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                  placeholder="PhD Agricultural Economics, Certified Crop Advisor (CCA)"
                />
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#5DB347]" /> Areas of Expertise *
            </h2>
            <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                    form.specializations.includes(spec)
                      ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {form.specializations.includes(spec) ? '+ ' : ''}{spec}
                </button>
              ))}
            </div>
          </div>

          {/* Bio & Motivation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#5DB347]" /> About You
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio *</label>
                <textarea
                  name="bio" value={form.bio} onChange={handleChange} required rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none resize-y"
                  placeholder="Tell us about your background, key achievements, and experience in African agriculture..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to advise AFU?</label>
                <textarea
                  name="motivation" value={form.motivation} onChange={handleChange} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none resize-y"
                  placeholder="What draws you to the AFU mission? How do you see yourself contributing?"
                />
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#5DB347]" /> Upload CV / Resume
            </h2>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 px-4 text-center hover:border-[#5DB347] hover:bg-[#5DB347]/5 transition-colors"
            >
              {cvFile ? (
                <div className="flex items-center justify-center gap-2 text-[#5DB347]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{cvFile.name}</span>
                  <span className="text-gray-400 text-sm">({(cvFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload your CV</p>
                  <p className="text-gray-400 text-sm mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                </div>
              )}
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#449933] hover:to-[#387828] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
