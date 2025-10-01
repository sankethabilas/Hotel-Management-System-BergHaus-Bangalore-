// components/admin/StatCardsRow.jsx
export default function StatCardsRow({
  totalProducts,
  stocksBelowFive,
  totalSuppliers,
  staffRequests,
}) {
  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: "📦",
      color: "bg-blue-500",
    },
    {
      title: "Stocks below 5",
      value: stocksBelowFive,
      icon: "⚠️",
      color: "bg-red-500",
    },
    {
      title: "Total Suppliers",
      value: totalSuppliers,
      icon: "🏢",
      color: "bg-green-500",
    },
    {
      title: "Staff Requests",
      value: staffRequests,
      icon: "👥",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div
                className={`${card.color} rounded-full p-2 sm:p-3 text-white text-lg sm:text-xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
          <div className={`h-1 ${card.color}`}></div>
        </div>
      ))}
    </div>
  );
}
