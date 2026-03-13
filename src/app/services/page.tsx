import Link from "next/link";

export const metadata = {
  title: "Services - AFU",
  description: "Explore AFU's integrated services: Financing, Inputs, Processing, Offtake, Trade Finance, and Training.",
};

const services = [
  {
    title: "Financing",
    desc: "Pre-export working capital (90-180 days, 12-18% APR) and export invoice finance (30-60 days, 8-10% APR). Repayment controlled through offtake + escrow.",
    features: ["Seasonal working capital", "Invoice finance", "Equipment finance", "Escrow-controlled repayment"],
    link: "/services/financing",
  },
  {
    title: "Inputs & Equipment",
    desc: "Bulk-procured input bundles including seeds, fertilizers, pesticides, plus equipment financing for tractors, drones, irrigation systems, and farm software.",
    features: ["Seed & fertilizer bundles", "Tractor leasing", "Drone services", "Irrigation systems"],
    link: "/services/inputs",
  },
  {
    title: "Processing Hubs",
    desc: "Anchor processing facilities providing milling, canning, drying, packaging, and cold chain capabilities to add value at source.",
    features: ["Milling & canning", "Drying & packaging", "Cold chain storage", "Quality control"],
    link: "/services/processing",
  },
  {
    title: "Guaranteed Offtake",
    desc: "Aggregation and partner distribution networks ensuring farmers have guaranteed buyers before they plant.",
    features: ["Pre-arranged buyers", "Aggregation centers", "Export packaging", "Market linkage"],
    link: "/services/offtake",
  },
  {
    title: "Trade Finance",
    desc: "Letters of credit, invoice finance, and commodities partner distribution to bridge the shipment-to-payment gap.",
    features: ["Letters of credit", "Receivables finance", "Commodity trading", "FX management"],
    link: "/services/trade-finance",
  },
  {
    title: "Training & Certification",
    desc: "Online programs and vocational college partnerships to raise yields, build compliance, and develop export readiness.",
    features: ["Online courses", "Vocational partnerships", "Certification programs", "Compliance training"],
    link: "/services/training",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Six integrated pillars that form the AFU flywheel. Each one strengthens the others.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc, i) => (
              <Link key={i} href={svc.link} className="bg-cream rounded-2xl p-8 hover:shadow-lg transition-all group border border-transparent hover:border-teal/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-navy group-hover:text-teal transition-colors">{svc.title}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{svc.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {svc.features.map((f, j) => (
                    <span key={j} className="bg-white text-navy text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
