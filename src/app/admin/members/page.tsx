export default function AdminMembersPage() {
  const members = [
    { id: "AFU-2024-001", name: "Demo Member", email: "demo@farm.co.zw", tier: "Commercial", country: "Zimbabwe", status: "Active", joined: "Jan 2024" },
    { id: "AFU-2024-002", name: "John Moyo", email: "john@smallfarm.co.tz", tier: "Smallholder", country: "Tanzania", status: "Active", joined: "Jan 2024" },
    { id: "AFU-2024-003", name: "Grace Nyathi", email: "grace@nyathi.co.zw", tier: "Smallholder", country: "Zimbabwe", status: "Active", joined: "Feb 2024" },
    { id: "AFU-2024-004", name: "Baraka Mwanga", email: "baraka@agri.co.tz", tier: "Commercial", country: "Tanzania", status: "Active", joined: "Feb 2024" },
    { id: "AFU-2024-005", name: "Sarah Dube", email: "sarah@farmcorp.co.bw", tier: "Enterprise", country: "Botswana", status: "Active", joined: "Mar 2024" },
    { id: "AFU-2024-006", name: "TechFarm Solutions", email: "info@techfarm.io", tier: "Partner", country: "Botswana", status: "Pending", joined: "Mar 2024" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Members</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all AFU members</p>
        </div>
        <button className="bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="Search members..." className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 w-64" />
        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50">
          <option>All Tiers</option>
          <option>Smallholder</option>
          <option>Commercial</option>
          <option>Enterprise</option>
          <option>Partner</option>
        </select>
        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50">
          <option>All Countries</option>
          <option>Botswana</option>
          <option>Zimbabwe</option>
          <option>Tanzania</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Member ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Country</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m, i) => (
                <tr key={i} className="hover:bg-cream/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{m.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-navy">{m.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      m.tier === "Enterprise" ? "bg-gold/20 text-gold" :
                      m.tier === "Commercial" ? "bg-navy/10 text-navy" :
                      m.tier === "Partner" ? "bg-teal/10 text-teal-dark" :
                      "bg-teal-light text-teal"
                    }`}>{m.tier}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.country}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      m.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>{m.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{m.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
