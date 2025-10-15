import React from 'react';

interface GuestItem {
  id: string;
  name: string;
  visits: number;
  loyaltyTier: string;
  points: number;
}

interface TopGuestsTableProps {
  guestsData?: GuestItem[];
}

const TopGuestsTable: React.FC<TopGuestsTableProps> = ({ guestsData = [] }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Guests</h2>
        <a href="/guests" className="text-navy-blue hover:text-navy-blue-dark text-sm font-medium">
          View all
        </a>
      </div>
      {guestsData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No guest data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guestsData.map(guest => (
                <tr key={guest.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {guest.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {guest.visits}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        guest.loyaltyTier === 'Platinum'
                          ? 'bg-purple-100 text-purple-800'
                          : guest.loyaltyTier === 'Gold'
                          ? 'bg-yellow-100 text-yellow-800'
                          : guest.loyaltyTier === 'Silver'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {guest.loyaltyTier}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {guest.points.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopGuestsTable;
