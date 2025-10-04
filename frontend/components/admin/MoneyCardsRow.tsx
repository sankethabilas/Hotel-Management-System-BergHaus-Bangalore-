// components/admin/MoneyCardsRow.tsx
interface MoneyCardsRowProps {
  currentMoneyAvailable: number;
  totalInventoryValue: number;
  daysLeftToMonthEnd: number;
}

export default function MoneyCardsRow({
  currentMoneyAvailable,
  totalInventoryValue,
  daysLeftToMonthEnd,
}: MoneyCardsRowProps) {
  const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const moneyCards = [
    {
      title: "Available Money",
      value: `LKR ${fmt(currentMoneyAvailable)}`,
      icon: "💰",
      color: "bg-emerald-500",
      trend: "+5.2%",
    },
    {
      title: "Inventory Value",
      value: `LKR ${fmt(totalInventoryValue)}`,
      icon: "📊",
      color: "bg-blue-500",
      trend: "+2.1%",
    },
    {
      title: "Days to Month End",
      value: daysLeftToMonthEnd,
      icon: "📅",
      color: "bg-orange-500",
      trend: null,
    },
    {
      title: "Budget Status",
      value: "On Track",
      icon: "✅",
      color: "bg-green-500",
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {moneyCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`${card.color} rounded-lg p-2 sm:p-3 text-white text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300`}
              >
                {card.icon}
              </div>
              {card.trend && (
                <div className="text-xs sm:text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                  {card.trend}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
                {card.title}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
