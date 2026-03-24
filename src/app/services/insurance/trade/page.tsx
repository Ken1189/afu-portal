import Link from "next/link";
import { Ship, CreditCard, FileText, Landmark, type LucideIcon } from "lucide-react";

export const metadata = {
  title: "Trade Insurance - AFU",
  description:
    "Coverage for agricultural export shipments: marine transit, buyer default, letters of credit, and political risk insurance for cross-border trade.",
};

const coverageTypes = [
  {
    title: "Marine & Transit Insurance",
    description:
      "Coverage for agricultural cargo during ocean, road, rail, and air transit from farm gate to final destination. Protects against damage, loss, contamination, and delay.",
    covers: ["Physical damage in transit", "Cargo theft", "Container contamination", "Temperature excursion", "Natural perils (storm, sinking)"],
    icon: Ship,
  },
  {
    title: "Buyer Default Insurance",
    description:
      "Protection when an international buyer fails to pay for delivered goods. Covers insolvency, protracted default, and disputed invoices on confirmed contracts.",
    covers: ["Buyer insolvency", "Payment default (90+ days)", "Contract repudiation", "Disputed quality claims", "Currency inconvertibility"],
    icon: CreditCard,
  },
  {
    title: "Letters of Credit Insurance",
    description:
      "Coverage for non-payment under confirmed letters of credit. Protects against issuing bank failure, documentary discrepancies, and political interference.",
    covers: ["Issuing bank default", "Documentary rejection", "LC amendment disputes", "Force majeure events", "Sanctions-related non-payment"],
    icon: FileText,
  },
  {
    title: "Political Risk Insurance",
    description:
      "Protection against government actions that prevent contract fulfillment or payment transfer. Essential for trading into higher-risk markets.",
    covers: ["Import/export bans", "Currency controls", "License cancellation", "War and civil unrest", "Government expropriation"],
    icon: Landmark,
  },
];

const tradeRoutes = [
  { from: "Zimbabwe", to: "South Africa", products: "Tobacco, citrus, horticulture" },
  { from: "Botswana", to: "Europe (UK/EU)", products: "Beef, specialty grains" },
  { from: "Tanzania", to: "Middle East", products: "Cashews, sesame, spices" },
  { from: "Zimbabwe", to: "China", products: "Tobacco, cotton, chrome ore" },
  { from: "Botswana", to: "Namibia/Angola", products: "Fresh produce, dairy" },
  { from: "Tanzania", to: "India/SE Asia", products: "Pulses, groundnuts, sisal" },
];

const premiumRanges = [
  { type: "Marine Transit", range: "0.15% - 0.8% of cargo value", min: "$50/shipment" },
  { type: "Buyer Default", range: "0.5% - 2.5% of invoice value", min: "$100/quarter" },
  { type: "LC Insurance", range: "0.3% - 1.5% of LC value", min: "$75/transaction" },
  { type: "Political Risk", range: "0.8% - 3.0% of contract value", min: "$150/quarter" },
];

const requirements = [
  "AFU membership at Growth or Commercial tier",
  "Verified export track record (or AFU trade finance partnership)",
  "Valid export licenses and phytosanitary certificates",
  "Confirmed buyer contracts or letters of credit",
  "Compliance with AFU KYC and anti-money laundering requirements",
];

export default function TradeInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Trade Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Protect your export shipments from farm gate to final destination.
            Marine transit, buyer default, letter of credit, and political risk
            coverage for commercial farmers doing cross-border trade.
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

      {/* Coverage Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Coverage Types
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Four specialized trade insurance products covering every risk in
              the agricultural export chain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coverageTypes.map((type, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-8 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><type.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="text-xl font-bold text-navy mb-3">
                  {type.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  {type.description}
                </p>
                <ul className="space-y-1.5">
                  {type.covers.map((item, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gold mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trade Routes */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Active Trade Routes
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We insure agricultural exports along these key trade corridors and
              can arrange coverage for other destinations on request.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradeRoutes.map((route, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gold/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-navy text-sm">
                    {route.from}
                  </span>
                  <span className="text-gold">&rarr;</span>
                  <span className="font-bold text-navy text-sm">
                    {route.to}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{route.products}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Ranges */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">
            Premium Ranges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumRanges.map((item, i) => (
              <div key={i} className="bg-navy-light rounded-2xl p-6 text-center">
                <h3 className="font-semibold text-white mb-2 text-sm">
                  {item.type}
                </h3>
                <div className="text-xl font-bold text-gold mb-1">
                  {item.range}
                </div>
                <div className="text-gray-400 text-xs">Min: {item.min}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Actual premiums depend on trade route, commodity, buyer credit
            rating, and shipment value.
          </p>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-4 text-center">
            Eligibility Requirements
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            Trade insurance is available to AFU members actively engaged in
            cross-border agricultural exports.
          </p>
          <div className="bg-cream rounded-2xl p-8">
            <ul className="space-y-4">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">{i + 1}</span>
                  </div>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Works with AFU Trade Finance
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Trade Insurance integrates seamlessly with AFU Trade Finance
            services. Combine export financing with cargo and buyer default
            insurance for complete protection on every shipment.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/services/trade-finance"
              className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors text-sm"
            >
              Trade Finance Services
            </Link>
            <Link
              href="/services/finance/harvest-finance"
              className="bg-white text-navy px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all text-sm border border-gray-200"
            >
              Harvest Finance
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Export with Confidence
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Protect every shipment from farm gate to international buyer. Get a
            trade insurance quote tailored to your export profile.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Trade Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
