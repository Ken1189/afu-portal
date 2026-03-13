import Link from "next/link";

export const metadata = {
  title: "About AFU - African Farming Union",
  description: "Learn about AFU's mission to transform African agriculture through integrated financing, inputs, processing, and offtake.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About AFU</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            The African Farming Union is a vertically integrated agriculture development platform
            designed to function as a specialized agri dev bank + execution engine.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10">The Broken Cash Cycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: "Inputs Needed", desc: "Capital arrives late" },
              { title: "Yields Stay Low", desc: "No guaranteed buyers" },
              { title: "Crops Sold Cheap", desc: "Or wasted entirely" },
              { title: "Payments Delayed", desc: "Next season underfunded" },
              { title: "Repeat", desc: "The cycle continues" },
            ].map((step, i) => (
              <div key={i} className="bg-teal-light rounded-xl p-6 text-center">
                <div className="w-8 h-8 bg-teal text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-bold text-navy mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-teal-light rounded-xl p-6 mt-8">
            <p className="text-navy text-center font-medium">
              Africa&apos;s agriculture doesn&apos;t fail at farming &mdash; it fails at <strong>finance + offtake + processing</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Operating Model */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10">Operating Model</h2>
          <p className="text-gray-500 mb-10 max-w-2xl">AFU operates as a portfolio of programs + projects across three tiers:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: "Tier A",
                name: "Smallholder & SME",
                items: ["Input bundles + seasonal working capital", "Training + compliance onboarding", "Guaranteed buy-back routes"],
              },
              {
                tier: "Tier B",
                name: "Commercial Farms",
                items: ["Equipment finance, irrigation, high-value crop financing", "Structured contracts + processing access", "Market linkage + export packaging"],
              },
              {
                tier: "Tier C",
                name: "Large Projects",
                items: ["Project finance + infrastructure", "Anchor processing hubs", "Full corridor offtake contracts"],
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="text-teal text-sm font-semibold uppercase tracking-wider mb-1">{item.tier}</div>
                <h3 className="text-xl font-bold text-navy mb-4">{item.name}</h3>
                <ul className="space-y-3">
                  {item.items.map((li, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-teal mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Control */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10">Risk & How We Control It</h2>
          <div className="space-y-4">
            {[
              { risk: "Credit Risk", mitigation: "Offtake contracts, tranche releases, input-in-kind financing, aggregation control" },
              { risk: "Execution Risk", mitigation: "Commercial farmer operators + phased rollout" },
              { risk: "FX / Regulatory Risk", mitigation: "Structured trade routes + multi-country diversification" },
              { risk: "Commodity Price Risk", mitigation: "Processing/value-add + contract pricing mechanisms" },
              { risk: "Fraud / Leakage", mitigation: "Controlled procurement + field verification + audit trail" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 bg-cream rounded-xl p-6">
                <div className="font-bold text-navy min-w-[200px]">{item.risk}</div>
                <div className="text-gray-600 text-sm">{item.mitigation}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join the AFU Ecosystem</h2>
          <Link href="/apply" className="inline-block bg-white text-teal hover:bg-gray-100 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors">
            Apply for Membership
          </Link>
        </div>
      </section>
    </>
  );
}
