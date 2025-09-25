export default function AdminLeaveRequestsPage() {
  const requests = [
    { name: "Anita Rao", type: "Annual", dates: "Nov 2-6", status: "Pending" },
    { name: "Rahul Verma", type: "Sick", dates: "Oct 28", status: "Pending" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Requests</h1>
        <p className="text-sm text-gray-600">Placeholder list (no backend wired)</p>
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
            {requests.map((r) => (
              <tr key={r.name + r.dates}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.type}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.dates}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="admin-chip" style={{ backgroundColor: "#ffc973" }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


