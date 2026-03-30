import Link from "next/link";
import {
  Scale,
  FileText,
  Shield,
  Gavel,
  ArrowRight,
  Users,
  Landmark,
  BookOpen,
  AlertTriangle,
  MapPin,
  Handshake,
} from "lucide-react";

import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Legal Assistance',
  description: 'Professional legal support for African farmers. Land rights, contract review, dispute resolution, and regulatory compliance services.',
  path: '/services/legal-assistance',
});

const steps = [
  {
    number: "01",
    title: "Request a Consultation",
    description:
      "Submit your legal query through the AFU platform or call our toll-free helpline. Describe your situation — land dispute, contract question, regulatory issue, or cooperative matter — and we match you with the right specialist.",
  },
  {
    number: "02",
    title: "Expert Review",
    description:
      "A qualified legal professional from our network reviews your case. For straightforward matters, you receive guidance within 48 hours. Complex cases get a full assessment with recommended next steps and cost estimates.",
  },
  {
    number: "03",
    title: "Advice & Representation",
    description:
      "Receive clear, actionable legal advice in plain language. Where needed, our partner law firms provide direct representation — from drafting contracts to appearing at land tribunals and mediation sessions.",
  },
  {
    number: "04",
    title: "Resolution & Follow-Up",
    description:
      "We track every case to resolution and follow up to ensure outcomes are enforced. All documents are stored securely in your AFU profile for future reference, building your legal history and strengthening future claims.",
  },
];

const features = [
  {
    icon: MapPin,
    title: "Land Rights & Tenure",
    description:
      "Secure your land. We help farmers navigate title deeds, customary land rights, lease agreements, and land dispute resolution. Our specialists understand both statutory and traditional tenure systems across 20 African countries.",
  },
  {
    icon: FileText,
    title: "Contract Review & Drafting",
    description:
      "Never sign a bad deal. Every offtake agreement, supply contract, equipment lease, and partnership MOU can be reviewed by our legal team before you commit. We also draft standard contracts tailored to your needs.",
  },
  {
    icon: Gavel,
    title: "Dispute Resolution",
    description:
      "Fast, fair outcomes. We provide mediation, arbitration, and where necessary, litigation support for disputes with buyers, suppliers, landlords, cooperatives, and government agencies.",
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description:
      "Stay on the right side of the law. Export permits, phytosanitary certificates, tax obligations, environmental regulations, and labour law compliance — we guide you through every requirement.",
  },
  {
    icon: Users,
    title: "Cooperative Governance",
    description:
      "Build strong farmer organizations. We assist with cooperative registration, constitution drafting, governance frameworks, AGM procedures, and internal dispute resolution for farmer groups and associations.",
  },
  {
    icon: BookOpen,
    title: "Intellectual Property",
    description:
      "Protect your innovations. From registering new seed varieties and organic certifications to trademarking your farm brand and protecting indigenous knowledge, we help farmers own their intellectual assets.",
  },
];

const stats = [
  { value: "10,000+", label: "Farmers Assisted", sub: "across all legal services" },
  { value: "20", label: "Countries Covered", sub: "with local legal expertise" },
  { value: "95%", label: "Resolution Rate", sub: "cases resolved successfully" },
  { value: "50+", label: "Partner Law Firms", sub: "pan-African legal network" },
];

export default function LegalAssistancePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&h=1080&fit=crop')",
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
              Legal Assistance
            </span>
            <br />for African Farmers
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Professional legal support that protects your land, your contracts, and your livelihood. From land tenure disputes to export compliance, our pan-African network of 50+ law firms has you covered.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Get Legal Help <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Partner With Us
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
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Works
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Accessible legal support designed for farmers — no legal jargon, no hidden fees, and available in local languages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
                  <div
                    className="text-5xl font-black mb-4"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-[#F8FAF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              What We{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Cover
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive legal services covering every aspect of agricultural life in Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#EBF7E5] flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-[#5DB347]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </p>
                <p className="font-bold text-[#1B2A4A] mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 gradient-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Scale className="w-12 h-12 text-[#5DB347] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Protect Your Rights. Grow With Confidence.
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Every AFU member has access to legal support. Join today and never face a legal challenge alone.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Become a Member <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300"
            >
              <Handshake className="w-4 h-4" /> Join as a Law Firm Partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
