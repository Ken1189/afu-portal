'use client';

import Link from "next/link";
import { Landmark, RefreshCw, TrendingUp, Users, type LucideIcon } from "lucide-react";

const plans = [
  {
    name: "Farmer Retirement Savings",
    description:
      "A dedicated retirement fund for farmers. Contribute monthly and build a nest egg that grows with AFU's capital program returns.",
    icon: Landmark,
    minContribution: "From $10/month",
  },
  {
    name: "Membership-Linked Pension",
    description:
      "A portion of your AFU membership fee is automatically directed into a pension pot, giving you retirement savings from day one.",
    icon: RefreshCw,
    minContribution: "Included in membership",
  },
  {
    name: "Leveraged Growth Fund",
    description:
      "Your pension contributions are invested through AFU's capital program, accessing returns from agricultural trade finance and land development.",
    icon: TrendingUp,
    minContribution: "From $25/month",
  },
  {
    name: "Family Legacy Plan",
    description:
      "A long-term savings plan that combines retirement income with a lump-sum inheritance benefit for your children and dependents.",
    icon: Users,
    minContribution: "From $50/month",
  },
];

const benefits = [
  "Contributions as low as $10 per month",
  "Returns boosted through AFU's agricultural capital program",
  "Automatic contributions from your membership fee",
  "Flexible withdrawal options at retirement age",
  "Tax-efficient savings where applicable",
  "Lump-sum or monthly payout options at maturity",
  "Portable across countries within AFU's network",
  "Transparent fund performance reporting via your dashboard",
];

const steps = [
  { step: "Enroll", desc: "Sign up for a pension plan through your AFU dashboard. Choose your contribution level and plan type." },
  { step: "Contribute", desc: "Monthly contributions are deducted automatically from your bank, mobile money, or harvest proceeds." },
  { step: "Grow", desc: "Your fund grows through AFU's capital program, earning returns from agricultural trade finance activities." },
  { step: "Retire", desc: "At retirement, choose a monthly pension income, lump-sum payout, or a combination of both." },
];

export default function PensionPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Pension &amp; Retirement
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Farm today, retire comfortably tomorrow. AFU pension plans help
            farmers build long-term wealth through disciplined savings and
            leveraged returns from our capital program.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/farm/insurance/quote"
              className="bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Saving
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
              Pension Plans
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Multiple pathways to retirement security, each designed around the
              realities of farming income.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><plan.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {plan.description}
                </p>
                <div className="text-xs font-semibold text-teal">
                  {plan.minContribution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-6">
                Why Save With AFU?
              </h2>
              <ul className="space-y-4">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="text-teal mt-0.5 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-navy rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Growth Example</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                See how your savings could grow over time with AFU&apos;s
                leveraged capital program.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">Monthly contribution</span>
                  <span className="font-semibold text-sm">$25</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">After 10 years</span>
                  <span className="font-semibold text-sm">~$4,500</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">After 20 years</span>
                  <span className="font-semibold text-sm">~$12,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">After 30 years</span>
                  <span className="font-semibold text-gold text-sm">~$28,000+</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                Projections based on estimated 8% annual returns. Actual returns may vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
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
          <h2 className="text-3xl font-bold mb-4">Start Building Your Future</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            It is never too early or too late to start saving for retirement.
            Open an AFU pension plan today and let your money work as hard as you
            do.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Open a Pension Plan
          </Link>
        </div>
      </section>
    </>
  );
}
