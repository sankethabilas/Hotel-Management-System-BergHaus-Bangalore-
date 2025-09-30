import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';
const pointsHistory = [{
  id: 1,
  guest: 'Robert Davis',
  date: '2023-08-15',
  points: 2500,
  type: 'earned',
  description: '5-night stay in Executive Suite'
}, {
  id: 2,
  guest: 'Jennifer Adams',
  date: '2023-08-17',
  points: -1000,
  type: 'redeemed',
  description: 'Spa treatment redemption'
}, {
  id: 3,
  guest: 'Robert Davis',
  date: '2023-08-20',
  points: 500,
  type: 'earned',
  description: 'Restaurant spending'
}, {
  id: 4,
  guest: 'Thomas Wilson',
  date: '2023-08-22',
  points: 1800,
  type: 'earned',
  description: '3-night stay in Deluxe Room'
}, {
  id: 5,
  guest: 'Patricia Moore',
  date: '2023-08-25',
  points: -2000,
  type: 'redeemed',
  description: 'Free night redemption'
}, {
  id: 6,
  guest: 'Jennifer Adams',
  date: '2023-08-28',
  points: 300,
  type: 'earned',
  description: 'Bar spending'
}, {
  id: 7,
  guest: 'Michael Johnson',
  date: '2023-08-30',
  points: 1200,
  type: 'earned',
  description: '2-night stay in Standard Room'
}];
const PointsTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, earned, redeemed
  const filteredHistory = pointsHistory.filter(entry => {
    if (filter === 'earned') return entry.type === 'earned';
    if (filter === 'redeemed') return entry.type === 'redeemed';
    return true;
  }).filter(entry => entry.guest.toLowerCase().includes(searchTerm.toLowerCase()) || entry.description.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-6">
      {/* Form to add points */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Points Transaction
          </h2>
        </div>
        <form className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="guest" className="block text-sm font-medium text-gray-700">
              Select Guest
            </label>
            <select id="guest" name="guest" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" defaultValue="">
              <option value="" disabled>
                Select a guest
              </option>
              <option value="1">Robert Davis (Platinum)</option>
              <option value="2">Jennifer Adams (Gold)</option>
              <option value="3">Thomas Wilson (Gold)</option>
              <option value="4">Patricia Moore (Silver)</option>
              <option value="5">Michael Johnson (Silver)</option>
            </select>
          </div>
          <div>
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
              Transaction Type
            </label>
            <select id="transactionType" name="transactionType" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" defaultValue="earn">
              <option value="earn">Earn Points</option>
              <option value="redeem">Redeem Points</option>
              <option value="adjust">Adjustment</option>
            </select>
          </div>
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700">
              Points Amount
            </label>
            <input type="number" name="points" id="points" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" placeholder="Enter points amount" min="1" />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input type="text" name="description" id="description" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" placeholder="Describe the transaction" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
              Add Transaction
            </button>
          </div>
        </form>
      </div>
      {/* Points History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Points Transaction History
            </h2>
            <div className="flex items-center space-x-3">
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm" placeholder="Search transactions" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Transactions</option>
                <option value="earned">Points Earned</option>
                <option value="redeemed">Points Redeemed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map(transaction => <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.guest}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.points > 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'earned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {transaction.type === 'earned' ? 'Earned' : 'Redeemed'}
                    </span>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium">{filteredHistory.length}</span> of{' '}
              <span className="font-medium">{pointsHistory.length}</span>{' '}
              transactions
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PointsTracker;
