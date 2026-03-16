import Link from "next/link";

export const metadata = {
  title: "Farm Insurance - Comprehensive Protection - AFU",
  description:
    "All-in-one farm protection: buildings, fencing, irrigation, stored produce, and liability. Tailored for African farming operations of all sizes.",
};

const coverageAreas = [
  {
    title: "Farm Buildings",
    description: "Barns, sheds, pack houses, drying floors, silos, and worker accommodation protected against fire, storm, flood, and structural failure.",
    icon: "🏗️",
  },
  {
    title: "Fencing & Boundaries",
    description: "Perimeter fencing, game fencing, electric fencing, and boundary walls covered against storm damage, vehicle impact, and vandalism.",
    icon: "🔒",
  },
  {
    title: "Irrigation Infrastructure",
    description: "Centre pivots, drip lines, pump stations, dams, and boreholes insured against mechanical failure, lightning, and flood damage.",
    icon: "💧",
  },
  {
    title: "Stored Produce",
    description: "Harvested crops in storage, seeds, feed, and processed goods protected against fire, water damage, theft, and contamination.",
    icon: "📦",
  },
  {
    title: "Farm Liability",
    description: "Third-party bodily injury and property damage on your farm. Covers visitor accidents, worker injuries, and product liability.",
    icon: "⚖️",
  },
  {
    title: "Natural Disaster",
    description: "Comprehensive coverage for earthquake, severe storm, flooding, wildfire, and other natural catastrophes affecting farm property.",
    icon: "🌪️",
  },
];

const farmSizes = [
  {
    name: "Smallholder",
    area: "Up to 20 hectares",
    buildings: "Up to $25,000",
    produce: "Up to $10,000",
    liability: "$50,000",
    premium: "From $25/month",
    features: ["Basic buildings cover", "Stored produce", "Third-party liability", "Fire & theft"],
  },
  {
    name: "Medium Scale",
    area: "20 - 100 hectares",
    buildings: "Up to $100,000",
    produce: "Up to $50,000",
    liability: "$200,000",
    premium: "From $65/month",
    features: ["Extended buildings cover", "Irrigation infrastructure", "Fencing & boundaries", "Stored produce", "Comprehensive liability"],
    featured: true,
  },
  {
    name: "Commercial",
    area: "100+ hectares",
    buildings: "Up to $500,000",
    produce: "Up to $250,000",
    liability: "$1,000,000",
    premium: "From $150/month",
    features: ["Full property cover", "All infrastructure", "Business interruption", "Product liability", "Worker compensation", "Environmental liability"],
  },
];

const perils = [
  "Fire and explosion",
  "Lightning strike",
  "Storm and wind damage",
  "Flooding and water damage",
  "Hail damage",
  "Theft and burglary",
  "Vandalism and malicious damage",
  "Vehicle impact",
  "Earthquake",
  "Subsidence and landslip",
  "Falling trees",
  "Power surge and electrical damage",
];

const whyChoose = [
  { title: "Single Policy", desc: "One policy covering your entire farm instead of multiple separate policies. Simpler admin, better value." },
  { title: "Tailored Coverage", desc: "Coverage limits matched to your actual farm assets. No paying for cover you do not need." },
  { title: "Seasonal Flexibility", desc: "Adjust coverage seasonally as your stored produce levels change. Pay for what you need, when you need it." },
  { title: "Local Assessors", desc: "Farm-experienced assessors who understand agricultural properties and can evaluate claims quickly." },
];

export default function FarmInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Farm Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            All-in-one protection for your entire farming operation. Buildings,
            fencing, irrigation, stored produce, and liability coverage in a
            single comprehensive policy tailored to your farm size.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/farm/insurance/quote"
              className="bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/services/insurance"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              All Insurance Products
            </Link>
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              What&apos;s Covered
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Six key coverage areas protecting every aspect of your farm
              property and operations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageAreas.map((area, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all border border-transparent hover:border-gold/20"
              >
                <div className="text-3xl mb-3">{area.icon}</div>
                <h3 className="font-bold text-navy mb-2">{area.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Size Plans */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Plans by Farm Size
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Coverage tailored to your operation scale. Upgrade as your farm
              grows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {farmSizes.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  plan.featured
                    ? "bg-navy text-white ring-2 ring-gold"
                    : "bg-white border border-gray-100"
                }`}
              >
                {plan.featured && (
                  <div className="inline-block bg-gold text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.featured ? "text-white" : "text-navy"}`}>
                  {plan.name}
                </h3>
                <div className={`text-sm mb-3 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                  {plan.area}
                </div>
                <div className="text-2xl font-bold text-gold mb-4">
                  {plan.premium}
                </div>
                <div className={`space-y-1 text-xs mb-4 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                  <div>Buildings: {plan.buildings}</div>
                  <div>Stored Produce: {plan.produce}</div>
                  <div>Liability: {plan.liability}</div>
                </div>
                <ul className={`space-y-2 mb-6 ${plan.featured ? "text-gray-300" : "text-gray-500"}`}>
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm flex items-start gap-2">
                      <span className="text-teal mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/farm/insurance/quote"
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                    plan.featured
                      ? "bg-gold hover:bg-gold/90 text-white"
                      : "bg-navy hover:bg-navy-light text-white"
                  }`}
                >
                  Get Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perils Covered */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-4 text-center">
            Perils Covered
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            Comprehensive protection against the most common threats to farm
            property.
          </p>
          <div className="bg-cream rounded-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {perils.map((peril, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gold font-bold">&#10003;</span>
                  {peril}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10 text-center">
            Why Choose AFU Farm Insurance?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Protect Your Entire Farm
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            One comprehensive policy for your buildings, equipment, produce, and
            liability. Get a personalized quote in minutes.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Farm Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
