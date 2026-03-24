'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Tractor,
  Wheat,
  Wrench,
  MapPin,
  Warehouse,
  Beef,
  Sprout,
  GraduationCap,
  ArrowRight,
  Coins,
  TrendingUp,
  Globe,
  BarChart3,
  Truck,
  Info,
  ShoppingBag,
} from 'lucide-react';

// ── Types ──
interface Listing {
  id: string;
  title: string;
  category: string;
  condition?: string;
  price: string;
  priceType: string;
  sellerCountry: string;
  sellerRegion: string;
  delivery: boolean;
  image?: string;
}

// ── Category config ──
const CATEGORIES = [
  { key: 'all', label: 'All', icon: ShoppingBag },
  { key: 'equipment', label: 'Equipment', icon: Wrench },
  { key: 'produce', label: 'Produce', icon: Wheat },
  { key: 'services', label: 'Services', icon: TrendingUp },
  { key: 'land', label: 'Land', icon: MapPin },
  { key: 'storage', label: 'Storage', icon: Warehouse },
  { key: 'livestock', label: 'Livestock', icon: Beef },
  { key: 'seeds', label: 'Seeds', icon: Sprout },
  { key: 'knowledge', label: 'Knowledge', icon: GraduationCap },
] as const;

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  equipment: Wrench,
  produce: Wheat,
  services: TrendingUp,
  land: MapPin,
  storage: Warehouse,
  livestock: Beef,
  seeds: Sprout,
  knowledge: GraduationCap,
};

// ── Demo listings ──
const DEMO_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'John Deere Tractor — Available for Hire',
    category: 'equipment',
    condition: 'Good',
    price: '500',
    priceType: 'credits/day',
    sellerCountry: 'Zimbabwe',
    sellerRegion: 'Mashonaland East',
    delivery: true,
  },
  {
    id: '2',
    title: 'Surplus Maize — 2 Tonnes',
    category: 'produce',
    condition: 'Fresh',
    price: '3,000',
    priceType: 'credits',
    sellerCountry: 'Zimbabwe',
    sellerRegion: 'Manicaland',
    delivery: true,
  },
  {
    id: '3',
    title: 'Irrigation Pump Rental',
    category: 'equipment',
    condition: 'Good',
    price: '200',
    priceType: 'credits/day',
    sellerCountry: 'Uganda',
    sellerRegion: 'Central',
    delivery: false,
  },
  {
    id: '4',
    title: 'Farm Labour — Planting Crew (5 workers)',
    category: 'services',
    price: '150',
    priceType: 'credits/day',
    sellerCountry: 'Tanzania',
    sellerRegion: 'Arusha',
    delivery: false,
  },
  {
    id: '5',
    title: 'Warehouse Storage Space — 50sqm',
    category: 'storage',
    price: '100',
    priceType: 'credits/month',
    sellerCountry: 'Zimbabwe',
    sellerRegion: 'Harare',
    delivery: false,
  },
  {
    id: '6',
    title: 'Brahman Bull — Breeding Stock',
    category: 'livestock',
    condition: 'Excellent',
    price: '15,000',
    priceType: 'credits',
    sellerCountry: 'Zimbabwe',
    sellerRegion: 'Matabeleland South',
    delivery: true,
  },
  {
    id: '7',
    title: 'Certified Maize Seed — 50kg',
    category: 'seeds',
    condition: 'New',
    price: '800',
    priceType: 'credits',
    sellerCountry: 'Zimbabwe',
    sellerRegion: 'Midlands',
    delivery: true,
  },
  {
    id: '8',
    title: 'Agronomist Consultation — 2 Hours',
    category: 'knowledge',
    price: '300',
    priceType: 'credits',
    sellerCountry: 'Kenya',
    sellerRegion: 'Nairobi',
    delivery: false,
  },
];

// ── Helpers ──
const CONDITION_COLORS: Record<string, string> = {
  Excellent: 'bg-emerald-50 text-emerald-700',
  Good: 'bg-blue-50 text-blue-700',
  Fresh: 'bg-green-50 text-green-700',
  New: 'bg-purple-50 text-purple-700',
};

// ── Page ──
export default function ExchangePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = DEMO_LISTINGS.filter((l) => {
    const matchCategory = activeCategory === 'all' || l.category === activeCategory;
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.sellerCountry.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#1B2A4A] via-[#2D4A7A] to-[#5DB347] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-6 h-6 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Credit-Based Marketplace
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">AFU Exchange</h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8">
              Trade goods, services, and equipment with fellow farmers using AFU Credits
            </p>

            {/* How Credits Work */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">How Credits Work</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold">$1 = 10 Credits</p>
                    <p className="text-white/60 text-xs mt-0.5">Buy credits or earn by listing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Earn by Listing</p>
                    <p className="text-white/60 text-xs mt-0.5">List items & services to earn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">5% Commission</p>
                    <p className="text-white/60 text-xs mt-0.5">AFU takes a small commission</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {[
              { label: 'Total Listings', value: '1,247', icon: ShoppingBag },
              { label: 'Active Trades', value: '386', icon: TrendingUp },
              { label: 'Credits Circulating', value: '2.4M', icon: Coins },
              { label: 'Countries', value: '9', icon: Globe },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="py-4 sm:py-5 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-[#5DB347]" />
                  <div className="text-xl sm:text-2xl font-bold text-[#1B2A4A]">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Search Bar ── */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings by name, category, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none shadow-sm"
          />
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#5DB347] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#5DB347]/40 hover:text-[#5DB347]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Listings Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No listings found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((listing) => {
              const CatIcon = CATEGORY_ICONS[listing.category] || ShoppingBag;
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5DB347]/30 transition-all overflow-hidden group"
                >
                  {/* Image / Icon placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                    <CatIcon className="w-12 h-12 text-gray-300 group-hover:text-[#5DB347]/40 transition-colors" />
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#1B2A4A] px-2.5 py-1 rounded-full border border-gray-100 capitalize">
                      {listing.category}
                    </span>
                    {listing.delivery && (
                      <span className="absolute top-3 right-3 bg-[#5DB347]/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Delivery
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-[#1B2A4A] text-sm mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {listing.condition && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            CONDITION_COLORS[listing.condition] || 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {listing.condition}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="text-lg font-bold text-[#1B2A4A]">{listing.price}</span>
                      <span className="text-xs text-gray-500">{listing.priceType}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      {listing.sellerRegion}, {listing.sellerCountry}
                    </div>

                    <button className="w-full bg-[#1B2A4A] hover:bg-[#2D4A7A] text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Join the Exchange?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start trading goods, services, and equipment with thousands of farmers across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/apply"
              className="bg-white text-[#1B2A4A] hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Start Trading
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/farm/exchange"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              List Something
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
