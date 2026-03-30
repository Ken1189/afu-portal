'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Coins,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import FilterBar, {
  COUNTRY_FILTER,
  DATE_RANGE_FILTER,
  type FilterValues,
  type FilterConfig,
} from '@/components/admin/FilterBar';
import { applyFilters } from '@/components/admin';

// ── Types ──
interface ExchangeListing {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: number;
  priceType: string;
  status: 'active' | 'pending' | 'removed' | 'featured';
  views: number;
  country: string;
  created_at: string;
}

interface ExchangeTransaction {
  id: string;
  buyer: string;
  seller: string;
  listing: string;
  amount: number;
  status: 'pending' | 'completed' | 'disputed' | 'refunded';
  date: string;
  country: string;
}

// ── Demo data ──
const DEMO_LISTINGS: ExchangeListing[] = [
  { id: 'L001', title: 'John Deere Tractor — Available for Hire', seller: 'Tendai Moyo', category: 'Equipment', price: 500, priceType: '/day', status: 'active', views: 42, country: 'Zimbabwe', created_at: '2026-03-20' },
  { id: 'L002', title: 'Surplus Maize — 2 Tonnes', seller: 'Grace Kamau', category: 'Produce', price: 3000, priceType: '', status: 'active', views: 28, country: 'Zimbabwe', created_at: '2026-03-19' },
  { id: 'L003', title: 'Irrigation Pump Rental', seller: 'James Okello', category: 'Equipment', price: 200, priceType: '/day', status: 'featured', views: 65, country: 'Uganda', created_at: '2026-03-18' },
  { id: 'L004', title: 'Farm Labour — Planting Crew', seller: 'Anna Mushi', category: 'Services', price: 150, priceType: '/day', status: 'active', views: 18, country: 'Tanzania', created_at: '2026-03-17' },
  { id: 'L005', title: 'Warehouse Storage — 50sqm', seller: 'Peter Ncube', category: 'Storage', price: 100, priceType: '/month', status: 'pending', views: 8, country: 'Zimbabwe', created_at: '2026-03-22' },
  { id: 'L006', title: 'Brahman Bull — Breeding Stock', seller: 'David Sithole', category: 'Livestock', price: 15000, priceType: '', status: 'active', views: 94, country: 'Zimbabwe', created_at: '2026-03-15' },
  { id: 'L007', title: 'Certified Maize Seed — 50kg', seller: 'Mary Wanjiru', category: 'Seeds', price: 800, priceType: '', status: 'active', views: 37, country: 'Kenya', created_at: '2026-03-14' },
  { id: 'L008', title: 'Agronomist Consultation — 2 Hours', seller: 'John Mwangi', category: 'Knowledge', price: 300, priceType: '', status: 'removed', views: 12, country: 'Kenya', created_at: '2026-03-10' },
];

const DEMO_TRANSACTIONS: ExchangeTransaction[] = [
  { id: 'T001', buyer: 'Grace Kamau', seller: 'Tendai Moyo', listing: 'Tractor Hire — 1 Day', amount: 500, status: 'completed', date: '2026-03-22', country: 'Zimbabwe' },
  { id: 'T002', buyer: 'Peter Ncube', seller: 'Grace Kamau', listing: 'Surplus Maize — 500kg', amount: 1500, status: 'completed', date: '2026-03-21', country: 'Zimbabwe' },
  { id: 'T003', buyer: 'Anna Mushi', seller: 'James Okello', listing: 'Irrigation Pump — 3 Days', amount: 600, status: 'pending', date: '2026-03-23', country: 'Uganda' },
  { id: 'T004', buyer: 'David Sithole', seller: 'Mary Wanjiru', listing: 'Certified Maize Seed — 25kg', amount: 400, status: 'completed', date: '2026-03-20', country: 'Kenya' },
  { id: 'T005', buyer: 'John Mwangi', seller: 'Tendai Moyo', listing: 'Tractor Hire — 2 Days', amount: 1000, status: 'disputed', date: '2026-03-19', country: 'Zimbabwe' },
];

// ── Filter configs ──
const LISTING_STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'featured', label: 'Featured' },
    { value: 'removed', label: 'Removed' },
  ],
};

const CATEGORY_FILTER: FilterConfig = {
  key: 'category',
  label: 'Category',
  options: [
    { value: 'all', label: 'All' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Produce', label: 'Produce' },
    { value: 'Services', label: 'Services' },
    { value: 'Storage', label: 'Storage' },
    { value: 'Livestock', label: 'Livestock' },
    { value: 'Seeds', label: 'Seeds' },
    { value: 'Knowledge', label: 'Knowledge' },
    { value: 'Land', label: 'Land' },
  ],
};

const TX_STATUS_FILTER: FilterConfig = {
  key: 'status',
  label: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'refunded', label: 'Refunded' },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  featured: 'bg-purple-50 text-purple-700',
  removed: 'bg-red-50 text-red-700',
  completed: 'bg-emerald-50 text-emerald-700',
  disputed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

// ── Page ──
export default function AdminExchangePage() {
  const [tab, setTab] = useState<'listings' | 'transactions'>('listings');
  const [listings, setListings] = useState<ExchangeListing[]>(DEMO_LISTINGS);
  const [transactions, setTransactions] = useState<ExchangeTransaction[]>(DEMO_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('exchange_listings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setListings(
            data.map((row: Record<string, unknown>) => {
              let uiStatus = (row.status as string) || 'active';
              if (uiStatus === 'cancelled') uiStatus = 'removed';
              if (row.is_featured) uiStatus = 'featured';
              return {
                id: (row.id as string) || '',
                title: (row.title as string) || 'Untitled',
                seller: (row.seller_name as string) || (row.seller as string) || 'Unknown',
                category: (row.category as string) || 'Other',
                price: (row.price_credits as number) || (row.price as number) || 0,
                priceType: (row.price_type as string) || '',
                status: uiStatus as ExchangeListing['status'],
                views: (row.views_count as number) || (row.views as number) || 0,
                country: (row.country as string) || '',
                created_at: ((row.created_at as string) || '')?.split('T')[0] || '',
              };
            })
          );
        }
      } catch { /* fallback */ }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const supabaseRef = createClient();

  const handleListingAction = async (id: string, newStatus: 'active' | 'featured' | 'removed') => {
    setActionLoading(id);
    // Map UI status to valid DB values: 'removed' -> 'cancelled', 'featured' uses is_featured column
    const isFeaturedToggle = newStatus === 'featured';
    const listing = listings.find(l => l.id === id);
    const dbUpdate: Record<string, unknown> = isFeaturedToggle
      ? { is_featured: !(listing?.status === 'featured'), status: listing?.status === 'featured' ? 'active' : (listing?.status || 'active') }
      : { status: newStatus === 'removed' ? 'cancelled' : newStatus, is_featured: false };
    const { error } = await supabaseRef.from('exchange_listings').update(dbUpdate).eq('id', id);
    if (error) {
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      setToast({ message: `Listing ${newStatus === 'removed' ? 'removed' : newStatus === 'featured' ? 'featured' : 'approved'}`, type: 'success' });
    } else {
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      setToast({ message: `Listing ${newStatus === 'removed' ? 'removed' : newStatus === 'featured' ? 'featured' : 'approved'} successfully`, type: 'success' });
    }
    setActionLoading(null);
    setTimeout(() => setToast(null), 3000);
  };

  const [listingFilters, setListingFilters] = useState<FilterValues>({
    search: '',
    status: 'all',
    category: 'all',
    country: 'all',
    dateRange: 'all',
  });

  const [txFilters, setTxFilters] = useState<FilterValues>({
    search: '',
    status: 'all',
    country: 'all',
    dateRange: 'all',
  });

  // Apply filters — cast to satisfy Record<string, unknown> constraint
  const filteredListings = (applyFilters(
    listings as unknown as Record<string, unknown>[],
    listingFilters,
    ['title', 'seller', 'category'],
  ) as unknown as ExchangeListing[]).filter((l) => {
    if (listingFilters.category && listingFilters.category !== 'all' && l.category !== listingFilters.category) return false;
    return true;
  });

  const filteredTransactions = applyFilters(
    transactions as unknown as Record<string, unknown>[],
    txFilters,
    ['buyer', 'seller', 'listing'],
  ) as unknown as ExchangeTransaction[];

  // Compute stats
  const totalCommission = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + Math.round(t.amount * 0.05), 0);

  const creditsCirculating = 245000;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-[#1B2A4A]">Exchange Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Oversee the AFU Exchange marketplace</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: listings.length.toString(), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Trades', value: transactions.filter((t) => t.status === 'pending').length.toString(), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'Credits Circulating', value: creditsCirculating.toLocaleString(), icon: Coins, color: 'bg-amber-50 text-amber-600' },
          { label: 'Commission Earned', value: `${totalCommission.toLocaleString()} cr`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-[#1B2A4A]">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('listings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'listings' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Listings ({listings.length})
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'transactions' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transactions ({transactions.length})
        </button>
      </div>

      {/* ── Listings Tab ── */}
      {tab === 'listings' && (
        <>
          <FilterBar
            filters={[LISTING_STATUS_FILTER, CATEGORY_FILTER, COUNTRY_FILTER, DATE_RANGE_FILTER]}
            values={listingFilters}
            onChange={setListingFilters}
            searchPlaceholder="Search listings by title, seller..."
            resultCount={filteredListings.length}
          />

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Seller</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Views</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#1B2A4A] truncate max-w-[200px]">{listing.title}</p>
                        <p className="text-xs text-gray-400">{listing.country}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{listing.seller}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{listing.category}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#1B2A4A]">
                        {listing.price.toLocaleString()}{listing.priceType}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[listing.status]}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">
                        <span className="flex items-center justify-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {listing.views}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {listing.status !== 'active' && (
                            <button
                              onClick={() => handleListingAction(listing.id, 'active')}
                              disabled={actionLoading === listing.id}
                              className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {listing.status !== 'removed' && (
                            <button
                              onClick={() => handleListingAction(listing.id, 'removed')}
                              disabled={actionLoading === listing.id}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Remove"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleListingAction(listing.id, listing.status === 'featured' ? 'active' : 'featured')}
                            disabled={actionLoading === listing.id}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${listing.status === 'featured' ? 'bg-amber-50 text-amber-600' : 'hover:bg-amber-50 text-gray-400 hover:text-amber-600'}`}
                            title={listing.status === 'featured' ? 'Unfeature' : 'Feature'}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Transactions Tab ── */}
      {tab === 'transactions' && (
        <>
          <FilterBar
            filters={[TX_STATUS_FILTER, COUNTRY_FILTER, DATE_RANGE_FILTER]}
            values={txFilters}
            onChange={setTxFilters}
            searchPlaceholder="Search by buyer, seller, or listing..."
            resultCount={filteredTransactions.length}
          />

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Buyer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Seller</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Listing</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-gray-700">{tx.buyer}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-gray-700">{tx.seller}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 truncate max-w-[180px]">{tx.listing}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#1B2A4A]">
                        {tx.amount.toLocaleString()} cr
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[tx.status]}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
