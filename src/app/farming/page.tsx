import Link from "next/link";
import type { Metadata } from "next";
import {
  Wheat,
  Beef,
  TreePine,
  Rabbit,
  ArrowRight,
  Globe,
  Sprout,
  Users,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Banknote,
  Package,
  BarChart3,
  Leaf,
} from "lucide-react";

/* ─── SEO Metadata ─── */

export const metadata: Metadata = {
  title: "Farming Sectors | African Farmers Union",
  description:
    "Explore AFU's diverse farming sectors across Africa — crops & agriculture, livestock, forestry, and game farming. Join thousands of farmers growing Africa's future.",
  keywords: [
    "African farming",
    "agriculture Africa",
    "crops",
    "livestock",
    "forestry",
    "game farming",
    "AFU",
    "African Farmers Union",
    "sustainable agriculture",
    "farming sectors",
  ],
  openGraph: {
    title: "Farming Sectors | African Farmers Union",
    description:
      "Explore AFU's diverse farming sectors across Africa — crops & agriculture, livestock, forestry, and game farming.",
    type: "website",
    url: "https://africanfarmingunion.org/farming",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "African farming landscape",
      },
    ],
  },
};

/* ─── Sector Data ─── */

const sectors = [
  {
    title: "Crops & Agriculture",
    href: "/farming/crops",
    icon: Wheat,
    accent: "#5DB347",
    accentBg: "rgba(93,179,71,0.1)",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop",
    description:
      "From staple grains to high-value export crops, AFU supports farmers cultivating over 50 crop types across 9 African countries. Access premium seeds, modern techniques, and guaranteed market channels.",
  },
  {
    title: "Livestock",
    href: "/farming/livestock",
    icon: Beef,
    accent: "#8B6F47",
    accentBg: "rgba(139,111,71,0.1)",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop",
    description:
      "Cattle, poultry, goats, sheep, and aquaculture — AFU connects livestock farmers with veterinary services, feed suppliers, breeding programmes, and direct-to-market sales channels.",
  },
  {
    title: "Forestry",
    href: "/farming/forestry",
    icon: TreePine,
    accent: "#2D6A4F",
    accentBg: "rgba(45,106,79,0.1)",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop",
    description:
      "Sustainable timber, agroforestry, and reforestation projects that balance economic returns with environmental stewardship. Earn carbon credits while growing valuable timber species.",
  },
  {
    title: "Game Farming",
    href: "/farming/game-farming",
    icon: Rabbit,
    accent: "#D4920B",
    accentBg: "rgba(212,146,11,0.1)",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=400&fit=crop",
    description:
      "Wildlife ranching, ecotourism, and sustainable game meat production. AFU supports game farmers with conservation compliance, hunting concessions, and premium venison markets.",
  },
];

/* ─── Featured Crops Data ─── */

const featuredCrops = [
  {
    name: "Coffee",
    slug: "coffee",
    image: "/images/crops/coffee.jpg",
    countries: ["Ethiopia", "Kenya", "Tanzania"],
  },
  {
    name: "Maize",
    slug: "maize",
    image: "/images/crops/maize.jpg",
    countries: ["Zambia", "Zimbabwe", "Mozambique"],
  },
  {
    name: "Cashew Nuts",
    slug: "cashew-nuts",
    image: "/images/crops/cashew-nuts.jpg",
    countries: ["Mozambique", "Tanzania"],
  },
  {
    name: "Cocoa",
    slug: "cocoa",
    image: "/images/crops/cocoa.jpg",
    countries: ["Ghana", "Cameroon"],
  },
  {
    name: "Blueberries",
    slug: "blueberries",
    image: "/images/crops/blueberries.jpg",
    countries: ["South Africa", "Zimbabwe"],
  },
  {
    name: "Macadamia",
    slug: "macadamia",
    image: "/images/crops/macadamia.jpg",
    countries: ["South Africa", "Kenya", "Malawi"],
  },
  {
    name: "Soya",
    slug: "soya",
    image: "/images/crops/soya.jpg",
    countries: ["Zambia", "Zimbabwe", "Malawi"],
  },
  {
    name: "Cotton",
    slug: "cotton",
    image: "/images/crops/cotton.jpg",
    countries: ["Zimbabwe", "Mozambique", "Tanzania"],
  },
  {
    name: "Tea",
    slug: "tea",
    image: "/images/crops/tea.jpg",
    countries: ["Kenya", "Malawi", "Tanzania"],
  },
  {
    name: "Tobacco",
    slug: "tobacco",
    image: "/images/crops/tobacco.jpg",
    countries: ["Zimbabwe", "Malawi", "Mozambique"],
  },
];

/* ─── Support Services Data ─── */

const services = [
  {
    icon: Banknote,
    title: "Financing & Credit",
    description:
      "Seasonal loans, input financing, and investment capital tailored to African farming cycles. Competitive rates with flexible repayment tied to harvest.",
  },
  {
    icon: ShieldCheck,
    title: "Crop & Livestock Insurance",
    description:
      "Weather-indexed and multi-peril insurance products that protect your investment. Claims processed in days, not months.",
  },
  {
    icon: Package,
    title: "Input Supply Chain",
    description:
      "Bulk-negotiated seeds, fertilizers, chemicals, and equipment delivered to your farm gate. Members save up to 25% on inputs.",
  },
  {
    icon: GraduationCap,
    title: "Training & Extension",
    description:
      "On-farm training, digital courses, and agronomist advisory services. From soil health to post-harvest handling, we build capacity.",
  },
  {
    icon: TrendingUp,
    title: "Market Access",
    description:
      "Direct buyer connections, commodity exchange listings, and export facilitation. We help you sell at the best price, locally or globally.",
  },
  {
    icon: BarChart3,
    title: "Data & Analytics",
    description:
      "Satellite-monitored fields, weather forecasts, and market intelligence dashboards. Make data-driven farming decisions every season.",
  },
];

/* ─── Stats ─── */

const stats = [
  { value: "9", label: "Countries Active", icon: Globe },
  { value: "50+", label: "Crop Types Supported", icon: Sprout },
  { value: "15+", label: "Livestock Species", icon: Beef },
  { value: "5,000+", label: "Farmers in Network", icon: Users },
];

/* ─── Page Component ─── */

export default function FarmingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1B2A4A" }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 50%, rgba(93,179,71,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(93,179,71,0.2) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-green-300 text-sm font-medium mb-6">
              <Wheat className="w-4 h-4" />
              Farming Sectors
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Growing Africa&apos;s Future,{" "}
              <span style={{ color: "#5DB347" }}>Together</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              The African Farmers Union supports diverse agricultural activities
              across the continent — from staple food crops and commercial
              agriculture to livestock production, sustainable forestry, and
              wildlife management. Explore our farming sectors and discover how
              AFU empowers farmers at every scale.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/join"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-lg transition-all hover:brightness-110"
                style={{ backgroundColor: "#5DB347" }}
              >
                Join AFU Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#sectors"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-lg border border-white/30 hover:bg-white/10 transition-all"
              >
                Explore Sectors
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0,40 C360,80 720,0 1440,40 L1440,60 L0,60 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTOR CARDS
      ═══════════════════════════════════════════════ */}
      <section id="sectors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Farming Sectors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AFU organises agricultural support across four core sectors, each
            with dedicated programmes, specialists, and market channels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <Link
                key={sector.title}
                href={sector.href}
                className="group block rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={sector.image}
                    alt={sector.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div
                    className="absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: sector.accentBg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: sector.accent }} />
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    {sector.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {sector.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 font-semibold text-sm"
                    style={{ color: sector.accent }}
                  >
                    Explore {sector.title}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY FARM WITH AFU — STATS
      ═══════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Farm with AFU
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that reflect our growing impact across Africa&apos;s
              agricultural landscape.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "rgba(93,179,71,0.1)" }}
                  >
                    <Icon className="w-7 h-7" style={{ color: "#5DB347" }} />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: "#5DB347" }}
            >
              Join AFU
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED CROPS GRID
      ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Crops
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Africa grows some of the world&apos;s most sought-after
            agricultural commodities. Here are the crops our farmers cultivate
            across the continent.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {featuredCrops.map((crop) => (
            <Link
              key={crop.slug}
              href={`/farming/crops/${crop.slug}`}
              className="group block rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-green-700 transition-colors">
                  {crop.name}
                </h3>
                <p className="text-xs text-gray-500 leading-snug">
                  {crop.countries.join(", ")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/farming/crops"
            className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors"
          >
            View All Crops
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW AFU SUPPORTS FARMERS
      ═══════════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: "#F8FAF7" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How AFU Supports Farmers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              End-to-end support for every stage of the farming value chain —
              from pre-season planning to post-harvest sales.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(93,179,71,0.1)" }}
                  >
                    <Icon className="w-6 h-6" style={{ color: "#5DB347" }} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SUSTAINABILITY & IMPACT
      ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Sustainability
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Farming That Builds the Future
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At AFU, every sector is guided by sustainable practices. Our
              farmers implement conservation agriculture, integrated pest
              management, rotational grazing, and responsible forestry — all
              backed by data, training, and market incentives.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Climate-smart agriculture techniques",
                "Carbon credit programmes for reforestation",
                "Water-efficient irrigation systems",
                "Soil health monitoring and restoration",
                "Biodiversity conservation on farmland",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#5DB347" }}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/carbon"
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors"
            >
              Learn about Carbon Credits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=500&fit=crop"
              alt="Sustainable farming in Africa"
              className="rounded-2xl shadow-lg w-full object-cover"
            />
            <div
              className="absolute -bottom-4 -left-4 rounded-xl p-4 text-white shadow-lg"
              style={{ backgroundColor: "#1B2A4A" }}
            >
              <p className="text-2xl font-bold">30%</p>
              <p className="text-sm text-gray-300">
                Average yield increase
                <br />
                with AFU programmes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ backgroundColor: "#1B2A4A" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(93,179,71,0.4) 0%, transparent 60%)",
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Start Farming with AFU
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you manage 1 hectare or 10,000 — AFU provides the tools,
            markets, and community to help you succeed. Join Africa&apos;s
            fastest-growing agricultural network today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-lg text-white font-semibold text-lg transition-all hover:brightness-110"
              style={{ backgroundColor: "#5DB347" }}
            >
              Join AFU Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-lg text-white font-semibold text-lg border border-white/30 hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
