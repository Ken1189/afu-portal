import Link from "next/link";
import {
  Sprout,
  MapPin,
  Cloud,
  Sun,
  CheckCircle2,
  Clock,
  Loader2,
  Leaf,
  Heart,
  BookOpen,
  Lock,
  TrendingUp,
  TrendingDown,
  Banknote,
  Bell,
  ArrowRight,
  Thermometer,
  Microscope,
  AlertTriangle,
  Calendar,
  BarChart3,
  Award,
  Wheat,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Wrench,
  Globe2,
  FileText,
} from "lucide-react";

export const metadata = {
  title: "Farmer Portal Demo | AFU Investor Preview",
  description:
    "Interactive demo of the AFU farmer portal. See what 22,000+ smallholder farmers experience across Africa.",
};

export default function FarmerDemoPage() {
  return (
    <div className="pb-20 scroll-smooth">
      {/* ─── DEMO BANNER ─── */}
      <div className="bg-gradient-to-r from-[#5DB347] to-[#449933] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#127919;</span>
            <div>
              <span className="font-bold">Investor Demo &mdash; Farmer Portal</span>
              <span className="hidden sm:inline text-white/80 ml-2">
                | This is a live preview of what 22,000+ farmers see
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
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2D4A7A] px-6 py-6 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Welcome back,</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Grace Moyo</h1>
                <div className="flex items-center gap-3 mt-2">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <span className="text-white/70 text-sm">Harare, Zimbabwe</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#5DB347]/20 border border-[#5DB347]/40 text-[#5DB347] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Sprout &mdash; Level 2
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {[
              { label: "Farm Size", value: "3.5 ha", icon: Leaf },
              { label: "Active Loans", value: "2", icon: Banknote },
              { label: "Courses Done", value: "3", icon: BookOpen },
              { label: "Total Funded", value: "$450", icon: BarChart3 },
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

          {/* Weather widget */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B2A4A]">Harare &mdash; 28&deg;C</p>
              <p className="text-xs text-gray-500">Partly Cloudy</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
              <Cloud className="w-4 h-4" />
              <Thermometer className="w-4 h-4" />
              Humidity 45%
            </div>
          </div>
        </section>

        {/* ─── 2. ACTIVE APPLICATIONS ─── */}
        <section id="applications" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#5DB347]" />
            Active Applications
          </h2>
          <div className="space-y-3">
            {[
              {
                type: "Loan",
                name: "Input Finance \u2014 $2,500",
                status: "Approved",
                statusIcon: CheckCircle2,
                statusColor: "text-emerald-600 bg-emerald-50",
              },
              {
                type: "KYC",
                name: "National ID",
                status: "Verified",
                statusIcon: CheckCircle2,
                statusColor: "text-emerald-600 bg-emerald-50",
              },
              {
                type: "Insurance",
                name: "Crop Insurance",
                status: "Under Review",
                statusIcon: Loader2,
                statusColor: "text-amber-600 bg-amber-50",
              },
            ].map((app) => {
              const StatusIcon = app.statusIcon;
              return (
                <div
                  key={app.name}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {app.type}
                    </p>
                    <p className="text-sm font-semibold text-[#1B2A4A] mt-0.5">{app.name}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${app.statusColor}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {app.status}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 3. FARM OVERVIEW ─── */}
        <section id="farm" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#5DB347]" />
            Farm Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Farm Name</span>
                <span className="text-sm font-semibold text-[#1B2A4A]">Moyo Family Farm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-semibold text-[#1B2A4A]">
                  Goromonzi, Harare Province
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Size</span>
                <span className="text-sm font-semibold text-[#1B2A4A]">3.5 hectares</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Health Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5DB347]"
                      style={{ width: "82%" }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#5DB347]">82/100</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Current Crops
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <Wheat className="w-5 h-5 text-[#5DB347]" />
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">Maize</p>
                  <p className="text-xs text-gray-500">Flowering stage</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <Sprout className="w-5 h-5 text-[#8CB89C]" />
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">Groundnuts</p>
                  <p className="text-xs text-gray-500">Vegetative stage</p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">Next Activity</p>
                  <p className="text-xs text-amber-700">Apply fertilizer &mdash; due in 3 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. AI CROP DOCTOR ─── */}
        <section id="ai-doctor" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-[#5DB347]" />
            AI Crop Doctor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mock image placeholder */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <Leaf className="w-12 h-12 text-[#5DB347]/40 mx-auto mb-2" />
                <p className="text-sm text-[#5DB347]/60 font-medium">Maize Leaf Sample</p>
                <p className="text-xs text-gray-400 mt-1">Photo captured via mobile app</p>
              </div>
              <div className="absolute top-3 right-3 bg-[#5DB347] text-white text-xs font-bold px-2 py-1 rounded-full">
                AI Analyzed
              </div>
            </div>

            {/* Diagnosis result */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-amber-800">Nitrogen Deficiency Detected</h3>
                </div>
                <p className="text-sm text-amber-700">
                  Yellowing of lower leaves indicates nitrogen deficiency. Common in maize during
                  flowering stage.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#EBF7E5] border border-[#5DB347]/20">
                <h4 className="text-sm font-bold text-[#1B2A4A] mb-1">Recommendation</h4>
                <p className="text-sm text-gray-600">
                  Apply urea at 50kg/ha within 7 days. Split application recommended for better
                  absorption.
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-sm text-gray-500">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5DB347]"
                      style={{ width: "94%" }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#5DB347]">94%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. TRAINING PROGRESS ─── */}
        <section id="training" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5DB347]" />
            Training Progress
          </h2>
          <div className="space-y-4">
            {/* Course 1 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">Zimbabwe Crop Calendar</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Complete
              </span>
            </div>
            {/* Course 2 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B2A4A]">Financial Literacy</p>
                  <p className="text-xs text-gray-500">3/5 modules done</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: "60%" }} />
                </div>
                <span className="text-xs font-semibold text-blue-600">60%</span>
              </div>
            </div>
            {/* Course 3 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400">Digital Tools</p>
                  <p className="text-xs text-gray-400">Requires Sprout tier</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Locked
              </span>
            </div>
          </div>

          {/* Tier progress */}
          <div className="mt-6 p-4 rounded-xl bg-[#EBF7E5] border border-[#5DB347]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#1B2A4A]">Progress to Next Tier</span>
              <span className="text-sm font-bold text-[#5DB347]">
                <Award className="w-4 h-4 inline mr-1" />
                Grower
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white border border-[#5DB347]/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5DB347] to-[#6ABF4B]"
                style={{ width: "65%" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete 2 more courses and maintain farm health above 80 to unlock Grower tier
            </p>
          </div>
        </section>

        {/* ─── 6. MARKET PRICES ─── */}
        <section id="market-prices" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5DB347]" />
            Market Prices
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                crop: "Maize",
                price: "$280/tonne",
                change: "+3.2%",
                up: true,
              },
              {
                crop: "Tobacco",
                price: "$4.50/kg",
                change: "-1.1%",
                up: false,
              },
              {
                crop: "Groundnuts",
                price: "$1,200/tonne",
                change: "+5.4%",
                up: true,
              },
            ].map((item) => (
              <div
                key={item.crop}
                className="p-5 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 transition-colors"
              >
                <p className="text-sm text-gray-500 mb-1">{item.crop}</p>
                <p className="text-xl font-bold text-[#1B2A4A]">{item.price}</p>
                <div
                  className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                    item.up ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {item.up ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {item.change}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 7. FINANCING ─── */}
        <section id="financing" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#5DB347]" />
            Financing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active loan card */}
            <div className="p-5 rounded-xl border-2 border-[#5DB347]/20 bg-[#EBF7E5]/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Active Loan
                  </p>
                  <p className="text-lg font-bold text-[#1B2A4A] mt-1">Input Finance</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1B2A4A]">$2,500</p>
                  <p className="text-xs text-gray-500">8.5% APR</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Repaid</span>
                  <span className="font-semibold text-[#5DB347]">58%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#5DB347] to-[#6ABF4B]"
                    style={{ width: "58%" }}
                  />
                </div>
                <p className="text-xs text-gray-500">$1,450 of $2,500 repaid</p>
              </div>
            </div>

            {/* Repayment schedule */}
            <div className="p-5 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Repayment Schedule
              </p>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <Calendar className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-[#1B2A4A]">Next Payment: $312</p>
                  <p className="text-xs text-amber-700">Due March 28, 2026</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                  <span className="text-gray-500">Remaining payments</span>
                  <span className="font-semibold text-[#1B2A4A]">4 of 8</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-500">Final payment</span>
                  <span className="font-semibold text-[#1B2A4A]">June 28, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7b. TRADE FINANCE APPLICATION ─── */}
        <section id="trade-finance" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#5DB347]" />
            Trade Finance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active trade finance application */}
            <div className="p-5 rounded-xl border-2 border-[#5DB347]/20 bg-[#EBF7E5]/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Export Pre-Financing
                  </p>
                  <p className="text-lg font-bold text-[#1B2A4A] mt-1">Blueberry Export &mdash; EU</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-600 bg-amber-50">
                  <Loader2 className="w-3.5 h-3.5" />
                  Under Review
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Instrument</span>
                  <span className="font-semibold text-[#1B2A4A]">Standby Letter of Credit (SBLC)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-[#1B2A4A]">$12,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Buyer</span>
                  <span className="font-semibold text-[#1B2A4A]">FreshBerry GmbH, Germany</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Bank Partner</span>
                  <span className="font-semibold text-[#5DB347]">AFU Banking Partner</span>
                </div>
              </div>
            </div>

            {/* Trade finance info */}
            <div className="p-5 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                How Trade Finance Works
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EBF7E5]/50 border border-[#5DB347]/10">
                  <div className="w-7 h-7 bg-[#5DB347] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2A4A]">Secure an Export Buyer</p>
                    <p className="text-xs text-gray-500">AFU connects you to verified international buyers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EBF7E5]/50 border border-[#5DB347]/10">
                  <div className="w-7 h-7 bg-[#5DB347] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2A4A]">SBLC or Letter of Credit Issued</p>
                    <p className="text-xs text-gray-500">Our banking partner issues the instrument</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EBF7E5]/50 border border-[#5DB347]/10">
                  <div className="w-7 h-7 bg-[#5DB347] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2A4A]">Get Pre-Financed</p>
                    <p className="text-xs text-gray-500">Receive up to 80% advance against your export contract</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. NOTIFICATIONS ─── */}
        <section id="notifications" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#5DB347]" />
            Notifications
          </h2>
          <div className="space-y-3">
            {[
              {
                text: "Your loan application has been approved",
                time: "2 hours ago",
                icon: CheckCircle2,
                iconColor: "text-emerald-600 bg-emerald-50",
              },
              {
                text: "New training course available: Financial Literacy",
                time: "1 day ago",
                icon: BookOpen,
                iconColor: "text-blue-600 bg-blue-50",
              },
              {
                text: "Market prices updated for Zimbabwe",
                time: "2 days ago",
                icon: TrendingUp,
                iconColor: "text-[#5DB347] bg-emerald-50",
              },
            ].map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.text}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B2A4A]">{notif.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 9. AFU EXCHANGE ─── */}
        <section id="exchange" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] px-6 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              AFU Exchange
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Trade goods, services &amp; equipment with fellow farmers using AFU Credits
            </p>
          </div>

          {/* Credit Wallet */}
          <div className="px-6 py-5 sm:px-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Credit Balance
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-6 h-6 text-amber-500" />
                  <span className="text-3xl font-bold text-[#1B2A4A]">2,450</span>
                  <span className="text-sm text-gray-400 mt-1">credits</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Earned</p>
                    <p className="font-semibold text-emerald-600">+4,200</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Spent</p>
                    <p className="font-semibold text-red-500">-1,750</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Recent Activity
                </p>
                {[
                  { type: "earned" as const, desc: "Sold: Surplus Maize", amount: 1500 },
                  { type: "spent" as const, desc: "Bought: Irrigation Pump", amount: 200 },
                  { type: "earned" as const, desc: "Tractor hire payment", amount: 500 },
                ].map((tx) => (
                  <div key={tx.desc} className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        tx.type === "earned" ? "bg-emerald-50" : "bg-red-50"
                      }`}
                    >
                      {tx.type === "earned" ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    <span className="flex-1 text-xs text-gray-600 truncate">{tx.desc}</span>
                    <span
                      className={`text-xs font-bold ${
                        tx.type === "earned" ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {tx.type === "earned" ? "+" : "-"}
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Listing */}
          <div className="px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Active Listing
            </p>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#5DB347]/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Wrench className="w-7 h-7 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#1B2A4A]">
                  John Deere Tractor &mdash; Available for Hire
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Equipment
                  </span>
                  <span>42 views</span>
                  <span>&bull;</span>
                  <MapPin className="w-3 h-3" />
                  <span>Mashonaland East, Zimbabwe</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-bold text-[#1B2A4A]">500</span>
                </div>
                <p className="text-[10px] text-gray-400">credits/day</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-r from-[#1B2A4A] to-[#2D4A7A] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            This is what every farmer sees on AFU
          </h2>
          <p className="text-white/70 text-sm mb-6 max-w-xl mx-auto">
            From loan applications to AI crop diagnostics, market prices to training &mdash; all in
            one platform, accessible on any device, in 12 local languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/demo/commercial"
              className="bg-[#5DB347] hover:bg-[#4A9E35] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              View Commercial Dashboard
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
