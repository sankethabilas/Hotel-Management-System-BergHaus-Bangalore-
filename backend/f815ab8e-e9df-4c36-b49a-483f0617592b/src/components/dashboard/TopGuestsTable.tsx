import React from 'react';
const guestData = [{
  id: 1,
  name: 'Robert Davis',
  visits: 12,
  spent: '$8,450',
  loyaltyTier: 'Platinum',
  points: 24500
}, {
  id: 2,
  name: 'Jennifer Adams',
  visits: 8,
  spent: '$5,280',
  loyaltyTier: 'Gold',
  points: 12800
}, {
  id: 3,
  name: 'Thomas Wilson',
  visits: 6,
  spent: '$3,900',
  loyaltyTier: 'Gold',
  points: 9600
}, {
  id: 4,
  name: 'Patricia Moore',
  visits: 5,
  spent: '$2,850',
  loyaltyTier: 'Silver',
  points: 7200
}];
const TopGuestsTable = () => {
  return <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Guests</h2>
        <a href="/guests" className="text-navy-blue hover:text-navy-blue-dark text-sm font-medium">
          View all
        </a>
      </div>
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
                Total Spent
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
            {guestData.map(guest => <tr key={guest.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {guest.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {guest.visits}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {guest.spent}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${guest.loyaltyTier === 'Platinum' ? 'bg-purple-100 text-purple-800' : guest.loyaltyTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {guest.loyaltyTier}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {guest.points.toLocaleString()}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};
export default TopGuestsTable;