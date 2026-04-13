'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Truck, User, Mail, Phone, Globe, MapPin, FileText,
  CheckCircle, AlertCircle, Loader2, ArrowLeft, Car,
} from 'lucide-react';

const VEHICLE_TYPES = [
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'motorcycle', label: 'Motorcycle / Boda-Boda' },
  { value: 'car', label: 'Car / Sedan' },
  { value: 'van', label: 'Van / Pickup' },
  { value: 'truck', label: 'Truck' },
];

const COUNTRIES = [
  'Botswana', 'Zimbabwe', 'Tanzania', 'Kenya', 'Nigeria', 'Zambia',
  'Mozambique', 'South Africa', 'Ghana', 'Uganda', 'Sierra Leone',
  'Egypt', 'Ethiopia', 'Malawi', 'Namibia', 'Guinea', 'Guinea-Bissau',
  'Liberia', 'Mali', 'Ivory Coast',
];

export default function DriverApplyPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', country: '', region: '', city: '',
    vehicle_type: 'motorcycle', vehicle_registration: '', license_number: '',
    experience_description: '',
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
    if (!form.full_name || !form.email) {
      setError('Name and email are required.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/foober/drivers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit application');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <CheckCircle className="w-16 h-16 text-[#5DB347] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to be a Foober driver. We will review your application and get back to you within 2-3 business days.
          </p>
          <Link href="/" className="text-[#5DB347] font-medium hover:underline">
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/foober" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5DB347] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Foober
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#5DB347]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1B2A4A]">Become a Foober Driver</h1>
              <p className="text-sm text-gray-500">Earn money delivering goods across Africa</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="full_name" value={form.full_name} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="driver@email.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="+263 77 123 4567" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select name="country" value={form.country} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm appearance-none bg-white">
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Region / Province</label>
                <input name="region" value={form.region} onChange={handleChange} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. Mashonaland East" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">City / Town</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="city" value={form.city} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. Harare" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Vehicle Type</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm appearance-none bg-white">
                  {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vehicle Registration</label>
                <input name="vehicle_registration" value={form.vehicle_registration} onChange={handleChange} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. ABC 1234" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">License Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="license_number" value={form.license_number} onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="Driver's license #" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Experience / About You</label>
              <textarea name="experience_description" value={form.experience_description} onChange={handleChange} rows={3} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Tell us about your delivery experience..." />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#5DB347] text-white font-semibold text-sm hover:bg-[#4a9a39] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Truck className="w-4 h-4" /> Apply to Drive</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
