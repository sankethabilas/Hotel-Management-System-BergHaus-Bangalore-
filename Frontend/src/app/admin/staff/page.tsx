export default function AdminStaffPage() {
  const staff = [
    { name: "Anita Rao", role: "Front Desk", status: "Active" },
    { name: "Rahul Verma", role: "Housekeeping", status: "Active" },
    { name: "Priya Singh", role: "Chef", status: "On Leave" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff</h1>
        <p className="text-sm text-gray-600">Quick view with mock data</p>
      </div>
      <div className="admin-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((s) => (
              <tr key={s.name}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.role}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="admin-chip" style={{ backgroundColor: s.status === "Active" ? "#fee3b3" : "#ffc973" }}>
                    {s.status}
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


