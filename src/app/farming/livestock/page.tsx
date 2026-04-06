import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Beef,
  Bird,
  Bug,
  Fish,
  Heart,
  Shield,
  DollarSign,
  TrendingUp,
  Stethoscope,
  ShoppingCart,
  Rabbit,
  MapPin,
  Award,
  Users,
  BarChart3,
} from "lucide-react";

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Livestock Farming",
  description:
    "Explore livestock farming opportunities with AFU across Africa. Cattle, goats, poultry, pigs, sheep, rabbits, bees, and aquaculture with full support from veterinary care to market access.",
  path: "/farming/livestock",
});

/* ─── Species Data ─── */

const species = [
  {
    name: "Cattle (Beef & Dairy)",
    image:
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&h=400&fit=crop",
    description:
      "The backbone of African livestock farming. Beef cattle thrive on natural rangelands while dairy operations supply growing urban demand for milk, cheese, and yoghurt. Breeds range from indigenous Nguni and Ankole to improved Brahman and Holstein crosses.",
    countries: ["South Africa", "Botswana", "Tanzania", "Kenya"],
    icon: Beef,
  },
  {
    name: "Goats",
    image:
      "https://images.unsplash.com/photo-1524024973431-2ad916746264?w=600&h=400&fit=crop",
    description:
      "Hardy and adaptable, goats are Africa's most versatile livestock. Boer goats lead meat production while dairy breeds like Saanen and Alpine cross well with indigenous stock. Goat farming requires minimal land and start-up capital.",
    countries: ["South Africa", "Kenya", "Nigeria", "Tanzania"],
    icon: Heart,
  },
  {
    name: "Sheep",
    image:
      "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&h=400&fit=crop",
    description:
      "Wool, meat, and skins make sheep a triple-income livestock option. Dorper sheep excel in African conditions, producing quality meat without shearing. Merino wool remains a premium export product from Southern African flocks.",
    countries: ["South Africa", "Namibia", "Botswana", "Kenya"],
    icon: Heart,
  },
  {
    name: "Poultry (Broilers & Layers)",
    image:
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop",
    description:
      "The fastest-growing livestock sector in Africa. Broiler chickens reach market weight in 35-42 days, while layer hens produce 280+ eggs per year. Indigenous free-range and Kuroiler birds serve growing organic markets.",
    countries: ["South Africa", "Nigeria", "Kenya", "Tanzania", "Zimbabwe"],
    icon: Bird,
  },
  {
    name: "Pigs",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop",
    description:
      "Pig farming delivers fast returns with high feed-conversion efficiency. Large White and Landrace breeds dominate commercial production. Smallholder pig farming is expanding rapidly in East and Southern Africa with strong local pork demand.",
    countries: ["South Africa", "Kenya", "Uganda", "Nigeria"],
    icon: Heart,
  },
  {
    name: "Rabbits",
    image:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop",
    description:
      "A low-investment, high-return entry point into livestock farming. Rabbits reproduce quickly, require little space, and produce lean, healthy meat. New Zealand White and Californian breeds perform well across African climates.",
    countries: ["Kenya", "Nigeria", "South Africa", "Ghana"],
    icon: Rabbit,
  },
  {
    name: "Bees (Apiculture)",
    image:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop",
    description:
      "African honeybees produce premium organic honey with strong export demand. Beyond honey, beeswax, propolis, and pollination services generate multiple revenue streams. Beekeeping supports biodiversity and is ideal alongside crop farming.",
    countries: ["Tanzania", "Kenya", "Ethiopia", "South Africa"],
    icon: Bug,
  },
  {
    name: "Fish (Aquaculture)",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    description:
      "Tilapia and catfish farming is Africa's fastest-growing food production sector. Pond, cage, and recirculating aquaculture systems suit different scales. Fish farming addresses the massive protein gap while creating rural employment.",
    countries: ["Nigeria", "Kenya", "Uganda", "Tanzania", "South Africa"],
    icon: Fish,
  },
];

/* ─── Featured Breeds ─── */

const featuredBreeds = [
  {
    name: "Brahman",
    type: "Cattle",
    origin: "Originally from India, now widespread in Africa",
    traits: "Heat tolerant, tick resistant, excellent mothering instinct, thrives on low-quality forage",
  },
  {
    name: "Boer Goat",
    type: "Goat",
    origin: "South Africa",
    traits: "Fast growth rate, high meat-to-bone ratio, adaptable to harsh conditions, docile temperament",
  },
  {
    name: "Rhode Island Red",
    type: "Poultry",
    origin: "United States, now common across Africa",
    traits: "Dual-purpose breed, 250+ eggs per year, hardy and disease-resistant, excellent free-range bird",
  },
  {
    name: "Dorper",
    type: "Sheep",
    origin: "South Africa",
    traits: "No shearing required, rapid growth, high fertility, thrives in arid conditions",
  },
  {
    name: "Kuroiler",
    type: "Poultry",
    origin: "Developed for tropical conditions",
    traits: "Dual-purpose, free-range adapted, disease-resistant, 150+ eggs per year on minimal feed",
  },
  {
    name: "Large White",
    type: "Pig",
    origin: "United Kingdom, widely adopted in Africa",
    traits: "Prolific breeder, excellent feed conversion, lean meat, good mothering ability",
  },
];

/* ─── Why AFU Section Data ─── */

const whyAfu = [
  {
    icon: Stethoscope,
    title: "Veterinary Services",
    description:
      "Access our network of 200+ qualified veterinarians for routine check-ups, vaccinations, disease management, and 24/7 emergency support. Digital health records track every animal.",
  },
  {
    icon: Shield,
    title: "Livestock Insurance",
    description:
      "Protect your investment against mortality, theft, disease, and natural disasters. Our livestock insurance products are specifically designed for African farming conditions and affordable for smallholders.",
  },
  {
    icon: DollarSign,
    title: "Financing & Credit",
    description:
      "Access livestock purchase loans, feed financing, and infrastructure credit. Seasonal repayment schedules aligned with production cycles. Start or expand your operation with AFU-backed funding.",
  },
  {
    icon: ShoppingCart,
    title: "Market Access",
    description:
      "Connect directly with abattoirs, processors, retailers, and export markets. AFU negotiates fair prices and reliable offtake agreements so you can focus on production, not marketing.",
  },
];

/* ─── Stats ─── */

const stats = [
  { value: "8", label: "Species Supported", icon: BarChart3 },
  { value: "50K+", label: "Livestock Insured", icon: Shield },
  { value: "200+", label: "Veterinary Partners", icon: Stethoscope },
  { value: "9", label: "Countries Active", icon: MapPin },
];

export default function LivestockFarmingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&h=1080&fit=crop')",
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
            Farming Sector
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
              }}
            >
              Livestock
            </span>
            <br />
            Farming
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            From cattle ranching to aquaculture, AFU supports every form of
            livestock production across Africa. Access veterinary care,
            insurance, financing, and guaranteed markets for your animals.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Start Farming with AFU <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services/veterinary"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Stethoscope className="w-4 h-4" /> Veterinary Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#1B2A4A] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-[#5DB347] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Species Grid ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Livestock{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Species
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AFU supports a wide range of livestock species, each with tailored
              programmes for veterinary care, nutrition, breeding, insurance, and
              market access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {species.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <s.icon className="w-5 h-5 text-[#5DB347]" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {s.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {s.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.countries.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 text-xs bg-[#5DB347]/10 text-[#449933] px-2 py-1 rounded-full"
                      >
                        <MapPin className="w-3 h-3" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Livestock with AFU ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Why Livestock with{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                AFU
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide end-to-end support for livestock farmers, from the day
              you acquire your first animal to the day you sell your product.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyAfu.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                  style={{
                    background: "linear-gradient(135deg, #5DB347, #449933)",
                  }}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Breeds ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Featured{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Breeds
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These breeds have proven track records in African conditions,
              combining productivity with resilience. AFU members access premium
              genetics through our breeding programmes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBreeds.map((breed) => (
              <div
                key={breed.name}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#5DB347]/10 rounded-full p-2">
                    <Award className="w-5 h-5 text-[#5DB347]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B2A4A]">
                      {breed.name}
                    </h3>
                    <span className="text-xs text-[#5DB347] font-medium">
                      {breed.type}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-[#1B2A4A]">
                      Origin:{" "}
                    </span>
                    <span className="text-gray-600">{breed.origin}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#1B2A4A]">
                      Key Traits:{" "}
                    </span>
                    <span className="text-gray-600">{breed.traits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Getting Started ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Getting{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Started
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you are starting your first small flock or scaling a
              commercial cattle operation, AFU has a pathway for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register & Assess",
                description:
                  "Join AFU and complete your livestock farming profile. Our team will assess your land, resources, and goals to recommend the best species, breeds, and scale for your situation.",
              },
              {
                step: "02",
                title: "Access Resources",
                description:
                  "Unlock financing for animal purchases, feed, fencing, and housing. Get assigned a veterinarian and access training modules specific to your chosen livestock species.",
              },
              {
                step: "03",
                title: "Produce & Sell",
                description:
                  "Start production with ongoing AFU support. When your animals or products are ready for market, our offtake network ensures you get fair prices with reliable payment.",
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div
                    className="text-5xl font-black mb-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6ABF4B, #5DB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#1B2A4A] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-12 h-12 text-[#5DB347] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Livestock Journey?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of African livestock farmers who are building
            profitable, sustainable operations with AFU. Access the full
            ecosystem of support from day one.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25 text-lg"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Join AFU Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/services/insurance/livestock"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm text-lg"
            >
              <Shield className="w-5 h-5" /> Livestock Insurance
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
