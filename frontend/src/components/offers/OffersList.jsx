import React, { useState } from 'react';
import { SearchIcon, FilterIcon, EditIcon, UsersIcon, TrashIcon } from 'lucide-react';

const OffersList = ({
  offers = [],
  loading = false,
  error = null,
  onCreateOffer,
  onEditOffer,
  onDeleteOffer,
  onAssignOffer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const filteredOffers = offers.filter(offer => {
    if (!offer) return false; // Filter out null/undefined offers
    if (filter === 'active') return offer.status === 'active';
    if (filter === 'inactive') return offer.status === 'inactive';
    return true;
  }).filter(offer => {
    if (!offer) return false; // Filter out null/undefined offers
    const title = offer.title || '';
    const description = offer.description || '';
    const search = searchTerm.toLowerCase();
    return title.toLowerCase().includes(search) || description.toLowerCase().includes(search);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDiscount = (offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}%`;
    } else if (offer.discountType === 'fixed') {
      return `$${offer.discountValue}`;
    } else {
      return 'Special Offer';
    }
  };
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-blue"></div>
          <span className="ml-3 text-gray-600">Loading offers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={onCreateOffer} 
            className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm"
          >
            Create First Offer
          </button>
        </div>
      </div>
    );
  }

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
        {filteredOffers.map(offer => <div key={offer._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {offer?.title || 'Untitled Offer'}
                </h3>
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {offer.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{offer?.description || 'No description'}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDiscount(offer)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {offer?.discountType || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid From</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(offer?.validFrom)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid Until</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(offer?.validUntil)}
                  </p>
                </div>
              </div>
              {offer.minStay && (
                <div className="mt-4 text-xs text-gray-500">
                  Min Stay: {offer.minStay} nights
                  {offer.maxStay && ` | Max Stay: ${offer.maxStay} nights`}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button 
                  onClick={() => onEditOffer(offer)} 
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  title="Edit Offer"
                >
                  <EditIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onAssignOffer(offer)} 
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  title="Assign to Guests"
                >
                  <UsersIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onDeleteOffer(offer._id)} 
                  className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100"
                  title="Delete Offer"
                >
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
