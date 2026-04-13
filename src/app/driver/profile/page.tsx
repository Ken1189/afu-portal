'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { Save, Loader2, CheckCircle2, AlertCircle, Truck, Car } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

const VEHICLE_TYPES = [
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'motorcycle', label: 'Motorcycle / Boda-Boda' },
  { value: 'car', label: 'Car / Sedan' },
  { value: 'van', label: 'Van / Pickup' },
  { value: 'truck', label: 'Truck' },
];

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', vehicle_type: 'motorcycle',
    vehicle_registration: '', license_number: '',
    vehicle_make: '', vehicle_model: '', vehicle_year: '', vehicle_color: '',
    country: '', region: '', city: '',
    avatar_url: '', vehicle_photo_url: '',
    license_photo_url: '', roadworthiness_photo_url: '', insurance_photo_url: '', registration_photo_url: '',
  });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('foober_drivers').select('*').eq('profile_id', user!.id).maybeSingle();
      if (data) {
        setDriver(data);
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          vehicle_type: data.vehicle_type || 'motorcycle',
          vehicle_registration: data.vehicle_registration || '',
          license_number: data.license_number || '',
          vehicle_make: data.vehicle_make || '',
          vehicle_model: data.vehicle_model || '',
          vehicle_year: data.vehicle_year?.toString() || '',
          vehicle_color: data.vehicle_color || '',
          country: data.country || '',
          region: data.region || '',
          city: data.city || '',
          avatar_url: data.avatar_url || '',
          vehicle_photo_url: data.vehicle_photo_url || '',
          license_photo_url: data.license_photo_url || '',
          roadworthiness_photo_url: data.roadworthiness_photo_url || '',
          insurance_photo_url: data.insurance_photo_url || '',
          registration_photo_url: data.registration_photo_url || '',
        });
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async () => {
    if (!driver) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('foober_drivers').update({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      vehicle_type: form.vehicle_type,
      vehicle_registration: form.vehicle_registration,
      license_number: form.license_number,
      country: form.country,
      region: form.region,
      city: form.city,
      vehicle_make: form.vehicle_make || null,
      vehicle_model: form.vehicle_model || null,
      vehicle_year: form.vehicle_year ? Number(form.vehicle_year) : null,
      vehicle_color: form.vehicle_color || null,
      avatar_url: form.avatar_url,
      vehicle_photo_url: form.vehicle_photo_url,
      license_photo_url: form.license_photo_url || null,
      roadworthiness_photo_url: form.roadworthiness_photo_url || null,
      insurance_photo_url: form.insurance_photo_url || null,
      registration_photo_url: form.registration_photo_url || null,
      updated_at: new Date().toISOString(),
    }).eq('id', driver.id);
    setSaving(false);
    setToast(error ? { msg: error.message, type: 'error' } : { msg: 'Profile updated', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DB347]" /></div>;
  }

  if (!driver) {
    return <div className="text-center py-20 text-gray-500"><Truck className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>Driver profile not found</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-bold text-[#1B2A4A]">Driver Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Photo */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Profile Photo</label>
          <ImageUploader bucket="avatars" folder="drivers" value={form.avatar_url} onChange={(url) => setForm({ ...form, avatar_url: url })}  />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Vehicle Type</label>
            <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white">
              {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Vehicle Registration</label>
            <input value={form.vehicle_registration} onChange={(e) => setForm({ ...form, vehicle_registration: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="ABC 1234" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">License Number</label>
            <input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
            <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2"><Car className="w-4 h-4" /> Vehicle Details</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Make</label>
              <input value={form.vehicle_make} onChange={(e) => setForm({ ...form, vehicle_make: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Toyota" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Model</label>
              <input value={form.vehicle_model} onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Hilux" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Year</label>
              <input type="number" value={form.vehicle_year} onChange={(e) => setForm({ ...form, vehicle_year: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="2020" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Color</label>
              <input value={form.vehicle_color} onChange={(e) => setForm({ ...form, vehicle_color: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="White" />
            </div>
          </div>
        </div>

        {/* Vehicle Photo */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Vehicle Photo</label>
          <ImageUploader bucket="avatars" folder="vehicles" value={form.vehicle_photo_url} onChange={(url) => setForm({ ...form, vehicle_photo_url: url })} />
        </div>

        {/* Document Uploads */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-[#1B2A4A] mb-1">Documents</p>
          <p className="text-xs text-gray-400 mb-3">Upload photos of your documents for verification.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Driver&apos;s License</label>
              <ImageUploader bucket="avatars" folder="documents" value={form.license_photo_url} onChange={(url) => setForm({ ...form, license_photo_url: url })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Vehicle Registration</label>
              <ImageUploader bucket="avatars" folder="documents" value={form.registration_photo_url} onChange={(url) => setForm({ ...form, registration_photo_url: url })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Roadworthiness Certificate</label>
              <ImageUploader bucket="avatars" folder="documents" value={form.roadworthiness_photo_url} onChange={(url) => setForm({ ...form, roadworthiness_photo_url: url })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Vehicle Insurance</label>
              <ImageUploader bucket="avatars" folder="documents" value={form.insurance_photo_url} onChange={(url) => setForm({ ...form, insurance_photo_url: url })} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4a9a39] disabled:opacity-50 flex items-center gap-2 min-h-[44px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </div>
    </div>
  );
}
