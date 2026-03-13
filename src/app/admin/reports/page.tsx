export default function AdminReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Key metrics and performance data</p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Deployed", value: "$4.2M", sub: "Across all products" },
          { label: "Outstanding", value: "$2.8M", sub: "Active loan book" },
          { label: "Repayment Rate", value: "94.2%", sub: "Above 92% target" },
          { label: "Revenue (YTD)", value: "$487K", sub: "Interest + fees" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-navy mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Loan Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-8 border border-gray-100">
          <h3 className="font-semibold text-navy mb-6">Loan Portfolio by Product</h3>
          <div className="space-y-4">
            {[
              { product: "Working Capital", amount: "$2.5M", count: 45, percent: 60 },
              { product: "Invoice Finance", amount: "$1.2M", count: 32, percent: 28 },
              { product: "Equipment Finance", amount: "$350K", count: 8, percent: 8 },
              { product: "Input Bundle Finance", amount: "$150K", count: 4, percent: 4 },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-navy font-medium">{p.product}</span>
                  <span className="text-gray-500">{p.amount} ({p.count} loans)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-teal" style={{ width: `${p.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-gray-100">
          <h3 className="font-semibold text-navy mb-6">Revenue Breakdown</h3>
          <div className="space-y-4">
            {[
              { source: "Interest Income", amount: "$312K", percent: 64 },
              { source: "Origination Fees", amount: "$78K", percent: 16 },
              { source: "Membership Fees", amount: "$47K", percent: 10 },
              { source: "Training Revenue", amount: "$35K", percent: 7 },
              { source: "Processing Fees", amount: "$15K", percent: 3 },
            ].map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-navy font-medium">{r.source}</span>
                  <span className="text-gray-500">{r.amount} ({r.percent}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-gold" style={{ width: `${r.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Tracker */}
      <div className="bg-white rounded-xl p-8 border border-gray-100">
        <h3 className="font-semibold text-navy mb-6">Seed Milestones Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { target: "$15M Deployed", current: "$4.2M", percent: 28, status: "In Progress" },
            { target: "92%+ Repayment", current: "94.2%", percent: 100, status: "Achieved" },
            { target: "2 Export Buyer LOIs", current: "2 LOIs + 1 Conversion", percent: 100, status: "Achieved" },
            { target: "1 Hub Operational", current: "Under Construction", percent: 65, status: "In Progress" },
            { target: "BW Licensing", current: "Application Filed", percent: 40, status: "In Progress" },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={m.percent === 100 ? "#22C55E" : "#2AA198"} strokeWidth="3" strokeDasharray={`${m.percent}, 100`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">{m.percent}%</span>
              </div>
              <p className="font-medium text-navy text-sm">{m.target}</p>
              <p className="text-xs text-gray-400 mt-1">{m.current}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
