import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  TreePine,
  Leaf,
  DollarSign,
  Award,
  ShieldCheck,
  Globe,
  Sprout,
  Banknote,
  MapPin,
  TrendingUp,
  Hammer,
  Flame,
  Wind,
  Package,
  BadgeCheck,
  Users,
  Clock,
} from "lucide-react";

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Forestry & Timber",
  description:
    "Explore forestry and timber farming with AFU. Eucalyptus, pine, teak, mahogany, bamboo, and indigenous species. Access carbon credits, certification, and timber markets across Africa.",
  path: "/farming/forestry",
});

/* ─── Tree Species ─── */

const treeSpecies = [
  {
    name: "Eucalyptus",
    image:
      "https://images.unsplash.com/photo-1567601137043-21c4a2ddcae4?w=800&q=80&auto=format&fit=crop",
    description:
      "The fastest commercial timber species in Africa, reaching harvestable size in 5-8 years. Eucalyptus grandis and E. camaldulensis are widely planted for poles, pulpwood, and biomass energy. Coppices well for multiple harvests from a single planting.",
    rotation: "5-8 years",
    uses: "Poles, pulpwood, charcoal, biomass",
  },
  {
    name: "Pine",
    image:
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80&auto=format&fit=crop",
    description:
      "Pinus patula and P. elliottii are the primary commercial pine species across Southern and East Africa. Pine produces quality sawn timber, plywood, and paper pulp. Longer rotation but higher-value timber than eucalyptus.",
    rotation: "15-25 years",
    uses: "Sawn timber, plywood, paper pulp",
  },
  {
    name: "Teak",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80&auto=format&fit=crop",
    description:
      "Premium hardwood with exceptional durability, rot resistance, and aesthetic appeal. Teak plantations in Tanzania, Ghana, and Nigeria produce timber valued at $500-2,000 per cubic metre. A long-term investment with outstanding returns.",
    rotation: "20-30 years",
    uses: "Fine furniture, boat building, flooring",
  },
  {
    name: "Mahogany",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80&auto=format&fit=crop",
    description:
      "African mahogany (Khaya and Entandrophragma species) is among the world's most sought-after timbers. CITES-regulated, plantation-grown mahogany commands premium prices in international markets. Excellent for agroforestry intercropping systems.",
    rotation: "25-40 years",
    uses: "Premium furniture, veneer, musical instruments",
  },
  {
    name: "Bamboo",
    image:
      "https://images.unsplash.com/photo-1536637920033-93e8e4f5d95f?w=800&q=80&auto=format&fit=crop",
    description:
      "The fastest-growing plant on earth, bamboo reaches harvestable maturity in 3-5 years and continues producing for decades without replanting. Used in construction, furniture, textiles, and activated charcoal. A powerhouse for carbon sequestration.",
    rotation: "3-5 years (continuous)",
    uses: "Construction, furniture, charcoal, textiles",
  },
  {
    name: "Indigenous Species",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop",
    description:
      "Species like Mzimbeet (Millettia), Mukwa (Pterocarpus), African Blackwood, and Yellowwood support biodiversity while producing high-value timber. Indigenous tree farming qualifies for premium carbon credits and conservation finance.",
    rotation: "30-60 years",
    uses: "Specialist timber, carving, conservation",
  },
];

/* ─── Revenue Streams ─── */

const revenueStreams = [
  {
    icon: Hammer,
    title: "Timber & Sawn Lumber",
    description:
      "Africa imports over $4 billion in timber annually despite vast potential for domestic production. Commercial timber plantations produce logs, planks, beams, and treated poles for construction and furniture manufacturing.",
  },
  {
    icon: Package,
    title: "Poles & Posts",
    description:
      "Transmission poles, building poles, fencing posts, and agricultural stakes are in constant demand. Eucalyptus and pine poles provide returns within 5-8 years, making this the fastest path to forestry income.",
  },
  {
    icon: Flame,
    title: "Sustainable Charcoal",
    description:
      "Over 80% of sub-Saharan African households rely on charcoal for cooking. Plantation-grown charcoal from fast-growing species provides sustainable supply while reducing pressure on natural forests.",
  },
  {
    icon: Wind,
    title: "Carbon Credits",
    description:
      "Forestry is the largest category of voluntary carbon markets globally. AFU-certified plantations generate verified carbon credits at $10-25 per tonne, creating a recurring revenue stream alongside timber income.",
  },
  {
    icon: Leaf,
    title: "Non-Timber Forest Products",
    description:
      "Honey, mushrooms, medicinal plants, essential oils, fruits, and nuts diversify forestry income. Agroforestry systems that integrate NTFPs can generate annual income while timber grows to maturity.",
  },
];

/* ─── Certification ─── */

const certifications = [
  {
    name: "FSC Certification",
    fullName: "Forest Stewardship Council",
    description:
      "The gold standard in sustainable forestry certification. FSC-certified timber commands 10-30% price premiums in international markets. AFU assists members through the rigorous certification process including chain-of-custody documentation.",
    icon: BadgeCheck,
  },
  {
    name: "PEFC Certification",
    fullName: "Programme for the Endorsement of Forest Certification",
    description:
      "The world's largest forest certification system by area, with growing recognition in African markets. PEFC certification demonstrates sustainable forest management to buyers in Europe, North America, and Asia.",
    icon: ShieldCheck,
  },
  {
    name: "Carbon Sequestration",
    fullName: "Verified Carbon Standard (Verra) & Gold Standard",
    description:
      "Forestry projects capture and store atmospheric CO2, generating tradeable carbon credits. A single hectare of managed plantation sequesters 10-25 tonnes of CO2 per year. AFU handles measurement, reporting, and verification.",
    icon: Globe,
  },
];

/* ─── Stats ─── */

const stats = [
  { value: "6", label: "Tree Species Groups", icon: TreePine },
  { value: "25K+", label: "Hectares Planted", icon: Sprout },
  { value: "$10-25", label: "Per Carbon Credit Tonne", icon: Banknote },
  { value: "5-40yr", label: "Rotation Cycles", icon: Clock },
];

export default function ForestryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80&auto=format&fit=crop')",
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
              Forestry
            </span>
            <br />& Timber
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Plant trees, grow wealth, and capture carbon. AFU supports
            commercial forestry across Africa with financing, certification
            support, and access to timber and carbon credit markets.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Start Planting with AFU <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/carbon"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Leaf className="w-4 h-4" /> Carbon Credits Marketplace
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

      {/* ── Tree Species ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Tree{" "}
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
              From fast-growing eucalyptus to premium hardwoods, Africa offers
              unmatched conditions for commercial forestry at every scale and
              investment horizon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treeSpecies.map((tree) => (
              <div
                key={tree.name}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={tree.image}
                    alt={tree.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <TreePine className="w-5 h-5 text-[#5DB347]" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {tree.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {tree.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 bg-[#5DB347]/10 text-[#449933] px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {tree.rotation}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#1B2A4A]/10 text-[#1B2A4A] px-2.5 py-1 rounded-full">
                      <Package className="w-3 h-3" />
                      {tree.uses}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Revenue Streams ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Revenue{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Streams
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Forestry is not just about timber. Multiple income streams make
              tree farming one of the most diversified agricultural investments
              in Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {revenueStreams.map((stream, idx) => (
              <div
                key={stream.title}
                className={`bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 ${
                  idx === revenueStreams.length - 1 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                  style={{
                    background: "linear-gradient(135deg, #5DB347, #449933)",
                  }}
                >
                  <stream.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] mb-3">
                  {stream.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {stream.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sustainability & Certification ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Sustainability &{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Certification
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Certified sustainable forestry unlocks premium markets, carbon
              revenue, and long-term land value. AFU guides you through every
              step of the certification journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#5DB347]/10 rounded-full p-3">
                    <cert.icon className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B2A4A]">
                      {cert.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {cert.fullName}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/carbon"
              className="inline-flex items-center gap-2 text-[#5DB347] hover:text-[#449933] font-semibold transition-colors"
            >
              Explore the Carbon Credits Marketplace{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AFU Forestry Support ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              AFU Forestry{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Support
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From seedling to sawmill, AFU provides the financing, expertise,
              and market connections to make your forestry venture successful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Tree Planting Finance",
                description:
                  "Access long-term financing structured around forestry rotation cycles. Loans for land preparation, seedlings, planting, and maintenance with repayment timed to harvests. Competitive rates designed for the unique cash-flow profile of tree farming.",
              },
              {
                icon: Award,
                title: "Certification Assistance",
                description:
                  "Our forestry team guides you through FSC, PEFC, and carbon credit certification from initial assessment to final audit. Group certification schemes reduce costs for smallholder foresters. Unlock premium markets that require sustainable sourcing.",
              },
              {
                icon: TrendingUp,
                title: "Market Access & Offtake",
                description:
                  "Connect with sawmills, construction companies, furniture manufacturers, paper mills, and carbon credit buyers. AFU negotiates bulk pricing and long-term supply contracts that provide income certainty across your rotation period.",
              },
              {
                icon: Sprout,
                title: "Technical Advisory",
                description:
                  "Expert guidance on species selection, site assessment, spacing, thinning schedules, fire management, pest control, and harvesting techniques. AFU foresters combine scientific knowledge with practical African experience.",
              },
            ].map((item) => (
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

      {/* ── CTA ── */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #1B2A4A 0%, #2A3F6A 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TreePine className="w-12 h-12 text-[#5DB347] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Plant Today, Harvest for Generations
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Forestry is one of the most reliable long-term investments in
            African agriculture. Join AFU to access financing, certification, and
            markets that turn trees into sustainable wealth.
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
              href="/carbon"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm text-lg"
            >
              <Leaf className="w-5 h-5" /> Carbon Credits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
