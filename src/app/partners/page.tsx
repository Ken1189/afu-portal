"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat,
  Briefcase,
  Landmark,
  GraduationCap,
  ArrowRight,
  MapPin,
  Target,
} from "lucide-react";

type PartnerTab = "unions" | "business" | "governments" | "universities";

interface Partner {
  name: string;
  initials: string;
  color: string;
  type: string;
  country: string;
  description: string;
  focus: string;
}

const tabs: { key: PartnerTab; label: string; icon: typeof Wheat }[] = [
  { key: "unions", label: "Farming Unions", icon: Wheat },
  { key: "business", label: "Business Networks", icon: Briefcase },
  { key: "governments", label: "Governments", icon: Landmark },
  { key: "universities", label: "Universities", icon: GraduationCap },
];

const partners: Record<PartnerTab, Partner[]> = {
  unions: [
    {
      name: "Zimbabwe National Farmers Union",
      initials: "ZN",
      color: "bg-green-600",
      type: "National Farmers Union",
      country: "Zimbabwe",
      description:
        "Represents over 300,000 communal and resettlement farmers across Zimbabwe. Advocates for farmer rights, land reform, and market access.",
      focus: "Farmer advocacy & market linkage",
    },
    {
      name: "Botswana Agricultural Union",
      initials: "BA",
      color: "bg-blue-600",
      type: "National Agricultural Union",
      country: "Botswana",
      description:
        "The umbrella body for Botswana's commercial and emerging farmers. Focused on livestock, horticulture, and grain production.",
      focus: "Commercial farming & livestock development",
    },
    {
      name: "Tanzania Farmers Association",
      initials: "TF",
      color: "bg-yellow-600",
      type: "National Farmers Association",
      country: "Tanzania",
      description:
        "Connecting smallholder and medium-scale farmers across Tanzania. Strong focus on cooperative development and export readiness.",
      focus: "Cooperative development & exports",
    },
    {
      name: "Commercial Farmers Union of Zimbabwe",
      initials: "CF",
      color: "bg-[#5DB347]",
      type: "Commercial Farmers Union",
      country: "Zimbabwe",
      description:
        "Supporting commercial agriculture operations with technical expertise, policy advocacy, and market intelligence across Zimbabwe.",
      focus: "Commercial agriculture & policy",
    },
    {
      name: "Botswana Livestock Producers Association",
      initials: "BL",
      color: "bg-red-600",
      type: "Livestock Association",
      country: "Botswana",
      description:
        "Represents cattle and small stock producers. Supports the beef value chain from rangeland management to export-standard abattoirs.",
      focus: "Livestock production & beef exports",
    },
    {
      name: "Tanzania Horticultural Association",
      initials: "TH",
      color: "bg-emerald-600",
      type: "Horticultural Association",
      country: "Tanzania",
      description:
        "Promoting high-value horticulture including flowers, fruits, and vegetables for local and European export markets.",
      focus: "Horticulture & high-value crops",
    },
  ],
  business: [
    {
      name: "First Capital Bank",
      initials: "FC",
      color: "bg-navy",
      type: "Banking & Finance",
      country: "Zimbabwe",
      description:
        "Agricultural lending partner providing seasonal working capital, trade finance, and asset financing for AFU members.",
      focus: "Agricultural lending & trade finance",
    },
    {
      name: "Stanbic Bank Botswana",
      initials: "SB",
      color: "bg-blue-800",
      type: "Banking & Finance",
      country: "Botswana",
      description:
        "Provides structured trade finance facilities, foreign exchange services, and agricultural investment products.",
      focus: "Trade finance & FX services",
    },
    {
      name: "Yara East Africa",
      initials: "YA",
      color: "bg-blue-500",
      type: "Input Supplier",
      country: "Tanzania",
      description:
        "Global crop nutrition company supplying premium fertilisers. Provides agronomic advice and digital farming tools.",
      focus: "Fertiliser supply & agronomy",
    },
    {
      name: "Seed Co International",
      initials: "SC",
      color: "bg-green-700",
      type: "Seed Company",
      country: "Zimbabwe",
      description:
        "Africa's leading seed company providing certified hybrid seeds for maize, soya, wheat, and sorghum varieties.",
      focus: "Certified seed supply",
    },
    {
      name: "Bolloré Logistics Africa",
      initials: "BL",
      color: "bg-orange-600",
      type: "Logistics & Supply Chain",
      country: "Pan-African",
      description:
        "Freight forwarding, warehousing, and cold chain logistics for agricultural exports across Southern and East Africa.",
      focus: "Agricultural logistics & cold chain",
    },
    {
      name: "Aerobotics",
      initials: "AB",
      color: "bg-[#5DB347]",
      type: "AgTech",
      country: "Pan-African",
      description:
        "Drone and satellite analytics platform for precision agriculture. Crop health monitoring, tree counting, and pest detection.",
      focus: "Drone analytics & precision farming",
    },
    {
      name: "Export Trading Group",
      initials: "ET",
      color: "bg-amber-700",
      type: "Commodities Trading",
      country: "Tanzania",
      description:
        "Integrated agricultural trading company providing guaranteed offtake, warehousing, and market access for grain and oilseed crops.",
      focus: "Commodity trading & offtake",
    },
    {
      name: "SunCulture",
      initials: "SU",
      color: "bg-[#5DB347]",
      type: "Solar Energy",
      country: "Pan-African",
      description:
        "Solar-powered irrigation and energy solutions for smallholder farmers. Pay-as-you-go financing model.",
      focus: "Solar irrigation & energy",
    },
  ],
  governments: [
    {
      name: "Ministry of Lands, Agriculture, Fisheries, Water & Rural Development",
      initials: "ZW",
      color: "bg-green-700",
      type: "Ministry of Agriculture",
      country: "Zimbabwe",
      description:
        "Strategic partnership for farmer registration, extension services, and agricultural policy alignment. Co-designing digital agriculture programmes.",
      focus: "Policy alignment & farmer registration",
    },
    {
      name: "Ministry of Agriculture, Food Security and Cooperatives",
      initials: "TZ",
      color: "bg-yellow-600",
      type: "Ministry of Agriculture",
      country: "Tanzania",
      description:
        "Collaboration on food security initiatives, cooperative strengthening, and market information systems across Tanzania.",
      focus: "Food security & cooperative development",
    },
    {
      name: "Ministry of Agriculture, Botswana",
      initials: "BW",
      color: "bg-blue-600",
      type: "Ministry of Agriculture",
      country: "Botswana",
      description:
        "Partnership on the Integrated Support Programme for Arable Agriculture Development (ISPAAD) and livestock sector modernisation.",
      focus: "Arable development & livestock modernisation",
    },
    {
      name: "African Continental Free Trade Area (AfCFTA)",
      initials: "AU",
      color: "bg-emerald-700",
      type: "Continental Trade Agreement",
      country: "Pan-African",
      description:
        "Engagement with AfCFTA secretariat on reducing trade barriers for agricultural products across the continent.",
      focus: "Intra-African agricultural trade",
    },
    {
      name: "African Union - CAADP",
      initials: "AU",
      color: "bg-green-800",
      type: "Continental Body",
      country: "Pan-African",
      description:
        "Aligned with the Comprehensive Africa Agriculture Development Programme (CAADP) framework for agricultural transformation.",
      focus: "Agricultural transformation framework",
    },
  ],
  universities: [
    {
      name: "University of Zimbabwe",
      initials: "UZ",
      color: "bg-red-700",
      type: "Research University",
      country: "Zimbabwe",
      description:
        "Faculty of Agriculture research partnerships in soil science, crop breeding, and agricultural economics.",
      focus: "Soil science & crop breeding research",
    },
    {
      name: "University of Botswana",
      initials: "UB",
      color: "bg-blue-700",
      type: "Research University",
      country: "Botswana",
      description:
        "Collaborative research on dryland farming systems, water harvesting, and climate-resilient agriculture in semi-arid environments.",
      focus: "Dryland farming & climate resilience",
    },
    {
      name: "Sokoine University of Agriculture",
      initials: "SU",
      color: "bg-green-600",
      type: "Agricultural University",
      country: "Tanzania",
      description:
        "Tanzania's premier agricultural university. Joint programmes in agribusiness, food science, and agricultural extension methodologies.",
      focus: "Agribusiness & extension methodology",
    },
    {
      name: "Chinhoyi University of Technology",
      initials: "CU",
      color: "bg-navy",
      type: "Technology University",
      country: "Zimbabwe",
      description:
        "Partnering on agricultural technology innovation, including IoT sensor development, drone technology, and precision farming tools.",
      focus: "AgTech innovation & IoT development",
    },
    {
      name: "Botswana University of Agriculture",
      initials: "BA",
      color: "bg-[#5DB347]",
      type: "Agricultural University",
      country: "Botswana",
      description:
        "Focused on livestock science, range management, and veterinary research relevant to Botswana's pastoral farming systems.",
      focus: "Livestock science & range management",
    },
    {
      name: "Nelson Mandela African Institution of Science and Technology",
      initials: "NM",
      color: "bg-amber-700",
      type: "Science & Technology Institute",
      country: "Tanzania",
      description:
        "Post-graduate research in agricultural biotechnology, food processing technology, and sustainable farming systems.",
      focus: "Biotechnology & food processing",
    },
  ],
};

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<PartnerTab>("unions");

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-[#EBF7E5] text-[#5DB347] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Our Network
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-[#6ABF4B] via-[#5DB347] to-[#8CB89C] bg-clip-text text-transparent">
              Our Partners &amp; Network
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              AFU&apos;s strength lies in its partnerships. We connect farming
              unions, businesses, governments, and universities into a single
              ecosystem that de-risks agriculture and unlocks growth across
              Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs + Partner Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-[#5DB347] to-[#449933] text-white shadow-lg shadow-[#5DB347]/25"
                      : "bg-white/80 backdrop-blur-sm text-[#1B2A4A] hover:bg-[#EBF7E5] border border-gray-200 hover:border-[#5DB347]/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Partner Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {partners[activeTab].map((partner, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  {/* Header with Logo + Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-14 h-14 ${partner.color} rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}
                    >
                      {partner.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#1B2A4A] leading-snug">
                        {partner.name}
                      </h3>
                      <span className="inline-block text-xs text-gray-400 mt-0.5">
                        {partner.type}
                      </span>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#5DB347]" />
                    <span className="text-xs text-gray-500 font-medium">
                      {partner.country}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {partner.description}
                  </p>

                  {/* Focus */}
                  <div className="flex items-center gap-1.5 bg-[#EBF7E5] rounded-full px-3 py-1.5 w-fit">
                    <Target className="w-3.5 h-3.5 text-[#5DB347]" />
                    <span className="text-xs font-medium text-[#449933]">
                      {partner.focus}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/90 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5DB347] via-[#6ABF4B] to-[#8CB89C]" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Become an AFU Partner
            </h2>
            <p className="text-gray-300 text-lg mb-4 max-w-2xl mx-auto">
              Join our growing network of farming unions, businesses,
              government agencies, and research institutions. Together we are
              building a more prosperous agricultural future for Africa.
            </p>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm">
              Partner membership is $250/year and gives you access to the AFU
              deal flow, member network, and co-branded programmes.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] hover:shadow-lg hover:shadow-[#5DB347]/25 hover:-translate-y-1 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
            >
              Apply as Partner
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
