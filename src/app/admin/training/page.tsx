export default function AdminTrainingPage() {
  const courses = [
    { title: "Farm Management Fundamentals", enrolled: 185, completed: 142, rating: 4.8, status: "Active" },
    { title: "Export Compliance Basics", enrolled: 120, completed: 98, rating: 4.6, status: "Active" },
    { title: "Blueberry Cultivation Best Practices", enrolled: 67, completed: 45, rating: 4.9, status: "Active" },
    { title: "Post-Harvest Handling & Cold Chain", enrolled: 95, completed: 72, rating: 4.5, status: "Active" },
    { title: "Financial Literacy for Farmers", enrolled: 156, completed: 89, rating: 4.7, status: "Active" },
    { title: "Sustainable Agriculture Practices", enrolled: 78, completed: 23, rating: 4.4, status: "Active" },
    { title: "Market Analysis & Pricing Strategy", enrolled: 45, completed: 0, rating: 0, status: "Draft" },
    { title: "Advanced Irrigation Techniques", enrolled: 32, completed: 0, rating: 0, status: "Draft" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Training Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage courses and track learner progress</p>
        </div>
        <button className="bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Enrollments</p>
          <p className="text-3xl font-bold text-navy mt-1">778</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Completions</p>
          <p className="text-3xl font-bold text-teal mt-1">469</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Completion Rate</p>
          <p className="text-3xl font-bold text-gold mt-1">60.3%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enrolled</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Completed</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((c, i) => (
                <tr key={i} className="hover:bg-cream/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-navy">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.enrolled}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.completed}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.enrolled > 0 ? `${Math.round((c.completed/c.enrolled)*100)}%` : "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.rating > 0 ? `${c.rating}/5` : "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      c.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>{c.status}</span>
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
