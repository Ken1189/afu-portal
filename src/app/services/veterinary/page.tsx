import Link from "next/link";
import {
  Stethoscope,
  Heart,
  Syringe,
  Activity,
  ArrowRight,
  Phone,
  Microscope,
  Egg,
  Apple,
  Handshake,
  Clock,
} from "lucide-react";

import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Veterinary Services',
  description: 'Professional veterinary care for African livestock farmers. On-farm visits, disease prevention, vaccination programs, and 24/7 emergency hotline.',
  path: '/services/veterinary',
});

const steps = [
  {
    number: "01",
    title: "Register Your Livestock",
    description:
      "Add your animals to the AFU platform — cattle, goats, poultry, pigs, or any livestock. Each animal gets a digital health record tracking vaccinations, treatments, weight, and breeding history.",
  },
  {
    number: "02",
    title: "Schedule a Visit",
    description:
      "Book a routine check-up, vaccination session, or specialist consultation through the app. Our network of 200+ qualified veterinarians covers both urban and remote farming areas across 20 countries.",
  },
  {
    number: "03",
    title: "Treatment & Care",
    description:
      "Receive professional diagnosis and treatment on your farm. Our vets carry essential medicines, vaccines, and diagnostic equipment. Prescriptions and treatment plans are recorded digitally for follow-up.",
  },
  {
    number: "04",
    title: "Ongoing Health Management",
    description:
      "Get automated vaccination reminders, seasonal disease alerts for your region, and nutrition recommendations. Build a complete health history that increases the value and insurability of your herd.",
  },
];

const features = [
  {
    icon: Stethoscope,
    title: "On-Farm Veterinary Visits",
    description:
      "Qualified vets come to your farm for routine check-ups, sick animal examinations, and herd health assessments. No need to transport animals — our mobile vet teams bring the clinic to you with fully equipped vehicles.",
  },
  {
    icon: Syringe,
    title: "Disease Prevention & Vaccination",
    description:
      "Comprehensive vaccination programs for foot-and-mouth, Newcastle disease, East Coast fever, brucellosis, and more. Seasonal campaigns coordinated with national veterinary authorities to protect your investment.",
  },
  {
    icon: Egg,
    title: "Breeding & Genetics",
    description:
      "Artificial insemination services, breed selection advice, and genetic improvement programs. Access superior genetics to improve milk yields, growth rates, and disease resistance in your herd.",
  },
  {
    icon: Apple,
    title: "Feed & Nutrition Advisory",
    description:
      "Customised feeding programs based on your livestock type, local feed availability, and production goals. Our nutritionists help you reduce feed costs while improving animal health and output.",
  },
  {
    icon: Phone,
    title: "24/7 Emergency Hotline",
    description:
      "Round-the-clock veterinary emergency support. Call our hotline for immediate advice on birthing complications, sudden illness, snake bites, poisoning, and other urgent animal health situations.",
  },
  {
    icon: Microscope,
    title: "Laboratory & Diagnostics",
    description:
      "Access to partner diagnostic laboratories for blood tests, faecal analysis, milk quality testing, post-mortem examinations, and disease surveillance. Fast results with clear treatment recommendations.",
  },
];

const stats = [
  { value: "500K+", label: "Animals Treated", sub: "across all livestock types" },
  { value: "200+", label: "Qualified Vets", sub: "pan-African network" },
  { value: "20", label: "Countries Covered", sub: "with local vet expertise" },
  { value: "24/7", label: "Emergency Line", sub: "always available for crises" },
];

export default function VeterinaryServicesPage() {
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
              Veterinary
            </span>
            <br />Services
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Professional animal healthcare for African livestock farmers. From routine vaccinations to emergency care, our network of 200+ qualified veterinarians keeps your herd healthy and productive.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Book a Vet Visit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Phone className="w-4 h-4" /> Emergency Hotline
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
              Modern veterinary care meets African farming realities. Affordable, accessible, and available where you need it.
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
              Our{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Services
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete animal healthcare — from prevention to emergency response.
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
          <Heart className="w-12 h-12 text-[#5DB347] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Healthy Animals. Profitable Farms.
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Every AFU member gets access to affordable veterinary care. Protect your livestock investment and boost productivity.
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
              <Handshake className="w-4 h-4" /> Join as a Vet Partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
