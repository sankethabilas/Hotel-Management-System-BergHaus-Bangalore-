export default function AdminLeavesPage() {
  const leaves = [
    { name: "Priya Singh", type: "Annual", dates: "Oct 10-14", status: "Pending" },
    { name: "Vikram Patel", type: "Sick", dates: "Oct 2", status: "Approved" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leaves</h1>
        <p className="text-sm text-gray-600">Mock approvals workflow</p>
      </div>
      <div className="admin-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((l) => (
              <tr key={l.name + l.dates}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{l.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{l.type}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{l.dates}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="admin-chip" style={{ backgroundColor: l.status === "Approved" ? "#fee3b3" : "#ffc973" }}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


