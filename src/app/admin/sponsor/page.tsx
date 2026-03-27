'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  DollarSign,
  Sprout,
  Star,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Plus,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// ── Types ──
type TabKey = 'sponsorships' | 'farmers';
type SponsorshipTier = 'bronze' | 'silver' | 'gold' | 'corporate';
type SponsorshipStatus = 'active' | 'paused' | 'cancelled';

interface Sponsorship {
  id: string;
  sponsor_name: string;
  sponsor_email: string;
  tier: SponsorshipTier;
  farmer_name: string;
  amount: number;
  billing_cycle: 'monthly' | 'annual';
  status: SponsorshipStatus;
  started_at: string;
}

interface FarmerProfile {
  id: string;
  display_name: string;
  country: string;
  crops: string;
  active_sponsors: number;
  monthly_funding_received: number;
  monthly_funding_needed: number;
  is_featured: boolean;
  slug: string;
}

// ── Mock data ──
const mockSponsorships: Sponsorship[] = [
  { id: '1', sponsor_name: 'James Okonkwo', sponsor_email: 'james@example.com', tier: 'gold', farmer_name: 'Amara Diallo', amount: 500, billing_cycle: 'monthly', status: 'active', started_at: '2025-11-01' },
  { id: '2', sponsor_name: 'Sarah Chen', sponsor_email: 'sarah@example.com', tier: 'silver', farmer_name: 'Bongani Mokoena', amount: 100, billing_cycle: 'monthly', status: 'active', started_at: '2025-12-15' },
  { id: '3', sponsor_name: 'GreenImpact Corp', sponsor_email: 'impact@greenco.com', tier: 'corporate', farmer_name: 'Fatou Camara', amount: 2000, billing_cycle: 'monthly', status: 'active', started_at: '2026-01-01' },
  { id: '4', sponsor_name: 'Maria Santos', sponsor_email: 'maria@example.com', tier: 'bronze', farmer_name: 'Kwame Asante', amount: 5, billing_cycle: 'monthly', status: 'active', started_at: '2026-02-10' },
  { id: '5', sponsor_name: 'David Levi', sponsor_email: 'david@example.com', tier: 'silver', farmer_name: 'Nkechi Obi', amount: 100, billing_cycle: 'monthly', status: 'paused', started_at: '2025-10-05' },
];

const mockFarmerProfiles: FarmerProfile[] = [
  { id: '1', display_name: 'Amara Diallo', country: '🇹🇿 Tanzania', crops: 'Coffee, Cassava', active_sponsors: 3, monthly_funding_received: 650, monthly_funding_needed: 500, is_featured: true, slug: 'amara-diallo-f2a1' },
  { id: '2', display_name: 'Bongani Mokoena', country: '🇿🇼 Zimbabwe', crops: 'Blueberries, Maize', active_sponsors: 1, monthly_funding_received: 100, monthly_funding_needed: 200, is_featured: false, slug: 'bongani-mokoena-e8c3' },
  { id: '3', display_name: 'Fatou Camara', country: '🇧🇼 Botswana', crops: 'Groundnuts, Sesame', active_sponsors: 2, monthly_funding_received: 2100, monthly_funding_needed: 1500, is_featured: true, slug: 'fatou-camara-d5b7' },
  { id: '4', display_name: 'Kwame Asante', country: '🇹🇿 Tanzania', crops: 'Cashews, Rice', active_sponsors: 1, monthly_funding_received: 5, monthly_funding_needed: 100, is_featured: false, slug: 'kwame-asante-a3c9' },
  { id: '5', display_name: 'Nkechi Obi', country: '🇿🇼 Zimbabwe', crops: 'Macadamia, Maize', active_sponsors: 0, monthly_funding_received: 0, monthly_funding_needed: 300, is_featured: false, slug: 'nkechi-obi-b1d4' },
];

// ── Tier config ──
const tierConfig: Record<SponsorshipTier, { label: string; color: string; bg: string }> = {
  bronze: { label: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100' },
  silver: { label: 'Silver', color: 'text-gray-600', bg: 'bg-gray-100' },
  gold: { label: 'Gold', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  corporate: { label: 'Corporate', color: 'text-purple-700', bg: 'bg-purple-100' },
};

const statusConfig: Record<SponsorshipStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-100' },
  paused: { label: 'Paused', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function AdminSponsorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('sponsorships');
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(mockSponsorships);
  const [farmers, setFarmers] = useState<FarmerProfile[]>(mockFarmerProfiles);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [_loading, setLoading] = useState(false);

  // ── Stats derived from mock data ──
  const totalActive = sponsorships.filter((s) => s.status === 'active').length;
  const mrr = sponsorships.filter((s) => s.status === 'active').reduce((sum, s) => sum + (s.billing_cycle === 'annual' ? s.amount / 12 : s.amount), 0);
  const farmerProfilesLive = farmers.filter((f) => f.active_sponsors >= 0).length;
  const totalSponsors = new Set(sponsorships.map((s) => s.sponsor_email)).size;

  // ── Filtered sponsorships ──
  const filteredSponsorships = sponsorships.filter((s) => {
    const matchesTier = tierFilter === 'all' || s.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch = !searchQuery ||
      s.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sponsor_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesStatus && matchesSearch;
  });

  // ── Toggle featured ──
  const toggleFeatured = useCallback(async (farmerId: string, currentValue: boolean) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === farmerId ? { ...f, is_featured: !currentValue } : f))
    );
    // In production: update Supabase farmer_public_profiles
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Heart className="w-6 h-6 text-teal" />
            Sponsor a Farmer — Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage sponsorships and farmer public profiles</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Farmer Profile
        </button>
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Sponsorships', value: totalActive, icon: Heart, color: 'text-teal', bg: 'bg-teal/10' },
          { label: 'Monthly Recurring Revenue', value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Farmer Profiles Live', value: farmerProfilesLive, icon: Sprout, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Total Sponsors', value: totalSponsors, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={cardVariants} className="card-polished bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-navy">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-4 flex gap-1">
          {(['sponsorships', 'farmers'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'text-teal border-b-2 border-teal -mb-px bg-teal/5'
                  : 'text-gray-500 hover:text-navy'
              }`}
            >
              {tab === 'sponsorships' ? 'Sponsorships' : 'Farmer Profiles'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── SPONSORSHIPS TAB ── */}
          {activeTab === 'sponsorships' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by sponsor or farmer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 bg-white"
                  >
                    <option value="all">All Tiers</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="corporate">Corporate</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sponsor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Billing</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSponsorships.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                          No sponsorships found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSponsorships.map((s) => {
                        const tier = tierConfig[s.tier];
                        const status = statusConfig[s.status];
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-navy">{s.sponsor_name}</div>
                              <div className="text-xs text-gray-400">{s.sponsor_email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tier.bg} ${tier.color}`}>
                                {tier.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-navy font-medium">{s.farmer_name}</td>
                            <td className="px-4 py-3 text-navy font-semibold">${s.amount}</td>
                            <td className="px-4 py-3 text-gray-500 capitalize">{s.billing_cycle}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{new Date(s.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── FARMER PROFILES TAB ── */}
          {activeTab === 'farmers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{farmers.length} farmer profiles registered</p>
                <button className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {farmers.map((farmer) => {
                  const fundingPct = Math.min(100, Math.round((farmer.monthly_funding_received / farmer.monthly_funding_needed) * 100));
                  return (
                    <div key={farmer.id} className="card-polished bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-navy">{farmer.display_name}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{farmer.country}</div>
                          <div className="text-xs text-gray-400 mt-1">{farmer.crops}</div>
                        </div>
                        <button
                          onClick={() => toggleFeatured(farmer.id, farmer.is_featured)}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                          title={farmer.is_featured ? 'Remove Featured' : 'Mark Featured'}
                        >
                          {farmer.is_featured ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                          ) : (
                            <Star className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                      </div>

                      {/* Funding Progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500">Monthly Funding</span>
                          <span className="font-semibold text-navy">${farmer.monthly_funding_received} / ${farmer.monthly_funding_needed}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${fundingPct}%`,
                              background: fundingPct >= 100 ? '#16a34a' : '#8CB89C',
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{fundingPct}% funded</div>
                      </div>

                      {/* Sponsor count */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{farmer.active_sponsors} active sponsor{farmer.active_sponsors !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <a
                          href={`/farmers/${farmer.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-navy hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Public Profile
                        </a>
                        <button
                          onClick={() => toggleFeatured(farmer.id, farmer.is_featured)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            farmer.is_featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          {farmer.is_featured ? 'Featured' : 'Feature'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
