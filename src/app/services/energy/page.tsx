import Link from "next/link";
import {
  Sun,
  Battery,
  Flame,
  DollarSign,
  Zap,
  Leaf,
  Award,
  ArrowRight,
  Droplets,
  Warehouse,
  Home,
  Wheat,
} from "lucide-react";

export const metadata = {
  title: "Farm Energy Solutions - AFU",
  description:
    "Powering African agriculture sustainably. Solar-powered irrigation, off-grid solutions, biogas systems, and energy financing for farms.",
};

const solarSolutions = [
  {
    title: "Solar-Powered Irrigation",
    description:
      "Solar water pumping systems that replace expensive diesel pumps. Irrigate your crops using clean, free energy from the sun.",
    icon: Droplets,
  },
  {
    title: "Cold Storage",
    description:
      "Solar-powered cold rooms and refrigerated containers to reduce post-harvest losses. Keep produce fresh from farm to market.",
    icon: Warehouse,
  },
  {
    title: "Farm Buildings",
    description:
      "Rooftop and ground-mounted solar panels for farm buildings, workshops, offices, and worker housing.",
    icon: Home,
  },
  {
    title: "Crop Drying",
    description:
      "Solar-thermal crop dryers for maize, tobacco, fruits, and vegetables. Reduce dependency on firewood and fossil fuels.",
    icon: Wheat,
  },
];

const benefits = [
  {
    title: "Reduce Costs",
    description:
      "Cut energy bills by up to 70%. Solar systems pay for themselves within 3-5 years, then provide free power for 20+ years.",
    icon: DollarSign,
  },
  {
    title: "Reliable Power",
    description:
      "No more load-shedding or fuel shortages. Solar and battery systems deliver consistent, reliable energy for your operations.",
    icon: Zap,
  },
  {
    title: "Climate-Friendly",
    description:
      "Reduce your farm's carbon footprint. Access carbon credit programmes and meet sustainability requirements for export markets.",
    icon: Leaf,
  },
  {
    title: "Government Incentives",
    description:
      "Take advantage of tax rebates, duty-free solar equipment imports, and subsidised green energy programmes across Southern and East Africa.",
    icon: Award,
  },
];

const installationPartners = [
  "SolarAfrica",
  "Distributed Power Africa",
  "SunFunder",
  "Greenlight Planet",
  "d.light",
  "Engie PowerCorner",
];

export default function EnergyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-gold/20 text-gold text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Energy Solutions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Farm Energy Solutions
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Powering African agriculture sustainably. From solar irrigation to
              biogas systems, we help farmers reduce costs, gain energy
              independence, and farm more profitably.
            </p>
          </div>
        </div>
      </section>

      {/* Solar Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-8 h-8 text-gold" />
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Solar Solutions
            </h2>
          </div>
          <p className="text-gray-500 max-w-2xl mb-12">
            Harness Africa&apos;s abundant sunshine to power every aspect of your
            farming operation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solarSolutions.map((solution, i) => {
              const Icon = solution.icon;
              return (
                <div
                  key={i}
                  className="bg-cream rounded-2xl p-8 hover:shadow-lg transition-all border border-transparent hover:border-gold/20 group"
                >
                  <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    <Icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Off-Grid Solutions */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Battery className="w-8 h-8 text-teal" />
                <h2 className="text-3xl font-bold text-navy">
                  Off-Grid Solutions
                </h2>
              </div>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Many African farms operate beyond the reach of the national
                grid. Our off-grid solutions provide reliable, affordable power
                for remote farming communities.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Battery Storage Systems",
                    desc: "Lithium-ion battery banks that store solar energy for use at night and during cloudy periods. Sizes from 5kWh to 500kWh.",
                  },
                  {
                    title: "Mini-Grids for Farming Communities",
                    desc: "Shared solar mini-grids that power multiple farms, processing centres, and community facilities from a single installation.",
                  },
                  {
                    title: "Portable Power Units",
                    desc: "Mobile solar-battery units for seasonal or remote operations. Power tools, lights, and charging stations anywhere.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gray-100"
                  >
                    <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal/10 to-navy/10 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <Battery className="w-16 h-16 text-teal mx-auto mb-4" />
                <p className="text-navy font-semibold">
                  Off-Grid Energy Systems
                </p>
                <p className="text-gray-400 text-sm">
                  5kWh to 500kWh capacity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biogas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-green-50 to-teal-light rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <Flame className="w-16 h-16 text-teal mx-auto mb-4" />
                <p className="text-navy font-semibold">
                  Biogas Digesters
                </p>
                <p className="text-gray-400 text-sm">
                  From agricultural waste to clean energy
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-8 h-8 text-teal" />
                <h2 className="text-3xl font-bold text-navy">
                  Biogas Systems
                </h2>
              </div>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Convert agricultural waste into clean cooking gas and
                electricity. Biogas digesters turn crop residues, animal manure,
                and food waste into a valuable energy resource.
              </p>
              <ul className="space-y-3">
                {[
                  "Process crop residues, animal manure, and food waste",
                  "Generate clean cooking gas for farm workers",
                  "Produce electricity for farm operations",
                  "Create nutrient-rich bio-slurry fertiliser as a by-product",
                  "Reduce methane emissions and qualify for carbon credits",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-teal rounded-full flex items-center justify-center mt-0.5 shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Switch to Clean Energy?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The business case for farm energy is clear. Here is why thousands
              of African farmers are making the switch.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center"
                >
                  <div className="w-14 h-14 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cream rounded-2xl p-8 md:p-12 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className="inline-block bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  CASE STUDY
                </span>
                <h3 className="text-2xl font-bold text-navy mb-4">
                  Solar Irrigation Project in Botswana
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  In 2025, AFU partnered with a 120-hectare horticulture farm
                  in the Tuli Block region of Botswana to install a 50kW solar
                  irrigation system. The farm previously relied on diesel pumps
                  costing over $800/month in fuel alone.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-teal">72%</div>
                    <div className="text-gray-500 text-xs">Cost Reduction</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-teal">3.2yr</div>
                    <div className="text-gray-500 text-xs">Payback Period</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-teal">45t</div>
                    <div className="text-gray-500 text-xs">
                      CO&#8322; Saved/Year
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gold/10 to-teal/10 rounded-xl flex items-center justify-center p-8">
                <div className="text-center">
                  <Sun className="w-12 h-12 text-gold mx-auto mb-3" />
                  <p className="text-navy font-semibold text-sm">
                    Tuli Block, Botswana
                  </p>
                  <p className="text-gray-400 text-xs">50kW Solar System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Integration */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-navy to-navy-dark rounded-2xl p-10 md:p-16 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Finance Your Solar Installation
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Don&apos;t let upfront costs hold you back. AFU Asset Finance
                  offers competitive rates on solar and energy equipment, with
                  repayment terms designed around your farming cycles.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "Up to 80% financing on approved installations",
                    "Repayment terms from 12 to 60 months",
                    "Seasonal repayment structures available",
                    "Bundled with installation and maintenance",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/finance/asset-finance"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-navy px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Learn About Asset Finance
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white/10 rounded-2xl p-8 text-center w-full">
                  <DollarSign className="w-12 h-12 text-gold mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">
                    from 8.5% APR
                  </div>
                  <p className="text-gray-400 text-sm">
                    Energy equipment financing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-navy mb-2">
              Our Energy Partners
            </h2>
            <p className="text-gray-500 text-sm">
              Solar equipment providers and installation partners across Africa.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {installationPartners.map((partner, i) => (
              <div
                key={i}
                className="bg-cream rounded-xl p-5 flex items-center justify-center h-16 border border-gray-100"
              >
                <span className="text-navy font-semibold text-xs text-center">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
