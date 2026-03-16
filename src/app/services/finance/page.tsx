import Link from "next/link";

export const metadata = {
  title: "Financial Services - AFU",
  description:
    "Comprehensive agricultural financing from AFU. Access loans, banking, asset finance, mortgages, and more tailored for African farmers.",
};

const products = [
  {
    icon: "🏦",
    title: "AFU Bank",
    description:
      "Our own agricultural banking arm with savings, deposits, and mobile-first accounts designed for farming communities.",
    stat: "4 account types",
    link: "/services/finance/afu-bank",
  },
  {
    icon: "🚜",
    title: "Asset Finance",
    description:
      "Finance tractors, irrigation systems, solar panels, cold storage, and other critical farming equipment over flexible terms.",
    stat: "Up to 80% financed",
    link: "/services/finance/asset-finance",
  },
  {
    icon: "🌱",
    title: "Crop Development Loans",
    description:
      "Season-linked lending from pre-plant through harvest. Repayment tied to your crop cycle and offtake revenue.",
    stat: "$500 - $100K",
    link: "/services/finance/crop-dev-loan",
  },
  {
    icon: "🏠",
    title: "Farm Mortgages",
    description:
      "Long-term financing for farmland purchase, farm buildings, processing facilities, and storage infrastructure.",
    stat: "Up to 15 years",
    link: "/services/finance/mortgages",
  },
  {
    icon: "🧪",
    title: "Input Finance",
    description:
      "Get seeds, fertilizers, and chemicals without cash upfront. We pay approved suppliers directly and deduct at harvest.",
    stat: "Zero upfront cost",
    link: "/services/finance/input-finance",
  },
  {
    icon: "📦",
    title: "Harvest Finance",
    description:
      "Bridge the gap between crop delivery and buyer payment. Receive up to 80% advance on verified offtake contracts.",
    stat: "80% advance",
    link: "/services/finance/harvest-finance",
  },
];

const stats = [
  { value: "$2.4M+", label: "Capital Deployed" },
  { value: "847", label: "Active Loans" },
  { value: "98.2%", label: "Repayment Rate" },
  { value: "4", label: "Countries Served" },
];

export default function FinanceHubPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Financial Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AFU Financial Services
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Comprehensive agricultural financing designed for African farmers. From
            seed capital to harvest advances, we provide the funding you need at
            every stage of your farming journey.
          </p>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-teal text-white py-12">
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
              Our Finance Products
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Six specialized products covering every financial need in
              agriculture. Each is tailored to the realities of African farming
              cycles and markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <Link
                key={i}
                href={product.link}
                className="bg-cream rounded-2xl p-8 hover:shadow-lg transition-all group border border-transparent hover:border-teal/20"
              >
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors">
                  {product.title}
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full">
                    {product.stat}
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

      {/* How It Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Getting Started is Simple
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our streamlined process gets you from application to funded in as
              little as 48 hours for pre-approved members.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Join AFU", desc: "Complete your membership and KYC verification." },
              { step: "02", title: "Choose Product", desc: "Select the finance product that fits your needs." },
              { step: "03", title: "Submit Application", desc: "Provide your farm details, crop plan, and documents." },
              { step: "04", title: "Get Funded", desc: "Receive funds directly or through supplier payments." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-teal rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
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
            Ready to Grow Your Farm?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Check your eligibility in under 5 minutes. No obligation, no impact
            on your credit score.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Check Eligibility
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
