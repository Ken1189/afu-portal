'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/auth-context';
import { calculateFee, haversineDistance, suggestVehicle, type VehicleType, type PackageSize } from '@/lib/foober-pricing';
import {
  MapPin, Package, Truck, DollarSign, ArrowLeft, Loader2,
  CheckCircle, AlertCircle, ArrowRight, Scale,
} from 'lucide-react';

const PACKAGE_SIZES: { value: PackageSize; label: string; desc: string }[] = [
  { value: 'small', label: 'Small', desc: 'Documents, small parcels (up to 5kg)' },
  { value: 'medium', label: 'Medium', desc: 'Standard packages (5-25kg)' },
  { value: 'large', label: 'Large', desc: 'Bulk goods, equipment (25-100kg)' },
  { value: 'extra_large', label: 'Extra Large', desc: 'Heavy cargo, commodities (100kg+)' },
];

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van / Pickup' },
  { value: 'truck', label: 'Truck' },
];

export default function FooberRequestPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    pickupAddress: '', dropoffAddress: '', description: '',
    packageSize: 'medium' as PackageSize,
    weightKg: '', vehicleType: '' as VehicleType | '',
    notes: '', distanceKm: '',
  });
  const [estimate, setEstimate] = useState<ReturnType<typeof calculateFee> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [error, setError] = useState('');

  const handleEstimate = () => {
    const dist = Number(form.distanceKm) || 10;
    const weight = Number(form.weightKg) || undefined;
    const vehicle = (form.vehicleType as VehicleType) || suggestVehicle(form.packageSize, weight);
    const est = calculateFee(dist, vehicle, form.packageSize);
    setEstimate(est);
    if (!form.vehicleType) setForm({ ...form, vehicleType: vehicle });
  };

  const handleSubmit = async () => {
    if (!user) { setError('Please log in to request a delivery'); return; }
    if (!form.pickupAddress || !form.dropoffAddress) { setError('Pickup and dropoff addresses are required'); return; }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/foober/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupAddress: form.pickupAddress,
          dropoffAddress: form.dropoffAddress,
          description: form.description || undefined,
          packageSize: form.packageSize,
          weightKg: Number(form.weightKg) || undefined,
          vehicleType: form.vehicleType || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create request'); return; }
      setSuccess(true);
      setDeliveryNumber(data.delivery?.delivery_number || '');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <CheckCircle className="w-16 h-16 text-[#5DB347] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Delivery Requested!</h1>
          {deliveryNumber && <p className="text-sm text-gray-500 mb-2">Tracking: <span className="font-mono font-bold">{deliveryNumber}</span></p>}
          <p className="text-gray-600 mb-6">A Foober driver will accept your request shortly. You will be notified when a driver is on the way.</p>
          <Link href="/foober" className="text-[#5DB347] font-medium hover:underline">Back to Foober</Link>
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
              <h1 className="text-xl font-bold text-[#1B2A4A]">Request a Delivery</h1>
              <p className="text-sm text-gray-500">Fill in the details and we will match you with a driver</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {!user && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm mb-4">
              You need to <Link href="/login?redirect=/foober/request" className="font-medium underline">log in</Link> to request a delivery.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Pickup Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <input value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. 123 Main St, Harare" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Dropoff Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. 456 Farm Rd, Mashonaland East" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">What are you delivering?</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. 50kg bag of fertilizer, farm equipment, etc." />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Package Size</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PACKAGE_SIZES.map((s) => (
                  <button key={s.value} onClick={() => { setForm({ ...form, packageSize: s.value }); setEstimate(null); }}
                    className={`p-3 rounded-xl text-left border transition-colors ${form.packageSize === s.value ? 'border-[#5DB347] bg-[#5DB347]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className="text-sm font-medium text-[#1B2A4A]">{s.label}</p>
                    <p className="text-[10px] text-gray-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" value={form.weightKg} onChange={(e) => { setForm({ ...form, weightKg: e.target.value }); setEstimate(null); }} className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vehicle Preference</label>
                <select value={form.vehicleType} onChange={(e) => { setForm({ ...form, vehicleType: e.target.value as VehicleType }); setEstimate(null); }} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white">
                  <option value="">Auto-select</option>
                  {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Est. Distance (km)</label>
                <input type="number" value={form.distanceKm} onChange={(e) => { setForm({ ...form, distanceKm: e.target.value }); setEstimate(null); }} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="e.g. 15" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes for Driver</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Any special instructions..." />
            </div>

            {/* Estimate */}
            {!estimate && (
              <button onClick={handleEstimate} className="w-full py-2.5 rounded-xl border-2 border-[#5DB347] text-[#5DB347] font-medium text-sm hover:bg-[#5DB347]/5 transition-colors">
                <DollarSign className="w-4 h-4 inline mr-1" /> Get Price Estimate
              </button>
            )}

            {estimate && (
              <div className="bg-[#5DB347]/5 border border-[#5DB347]/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#5DB347] mb-2">Estimated Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1B2A4A]">${estimate.fee.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{estimate.distanceKm.toFixed(1)} km via {estimate.vehicleType}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Driver earns ${estimate.driverPayout.toFixed(2)} — Platform fee ${estimate.platformCommission.toFixed(2)}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !user || !form.pickupAddress || !form.dropoffAddress}
              className="w-full py-3 rounded-xl bg-[#5DB347] text-white font-semibold text-sm hover:bg-[#4a9a39] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Truck className="w-4 h-4" /> Request Delivery</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
