import Link from "next/link";

export const metadata = {
  title: "Our Countries - AFU",
  description:
    "AFU operates across 20 African countries including Botswana, Ghana, Kenya, Mozambique, Nigeria, South Africa, Tanzania, Uganda, Zambia, Zimbabwe, Sierra Leone, Egypt, Ethiopia, Malawi, Namibia, Guinea, Guinea-Bissau, Liberia, Mali, and Ivory Coast.",
  openGraph: {
    title: "Our Countries - AFU",
    description:
      "Twenty strategic markets across Africa, each serving a distinct purpose in the AFU agricultural development platform.",
    url: "https://afu-portal.vercel.app/countries",
    images: [
      {
        url: "https://afu-portal.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "AFU Countries - 20 African Nations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Countries - AFU",
    description:
      "Twenty strategic markets across Africa, each serving a distinct purpose in the AFU agricultural development platform.",
  },
};

const countries = [
  {
    flag: "🇧🇼",
    country: "Botswana",
    role: "Institutional Base",
    desc: "Full bank licensing pathway + compliance foundation. Creates permanence and access to larger capital pools.",
    highlights: ["Bank licensing pathway", "Compliance foundation", "Access to larger capital pools", "Institutional credibility"],
    stat: "Bank HQ",
  },
  {
    flag: "🇰🇪",
    country: "Kenya",
    role: "East African Gateway",
    desc: "East Africa's agricultural powerhouse. Tea, coffee, horticulture exports, and mobile money leadership with M-Pesa.",
    highlights: ["M-Pesa integration", "Horticulture exports to EU", "Strong agri-tech ecosystem", "EAC trade access"],
    stat: "55M+",
  },
  {
    flag: "🇲🇿",
    country: "Mozambique",
    role: "Southern Corridor",
    desc: "Strategic port access for Southern African trade. Cashew, sesame, maize, cassava, and fruit production with export potential.",
    highlights: ["Port of Maputo access", "Cashew nut & sesame exports", "Tropical fruit production", "Cross-border grain trade", "SADC corridor"],
    stat: "Port Access",
  },
  {
    flag: "🇳🇬",
    country: "Nigeria",
    role: "West African Scale",
    desc: "Africa's largest economy and most populous nation. Massive domestic market for inputs, equipment, and processing.",
    highlights: ["200M+ population market", "Cassava & cocoa production", "Fintech ecosystem", "Largest food import market"],
    stat: "200M+",
  },
  {
    flag: "🇬🇭",
    country: "Ghana",
    role: "West African Cocoa Belt",
    desc: "World's second-largest cocoa producer with strong democratic stability. Growing tech scene, structured commodity trade, and mobile money infrastructure.",
    highlights: ["World's #2 cocoa producer", "COCOBOD structured buying", "MTN Mobile Money dominance", "Stable democracy"],
    stat: "$2B+",
  },
  {
    flag: "🇿🇦",
    country: "South Africa",
    role: "Financial Hub",
    desc: "Africa's most advanced financial infrastructure. Agricultural development finance, insurance, and institutional capital.",
    highlights: ["Advanced banking system", "Agricultural insurance market", "Institutional capital access", "Commercial farming scale"],
    stat: "$400B+",
  },
  {
    flag: "🇹🇿",
    country: "Tanzania",
    role: "Scale Lane (Cassava, Sesame, Cashews & Coffee)",
    desc: "Cassava for food security + processing potential. Sesame and cashews as export commodities. Growing coffee and avocado sectors with fast turnover.",
    highlights: ["Cassava processing", "Sesame & cashew exports", "Coffee & avocado production", "Food security impact", "Fast capital turnover"],
    stat: "Scale",
  },
  {
    flag: "🇺🇬",
    country: "Uganda",
    role: "East African Breadbasket",
    desc: "Major coffee and cashew exporter and food producer. Strong mobile money ecosystem with MTN and Airtel driving financial inclusion.",
    highlights: ["Coffee, tea & cashew exports", "MTN Mobile Money", "Maize & banana production", "EAC trade hub"],
    stat: "Coffee #1",
  },
  {
    flag: "🇿🇲",
    country: "Zambia",
    role: "Processing Hub",
    desc: "Grain milling, soya processing, and value-addition centre for the Southern African region. Stable policy environment.",
    highlights: ["Maize milling capacity", "Soya & sunflower processing", "Stable regulatory environment", "Regional export hub"],
    stat: "Processing",
  },
  {
    flag: "🇿🇼",
    country: "Zimbabwe",
    role: "Export Lane (Blueberries)",
    desc: "High-value export crop with structured buyer demand. Ideal for escrow-based repayment + invoice finance.",
    highlights: ["Blueberry export focus", "Structured buyer demand", "Escrow-based repayment", "Invoice finance ready"],
    stat: "Export",
  },
  // ── East & Southern Africa Expansion (Planned) ──
  {
    flag: "🇸🇱",
    country: "Sierra Leone",
    role: "West African Agriculture Revival",
    desc: "Emerging agricultural market with strong potential in rice, cocoa, and palm oil production. AFU is building partnerships to support farmer cooperatives.",
    highlights: ["Rice & cocoa production", "Palm oil potential", "Cooperative development", "Post-conflict agricultural revival"],
    stat: "Planned",
  },
  {
    flag: "🇪🇬",
    country: "Egypt",
    role: "North African Agri Powerhouse",
    desc: "Africa's largest agricultural economy with advanced irrigation infrastructure along the Nile. Strategic gateway to Middle Eastern and European export markets.",
    highlights: ["Nile basin irrigation", "Citrus & cotton exports", "Gateway to MENA markets", "Advanced agri-infrastructure"],
    stat: "Planned",
  },
  {
    flag: "🇪🇹",
    country: "Ethiopia",
    role: "Coffee Origin & Highland Agriculture",
    desc: "Birthplace of coffee and Africa's second most populous nation. Massive smallholder farming base with growing commercial agriculture sector.",
    highlights: ["World's #5 coffee producer", "100M+ population market", "Highland grain production", "Flower export industry"],
    stat: "Planned",
  },
  {
    flag: "🇲🇼",
    country: "Malawi",
    role: "Warm Heart of Africa",
    desc: "Tobacco diversification opportunity and growing tea, sugar, and legume sectors. Strong NGO ecosystem supporting smallholder development.",
    highlights: ["Tobacco diversification", "Tea & sugar production", "Legume exports", "Smallholder focus"],
    stat: "Planned",
  },
  {
    flag: "🇳🇦",
    country: "Namibia",
    role: "Southern African Livestock & Horticulture",
    desc: "Premium beef exports and emerging horticulture sector. Stable economy with strong governance and trade links to South Africa and the EU.",
    highlights: ["Premium beef exports to EU", "Emerging grape & date farming", "SACU trade access", "Stable governance"],
    stat: "Planned",
  },
  // ── West Africa Expansion (Planned) ──
  {
    flag: "🇬🇳",
    country: "Republic of Guinea",
    role: "West African Mining-to-Agriculture Transition",
    desc: "Rich agricultural potential in rice, cassava, and tropical fruits. AFU aims to support the diversification away from mining dependency.",
    highlights: ["Rice & cassava farming", "Tropical fruit potential", "Agricultural diversification", "ECOWAS trade access"],
    stat: "Planned",
  },
  {
    flag: "🇬🇼",
    country: "Guinea-Bissau",
    role: "Cashew Capital of West Africa",
    desc: "World's fifth-largest cashew producer with agriculture as the backbone of the economy. Significant potential for value-added processing.",
    highlights: ["Top 5 global cashew producer", "Cashew processing potential", "Rice production", "ECOWAS integration"],
    stat: "Planned",
  },
  {
    flag: "🇱🇷",
    country: "Liberia",
    role: "West African Rubber & Palm Oil Hub",
    desc: "Major rubber and palm oil producer rebuilding its agricultural sector. Significant rainforest-based agriculture and cocoa potential.",
    highlights: ["Rubber & palm oil exports", "Cocoa development", "Agricultural rebuilding", "Rainforest-based farming"],
    stat: "Planned",
  },
  {
    flag: "🇲🇱",
    country: "Mali",
    role: "Sahel Cotton & Grain Belt",
    desc: "One of Africa's largest cotton producers and a major rice-growing nation along the Niger River. Key market for Sahel food security.",
    highlights: ["Top African cotton producer", "Niger River rice farming", "Mango & shea exports", "Sahel food security"],
    stat: "Planned",
  },
  {
    flag: "🇨🇮",
    country: "Ivory Coast",
    role: "Global Cocoa & Cashew Leader",
    desc: "World's largest cocoa producer and a leading cashew exporter. West Africa's economic powerhouse with the strongest agricultural GDP in the region.",
    highlights: ["World's #1 cocoa producer", "Top 3 global cashew exporter", "Rubber & palm oil", "Strongest West African economy"],
    stat: "Planned",
  },
];

export default function CountriesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative text-white py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, rgba(93,179,71,0.15) 100%)' }}>
        {/* Subtle green glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl" style={{ background: '#5DB347' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6" style={{ color: '#6ABF4B' }}>
            🌍 Pan-African Reach
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Our <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Countries</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Twenty strategic markets across Africa, each serving a distinct purpose in the AFU flywheel.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            {countries.map((c) => (
              <span key={c.country} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-full text-sm hover:bg-white/15 transition-all duration-300">
                <span className="text-lg">{c.flag}</span> {c.country}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COUNTRY GRID ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#5DB347' }}>
              Where We Operate
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">Strategic Markets Across Africa</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.map((c, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-6xl drop-shadow-md">{c.flag}</span>
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#EBF7E5]" style={{ color: '#5DB347' }}>
                    {c.stat}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#1B2A4A] mb-1">{c.country}</h2>
                <div className="font-semibold text-sm mb-4" style={{ color: '#5DB347' }}>{c.role}</div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{c.desc}</p>
                <ul className="space-y-2">
                  {c.highlights.map((h, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 shrink-0" style={{ color: '#5DB347' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={`/countries/${c.country.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-300"
                    style={{ color: '#5DB347' }}
                  >
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ─── CTA BANNER ─── */}
          <div className="mt-16 relative overflow-hidden rounded-3xl p-10 text-center shadow-xl shadow-[#5DB347]/10" style={{ background: 'linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, rgba(93,179,71,0.2) 100%)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full opacity-15 blur-3xl" style={{ background: '#5DB347' }} />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Join the Pan-African <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">Agricultural Revolution</span>
              </h3>
              <p className="text-white/70 mb-8 max-w-lg mx-auto">20 countries. One integrated platform. Apply for membership or become a supplier today.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/apply"
                  className="inline-block text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-xl shadow-[#5DB347]/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5DB347]/40"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  Apply for Membership →
                </Link>
                <Link href="/contact" className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
