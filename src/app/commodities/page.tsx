'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, BarChart3, Globe, Bell, ArrowRight,
  Wheat, Leaf, Users, ShieldCheck, Zap, Clock,
} from 'lucide-react';
// Navbar and Footer provided by root layout

/* ─── Sample commodity tickers for the animated banner ─── */
const TICKER_ITEMS = [
  { name: 'Maize', symbol: 'MZE', price: 248.50, change: +2.4 },
  { name: 'Coffee Arabica', symbol: 'COF', price: 4120.00, change: -1.1 },
  { name: 'Soybean', symbol: 'SOY', price: 615.30, change: +3.7 },
  { name: 'Cocoa', symbol: 'CCO', price: 3280.00, change: +0.8 },
  { name: 'Cotton', symbol: 'CTN', price: 1845.00, change: -0.5 },
  { name: 'Cashew Nuts', symbol: 'CSH', price: 1520.00, change: +1.9 },
  { name: 'Tobacco', symbol: 'TBC', price: 3650.00, change: +0.3 },
  { name: 'Tea', symbol: 'TEA', price: 2890.00, change: -0.7 },
  { name: 'Macadamia', symbol: 'MAC', price: 7200.00, change: +4.2 },
  { name: 'Blueberries', symbol: 'BLU', price: 5100.00, change: +1.5 },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Live Market Prices',
    desc: 'Real-time pricing data for 20+ African agricultural commodities across grains, oilseeds, cash crops, horticulture, and livestock.',
  },
  {
    icon: TrendingUp,
    title: 'Price Charts & Trends',
    desc: 'Interactive sparkline charts, 52-week highs/lows, and historical price data to help you make informed trading decisions.',
  },
  {
    icon: Globe,
    title: 'Pan-African Coverage',
    desc: 'Commodity data sourced across 9+ African countries including Zimbabwe, Kenya, Tanzania, Botswana, Zambia, and more.',
  },
  {
    icon: Bell,
    title: 'Market Alerts',
    desc: 'Set custom price alerts and get notified when commodities hit your target prices or experience significant market moves.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Counterparties',
    desc: 'Every trader and supplier on the platform is KYC-verified through AFU, ensuring safe and transparent transactions.',
  },
  {
    icon: Users,
    title: 'Direct Farmer Access',
    desc: 'Connect directly with AFU-registered farmers and cooperatives to negotiate forward contracts and offtake agreements.',
  },
];

export default function CommoditiesComingSoonPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <>
      {/* ─── Animated Ticker Strip ─── */}
      <div className="bg-[#1B2A4A] border-b border-white/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2.5">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs">
              <span className="font-mono font-bold text-white/60">{item.symbol}</span>
              <span className="text-white/40">{item.name}</span>
              <span className="text-white/80 font-semibold">${item.price.toLocaleString()}</span>
              <span className={`font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
              <span className="text-white/10 ml-4">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Hero ─── */}
      <section className="relative bg-gradient-to-br from-[#1B2A4A] via-[#223350] to-[#1B2A4A] text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Clock className="w-4 h-4" />
                Coming Soon
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                AFU Commodities
                <span className="block bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
                  Trading Platform
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl mx-auto">
                Africa&apos;s first dedicated agricultural commodities exchange, connecting
                farmers, buyers, and traders across the continent with real-time
                pricing, verified counterparties, and seamless trade execution.
              </p>
            </motion.div>

            {/* Email signup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {submitted ? (
                <div className="inline-flex items-center gap-3 bg-[#5DB347]/20 border border-[#5DB347]/30 rounded-2xl px-8 py-5">
                  <div className="w-10 h-10 rounded-full bg-[#5DB347] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">You are on the list</p>
                    <p className="text-sm text-gray-400">We will notify you when the platform launches.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email for early access"
                    required
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:from-[#449933] hover:to-[#3a8529] text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#5DB347]/25 hover:shadow-xl hover:shadow-[#5DB347]/30 flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Notify Me
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── What to Expect ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#5DB347] uppercase tracking-wider mb-2">What to Expect</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A]">
              A Platform Built for African Agriculture
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              We are building the tools that African farmers and commodity traders have been waiting for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-[#5DB347]/20 hover:shadow-lg hover:shadow-[#5DB347]/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-5 group-hover:bg-[#5DB347]/20 transition-colors">
                  <f.icon className="w-6 h-6 text-[#5DB347]" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Commodity Categories Preview ─── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#5DB347] uppercase tracking-wider mb-2">Commodity Categories</p>
            <h2 className="text-3xl font-bold text-[#1B2A4A]">Covering All Major African Crops</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Grains & Cereals', count: 5, icon: Wheat, examples: 'Maize, Wheat, Sorghum, Rice, Millet' },
              { name: 'Oilseeds & Pulses', count: 3, icon: Leaf, examples: 'Soybean, Groundnuts, Sunflower' },
              { name: 'Cash Crops', count: 4, icon: Zap, examples: 'Coffee, Cocoa, Tea, Tobacco' },
              { name: 'Horticulture', count: 4, icon: Leaf, examples: 'Blueberries, Macadamia, Cashew, Avocado' },
              { name: 'Livestock', count: 2, icon: Users, examples: 'Beef Cattle, Dairy' },
              { name: 'Fibres', count: 2, icon: Globe, examples: 'Cotton, Sugarcane' },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-3">
                  <cat.icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <p className="font-bold text-[#1B2A4A] text-sm mb-1">{cat.name}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{cat.examples}</p>
                <p className="text-xs font-semibold text-[#5DB347] mt-2">{cat.count} commodities</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Be the First to Trade
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join our early access list and be among the first traders on
            Africa&apos;s dedicated agricultural commodities platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#5DB347] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Register for Early Access
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Contact Sales
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              KYC-Verified Traders
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              9+ African Countries
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              20+ Commodities
            </div>
          </div>
        </div>
      </section>

      {/* Marquee animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </>
  );
}
