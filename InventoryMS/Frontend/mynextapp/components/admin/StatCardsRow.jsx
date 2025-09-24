// components/admin/StatCardsRow.jsx
export default function StatCardsRow({ totalProducts, stocksBelowFive, totalSuppliers, staffRequests }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Total Products</div>
        <div className="text-2xl font-bold">{totalProducts}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Stocks below 5</div>
        <div className="text-2xl font-bold">{stocksBelowFive}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Total Suppliers</div>
        <div className="text-2xl font-bold">{totalSuppliers}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Staff Requests</div>
        <div className="text-2xl font-bold">{staffRequests}</div>
      </div>
    </div>
  );
}
