import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';
const guests = [{
  id: 1,
  name: 'Robert Davis',
  email: 'robert.davis@example.com',
  tier: 'Platinum',
  assigned: true
}, {
  id: 2,
  name: 'Jennifer Adams',
  email: 'jennifer.adams@example.com',
  tier: 'Gold',
  assigned: true
}, {
  id: 3,
  name: 'Thomas Wilson',
  email: 'thomas.wilson@example.com',
  tier: 'Gold',
  assigned: false
}, {
  id: 4,
  name: 'Patricia Moore',
  email: 'patricia.moore@example.com',
  tier: 'Silver',
  assigned: true
}, {
  id: 5,
  name: 'Michael Johnson',
  email: 'michael.johnson@example.com',
  tier: 'Silver',
  assigned: false
}, {
  id: 6,
  name: 'Elizabeth Brown',
  email: 'elizabeth.brown@example.com',
  tier: 'Bronze',
  assigned: false
}, {
  id: 7,
  name: 'William Taylor',
  email: 'william.taylor@example.com',
  tier: 'Bronze',
  assigned: false
}];
const OfferAssignment = ({
  offer,
  onSubmit,
  onCancel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuests, setSelectedGuests] = useState(guests.filter(guest => guest.assigned).map(guest => guest.id));
  const [filter, setFilter] = useState('all'); // all, platinum, gold, silver, bronze, assigned
  const handleSelectAll = () => {
    const filteredGuestIds = filteredGuests.map(guest => guest.id);
    if (filteredGuestIds.every(id => selectedGuests.includes(id))) {
      // If all filtered guests are selected, deselect them
      setSelectedGuests(prev => prev.filter(id => !filteredGuestIds.includes(id)));
    } else {
      // Otherwise select all filtered guests
      setSelectedGuests(prev => {
        const newSelected = [...prev];
        filteredGuestIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };
  const handleSelectGuest = guestId => {
    setSelectedGuests(prev => {
      if (prev.includes(guestId)) {
        return prev.filter(id => id !== guestId);
      } else {
        return [...prev, guestId];
      }
    });
  };
  const filteredGuests = guests.filter(guest => {
    if (filter === 'platinum') return guest.tier === 'Platinum';
    if (filter === 'gold') return guest.tier === 'Gold';
    if (filter === 'silver') return guest.tier === 'Silver';
    if (filter === 'bronze') return guest.tier === 'Bronze';
    if (filter === 'assigned') return selectedGuests.includes(guest.id);
    return true;
  }).filter(guest => guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || guest.email.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Assign Offer: {offer.name}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select the guests to whom you want to assign this offer
        </p>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 mb-6">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm" placeholder="Search guests" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Guests</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="assigned">Selected</option>
            </select>
            <button type="button" onClick={handleSelectAll} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
              {filteredGuests.every(guest => selectedGuests.includes(guest.id)) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input type="checkbox" className="focus:ring-gold h-4 w-4 text-navy-blue border-gray-300 rounded" checked={filteredGuests.length > 0 && filteredGuests.every(guest => selectedGuests.includes(guest.id))} onChange={handleSelectAll} />
                  </div>
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.map(guest => <tr key={guest.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input type="checkbox" className="focus:ring-gold h-4 w-4 text-navy-blue border-gray-300 rounded" checked={selectedGuests.includes(guest.id)} onChange={() => handleSelectGuest(guest.id)} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {guest.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {guest.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {guest.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${guest.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' : guest.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : guest.tier === 'Silver' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800'}`}>
                      {guest.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.assigned ? 'Already assigned' : 'Not assigned'}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
        {filteredGuests.length === 0 && <div className="py-12 text-center">
            <p className="text-gray-500">
              No guests found matching your criteria.
            </p>
          </div>}
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Cancel
          </button>
          <button type="button" onClick={onSubmit} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Assign to {selectedGuests.length} Guests
          </button>
        </div>
      </div>
    </div>;
};
export default OfferAssignment;