import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Crop Development Loans - AFU",
  description:
    "Finance your entire growing season with AFU Crop Development Loans. From smallholder to commercial, with repayment tied to your harvest cycle.",
};

const FALLBACK_STAGES = [
  {
    stage: "Pre-Plant",
    period: "6-8 weeks before",
    activities: "Land preparation, soil testing, input procurement",
    funding: "40% of loan disbursed",
    color: "bg-amber-100 text-amber-800",
  },
  {
    stage: "Planting",
    period: "Planting window",
    activities: "Seed, fertilizer application, planting labour",
    funding: "30% disbursed",
    color: "bg-green-100 text-green-800",
  },
  {
    stage: "Growing",
    period: "Season duration",
    activities: "Top-dressing, pest control, irrigation",
    funding: "20% disbursed",
    color: "bg-teal-100 text-teal-800",
  },
  {
    stage: "Harvest",
    period: "Harvest window",
    activities: "Harvesting, transport to collection point",
    funding: "10% disbursed",
    color: "bg-blue-100 text-blue-800",
  },
  {
    stage: "Repayment",
    period: "Post-harvest",
    activities: "Crop sold via offtake, loan deducted from escrow",
    funding: "Loan + interest settled",
    color: "bg-navy text-white",
  },
];

const FALLBACK_TIERS = [
  {
    name: "Smallholder",
    range: "$500 - $5,000",
    area: "Up to 5 hectares",
    rate: "14 - 18% APR",
    features: [
      "Input vouchers via AFU marketplace",
      "Agronomist advisory included",
      "Group lending available",
      "Harvest escrow repayment",
    ],
  },
  {
    name: "Growth",
    range: "$5,000 - $25,000",
    area: "5 - 50 hectares",
    rate: "12 - 15% APR",
    features: [
      "Direct cash disbursement option",
      "Dedicated loan officer",
      "Seasonal repayment flex",
      "Multi-crop financing",
    ],
    featured: true,
  },
  {
    name: "Commercial",
    range: "$25,000 - $100,000",
    area: "50+ hectares",
    rate: "10 - 13% APR",
    features: [
      "Custom disbursement schedule",
      "Priority processing",
      "Revolving facility option",
      "Export-linked repayment",
    ],
  },
];

const FALLBACK_CROPS = [
  { name: "Maize", season: "Oct - Apr" },
  { name: "Soya Beans", season: "Nov - Apr" },
  { name: "Groundnuts", season: "Nov - Mar" },
  { name: "Tobacco", season: "Sep - Mar" },
  { name: "Cotton", season: "Oct - May" },
  { name: "Sunflower", season: "Nov - Apr" },
  { name: "Vegetables", season: "Year-round" },
  { name: "Wheat", season: "May - Oct" },
];

const FALLBACK_REQUIREMENTS = [
  "Active AFU membership (any tier)",
  "KYC verification complete",
  "Crop plan submitted and approved",
  "Land proof: title deed, lease, or offer letter",
  "At least one season of farming history (waived for group loans)",
  "Offtake agreement or market plan",
];

export default async function CropDevLoanPage() {
  // Fetch loan products config from site_config
  let stages = FALLBACK_STAGES;
  let tiers = FALLBACK_TIERS;
  let crops = FALLBACK_CROPS;
  let requirements = FALLBACK_REQUIREMENTS;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'loan_products')
      .single();
    if (data?.value) {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      if (parsed.stages && Array.isArray(parsed.stages) && parsed.stages.length > 0) stages = parsed.stages;
      if (parsed.tiers && Array.isArray(parsed.tiers) && parsed.tiers.length > 0) tiers = parsed.tiers;
      if (parsed.crops && Array.isArray(parsed.crops) && parsed.crops.length > 0) crops = parsed.crops;
      if (parsed.requirements && Array.isArray(parsed.requirements) && parsed.requirements.length > 0) requirements = parsed.requirements;
    }
  } catch {
    // keep fallbacks
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Crop Development Loans
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Finance your entire growing season from land preparation through
            harvest. Repayment is tied to your crop cycle and controlled through
            AFU&apos;s escrow system, so you only pay when your crop sells.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Apply for a Crop Loan
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

      {/* Seasonal Lending Cycle */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Seasonal Lending Cycle
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Funds are disbursed in stages aligned with your crop&apos;s growth
              cycle, ensuring capital arrives exactly when you need it.
            </p>
          </div>
          <div className="space-y-4">
            {stages.map((stage, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex items-center gap-4 md:w-1/4">
                  <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${stage.color}`}>
                      {stage.stage}
                    </span>
                  </div>
                </div>
                <div className="md:w-1/5 text-sm text-gray-400">
                  {stage.period}
                </div>
                <div className="md:w-2/5 text-sm text-gray-600">
                  {stage.activities}
                </div>
                <div className="md:w-1/5 text-sm font-semibold text-navy text-right">
                  {stage.funding}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Tiers */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">Loan Tiers</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Three tiers to match your farming scale. Each comes with tailored
              support and lending terms.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  tier.featured
                    ? "bg-navy text-white ring-2 ring-teal"
                    : "bg-white border border-gray-100"
                }`}
              >
                {tier.featured && (
                  <div className="inline-block bg-teal text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3
                  className={`text-xl font-bold mb-2 ${
                    tier.featured ? "text-white" : "text-navy"
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="text-2xl font-bold text-teal mb-1">
                  {tier.range}
                </div>
                <div
                  className={`text-sm mb-1 ${
                    tier.featured ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {tier.area}
                </div>
                <div
                  className={`text-sm mb-6 ${
                    tier.featured ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  Rate: {tier.rate}
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature, j) => (
                    <li
                      key={j}
                      className={`text-sm flex items-start gap-2 ${
                        tier.featured ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      <span className="text-teal mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible Crops */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                Eligible Crops
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We finance a broad range of crops grown across Southern and East
                Africa. Seasonal windows vary by region and are factored into
                your loan structure.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {crops.map((crop, i) => (
                  <div
                    key={i}
                    className="bg-cream rounded-xl p-4 flex items-center justify-between"
                  >
                    <span className="font-medium text-navy text-sm">
                      {crop.name}
                    </span>
                    <span className="text-xs text-gray-400">{crop.season}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                Requirements
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                To qualify for a Crop Development Loan, you will need the
                following:
              </p>
              <ul className="space-y-4">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-teal text-xs font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Repayment Info */}
      <section className="py-20 bg-teal-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Harvest-Linked Repayment
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your crop is delivered through the AFU offtake network. The buyer
            pays into an AFU-controlled escrow account. The loan principal plus
            interest is deducted automatically, and remaining proceeds are
            transferred to your AFU Bank account within 48 hours.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Your Application
          </Link>
        </div>
      </section>
    </>
  );
}
