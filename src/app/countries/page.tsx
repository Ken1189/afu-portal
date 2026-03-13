import Link from "next/link";

export const metadata = {
  title: "Phase 1 Countries - AFU",
  description: "AFU Phase 1 deployment: Botswana (Bank Base), Zimbabwe (Export Lane), Tanzania (Scale Lane).",
};

export default function CountriesPage() {
  return (
    <>
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Phase 1 Countries</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Three strategic markets, each serving a distinct purpose in the AFU flywheel.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                flag: "🇧🇼",
                country: "Botswana",
                role: "Institutional Base",
                desc: "Full bank licensing pathway + compliance foundation. Creates permanence and access to larger capital pools.",
                highlights: ["Bank licensing pathway", "Compliance foundation", "Access to larger capital pools", "Institutional credibility"],
                color: "bg-blue-50 border-blue-200",
              },
              {
                flag: "🇿🇼",
                country: "Zimbabwe",
                role: "Export Lane (Blueberries)",
                desc: "High-value export crop with structured buyer demand. Ideal for escrow-based repayment + invoice finance.",
                highlights: ["Blueberry export focus", "Structured buyer demand", "Escrow-based repayment", "Invoice finance ready"],
                color: "bg-green-50 border-green-200",
              },
              {
                flag: "🇹🇿",
                country: "Tanzania",
                role: "Scale Lane (Cassava + Sesame)",
                desc: "Cassava for food security + processing potential. Sesame as an export commodity with fast turnover.",
                highlights: ["Cassava processing", "Sesame exports", "Food security impact", "Fast capital turnover"],
                color: "bg-amber-50 border-amber-200",
              },
            ].map((c, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 ${c.color}`}>
                <div className="text-5xl mb-4">{c.flag}</div>
                <h2 className="text-2xl font-bold text-navy mb-1">{c.country}</h2>
                <div className="text-teal font-semibold text-sm mb-4">{c.role}</div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{c.desc}</p>
                <ul className="space-y-2">
                  {c.highlights.map((h, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-teal-light rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-navy mb-4">Interested in AFU expanding to your country?</h3>
            <p className="text-gray-600 mb-6">We are always evaluating new markets for Phase 2 and beyond.</p>
            <Link href="/contact" className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
