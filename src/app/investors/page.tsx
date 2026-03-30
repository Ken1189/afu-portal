import Link from "next/link";
import Image from "next/image";
import {
  Banknote,
  Factory,
  ShieldCheck,
  CircleDollarSign,
  GraduationCap,
  Cog,
  Target,
  TrendingUp,
  PieChart,
  LineChart,
  CheckCircle2,
  ArrowRight,
  Landmark,
  Building2,
  BadgeDollarSign,
  ShieldPlus,
  Globe2,
  Users,
  BarChart3,
  Leaf,
  Mail,
  Phone,
  Calendar,
  Sprout,
  Monitor,
  HeartHandshake,
  UtensilsCrossed,
} from "lucide-react";
import VideoCard from "@/components/VideoCard";

export const metadata = {
  title: "Invest in AFU - $500M Seed Round | African Farming Union",
  description:
    "Join AFU's $500M seed round to build Africa's first vertically integrated agriculture development bank. $1T market opportunity. De-risked, technology-enabled model across 20 countries.",
  openGraph: {
    title: "Invest in AFU - $500M Seed Round",
    description:
      "Africa's agriculture is a $1T market by 2030. AFU is the execution layer — financing, inputs, processing, offtake, trade finance, and training in one integrated platform.",
    url: "https://afu-portal.vercel.app/investors",
    images: [
      {
        url: "https://afu-portal.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invest in AFU - $500M Seed Round",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invest in AFU - $500M Seed Round",
    description:
      "Africa's agriculture is a $1T market by 2030. AFU is the execution layer — financing, inputs, processing, offtake, trade finance, and training in one integrated platform.",
  },
};

export default function InvestorsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,26,48,0.95) 0%, rgba(27,42,74,0.9) 50%, rgba(15,26,48,0.85) 100%)",
            }}
          />
          {/* Subtle green glow */}
          <div
            className="absolute bottom-0 right-0 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: "#5DB347" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-5 py-2 rounded-full text-sm font-bold mb-8">
              <Landmark className="w-4 h-4" />
              $500M Seed Round
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-8">
              Invest in Africa&apos;s Agricultural{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">
                Transformation
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed max-w-2xl">
              AFU is building Africa&apos;s first vertically integrated agriculture
              development bank and operating platform — the execution layer for a
              $1 trillion market.
            </p>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl">
              One integrated loop: Financing, Inputs, Processing, Offtake, Trade
              Finance &amp; Training. Capital goes in, crops come out, cash
              recycles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="group bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-navy-dark px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-105"
              >
                Request Investor Pack
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Schedule a Call
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center gap-3">
              {[
                "DFI-Ready Structure",
                "Ring-Fenced SPV",
                "IFRS Compliant",
                "ESG Framework",
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full"
                >
                  <ShieldPlus className="w-3.5 h-3.5" style={{ color: "#5DB347" }} />
                  <span className="text-gray-300 text-xs font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── INVESTOR OVERVIEW VIDEO ─── */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a3a 100%)' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: '#5DB347' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#6ABF4B' }}>
              Investor Overview
            </span>
          </div>
          <VideoCard
            title="AFU Investment Thesis"
            duration="5 min"
            thumbnailUrl="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=675&fit=crop"
            size="large"
          />
        </div>
      </section>

      {/* ─── THE OPPORTUNITY ─── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #5DB347 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              The Opportunity
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Africa&apos;s Agriculture Paradox
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              The world&apos;s largest untapped agricultural opportunity. The land, labor, and demand exist — what&apos;s missing is the infrastructure to connect them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                value: "$1T",
                label: "African agri market by 2030",
                color: "from-gold to-amber-500",
              },
              {
                icon: TrendingUp,
                value: "$50B+",
                label: "Annual food import gap across Africa",
                color: "from-[#5DB347] to-emerald-500",
              },
              {
                icon: Globe2,
                value: "60%",
                label: "Of world's uncultivated arable land is in Africa",
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: LineChart,
                value: "10x",
                label: "Value chain multiplier from seed to export",
                color: "from-purple-500 to-indigo-500",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white rounded-3xl p-8 text-center shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-extrabold text-[#1B2A4A] mb-2">
                    {item.value}
                  </div>
                  <p className="text-gray-500 text-sm">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── WHY AFU ─── */}
      <section
        className="py-20 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a3a 100%)" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: "#5DB347" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#6ABF4B" }}>
                Competitive Advantage
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-8">
                Why{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DB347] to-[#6ABF4B]">
                  AFU
                </span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Vertically Integrated Model",
                    desc: "AFU controls the full value chain — financing, inputs, processing, and offtake — creating compounding returns at every stage. No one else does this.",
                  },
                  {
                    title: "20 Countries, One Platform",
                    desc: "Multi-country diversification de-risks exposure to any single market. Same playbook, different geographies, shared infrastructure.",
                  },
                  {
                    title: "Technology-Enabled Execution",
                    desc: "AI credit scoring, satellite crop monitoring, blockchain traceability, and a full digital platform create defensible advantages over traditional lenders.",
                  },
                  {
                    title: "Trade Finance Revenue Engine",
                    desc: "SBLCs, Letters of Credit, export pre-financing, and FX services via our banking partners generate high-margin fee income ($8M Year 3, $80M Year 5) while unlocking cross-border trade. Our highest-margin product line.",
                  },
                  {
                    title: "De-Risked Capital Deployment",
                    desc: "Input-in-kind financing, offtake contracts, and tranche releases mean capital is always tied to productive use. Escrow-controlled repayment eliminates leakage.",
                  },
                  {
                    title: "ESG & Impact Aligned",
                    desc: "Every dollar deployed creates measurable social impact: jobs, food security, rural income growth, and climate resilience. DFI-ready from day one.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[#5DB347]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#5DB347]/30 transition-colors">
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#5DB347" }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Key metrics */}
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-gold" />
                  By The Numbers
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "10", label: "Countries" },
                    { value: "37+", label: "Database Tables" },
                    { value: "247+", label: "Active Members" },
                    { value: "$500M", label: "Target Raise" },
                    { value: "6", label: "Service Pillars" },
                    { value: "12", label: "Languages" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#5DB347]/10 to-transparent border border-[#5DB347]/20 rounded-2xl p-6">
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="font-bold text-white">Transparency note:</span> AFU is pre-revenue and
                  pre-launch. The platform, database architecture, country operations framework, and full
                  service model have been built. We are raising to deploy capital into live farming operations
                  and process first harvests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PLATFORM (6 Pillars) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              The Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Six Integrated Pillars
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Most players only do one piece. AFU ties the full loop together — capital flows in, crops flow
              out, cash recycles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Banknote,
                title: "Financing",
                desc: "Working capital, invoice finance, and crop financing. Escrow-controlled repayment through offtake.",
                color: "from-[#1B2A4A] to-[#2D4A7A]",
              },
              {
                icon: Cog,
                title: "Inputs & Equipment",
                desc: "Bulk procurement of seeds, fertilizers, tractors, and irrigation. Better prices through aggregation.",
                color: "from-[#5DB347] to-[#449933]",
              },
              {
                icon: Factory,
                title: "Processing Hubs",
                desc: "Milling, drying, cold chain, and packaging. Value-addition at source multiplies farmer income.",
                color: "from-[#4A9E35] to-[#3d8a2e]",
              },
              {
                icon: ShieldCheck,
                title: "Guaranteed Offtake",
                desc: "Pre-arranged buyers and distribution channels. No more selling cheap or wasting crops.",
                color: "from-[#2D4A7A] to-[#1B2A4A]",
              },
              {
                icon: CircleDollarSign,
                title: "Trade Finance",
                desc: "SBLCs, Letters of Credit, export pre-financing, and FX via our banking partners. Our highest-margin product — projected $8M Year 3, $80M Year 5.",
                color: "from-[#6ABF4B] to-[#5DB347]",
              },
              {
                icon: GraduationCap,
                title: "Training & Certification",
                desc: "Vocational partnerships to build scalable farmer capacity, compliance, and export readiness.",
                color: "from-[#8CB89C] to-[#729E82]",
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{pillar.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Flywheel note */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-[#EBF7E5] rounded-full px-6 py-3">
              <Leaf className="w-5 h-5" style={{ color: "#5DB347" }} />
              <span className="text-sm font-semibold text-[#1B2A4A]">
                Cash recycles through the loop — each rotation costs less and yields more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRACTION ─── */}
      <section className="py-20" style={{ background: "#EDF4EF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              Traction & Progress
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Built, Not Projected
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              AFU is pre-revenue but far from pre-build. The entire platform, operational framework, and
              country infrastructure have been constructed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                value: "10",
                label: "Countries",
                desc: "Operational frameworks established across Zimbabwe, Botswana, Tanzania, Kenya, Zambia, Malawi, Mozambique, Ghana, DRC, and Rwanda",
                icon: Globe2,
              },
              {
                value: "37+",
                label: "Database Tables",
                desc: "Full relational database covering members, farms, crops, loans, payments, offtake, KYC, and more",
                icon: BarChart3,
              },
              {
                value: "Full",
                label: "Platform Built",
                desc: "Farmer portal, trade finance page, supplier marketplace, admin dashboard, AI tools, insurance, crop scanner, weather, and training modules",
                icon: Building2,
              },
              {
                value: "$500M",
                label: "Target Raise",
                desc: "Seed round to fund first-wave deployments across Phase 1 countries and begin live farming operations",
                icon: Target,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-[#5DB347]"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#5DB347]/30"
                    style={{ background: "linear-gradient(135deg, #5DB347, #3d8a2e)" }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-extrabold text-[#1B2A4A] mb-1">{item.value}</div>
                  <div className="font-bold text-[#5DB347] text-sm mb-2">{item.label}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CORPORATE STRUCTURE (hidden — not ready for public) ─── */}
      {false && <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              Foundation Model
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Corporate Structure
              </span>
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              AFU is structured as a Netherlands foundation — the most secure, private, and
              tax-efficient structure for a pan-African agricultural platform. Farmers receive
              profit-sharing, investors receive revenue participation notes, and 10% of profits
              are permanently committed to community programs.
            </p>
          </div>

          {/* Org Chart */}
          <div className="max-w-4xl mx-auto">
            {/* Foundation Root */}
            <div className="bg-gradient-to-r from-[#0F1A30] to-[#1B2A4A] rounded-2xl p-6 text-white shadow-xl mb-0">
              <div className="flex items-center gap-3">
                <Building2 className="w-7 h-7 text-gold" />
                <div>
                  <h3 className="text-lg font-bold">AFU Foundation (Netherlands)</h3>
                  <p className="text-gray-400 text-xs">Stichting — Ring-fenced, tax-efficient, DFI-ready</p>
                </div>
              </div>
            </div>

            {/* Connector line */}
            <div className="ml-10 border-l-2 border-[#1B2A4A]/30">

              {/* AFU Operations BV */}
              <div className="pl-8 py-4">
                <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2D4A7A] rounded-xl p-5 text-white shadow-lg">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Cog className="w-4 h-4 text-gold" />
                    AFU Operations BV
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { name: "AFU Tech", desc: "Platform, AI, Data" },
                      { name: "AFU Finance", desc: "White-Label Banking" },
                      { name: "AFU Insurance", desc: "Lloyd's Coverholder" },
                      { name: "AFU Agri", desc: "Watson & Fine, Projects" },
                      { name: "AFU Chain", desc: "EDMA Blockchain Layer" },
                    ].map((sub) => (
                      <div key={sub.name} className="bg-[#5DB347]/20 border border-[#5DB347]/30 rounded-lg px-3 py-2.5">
                        <p className="font-semibold text-sm text-white">{sub.name}</p>
                        <p className="text-[11px] text-gray-300">{sub.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Country Operations */}
              <div className="pl-8 py-4">
                <div className="bg-[#5DB347] rounded-xl p-5 text-white shadow-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Globe2 className="w-4 h-4" />
                    Country Operations
                  </h4>
                  <p className="text-white/80 text-xs mb-3">51% profit-sharing to farmers</p>
                  <div className="flex flex-wrap gap-2">
                    {["Zimbabwe", "Uganda", "Ghana", "Kenya", "Tanzania", "Zambia", "Malawi", "Mozambique", "DRC"].map((c) => (
                      <span key={c} className="bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Revenue Participation Notes */}
              <div className="pl-8 py-4">
                <div className="bg-gradient-to-r from-[#D4A843] to-[#E8C547] rounded-xl p-5 text-[#1B2A4A] shadow-lg">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4" />
                    Revenue Participation Notes
                  </h4>
                  <p className="text-[#1B2A4A]/70 text-xs mt-1">Structured returns for investors — aligned with platform revenue</p>
                </div>
              </div>

              {/* Charitable Trust */}
              <div className="pl-8 py-4">
                <div className="bg-gradient-to-br from-[#EBF7E5] to-[#d4edcc] rounded-xl p-5 border border-[#5DB347]/20 shadow-lg">
                  <h4 className="font-bold text-sm text-[#1B2A4A] mb-3 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-[#5DB347]" />
                    AFU Charitable Trust
                  </h4>
                  <p className="text-[#5DB347] text-xs font-semibold mb-3">10% of all profits — permanently committed</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: "Women in Agriculture", Icon: HeartHandshake },
                      { name: "Feed a Child", Icon: UtensilsCrossed },
                      { name: "Young Farmers", Icon: Sprout },
                    ].map((prog) => (
                      <div key={prog.name} className="bg-white rounded-lg px-3 py-2.5 text-center border border-[#5DB347]/10">
                        <div className="w-8 h-8 rounded-lg bg-[#5DB347]/10 flex items-center justify-center mx-auto">
                          <prog.Icon className="w-4 h-4 text-[#5DB347]" />
                        </div>
                        <p className="text-xs font-semibold text-[#1B2A4A] mt-1">{prog.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>}

      {/* ─── INVESTMENT TIERS ─── */}
      <section
        className="py-20 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a5f 100%)" }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#6ABF4B" }}>
              Investment Structure
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
              Investment{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">
                Tiers
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Structured to accommodate different investor profiles with aligned incentives and clear return targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: "Tier 1 — Seed Investor",
                min: "$1M",
                returns: "8% target annual return",
                features: [
                  "Quarterly distributions",
                  "Investor portal access",
                  "Quarterly reporting",
                ],
                borderColor: "border-[#5DB347]/40",
                bgColor: "bg-[#5DB347]/5",
                badge: "bg-[#5DB347]/20 text-[#5DB347]",
                accentColor: "#5DB347",
              },
              {
                tier: "Tier 2 — Growth Partner",
                min: "$10M",
                returns: "10% target annual return",
                features: [
                  "Quarterly distributions",
                  "Investor portal access",
                  "Board observer rights",
                  "Dedicated relationship manager",
                  "Off-take participation options",
                ],
                borderColor: "border-gold/40 ring-2 ring-gold/20",
                bgColor: "bg-gold/5",
                badge: "bg-gold/20 text-gold",
                featured: true,
                accentColor: "#D4A843",
              },
              {
                tier: "Tier 3 — Strategic Partner",
                min: "$100M",
                returns: "13% target annual return",
                features: [
                  "Quarterly distributions",
                  "Investor portal access",
                  "Board seat",
                  "Equity participation option",
                  "Dedicated relationship manager",
                  "Off-take participation options",
                  "Marketing rights across AFU member network",
                  "Co-investment rights on projects",
                ],
                borderColor: "border-[#1B2A4A]/60 ring-2 ring-[#1B2A4A]/30",
                bgColor: "bg-[#1B2A4A]/10",
                badge: "bg-[#1B2A4A]/30 text-gray-200",
                accentColor: "#1B2A4A",
              },
            ].map((item) => (
              <div
                key={item.tier}
                className={`border rounded-3xl p-8 ${item.borderColor} ${item.bgColor} hover:scale-[1.02] transition-all duration-300 relative`}
              >
                {item.featured && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-navy-dark text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-gold/30"
                    style={{ background: "linear-gradient(135deg, #D4A843, #E8C547)" }}
                  >
                    Most Popular
                  </div>
                )}
                <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${item.badge}`}>
                  {item.tier}
                </span>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{item.min}</div>
                <div className="text-lg font-semibold mb-1" style={{ color: item.accentColor }}>
                  {item.returns}
                </div>
                <p className="text-gray-400 text-sm mb-6">Minimum investment</p>
                <ul className="space-y-3 mb-8">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#5DB347" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/10 border border-white/20 text-white hover:bg-white/20"
                >
                  Request Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LEADERSHIP ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
                Leadership
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                  Experienced Team
                </span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                AFU is governed by a Board of Directors and supported by an Advisory Council with deep
                expertise across agriculture, finance, technology, and African market development.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Board with agriculture finance and African market expertise",
                  "Advisory Council spanning agribusiness, technology, and development finance",
                  "Country Directors in each operational market",
                  "Technical team building AI, blockchain, and satellite monitoring tools",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#5DB347" }} />
                    <span className="text-[#1B2A4A] text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all"
                style={{ color: "#5DB347" }}
              >
                View full leadership team
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[#EDF4EF] to-white rounded-3xl p-10 border border-gray-100">
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-6">Governance Structure</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Board of Directors",
                    desc: "Strategic oversight, fiduciary responsibility, and investor alignment",
                    icon: Users,
                  },
                  {
                    title: "Advisory Council",
                    desc: "Domain experts providing guidance on agriculture, finance, and technology",
                    icon: Landmark,
                  },
                  {
                    title: "Country Operations",
                    desc: "Local directors managing on-ground execution in each market",
                    icon: Globe2,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                        style={{ background: "linear-gradient(135deg, #5DB347, #449933)" }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1B2A4A] text-sm">{item.title}</h4>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE PRODUCT DEMOS ─── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #5DB347 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#5DB347" }}>
              See It In Action
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Live Product Demos
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Explore the actual platform farmers and commercial operators use &mdash; no login required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Farmer Portal Demo Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-br from-[#5DB347] to-[#449933] p-8 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <Sprout className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Farmer Portal Demo</h3>
                  <p className="text-white/80 text-sm mt-2">
                    See what 1,000,000+ smallholder farmers will experience
                  </p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {["Dashboard & farm overview", "AI Crop Doctor diagnosis", "Loan tracking & repayments", "Training & market prices"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#5DB347" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/demo/farm"
                  className="group/btn w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg shadow-[#5DB347]/20 hover:shadow-xl hover:shadow-[#5DB347]/30"
                  style={{ background: "linear-gradient(135deg, #5DB347, #449933)" }}
                >
                  Launch Demo
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Commercial Dashboard Demo Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-[#5DB347]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0F1A30] p-8 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <Monitor className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Commercial Dashboard Demo</h3>
                  <p className="text-white/80 text-sm mt-2">
                    Enterprise-grade farm management tools
                  </p>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {["Multi-plot management", "Offtake contracts & financing", "Equipment booking & co-ops", "Export readiness tracking"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#5DB347" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/demo/commercial"
                  className="group/btn w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg shadow-[#1B2A4A]/20 hover:shadow-xl hover:shadow-[#1B2A4A]/30"
                  style={{ background: "linear-gradient(135deg, #1B2A4A, #2D4A7A)" }}
                >
                  Launch Demo
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section
        className="py-24 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, #1e3a3a 100%)" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-15 blur-3xl"
          style={{ background: "#5DB347" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-5 py-2 rounded-full text-sm font-bold mb-8">
            <Landmark className="w-4 h-4" />
            $500M Seed Round — Now Open
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Build the Future of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">
              African Agriculture
            </span>
            ?
          </h2>
          <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
            Request our investor pack for the full financial model, trade finance revenue projections, country deployment plans,
            risk framework, and team profiles. Or schedule a call to discuss the opportunity directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/contact?subject=investor"
              className="group bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-navy-dark px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-105"
            >
              Request Investor Pack
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule a Call
            </Link>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400 text-sm">
            <a href="mailto:peterw@africanfarmingunion.org" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              peterw@africanfarmingunion.org
            </a>
            <span className="hidden sm:block text-white/20">|</span>
            <a href="tel:+27000000000" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              Contact via form
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
