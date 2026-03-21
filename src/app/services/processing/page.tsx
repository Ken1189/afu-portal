import Link from "next/link";
import {
  Factory,
  Snowflake,
  PackageCheck,
  Award,
  Zap,
  Leaf,
  ArrowRight,
  Users,
  Handshake,
  Thermometer,
  Wheat,
} from "lucide-react";

export const metadata = {
  title: "Processing & Value Addition - AFU Services",
  description:
    "Milling, drying, cold chain, and packaging facilities operated near farming clusters. Shared-use processing hubs that multiply crop value and reduce post-harvest waste.",
};

const steps = [
  {
    number: "01",
    title: "Harvest & Deliver",
    description:
      "Bring your raw produce to the nearest AFU processing hub. Our strategically located centres sit within 30 km of major farming clusters, minimising transport costs and spoilage.",
  },
  {
    number: "02",
    title: "Process & Package",
    description:
      "Trained operators handle milling, drying, grading, and packaging to international standards. You choose your processing level — from cleaned raw commodity to retail-ready product.",
  },
  {
    number: "03",
    title: "Quality Certification",
    description:
      "Every batch undergoes quality testing. Products that meet HACCP, ISO 22000, or organic standards receive certification, unlocking premium domestic and export markets.",
  },
  {
    number: "04",
    title: "Market & Earn More",
    description:
      "Processed products command 2-3x the price of raw commodities. AFU connects your value-added output directly to buyers through our offtake network.",
  },
];

const features = [
  {
    icon: Wheat,
    title: "Milling & Grinding",
    description:
      "State-of-the-art milling equipment for maize, wheat, rice, and sorghum. Produce flour, grits, and meal that meet commercial buyer specifications and retail packaging standards.",
  },
  {
    icon: Thermometer,
    title: "Solar Drying Systems",
    description:
      "Reduce moisture content to safe storage levels with our solar-hybrid dryers. Extend shelf life from weeks to months while preserving nutritional value and minimising energy costs.",
  },
  {
    icon: Snowflake,
    title: "Cold Chain Infrastructure",
    description:
      "Solar-powered cold rooms and refrigerated logistics for perishables — fruits, vegetables, dairy, and fish. Maintain the cold chain from farm gate to final buyer.",
  },
  {
    icon: PackageCheck,
    title: "Grading & Packaging",
    description:
      "Automated sorting, grading, and packaging lines. Products are labelled with traceability codes linking back to the originating farm, cooperative, and processing batch.",
  },
  {
    icon: Award,
    title: "Quality Certification",
    description:
      "On-site testing laboratories for aflatoxin, moisture, and microbiological analysis. We support HACCP, ISO 22000, GlobalG.A.P., and organic certification pathways.",
  },
  {
    icon: Leaf,
    title: "Waste-to-Value",
    description:
      "Processing by-products are converted into animal feed, compost, and biochar. Nothing goes to waste — our circular model generates additional revenue streams for cooperatives.",
  },
];

const stats = [
  { value: "12", label: "Processing Hubs", sub: "planned across 9 countries" },
  { value: "3x", label: "Value Multiplication", sub: "raw to processed" },
  { value: "60%", label: "Waste Reduction", sub: "in post-harvest losses" },
  { value: "5,000+", label: "Tonnes Processed", sub: "annual capacity per hub" },
];

export default function ProcessingServicePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1595855759920-86582396756a?w=1920&q=80')",
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #6ABF4B, #5DB347)",
              }}
            >
              Processing
            </span>
            <br />& Value Addition
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Shared-use milling, drying, cold chain, and packaging facilities
            located near farming clusters. Turn raw commodities into
            market-ready products worth 2-3x more — and eliminate post-harvest
            waste.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Book Processing Time <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Host a Hub
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
              From raw harvest to certified, packaged product — our hubs handle
              every step so you can focus on farming.
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
              Hub{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Capabilities
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each AFU processing hub is equipped with industrial-grade
              facilities designed for African crops, climates, and market
              requirements.
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
              Processing{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Impact
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
              Multiply Your Harvest Value by 3x
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Stop selling raw commodities at farmgate prices. Our shared-use
              processing hubs turn your harvest into certified, packaged products
              that command premium prices.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-white text-[#449933] px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Factory className="w-5 h-5" /> Book Processing Time
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Handshake className="w-5 h-5" /> Invest in a Hub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
