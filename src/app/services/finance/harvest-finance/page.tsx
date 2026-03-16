import Link from "next/link";

export const metadata = {
  title: "Harvest Finance - AFU",
  description:
    "Bridge the gap between harvest and payment. Get up to 80% advance on verified offtake contracts with AFU Harvest Finance.",
};

const problemSolution = [
  {
    type: "problem",
    title: "The Problem",
    points: [
      "Farmers deliver crops but wait 30-90 days for buyer payment",
      "Cash flow gaps prevent investment in next season",
      "Farmers forced to sell at discount to get immediate cash",
      "Perishable crops lose value during payment delays",
    ],
  },
  {
    type: "solution",
    title: "The Solution",
    points: [
      "Receive 80% of crop value within 48 hours of delivery",
      "Remaining 20% paid when buyer settles, minus service fees",
      "No need to accept discounted prices for quick payment",
      "Maintain cash flow continuity between seasons",
    ],
  },
];

const processSteps = [
  {
    step: "01",
    title: "Deliver Crop",
    description:
      "Deliver your harvested crop to the AFU collection point, depot, or directly to the verified buyer.",
    highlight: "Crop quality-checked and weighed at delivery",
  },
  {
    step: "02",
    title: "Get 80% Advance",
    description:
      "Within 48 hours of verified delivery, AFU advances 80% of the agreed crop value into your AFU Bank account.",
    highlight: "Funds available same day for priority members",
  },
  {
    step: "03",
    title: "Buyer Pays AFU",
    description:
      "The buyer pays the full invoice amount into the AFU escrow account on the agreed payment terms (30-90 days).",
    highlight: "Escrow-protected payment",
  },
  {
    step: "04",
    title: "Receive Balance",
    description:
      "Once the buyer settles, AFU deducts the advance, service fee, and any outstanding loans. The remaining 20% (minus fees) is paid to you.",
    highlight: "Transparent fee breakdown provided",
  },
];

const terms = [
  { label: "Advance Rate", value: "Up to 80%" },
  { label: "Term", value: "30 - 90 days" },
  { label: "Service Fee", value: "8 - 12% APR" },
  { label: "Minimum Delivery", value: "$500 crop value" },
  { label: "Eligible Contracts", value: "Verified offtake only" },
  { label: "Payout Speed", value: "Within 48 hours" },
];

const eligibleCrops = [
  { crop: "Maize", markets: "Regional buyers, millers, feed manufacturers" },
  { crop: "Soya Beans", markets: "Oil processors, animal feed, export" },
  { crop: "Tobacco", markets: "Auction floors, contract buyers" },
  { crop: "Cotton", markets: "Ginners, textile exporters" },
  { crop: "Groundnuts", markets: "Processors, confectionery, export" },
  { crop: "Sunflower", markets: "Oil extraction, birdseed, export" },
  { crop: "Vegetables", markets: "Fresh produce markets, supermarkets" },
  { crop: "Wheat", markets: "Millers, bakeries, export" },
];

export default function HarvestFinancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Harvest Finance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Bridge the gap between harvest and payment. Deliver your crop and
            receive up to 80% of its value within 48 hours, while AFU collects
            from the buyer on agreed terms.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Apply for Harvest Finance
            </Link>
            <Link
              href="/services/finance"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              All Finance Products
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {problemSolution.map((block, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  block.type === "problem"
                    ? "bg-red-50 border border-red-100"
                    : "bg-teal-light border border-teal/20"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    block.type === "problem" ? "text-red-800" : "text-teal-dark"
                  }`}
                >
                  {block.title}
                </h3>
                <ul className="space-y-3">
                  {block.points.map((point, j) => (
                    <li
                      key={j}
                      className={`text-sm flex items-start gap-2 ${
                        block.type === "problem"
                          ? "text-red-700"
                          : "text-teal-dark"
                      }`}
                    >
                      <span className="mt-1">
                        {block.type === "problem" ? "✕" : "✓"}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A transparent process from crop delivery to final settlement.
              Track every step through your AFU dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processSteps.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal rounded-2xl flex items-center justify-center text-white font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-2">
                      {item.description}
                    </p>
                    <span className="inline-block bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full">
                      {item.highlight}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">
            Terms at a Glance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {terms.map((term, i) => (
              <div key={i} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-teal mb-1">
                  {term.value}
                </div>
                <div className="text-gray-400 text-sm">{term.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible Crops and Markets */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Eligible Crops &amp; Markets
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Harvest Finance is available for a range of crops sold through
              verified offtake contracts within the AFU network.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {eligibleCrops.map((item, i) => (
              <div
                key={i}
                className="bg-cream rounded-xl p-5 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-navy mb-1">{item.crop}</h3>
                <p className="text-gray-400 text-xs">{item.markets}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-20 bg-teal-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Integrated with AFU Services
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Harvest Finance works seamlessly with other AFU services. Combine it
            with Crop Development Loans for full-cycle financing, or use it
            alongside our Trade Finance and Export services for cross-border
            shipments. All transactions flow through the AFU escrow system for
            complete transparency.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/services/finance/crop-dev-loan"
              className="bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all text-sm"
            >
              Crop Development Loans
            </Link>
            <Link
              href="/services/trade-finance"
              className="bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all text-sm"
            >
              Trade Finance
            </Link>
            <Link
              href="/services/finance/afu-bank"
              className="bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all text-sm"
            >
              AFU Bank
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Waiting. Get Paid Faster.
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Apply for Harvest Finance and receive up to 80% of your crop value
            within 48 hours of delivery. Maintain cash flow and invest in your
            next season immediately.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Apply for Harvest Finance
          </Link>
        </div>
      </section>
    </>
  );
}
