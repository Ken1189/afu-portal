import Link from "next/link";

export const metadata = {
  title: "Blockchain for Agriculture — EDMA | AFU",
  description:
    "AFU's blockchain strategy powered by EDMA — transparent, verifiable, trustworthy agricultural finance on Ethereum Layer-2.",
};

const whyCards = [
  {
    icon: "🔍",
    title: "Transparency",
    desc: "Every loan, disbursement, and repayment recorded on-chain. Immutable audit trail for investors, regulators, and farmers.",
  },
  {
    icon: "⚡",
    title: "Efficiency",
    desc: "Cross-border payments in seconds, not days. Stablecoin settlement eliminates FX friction across 9 African countries.",
  },
  {
    icon: "🛡️",
    title: "Trust",
    desc: "Verified real-world assets via Proof-of-Verification protocol. Farm assets, warehouse receipts, and carbon credits — all verifiable on-chain.",
  },
];

const roadmap = [
  {
    phase: "Phase 1",
    timeline: "Now",
    status: "live",
    title: "Platform Live — Traditional Finance Rails",
    items: [
      "Full digital platform operational across 9 countries",
      "Traditional banking infrastructure via Hamilton Reserve",
      "Escrow-controlled loan disbursement and repayment",
      "Foundation laid for blockchain integration",
    ],
  },
  {
    phase: "Phase 2",
    timeline: "6–12 Months",
    status: "next",
    title: "On-Chain Loan Tracking & AFUSD Stablecoin",
    items: [
      "Loan lifecycle tracking on EDMA Layer-2",
      "AFUSD stablecoin for cross-border settlement",
      "Transparent investor reporting via on-chain data",
      "Smart contract escrow for trade finance instruments",
    ],
  },
  {
    phase: "Phase 3",
    timeline: "12–18 Months",
    status: "upcoming",
    title: "RWA Tokenization & Carbon Credits",
    items: [
      "Tokenization of farm assets as Real-World Assets (RWAs)",
      "Warehouse receipt tokens for collateralized lending",
      "Carbon credit minting from verified sustainable farming",
      "Secondary market for agricultural asset tokens",
    ],
  },
  {
    phase: "Phase 4",
    timeline: "18–24 Months",
    status: "future",
    title: "DeFi Lending Pool & Governance",
    items: [
      "Decentralized lending pool for agricultural capital",
      "AFU governance tokens for community-driven decisions",
      "Yield opportunities for token holders",
      "Full composability with the broader DeFi ecosystem",
    ],
  },
];

const statusColors: Record<string, string> = {
  live: "bg-[#5DB347] text-white",
  next: "bg-gold text-[#1B2A4A]",
  upcoming: "bg-[#1B2A4A] text-white",
  future: "bg-gray-200 text-gray-600",
};

export default function BlockchainPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 50%, #1e3a3a 100%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl" style={{ background: "#5DB347" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 border border-[#5DB347]/30 text-[#5DB347] px-5 py-2 rounded-full text-sm font-bold mb-8">
            Coming Soon
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Blockchain for Agriculture
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DB347] to-[#6ABF4B]">
              Powered by EDMA
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Transparent, verifiable, trustworthy — the infrastructure layer for African agricultural finance.
          </p>
          <Link
            href="/contact"
            className="inline-flex bg-gradient-to-r from-[#5DB347] to-[#449933] hover:from-[#449933] hover:to-[#3d8a2e] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              The Case
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Why Blockchain?
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              African agriculture suffers from opacity, slow payments, and lack of verifiable data. Blockchain solves all three.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-center"
              >
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-[#1B2A4A] mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partner: EDMA */}
      <section className="py-20" style={{ background: "#EDF4EF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
                Technology Partner
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                  Our Partner: EDMA
                </span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                EDMA is an Ethereum Layer-2 blockchain purpose-built for Real-World Assets (RWAs). Their
                Proof-of-Verification protocol ensures that every asset tokenized on-chain corresponds to a
                verified, auditable real-world asset.
              </p>
              <div className="space-y-4">
                {[
                  "Ethereum Layer-2 — fast, low-cost, secure",
                  "Proof-of-Verification protocol for real-world asset attestation",
                  "Purpose-built for agriculture, commodities, and trade finance",
                  "Full regulatory compliance framework",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#5DB347] mt-0.5">&#10003;</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-extrabold text-white">E</span>
                </div>
                <h3 className="text-2xl font-bold text-[#1B2A4A] mb-2">EDMA Network</h3>
                <p className="text-gray-500 text-sm mb-6">Ethereum L2 for Real-World Assets</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "L2", label: "Ethereum Layer" },
                    { value: "<1s", label: "Transaction Time" },
                    { value: "$0.001", label: "Per Transaction" },
                    { value: "PoV", label: "Proof-of-Verification" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#EBF7E5] rounded-xl p-3">
                      <div className="text-lg font-bold text-[#1B2A4A]">{stat.value}</div>
                      <p className="text-[11px] text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              Timeline
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Blockchain Roadmap
              </span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {roadmap.map((phase, idx) => (
              <div key={phase.phase} className="relative flex gap-6">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${statusColors[phase.status]}`}>
                    {idx + 1}
                  </div>
                  {idx < roadmap.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 my-2" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-10 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-[#1B2A4A]">{phase.phase}</span>
                    <span className="text-xs text-gray-400">{phase.timeline}</span>
                    {phase.status === "live" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5DB347]/20 text-[#5DB347]">LIVE</span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#1B2A4A] mb-3">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#5DB347] mt-0.5">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What This Means for Farmers */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a3a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#6ABF4B" }}>
            For Farmers
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6">
            What This Means for You
          </h2>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 mb-8">
            <p className="text-xl text-gray-300 leading-relaxed">
              You won&apos;t see blockchain. You&apos;ll see <span className="text-white font-semibold">faster payments</span>,{" "}
              <span className="text-white font-semibold">more transparent lending</span>, and{" "}
              <span className="text-white font-semibold">new income from carbon credits</span>.
            </p>
            <p className="text-gray-400 mt-4 text-sm">
              The technology works behind the scenes to make every transaction faster, cheaper, and verifiable.
              Your AFU app stays the same — the infrastructure underneath gets better.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "💸", title: "Faster Payments", desc: "Cross-border settlement in seconds" },
              { icon: "📊", title: "Transparent Lending", desc: "Every loan tracked and verifiable" },
              { icon: "🌿", title: "Carbon Income", desc: "Earn from sustainable farming practices" },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4">
            Interested in AFU&apos;s Blockchain Strategy?
          </h2>
          <p className="text-gray-500 mb-8">
            Get in touch to learn more about our partnership with EDMA and the future of agricultural finance.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-[#5DB347] to-[#449933] hover:from-[#449933] hover:to-[#3d8a2e] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Contact Us
            </Link>
            <Link
              href="/investors"
              className="border-2 border-[#1B2A4A]/20 hover:border-[#1B2A4A]/40 text-[#1B2A4A] px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Investor Information
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
