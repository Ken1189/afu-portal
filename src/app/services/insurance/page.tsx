import Link from "next/link";

export const metadata = {
  title: "Farm Insurance - AFU",
  description:
    "Protect your farm, crops, livestock, and family with AFU Insurance. Comprehensive agricultural insurance products with fast claims and affordable premiums.",
};

const products = [
  {
    icon: "🚜",
    name: "Asset Insurance",
    description:
      "Protect your farming equipment, machinery, vehicles, and buildings against breakdown, theft, fire, and natural disasters.",
    premium: "From $12/month",
    link: "/services/insurance/asset",
  },
  {
    icon: "🌾",
    name: "Crop Insurance",
    description:
      "Guard against crop loss from drought, flood, pests, disease, and hail with weather-index and traditional indemnity coverage.",
    premium: "From $8/month",
    link: "/services/insurance/crop",
  },
  {
    icon: "🏥",
    name: "Medical Insurance",
    description:
      "Health coverage for farming families including outpatient care, hospitalization, dental, and optical across our clinic network.",
    premium: "From $15/month",
    link: "/services/insurance/medical",
  },
  {
    icon: "🏡",
    name: "Farm Insurance",
    description:
      "Comprehensive all-in-one protection for your entire farm: buildings, fencing, irrigation, stored produce, and liability coverage.",
    premium: "From $25/month",
    link: "/services/insurance/farm",
  },
  {
    icon: "🚢",
    name: "Trade Insurance",
    description:
      "Coverage for export shipments including marine transit, buyer default, letters of credit, and political risk for cross-border trade.",
    premium: "From $35/month",
    link: "/services/insurance/trade",
  },
  {
    icon: "🐄",
    name: "Livestock Insurance",
    description:
      "Protect your cattle, goats, sheep, and poultry against disease, theft, predators, and natural disasters.",
    premium: "From $10/month",
    link: "/services/insurance/livestock",
  },
];

const stats = [
  { value: "1,200+", label: "Policies Active" },
  { value: "$5.2M", label: "Total Coverage" },
  { value: "94%", label: "Claims Paid" },
  { value: "48hrs", label: "Avg. Claim Resolution" },
];

const steps = [
  {
    step: "01",
    title: "Choose Your Plan",
    description:
      "Browse our insurance products and select the coverage that matches your farm, livestock, or family needs.",
  },
  {
    step: "02",
    title: "Pay Your Premium",
    description:
      "Affordable monthly or annual premiums. Pay via AFU Bank, mobile money (EcoCash/M-Pesa), or deduct from harvest proceeds.",
  },
  {
    step: "03",
    title: "Get Protected",
    description:
      "Coverage starts immediately. File claims through your AFU dashboard or mobile app. Fast, fair payouts every time.",
  },
];

export default function InsuranceHubPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Farm Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Protect what matters most. Comprehensive agricultural insurance
            products designed for African farmers, with affordable premiums and
            fast, fair claims processing.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gold text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Our Insurance Products
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Six specialized insurance products covering every aspect of your
              farming operation, from equipment to exports.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <Link
                key={i}
                href={product.link}
                className="bg-cream rounded-2xl p-8 hover:shadow-lg transition-all group border border-transparent hover:border-gold/20"
              >
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-gold/10 text-gold text-xs font-semibold px-3 py-1 rounded-full">
                    {product.premium}
                  </span>
                  <span className="text-teal text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    Learn More &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How Insurance Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Getting insured with AFU is simple, fast, and completely digital.
              No paperwork, no broker visits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-navy mb-2 text-lg">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AFU Insurance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                Why AFU Insurance?
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Traditional insurers do not understand farming. We do. Our
                products are built around the realities of African agriculture:
                seasonal income, weather variability, and remote locations.
              </p>
              <ul className="space-y-4">
                {[
                  "Premiums aligned to farming income cycles",
                  "Claims processed in 48 hours, not weeks",
                  "Mobile-first: manage everything from your phone",
                  "Pay premiums via mobile money or harvest deduction",
                  "No hidden exclusions or fine print surprises",
                  "Local claims assessors who understand agriculture",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-600 text-sm"
                  >
                    <span className="text-teal mt-0.5 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">
                Bundle &amp; Save
              </h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Combine multiple insurance products into a single bundle and
                save up to 20% on your total premiums. Popular bundles include:
              </p>
              <div className="space-y-3">
                {[
                  { name: "Starter Bundle", includes: "Crop + Asset", saving: "10% off" },
                  { name: "Family Bundle", includes: "Medical + Farm + Crop", saving: "15% off" },
                  { name: "Commercial Bundle", includes: "All 6 products", saving: "20% off" },
                ].map((bundle, i) => (
                  <div key={i} className="bg-navy-light rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{bundle.name}</span>
                      <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {bundle.saving}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {bundle.includes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Protect Your Farm Today
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get a personalized quote in under 5 minutes. No obligation, no
            pressure. Just honest protection for your livelihood.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/farm/insurance/quote"
              className="bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Talk to an Agent
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
