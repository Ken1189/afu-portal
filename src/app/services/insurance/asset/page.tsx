import Link from "next/link";

export const metadata = {
  title: "Asset Insurance - AFU",
  description:
    "Protect your farming equipment, machinery, vehicles, and buildings with AFU Asset Insurance. Coverage for breakdown, theft, fire, flood, and vandalism.",
};

const coverage = [
  { peril: "Mechanical Breakdown", description: "Coverage for sudden and unforeseen mechanical or electrical failure of insured equipment." },
  { peril: "Theft & Burglary", description: "Protection against theft, attempted theft, and burglary of equipment from farm premises or in transit." },
  { peril: "Fire & Lightning", description: "Full replacement coverage for assets destroyed or damaged by fire, lightning strike, or explosion." },
  { peril: "Flood & Storm", description: "Coverage for water damage from flooding, heavy rainfall, hail, and storm-force winds." },
  { peril: "Vandalism", description: "Protection against malicious damage to farm equipment, buildings, and infrastructure." },
  { peril: "Accidental Damage", description: "Coverage for unintentional physical damage during normal farming operations and transport." },
];

const assetCategories = [
  {
    category: "Farm Equipment",
    items: ["Tractors & implements", "Combine harvesters", "Planters & seeders", "Sprayers & spreaders"],
    premiumRange: "$12 - $85/mo",
  },
  {
    category: "Machinery",
    items: ["Irrigation pumps", "Milling equipment", "Drying systems", "Solar installations"],
    premiumRange: "$15 - $60/mo",
  },
  {
    category: "Vehicles",
    items: ["Farm trucks", "Delivery vehicles", "ATVs & UTVs", "Trailers"],
    premiumRange: "$20 - $75/mo",
  },
  {
    category: "Buildings",
    items: ["Storage sheds", "Pack houses", "Worker housing", "Processing facilities"],
    premiumRange: "$25 - $120/mo",
  },
];

const premiumFactors = [
  "Asset type and age",
  "Replacement value",
  "Location and security measures",
  "Claims history",
  "Deductible chosen",
  "Coverage level (basic, standard, comprehensive)",
];

const claimSteps = [
  { step: "01", title: "Report", desc: "Report the incident via the AFU app, dashboard, or by calling our 24/7 claims hotline within 48 hours." },
  { step: "02", title: "Document", desc: "Upload photos, police report (if theft), and any repair quotes. Our digital process makes this quick." },
  { step: "03", title: "Assess", desc: "An AFU assessor evaluates the claim. For straightforward claims under $2,000, assessment is done remotely." },
  { step: "04", title: "Settle", desc: "Approved claims are paid within 5 business days directly into your AFU Bank account." },
];

const plans = [
  {
    name: "Basic",
    deductible: "$200",
    coverage: "Fire, theft, storm",
    limit: "Up to $10,000",
    premium: "From $12/mo",
  },
  {
    name: "Standard",
    deductible: "$100",
    coverage: "Basic + breakdown, flood",
    limit: "Up to $50,000",
    premium: "From $35/mo",
    featured: true,
  },
  {
    name: "Comprehensive",
    deductible: "$50",
    coverage: "All perils + accidental",
    limit: "Up to $200,000",
    premium: "From $85/mo",
  },
];

export default function AssetInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Asset Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Your farming equipment is your livelihood. Protect tractors,
            machinery, vehicles, and buildings against breakdown, theft, fire,
            flood, and other perils with affordable, agricultural-specific
            coverage.
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

      {/* What's Covered */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              What&apos;s Covered
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Comprehensive protection against the most common risks facing
              farming equipment and infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverage.map((item, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 border border-transparent hover:border-gold/20 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.peril}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Categories */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Insurable Assets
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We cover a wide range of farming assets. Premiums vary based on
              asset value, type, and your selected coverage level.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assetCategories.map((cat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-navy mb-3">{cat.category}</h3>
                <ul className="space-y-1.5 mb-4">
                  {cat.items.map((item, j) => (
                    <li key={j} className="text-gray-500 text-sm flex items-start gap-2">
                      <span className="text-teal mt-0.5 text-xs">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="inline-block bg-gold/10 text-gold text-xs font-semibold px-3 py-1 rounded-full">
                  {cat.premiumRange}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Three coverage levels to match your needs and budget. Upgrade or
              downgrade at any renewal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  plan.featured
                    ? "bg-navy text-white ring-2 ring-gold"
                    : "bg-cream"
                }`}
              >
                {plan.featured && (
                  <div className="inline-block bg-gold text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.featured ? "text-white" : "text-navy"}`}>
                  {plan.name}
                </h3>
                <div className="text-2xl font-bold text-gold mb-4">
                  {plan.premium}
                </div>
                <ul className={`space-y-2 text-sm mb-6 ${plan.featured ? "text-gray-300" : "text-gray-500"}`}>
                  <li>Deductible: {plan.deductible}</li>
                  <li>Covers: {plan.coverage}</li>
                  <li>Limit: {plan.limit}</li>
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

      {/* Premium Factors */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-4 text-center">
            What Affects Your Premium?
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            Your premium is calculated based on these factors:
          </p>
          <div className="bg-white rounded-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {premiumFactors.map((factor, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                  <span className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center text-gold text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Claim Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Claim Process
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              When something goes wrong, we make the claims process fast and
              straightforward. Most claims are settled within 5 business days.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {claimSteps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Protect Your Equipment Today
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get a personalized asset insurance quote in under 5 minutes. Coverage
            starts the same day your premium is paid.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
