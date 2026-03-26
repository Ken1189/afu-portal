import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Projects & Investment Opportunities - AFU",
  description:
    "Explore AFU's current farming projects and investment opportunities across Africa. From blueberry exports to solar irrigation — real deal flow for serious investors.",
};

const currentProjects = [
  {
    name: "Zimbabwe Blueberry Commercial Operation",
    country: "Zimbabwe",
    status: "Active",
    description:
      "25-hectare commercial blueberry farm targeting EU export markets. Leveraging Zimbabwe's counter-seasonal advantage to deliver premium fresh blueberries when Northern Hemisphere supply drops. Full cold chain from farm gate to Rotterdam.",
    highlights: [
      { value: "25ha", label: "Under Cultivation" },
      { value: "$5-8M", label: "Revenue Target (Year 3)" },
      { value: "200+", label: "Jobs Created" },
    ],
    partners: ["EU Fresh Produce Importers", "Zimtrade", "Cold Chain Africa"],
  },
  {
    name: "Zimbabwe Maize Program",
    country: "Zimbabwe",
    status: "Active",
    description:
      "Staple crop program focused on food security and domestic supply. Partnering with smallholder farmers to build a reliable maize value chain — from certified seed distribution through aggregation to milling and market delivery.",
    highlights: [
      { value: "5,000", label: "Smallholder Target" },
      { value: "Staple", label: "Crop Category" },
      { value: "Food Security", label: "Mission Focus" },
    ],
    partners: ["Seed Co International", "National Foods", "Zimbabwe GMB"],
  },
  {
    name: "Castor Oil Initiative",
    country: "Multi-country",
    status: "Active",
    description:
      "Industrial castor oil production with an ENI-approved off-take agreement for biofuel feedstock. Multi-country cultivation model across East and Southern Africa with guaranteed buyer and fixed pricing.",
    highlights: [
      { value: "ENI", label: "Off-take Partner" },
      { value: "Biofuel", label: "End Market" },
      { value: "Multi-country", label: "Scale" },
    ],
    partners: ["ENI", "Castor Oil Processors Association"],
  },
];

const investmentOpportunities = [
  {
    name: "Macadamia Orchard Development",
    country: "Zimbabwe, Mozambique",
    investment: "$2M",
    description:
      "50-hectare macadamia orchard development across two countries. Macadamia is the highest-value tree nut globally with structural undersupply. 7-year maturity to full production with escalating returns from Year 4.",
    returnTimeline: "7-year maturity, returns from Year 4",
    highlights: [
      { value: "50ha", label: "Orchard Size" },
      { value: "$2M", label: "Capital Required" },
      { value: "7 yrs", label: "To Full Production" },
    ],
  },
  {
    name: "Sesame Export Expansion",
    country: "Tanzania",
    investment: "$500K",
    description:
      "Contract farming model connecting 2,000 Tanzanian smallholders to international sesame commodity buyers. High-demand oilseed with established export routes to India, Japan, and the EU.",
    returnTimeline: "Revenue from Season 1, breakeven by Season 2",
    highlights: [
      { value: "2,000", label: "Farmers" },
      { value: "$500K", label: "Capital Required" },
      { value: "Season 2", label: "Breakeven" },
    ],
  },
  {
    name: "Solar Irrigation Network",
    country: "Zimbabwe",
    investment: "$1.5M",
    description:
      "Deploying 100 solar-powered irrigation pumps across smallholder farming regions in Zimbabwe. Converting rain-dependent farms to year-round production with clean energy — doubling crop cycles and eliminating fuel costs.",
    returnTimeline: "3-year payback, recurring revenue via water-as-a-service",
    highlights: [
      { value: "100", label: "Solar Pumps" },
      { value: "$1.5M", label: "Capital Required" },
      { value: "3 yrs", label: "Payback Period" },
    ],
  },
  {
    name: "Poultry Scale-Up",
    country: "Zimbabwe",
    investment: "$800K",
    description:
      "50,000-bird broiler operation serving the Harare market. Integrated feed mill, broiler houses, and distribution targeting the fast-growing urban protein demand. Off-take agreements with major supermarket chains already in place.",
    returnTimeline: "18-month payback, 30%+ operating margin",
    highlights: [
      { value: "50,000", label: "Bird Capacity" },
      { value: "$800K", label: "Capital Required" },
      { value: "18 mo", label: "Payback Period" },
    ],
  },
  {
    name: "Cassava Processing Hub",
    country: "Uganda",
    investment: "$3M",
    description:
      "Industrial starch extraction facility processing raw cassava into high-grade starch for food, textile, and pharmaceutical industries. Aggregation network of 5,000+ smallholder suppliers feeds continuous processing capacity.",
    returnTimeline: "4-year payback, scalable to regional hub",
    highlights: [
      { value: "5,000+", label: "Suppliers" },
      { value: "$3M", label: "Capital Required" },
      { value: "4 yrs", label: "Payback Period" },
    ],
  },
];

export default function ProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6ABF4B] via-[#5DB347] to-[#8CB89C] bg-clip-text text-transparent">
            Projects &amp; Deal Flow
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Active farming operations generating revenue today, and investment-ready
            opportunities seeking capital. Real projects, real returns, real impact
            across Africa.
          </p>
        </div>
      </section>

      {/* ─── Disclaimer Banner ─── */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Please note:</strong> Projects shown are in various stages of development. Partnership discussions are ongoing — references to organisations represent planned collaborations and do not imply confirmed agreements unless explicitly stated.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Current Projects ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#5DB347]">
              Actively Deployed
            </span>
            <h2 className="text-3xl font-bold text-[#1B2A4A] mt-2 mb-3">
              Current Projects
            </h2>
            <p className="text-gray-500 max-w-2xl">
              These programs are live, generating revenue, and creating jobs
              across our operating countries.
            </p>
          </div>

          <div className="space-y-8">
            {currentProjects.map((project, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 border-l-4 border-[#5DB347] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-[#1B2A4A]">
                        {project.name}
                      </h3>
                      <span className="bg-gradient-to-r from-[#5DB347] to-[#449933] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                        {project.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="bg-[#EBF7E5] text-[#449933] text-sm font-medium px-3 py-1 rounded-full">
                        {project.country}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {project.description}
                    </p>

                    <div>
                      <h4 className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wider mb-2">
                        Planned Partners
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.partners.map((p, j) => (
                          <span
                            key={j}
                            className="bg-white text-[#1B2A4A] text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
                          >
                            {p} <span className="text-amber-600 font-normal">(In Discussion)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 shrink-0">
                    <h4 className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wider mb-4">
                      Key Metrics
                    </h4>
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                      {project.highlights.map((stat, j) => (
                        <div
                          key={j}
                          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center lg:text-left shadow-md shadow-[#5DB347]/5"
                        >
                          <div className="text-2xl font-bold bg-gradient-to-r from-[#5DB347] to-[#449933] bg-clip-text text-transparent">
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Investment Opportunities ─── */}
      <section className="py-20 bg-[#f8fdf6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#5DB347]">
              Seeking Capital
            </span>
            <h2 className="text-3xl font-bold text-[#1B2A4A] mt-2 mb-3">
              Investment Opportunities
            </h2>
            <p className="text-gray-500 max-w-2xl">
              Vetted, structured investment opportunities in African agriculture.
              Each project has defined capital requirements, clear return timelines,
              and identified off-take or market routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {investmentOpportunities.map((opp, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1B2A4A] mb-1">
                      {opp.name}
                    </h3>
                    <span className="text-sm text-gray-400">{opp.country}</span>
                  </div>
                  <span className="bg-[#1B2A4A] text-white text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {opp.investment}
                  </span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                  {opp.description}
                </p>

                <div className="bg-[#EBF7E5] rounded-xl p-3 mb-5">
                  <span className="text-xs font-semibold text-[#449933]">
                    Return Timeline:
                  </span>{" "}
                  <span className="text-xs text-[#1B2A4A]">
                    {opp.returnTimeline}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {opp.highlights.map((stat, j) => (
                    <div key={j} className="text-center">
                      <div className="text-lg font-bold bg-gradient-to-r from-[#5DB347] to-[#449933] bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/contact?subject=investor&project=${encodeURIComponent(opp.name)}`}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-6 py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-[#5DB347]/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Express Interest
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Impact Numbers ─── */}
      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10 bg-gradient-to-r from-[#6ABF4B] via-[#5DB347] to-[#8CB89C] bg-clip-text text-transparent">
            Portfolio Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$7.8M+", label: "Capital Deployed" },
              { value: "3", label: "Active Projects" },
              { value: "5", label: "Open Opportunities" },
              { value: "6", label: "Countries" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16" style={{ background: "#1B2A4A" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Invest in African Agriculture?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you are a development finance institution, impact fund,
            family office, or individual investor — we have structured
            opportunities across risk profiles and return timelines.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact?subject=investor"
              className="inline-block bg-gradient-to-r from-[#5DB347] to-[#449933] text-white hover:shadow-lg hover:shadow-[#5DB347]/25 hover:-translate-y-1 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Talk to Our Investment Team
            </Link>
            <Link
              href="/apply"
              className="inline-block border-2 border-white text-white hover:bg-white/10 hover:-translate-y-1 px-8 py-3.5 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Apply as a Farmer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
