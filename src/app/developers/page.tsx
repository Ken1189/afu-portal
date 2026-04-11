'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Server, Shield, Zap, BookOpen, Terminal,
  ArrowRight, Copy, Check, Globe, Lock, Key,
  Database, Webhook, BarChart3, Users, Leaf,
  CreditCard, Truck, Cloud, FileJson, ChevronRight,
} from 'lucide-react';

/* ─── API Categories ─── */
const API_CATEGORIES = [
  {
    name: 'Authentication',
    icon: Lock,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    endpoints: [
      { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user and receive JWT token' },
      { method: 'POST', path: '/api/auth/register', desc: 'Register a new user account' },
      { method: 'POST', path: '/api/auth/refresh', desc: 'Refresh an expired access token' },
      { method: 'POST', path: '/api/auth/logout', desc: 'Invalidate the current session' },
    ],
  },
  {
    name: 'Members',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    endpoints: [
      { method: 'GET', path: '/api/members', desc: 'List all members with pagination and filters' },
      { method: 'GET', path: '/api/members/:id', desc: 'Get member profile and membership details' },
      { method: 'POST', path: '/api/members', desc: 'Create a new member record' },
      { method: 'PATCH', path: '/api/members/:id', desc: 'Update member information' },
      { method: 'GET', path: '/api/members/:id/activity', desc: 'Get member activity history' },
    ],
  },
  {
    name: 'Trading',
    icon: BarChart3,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    endpoints: [
      { method: 'GET', path: '/api/trading', desc: 'List trade orders with status and commodity filters' },
      { method: 'POST', path: '/api/trading', desc: 'Create a new buy or sell trade order' },
      { method: 'GET', path: '/api/trading/quotes', desc: 'List quotes for a specific order' },
      { method: 'POST', path: '/api/trading/quotes', desc: 'Submit a quote against an open order' },
      { method: 'GET', path: '/api/market-prices', desc: 'Get current commodity market prices' },
    ],
  },
  {
    name: 'Farm Operations',
    icon: Leaf,
    color: 'text-green-600 bg-green-50 border-green-200',
    endpoints: [
      { method: 'GET', path: '/api/farm/crops', desc: 'List crops for authenticated farmer' },
      { method: 'POST', path: '/api/farm/journal', desc: 'Create a farm journal entry' },
      { method: 'GET', path: '/api/weather', desc: 'Get weather forecast for farm location' },
      { method: 'POST', path: '/api/ai/diagnose', desc: 'AI-powered crop disease diagnosis' },
      { method: 'GET', path: '/api/equipment', desc: 'List farm equipment inventory' },
    ],
  },
  {
    name: 'Finance',
    icon: CreditCard,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    endpoints: [
      { method: 'GET', path: '/api/loans', desc: 'List loan applications and active loans' },
      { method: 'POST', path: '/api/loans', desc: 'Submit a new loan application' },
      { method: 'GET', path: '/api/payments', desc: 'List payment history and schedules' },
      { method: 'POST', path: '/api/payments', desc: 'Record a payment against a loan' },
      { method: 'GET', path: '/api/credit-score/:id', desc: 'Get credit score for a member' },
    ],
  },
  {
    name: 'Logistics',
    icon: Truck,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    endpoints: [
      { method: 'GET', path: '/api/warehouse', desc: 'List warehouse inventory positions' },
      { method: 'POST', path: '/api/logistics/shipment', desc: 'Create a shipment tracking record' },
      { method: 'GET', path: '/api/insurance', desc: 'List insurance policies and claims' },
      { method: 'POST', path: '/api/insurance/claim', desc: 'Submit an insurance claim' },
    ],
  },
  {
    name: 'Carbon Credits',
    icon: Cloud,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    endpoints: [
      { method: 'GET', path: '/api/carbon/projects', desc: 'List sustainability projects' },
      { method: 'GET', path: '/api/carbon/credits', desc: 'Get earned carbon credit balances' },
      { method: 'POST', path: '/api/carbon/verify', desc: 'Submit credit verification request' },
    ],
  },
  {
    name: 'Webhooks',
    icon: Webhook,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    endpoints: [
      { method: 'POST', path: '/api/webhooks/register', desc: 'Register a webhook endpoint' },
      { method: 'GET', path: '/api/webhooks', desc: 'List registered webhook subscriptions' },
      { method: 'DELETE', path: '/api/webhooks/:id', desc: 'Remove a webhook subscription' },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-emerald-100 text-emerald-700',
  PATCH: 'bg-amber-100 text-amber-700',
  PUT: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

const CODE_EXAMPLE = `// Fetch current commodity market prices
const response = await fetch('https://api.africanfarmingunion.org/api/market-prices', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
});

const { data } = await response.json();
// Returns: [{ commodity, price, currency, country, unit, date }]`;

const RESPONSE_EXAMPLE = `{
  "success": true,
  "data": [
    {
      "commodity": "Maize",
      "price": 248.50,
      "currency": "USD",
      "unit": "tonne",
      "country": "Zimbabwe",
      "market_location": "Harare",
      "date": "2026-04-10"
    },
    {
      "commodity": "Coffee Arabica",
      "price": 4120.00,
      "currency": "USD",
      "unit": "tonne",
      "country": "Tanzania",
      "market_location": "Moshi",
      "date": "2026-04-10"
    }
  ],
  "meta": { "total": 45, "page": 1, "per_page": 20 }
}`;

const FEATURES = [
  { icon: Shield, title: 'OAuth 2.0 + JWT', desc: 'Industry-standard authentication with role-based access control and API key management.' },
  { icon: Zap, title: 'Rate Limiting', desc: '1,000 requests/minute on standard plans. Burst capacity and custom limits for enterprise.' },
  { icon: Globe, title: 'Multi-Region', desc: 'Low-latency endpoints across Africa with edge caching for market data and public resources.' },
  { icon: Database, title: 'Real-Time Data', desc: 'WebSocket connections for live market prices, trade notifications, and system events.' },
  { icon: FileJson, title: 'JSON API', desc: 'RESTful JSON responses with consistent pagination, filtering, and error handling.' },
  { icon: BookOpen, title: 'SDKs', desc: 'Official client libraries for JavaScript, Python, and PHP. Community SDKs for Go and Java.' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function DevelopersPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1B2A4A] via-[#223350] to-[#1B2A4A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Code2 className="w-4 h-4" />
                Developer Portal
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Build on Africa&apos;s Agricultural
                <span className="block bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
                  Infrastructure
                </span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl">
                Integrate with AFU&apos;s comprehensive API to access real-time commodity prices,
                trade execution, farmer data, financial services, and carbon credit management
                across 9 African countries.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#5DB347]/25"
                >
                  <Key className="w-4 h-4" />
                  Request API Access
                </Link>
                <a
                  href="#endpoints"
                  className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-xl transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  View Documentation
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'API Endpoints', value: '120+' },
              { label: 'Countries Covered', value: '9' },
              { label: 'Commodities Tracked', value: '20+' },
              { label: 'Uptime SLA', value: '99.9%' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-[#1B2A4A]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#5DB347] uppercase tracking-wider mb-2">Platform Capabilities</p>
            <h2 className="text-3xl font-bold text-[#1B2A4A]">Enterprise-Grade API Infrastructure</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#5DB347]/20 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#5DB347] uppercase tracking-wider mb-2">Quick Start</p>
            <h2 className="text-3xl font-bold text-[#1B2A4A]">Up and Running in Minutes</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request */}
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <div className="bg-[#1B2A4A] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#5DB347]" />
                  <span className="text-xs font-mono text-white/60">Request</span>
                </div>
                <CopyButton text={CODE_EXAMPLE} />
              </div>
              <pre className="bg-[#0f1b2d] text-gray-300 text-xs leading-relaxed p-5 overflow-x-auto">
                <code>{CODE_EXAMPLE}</code>
              </pre>
            </div>
            {/* Response */}
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <div className="bg-[#1B2A4A] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#5DB347]" />
                  <span className="text-xs font-mono text-white/60">Response</span>
                </div>
                <CopyButton text={RESPONSE_EXAMPLE} />
              </div>
              <pre className="bg-[#0f1b2d] text-gray-300 text-xs leading-relaxed p-5 overflow-x-auto">
                <code>{RESPONSE_EXAMPLE}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="endpoints" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#5DB347] uppercase tracking-wider mb-2">API Reference</p>
            <h2 className="text-3xl font-bold text-[#1B2A4A]">Explore Endpoints</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Browse our comprehensive API covering trading, farm operations, finance, logistics, and more.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-2 lg:sticky lg:top-24">
                {API_CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                      activeCategory === i
                        ? 'bg-[#5DB347]/10 text-[#5DB347]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <cat.icon className="w-4 h-4 flex-shrink-0" />
                    {cat.name}
                    <span className="ml-auto text-[10px] text-gray-400">{cat.endpoints.length}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint list */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  {(() => { const Icon = API_CATEGORIES[activeCategory].icon; return <Icon className="w-5 h-5 text-[#5DB347]" />; })()}
                  <h3 className="font-bold text-[#1B2A4A]">{API_CATEGORIES[activeCategory].name}</h3>
                  <span className="text-xs text-gray-400 ml-auto">{API_CATEGORIES[activeCategory].endpoints.length} endpoints</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {API_CATEGORIES[activeCategory].endpoints.map((ep) => (
                    <div key={`${ep.method}-${ep.path}`} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md ${METHOD_COLORS[ep.method]}`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-[#1B2A4A] font-medium">{ep.path}</code>
                        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 ml-14">{ep.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#5DB347] uppercase tracking-wider mb-2">Client Libraries</p>
            <h2 className="text-3xl font-bold text-[#1B2A4A]">Official SDKs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { lang: 'JavaScript / TypeScript', pkg: 'npm install @afu/sdk', status: 'Stable', statusColor: 'text-emerald-600 bg-emerald-50' },
              { lang: 'Python', pkg: 'pip install afu-sdk', status: 'Stable', statusColor: 'text-emerald-600 bg-emerald-50' },
              { lang: 'PHP', pkg: 'composer require afu/sdk', status: 'Beta', statusColor: 'text-amber-600 bg-amber-50' },
            ].map((sdk) => (
              <div key={sdk.lang} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1B2A4A]">{sdk.lang}</h3>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${sdk.statusColor}`}>{sdk.status}</span>
                </div>
                <div className="bg-[#1B2A4A] rounded-xl px-4 py-3 font-mono text-xs text-gray-300">
                  {sdk.pkg}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Integrate?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Get started with your API key today. Our developer relations team is
            available to help you build your integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5DB347] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Request API Key
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
