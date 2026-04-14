'use client';

import Link from 'next/link';
import {
  Truck, Package, MapPin, ArrowRight, Shield, Zap, Users, Star,
  Clock, Globe, Leaf, Wheat, CheckCircle2, Phone, HeartHandshake,
  Building2, Route, Smartphone,
} from 'lucide-react';

const STEPS = [
  { icon: Package, title: 'Request Delivery', desc: 'Tell us what you need moved — farm inputs, produce, equipment, or any goods. Set your pickup and dropoff locations.' },
  { icon: Truck, title: 'Driver Matches', desc: 'A verified Foober driver near you accepts your request. You get their name, vehicle details, and estimated arrival time.' },
  { icon: MapPin, title: 'Track & Receive', desc: 'Follow your delivery in real-time. Get notified at every step — pickup, in transit, and delivered. Rate your driver.' },
];

const USE_CASES = [
  { icon: Wheat, title: 'Farm Inputs', desc: 'Seeds, fertilizer, pesticides, and tools delivered from your nearest supplier straight to your farm gate.' },
  { icon: Leaf, title: 'Fresh Produce', desc: 'Get harvested crops from farm to market, processing hub, or buyer — fast and fresh, with cold chain options.' },
  { icon: Building2, title: 'Warehouse Dispatches', desc: 'Move stored commodities from warehouse to buyer or export point. Integrated with AFU warehouse receipts.' },
  { icon: Package, title: 'Equipment & Machinery', desc: 'Transport rented or purchased equipment between farms. Flatbed and truck options for heavy loads.' },
  { icon: HeartHandshake, title: 'Cooperative Bulk Orders', desc: 'Cooperatives can coordinate group deliveries — one driver, multiple drop-offs, shared costs.' },
  { icon: Globe, title: 'Cross-Border', desc: 'Moving goods between neighbouring countries? Foober drivers handle border logistics across our 20 African countries.' },
];

const COVERAGE = [
  'Zimbabwe', 'Botswana', 'Kenya', 'Tanzania', 'South Africa',
  'Nigeria', 'Ghana', 'Uganda', 'Zambia', 'Mozambique',
  'Ethiopia', 'Malawi', 'Namibia', 'Sierra Leone', 'Egypt',
  'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali', 'Ivory Coast',
];

export default function FooberLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4470] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5DB347]/20 text-[#5DB347] text-xs font-semibold mb-6">
              <Truck className="w-3.5 h-3.5" /> Foober Logistics by AFU
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Africa&apos;s Agricultural<br />Delivery Network
            </h1>
            <p className="text-lg text-white/70 mb-4 max-w-lg">
              Foober connects farmers, suppliers, and buyers with verified local drivers for fast, reliable delivery of agricultural goods across 20 African countries.
            </p>
            <p className="text-sm text-white/50 mb-8 max-w-lg">
              Whether you are moving a bag of seed 10km down the road or a truckload of maize across borders — Foober gets it there.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/foober/request"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5DB347] text-white font-semibold hover:bg-[#4a9a39] transition-colors min-h-[48px]"
              >
                Request a Delivery <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/driver/apply"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/20 min-h-[48px]"
              >
                <Users className="w-4 h-4" /> Become a Logistics Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-4">How Foober Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">Three simple steps from request to delivery. No complicated booking systems, no lengthy contracts.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-[#5DB347]" />
                </div>
                <div className="text-xs font-bold text-[#5DB347] mb-1">Step {i + 1}</div>
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Move */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-4">What Can Foober Deliver?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">From a single bag of fertilizer to a full truckload of grain — Foober handles agricultural logistics of any size.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {USE_CASES.map((uc, i) => (
              <div key={i} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-[#5DB347]/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3">
                  <uc.icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-1">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Fleet */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-4">The Right Vehicle for Every Load</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">Our drivers operate bicycles, motorcycles (boda-bodas), cars, vans, and trucks. You choose the right fit — or let us suggest one.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Bicycle', desc: 'Documents, small parcels', icon: '🚲' },
              { name: 'Motorcycle', desc: 'Farm inputs, medium parcels', icon: '🏍️' },
              { name: 'Car', desc: 'Larger items, multi-package', icon: '🚗' },
              { name: 'Van / Pickup', desc: 'Bulk goods, equipment', icon: '🚐' },
              { name: 'Truck', desc: 'Heavy cargo, commodities', icon: '🚛' },
            ].map((v, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <span className="text-3xl block mb-2">{v.icon}</span>
                <h4 className="font-bold text-[#1B2A4A] text-sm mb-1">{v.name}</h4>
                <p className="text-xs text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Foober */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-12">Why Farmers and Suppliers Choose Foober</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Fast Matching', desc: 'Get matched with a nearby driver in minutes, not days. Our network covers urban and rural areas.' },
              { icon: Shield, title: 'Verified & Insured', desc: 'Every driver is vetted by AFU. Vehicle documentation, license, and roadworthiness verified before approval.' },
              { icon: Star, title: 'Rated by Community', desc: 'Drivers are rated after every delivery. Top-rated drivers get priority on high-value loads.' },
              { icon: Smartphone, title: 'Real-Time Tracking', desc: 'Know exactly where your goods are at every moment. Get SMS and in-app updates at each stage.' },
              { icon: Route, title: 'Any Distance', desc: 'From 2km within your village to 500km cross-country. Foober handles short hauls and long-distance alike.' },
              { icon: Clock, title: 'On Your Schedule', desc: 'Request deliveries for now or schedule them for tomorrow. Flexible timing that works for harvest cycles.' },
              { icon: Globe, title: '20 Countries', desc: 'Operating across Botswana, Zimbabwe, Kenya, Tanzania, Nigeria, Ghana, Uganda, Zambia, and 12 more African nations.' },
              { icon: CheckCircle2, title: 'Marketplace Integration', desc: 'Buy from the AFU Marketplace and select Foober delivery at checkout. Seamless from purchase to doorstep.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2A4A] text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-4">Where Foober Operates</h2>
          <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto">Active across 20 African countries and expanding. Urban, peri-urban, and rural coverage.</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {COVERAGE.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full bg-[#5DB347]/10 text-[#5DB347] text-xs font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-4">Foober for Business</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Suppliers, cooperatives, and agribusinesses can integrate Foober into their operations for reliable last-mile delivery. Reduce transport costs, improve delivery times, and track every shipment.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Dedicated fleet management for regular routes',
                  'Volume discounts for high-frequency shippers',
                  'API integration for automated dispatch',
                  'Monthly invoicing and reporting',
                  'Priority driver assignment for time-sensitive goods',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#5DB347] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="inline-flex items-center gap-2 text-[#5DB347] font-semibold text-sm hover:underline">
                Contact us for business rates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200">
              <h3 className="font-bold text-[#1B2A4A] mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Countries', value: '20' },
                  { label: 'Vehicle Types', value: '5' },
                  { label: 'Avg Matching Time', value: '<15 min' },
                  { label: 'Platform', value: 'Web + Mobile' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-[#5DB347]">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="py-16 bg-[#1B2A4A]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Earn Money as a Foober Logistics Partner</h2>
          <p className="text-white/70 mb-4 leading-relaxed">
            Own a motorcycle, car, van, or truck? Join the Foober driver network and earn per delivery on your own schedule. We provide the platform, you provide the wheels.
          </p>
          <ul className="text-left max-w-md mx-auto mb-8 space-y-2">
            {[
              'Set your own hours — work when it suits you',
              'Keep 85% of every delivery fee',
              'Get paid weekly directly to your mobile money',
              'Free driver training and onboarding support',
              'Build your reputation with community ratings',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#5DB347] flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/driver/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#5DB347] text-white font-semibold hover:bg-[#4a9a39] transition-colors min-h-[48px]"
            >
              Apply to Drive <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/20 min-h-[48px]"
            >
              <Phone className="w-4 h-4" /> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
