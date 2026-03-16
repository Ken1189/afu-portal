import Link from "next/link";

export const metadata = {
  title: "Medical Insurance - AFU",
  description:
    "Health coverage for farming families. Outpatient, hospital, specialist, dental, and optical plans across clinics in Botswana, Zimbabwe, and Tanzania.",
};

const plans = [
  {
    name: "Basic",
    price: "$15/month",
    subtitle: "Essential outpatient care",
    features: [
      "GP consultations (up to 12/year)",
      "Basic medication (formulary list)",
      "Routine lab tests",
      "Malaria & typhoid treatment",
      "Family planning services",
      "Health education programs",
    ],
    limit: "$2,000/year",
    family: "+$8/dependent",
  },
  {
    name: "Standard",
    price: "$35/month",
    subtitle: "Outpatient + Hospital",
    features: [
      "Everything in Basic",
      "Hospital admission (up to 14 days/year)",
      "Surgical procedures (scheduled & emergency)",
      "Maternity cover (ante/postnatal + delivery)",
      "Chronic disease management",
      "Ambulance services",
      "Dental checkups (2/year)",
    ],
    limit: "$10,000/year",
    family: "+$18/dependent",
    featured: true,
  },
  {
    name: "Premium",
    price: "$65/month",
    subtitle: "Full specialist coverage",
    features: [
      "Everything in Standard",
      "Specialist consultations",
      "Advanced diagnostics (MRI, CT, ultrasound)",
      "Optical (eye exams + frames/lenses)",
      "Physiotherapy & rehabilitation",
      "Mental health counselling",
      "Emergency evacuation",
      "Cross-border treatment",
    ],
    limit: "$25,000/year",
    family: "+$30/dependent",
  },
];

const coverageAreas = [
  { area: "Consultations", description: "GP and specialist doctor visits at network clinics and hospitals." },
  { area: "Medication", description: "Prescription medicines from approved pharmacies with direct billing." },
  { area: "Hospitalization", description: "Inpatient treatment including ward accommodation, nursing, and meals." },
  { area: "Maternity", description: "Antenatal care, delivery (normal and caesarean), and postnatal checkups." },
  { area: "Dental", description: "Routine checkups, fillings, extractions, and emergency dental care." },
  { area: "Optical", description: "Eye examinations, prescription lenses, and frames at approved opticians." },
];

const clinicNetwork = [
  {
    country: "Botswana",
    clinics: 18,
    cities: ["Gaborone", "Francistown", "Maun", "Kasane", "Palapye"],
  },
  {
    country: "Zimbabwe",
    clinics: 32,
    cities: ["Harare", "Bulawayo", "Mutare", "Masvingo", "Chinhoyi", "Gweru"],
  },
  {
    country: "Tanzania",
    clinics: 24,
    cities: ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma", "Mbeya"],
  },
];

const faqs = [
  { q: "Who can be covered?", a: "The primary member plus spouse and up to 4 dependent children under 21 (or 25 if in full-time education)." },
  { q: "Is there a waiting period?", a: "Outpatient: none. Hospitalization: 30 days. Maternity: 12 months. Pre-existing conditions: 6 months." },
  { q: "Can I use any clinic?", a: "You must use AFU network clinics for direct billing. Out-of-network visits are covered at 60% on reimbursement basis." },
  { q: "How do I pay?", a: "Monthly premiums via AFU Bank debit order, mobile money, or deduction from harvest proceeds." },
];

export default function MedicalInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Medical Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Affordable health coverage for farming families across Southern and
            East Africa. Three plans to fit your needs, with a growing network of
            74 clinics and hospitals.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/farm/insurance/quote"
              className="bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/services/insurance"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              All Insurance Products
            </Link>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Three medical insurance tiers designed for farming families. Add
              dependents at discounted rates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  plan.featured
                    ? "bg-navy text-white ring-2 ring-gold"
                    : "bg-cream"
                }`}
              >
                {plan.featured && (
                  <div className="inline-block bg-gold text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan.featured ? "text-white" : "text-navy"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="text-2xl font-bold text-gold mb-1">
                  {plan.price}
                </div>
                <div
                  className={`text-sm mb-4 ${
                    plan.featured ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {plan.subtitle}
                </div>
                <ul className={`space-y-2 mb-6 ${plan.featured ? "text-gray-300" : "text-gray-500"}`}>
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-sm flex items-start gap-2">
                      <span className="text-teal mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className={`text-xs space-y-1 mb-6 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                  <div>Annual limit: {plan.limit}</div>
                  <div>Dependents: {plan.family}</div>
                </div>
                <Link
                  href="/farm/insurance/quote"
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                    plan.featured
                      ? "bg-gold hover:bg-gold/90 text-white"
                      : "bg-navy hover:bg-navy-light text-white"
                  }`}
                >
                  Get Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              What&apos;s Covered
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageAreas.map((area, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-bold mb-4">
                  {["🏥", "💊", "🛏️", "👶", "🦷", "👁️"][i]}
                </div>
                <h3 className="font-bold text-navy mb-2">{area.area}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic Network */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Our Clinic Network
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              74 partner clinics and hospitals across three countries, with more
              being added every quarter.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clinicNetwork.map((network, i) => (
              <div key={i} className="bg-cream rounded-2xl p-8">
                <h3 className="text-xl font-bold text-navy mb-2">
                  {network.country}
                </h3>
                <div className="text-3xl font-bold text-gold mb-4">
                  {network.clinics} clinics
                </div>
                <div className="flex flex-wrap gap-2">
                  {network.cities.map((city, j) => (
                    <span
                      key={j}
                      className="bg-white text-navy text-xs font-medium px-3 py-1 rounded-full border border-gray-200"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-navy mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Keep Your Family Healthy
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Affordable medical insurance designed for farming families. Get
            covered today and access quality healthcare across our growing
            network.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Medical Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
