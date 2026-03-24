import Link from "next/link";
import { DollarSign, Sprout, Factory, Handshake, Globe, GraduationCap } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export const metadata = {
  title: "Services - AFU",
  description: "Explore AFU's integrated services: Financing, Inputs, Processing, Offtake, Trade Finance, and Training.",
};

const services: { title: string; desc: string; features: string[]; link: string; icon: LucideIcon }[] = [
  {
    title: "Financing",
    desc: "Pre-export working capital (90-180 days, 12-18% APR) and export invoice finance (30-60 days, 8-10% APR). Repayment controlled through offtake + escrow.",
    features: ["Seasonal working capital", "Invoice finance", "Equipment finance", "Escrow-controlled repayment"],
    link: "/services/financing",
    icon: DollarSign,
  },
  {
    title: "Inputs & Equipment",
    desc: "Bulk-procured input bundles including seeds, fertilizers, pesticides, plus equipment financing for tractors, drones, irrigation systems, and farm software.",
    features: ["Seed & fertilizer bundles", "Tractor leasing", "Drone services", "Irrigation systems"],
    link: "/services/inputs",
    icon: Sprout,
  },
  {
    title: "Processing Hubs",
    desc: "Anchor processing facilities providing milling, canning, drying, packaging, and cold chain capabilities to add value at source.",
    features: ["Milling & canning", "Drying & packaging", "Cold chain storage", "Quality control"],
    link: "/services/processing",
    icon: Factory,
  },
  {
    title: "Guaranteed Offtake",
    desc: "Aggregation and partner distribution networks ensuring farmers have guaranteed buyers before they plant.",
    features: ["Pre-arranged buyers", "Aggregation centers", "Export packaging", "Market linkage"],
    link: "/services/offtake",
    icon: Handshake,
  },
  {
    title: "Trade Finance",
    desc: "Letters of credit, invoice finance, and commodities partner distribution to bridge the shipment-to-payment gap.",
    features: ["Letters of credit", "Receivables finance", "Commodity trading", "FX management"],
    link: "/services/trade-finance",
    icon: Globe,
  },
  {
    title: "Training & Certification",
    desc: "Online programs and vocational college partnerships to raise yields, build compliance, and develop export readiness.",
    features: ["Online courses", "Vocational partnerships", "Certification programs", "Compliance training"],
    link: "/services/training",
    icon: GraduationCap,
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="gradient-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6ABF4B, #5DB347, #449933)' }}>
              Our Services
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Six integrated pillars that form the AFU flywheel. Each one strengthens the others.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc, i) => (
              <Link
                key={i}
                href={svc.link}
                className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                {/* Floating icon */}
                <div className="absolute top-6 right-6 w-14 h-14 bg-gradient-to-br from-[#5DB347] to-[#449933] rounded-2xl flex items-center justify-center shadow-md shadow-[#5DB347]/20 group-hover:scale-110 transition-transform duration-300">
                  <svc.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex items-center gap-3 mb-4 pr-16">
                  <div className="w-10 h-10 bg-[#EBF7E5] rounded-xl flex items-center justify-center text-[#5DB347] font-bold text-sm">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors duration-300">{svc.title}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{svc.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {svc.features.map((f, j) => (
                    <span key={j} className="bg-[#EBF7E5] text-[#449933] text-xs font-medium px-3 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[#5DB347] text-sm font-semibold group-hover:gap-2 transition-all duration-300">
                  Learn More <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
