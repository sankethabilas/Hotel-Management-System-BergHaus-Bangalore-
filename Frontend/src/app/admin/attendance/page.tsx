export default function AdminAttendancePage() {
  const rows = [
    { date: "2025-10-01", present: 44, absent: 3 },
    { date: "2025-10-02", present: 45, absent: 2 },
    { date: "2025-10-03", present: 46, absent: 1 },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff Attendance</h1>
        <p className="text-sm text-gray-600">Daily roll-up (mock)</p>
      </div>
      <div className="admin-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.date}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.date}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.present}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.absent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


