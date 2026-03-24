import Link from "next/link";

export const metadata = {
  title: "AFU Fresh — Farm to Fork | African Farming Union",
  description:
    "Fresh produce from African farmers, delivered to your door. Consumer grocery, B2B trade, and premium export — the Amazon of Food for Africa.",
};

const howItWorks = [
  {
    step: "01",
    icon: "🌾",
    title: "Browse Local Farms",
    desc: "Discover fresh produce from verified AFU farmers near you. Filter by crop, farm, and delivery date.",
  },
  {
    step: "02",
    icon: "🛒",
    title: "Order Fresh Produce",
    desc: "Add to your box, choose a subscription plan, or place a one-time order. Pay securely via mobile money or card.",
  },
  {
    step: "03",
    icon: "🚚",
    title: "Delivered Within 24 Hours",
    desc: "Cold-chain logistics from farm to your door. Track your order in real-time from harvest to delivery.",
  },
];

const tiers = [
  {
    name: "AFU Fresh",
    type: "B2C",
    tagline: "Consumer Grocery Boxes",
    price: "From $15/box",
    desc: "Weekly subscription boxes of fresh seasonal produce delivered to households. Fruits, vegetables, and staples straight from local farms.",
    features: [
      "Weekly or bi-weekly subscription options",
      "Seasonal variety boxes curated by farm experts",
      "Family, individual, and custom box sizes",
      "Mobile money and card payment",
      "Full traceability — know your farmer",
    ],
    color: "from-[#5DB347] to-[#449933]",
    borderColor: "border-[#5DB347]/30",
  },
  {
    name: "AFU Trade",
    type: "B2B",
    tagline: "Restaurants, Hotels & Retailers",
    price: "Bulk Pricing",
    desc: "Reliable bulk supply for hospitality, retail, and food service businesses. Consistent quality, competitive pricing, flexible delivery schedules.",
    features: [
      "Dedicated account manager",
      "Custom order volumes and schedules",
      "Quality-graded produce with certifications",
      "Invoice and credit terms available",
      "Priority cold-chain logistics",
    ],
    color: "from-[#1B2A4A] to-[#2D4A7A]",
    borderColor: "border-[#1B2A4A]/30",
    featured: true,
  },
  {
    name: "AFU Export",
    type: "International",
    tagline: "EU, UK & Middle East Markets",
    price: "Premium Crops",
    desc: "Export-grade African produce to international markets. Specialty crops, premium quality, full trade finance and logistics support.",
    features: [
      "Export-certified produce (GlobalGAP, HACCP)",
      "EU, UK, and Middle East market access",
      "Trade finance instruments (SBLCs, L/Cs)",
      "End-to-end logistics and customs",
      "Carbon-neutral shipping options",
    ],
    color: "from-[#D4A843] to-[#E8C547]",
    borderColor: "border-gold/30",
  },
];

export default function FreshPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, #1a4a1a 0%, #2d6b2d 50%, #1a4a1a 100%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-15 blur-3xl" style={{ background: "#5DB347" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-5 py-2 rounded-full text-sm font-bold mb-8">
            Coming 2027
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            AFU Fresh{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DB347] to-[#6ABF4B]">
              — Farm to Fork
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Fresh produce from African farmers, delivered to your door. The marketplace
            that connects farms directly to consumers, restaurants, and international markets.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact?subject=afu_fresh"
              className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:from-[#449933] hover:to-[#3d8a2e] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
            >
              Register Interest
            </Link>
            <Link
              href="/about"
              className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
            >
              About AFU
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="text-center bg-white rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="w-10 h-10 bg-[#5DB347] rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Tiers */}
      <section className="py-20" style={{ background: "#EDF4EF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              Three Marketplaces
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                One Platform, Three Markets
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From household grocery boxes to international commodity export — AFU Fresh connects
              African farmers to every market tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border ${tier.borderColor} relative`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B2A4A] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                    Highest Volume
                  </div>
                )}
                <div className={`inline-block bg-gradient-to-r ${tier.color} text-white text-xs font-bold px-3 py-1 rounded-full mb-4`}>
                  {tier.type}
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] mb-1">{tier.name}</h3>
                <p className="text-[#5DB347] text-sm font-semibold mb-2">{tier.tagline}</p>
                <div className="text-2xl font-extrabold text-[#1B2A4A] mb-4">{tier.price}</div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{tier.desc}</p>
                <ul className="space-y-2 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#5DB347] mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?subject=afu_fresh"
                  className="block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-[#EBF7E5] text-[#5DB347] hover:bg-[#5DB347] hover:text-white"
                >
                  Register Interest
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a3a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-5 py-2 rounded-full text-sm font-bold mb-8">
            Coming 2027
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            The Future of African Food Distribution
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            AFU Fresh is being designed as part of the AFU ecosystem — leveraging our existing
            farmer network, processing hubs, cold-chain logistics, and trade finance infrastructure
            to create Africa&apos;s most complete farm-to-fork marketplace.
          </p>
          <Link
            href="/contact?subject=afu_fresh"
            className="inline-flex bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-[#1B2A4A] px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-gold/20"
          >
            Register Your Interest
          </Link>
        </div>
      </section>
    </>
  );
}
