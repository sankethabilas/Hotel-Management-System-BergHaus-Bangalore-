export default function AdminPaymentsPage() {
  const payments = [
    { name: "Anita Rao", month: "Sep 2025", amount: "₹ 38,000", status: "Paid" },
    { name: "Rahul Verma", month: "Sep 2025", amount: "₹ 32,500", status: "Pending" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff Payments</h1>
        <p className="text-sm text-gray-600">Monthly payroll overview (mock)</p>
      </div>
      <div className="admin-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.name + p.month}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{p.month}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{p.amount}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="admin-chip" style={{ backgroundColor: p.status === "Paid" ? "#fee3b3" : "#ffc973" }}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


