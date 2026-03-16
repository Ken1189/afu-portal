"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ShoppingCart,
  Clock,
  CreditCard,
  Wrench,
  Filter,
} from "lucide-react";

type Category =
  | "All"
  | "Tractors"
  | "Irrigation"
  | "Harvesting"
  | "Processing"
  | "Implements";

interface Equipment {
  name: string;
  category: Category;
  description: string;
  priceRange: string;
  availability: ("Buy" | "Rent" | "Finance")[];
  gradient: string;
}

const categories: Category[] = [
  "All",
  "Tractors",
  "Irrigation",
  "Harvesting",
  "Processing",
  "Implements",
];

const equipment: Equipment[] = [
  {
    name: "Massey Ferguson 385 (75HP)",
    category: "Tractors",
    description:
      "Versatile 4WD utility tractor ideal for medium-scale farms. Excellent fuel economy and proven reliability across Africa.",
    priceRange: "$18,000 - $24,000",
    availability: ["Buy", "Rent", "Finance"],
    gradient: "from-navy/80 to-navy",
  },
  {
    name: "John Deere 5075E",
    category: "Tractors",
    description:
      "Premium 75HP tractor with power steering and live PTO. Perfect for row-crop farming, haulage, and loader work.",
    priceRange: "$22,000 - $30,000",
    availability: ["Buy", "Finance"],
    gradient: "from-green-700 to-green-900",
  },
  {
    name: "Solar Irrigation Pump (5HP)",
    category: "Irrigation",
    description:
      "Solar-powered submersible pump system with 8 panels. Delivers 20,000 litres/day for drip or sprinkler irrigation.",
    priceRange: "$3,500 - $5,500",
    availability: ["Buy", "Finance"],
    gradient: "from-blue-500 to-blue-700",
  },
  {
    name: "Centre Pivot System (50ha)",
    category: "Irrigation",
    description:
      "Full centre pivot irrigation system covering 50 hectares. Includes towers, sprinklers, and control panel.",
    priceRange: "$45,000 - $65,000",
    availability: ["Buy", "Finance"],
    gradient: "from-cyan-600 to-cyan-800",
  },
  {
    name: "Maize Sheller (Electric)",
    category: "Harvesting",
    description:
      "High-capacity electric maize sheller processing up to 5 tonnes/hour. Removes kernels cleanly with minimal damage.",
    priceRange: "$2,800 - $4,200",
    availability: ["Buy", "Rent", "Finance"],
    gradient: "from-gold to-yellow-700",
  },
  {
    name: "Combine Harvester (Mid-Size)",
    category: "Harvesting",
    description:
      "Multi-crop combine harvester for wheat, soya, and maize. Grain tank capacity 4,500 litres with 4.2m header.",
    priceRange: "$85,000 - $120,000",
    availability: ["Rent", "Finance"],
    gradient: "from-red-600 to-red-800",
  },
  {
    name: "Solar Crop Dryer (5t)",
    category: "Processing",
    description:
      "Solar-thermal hybrid dryer for grains, fruits, and vegetables. Reduces moisture content from 25% to 13% in 6-8 hours.",
    priceRange: "$6,000 - $9,000",
    availability: ["Buy", "Finance"],
    gradient: "from-orange-500 to-orange-700",
  },
  {
    name: "Hammer Mill (Diesel)",
    category: "Processing",
    description:
      "Heavy-duty hammer mill for maize, sorghum, and animal feed. Processes 1-2 tonnes/hour with interchangeable screens.",
    priceRange: "$3,200 - $5,500",
    availability: ["Buy", "Rent", "Finance"],
    gradient: "from-gray-600 to-gray-800",
  },
  {
    name: "3-Disc Plough",
    category: "Implements",
    description:
      "Heavy-duty 3-disc plough for primary tillage. Suitable for 50-80HP tractors. Works well in tough African soils.",
    priceRange: "$1,200 - $1,800",
    availability: ["Buy", "Finance"],
    gradient: "from-amber-700 to-amber-900",
  },
  {
    name: "4-Row Planter",
    category: "Implements",
    description:
      "Precision 4-row mechanical planter with fertiliser attachment. Adjustable row spacing for maize, soya, sunflower.",
    priceRange: "$2,500 - $4,000",
    availability: ["Buy", "Rent", "Finance"],
    gradient: "from-teal to-teal-dark",
  },
  {
    name: "Boom Sprayer (600L)",
    category: "Implements",
    description:
      "Tractor-mounted 600-litre boom sprayer with 12m spray width. Includes pressure regulator and nozzle set.",
    priceRange: "$1,800 - $3,000",
    availability: ["Buy", "Rent"],
    gradient: "from-emerald-600 to-emerald-800",
  },
  {
    name: "Seed Drill (7-Row)",
    category: "Implements",
    description:
      "7-row seed drill for wheat, barley, and small grains. Accurate seed placement with depth control wheels.",
    priceRange: "$3,500 - $5,500",
    availability: ["Buy", "Finance"],
    gradient: "from-lime-700 to-lime-900",
  },
];

const acquisitionOptions = [
  {
    title: "Buy Outright",
    description:
      "Purchase equipment directly at competitive prices. We work with authorised dealers across Zimbabwe, Botswana, and Tanzania to source the best deals.",
    icon: ShoppingCart,
    color: "bg-teal",
  },
  {
    title: "Rent (Daily / Seasonal)",
    description:
      "Rent equipment for the period you need it. Daily rates for short jobs, seasonal rates for planting or harvesting. No maintenance worries.",
    icon: Clock,
    color: "bg-gold",
  },
  {
    title: "Finance (AFU Asset Finance)",
    description:
      "Spread the cost over 12-60 months with AFU Asset Finance. Competitive rates from 8.5% APR with seasonal repayment structures available.",
    icon: CreditCard,
    color: "bg-navy",
  },
];

function AvailabilityBadge({ type }: { type: "Buy" | "Rent" | "Finance" }) {
  const styles = {
    Buy: "bg-teal/10 text-teal",
    Rent: "bg-gold/10 text-gold",
    Finance: "bg-navy/10 text-navy",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[type]}`}
    >
      {type}
    </span>
  );
}

export default function MachineryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? equipment
      : equipment.filter((e) => e.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-teal/20 text-teal-light text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Equipment & Machinery
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Farm Machinery &amp; Implements
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Access the equipment you need to farm productively. Buy, rent, or
              finance tractors, irrigation systems, harvesters, and implements
              through the AFU network.
            </p>
          </div>
        </div>
      </section>

      {/* Category Tabs + Equipment Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Filter className="w-5 h-5 text-teal" />
            <h2 className="text-2xl font-bold text-navy">
              Browse Equipment
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-teal text-white shadow-md"
                    : "bg-cream text-navy hover:bg-teal-light"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
              >
                {/* Image Placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                >
                  <Wrench className="w-12 h-12 text-white/30" />
                </div>

                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block bg-navy/5 text-navy text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                    {item.category}
                  </span>

                  <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-teal transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Price */}
                  <div className="text-navy font-bold text-lg mb-3">
                    {item.priceRange}
                  </div>

                  {/* Availability */}
                  <div className="flex flex-wrap gap-2">
                    {item.availability.map((a) => (
                      <AvailabilityBadge key={a} type={a} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acquisition Options */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Three Ways to Get Your Equipment
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Whether you need equipment for a season or a lifetime, we have a
              solution that fits your budget and farming operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {acquisitionOptions.map((option, i) => {
              const Icon = option.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 text-center border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">
                    {option.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implements Sub-section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Small-Scale &amp; Traditional Implements
          </h2>
          <p className="text-gray-500 max-w-2xl mb-10">
            Not every farm needs a tractor. We also supply hand tools,
            animal-drawn implements, and small mechanisation solutions for
            smallholder farmers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Hand Tools",
                items: [
                  "Hoes and rakes",
                  "Pruning shears",
                  "Wheelbarrows",
                  "Knapsack sprayers",
                  "Hand seeders",
                ],
              },
              {
                title: "Animal-Drawn Implements",
                items: [
                  "Ox-drawn ploughs",
                  "Cultivators",
                  "Ridgers",
                  "Carts and trailers",
                  "Harrows",
                ],
              },
              {
                title: "Small Mechanisation",
                items: [
                  "Walk-behind tractors",
                  "Motorised sprayers",
                  "Small threshers",
                  "Pedal-powered shellers",
                  "Solar-powered pumps",
                ],
              },
            ].map((group, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-8 border border-gray-100"
              >
                <h3 className="text-lg font-bold text-navy mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-2.5">
                  {group.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-teal rounded-full shrink-0" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal to-teal-dark rounded-2xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find What You Need on the Marketplace
            </h2>
            <p className="text-teal-light/80 text-lg mb-8 max-w-2xl mx-auto">
              Browse our full equipment catalogue on the AFU Marketplace. Compare
              prices, check availability, and connect with verified suppliers.
            </p>
            <Link
              href="/supplier"
              className="inline-flex items-center gap-2 bg-white text-teal hover:bg-cream px-8 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Browse Marketplace
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
