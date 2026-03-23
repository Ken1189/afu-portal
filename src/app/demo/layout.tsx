'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, Sprout, Building2, Home, CloudSun, BarChart3,
  GraduationCap, BookOpen, UsersRound, Wallet, Shield,
  CreditCard, Brain, Camera, Leaf, Ship, ShoppingBag, Truck,
  Coins, Lock, ChevronDown, Bot, Menu, X, Bell,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Sidebar items with tier grouping                                     */
/* ------------------------------------------------------------------ */

const TIER_CONFIG = [
  {
    tier: 'seedling',
    label: '🌱 Seedling',
    color: '#8CB89C',
    description: 'Getting started',
    items: [
      { label: 'My Farm', icon: Home, href: '#dashboard' },
      { label: 'Weather', icon: CloudSun, href: '#weather' },
      { label: 'Market Prices', icon: BarChart3, href: '#market-prices' },
      { label: 'Training Hub', icon: GraduationCap, href: '#training' },
    ],
  },
  {
    tier: 'sprout',
    label: '🌿 Sprout',
    color: '#5DB347',
    description: 'Farm records',
    items: [
      { label: 'Farm Journal', icon: BookOpen, href: '#farm' },
      { label: 'My Crops', icon: Sprout, href: '#crops' },
      { label: 'Cooperatives', icon: UsersRound, href: '#cooperative' },
    ],
  },
  {
    tier: 'growth',
    label: '🌳 Growth',
    color: '#449933',
    description: 'Financial tools',
    items: [
      { label: 'Financing', icon: Wallet, href: '#financing' },
      { label: 'Insurance', icon: Shield, href: '#insurance' },
      { label: 'Payments', icon: CreditCard, href: '#payments' },
    ],
  },
  {
    tier: 'harvest',
    label: '🌾 Harvest',
    color: '#2D7A1E',
    description: 'Digital agriculture',
    items: [
      { label: 'AI Crop Doctor', icon: Camera, href: '#ai-doctor' },
      { label: 'AI Tools', icon: Brain, href: '#ai-tools' },
      { label: 'Sustainability', icon: Leaf, href: '#sustainability' },
      { label: 'Exports', icon: Ship, href: '#exports' },
    ],
  },
  {
    tier: 'pioneer',
    label: '🏆 Pioneer',
    color: '#1B5E14',
    description: 'Full access',
    items: [
      { label: 'Marketplace', icon: ShoppingBag, href: '#marketplace' },
      { label: 'Logistics', icon: Truck, href: '#logistics' },
      { label: 'Tokenize', icon: Coins, href: '#tokenize' },
    ],
  },
];

// Demo farmer's current tier — show Sprout unlocked, rest locked
const DEMO_TIER_INDEX = 1; // sprout

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    seedling: true,
    sprout: true,
    growth: true,
    harvest: true,
    pioneer: true,
  });

  const isFarm = pathname === '/demo/farm';
  const isCommercial = pathname === '/demo/commercial';

  const toggleTier = (tier: string) => {
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const tierOrder = ['seedling', 'sprout', 'growth', 'harvest', 'pioneer'];

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Farmer profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5DB347] flex items-center justify-center text-white font-bold text-sm">
            {isFarm ? 'GM' : 'SC'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy truncate">
              {isFarm ? 'Grace Moyo' : 'Simba Chikwanha'}
            </p>
            <p className="text-[10px] text-gray-500">
              {isFarm ? '🌿 Sprout • Zimbabwe' : '🌳 Commercial • Zimbabwe'}
            </p>
          </div>
        </div>

        {/* Tier progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-gray-500">Tier Progress</span>
            <span className="font-bold text-[#5DB347]">{isFarm ? '40%' : '80%'}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8CB89C] to-[#5DB347] rounded-full transition-all"
              style={{ width: isFarm ? '40%' : '80%' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {tierOrder.map((t, i) => (
              <div
                key={t}
                className={`w-2 h-2 rounded-full ${
                  i <= (isFarm ? DEMO_TIER_INDEX : 3)
                    ? 'bg-[#5DB347]'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI Assistant button */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#5DB347]/10 text-[#5DB347] text-xs font-medium">
          <Bot className="w-4 h-4" />
          AI Farming Assistant
          <span className="w-2 h-2 bg-green-400 rounded-full ml-auto" />
        </div>
      </div>

      {/* Tier-grouped navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {TIER_CONFIG.map((tierGroup, tierIdx) => {
          const unlocked = tierIdx <= (isFarm ? DEMO_TIER_INDEX : 3);
          const expanded = expandedTiers[tierGroup.tier];

          return (
            <div key={tierGroup.tier} className="mb-1">
              {/* Tier header */}
              <button
                onClick={() => toggleTier(tierGroup.tier)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{tierGroup.label}</span>
                  {!unlocked && <Lock className="w-3 h-3 text-gray-400" />}
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Items */}
              {expanded && (
                <div className="space-y-0.5 px-2">
                  {tierGroup.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                          unlocked
                            ? 'text-gray-700 hover:bg-[#EBF7E5] hover:text-[#5DB347]'
                            : 'text-gray-400 cursor-default'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                        {!unlocked && (
                          <Lock className="w-3 h-3 text-gray-300 ml-auto" />
                        )}
                        {unlocked && item.label === 'Training Hub' && (
                          <span className="ml-auto text-[9px] bg-[#5DB347] text-white px-1.5 py-0.5 rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Demo footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400 text-center">
          🎯 INVESTOR DEMO — Features unlock as farmers complete training
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top demo bar */}
      <div className="sticky top-0 z-50 bg-[#1B2A4A] shadow-lg">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-4">
              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link
                href="/investors"
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Investors</span>
              </Link>

              <span className="text-xs font-bold uppercase tracking-widest text-[#5DB347]">
                Demo
              </span>
            </div>

            {/* Demo tabs */}
            <div className="flex items-center gap-1">
              <Link
                href="/demo/farm"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isFarm ? 'bg-[#5DB347]/20 text-[#5DB347]' : 'text-white/60 hover:text-white'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Farmer</span>
              </Link>
              <Link
                href="/demo/commercial"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCommercial ? 'bg-[#5DB347]/20 text-[#5DB347]' : 'text-white/60 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Commercial</span>
              </Link>
            </div>

            <Link
              href="/contact?subject=investor"
              className="bg-gradient-to-r from-[#D4A843] to-[#E8C547] text-[#1B2A4A] px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Request Pack
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
          {sidebar}
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-12 bottom-0 w-72 bg-white z-50 lg:hidden overflow-y-auto shadow-xl">
              {sidebar}
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
