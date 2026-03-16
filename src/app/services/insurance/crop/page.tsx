import Link from "next/link";

export const metadata = {
  title: "Crop Insurance - AFU",
  description:
    "Protect your crops against drought, flood, pests, disease, and hail. Weather-index and traditional indemnity options available for African farmers.",
};

const perils = [
  { name: "Drought", description: "Coverage triggered when rainfall falls below the threshold for your crop and region during critical growth stages.", icon: "☀️" },
  { name: "Flood", description: "Protection against crop loss from excessive rainfall, waterlogging, and river flooding of planted fields.", icon: "🌊" },
  { name: "Pest Infestation", description: "Coverage for significant crop damage caused by armyworm, bollworm, aphids, and other verified pest outbreaks.", icon: "🐛" },
  { name: "Crop Disease", description: "Protection against losses from fungal, bacterial, and viral diseases including blight, rust, and wilt.", icon: "🦠" },
  { name: "Hail Damage", description: "Full coverage for hail damage to standing crops, including partial damage assessments.", icon: "🧊" },
  { name: "Frost", description: "Protection for frost-sensitive crops during unseasonable cold snaps and late-season frost events.", icon: "❄️" },
];

const insuranceTypes = [
  {
    type: "Weather-Index Insurance",
    description:
      "Automated payouts triggered by weather data from nearby stations. No field assessment required. Payments are made when rainfall, temperature, or other weather metrics breach predefined thresholds.",
    pros: ["Fast automated payouts", "No need for field inspection", "Lower premiums", "Transparent triggers"],
    ideal: "Smallholder and medium-scale farmers growing rain-fed crops",
  },
  {
    type: "Traditional Indemnity Insurance",
    description:
      "Field-assessed coverage that pays based on actual measured crop loss. An assessor visits your farm to verify damage and calculate the payout based on your insured yield.",
    pros: ["Covers all perils", "Actual loss-based payout", "Higher coverage limits", "Custom coverage per field"],
    ideal: "Commercial farmers and irrigated operations requiring precise coverage",
  },
];

const cropCoverage = [
  { crop: "Maize", maxCoverage: "$800/ha", premiumRate: "6-9%", season: "Oct-Apr" },
  { crop: "Soya Beans", maxCoverage: "$1,200/ha", premiumRate: "5-8%", season: "Nov-Apr" },
  { crop: "Tobacco", maxCoverage: "$3,500/ha", premiumRate: "7-11%", season: "Sep-Mar" },
  { crop: "Cotton", maxCoverage: "$600/ha", premiumRate: "6-10%", season: "Oct-May" },
  { crop: "Groundnuts", maxCoverage: "$900/ha", premiumRate: "5-8%", season: "Nov-Mar" },
  { crop: "Wheat", maxCoverage: "$1,000/ha", premiumRate: "4-7%", season: "May-Oct" },
  { crop: "Vegetables", maxCoverage: "$2,000/ha", premiumRate: "8-12%", season: "Year-round" },
  { crop: "Sunflower", maxCoverage: "$700/ha", premiumRate: "5-8%", season: "Nov-Apr" },
];

const claimProcess = [
  { step: "Report", desc: "Notify AFU within 72 hours of the event via app, dashboard, or phone." },
  { step: "Verify", desc: "For weather-index: automated data check. For indemnity: field assessor visit within 7 days." },
  { step: "Calculate", desc: "Loss is calculated based on weather data or field assessment against insured yield." },
  { step: "Pay", desc: "Weather-index claims paid within 72 hours. Indemnity claims within 10 business days." },
];

export default function CropInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Crop Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Protect your harvest against the unpredictable. Weather-index and
            traditional indemnity options give you the coverage you need, whether
            you farm 2 hectares or 200.
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

      {/* Perils Covered */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Perils Covered
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Protection against the six most common causes of crop loss in
              Southern and East Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perils.map((peril, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <div className="text-3xl mb-3">{peril.icon}</div>
                <h3 className="font-bold text-navy mb-2">{peril.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {peril.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Types */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Coverage Options
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Choose the insurance model that best fits your farm size, crop
              type, and budget.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {insuranceTypes.map((type, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  i === 0
                    ? "bg-teal text-white"
                    : "bg-white border border-gray-100"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-3 ${
                    i === 0 ? "text-white" : "text-navy"
                  }`}
                >
                  {type.type}
                </h3>
                <p
                  className={`text-sm mb-5 leading-relaxed ${
                    i === 0 ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {type.description}
                </p>
                <ul className="space-y-2 mb-5">
                  {type.pros.map((pro, j) => (
                    <li
                      key={j}
                      className={`text-sm flex items-center gap-2 ${
                        i === 0 ? "text-white/90" : "text-gray-600"
                      }`}
                    >
                      <span className={i === 0 ? "text-gold" : "text-teal"}>
                        &#10003;
                      </span>
                      {pro}
                    </li>
                  ))}
                </ul>
                <div
                  className={`text-xs italic ${
                    i === 0 ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  Ideal for: {type.ideal}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crop Coverage Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Crop-Specific Coverage
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Maximum coverage amounts and premium rates by crop. Actual
              premiums depend on location, coverage type, and farm history.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-6 py-4 rounded-tl-xl font-semibold text-sm">Crop</th>
                  <th className="px-6 py-4 font-semibold text-sm">Max Coverage</th>
                  <th className="px-6 py-4 font-semibold text-sm">Premium Rate</th>
                  <th className="px-6 py-4 rounded-tr-xl font-semibold text-sm">Season</th>
                </tr>
              </thead>
              <tbody>
                {cropCoverage.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-cream" : "bg-white"}
                  >
                    <td className="px-6 py-3 font-medium text-navy text-sm">
                      {row.crop}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">
                      {row.maxCoverage}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">
                      {row.premiumRate}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">
                      {row.season}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Claim Process */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Claim Process
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {claimProcess.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.step}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Secure Your Harvest
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Do not let a single bad season wipe out years of hard work. Get crop
            insurance that pays when you need it most.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Crop Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
