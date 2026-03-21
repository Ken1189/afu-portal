import Link from "next/link";

export const metadata = {
  title: "AFU Bank - Agricultural Banking Services - AFU",
  description:
    "AFU Bank provides specialized banking for farmers: savings accounts, fixed deposits, mobile banking with EcoCash and M-Pesa integration, and multi-currency support.",
};

const features = [
  {
    title: "Savings Accounts",
    description:
      "Earn competitive interest on your farming proceeds. Flexible access with no minimum balance requirements for Basic Farmer accounts.",
  },
  {
    title: "Fixed Deposits",
    description:
      "Lock in higher returns for 3, 6, or 12 months. Ideal for storing harvest income between seasons at rates up to 8.5% per annum.",
  },
  {
    title: "Agricultural Current Accounts",
    description:
      "Full transactional banking with cheque books, debit cards, and unlimited transfers between AFU ecosystem partners.",
  },
  {
    title: "Mobile Banking",
    description:
      "Manage your account from anywhere via our mobile app. Integrated with EcoCash, M-Pesa, and Orange Money for instant deposits and withdrawals.",
  },
];

const benefits = [
  { title: "Low Fees", description: "Up to 60% lower fees than traditional banks for agricultural transactions." },
  { title: "Tailored for Farmers", description: "Products designed around planting and harvest cycles, not urban banking norms." },
  { title: "Mobile-First", description: "Full banking from your phone. No branch visit required for 95% of transactions." },
  { title: "Multi-Currency", description: "Hold and transact in USD, BWP, ZWL, and TZS from a single account." },
];

const accountTypes = [
  {
    name: "Basic Farmer",
    monthly: "Free",
    minBalance: "None",
    interest: "3.5% p.a.",
    transfers: "10/month free",
    mobileMoney: "Yes",
    debitCard: "Virtual only",
    ideal: "Smallholder farmers just getting started",
  },
  {
    name: "Growth",
    monthly: "$2.50/mo",
    minBalance: "$50",
    interest: "5.0% p.a.",
    transfers: "Unlimited",
    mobileMoney: "Yes",
    debitCard: "Physical + Virtual",
    ideal: "Growing operations with regular transactions",
    featured: true,
  },
  {
    name: "Commercial",
    monthly: "$7.50/mo",
    minBalance: "$500",
    interest: "6.5% p.a.",
    transfers: "Unlimited + Priority",
    mobileMoney: "Yes",
    debitCard: "Physical + Virtual",
    ideal: "Commercial farmers and cooperatives",
  },
];

export default function AFUBankPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-teal/20 text-teal px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Finance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AFU Bank</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Africa&apos;s first agricultural banking platform built by farmers, for
            farmers. Specialized financial services that understand your growing
            season, your markets, and your ambitions.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Open an Account
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

      {/* Gradient Banner */}
      <section className="bg-gradient-to-r from-[#8CB89C] to-[#729E82] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-10 text-center">
          <div>
            <div className="text-2xl font-bold">12,000+</div>
            <div className="text-white/80 text-sm">Account Holders</div>
          </div>
          <div className="w-px h-10 bg-white/30 hidden md:block" />
          <div>
            <div className="text-2xl font-bold">$8.2M</div>
            <div className="text-white/80 text-sm">Total Deposits</div>
          </div>
          <div className="w-px h-10 bg-white/30 hidden md:block" />
          <div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-white/80 text-sm">Currencies Supported</div>
          </div>
          <div className="w-px h-10 bg-white/30 hidden md:block" />
          <div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-white/80 text-sm">Mobile Uptime</div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Banking Services
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything you need to manage your farming finances in one place,
              accessible from the field or the farmhouse.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-cream rounded-2xl p-8">
                <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-10 text-center">
            Why Bank with AFU?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal/20 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal font-bold mb-4">
                  {["$", "🌾", "📱", "💱"][i]}
                </div>
                <h3 className="font-bold text-navy mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Choose Your Account
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Three account tiers to match your operation size. Upgrade anytime as
              your farm grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {accountTypes.map((account, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  account.featured
                    ? "bg-navy text-white ring-2 ring-teal"
                    : "bg-cream"
                }`}
              >
                {account.featured && (
                  <div className="inline-block bg-teal text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3
                  className={`text-xl font-bold mb-1 ${
                    account.featured ? "text-white" : "text-navy"
                  }`}
                >
                  {account.name}
                </h3>
                <div
                  className={`text-2xl font-bold mb-4 ${
                    account.featured ? "text-teal" : "text-teal"
                  }`}
                >
                  {account.monthly}
                </div>
                <ul
                  className={`space-y-3 text-sm mb-6 ${
                    account.featured ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  <li>Min Balance: {account.minBalance}</li>
                  <li>Savings Interest: {account.interest}</li>
                  <li>Transfers: {account.transfers}</li>
                  <li>Mobile Money: {account.mobileMoney}</li>
                  <li>Debit Card: {account.debitCard}</li>
                </ul>
                <p
                  className={`text-xs italic mb-6 ${
                    account.featured ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {account.ideal}
                </p>
                <Link
                  href="/apply"
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                    account.featured
                      ? "bg-teal hover:bg-teal-dark text-white"
                      : "bg-navy hover:bg-navy-light text-white"
                  }`}
                >
                  Open Account
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Start Banking Smarter Today
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Open your AFU Bank account in under 10 minutes. All you need is your
            AFU membership number, national ID, and a mobile phone.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Open an Account
          </Link>
        </div>
      </section>
    </>
  );
}
