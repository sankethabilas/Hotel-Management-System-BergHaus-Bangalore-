import React, { useState } from 'react';
import { SearchIcon, FilterIcon, EditIcon, UsersIcon, TrashIcon } from 'lucide-react';
const offers = [{
  id: 1,
  name: 'Summer Escape',
  description: '20% off on all room bookings for stays between June and August',
  discount: '20%',
  type: 'percentage',
  validFrom: '2023-06-01',
  validTo: '2023-08-31',
  status: 'active',
  assignedTo: 145,
  redemptions: 78
}, {
  id: 2,
  name: 'Spa Retreat',
  description: 'Buy one spa treatment, get second 50% off',
  discount: '50% on second',
  type: 'special',
  validFrom: '2023-05-15',
  validTo: '2023-12-31',
  status: 'active',
  assignedTo: 86,
  redemptions: 42
}, {
  id: 3,
  name: 'Loyalty Member Exclusive',
  description: 'Free room upgrade for Gold and Platinum members',
  discount: 'Room upgrade',
  type: 'special',
  validFrom: '2023-01-01',
  validTo: '2023-12-31',
  status: 'active',
  assignedTo: 61,
  redemptions: 29
}, {
  id: 4,
  name: 'Weekend Getaway',
  description: '$50 food & beverage credit on weekend stays',
  discount: '$50 credit',
  type: 'fixed',
  validFrom: '2023-07-01',
  validTo: '2023-09-30',
  status: 'active',
  assignedTo: 112,
  redemptions: 53
}, {
  id: 5,
  name: 'Early Bird Special',
  description: '15% off when booking 60+ days in advance',
  discount: '15%',
  type: 'percentage',
  validFrom: '2023-01-01',
  validTo: '2023-12-31',
  status: 'active',
  assignedTo: 98,
  redemptions: 67
}, {
  id: 6,
  name: 'Winter Holiday',
  description: '25% off stays during December holidays',
  discount: '25%',
  type: 'percentage',
  validFrom: '2023-12-01',
  validTo: '2023-12-31',
  status: 'inactive',
  assignedTo: 0,
  redemptions: 0
}];
const OffersList = ({
  onCreateOffer,
  onEditOffer,
  onAssignOffer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const filteredOffers = offers.filter(offer => {
    if (filter === 'active') return offer.status === 'active';
    if (filter === 'inactive') return offer.status === 'inactive';
    return true;
  }).filter(offer => offer.name.toLowerCase().includes(searchTerm.toLowerCase()) || offer.description.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm" placeholder="Search offers" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Offers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button onClick={onCreateOffer} className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
              Create Offer
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredOffers.map(offer => <div key={offer.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {offer.name}
                </h3>
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {offer.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{offer.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {offer.discount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {offer.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid From</p>
                  <p className="text-sm font-medium text-gray-900">
                    {offer.validFrom}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid To</p>
                  <p className="text-sm font-medium text-gray-900">
                    {offer.validTo}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  <span>Assigned: {offer.assignedTo}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Redemptions: {offer.redemptions}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button onClick={() => onEditOffer(offer)} className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <EditIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onAssignOffer(offer)} className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <UsersIcon className="h-5 w-5" />
                </button>
                <button className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>)}
      </div>
      {filteredOffers.length === 0 && <div className="py-12 text-center">
          <p className="text-gray-500">
            No offers found matching your criteria.
          </p>
          <button onClick={onCreateOffer} className="mt-4 bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
            Create New Offer
          </button>
        </div>}
    </div>;
};
export default OffersList;
