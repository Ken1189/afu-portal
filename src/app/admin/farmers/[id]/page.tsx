'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, Shield, Banknote,
  Leaf, TrendingUp, Users, Eye, Send, X, AlertTriangle, CheckCircle2,
  Clock, CreditCard, FileText, User, Award, Loader2, ExternalLink,
  MessageSquare, ChevronRight, Hash, Languages, Bell, Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

/* ── Types ── */
interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: string;
  country: string;
  region?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
  preferred_language?: string;
  currency?: string;
  membership_tier?: string;
  status?: string;
  onboarding_completed?: boolean;
  onboarded_at?: string;
  onboarding_metadata?: Record<string, unknown>;
  referral_code?: string;
  company_name?: string;
  credit_score_updated_at?: string;
  tier_upgrade_requested?: boolean;
  notification_preferences?: { email?: boolean; sms?: boolean; push?: boolean };
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

interface FarmPlot {
  id: string;
  name: string;
  crop_type: string;
  size_hectares: number;
  health_score: number;
  location?: string;
  soil_type?: string;
  irrigation_type?: string;
  created_at?: string;
}

interface Loan {
  id: string;
  amount: number;
  status: string;
  loan_type?: string;
  interest_rate?: number;
  term_months?: number;
  created_at?: string;
  approved_at?: string;
  disbursed_at?: string;
  currency?: string;
}

interface InsurancePolicy {
  id: string;
  status: string;
  policy_type?: string;
  coverage_amount?: number;
  premium?: number;
  start_date?: string;
  end_date?: string;
}

interface MembershipApp {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  farm_name?: string;
  farm_size_ha?: number;
  primary_crops?: string[];
  requested_tier: string;
  status: string;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
  application_type?: string;
}

interface PublicProfile {
  id: string;
  display_name: string;
  story?: string;
  farm_description?: string;
  hero_photo_url?: string;
  country: string;
  region?: string;
  crops?: string[];
  farm_size_ha?: number;
  family_members_supported?: number;
  years_farming?: number;
  is_featured?: boolean;
  monthly_funding_needed?: number;
  monthly_funding_received?: number;
  total_sponsors?: number;
}

interface CreditScore {
  id: string;
  score: number;
  risk_level?: string;
  updated_at?: string;
}

interface Notification {
  id: string;
  title: string;
  body?: string;
  message?: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

/* ── Helpers ── */
const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  smallholder: 'bg-green-100 text-green-700',
  commercial: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
  cooperative: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  suspended: 'bg-red-100 text-red-600',
  disbursed: 'bg-blue-100 text-blue-700',
  repaid: 'bg-teal-100 text-teal-700',
  expired: 'bg-gray-100 text-gray-600',
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const formatDateTime = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

/* ── Main Page ── */
export default function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [insurance, setInsurance] = useState<InsurancePolicy[]>([]);
  const [application, setApplication] = useState<MembershipApp | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [kycStatus, setKycStatus] = useState<string>('unknown');

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      setProfile(p);

      if (!p) { setLoading(false); return; }

      // All queries in parallel
      const [plotsRes, loansRes, insRes, appRes, pubRes, creditRes, notifsRes, kycRes] = await Promise.allSettled([
        supabase.from('farm_plots').select('*').eq('member_id', id).order('created_at', { ascending: false }),
        supabase.from('loans').select('*').eq('member_id', id).order('created_at', { ascending: false }),
        supabase.from('insurance_policies').select('*').eq('member_id', id),
        supabase.from('membership_applications').select('*').eq('email', p.email).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('farmer_public_profiles').select('*').eq('member_id', id).maybeSingle(),
        supabase.from('credit_scores').select('*').eq('member_id', id).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('notifications').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
        supabase.from('kyc_verifications').select('status').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      if (plotsRes.status === 'fulfilled') setPlots(plotsRes.value.data || []);
      if (loansRes.status === 'fulfilled') setLoans(loansRes.value.data || []);
      if (insRes.status === 'fulfilled') setInsurance(insRes.value.data || []);
      if (appRes.status === 'fulfilled') setApplication(appRes.value.data || null);
      if (pubRes.status === 'fulfilled') setPublicProfile(pubRes.value.data || null);
      if (creditRes.status === 'fulfilled') setCreditScore(creditRes.value.data || null);
      if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data || []);
      if (kycRes.status === 'fulfilled') setKycStatus(kycRes.value.data?.status || 'not_submitted');
    } catch (err) {
      console.error('[farmer-detail] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSendMessage = async () => {
    if (!profile || !messageText.trim()) return;
    try {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Message from Admin',
        body: messageText,
        type: 'admin_message',
        is_read: false,
      });
      showToast('Message sent');
    } catch {
      showToast('Failed to send message', 'error');
    }
    setMessageOpen(false);
    setMessageText('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2A4A]">Farmer Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">This profile does not exist or has been removed.</p>
        <Link href="/admin/farmers" className="mt-4 inline-flex items-center gap-2 text-[#5DB347] hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Farmers
        </Link>
      </div>
    );
  }

  const totalFarmSize = plots.reduce((a, p) => a + p.size_hectares, 0);
  const activeLoans = loans.filter(l => ['active', 'disbursed', 'approved'].includes(l.status));
  const totalLoanAmount = activeLoans.reduce((a, l) => a + l.amount, 0);
  const allCrops = [...new Set(plots.map(p => p.crop_type))];
  const avgHealth = plots.length > 0 ? Math.round(plots.reduce((a, p) => a + p.health_score, 0) / plots.length) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/farmers" className="hover:text-[#5DB347] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Farmers
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1B2A4A] font-medium">{profile.full_name}</span>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2A3A5C] px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white/80">
                  {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierColors[profile.membership_tier || 'free']}`}>
                  {profile.membership_tier || 'free'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[profile.status || 'active']}`}>
                  {profile.status || 'active'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-2">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile.email}</span>
                {profile.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{profile.phone}</span>}
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{profile.region ? `${profile.region}, ` : ''}{profile.country}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setMessageOpen(true); setMessageText(''); }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
              <Link href={`/farm`} target="_blank"
                className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> View Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 divide-x divide-gray-100 border-t border-gray-100">
          {[
            { label: 'Farm Size', value: totalFarmSize > 0 ? `${totalFarmSize.toFixed(1)} ha` : '-', icon: Leaf, color: 'text-[#5DB347]' },
            { label: 'Plots', value: String(plots.length), icon: FileText, color: 'text-blue-600' },
            { label: 'Active Loans', value: activeLoans.length > 0 ? `$${totalLoanAmount.toLocaleString()}` : 'None', icon: Banknote, color: 'text-indigo-600' },
            { label: 'Insurance', value: `${insurance.length} polic${insurance.length === 1 ? 'y' : 'ies'}`, icon: Shield, color: 'text-teal-600' },
            { label: 'KYC', value: kycStatus === 'approved' ? 'Verified' : kycStatus === 'not_submitted' ? 'Not Submitted' : kycStatus, icon: CheckCircle2, color: kycStatus === 'approved' ? 'text-green-600' : 'text-amber-600' },
            { label: 'Credit Score', value: creditScore ? String(creditScore.score) : '-', icon: TrendingUp, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="px-4 py-4 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-bold text-[#1B2A4A]">{stat.value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Farm Plots */}
          <section className="bg-white border border-gray-100 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#5DB347]" /> Farm Plots ({plots.length})
              </h2>
              {allCrops.length > 0 && (
                <span className="text-xs text-gray-400">Crops: {allCrops.join(', ')}</span>
              )}
            </div>
            {plots.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {plots.map(p => (
                  <div key={p.id} className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1B2A4A]">{p.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span>Crop: <strong>{p.crop_type}</strong></span>
                        <span>Size: <strong>{p.size_hectares} ha</strong></span>
                        {p.soil_type && <span>Soil: {p.soil_type}</span>}
                        {p.irrigation_type && <span>Irrigation: {p.irrigation_type}</span>}
                        {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-sm font-bold ${p.health_score >= 80 ? 'text-green-600' : p.health_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {p.health_score}%
                        </span>
                        <p className="text-[10px] text-gray-400">Health</p>
                      </div>
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.health_score >= 80 ? 'bg-green-400' : p.health_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${p.health_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No farm plots registered</div>
            )}
            {avgHealth > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                <span className="text-gray-400">Average Health Score</span>
                <span className={`font-bold ${avgHealth >= 80 ? 'text-green-600' : avgHealth >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {avgHealth}%
                </span>
              </div>
            )}
          </section>

          {/* Loans */}
          <section className="bg-white border border-gray-100 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <Banknote className="w-4 h-4 text-indigo-500" /> Loans ({loans.length})
              </h2>
            </div>
            {loans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Amount</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Type</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Rate</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Term</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loans.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-[#1B2A4A]">
                          {l.currency || '$'}{l.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{l.loan_type || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{l.interest_rate ? `${l.interest_rate}%` : '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{l.term_months ? `${l.term_months}mo` : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[l.status] || 'bg-gray-100 text-gray-600'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(l.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No loan history</div>
            )}
          </section>

          {/* Insurance */}
          {insurance.length > 0 && (
            <section className="bg-white border border-gray-100 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-500" /> Insurance Policies ({insurance.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {insurance.map(i => (
                  <div key={i.id} className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{i.policy_type || 'Policy'}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        {i.coverage_amount && <span>Coverage: ${i.coverage_amount.toLocaleString()}</span>}
                        {i.premium && <span>Premium: ${i.premium.toLocaleString()}</span>}
                        {i.start_date && <span>From: {formatDate(i.start_date)}</span>}
                        {i.end_date && <span>To: {formatDate(i.end_date)}</span>}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[i.status] || 'bg-gray-100 text-gray-600'}`}>
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Activity / Notifications */}
          <section className="bg-white border border-gray-100 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Recent Activity ({notifications.length})
              </h2>
            </div>
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="px-5 py-3 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-gray-200' : 'bg-[#5DB347]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1B2A4A]">{n.title}</p>
                      {(n.body || n.message) && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body || n.message}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">{formatDateTime(n.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No activity yet</div>
            )}
          </section>
        </div>

        {/* Right Column — Sidebar Info */}
        <div className="space-y-6">

          {/* Account Details */}
          <section className="bg-white border border-gray-100 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" /> Account Details
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <InfoRow icon={Hash} label="ID" value={profile.id} copyable onCopy={() => copyToClipboard(profile.id)} />
              <InfoRow icon={Mail} label="Email" value={profile.email} copyable onCopy={() => copyToClipboard(profile.email)} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone || '-'} />
              <InfoRow icon={Globe} label="Country" value={profile.country} />
              <InfoRow icon={MapPin} label="Region" value={profile.region || '-'} />
              {profile.address && <InfoRow icon={MapPin} label="Address" value={profile.address} />}
              <InfoRow icon={Languages} label="Language" value={profile.preferred_language || 'en'} />
              <InfoRow icon={CreditCard} label="Currency" value={profile.currency || 'USD'} />
              {profile.referral_code && (
                <InfoRow icon={Users} label="Referral Code" value={profile.referral_code} copyable onCopy={() => copyToClipboard(profile.referral_code!)} />
              )}
              {profile.company_name && <InfoRow icon={Award} label="Company" value={profile.company_name} />}
            </div>
          </section>

          {/* Onboarding & Membership */}
          <section className="bg-white border border-gray-100 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#5DB347]" /> Membership & Onboarding
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tier</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[profile.membership_tier || 'free']}`}>
                  {profile.membership_tier || 'free'}
                </span>
              </div>
              {profile.tier_upgrade_requested && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-amber-800 font-medium">Tier upgrade requested</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Onboarded</span>
                <span className="flex items-center gap-1">
                  {profile.onboarded_at ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-green-700">{formatDate(profile.onboarded_at)}</span></>
                  ) : (
                    <><Clock className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs text-amber-700">Not completed</span></>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">KYC Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  kycStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {kycStatus === 'not_submitted' ? 'Not Submitted' : kycStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="text-xs text-[#1B2A4A] font-medium">{formatDate(profile.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-xs text-gray-600">{formatDateTime(profile.updated_at)}</span>
              </div>
              {/* Notification Preferences */}
              {profile.notification_preferences && (
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Notifications</span>
                  <div className="flex gap-2">
                    {(['email', 'sms', 'push'] as const).map(ch => (
                      <span key={ch} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        profile.notification_preferences?.[ch] ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>{ch.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.capabilities && profile.capabilities.length > 0 && (
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Capabilities</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.capabilities.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Membership Application */}
          {application && (
            <section className="bg-white border border-gray-100 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Application
                </h2>
              </div>
              <div className="px-5 py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[application.status]}`}>{application.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested Tier</span>
                  <span className="text-xs font-medium text-[#1B2A4A]">{application.requested_tier}</span>
                </div>
                {application.farm_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Farm Name</span>
                    <span className="text-xs font-medium text-[#1B2A4A]">{application.farm_name}</span>
                  </div>
                )}
                {application.farm_size_ha && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Farm Size (app)</span>
                    <span className="text-xs font-medium text-[#1B2A4A]">{application.farm_size_ha} ha</span>
                  </div>
                )}
                {application.primary_crops && application.primary_crops.length > 0 && (
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">Crops Listed</span>
                    <div className="flex flex-wrap gap-1">
                      {application.primary_crops.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {application.notes && (
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">Notes</span>
                    <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 leading-relaxed">{application.notes}</p>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-400 pt-1">
                  <span>Applied: {formatDate(application.created_at)}</span>
                  {application.reviewed_at && <span>Reviewed: {formatDate(application.reviewed_at)}</span>}
                </div>
              </div>
            </section>
          )}

          {/* Public Profile */}
          {publicProfile && (
            <section className="bg-white border border-gray-100 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#5DB347]" /> Public Sponsor Profile
                </h2>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {publicProfile.hero_photo_url && (
                  <img src={publicProfile.hero_photo_url} alt="" className="w-full h-32 object-cover rounded-lg" />
                )}
                <p className="font-semibold text-[#1B2A4A]">{publicProfile.display_name}</p>
                {publicProfile.story && (
                  <p className="text-xs text-gray-500 line-clamp-3">{publicProfile.story}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {publicProfile.years_farming && (
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-[#1B2A4A]">{publicProfile.years_farming}</p>
                      <p className="text-gray-400">Years Farming</p>
                    </div>
                  )}
                  {publicProfile.family_members_supported && (
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-[#1B2A4A]">{publicProfile.family_members_supported}</p>
                      <p className="text-gray-400">Family Supported</p>
                    </div>
                  )}
                  {publicProfile.total_sponsors != null && (
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-[#1B2A4A]">{publicProfile.total_sponsors}</p>
                      <p className="text-gray-400">Sponsors</p>
                    </div>
                  )}
                  {publicProfile.monthly_funding_received != null && publicProfile.monthly_funding_needed != null && (
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-[#1B2A4A]">${publicProfile.monthly_funding_received}/{publicProfile.monthly_funding_needed}</p>
                      <p className="text-gray-400">Funding $/mo</p>
                    </div>
                  )}
                </div>
                {publicProfile.is_featured && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full font-medium">
                    <Award className="w-3 h-3" /> Featured Farmer
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Credit Score */}
          {creditScore && (
            <section className="bg-white border border-gray-100 rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" /> Credit Score
                </h2>
              </div>
              <div className="px-5 py-4 text-center">
                <p className={`text-4xl font-bold ${
                  creditScore.score >= 700 ? 'text-green-600' :
                  creditScore.score >= 500 ? 'text-yellow-600' : 'text-red-600'
                }`}>{creditScore.score}</p>
                {creditScore.risk_level && (
                  <p className="text-xs text-gray-500 mt-1">Risk: {creditScore.risk_level}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">Updated: {formatDateTime(creditScore.updated_at)}</p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Send Message Modal */}
      <AnimatePresence>
        {messageOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1B2A4A]">Send Message</h3>
                <button onClick={() => setMessageOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">To: <strong>{profile.full_name}</strong> ({profile.email})</p>
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setMessageOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="flex-1 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Info Row Component ── */
function InfoRow({ icon: Icon, label, value, copyable, onCopy }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-gray-500 shrink-0">
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <span className="text-xs text-[#1B2A4A] font-medium truncate max-w-[180px] flex items-center gap-1">
        {value}
        {copyable && onCopy && (
          <button onClick={onCopy} className="text-gray-300 hover:text-[#5DB347]">
            <Copy className="w-3 h-3" />
          </button>
        )}
      </span>
    </div>
  );
}
