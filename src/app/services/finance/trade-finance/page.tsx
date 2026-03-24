"use client";

import Link from "next/link";

const products = [
  {
    icon: "🛡️",
    title: "Standby Letters of Credit (SBLCs)",
    description:
      "We back your export deals with bankable guarantees. AFU-issued SBLCs give international buyers confidence and unlock larger trade volumes for African exporters.",
    stat: "Export-backed",
    highlights: [
      "Issued against verified offtake contracts",
      "Accepted by international commodity buyers",
      "Covers up to 100% of shipment value",
      "Rapid issuance via AFU Bank infrastructure",
    ],
  },
  {
    icon: "📜",
    title: "Documentary Credits",
    description:
      "Secure international trade payments through irrevocable letters of credit. Protects both buyer and seller with bank-guaranteed settlement upon document presentation.",
    stat: "Bank-guaranteed",
    highlights: [
      "Irrevocable L/C structures",
      "Compliant with UCP 600 standards",
      "Multi-currency settlement",
      "Document verification and processing",
    ],
  },
  {
    icon: "💰",
    title: "Export Pre-Financing",
    description:
      "Access capital before shipment to fund production, packaging, and logistics. Repayment is tied to confirmed export receipts through AFU escrow accounts.",
    stat: "Pre-shipment capital",
    highlights: [
      "Up to 80% of confirmed export order value",
      "Disbursed against verified purchase orders",
      "Flexible tenors aligned to shipping cycles",
      "Escrow-controlled repayment on receipt",
    ],
  },
  {
    icon: "🔒",
    title: "Trade Insurance",
    description:
      "Protect against buyer default, political risk, and payment delays. Comprehensive coverage ensures your cross-border trade is protected from end to end.",
    stat: "Full coverage",
    highlights: [
      "Buyer default protection",
      "Political risk insurance",
      "Currency inconvertibility cover",
      "Claims processed within 30 days",
    ],
  },
  {
    icon: "🌍",
    title: "Foreign Exchange",
    description:
      "Competitive rates across African currencies. Lock in exchange rates on export proceeds and protect margins against volatility in frontier markets.",
    stat: "15+ currencies",
    highlights: [
      "Spot and forward contracts",
      "Competitive interbank rates",
      "Coverage across all AFU member countries",
      "Hedging solutions for exporters",
    ],
  },
];

const steps = [
  {
    step: "01",
    title: "Submit Trade Documents",
    desc: "Provide your offtake contract, purchase order, or export documentation.",
  },
  {
    step: "02",
    title: "AFU Review & Structuring",
    desc: "Our trade finance team structures the optimal instrument for your deal.",
  },
  {
    step: "03",
    title: "Instrument Issuance",
    desc: "SBLCs, L/Cs, or pre-financing disbursed within 5-10 business days.",
  },
  {
    step: "04",
    title: "Trade & Settlement",
    desc: "Execute your trade with full backing. Settlement flows through AFU escrow.",
  },
];

export default function TradeFinancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Trade Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Trade Finance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Enabling cross-border agricultural trade across Africa. From letters
            of credit to export pre-financing, we provide the instruments that
            turn offtake agreements into bankable transactions.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/contact"
              className="bg-gold hover:bg-amber-500 text-navy-dark px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Enquire About Trade Finance
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

      {/* Key Stats */}
      <section className="bg-[#5DB347] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15+", label: "African Currencies Supported" },
              { value: "9", label: "Countries Covered" },
              { value: "UCP 600", label: "International Standards" },
              { value: "5-10 Days", label: "Instrument Issuance" },
            ].map((stat, i) => (
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

      {/* Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Trade Finance Products
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Five specialized instruments designed for African agricultural
              exporters. Each product is structured to reduce risk and accelerate
              trade settlement.
            </p>
          </div>

          <div className="space-y-8">
            {products.map((product, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-8 md:p-10 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <div className="text-4xl mb-4">{product.icon}</div>
                    <h3 className="text-xl font-bold text-navy mb-3">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {product.description}
                    </p>
                    <span className="inline-block bg-[#5DB347]/10 text-[#5DB347] text-xs font-semibold px-3 py-1 rounded-full">
                      {product.stat}
                    </span>
                  </div>
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-semibold text-navy mb-3 uppercase tracking-wider">
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {product.highlights.map((h, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <span className="text-[#5DB347] mt-0.5">
                            &#10003;
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
              From document submission to trade settlement, our streamlined
              process gets your trade finance instruments issued quickly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-gold font-bold text-lg mx-auto mb-4">
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
            Ready to Scale Your Export Business?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our trade finance team is ready to structure the right instruments
            for your cross-border agricultural deals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="bg-gold hover:bg-amber-500 text-navy-dark px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Talk to Trade Finance
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
    </>
  );
}
