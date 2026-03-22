import Link from "next/link";

export const metadata = {
  title: "Education & Knowledge - AFU",
  description:
    "Empowering African farmers through research, knowledge, and education. Explore AFU's research centres, active projects, and comprehensive agricultural knowledgebase.",
};

const sections = [
  {
    title: "Research Centres",
    desc: "A growing network of agricultural research centres across Africa, driving innovation in crop science, soil health, livestock genetics, and climate-smart farming.",
    features: [
      "12 active research centres",
      "Cross-border collaboration",
      "University partnerships",
      "Open-access publications",
    ],
    link: "/education/research",
  },
  {
    title: "Projects",
    desc: "Active research and development projects tackling Africa's most pressing agricultural challenges, from drought-resistant crop varieties to precision farming technology.",
    features: [
      "8 active projects",
      "Multi-country scope",
      "Industry partnerships",
      "Measurable impact goals",
    ],
    link: "/education/projects",
  },
  {
    title: "Knowledgebase",
    desc: "A comprehensive agricultural knowledge library covering agronomy, animal husbandry, finance, technology, and climate adaptation for farmers at every level.",
    features: [
      "1,000+ articles",
      "Expert-reviewed content",
      "Practical guides",
      "Multilingual support",
    ],
    link: "/education/knowledgebase",
  },
];

const stats = [
  { value: "50+", label: "Research Papers" },
  { value: "12", label: "Research Centres" },
  { value: "1,000+", label: "Knowledge Articles" },
  { value: "8", label: "Active Projects" },
];

export default function EducationPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Education Hub
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Education &amp; Knowledge
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Empowering African farmers through world-class research, practical
            knowledge, and continuous learning. Our education ecosystem bridges
            the gap between agricultural science and on-farm practice.
          </p>
        </div>
      </section>

      {/* Section Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sections.map((section, i) => (
              <Link
                key={i}
                href={section.link}
                className="card-polished bg-cream rounded-2xl p-8 hover:shadow-lg transition-all group border border-transparent hover:border-[#5DB347]/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#5DB347] rounded-xl flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-navy group-hover:text-[#5DB347] transition-colors">
                    {section.title}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  {section.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {section.features.map((f, j) => (
                    <span
                      key={j}
                      className="bg-white text-navy text-xs font-medium px-3 py-1 rounded-full border border-gray-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#5DB347] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#5DB347]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Explore Our Knowledge Base
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Access over 1,000 expert-reviewed articles covering every aspect of
            African agriculture. From crop science to market analysis, find the
            knowledge you need to grow.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/education/knowledgebase"
              className="inline-block bg-white text-[#5DB347] hover:bg-gray-100 px-8 py-3.5 rounded-lg font-semibold text-lg transition-smooth"
            >
              Browse Knowledgebase
            </Link>
            <Link
              href="/education/research"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-lg font-semibold text-lg transition-smooth"
            >
              View Research Centres
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
