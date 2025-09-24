// components/admin/MoneyCardsRow.jsx
export default function MoneyCardsRow({ currentMoneyAvailable, totalInventoryValue, daysLeftToMonthEnd }) {
  const fmt = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-4 gap-4 mt-4">
      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Currently Available Money</div>
        <div className="text-2xl font-bold">LKR {fmt(currentMoneyAvailable)}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Total Inventory Value</div>
        <div className="text-2xl font-bold">LKR {fmt(totalInventoryValue)}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Days to End of Month</div>
        <div className="text-2xl font-bold">{daysLeftToMonthEnd}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500">Reserved / Other</div>
        <div className="text-2xl font-bold">—</div>
      </div>
    </div>
  );
}
