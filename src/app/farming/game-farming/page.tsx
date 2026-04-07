import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  DollarSign,
  MapPin,
  FileCheck,
  Eye,
  Target,
  Crosshair,
  Camera,
  ShoppingCart,
  Beef,
  Award,
  Stethoscope,
  Megaphone,
  Users,
  Globe,
  Scale,
  AlertTriangle,
  BarChart3,
  TreePine,
} from "lucide-react";

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Game Farming & Wildlife",
  description:
    "Game farming and wildlife management with AFU. Impala, kudu, springbok, buffalo, sable, and more. Sustainable hunting, ecotourism, live sales, and venison production across Southern and East Africa.",
  path: "/farming/game-farming",
});

/* ─── Species ─── */

const gameSpecies = [
  {
    name: "Impala",
    image:
      "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80&auto=format&fit=crop",
    description:
      "The most common and commercially accessible game species. Impala adapt to diverse habitats, breed prolifically, and provide affordable entry into game farming. Valued for venison, biltong production, and plains game hunting.",
    value: "Entry-level",
  },
  {
    name: "Kudu",
    image:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80&auto=format&fit=crop",
    description:
      "The iconic spiral-horned antelope commands premium trophy fees and is a prized species for safari hunting operations. Greater kudu bulls with horns exceeding 55 inches are among Africa's most valuable trophy animals.",
    value: "Premium trophy",
  },
  {
    name: "Springbok",
    image:
      "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&q=80&auto=format&fit=crop",
    description:
      "South Africa's national animal thrives in arid and semi-arid conditions. Springbok venison is a premium product with growing international demand. Colour variants including black, white, and copper command high breeding prices.",
    value: "Venison & breeding",
  },
  {
    name: "Ostrich",
    image:
      "https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800&q=80&auto=format&fit=crop",
    description:
      "A unique game farming enterprise producing leather, feathers, meat, and eggs. Ostrich leather is the most expensive commercial leather in the world. South Africa leads global ostrich production, with AFU members active in Oudtshoorn and the Karoo.",
    value: "Multi-product",
  },
  {
    name: "Crocodile",
    image:
      "https://images.unsplash.com/photo-1599577180589-0a1e4c6dec97?w=800&q=80&auto=format&fit=crop",
    description:
      "Nile crocodile farming produces luxury leather for fashion houses and quality meat for restaurants and export. Highly regulated but extremely profitable, with premium skins fetching $300-1,500 each depending on size and quality.",
    value: "Luxury leather",
  },
  {
    name: "Buffalo",
    image:
      "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800&q=80&auto=format&fit=crop",
    description:
      "Cape buffalo are among Africa's most valuable game animals. Disease-free buffalo can sell for $15,000-100,000+ per animal. Trophy hunting fees are substantial, and buffalo breeding is a high-value, specialised sector of game farming.",
    value: "Ultra-premium",
  },
  {
    name: "Sable Antelope",
    image:
      "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&q=80&auto=format&fit=crop",
    description:
      "One of Africa's most valuable antelope species. Top-quality sable bulls command breeding prices of $50,000-200,000. The majestic curved horns and striking black-and-white colouration make sable a flagship species for premium game farms.",
    value: "Elite breeding",
  },
  {
    name: "Nyala",
    image:
      "https://images.unsplash.com/photo-1534996858221-380b92700493?w=800&q=80&auto=format&fit=crop",
    description:
      "A sought-after trophy species native to Southern Africa. Nyala bulls with their distinctive spiral horns and shaggy coats are popular with international hunters. Well-suited to bushveld conditions with moderate stocking densities.",
    value: "Trophy hunting",
  },
  {
    name: "Eland",
    image:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80&auto=format&fit=crop",
    description:
      "The largest antelope species, eland produce quality venison comparable to beef and are increasingly farmed commercially for meat. Docile and easy to manage, eland adapt well to farming conditions and can be mustered and handled like cattle.",
    value: "Venison production",
  },
  {
    name: "Wildebeest",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80&auto=format&fit=crop",
    description:
      "Blue wildebeest and black wildebeest are popular game farm species for hunting, venison, and wildlife tourism. Golden wildebeest and king wildebeest colour variants have created a lucrative breeding niche with animals selling for $10,000-80,000.",
    value: "Variant breeding",
  },
];

/* ─── Revenue Streams ─── */

const revenueStreams = [
  {
    icon: Crosshair,
    title: "Sustainable Hunting",
    description:
      "Regulated trophy and biltong hunting generates the primary income for most game farms. International trophy hunters spend $5,000-100,000+ per safari. Quota-based systems ensure population sustainability while maximising revenue.",
  },
  {
    icon: Camera,
    title: "Tourism & Safari",
    description:
      "Eco-tourism and photographic safaris attract international visitors willing to pay premium rates for authentic African wildlife experiences. Lodge accommodation, guided game drives, and walking safaris create recurring hospitality income.",
  },
  {
    icon: ShoppingCart,
    title: "Live Animal Sales",
    description:
      "Breeding stock and surplus animals are sold at game auctions, private treaty sales, and via online platforms. The South African game auction industry alone turns over R5+ billion annually. Rare colour variants command exceptional prices.",
  },
  {
    icon: Beef,
    title: "Venison & Biltong",
    description:
      "Game meat is lean, organic, free-range, and increasingly popular with health-conscious consumers. Springbok, impala, kudu, and eland venison supplies restaurants, retailers, and the massive biltong market across Southern Africa.",
  },
  {
    icon: Award,
    title: "Trophy & Taxidermy",
    description:
      "Trophy preparation, taxidermy, and shipping services serve the international hunting industry. Mounted trophies, skull mounts, and tanned hides add significant downstream value to every animal harvested.",
  },
  {
    icon: Target,
    title: "Breeding Programmes",
    description:
      "Selective breeding of rare species, colour variants, and superior genetics is one of the highest-value segments. Disease-free buffalo, sable antelope, and golden wildebeest breeding programmes generate exceptional returns.",
  },
];

/* ─── Permits & Compliance ─── */

const compliance = [
  {
    icon: Globe,
    title: "CITES Regulations",
    description:
      "The Convention on International Trade in Endangered Species governs cross-border movement of protected wildlife. AFU assists members with CITES permit applications for species like crocodile, ostrich, and certain antelope requiring export documentation.",
  },
  {
    icon: Scale,
    title: "National Wildlife Authorities",
    description:
      "Each country has specific game farming legislation administered by agencies such as DFFE (South Africa), ZimParks (Zimbabwe), MEFT (Namibia), and TAWA (Tanzania). AFU navigates these regulatory frameworks on your behalf.",
  },
  {
    icon: FileCheck,
    title: "Quota Systems",
    description:
      "Sustainable utilisation quotas determine how many animals can be hunted, sold, or exported annually. Quotas are based on regular game counts, habitat assessments, and population dynamics. AFU provides census and quota application support.",
  },
  {
    icon: AlertTriangle,
    title: "Disease Management",
    description:
      "Game farming near conservation areas requires compliance with veterinary fence protocols and disease testing for foot-and-mouth, bovine tuberculosis, and brucellosis. Disease-free certification dramatically increases animal values.",
  },
];

/* ─── Countries ─── */

const countries = [
  {
    name: "South Africa",
    description:
      "The world's largest game farming industry with 12,000+ registered game farms covering 20+ million hectares. Home to the global game auction market and leading wildlife breeding programmes.",
  },
  {
    name: "Zimbabwe",
    description:
      "Rich biodiversity with vast conservancies in the Lowveld and Midlands. Strong hunting safari tradition with professional hunters and world-class trophy areas.",
  },
  {
    name: "Namibia",
    description:
      "A leader in community-based conservation. Namibian conservancies demonstrate how game farming supports both wildlife and local livelihoods in arid environments.",
  },
  {
    name: "Botswana",
    description:
      "Home to Africa's largest elephant population and vast wildlife areas. Game ranching complements the renowned Okavango Delta and Kalahari tourism sectors.",
  },
  {
    name: "Tanzania",
    description:
      "World-famous hunting blocks and safari circuits. The Selous and Serengeti ecosystems support diverse game species with strong international demand for hunting concessions.",
  },
];

/* ─── Stats ─── */

const stats = [
  { value: "10+", label: "Key Species", icon: Eye },
  { value: "6", label: "Revenue Streams", icon: DollarSign },
  { value: "5", label: "Core Countries", icon: MapPin },
  { value: "$50B+", label: "Industry Value", icon: BarChart3 },
];

export default function GameFarmingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80&auto=format&fit=crop')",
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
              Game Farming
            </span>
            <br />& Wildlife
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Turn wildlife into a sustainable business. AFU supports game farmers
            across Southern and East Africa with insurance, permits, veterinary
            care, and access to hunting, tourism, and breeding markets.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Start Game Farming with AFU <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services/insurance"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Shield className="w-4 h-4" /> Game Farm Insurance
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

      {/* ── Species Section ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Game{" "}
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
              Africa&apos;s wildlife represents a unique agricultural asset class.
              From affordable plains game to ultra-premium breeding stock, game
              farming offers opportunities at every investment level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {gameSpecies.map((animal) => (
              <div
                key={animal.name}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={animal.image}
                    alt={animal.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-[#449933]">
                    {animal.value}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-[#1B2A4A] mb-1.5">
                    {animal.name}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {animal.description}
                  </p>
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
              Successful game farms diversify across multiple income streams,
              reducing risk and maximising the value of every animal and every
              hectare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {revenueStreams.map((stream) => (
              <div
                key={stream.title}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
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

      {/* ── Permits & Compliance ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Permits &{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Compliance
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Game farming operates within strict legal frameworks that protect
              wildlife while enabling sustainable commercial use. AFU helps you
              stay compliant at every level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {compliance.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#5DB347]/10 rounded-full p-3 shrink-0">
                    <item.icon className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Countries ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Key{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Countries
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Game farming is concentrated in Southern and East Africa, where
              favourable legislation, abundant wildlife, and established markets
              create ideal conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country, idx) => (
              <div
                key={country.name}
                className={`bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 ${
                  idx >= 3 ? "lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#5DB347]/10 rounded-full p-2">
                    <MapPin className="w-5 h-5 text-[#5DB347]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A]">
                    {country.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {country.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AFU Game Farming Support ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              AFU Game Farming{" "}
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
              Game farming requires specialised knowledge, significant
              investment, and complex regulatory navigation. AFU provides the
              full support ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "Game Farm Insurance",
                description:
                  "Specialised insurance covering mortality, theft, escape, and disease for high-value game animals. Coverage tailored to species value, from plains game herds to individual sable bulls worth hundreds of thousands.",
              },
              {
                icon: FileCheck,
                title: "Permits & Licensing",
                description:
                  "AFU handles the complex paperwork for game farming permits, hunting quotas, CITES documentation, transport permits, and provincial game dealer licences. Stay legal without the administrative burden.",
              },
              {
                icon: Stethoscope,
                title: "Wildlife Veterinary",
                description:
                  "Access specialist wildlife veterinarians for game capture, darting, disease testing, DNA profiling, and emergency veterinary care. Our vet network includes registered wildlife capture operators and testing laboratories.",
              },
              {
                icon: Megaphone,
                title: "Marketing & Sales",
                description:
                  "Reach hunting outfitters, game auction platforms, breeding buyers, and venison processors through AFU's marketing channels. Professional game farm branding and international marketing for hunting safaris.",
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
            Ready to Farm Africa&apos;s Wildlife?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Game farming combines conservation with commerce. Join AFU to access
            the insurance, permits, veterinary care, and market connections that
            turn wildlife into a sustainable business.
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
              href="/services/insurance"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm text-lg"
            >
              <Shield className="w-5 h-5" /> Game Insurance
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
