import Link from "next/link";
import { Sprout, FlaskConical, ShieldCheck, Globe, type LucideIcon } from "lucide-react";

export const metadata = {
  title: "Input Finance - AFU",
  description:
    "Get seeds, fertilizers, and chemicals without cash upfront. AFU Input Finance pays approved suppliers directly and deducts from your harvest proceeds.",
};

const howItWorks = [
  {
    step: "01",
    title: "Submit Crop Plan",
    description:
      "Provide your planting plan including crop type, hectarage, and required inputs. Our agronomists verify quantities.",
  },
  {
    step: "02",
    title: "Get Approved",
    description:
      "AFU assesses your plan and approves an input finance limit based on your farm size, crop plan, and membership history.",
  },
  {
    step: "03",
    title: "Order Inputs",
    description:
      "Select inputs from approved suppliers on the AFU marketplace. AFU pays the supplier directly on your behalf.",
  },
  {
    step: "04",
    title: "Receive Delivery",
    description:
      "Inputs are delivered to your farm or nearest AFU collection point. Quality-verified before dispatch.",
  },
  {
    step: "05",
    title: "Repay at Harvest",
    description:
      "When your crop is sold through the AFU offtake network, the input cost plus a service fee is deducted before proceeds reach you.",
  },
];

const coverage = [
  {
    category: "Seeds",
    items: ["Certified hybrid maize seed", "Soya bean inoculated seed", "Groundnut seed", "Vegetable seedlings", "Tobacco seedlings"],
    icon: Sprout,
  },
  {
    category: "Fertilizers",
    items: ["Compound D (basal)", "Ammonium Nitrate (top dress)", "NPK blends", "Lime and gypsum", "Organic fertilizers"],
    icon: FlaskConical,
  },
  {
    category: "Crop Protection",
    items: ["Herbicides (pre & post-emergent)", "Insecticides", "Fungicides", "Biological controls", "Adjuvants and surfactants"],
    icon: ShieldCheck,
  },
  {
    category: "Soil Amendments",
    items: ["Agricultural lime", "Dolomitic lime", "Compost and mulch", "Soil conditioners", "Micronutrient blends"],
    icon: Globe,
  },
];

const benefits = [
  { title: "Zero Cash Upfront", desc: "Start your season without needing cash reserves. We finance 100% of your input costs." },
  { title: "Competitive Prices", desc: "AFU negotiates bulk pricing with suppliers, passing savings of 15-25% to you." },
  { title: "Quality Verified", desc: "All inputs are sourced from certified suppliers and quality-tested before delivery." },
  { title: "Direct Delivery", desc: "Inputs delivered to your farm gate or nearest AFU depot. No middlemen, no delays." },
];

const suppliers = [
  { name: "Zambezi Agri-Supplies", location: "Zimbabwe", speciality: "Seeds & fertilizers" },
  { name: "Kalahari Seeds", location: "Botswana", speciality: "Certified seed varieties" },
  { name: "Serengeti AgriTech", location: "Tanzania", speciality: "Crop protection & biologicals" },
  { name: "Limpopo Chemicals", location: "South Africa", speciality: "Herbicides & pesticides" },
  { name: "Great Dyke Fertilizers", location: "Zimbabwe", speciality: "Compound fertilizers" },
];

export default function InputFinancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Input Finance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Get the seeds, fertilizers, and chemicals you need to start planting
            without any cash upfront. We pay approved suppliers directly and
            recover costs from your harvest proceeds.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Apply for Input Finance
            </Link>
            <Link
              href="/services/finance"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              All Finance Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A simple process that gets inputs to your farm without any upfront
              payment. Repayment is automatic at harvest time.
            </p>
          </div>
          <div className="space-y-4">
            {howItWorks.map((item, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4"
              >
                <div className="w-12 h-12 bg-teal rounded-2xl flex items-center justify-center text-white font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              What We Cover
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Comprehensive input coverage across seeds, fertilizers, crop
              protection, and soil amendments from certified suppliers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverage.map((cat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><cat.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-3">{cat.category}</h3>
                <ul className="space-y-1.5">
                  {cat.items.map((item, j) => (
                    <li key={j} className="text-gray-500 text-sm flex items-start gap-2">
                      <span className="text-teal mt-0.5 text-xs">&#9679;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10 text-center">
            Why Input Finance?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal font-bold mb-4">
                  {["$0", "📉", "✓", "🚛"][i]}
                </div>
                <h3 className="font-bold text-navy mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approved Suppliers */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Approved Supplier Network
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We partner with leading agricultural input suppliers across
              Southern and East Africa to ensure quality and competitive pricing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal/20 transition-all"
              >
                <h3 className="font-bold text-navy mb-1">{supplier.name}</h3>
                <div className="text-sm text-gray-400 mb-2">
                  {supplier.location}
                </div>
                <span className="inline-block bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full">
                  {supplier.speciality}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Repayment */}
      <section className="py-20 bg-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Harvest-Linked Repayment
          </h2>
          <p className="text-white/80 mb-4 max-w-2xl mx-auto leading-relaxed">
            When your crop is sold through the AFU marketplace or offtake
            network, the input finance amount plus a 5-8% service fee is
            automatically deducted from your proceeds. The remaining balance is
            deposited into your AFU Bank account.
          </p>
          <p className="text-white/60 text-sm">
            No monthly payments. No surprises. You pay when you earn.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Plant with Confidence
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Do not let cash constraints stop you from planting. Apply for Input
            Finance and get everything you need delivered to your farm.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Apply for Input Finance
          </Link>
        </div>
      </section>
    </>
  );
}
