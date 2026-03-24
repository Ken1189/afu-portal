import Link from "next/link";
import { Tractor, Droplets, Sun, Factory, Snowflake, Truck, type LucideIcon } from "lucide-react";

export const metadata = {
  title: "Asset Finance - AFU",
  description:
    "Finance your farming equipment and infrastructure with AFU Asset Finance. Tractors, irrigation, solar panels, and more with flexible 12-60 month terms.",
};

const steps = [
  {
    step: "01",
    title: "Apply",
    description:
      "Submit your asset finance application online or through your AFU branch. Include asset quotes and your farm profile.",
  },
  {
    step: "02",
    title: "Approve",
    description:
      "Our team reviews your application within 48 hours. Pre-approved members can get same-day approval.",
  },
  {
    step: "03",
    title: "Acquire",
    description:
      "AFU pays the supplier directly. The asset is delivered to your farm and registered under a finance agreement.",
  },
  {
    step: "04",
    title: "Repay",
    description:
      "Flexible monthly or seasonal repayments over 12 to 60 months. Option to tie repayments to harvest proceeds.",
  },
];

const assets = [
  { name: "Tractors & Implements", desc: "New and pre-owned tractors, ploughs, planters, harvesters, and attachments from approved dealers.", icon: Tractor },
  { name: "Irrigation Systems", desc: "Centre pivots, drip irrigation, sprinkler systems, and borehole drilling equipment.", icon: Droplets },
  { name: "Solar Panels & Energy", desc: "Off-grid solar installations, battery storage, and solar-powered pumping systems.", icon: Sun },
  { name: "Processing Equipment", desc: "Milling machines, drying systems, packaging lines, and food processing machinery.", icon: Factory },
  { name: "Cold Storage", desc: "Walk-in coolers, refrigerated containers, and cold chain transport units.", icon: Snowflake },
  { name: "Farm Vehicles", desc: "Pickup trucks, delivery vehicles, and specialized agricultural transport.", icon: Truck },
];

const terms = [
  { label: "Loan Term", value: "12 - 60 months" },
  { label: "Interest Rate", value: "10 - 15% APR" },
  { label: "Financing Ratio", value: "Up to 80%" },
  { label: "Minimum Deposit", value: "20% of asset value" },
  { label: "Insurance", value: "Required (via AFU Insurance)" },
  { label: "Repayment", value: "Monthly or seasonal" },
];

export default function AssetFinancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Asset Finance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Finance your farming equipment and infrastructure. Get the machinery
            you need today and pay over time with flexible terms designed around
            your farming revenue.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Apply Now
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
              A straightforward four-step process from application to asset
              delivery. Most applications are processed within 48 hours.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 bg-teal rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-teal/30" />
                )}
                <h3 className="font-bold text-navy mb-2 text-lg">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible Assets */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Eligible Assets
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We finance a wide range of farming equipment and infrastructure from
              our network of approved suppliers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal/20 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><asset.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-2">{asset.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {asset.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                Flexible Terms
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Our asset finance terms are designed to match the revenue
                patterns of African farming operations. Choose monthly
                repayments or align payments with your harvest schedule.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {terms.map((term, i) => (
                  <div key={i} className="bg-cream rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-1">
                      {term.label}
                    </div>
                    <div className="font-bold text-navy">{term.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Calculator */}
            <div className="bg-navy rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Estimate Your Payments</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Asset Value
                  </label>
                  <div className="bg-navy-light rounded-lg px-4 py-3 text-lg font-semibold">
                    $15,000
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Deposit (20%)
                  </label>
                  <div className="bg-navy-light rounded-lg px-4 py-3 text-lg font-semibold">
                    $3,000
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Loan Amount
                  </label>
                  <div className="bg-navy-light rounded-lg px-4 py-3 text-lg font-semibold">
                    $12,000
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Term: 36 months at 12% APR
                  </label>
                  <div className="bg-teal rounded-lg px-4 py-3 text-lg font-bold">
                    ~$399/month
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                This is an illustrative estimate. Actual rates depend on your
                credit profile, asset type, and membership tier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-20 bg-teal-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="text-teal text-4xl mb-4">&ldquo;</div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              With AFU Asset Finance, I was able to purchase a 75HP tractor and
              disc plough that tripled my planting capacity. The seasonal
              repayment option meant I could pay after harvest when cash flow was
              strong. In two seasons, the equipment had already paid for itself.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center text-teal font-bold">
                TM
              </div>
              <div>
                <div className="font-bold text-navy">Tendai Moyo</div>
                <div className="text-gray-400 text-sm">
                  Commercial farmer, Mashonaland East, Zimbabwe
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Upgrade Your Farm Equipment
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your asset finance application today. Our agricultural lending
            team will guide you through the process.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Apply for Asset Finance
          </Link>
        </div>
      </section>
    </>
  );
}
