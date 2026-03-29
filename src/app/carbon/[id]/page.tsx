'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BadgeCheck, MapPin, TreePine, Users, Leaf, Heart,
  Droplets, Globe, ExternalLink, Loader2, X, CheckCircle2, DollarSign, Award,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Demo data ────────────────────────────────────────────────────────────────

const demoCredit = {
  id: 'c1',
  serial_number: 'ACR-2025-0012',
  vintage_year: 2025,
  quantity: 450,
  status: 'listed',
  price_per_tonne: 18.5,
  project_id: 'p1',
  carbon_projects: {
    name: 'Chobe Agroforestry Initiative',
    description: 'A flagship agroforestry project integrating indigenous and fruit tree planting with smallholder crop farming across 480 hectares in the Chobe District. The project aims to sequester carbon, improve soil health, and diversify farmer income through fruit sales and timber products. Over 200 farmers have participated since inception, with 12,000 trees planted.',
    methodology: 'VM0042 - Methodology for Improved Agricultural Land Management',
    registry: 'Verra',
    country: 'Botswana',
    region: 'Chobe District',
    co_benefits: ['Biodiversity', 'Water Conservation', 'Community Development', 'Food Security'],
    eligible_practices: ['agroforestry', 'tree_planting', 'composting'],
    target_credits: 5000,
  },
};

const farmerStories = [
  { region: 'Chobe District', country: 'Botswana', hectares: 5, practice: 'conservation tillage', quote: 'Since joining the program, my soil has become richer and I earn extra income from carbon credits.' },
  { region: 'Mashonaland', country: 'Zimbabwe', hectares: 3, practice: 'agroforestry', quote: 'I planted fruit trees between my maize rows. Now I have shade, fruit, and carbon income.' },
  { region: 'Kilimanjaro', country: 'Tanzania', hectares: 2, practice: 'shade-grown coffee', quote: 'The shade trees protect my coffee plants and give me carbon credits too.' },
];

export default function CreditDetailPage() {
  const params = useParams();
  const creditId = params.id as string;
  const supabase = createClient();

  const [credit, setCredit] = useState<typeof demoCredit | null>(null);
  const [loading, setLoading] = useState(true);

  // Purchase form
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ buyer_name: '', buyer_email: '', buyer_company: '', quantity: 1, payment_method: 'bank_transfer' });
  const [purchasing, setPurchasing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const fetchCredit = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('carbon_credits')
          .select('*, carbon_projects(*)')
          .eq('id', creditId)
          .single();

        if (!error && data) {
          setCredit(data);
        } else {
          setCredit(demoCredit);
        }
      } catch {
        setCredit(demoCredit);
      }
      setLoading(false);
    };
    fetchCredit();
  }, [creditId, supabase]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credit) return;
    setPurchasing(true);
    try {
      const res = await fetch('/api/carbon/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit_id: credit.id, ...purchaseForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmation(data.message);
        setShowPurchase(false);
      } else {
        showToast('error', data.error || 'Purchase failed');
      }
    } catch {
      showToast('error', 'Network error');
    }
    setPurchasing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  if (!credit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Credit not found</p>
        <Link href="/carbon" className="text-[#5DB347] hover:underline mt-2 inline-block">Back to marketplace</Link>
      </div>
    );
  }

  const project = credit.carbon_projects;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}
          >{toast.message}</motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation */}
      <AnimatePresence>
        {confirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmation(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#5DB347]" />
              </div>
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">Purchase Confirmed!</h3>
              <p className="text-sm text-gray-600 mb-6">{confirmation}</p>
              <Link href="/carbon" className="inline-block px-6 py-2.5 rounded-xl text-white font-medium text-sm" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                Back to Marketplace
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/carbon" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5DB347] transition">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  project?.registry === 'Verra' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{project?.registry}</span>
                <span className="text-xs text-gray-400">{credit.serial_number}</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">{project?.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project?.country}{project?.region ? `, ${project.region}` : ''}</span>
                <span className="flex items-center gap-1"><BadgeCheck className="w-4 h-4" />Vintage {credit.vintage_year}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-[#1B2A4A] mb-3">About This Project</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{project?.description}</p>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-[#1B2A4A] mb-3">Methodology & Certification</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Methodology</span><span className="font-medium">{project?.methodology}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Registry</span><span className="font-medium">{project?.registry}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Vintage Year</span><span className="font-medium">{credit.vintage_year}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Serial Number</span><span className="font-mono text-[#5DB347]">{credit.serial_number}</span></div>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-sm text-[#5DB347] hover:underline mt-4">
                View on Registry <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Co-Benefits */}
            {project?.co_benefits && project.co_benefits.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-semibold text-[#1B2A4A] mb-3">Co-Benefits</h2>
                <div className="grid grid-cols-2 gap-3">
                  {project.co_benefits.map(b => {
                    const icons: Record<string, typeof TreePine> = { Biodiversity: TreePine, Water: Droplets, 'Water Conservation': Droplets, 'Water Retention': Droplets, Community: Users, 'Community Development': Users, 'Food Security': Heart, 'Clean Energy': Leaf, Health: Heart, Livelihoods: Users, 'Soil Health': Leaf, 'Soil Fertility': Leaf, 'Waste Reduction': Leaf, 'Erosion Prevention': Globe };
                    const Icon = icons[b] || Award;
                    return (
                      <div key={b} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                        <Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-purple-700">{b}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Farmer Stories */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-[#1B2A4A] mb-4">Farmer Stories</h2>
              <div className="space-y-4">
                {farmerStories.map((story, i) => (
                  <div key={i} className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-gray-600 italic mb-2">&ldquo;{story.quote}&rdquo;</p>
                    <p className="text-xs text-gray-500">
                      &mdash; Farmer in {story.region}, {story.country} &mdash; {story.hectares}ha of {story.practice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-[#1B2A4A] mb-3">Project Region</h2>
              <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{project?.country}{project?.region ? ` - ${project.region}` : ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-[#5DB347]">${credit.price_per_tonne}</p>
                  <p className="text-sm text-gray-500">per tonne CO\u2082</p>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-500">Available</span><span className="font-medium">{credit.quantity} tonnes</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium capitalize">{credit.status}</span></div>
                </div>
                {showPurchase ? (
                  <form onSubmit={handlePurchase} className="space-y-3">
                    <input required type="text" value={purchaseForm.buyer_name} onChange={e => setPurchaseForm(f => ({ ...f, buyer_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5DB347]" placeholder="Full Name *" />
                    <input required type="email" value={purchaseForm.buyer_email} onChange={e => setPurchaseForm(f => ({ ...f, buyer_email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5DB347]" placeholder="Email *" />
                    <input type="text" value={purchaseForm.buyer_company} onChange={e => setPurchaseForm(f => ({ ...f, buyer_company: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5DB347]" placeholder="Company (optional)" />
                    <input required type="number" min={1} max={credit.quantity} value={purchaseForm.quantity} onChange={e => setPurchaseForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5DB347]" />
                    <select value={purchaseForm.payment_method} onChange={e => setPurchaseForm(f => ({ ...f, payment_method: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#5DB347]">
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="card">Card</option>
                      <option value="crypto">Crypto</option>
                    </select>
                    <div className="bg-gray-50 rounded-xl p-3 text-sm"><div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-[#5DB347]">${(purchaseForm.quantity * credit.price_per_tonne).toFixed(2)}</span></div></div>
                    <button type="submit" disabled={purchasing} className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
                      {purchasing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Purchase'}
                    </button>
                    <button type="button" onClick={() => setShowPurchase(false)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowPurchase(true)}
                    className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                  >
                    Buy Credits
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <p className="text-xs text-gray-500">Verified by</p>
                <p className="font-semibold text-[#1B2A4A]">{project?.registry}</p>
                <p className="text-xs text-gray-400 mt-1">All credits are independently verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
