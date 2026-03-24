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
    icon: "🌍",
    title: "Trade Finance",
    description:
      "SBLCs, Letters of Credit, export pre-financing, warehouse receipt finance, and FX services via Hamilton Reserve Bank. Our highest-margin product powering cross-border agricultural trade across Africa.",
    stat: "15+ currencies",
    link: "/services/finance/trade-finance",
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
    icon: "📦",
    title: "Harvest Finance",
    description:
      "Bridge the gap between crop delivery and buyer payment. Receive up to 80% advance on verified offtake contracts.",
    stat: "80% advance",
    link: "/services/finance/harvest-finance",
  },
  {
    icon: "🏠",
    title: "Farm Mortgages",
    description:
      "Long-term financing for farmland purchase, farm buildings, processing facilities, and storage infrastructure.",
    stat: "Up to 15 years",
    link: "/services/finance/mortgages",
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
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
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
      <section className="bg-[#5DB347] text-white py-12">
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
              Seven specialized products covering every financial need in
              agriculture. Each is tailored to the realities of African farming
              cycles and markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <Link
                key={i}
                href={product.link}
                className="card-polished bg-cream rounded-2xl p-8 hover:shadow-lg transition-all group border border-transparent hover:border-[#5DB347]/20"
              >
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-[#5DB347] transition-colors">
                  {product.title}
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-[#5DB347]/10 text-[#5DB347] text-xs font-semibold px-3 py-1 rounded-full">
                    {product.stat}
                  </span>
                  <span className="text-[#5DB347] text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    Learn More &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community-Backed Lending */}
      <section className="py-20 bg-[#F8FBF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#5DB347]/20 shadow-lg overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#5DB347]/10 rounded-xl flex items-center justify-center text-2xl">
                    🤝
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-navy">
                      Community-Backed Lending
                    </h2>
                    <span className="text-[#5DB347] text-sm font-semibold">
                      What Makes AFU Different
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  At AFU, lending decisions aren&apos;t made by distant committees.
                  Your peers &mdash; fellow farmers who understand your land, your
                  crops, and your potential &mdash; participate in the review
                  process. When your community believes in you, so do we.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-cream rounded-xl p-5">
                    <div className="text-2xl mb-2">👥</div>
                    <h4 className="font-bold text-navy text-sm mb-1">Peer Review</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      Community members who know your farming operation vouch for
                      your capability and character.
                    </p>
                  </div>
                  <div className="bg-cream rounded-xl p-5">
                    <div className="text-2xl mb-2">✅</div>
                    <h4 className="font-bold text-navy text-sm mb-1">Community Vote</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      Peers participate in the lending review, adding a trust layer
                      that traditional banks cannot replicate.
                    </p>
                  </div>
                  <div className="bg-cream rounded-xl p-5">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="font-bold text-navy text-sm mb-1">Shared Success</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      When one farmer succeeds, the entire community benefits &mdash;
                      creating aligned incentives and stronger repayment rates.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-navy px-8 md:px-12 py-5">
                <p className="text-white/80 text-sm text-center">
                  Our peer-reviewed lending model achieves a <span className="text-[#5DB347] font-bold">98.2% repayment rate</span> &mdash;
                  higher than any traditional agricultural lender in our markets.
                </p>
              </div>
            </div>
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
                <div className="w-14 h-14 bg-[#5DB347] rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
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
              className="bg-[#5DB347] hover:bg-[#449933] text-white px-8 py-3 rounded-lg font-semibold transition-smooth"
            >
              Check Eligibility
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-smooth"
            >
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
