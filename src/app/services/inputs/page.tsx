import Link from "next/link";
import {
  Sprout,
  Package,
  Truck,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Users,
  Handshake,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Farm Inputs & Equipment',
  description: 'Bulk procurement of seeds, fertilizers, pesticides, and irrigation equipment at wholesale prices. Input credit and equipment leasing for African farmers.',
  path: '/services/inputs',
});

const steps = [
  {
    number: "01",
    title: "Join a Cooperative",
    description:
      "Register your farm or cooperative on the AFU platform. We aggregate demand across thousands of smallholders to unlock bulk pricing power.",
  },
  {
    number: "02",
    title: "Select Your Inputs",
    description:
      "Browse our curated catalogue of certified seeds, fertilizers, crop protection products, and irrigation equipment from 500+ vetted suppliers.",
  },
  {
    number: "03",
    title: "Access Input Credit",
    description:
      "Qualify for buy-now-pay-at-harvest financing. No upfront cash needed — repayment is automatically deducted from your offtake proceeds through our escrow system.",
  },
  {
    number: "04",
    title: "Receive & Grow",
    description:
      "Inputs are delivered directly to collection points near your farm. Our agronomists provide guidance on application rates and timing for maximum yield.",
  },
];

const features = [
  {
    icon: Package,
    title: "Bulk Procurement",
    description:
      "We consolidate orders across cooperatives and negotiate directly with manufacturers, cutting out middlemen to deliver wholesale prices on seeds, fertilizers, and agrochemicals.",
  },
  {
    icon: Sprout,
    title: "Certified Seed Varieties",
    description:
      "Access climate-adapted, high-yield seed varieties certified by national agricultural research institutes. Every seed batch is tested for germination rate and genetic purity.",
  },
  {
    icon: Truck,
    title: "Equipment Leasing",
    description:
      "Hire-purchase and leasing options for tractors, irrigation systems, and post-harvest equipment. Spread costs over multiple seasons with flexible repayment schedules.",
  },
  {
    icon: CreditCard,
    title: "Input Credit Facility",
    description:
      "Buy now, pay at harvest. Our input credit programme is secured against confirmed offtake agreements, so farmers access quality inputs without upfront capital.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description:
      "Every supplier undergoes rigorous vetting. Products are tested at accredited laboratories before distribution. Counterfeit inputs are a thing of the past.",
  },
  {
    icon: BarChart3,
    title: "Smart Recommendations",
    description:
      "AI-driven input recommendations based on your soil type, crop history, local weather patterns, and target yield. Order exactly what your farm needs — nothing more, nothing less.",
  },
];

const stats = [
  { value: "40%", label: "Average Cost Savings", sub: "vs. retail prices" },
  { value: "10,000+", label: "Farmers Served", sub: "across 20 countries" },
  { value: "500+", label: "Supplier Partners", sub: "vetted & certified" },
  { value: "$25M+", label: "Inputs Distributed", sub: "in cumulative value" },
];

export default function InputsServicePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1473172707857-f9e276582ab6?w=1920&h=1080&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(27,42,74,0.92) 0%, rgba(27,42,74,0.7) 50%, rgba(93,179,71,0.45) 100%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-[#5DB347]/30">
            Service
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
              }}
            >
              Agricultural Inputs
            </span>
            <br />& Equipment
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Bulk procurement of seeds, fertilizers, crop protection, and
            irrigation equipment at wholesale prices. Input credit lets you buy
            now and pay at harvest — backed by our escrow-secured offtake model.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Order Inputs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              How It{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Works
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From registration to delivery in four simple steps. Our
              cooperative aggregation model turns smallholder orders into bulk
              buying power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
                  <div
                    className="text-5xl font-black mb-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6ABF4B, #5DB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-16 bg-[#EBF7E5]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Why Farmers Choose{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                AFU Inputs
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quality-assured products, fair pricing, and flexible payment — all
              designed to maximise yield and minimise financial risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-[#EBF7E5]">
                    <Icon className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-[#1B2A4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Impact
              </span>{" "}
              in Numbers
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
              >
                <div
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #6ABF4B, #5DB347)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-white font-semibold mb-1">{s.label}</div>
                <div className="text-gray-400 text-sm">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 md:p-14 text-center text-white shadow-xl shadow-[#5DB347]/20"
            style={{
              background: "linear-gradient(135deg, #5DB347, #449933)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Cut Input Costs by 40%?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of African farmers accessing quality seeds,
              fertilizers, and equipment at wholesale prices — with the option to
              pay at harvest.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-white text-[#449933] px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Users className="w-5 h-5" /> Become a Member
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Handshake className="w-5 h-5" /> Partner as a Supplier
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
