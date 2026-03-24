'use client';

import Link from "next/link";
import { ShieldCheck, Heart, Bandage, Users, type LucideIcon } from "lucide-react";

const products = [
  {
    name: "Life Cover",
    description:
      "Financial protection for your family if anything happens to you. Lump-sum payout to cover debts, school fees, and farm continuity.",
    icon: ShieldCheck,
    coverage: "Up to $50,000",
  },
  {
    name: "Funeral Cover",
    description:
      "Immediate payout within 48 hours to cover funeral costs and support your family during a difficult time. No medical required.",
    icon: Heart,
    coverage: "Up to $5,000",
  },
  {
    name: "Personal Accident",
    description:
      "Coverage for accidental injury or disability that prevents you from farming. Covers medical costs and income replacement.",
    icon: Bandage,
    coverage: "Up to $20,000",
  },
  {
    name: "Family Protection Plan",
    description:
      "Bundled life, funeral, and accident cover for you and your immediate family at a discounted group rate.",
    icon: Users,
    coverage: "Custom",
  },
];

const benefits = [
  "No medical examination required for basic cover",
  "Premiums as low as $3/month for funeral cover",
  "Claims paid within 48 hours for funeral cover",
  "Coverage continues even if you change farms",
  "Pay via mobile money, bank transfer, or harvest deduction",
  "Family members can be added at discounted rates",
];

const steps = [
  { step: "Choose", desc: "Select the life and personal cover that suits your family's needs and budget." },
  { step: "Apply", desc: "Complete a simple application via the AFU app or dashboard. No paperwork needed." },
  { step: "Pay", desc: "Affordable monthly premiums deducted automatically via mobile money or bank." },
  { step: "Claim", desc: "In the event of a claim, beneficiaries receive fast payouts with minimal documentation." },
];

export default function LifeInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Life &amp; Personal Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Protect your family and your future. Affordable life cover, funeral
            plans, and personal accident insurance designed for African farming
            families.
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

      {/* Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Cover Options
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From basic funeral cover to comprehensive family protection, we
              have a plan for every budget.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><product.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-2">{product.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {product.description}
                </p>
                <div className="text-xs font-semibold text-teal">
                  Coverage: {product.coverage}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-6">
                Why Choose AFU Life Cover?
              </h2>
              <ul className="space-y-4">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="text-teal mt-0.5 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">Minimum entry age</span>
                  <span className="font-semibold text-sm">18 years</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">Maximum entry age</span>
                  <span className="font-semibold text-sm">65 years</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">Waiting period</span>
                  <span className="font-semibold text-sm">30 days (natural causes)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Funeral claim payout</span>
                  <span className="font-semibold text-sm">Within 48 hours</span>
                </div>
              </div>
            </div>
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
          <h2 className="text-3xl font-bold mb-4">Protect Your Family Today</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Life is unpredictable. Make sure your loved ones are taken care of
            no matter what happens. Get affordable life cover in under 5 minutes.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Life Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
