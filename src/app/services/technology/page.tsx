import Link from "next/link";
import {
  Satellite,
  Monitor,
  Smartphone,
  Radio,
  BrainCircuit,
  Database,
  ArrowRight,
  Users,
  Stethoscope,
  Wifi,
} from "lucide-react";

import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'AgriTech Solutions',
  description: 'Digital transformation for African farming. Precision agriculture, farm management software, mobile apps, IoT sensors, and AI analytics.',
  path: '/services/technology',
});

const techOfferings = [
  {
    title: "Precision Farming",
    description:
      "Satellite imagery, soil sensors, and drone mapping to optimize every hectare. Know exactly where to plant, irrigate, and apply inputs for maximum yield.",
    icon: Satellite,
    features: ["Satellite imagery", "Soil sensors", "Drone mapping", "Variable rate application"],
  },
  {
    title: "Farm Management Software",
    description:
      "End-to-end crop tracking, financial record-keeping, and compliance management. One platform for your entire farm operation.",
    icon: Monitor,
    features: ["Crop tracking", "Financial records", "Compliance management", "Harvest scheduling"],
  },
  {
    title: "Mobile Apps",
    description:
      "The Mkulima Hub farmer app puts your farm in your pocket. Access the marketplace, get weather alerts, and manage operations from anywhere.",
    icon: Smartphone,
    features: ["Mkulima Hub app", "Marketplace access", "Weather alerts", "SMS notifications"],
  },
  {
    title: "IoT & Sensors",
    description:
      "Connected devices across your farm monitoring soil moisture, weather conditions, and livestock health in real-time.",
    icon: Radio,
    features: ["Soil moisture sensors", "Weather stations", "Livestock tracking", "Water level monitoring"],
  },
  {
    title: "AI & Analytics",
    description:
      "Machine learning models that diagnose crop health, predict market prices, and forecast yields. Turn your farm data into actionable insights.",
    icon: BrainCircuit,
    features: ["Crop health AI", "Market predictions", "Yield forecasting", "Pest detection"],
  },
  {
    title: "Data & Research",
    description:
      "Open data platform connecting farmers with agricultural research institutions. Access the latest studies, benchmarks, and best practices.",
    icon: Database,
    features: ["Open data platform", "Research partnerships", "Benchmarking", "Best practice library"],
  },
];

const stats = [
  {
    value: "3,200+",
    label: "Farmers using our apps",
    icon: Users,
  },
  {
    value: "15,000+",
    label: "AI crop diagnoses completed",
    icon: Stethoscope,
  },
  {
    value: "50+",
    label: "IoT sensors deployed across farms",
    icon: Wifi,
  },
];

const partners = [
  "CropSat",
  "AgriTech Africa",
  "FarmOS",
  "Aerobotics",
  "SunCulture",
  "Twiga Foods",
  "Apollo Agriculture",
  "Gro Intelligence",
];

export default function TechnologyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#5DB347]/20 text-[#EBF7E5] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              AgTech Solutions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Agricultural Technology
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Driving digital transformation in African farming. From satellite
              imagery to AI-powered diagnostics, we equip farmers with the tools
              to increase yields, reduce waste, and compete on global markets.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Offerings Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Our Technology Offerings
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Six technology pillars designed specifically for the African
              agricultural context, from smallholder to commercial scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techOfferings.map((offering, i) => {
              const Icon = offering.icon;
              return (
                <div
                  key={i}
                  className="bg-cream rounded-2xl p-8 hover:shadow-lg transition-all border border-transparent hover:border-[#5DB347]/20 group"
                >
                  <div className="w-14 h-14 bg-[#5DB347] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#449933] transition-colors">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">
                    {offering.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">
                    {offering.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {offering.features.map((f, j) => (
                      <span
                        key={j}
                        className="bg-white text-navy text-xs font-medium px-3 py-1 rounded-full border border-gray-200"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Digital Farmer Stats */}
      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Digital Impact in Numbers
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our technology is already transforming farms across Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="text-center bg-white/5 rounded-2xl p-8 border border-white/10"
                >
                  <div className="w-14 h-14 bg-[#5DB347]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-[#5DB347]" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership Logos */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-navy mb-3">
              Working with Leading AgTech Providers
            </h2>
            <p className="text-gray-500 text-sm">
              We partner with the best to bring world-class technology to
              African farmers.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 flex items-center justify-center h-20 border border-gray-100 hover:border-[#5DB347]/30 transition-colors"
              >
                <span className="text-navy font-semibold text-sm">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-2xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Digitise Your Farm?
            </h2>
            <p className="text-[#EBF7E5]/80 text-lg mb-8 max-w-2xl mx-auto">
              Try Mkulima Hub, our all-in-one farmer app. Track crops, access
              the marketplace, get AI diagnostics, and manage your farm from
              your phone.
            </p>
            <Link
              href="/farm"
              className="inline-flex items-center gap-2 bg-white text-[#5DB347] hover:bg-cream px-8 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Try Mkulima Hub
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
