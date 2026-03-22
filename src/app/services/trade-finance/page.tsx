import Link from "next/link";
import {
  FileText,
  Shield,
  Globe,
  Ship,
  Landmark,
  ArrowLeftRight,
  ArrowRight,
  Users,
  Handshake,
  BadgeDollarSign,
} from "lucide-react";

export const metadata = {
  title: "Trade Finance & Export Support - AFU Services",
  description:
    "Letters of credit, export guarantees, forex management, and pre-export financing. AFU facilitates cross-border agricultural trade across COMESA, SADC, and AfCFTA corridors.",
};

const steps = [
  {
    number: "01",
    title: "Secure an Offtake Contract",
    description:
      "Start with a confirmed buyer order — domestic or international. AFU&apos;s offtake network provides the foundation, or bring your own buyer and we structure the finance around the deal.",
  },
  {
    number: "02",
    title: "Structure the Financing",
    description:
      "Our trade finance team structures the optimal instrument — letter of credit, pre-export facility, or invoice discounting — based on the buyer profile, destination, and commodity.",
  },
  {
    number: "03",
    title: "Ship with Confidence",
    description:
      "AFU handles customs documentation, phytosanitary certificates, and logistics coordination. Our freight partners move your cargo by road, rail, sea, or air across 15 export corridors.",
  },
  {
    number: "04",
    title: "Get Paid Fast",
    description:
      "Payment flows through AFU&apos;s escrow system. Pre-export advances are settled, and net proceeds are disbursed to your account within 48 hours of buyer confirmation.",
  },
];

const features = [
  {
    icon: FileText,
    title: "Letters of Credit",
    description:
      "Bank-backed letters of credit issued through our partner financial institutions. Protect both buyer and seller with irrevocable payment guarantees recognised by banks worldwide.",
  },
  {
    icon: BadgeDollarSign,
    title: "Pre-Export Financing",
    description:
      "Access working capital against confirmed export orders. Fund harvesting, processing, packing, and transport costs before the buyer pays — bridging the cash flow gap that kills deals.",
  },
  {
    icon: Shield,
    title: "Export Guarantees",
    description:
      "Credit insurance and export guarantees that protect against buyer default, political risk, and currency inconvertibility. Trade with confidence into emerging and frontier markets.",
  },
  {
    icon: ArrowLeftRight,
    title: "Forex Management",
    description:
      "Hedge currency risk with forward contracts and natural hedging strategies. Our treasury desk manages USD, EUR, GBP, and local currency exposures across all 9 operating countries.",
  },
  {
    icon: Ship,
    title: "Logistics & Customs",
    description:
      "End-to-end freight management from farm gate to destination port. Customs brokerage, fumigation certificates, bills of lading, and real-time shipment tracking — all in one platform.",
  },
  {
    icon: Globe,
    title: "Trade Corridor Access",
    description:
      "Leverage preferential tariff rates under COMESA, SADC, EAC, and AfCFTA trade agreements. Our compliance team ensures every shipment meets origin rules for duty-free or reduced-tariff entry.",
  },
];

const stats = [
  { value: "$200M+", label: "Trade Facilitated", sub: "in cumulative value" },
  { value: "15", label: "Export Destinations", sub: "across 3 continents" },
  { value: "98%", label: "Delivery Success", sub: "on-time, in-full rate" },
  { value: "48hrs", label: "Payment Speed", sub: "after delivery confirmation" },
];

export default function TradeFinanceServicePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(27,42,74,0.92) 0%, rgba(27,42,74,0.7) 50%, rgba(93,179,71,0.45) 100%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-[#5DB347]/30">
            Service
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
              }}
            >
              Trade Finance
            </span>
            <br />& Export Support
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Letters of credit, pre-export financing, forex management, and
            end-to-end logistics. AFU unlocks cross-border agricultural trade
            across COMESA, SADC, and AfCFTA corridors — so African produce
            reaches global markets.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Apply for Trade Finance <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Speak to Our Trade Desk
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              How It{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Works
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From confirmed order to buyer payment — we structure the finance,
              manage the logistics, and ensure you get paid on time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
                  <div
                    className="text-5xl font-black mb-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #6ABF4B, #5DB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-16 bg-[#EBF7E5]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2A4A] mb-4">
              Trade Finance{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Solutions
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A full suite of instruments and services to de-risk cross-border
              agricultural trade and accelerate payment cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-[#EBF7E5]">
                    <Icon className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-[#1B2A4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trade{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Performance
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
              >
                <div
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #6ABF4B, #5DB347)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-white font-semibold mb-1">{s.label}</div>
                <div className="text-gray-400 text-sm">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 md:p-14 text-center text-white shadow-xl shadow-[#5DB347]/20"
            style={{
              background: "linear-gradient(135deg, #5DB347, #449933)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Take Your Produce Global
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Access $200M+ in trade finance facilities, 15 export corridors,
              and end-to-end logistics support. Let AFU handle the complexity of
              cross-border trade so you can focus on growing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-white text-[#449933] px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Landmark className="w-5 h-5" /> Apply for Trade Finance
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Handshake className="w-5 h-5" /> Partner with Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
