import Link from "next/link";

export const metadata = {
  title: "Our Countries - AFU",
  description:
    "AFU operates across 10 African countries: Botswana, Kenya, Mozambique, Nigeria, Sierra Leone, South Africa, Tanzania, Uganda, Zambia, and Zimbabwe.",
  openGraph: {
    title: "Our Countries - AFU",
    description:
      "Ten strategic markets across Africa, each serving a distinct purpose in the AFU agricultural development platform.",
    url: "https://afu-portal.vercel.app/countries",
    images: [
      {
        url: "https://afu-portal.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "AFU Countries - 10 African Nations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Countries - AFU",
    description:
      "Ten strategic markets across Africa, each serving a distinct purpose in the AFU agricultural development platform.",
  },
};

const countries = [
  {
    flag: "🇧🇼",
    country: "Botswana",
    role: "Institutional Base",
    desc: "Full bank licensing pathway + compliance foundation. Creates permanence and access to larger capital pools.",
    highlights: ["Bank licensing pathway", "Compliance foundation", "Access to larger capital pools", "Institutional credibility"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇰🇪",
    country: "Kenya",
    role: "East African Gateway",
    desc: "East Africa's agricultural powerhouse. Tea, coffee, horticulture exports, and mobile money leadership with M-Pesa.",
    highlights: ["M-Pesa integration", "Horticulture exports to EU", "Strong agri-tech ecosystem", "EAC trade access"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇲🇿",
    country: "Mozambique",
    role: "Southern Corridor",
    desc: "Strategic port access for Southern African trade. Cashew, maize, and cassava production with export potential.",
    highlights: ["Port of Maputo access", "Cashew nut exports", "Cross-border grain trade", "SADC corridor"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇳🇬",
    country: "Nigeria",
    role: "West African Scale",
    desc: "Africa's largest economy and most populous nation. Massive domestic market for inputs, equipment, and processing.",
    highlights: ["200M+ population market", "Cassava & cocoa production", "Fintech ecosystem", "Largest food import market"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇸🇱",
    country: "Sierra Leone",
    role: "West African Frontier",
    desc: "Emerging agricultural sector with untapped potential. Rice, cocoa, and oil palm production ready for modernisation.",
    highlights: ["Rice self-sufficiency drive", "Cocoa & palm oil exports", "Development capital inflows", "Smallholder focus"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇿🇦",
    country: "South Africa",
    role: "Financial Hub",
    desc: "Africa's most advanced financial infrastructure. Agricultural development finance, insurance, and institutional capital.",
    highlights: ["Advanced banking system", "Agricultural insurance market", "Institutional capital access", "Commercial farming scale"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇹🇿",
    country: "Tanzania",
    role: "Scale Lane (Cassava + Sesame)",
    desc: "Cassava for food security + processing potential. Sesame as an export commodity with fast turnover.",
    highlights: ["Cassava processing", "Sesame exports", "Food security impact", "Fast capital turnover"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇺🇬",
    country: "Uganda",
    role: "East African Breadbasket",
    desc: "Major coffee exporter and food producer. Strong mobile money ecosystem with MTN and Airtel driving financial inclusion.",
    highlights: ["Coffee & tea exports", "MTN Mobile Money", "Maize & banana production", "EAC trade hub"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇿🇲",
    country: "Zambia",
    role: "Processing Hub",
    desc: "Grain milling, soya processing, and value-addition centre for the Southern African region. Stable policy environment.",
    highlights: ["Maize milling capacity", "Soya & sunflower processing", "Stable regulatory environment", "Regional export hub"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
  {
    flag: "🇿🇼",
    country: "Zimbabwe",
    role: "Export Lane (Blueberries)",
    desc: "High-value export crop with structured buyer demand. Ideal for escrow-based repayment + invoice finance.",
    highlights: ["Blueberry export focus", "Structured buyer demand", "Escrow-based repayment", "Invoice finance ready"],
    color: "bg-[#EBF7E5] border-[#5DB347]/20",
  },
];

export default function CountriesPage() {
  return (
    <>
      <section className="gradient-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow">Our Countries</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Ten strategic markets across Africa, each serving a distinct purpose in the AFU flywheel.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {countries.map((c) => (
              <span key={c.country} className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                {c.flag} {c.country}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.map((c, i) => (
              <div key={i} className={`card-polished rounded-2xl p-8 border-2 ${c.color} hover:shadow-lg transition-shadow`}>
                <div className="text-5xl mb-4">{c.flag}</div>
                <h2 className="text-2xl font-bold text-navy mb-1">{c.country}</h2>
                <div className="font-semibold text-sm mb-4" style={{ color: '#5DB347' }}>{c.role}</div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{c.desc}</p>
                <ul className="space-y-2">
                  {c.highlights.map((h, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-[#5DB347] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-[#EBF7E5] rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-navy mb-4">Join the Pan-African Agricultural Revolution</h3>
            <p className="text-gray-600 mb-6">10 countries. One integrated platform. Apply for membership or become a supplier today.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/apply" className="inline-block bg-[#5DB347] hover:bg-[#449933] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Apply for Membership
              </Link>
              <Link href="/contact" className="inline-block bg-navy hover:bg-navy/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
