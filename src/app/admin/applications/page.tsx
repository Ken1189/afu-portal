export default function AdminApplicationsPage() {
  const applications = [
    { id: "APP-001", name: "John Moyo", type: "Membership", tier: "Tier A", date: "Mar 13, 2024", status: "Pending" },
    { id: "APP-002", name: "Grace Nyathi", type: "Working Capital", amount: "$25,000", date: "Mar 13, 2024", status: "Under Review" },
    { id: "APP-003", name: "Baraka Mwanga", type: "Membership", tier: "Tier B", date: "Mar 12, 2024", status: "Pending" },
    { id: "APP-004", name: "Sarah Dube", type: "Invoice Finance", amount: "$50,000", date: "Mar 12, 2024", status: "Approved" },
    { id: "APP-005", name: "TechFarm Solutions", type: "Partnership", tier: "Partner", date: "Mar 11, 2024", status: "Under Review" },
    { id: "APP-006", name: "Peter Banda", type: "Equipment Finance", amount: "$30,000", date: "Mar 10, 2024", status: "Rejected" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage membership and financing applications</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">8</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Under Review</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">5</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Approved (This Month)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">12</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Rejected (This Month)</p>
          <p className="text-2xl font-bold text-red-500 mt-1">2</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((app, i) => (
                <tr key={i} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{app.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-navy">{app.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{app.amount || app.tier || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{app.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      app.status === "Approved" ? "bg-green-100 text-green-700" :
                      app.status === "Pending" ? "bg-amber-100 text-amber-700" :
                      app.status === "Under Review" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-600"
                    }`}>{app.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {(app.status === "Pending" || app.status === "Under Review") && (
                      <div className="flex gap-2">
                        <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg font-medium hover:bg-green-200 transition-colors">Approve</button>
                        <button className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-medium hover:bg-red-200 transition-colors">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
