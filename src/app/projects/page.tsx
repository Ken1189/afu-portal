import Link from "next/link";

export const metadata = {
  title: "Our Projects - AFU",
  description:
    "Explore AFU's active projects across Africa, from smart irrigation and value chain development to youth farming accelerators and carbon credit certification.",
};

const projects = [
  {
    name: "Smart Irrigation Pilot",
    country: "Botswana",
    category: "Water & Infrastructure",
    timeline: "2024-2026",
    budget: "$510,000",
    description:
      "Deploying low-cost, solar-powered drip irrigation systems across 200 smallholder farms in northern Botswana. The project combines IoT soil moisture sensors with mobile-based scheduling to reduce water consumption by 60% while increasing crop yields. Each installation includes farmer training, maintenance support, and integration with AFU's crop tracking platform.",
    impact: [
      { value: "200", label: "Farms Equipped" },
      { value: "60%", label: "Water Savings" },
      { value: "35%", label: "Yield Increase" },
    ],
    partners: ["IWMI", "WaterAid", "Botswana Ministry of Agriculture"],
    color: "border-blue-200 bg-blue-50",
  },
  {
    name: "Maize Value Chain Development",
    country: "Zimbabwe",
    category: "Value Chain",
    timeline: "2023-2026",
    budget: "$420,000",
    description:
      "An end-to-end programme connecting smallholder maize farmers with processing hubs and guaranteed offtakers. The project provides certified seed, seasonal financing, extension support, and post-harvest handling training. Harvested maize is aggregated, quality-tested, and processed at AFU-partnered milling facilities before distribution to domestic and regional markets.",
    impact: [
      { value: "800+", label: "Farmers Enrolled" },
      { value: "12,000t", label: "Annual Target" },
      { value: "$1.8M", label: "Farmer Revenue" },
    ],
    partners: ["Seed Co International", "National Foods", "CIMMYT"],
    color: "border-green-200 bg-green-50",
  },
  {
    name: "Youth Farming Accelerator",
    country: "Tanzania",
    category: "Capacity Building",
    timeline: "2024-2027",
    budget: "$280,000",
    description:
      "A 12-month accelerator programme for young entrepreneurs aged 18-35 who want to build farming businesses. Participants receive hands-on training at demonstration farms, mentorship from experienced commercial farmers, micro-financing of up to $2,000, and guaranteed market access through AFU's offtake network for their first two seasons.",
    impact: [
      { value: "150", label: "Youth Enrolled" },
      { value: "85%", label: "Completion Rate" },
      { value: "120", label: "Businesses Launched" },
    ],
    partners: ["AGRA", "Sokoine University", "Tanzania Youth Agency"],
    color: "border-amber-200 bg-amber-50",
  },
  {
    name: "Mobile Extension Network",
    country: "Zimbabwe, Botswana, Tanzania",
    category: "Technology",
    timeline: "2022-2025",
    budget: "$180,000",
    description:
      "A multi-channel digital extension platform delivering crop advisories, pest alerts, weather forecasts, and market prices via SMS, USSD, and a mobile app. The platform reaches farmers without smartphones through simple text messages in local languages, while app users access rich media content including video tutorials, interactive guides, and AI-powered crop diagnostics.",
    impact: [
      { value: "15,000+", label: "Farmers Reached" },
      { value: "3", label: "Countries Active" },
      { value: "90%", label: "Satisfaction Rate" },
    ],
    partners: ["Econet Wireless", "Vodacom", "University of Dar es Salaam"],
    color: "border-purple-200 bg-purple-50",
  },
  {
    name: "Carbon Credit Certification",
    country: "Zimbabwe & Botswana",
    category: "Climate & Sustainability",
    timeline: "2025-2028",
    budget: "$650,000",
    description:
      "Developing a standardised methodology for agricultural carbon credits in sub-Saharan Africa. The project builds a digital MRV (Monitoring, Reporting, Verification) platform to measure carbon sequestration from agroforestry, conservation agriculture, and improved grazing management. Verified credits will be sold on voluntary carbon markets, creating a new revenue stream for participating farmers.",
    impact: [
      { value: "50,000", label: "Hectares Targeted" },
      { value: "25,000t", label: "CO2e Offset Goal" },
      { value: "$500K+", label: "Projected Revenue" },
    ],
    partners: ["Verra", "Climate Focus", "AfDB"],
    color: "border-green-200 bg-green-50",
  },
  {
    name: "Livestock Disease Surveillance",
    country: "Tanzania",
    category: "Animal Health",
    timeline: "2024-2026",
    budget: "$320,000",
    description:
      "Establishing a real-time livestock disease surveillance network across northern Tanzania. Community-based animal health workers are equipped with mobile reporting tools to detect and report disease outbreaks within 24 hours. The system integrates with veterinary services for rapid response and includes a vaccination tracking module that ensures herd health compliance across participating farms.",
    impact: [
      { value: "2,000+", label: "Herds Monitored" },
      { value: "40%", label: "Faster Detection" },
      { value: "12", label: "Districts Covered" },
    ],
    partners: ["ILRI", "Tanzania Veterinary Laboratory Agency", "FAO"],
    color: "border-amber-200 bg-amber-50",
  },
];

const impactStats = [
  { value: "2,500+", label: "Farmers Reached" },
  { value: "$1.2M", label: "Deployed" },
  { value: "3", label: "Countries" },
  { value: "15", label: "Partners" },
];

export default function ProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Projects</h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            AFU deploys capital and expertise through targeted projects that
            address critical gaps in African agriculture. Each project is
            designed to be self-sustaining, measurable, and scalable &mdash;
            creating lasting impact from the farm gate to the market.
          </p>
        </div>
      </section>

      {/* Project Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {projects.map((project, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 border-2 ${project.color}`}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-navy">
                        {project.name}
                      </h3>
                      <span className="bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full">
                        {project.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <span>{project.country}</span>
                      <span>{project.timeline}</span>
                      <span className="font-medium text-navy">
                        {project.budget}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {project.description}
                    </p>

                    {/* Partners */}
                    <div>
                      <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                        Partners
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.partners.map((p, j) => (
                          <span
                            key={j}
                            className="bg-white text-navy text-xs font-medium px-3 py-1 rounded-full border border-gray-200"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Impact Stats */}
                  <div className="lg:w-64 shrink-0">
                    <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-4">
                      Impact
                    </h4>
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                      {project.impact.map((stat, j) => (
                        <div
                          key={j}
                          className="bg-white rounded-xl p-4 text-center lg:text-left"
                        >
                          <div className="text-xl font-bold text-teal">
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

      {/* Impact Numbers */}
      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Collective Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="py-16 bg-teal">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Get Involved</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you are a development agency, investor, technology partner,
            or farmer interested in participating, there are many ways to engage
            with our projects. Let&apos;s build sustainable agriculture together.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/apply"
              className="inline-block bg-white text-teal hover:bg-gray-100 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Apply to Participate
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-lg font-semibold text-lg transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
