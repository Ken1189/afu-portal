'use client';

import Link from 'next/link';
import { Truck, Package, MapPin, Clock, DollarSign, Star, ArrowRight, Shield, Zap, Users } from 'lucide-react';

const STEPS = [
  { icon: Package, title: 'Request Delivery', desc: 'Tell us what you need delivered, where from and where to.' },
  { icon: Truck, title: 'Driver Matches', desc: 'A nearby Foober driver accepts your request and heads to pickup.' },
  { icon: MapPin, title: 'Track & Receive', desc: 'Track your delivery in real-time until it arrives at your door.' },
];

const VEHICLE_TYPES = [
  { name: 'Bicycle', rate: '$0.10/km', best: 'Small packages, documents', min: '$2.00' },
  { name: 'Motorcycle', rate: '$0.15/km', best: 'Medium parcels, farm inputs', min: '$3.00' },
  { name: 'Car', rate: '$0.20/km', best: 'Larger items, multiple packages', min: '$5.00' },
  { name: 'Van', rate: '$0.30/km', best: 'Bulk goods, equipment', min: '$8.00' },
  { name: 'Truck', rate: '$0.50/km', best: 'Heavy cargo, commodity transport', min: '$12.00' },
];

export default function FooberLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4470] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5DB347]/20 text-[#5DB347] text-xs font-semibold mb-6">
              <Truck className="w-3.5 h-3.5" /> Foober by AFU
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Deliver Anything,<br />Anywhere in Africa
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-lg">
              Foober connects you with local drivers for fast, affordable delivery of farm inputs, produce, equipment, and any goods across 20 African countries.
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
                <Users className="w-4 h-4" /> Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-12">How Foober Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-[#5DB347]" />
                </div>
                <div className="text-xs font-bold text-[#5DB347] mb-1">Step {i + 1}</div>
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-10 max-w-lg mx-auto">Pay per delivery based on distance and vehicle type. No hidden fees.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {VEHICLE_TYPES.map((v) => (
              <div key={v.name} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <h4 className="font-bold text-[#1B2A4A] mb-1">{v.name}</h4>
                <p className="text-xl font-bold text-[#5DB347] mb-1">{v.rate}</p>
                <p className="text-xs text-gray-500 mb-2">Min: {v.min}</p>
                <p className="text-xs text-gray-400">{v.best}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">+ $2-5 base fee depending on vehicle. 15% platform fee included.</p>
        </div>
      </section>

      {/* Why Foober */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] text-center mb-12">Why Choose Foober</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Fast Matching', desc: 'Get matched with a nearby driver in minutes' },
              { icon: DollarSign, title: 'Fair Pricing', desc: 'Distance-based rates with no surge pricing' },
              { icon: Shield, title: 'Verified Drivers', desc: 'All drivers are vetted and approved by AFU' },
              { icon: Star, title: 'Rated Drivers', desc: 'Community ratings ensure quality service' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#5DB347]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2A4A] text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="py-16 bg-[#1B2A4A]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Earn Money as a Foober Driver</h2>
          <p className="text-white/70 mb-8">Set your own hours, use your own vehicle, and earn per delivery. Join hundreds of drivers across Africa.</p>
          <Link
            href="/driver/apply"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#5DB347] text-white font-semibold hover:bg-[#4a9a39] transition-colors min-h-[48px]"
          >
            Apply to Drive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
