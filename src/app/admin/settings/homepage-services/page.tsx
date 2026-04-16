'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Pencil, Upload, X } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/ui/ImageUploader';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

interface ServiceCard {
  title: string;
  desc: string;
  link: string;
  img: string;
  icon?: string;
}

const DEFAULT_SERVICES: ServiceCard[] = [
  { title: 'Financing', desc: 'Working capital, invoice finance, and crop financing from smallholder to commercial scale.', link: '/services/financing', img: '' },
  { title: 'Inputs & Equipment', desc: 'Tractors, drones, irrigation, seeds, and fertilizers. Bulk procurement at better prices.', link: '/services/inputs', img: '' },
  { title: 'Processing Hubs', desc: 'Milling, drying, cold chain, and packaging. Value-addition at source.', link: '/services/processing', img: '' },
  { title: 'Guaranteed Offtake', desc: 'Pre-arranged buyers and distribution. No more selling cheap or wasting crops.', link: '/services/offtake', img: '' },
  { title: 'Trade Finance', desc: 'SBLCs, Letters of Credit, export pre-financing, and FX services via our banking partners.', link: '/services/trade-finance', img: '' },
  { title: 'Training & Certification', desc: 'Vocational partnerships to build scalable farmer capacity, compliance, and export readiness.', link: '/services/training', img: '' },
];

export default function HomepageServicesEditor() {
  const supabase = createClient();
  const [services, setServices] = useState<ServiceCard[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showImagePicker, setShowImagePicker] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('site_config').select('value').eq('key', 'homepage_services').maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(parsed) && parsed.length > 0) setServices(parsed);
        }
        setLoading(false);
      });
  }, [supabase]);

  const save = async (updated: ServiceCard[]) => {
    setSaving(true);
    const { error } = await supabase.from('site_config').upsert({
      key: 'homepage_services',
      value: JSON.stringify(updated),
      value_type: 'json',
      category: 'homepage',
      label: 'Homepage Service Cards',
      description: 'The 6 service cards on the homepage with images',
    }, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      setToast({ message: 'Failed to save', type: 'error' });
    } else {
      setServices(updated);
      setToast({ message: 'Services saved! Refresh the homepage to see changes.', type: 'success' });
    }
  };

  const updateField = (index: number, field: keyof ServiceCard, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Homepage Service Cards</h1>
            <p className="text-sm text-gray-500 mt-1">Edit the 6 service cards shown on the homepage. Click an image to change it.</p>
          </div>
          <button onClick={() => save(services)} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] transition-colors shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Image */}
            <div className="relative h-40 bg-gray-100 group cursor-pointer" onClick={() => setShowImagePicker(i)}>
              {svc.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">Click to change image</span>
              </div>
            </div>

            {/* Fields */}
            <div className="p-4 space-y-3">
              {editingIndex === i ? (
                <>
                  <input value={svc.title} onChange={(e) => updateField(i, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#1B2A4A] focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none" />
                  <textarea value={svc.desc} onChange={(e) => updateField(i, 'desc', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none resize-none" />
                  <input value={svc.link} onChange={(e) => updateField(i, 'link', e.target.value)} placeholder="/services/..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none" />
                  <button onClick={() => setEditingIndex(null)} className="text-xs text-[#5DB347] font-medium hover:underline">Done editing</button>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-[#1B2A4A] text-sm">{svc.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{svc.desc}</p>
                  <button onClick={() => setEditingIndex(i)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#5DB347]">
                    <Pencil className="w-3 h-3" /> Edit text
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image picker modal */}
      {showImagePicker !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Choose Image for {services[showImagePicker]?.title}</h2>
              <button onClick={() => setShowImagePicker(null)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <ImageUploader
              value={services[showImagePicker]?.img || ''}
              onChange={(url) => {
                const updated = [...services];
                updated[showImagePicker!] = { ...updated[showImagePicker!], img: url };
                setServices(updated);
                setShowImagePicker(null);
              }}
              bucket="media"
              folder="homepage"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or paste image URL directly</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={services[showImagePicker]?.img || ''}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = (e.target as HTMLInputElement).value;
                      if (url) {
                        updateField(showImagePicker!, 'img', url);
                        setShowImagePicker(null);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="https://..."]') as HTMLInputElement;
                    if (input?.value) {
                      updateField(showImagePicker!, 'img', input.value);
                      setShowImagePicker(null);
                    }
                  }}
                  className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium"
                >
                  Use URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
