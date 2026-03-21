import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Smartphone,
  Award,
  Users,
  MapPin,
  ArrowRight,
  Handshake,
  TrendingUp,
  Sprout,
} from "lucide-react";

export const metadata = {
  title: "Training & Capacity Building - AFU Services",
  description:
    "Online and in-person training for African farmers. Agronomy, financial literacy, digital skills, and business management courses with industry-recognised certifications.",
};

const steps = [
  {
    number: "01",
    title: "Assess Your Skills",
    description:
      "Complete a short diagnostic assessment when you join the platform. We identify knowledge gaps and recommend a personalised learning path tailored to your crops, region, and experience level.",
  },
  {
    number: "02",
    title: "Learn at Your Pace",
    description:
      "Access bite-sized modules via the AFU mobile app — available offline in 12 local languages. Video lessons, interactive quizzes, and practical assignments designed for farmers with limited connectivity.",
  },
  {
    number: "03",
    title: "Practice in the Field",
    description:
      "Join hands-on demonstration sessions run by our network of 200+ extension officers. Practice new techniques on demonstration plots before applying them to your own farm.",
  },
  {
    number: "04",
    title: "Certify & Unlock",
    description:
      "Earn industry-recognised certificates that unlock premium platform features — higher credit limits, priority offtake matching, and access to advanced financing products.",
  },
];

const features = [
  {
    icon: Sprout,
    title: "Agronomy & Crop Science",
    description:
      "Soil management, crop rotation, integrated pest management, and climate-smart agriculture. Courses cover maize, soya, horticulture, coffee, cashew, and 20+ other African staple and cash crops.",
  },
  {
    icon: TrendingUp,
    title: "Financial Literacy",
    description:
      "Budgeting, record-keeping, savings, and credit management. Understand loan terms, interest rates, and how to build a bankable farming business that qualifies for larger facilities.",
  },
  {
    icon: Smartphone,
    title: "Digital Skills",
    description:
      "Navigate the AFU platform, use mobile money, understand digital contracts, and leverage market data. Essential skills for participating in the modern agricultural value chain.",
  },
  {
    icon: BookOpen,
    title: "Business Management",
    description:
      "Farm-as-a-business planning, cooperative governance, supply chain management, and export readiness. Turn subsistence farming into a scalable commercial operation.",
  },
  {
    icon: Award,
    title: "Certification Programmes",
    description:
      "Industry-recognised credentials in GlobalG.A.P., organic production, food safety (HACCP), and quality management. Certifications that open doors to premium buyers and export markets.",
  },
  {
    icon: MapPin,
    title: "Extension Officer Network",
    description:
      "200+ field-based extension officers across 9 countries deliver in-person training, monitor farmer progress, and provide on-farm advisory services in local languages.",
  },
];

const stats = [
  { value: "50+", label: "Courses Available", sub: "across 6 disciplines" },
  { value: "5,000+", label: "Farmers Trained", sub: "and growing monthly" },
  { value: "85%", label: "Completion Rate", sub: "above industry average" },
  { value: "12", label: "Languages Supported", sub: "local & international" },
];

export default function TrainingServicePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80')",
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
              Training
            </span>
            <br />& Capacity Building
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
            Online and in-person courses in agronomy, financial literacy,
            digital skills, and business management. Earn industry-recognised
            certifications that unlock premium platform features and higher
            credit limits.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-[#5DB347]/25"
              style={{
                background: "linear-gradient(135deg, #5DB347, #449933)",
              }}
            >
              Start Learning <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              Become a Trainer
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
              A progressive learning system that meets farmers where they are —
              on their phones, in their fields, and in their language.
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
              What You{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6ABF4B, #5DB347)",
                }}
              >
                Will Learn
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Practical, actionable knowledge designed for African farming
              conditions. Every course is built with input from agronomists,
              financial experts, and experienced farmers.
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
              Learning{" "}
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
              Invest in Your Skills, Grow Your Income
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Farmers who complete AFU training programmes see an average 30%
              increase in yield and unlock access to premium financing and
              offtake opportunities. Start your learning journey today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-white text-[#449933] px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <GraduationCap className="w-5 h-5" /> Start Learning Free
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Handshake className="w-5 h-5" /> Partner as a Trainer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
