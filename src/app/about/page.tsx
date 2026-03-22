import Link from "next/link";
import { Sprout, Tractor, Building2, ShieldCheck, Settings, Globe, BarChart3, Lock } from "lucide-react";
import LeadershipSection from "@/components/LeadershipSection";
import CountryTeams from "@/components/CountryTeams";

export const metadata = {
  title: "About AFU - African Farming Union",
  description:
    "Learn about AFU's mission to transform African agriculture through integrated financing, inputs, processing, and offtake across 10 countries.",
  openGraph: {
    title: "About AFU - African Farming Union",
    description:
      "Learn about AFU's mission to transform African agriculture through integrated financing, inputs, processing, and offtake across 10 countries.",
    url: "https://afu-portal.vercel.app/about",
    images: [
      {
        url: "https://afu-portal.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "About the African Farming Union",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AFU - African Farming Union",
    description:
      "Learn about AFU's mission to transform African agriculture through integrated financing, inputs, processing, and offtake across 10 countries.",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative py-28 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=700&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(15,26,48,0.92) 0%, rgba(27,42,74,0.85) 60%, rgba(93,179,71,0.4) 100%)' }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
              style={{ color: '#6ABF4B' }}
            >
              🌍 Pan-African Agriculture Development Platform
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              About <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">AFU</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-10">
              The African Farming Union is a vertically integrated agriculture development platform —
              functioning as a specialized agri dev bank and full-stack execution engine for African farmers.
            </p>
            {/* 3 stat pills — glassmorphism */}
            <div className="flex flex-wrap gap-4">
              {[
                { value: '9', label: 'Countries' },
                { value: '247+', label: 'Active Members' },
                { value: '$50B+', label: 'Market Opportunity' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center hover:-translate-y-1 hover:bg-white/15 transition-all duration-300 shadow-lg shadow-black/10"
                >
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>
              The Problem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">The Broken Cash Cycle</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: "Inputs Needed", desc: "Capital arrives late" },
              { title: "Yields Stay Low", desc: "No guaranteed buyers" },
              { title: "Crops Sold Cheap", desc: "Or wasted entirely" },
              { title: "Payments Delayed", desc: "Next season underfunded" },
              { title: "Repeat", desc: "The cycle continues" },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-[#5DB347]"
              >
                <div
                  className="w-14 h-14 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg shadow-[#5DB347]/30 hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #3d8a2e)' }}
                >
                  {i + 1}
                </div>
                <h3 className="font-bold text-[#1B2A4A] mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mt-8 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347]">
            <p className="text-[#1B2A4A] text-center font-medium">
              Africa&apos;s agriculture doesn&apos;t fail at farming &mdash; it fails at{' '}
              <strong style={{ color: '#5DB347' }}>finance + offtake + processing</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ─── OPERATING MODEL ─── */}
      <section className="py-16" style={{ background: '#EDF4EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>
              How We Work
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">Operating Model</span>
            </h2>
            <p className="text-gray-500 max-w-2xl">
              AFU operates as a portfolio of programs + projects across three tiers:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: "Tier A",
                name: "Smallholder & SME",
                icon: <Sprout className="w-6 h-6 text-white" />,
                items: [
                  "Input bundles + seasonal working capital",
                  "Training + compliance onboarding",
                  "Guaranteed buy-back routes",
                ],
              },
              {
                tier: "Tier B",
                name: "Commercial Farms",
                icon: <Tractor className="w-6 h-6 text-white" />,
                items: [
                  "Equipment finance, irrigation, high-value crop financing",
                  "Structured contracts + processing access",
                  "Market linkage + export packaging",
                ],
              },
              {
                tier: "Tier C",
                name: "Large Projects",
                icon: <Building2 className="w-6 h-6 text-white" />,
                items: [
                  "Project finance + infrastructure",
                  "Anchor processing hubs",
                  "Full corridor offtake contracts",
                ],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-[#5DB347]"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#5DB347]/30 hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #3d8a2e)' }}
                >
                  {item.icon}
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#5DB347' }}>
                  {item.tier}
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] mb-4">{item.name}</h3>
                <ul className="space-y-3">
                  {item.items.map((li, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-600 text-sm">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: '#5DB347' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RISK CONTROL ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>
              Risk Management
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">Risk &amp; How We Control It</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { risk: "Credit Risk", mitigation: "Offtake contracts, tranche releases, input-in-kind financing, aggregation control", icon: <ShieldCheck className="w-6 h-6 text-white" /> },
              { risk: "Execution Risk", mitigation: "Commercial farmer operators + phased rollout", icon: <Settings className="w-6 h-6 text-white" /> },
              { risk: "FX / Regulatory Risk", mitigation: "Structured trade routes + multi-country diversification", icon: <Globe className="w-6 h-6 text-white" /> },
              { risk: "Commodity Price Risk", mitigation: "Processing/value-add + contract pricing mechanisms", icon: <BarChart3 className="w-6 h-6 text-white" /> },
              { risk: "Fraud / Leakage", mitigation: "Controlled procurement + field verification + audit trail", icon: <Lock className="w-6 h-6 text-white" /> },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-[#5DB347]"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#5DB347]/30 hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #3d8a2e)' }}
                >
                  {item.icon}
                </div>
                <div className="font-bold text-[#1B2A4A] md:min-w-[200px]">{item.risk}</div>
                <div className="text-gray-600 text-sm">{item.mitigation}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LEADERSHIP ─── */}
      <LeadershipSection />

      {/* ─── COUNTRY TEAMS ─── */}
      <CountryTeams />

      {/* ─── FINAL CTA ─── */}
      <section
        className="py-16 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a3a 100%)' }}
      >
        {/* Green glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-15 blur-3xl" style={{ background: '#5DB347' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider mb-4 block" style={{ color: '#6ABF4B' }}>
            Join the Movement
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join the <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">AFU Ecosystem</span>
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Whether you&apos;re a farmer, investor, partner, or sponsor — there&apos;s a place for you in the AFU platform.
          </p>
          <Link
            href="/apply"
            className="inline-block font-semibold text-lg px-10 py-4 rounded-2xl transition-all duration-300 text-white shadow-xl shadow-[#5DB347]/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5DB347]/40"
            style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
          >
            Apply for Membership →
          </Link>
        </div>
      </section>
    </>
  );
}
