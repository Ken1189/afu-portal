import Link from "next/link";

export const metadata = {
  title: "Farm Mortgages - AFU",
  description:
    "Build, expand, or purchase your farming operation with AFU Farm Mortgages. Up to 15-year terms, competitive rates from 9.5%, and up to 70% loan-to-value.",
};

const mortgageTypes = [
  {
    title: "Land Purchase",
    description:
      "Acquire new farmland to expand your operation. We finance productive agricultural land across Botswana, Zimbabwe, and Tanzania.",
    features: ["Up to 70% LTV", "15-year terms available", "Title transfer support"],
    icon: "🌍",
  },
  {
    title: "Farm Development",
    description:
      "Build or improve farm infrastructure including barns, processing sheds, worker housing, and irrigation installations.",
    features: ["Progress-based disbursement", "12-year terms", "Construction oversight included"],
    icon: "🏗️",
  },
  {
    title: "Refinancing",
    description:
      "Consolidate existing farm debts into a single, lower-rate AFU mortgage. Free up cash flow and simplify repayments.",
    features: ["Lower rates", "Debt consolidation", "Extended terms available"],
    icon: "🔄",
  },
];

const keyTerms = [
  { label: "Maximum Term", value: "Up to 15 years" },
  { label: "Interest Rates", value: "From 9.5% APR" },
  { label: "Loan-to-Value", value: "Up to 70%" },
  { label: "Minimum Loan", value: "$10,000" },
  { label: "Maximum Loan", value: "$500,000" },
  { label: "Repayment", value: "Monthly or quarterly" },
];

const financeTargets = [
  { name: "Farmland", desc: "Arable land, grazing land, and mixed-use agricultural plots with clear title or long-term leases." },
  { name: "Farm Buildings", desc: "Barns, storage sheds, worker accommodation, office buildings, and livestock housing." },
  { name: "Processing Facilities", desc: "Milling plants, pack houses, drying facilities, and food processing centers." },
  { name: "Storage Warehouses", desc: "Grain silos, cold storage facilities, and general produce warehousing." },
];

const applicationSteps = [
  { step: "01", title: "Pre-Qualification", desc: "Submit basic information online to check your estimated borrowing capacity. Takes 5 minutes." },
  { step: "02", title: "Documentation", desc: "Provide property details, financial statements, farm plans, and identification documents." },
  { step: "03", title: "Valuation", desc: "AFU-appointed valuers assess the property. We cover valuation costs for loans over $50,000." },
  { step: "04", title: "Approval", desc: "Credit committee reviews your application. Decisions within 10 business days for standard applications." },
  { step: "05", title: "Disbursement", desc: "Funds transferred to seller/contractor. Title registered with mortgage notation. You take possession." },
];

const documents = [
  "National ID or passport",
  "AFU membership certificate",
  "Proof of income (3 years of farm accounts or tax returns)",
  "Property title deed or offer letter",
  "Survey diagram or site plan",
  "Existing loan statements (if refinancing)",
  "Building plans and contractor quotes (if development)",
  "Environmental impact assessment (for properties over 50 hectares)",
];

export default function MortgagesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Farm Mortgages
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Build, expand, or purchase your farming operation with long-term
            mortgage financing. Competitive rates, generous terms, and a team
            that understands agricultural property.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Pre-Qualified
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

      {/* Mortgage Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Mortgage Types
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Whether you are buying land, building infrastructure, or
              refinancing, we have a mortgage product to fit your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mortgageTypes.map((type, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-8 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-bold text-navy mb-3">
                  {type.title}
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  {type.description}
                </p>
                <ul className="space-y-2">
                  {type.features.map((f, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span className="text-teal">&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Terms */}
      <section className="py-20 bg-teal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Key Terms</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {keyTerms.map((term, i) => (
              <div key={i} className="text-center">
                <div className="text-xl md:text-2xl font-bold mb-1">
                  {term.value}
                </div>
                <div className="text-white/70 text-sm">{term.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Finance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              What You Can Finance
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our mortgages cover a wide range of agricultural property and
              infrastructure investments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financeTargets.map((target, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 flex gap-4 items-start"
              >
                <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">{target.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {target.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Application Process
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our mortgage process is transparent and guided every step of the
              way by your dedicated AFU mortgage advisor.
            </p>
          </div>
          <div className="space-y-6">
            {applicationSteps.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4"
              >
                <div className="w-12 h-12 bg-teal rounded-2xl flex items-center justify-center text-white font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-4 text-center">
            Documents Required
          </h2>
          <p className="text-gray-500 mb-8 text-center max-w-2xl mx-auto">
            Prepare these documents ahead of time to speed up your application.
            Your mortgage advisor can help with any missing items.
          </p>
          <div className="bg-cream rounded-2xl p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-teal mt-0.5">&#9744;</span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Invest in Your Farm&apos;s Future
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with a free pre-qualification to understand your borrowing
            capacity. No obligation and no impact on your credit record.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get Pre-Qualified
          </Link>
        </div>
      </section>
    </>
  );
}
