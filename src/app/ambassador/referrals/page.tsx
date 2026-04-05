'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Copy,
  Check,
  Filter,
  UserPlus,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  BarChart3,
  MousePointerClick,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface Referral {
  id: string;
  referred_name: string;
  referred_email: string;
  signed_up_date: string;
  status: string;
  lifetime_value: number;
  commission_earned: number;
}

interface ReferralLink {
  id: string;
  code: string;
  clicks: number;
  conversions: number;
  created_at: string;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

const FALLBACK_REFERRALS: Referral[] = [
  { id: '1', referred_name: 'John Mwangi', referred_email: 'john@farm.co.ke', signed_up_date: '2026-03-20T00:00:00Z', status: 'active', lifetime_value: 2500, commission_earned: 250 },
  { id: '2', referred_name: 'Sarah Kimani', referred_email: 'sarah.k@gmail.com', signed_up_date: '2026-03-15T00:00:00Z', status: 'active', lifetime_value: 1200, commission_earned: 120 },
  { id: '3', referred_name: 'Peter Obi', referred_email: 'peter.obi@agri.ng', signed_up_date: '2026-03-10T00:00:00Z', status: 'active', lifetime_value: 800, commission_earned: 80 },
  { id: '4', referred_name: 'Grace Achieng', referred_email: 'grace@coopke.org', signed_up_date: '2026-03-05T00:00:00Z', status: 'active', lifetime_value: 3200, commission_earned: 320 },
  { id: '5', referred_name: 'David Banda', referred_email: 'dbanda@farming.mw', signed_up_date: '2026-02-28T00:00:00Z', status: 'pending', lifetime_value: 0, commission_earned: 0 },
  { id: '6', referred_name: 'Amina Hassan', referred_email: 'amina.h@tz-ag.co', signed_up_date: '2026-02-20T00:00:00Z', status: 'active', lifetime_value: 1800, commission_earned: 180 },
  { id: '7', referred_name: 'Emmanuel Kwame', referred_email: 'ekwame@farmgh.com', signed_up_date: '2026-02-15T00:00:00Z', status: 'inactive', lifetime_value: 400, commission_earned: 40 },
  { id: '8', referred_name: 'Fatima Diallo', referred_email: 'fatima.d@senag.sn', signed_up_date: '2026-02-10T00:00:00Z', status: 'active', lifetime_value: 950, commission_earned: 95 },
  { id: '9', referred_name: 'Moses Okello', referred_email: 'mokello@ug-farms.co', signed_up_date: '2026-01-28T00:00:00Z', status: 'active', lifetime_value: 2100, commission_earned: 210 },
  { id: '10', referred_name: 'Blessing Chikwere', referred_email: 'bchikwere@zimag.co.zw', signed_up_date: '2026-01-15T00:00:00Z', status: 'pending', lifetime_value: 0, commission_earned: 0 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomString(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>(FALLBACK_REFERRALS);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const code = user.id.slice(0, 8).toUpperCase();
    setReferralCode(code);

    const supabase = createClient();

    async function fetchData() {
      try {
        const { data: ambassador } = await supabase
          .from('ambassadors')
          .select('id, referral_code')
          .eq('user_id', user!.id)
          .single();

        if (ambassador) {
          setAmbassadorId(ambassador.id);
          if (ambassador.referral_code) setReferralCode(ambassador.referral_code);

          // Fetch referral links (people who signed up via this ambassador)
          const { data: links } = await supabase
            .from('referral_links')
            .select('*')
            .eq('ambassador_id', ambassador.id)
            .order('created_at', { ascending: false });

          if (links && links.length > 0) {
            setReferralLinks(links.map((l: Record<string, unknown>) => ({
              id: String(l.id),
              code: String(l.referral_code || l.code || ''),
              clicks: 0,
              conversions: 1,
              created_at: String(l.created_at || l.signed_up_at),
            })));
          }

          // Use same data for referrals list
          const refs = links;

          // Map referral_links to referral people
          if (refs && refs.length > 0) {
            const referralPeople = [];
            for (const r of refs as Record<string, unknown>[]) {
              // Try to look up the referred user's profile
              let name = 'Referred User';
              let email = '';
              if (r.referred_user_id) {
                const { data: prof } = await supabase.from('profiles').select('full_name, email').eq('id', String(r.referred_user_id)).single();
                if (prof) { name = prof.full_name || name; email = prof.email || ''; }
              }
              referralPeople.push({
                id: String(r.id),
                referred_name: name,
                referred_email: email,
                signed_up_date: String(r.signed_up_at || r.created_at),
                status: String(r.status || 'active'),
                lifetime_value: Number(r.lifetime_value || 0),
                commission_earned: Number(r.total_commission_earned || 0),
              });
            }
            setReferrals(referralPeople);
          }
        }
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const generateNewLink = async () => {
    if (!ambassadorId) return;
    setGenerating(true);

    const code = `AFU-${randomString(8)}`;
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('referral_links')
        .insert({
          ambassador_id: ambassadorId,
          code,
          clicks: 0,
          conversions: 0,
        })
        .select()
        .single();

      if (!error && data) {
        setReferralLinks((prev) => [
          {
            id: String(data.id),
            code: String(data.code),
            clicks: 0,
            conversions: 0,
            created_at: String(data.created_at),
          },
          ...prev,
        ]);
      }
    } catch {
      // silent
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async (code: string) => {
    const link = `https://africanfarmingunion.org/join?ref=${code}`;
    await navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCopyMainLink = async () => {
    await navigator.clipboard.writeText(`https://africanfarmingunion.org/apply?ref=${referralCode}`);
    setCopied('main');
    setTimeout(() => setCopied(''), 2000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filtered = referrals.filter((r) => {
    const matchesSearch = r.referred_name.toLowerCase().includes(search.toLowerCase()) ||
      r.referred_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-50 text-green-700',
      pending: 'bg-amber-50 text-amber-700',
      inactive: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Referrals</h1>
          <p className="text-gray-500 text-sm mt-1">Track the people you have referred to AFU.</p>
        </div>
      </div>

      {/* Main Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3f6e] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-5 h-5 text-[#5DB347]" />
          <h2 className="font-semibold">Your Referral Link</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">Share this unique link. Anyone who signs up through it will be tracked as your referral.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate">
            africanfarmingunion.org/apply?ref={referralCode}
          </div>
          <button
            onClick={handleCopyMainLink}
            className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              copied === 'main' ? 'bg-green-500' : 'bg-[#5DB347] hover:bg-[#4ea03c]'
            }`}
          >
            {copied === 'main' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'main' ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </motion.div>

      {/* Generated Referral Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-[#1B2A4A]" />
            <h2 className="font-semibold text-[#1B2A4A]">Campaign Links</h2>
            <span className="text-xs text-gray-400 ml-1">
              {referralLinks.length} link{referralLinks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={generateNewLink}
            disabled={generating || !ambassadorId}
            className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#4ea03c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {generating ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Generate New Link
          </button>
        </div>

        {referralLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No campaign links yet. Generate one to start tracking specific campaigns.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referralLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-[#1B2A4A] truncate">
                    africanfarmingunion.org/join?ref={link.code}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created {formatDate(link.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span className="font-medium">{link.clicks}</span> clicks
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span className="font-medium">{link.conversions}</span> conversions
                  </div>
                  <button
                    onClick={() => handleCopyLink(link.code)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      copied === link.code
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#5DB347]/10 text-[#5DB347] hover:bg-[#5DB347]/20'
                    }`}
                  >
                    {copied === link.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === link.code ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Referrals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Signed Up</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Lifetime Value</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Commission</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No referrals found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#1B2A4A]">{r.referred_name}</td>
                    <td className="px-5 py-3 text-gray-500">{r.referred_email}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(r.signed_up_date)}</td>
                    <td className="px-5 py-3">{statusBadge(r.status)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#1B2A4A]">{formatCurrency(r.lifetime_value)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#5DB347]">{formatCurrency(r.commission_earned)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {referrals.length} referrals
        </div>
      </motion.div>
    </div>
  );
}
