'use client';

import Link from "next/link";
import { Tractor, Droplets, Wrench, Zap, Lock, CircleAlert, Cog, Flame, Truck, ShieldAlert, type LucideIcon } from "lucide-react";

const coverTypes = [
  {
    name: "Tractors & Heavy Machinery",
    description:
      "Comprehensive cover for tractors, harvesters, and heavy farming equipment against breakdown, theft, fire, and accidental damage.",
    icon: Tractor,
  },
  {
    name: "Irrigation Systems",
    description:
      "Protect centre pivots, drip systems, pumps, and boreholes against mechanical failure, storm damage, and electrical surges.",
    icon: Droplets,
  },
  {
    name: "Implements & Attachments",
    description:
      "Cover for ploughs, planters, sprayers, trailers, and all farming implements whether in use, in transit, or in storage.",
    icon: Wrench,
  },
  {
    name: "Solar & Power Equipment",
    description:
      "Protection for solar panels, generators, batteries, and electrical infrastructure essential to your farm operations.",
    icon: Zap,
  },
];

const perils = [
  { name: "Theft", icon: Lock, desc: "Full replacement value if equipment is stolen, including from fields and storage." },
  { name: "Accidental Damage", icon: CircleAlert, desc: "Covers operator error, collisions, and unintentional damage during normal use." },
  { name: "Mechanical Breakdown", icon: Cog, desc: "Major mechanical and electrical failures beyond normal wear and tear." },
  { name: "Fire & Storm", icon: Flame, desc: "Protection against fire, lightning strikes, hail damage, and severe weather events." },
  { name: "Transit Damage", icon: Truck, desc: "Cover while equipment is being transported between farms or to repair facilities." },
  { name: "Vandalism", icon: ShieldAlert, desc: "Protection against malicious damage and sabotage of farming equipment." },
];

const steps = [
  { step: "List", desc: "Register your equipment on the AFU platform with photos, serial numbers, and valuations." },
  { step: "Quote", desc: "Receive an instant quote based on equipment type, age, value, and your location." },
  { step: "Insure", desc: "Select your cover level and pay monthly or annually via mobile money or bank transfer." },
  { step: "Claim", desc: "Report incidents via the AFU app. Fast assessment and repair or replacement authorization." },
];

export default function EquipmentInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Equipment Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Your equipment is the backbone of your farm. Protect tractors,
            irrigation systems, and implements against theft, damage, and
            breakdown with comprehensive cover.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/farm/insurance/quote"
              className="bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/services/insurance"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              All Insurance Products
            </Link>
          </div>
        </div>
      </section>

      {/* Cover Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              What We Cover
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From small implements to large machinery, every piece of equipment
              on your farm can be protected.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverTypes.map((item, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><item.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-2">{item.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perils */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Perils Covered
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Comprehensive protection against the most common risks facing
              farming equipment in Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perils.map((peril, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><peril.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-2">{peril.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {peril.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.step}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Protect Your Equipment</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            One breakdown or theft can cost you an entire season. Get equipment
            insurance that keeps your farm running no matter what.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get an Equipment Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
