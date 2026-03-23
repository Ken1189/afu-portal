import Link from "next/link";
import {
  Building2,
  MapPin,
  Sprout,
  Leaf,
  Users,
  Banknote,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Truck,
  FileText,
  Shield,
  Award,
  ArrowRight,
  Calendar,
  Package,
  Handshake,
  Globe2,
  Tractor,
  Wheat,
} from "lucide-react";

export const metadata = {
  title: "Commercial Dashboard Demo | AFU Investor Preview",
  description:
    "Interactive demo of the AFU commercial farmer dashboard. Enterprise-grade farm management tools for larger operations.",
};

export default function CommercialDemoPage() {
  return (
    <div className="pb-20">
      {/* ─── DEMO BANNER ─── */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2D4A7A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#127919;</span>
            <div>
              <span className="font-bold">Investor Demo &mdash; Commercial Dashboard</span>
              <span className="hidden sm:inline text-white/80 ml-2">
                | Enterprise-grade farm management
              </span>
            </div>
          </div>
          <Link
            href="/investors"
            className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Back to Investor Page
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ─── 1. DASHBOARD OVERVIEW ─── */}
        <section id="dashboard" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0F1A30] px-6 py-6 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Welcome back,</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Simba Chikwanha</h1>
                <div className="flex items-center gap-3 mt-2">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <span className="text-white/70 text-sm">Midlands Province, Zimbabwe</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Commercial Tier
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {[
              { label: "Active Financing", value: "$15,000", icon: Banknote },
              { label: "Farm Plots", value: "3", icon: Leaf },
              { label: "Workers", value: "12", icon: Users },
              { label: "Monthly Revenue", value: "$8,200", icon: DollarSign },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="px-6 py-5 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-[#5DB347]" />
                  <div className="text-xl font-bold text-[#1B2A4A]">{stat.value}</div>
                  <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Farm summary bar */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-[#5DB347]" />
              8 ha total
            </span>
            <span className="text-gray-300">|</span>
            <span>Cotton &amp; Sunflower primary</span>
            <span className="text-gray-300">|</span>
            <span>Midlands, Zimbabwe</span>
          </div>
        </section>

        {/* ─── 2. MULTI-PLOT MANAGEMENT ─── */}
        <section id="farm" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#5DB347]" />
            Multi-Plot Management
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "Plot A",
                size: "3 ha",
                crop: "Cotton",
                health: 91,
                healthColor: "text-emerald-600",
                barColor: "bg-emerald-500",
                status: "Harvest in 45 days",
                statusColor: "text-emerald-700 bg-emerald-50",
                icon: Wheat,
              },
              {
                name: "Plot B",
                size: "3 ha",
                crop: "Sunflower",
                health: 78,
                healthColor: "text-amber-600",
                barColor: "bg-amber-500",
                status: "Needs attention",
                statusColor: "text-amber-700 bg-amber-50",
                icon: Sprout,
                attention: true,
              },
              {
                name: "Plot C",
                size: "2 ha",
                crop: "Maize (rotation)",
                health: 85,
                healthColor: "text-emerald-600",
                barColor: "bg-[#5DB347]",
                status: "Vegetative stage",
                statusColor: "text-blue-700 bg-blue-50",
                icon: Leaf,
              },
            ].map((plot) => {
              const Icon = plot.icon;
              return (
                <div
                  key={plot.name}
                  className={`p-5 rounded-xl border ${
                    plot.attention
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-gray-100"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#5DB347]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1B2A4A]">{plot.name}</p>
                        <p className="text-xs text-gray-500">{plot.size}</p>
                      </div>
                    </div>
                    {plot.attention && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#1B2A4A] mb-3">{plot.crop}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Health</span>
                      <span className={`font-bold ${plot.healthColor}`}>{plot.health}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${plot.barColor}`}
                        style={{ width: `${plot.health}%` }}
                      />
                    </div>
                  </div>
                  <div className={`mt-3 text-xs font-semibold px-2 py-1 rounded-full inline-block ${plot.statusColor}`}>
                    {plot.status}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 3. FINANCIAL OVERVIEW ─── */}
        <section id="financing" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#5DB347]" />
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loans */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Active Financing
              </h3>
              <div className="p-4 rounded-xl border-2 border-[#5DB347]/20 bg-[#EBF7E5]/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400">Working Capital Loan</p>
                    <p className="text-lg font-bold text-[#1B2A4A]">$10,000</p>
                  </div>
                  <span className="text-xs font-semibold text-[#5DB347] bg-[#EBF7E5] px-2 py-1 rounded-full">
                    14% APR
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>6-month term</span>
                  <span>42% repaid</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5DB347]"
                    style={{ width: "42%" }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400">Equipment Lease</p>
                    <p className="text-lg font-bold text-[#1B2A4A]">$5,000</p>
                  </div>
                  <span className="text-xs text-gray-500">Tractor</span>
                </div>
                <p className="text-xs text-gray-500">Monthly payments &middot; 10 of 12 remaining</p>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: "17%" }} />
                </div>
              </div>
            </div>

            {/* Revenue / Cash flow */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Revenue &amp; Cash Flow
              </h3>
              {/* Static bar chart using styled divs */}
              <div className="p-4 rounded-xl border border-gray-100">
                <div className="flex items-end gap-2 h-40 mb-3">
                  {[
                    { month: "Oct", income: 65, expense: 40 },
                    { month: "Nov", income: 72, expense: 45 },
                    { month: "Dec", income: 58, expense: 38 },
                    { month: "Jan", income: 80, expense: 50 },
                    { month: "Feb", income: 75, expense: 42 },
                    { month: "Mar", income: 82, expense: 48 },
                  ].map((bar) => (
                    <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end" style={{ height: "100%" }}>
                        <div
                          className="flex-1 bg-[#5DB347] rounded-t-sm"
                          style={{ height: `${bar.income}%` }}
                          title={`Income: ${bar.income}%`}
                        />
                        <div
                          className="flex-1 bg-red-300 rounded-t-sm"
                          style={{ height: `${bar.expense}%` }}
                          title={`Expense: ${bar.expense}%`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-between text-xs text-gray-400 px-1">
                  {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
                    <span key={m} className="flex-1 text-center">
                      {m}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#5DB347]" />
                    Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-red-300" />
                    Expenses
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#EBF7E5]/50 border border-[#5DB347]/20">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Cash Flow Projection
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Projected Q2 net</span>
                  <span className="font-bold text-[#5DB347]">+$12,400</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Post-harvest revenue</span>
                  <span className="font-bold text-[#1B2A4A]">$28,000</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. OFFTAKE CONTRACTS ─── */}
        <section id="marketplace" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#5DB347]" />
            Offtake Contracts
          </h2>
          <div className="space-y-4">
            {[
              {
                buyer: "Cotton Company of Zimbabwe",
                quantity: "8 tonnes @ $0.85/kg",
                value: "$6,800",
                delivery: "June 2026",
                status: "Active",
                statusColor: "text-emerald-600 bg-emerald-50",
              },
              {
                buyer: "Local Oil Processor",
                quantity: "5 tonnes sunflower @ $550/tonne",
                value: "$2,750",
                delivery: "August 2026",
                status: "Active",
                statusColor: "text-emerald-600 bg-emerald-50",
              },
            ].map((contract) => (
              <div
                key={contract.buyer}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 transition-colors gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-[#1B2A4A]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1B2A4A]">{contract.buyer}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{contract.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1B2A4A]">{contract.value}</p>
                    <p className="text-xs text-gray-500">Delivery: {contract.delivery}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${contract.statusColor}`}
                  >
                    {contract.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. EQUIPMENT ─── */}
        <section id="equipment" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Tractor className="w-5 h-5 text-[#5DB347]" />
            Equipment Booked
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Tractor",
                model: "John Deere 5E",
                dates: "March 25\u201328, 2026",
                cost: "$180 total",
                icon: Tractor,
              },
              {
                name: "Seed Drill",
                model: "4-row",
                dates: "April 1\u20132, 2026",
                cost: "$50 total",
                icon: Package,
              },
            ].map((equip) => {
              const Icon = equip.icon;
              return (
                <div
                  key={equip.name}
                  className="p-5 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#5DB347]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1B2A4A]">{equip.name}</p>
                    <p className="text-xs text-gray-500">{equip.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1B2A4A]">{equip.cost}</p>
                    <p className="text-xs text-gray-500">{equip.dates}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 6. COOPERATIVE MEMBERSHIP ─── */}
        <section id="cooperative" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5DB347]" />
            Cooperative Membership
          </h2>
          <div className="p-5 rounded-xl border-2 border-[#5DB347]/20 bg-[#EBF7E5]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5DB347] flex items-center justify-center">
                <Handshake className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1B2A4A]">Midlands Cotton Cooperative</p>
                <p className="text-sm text-gray-500">45 members &middot; Shared equipment pool</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">Active Member</span>
            </div>
          </div>
        </section>

        {/* ─── 7. EXPORT READINESS ─── */}
        <section id="exports" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#5DB347]" />
            Export Readiness
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-[#1B2A4A]">Phytosanitary Certificate</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">Valid</span>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-[#1B2A4A]">ZIMRA Export License</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Loader2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-600">Pending</span>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-[#5DB347]" />
              </div>
              <p className="text-sm font-bold text-[#1B2A4A]">Quality Grade</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-lg font-extrabold text-[#5DB347]">A</span>
                <span className="text-sm text-gray-500">(Premium)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-r from-[#1B2A4A] to-[#0F1A30] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Enterprise-grade tools for commercial farmers
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-xl mx-auto">
            Multi-plot management, offtake contracts, equipment booking, cooperative membership, and
            export readiness &mdash; all integrated into one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo/farm"
              className="bg-[#5DB347] hover:bg-[#4A9E35] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              View Farmer Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact?subject=investor"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Request Investor Pack
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
