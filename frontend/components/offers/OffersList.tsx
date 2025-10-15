'use client';

import React, { useState } from 'react';
import { Search, Filter, Edit, Users, Trash2 } from 'lucide-react';

interface Offer {
  _id: string;
  title?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  validFrom?: string;
  validUntil?: string;
  minStay?: number;
  maxStay?: number;
  status?: string;
}

interface OffersListProps {
  offers?: Offer[];
  loading?: boolean;
  error?: string | null;
  onCreateOffer: () => void;
  onEditOffer: (offer: Offer) => void;
  onDeleteOffer: (id: string) => void;
  onAssignOffer: (offer: Offer) => void;
}

const OffersList: React.FC<OffersListProps> = ({
  offers = [],
  loading = false,
  error = null,
  onCreateOffer,
  onEditOffer,
  onDeleteOffer,
  onAssignOffer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, expired
  const [filterType, setFilterType] = useState('all'); // all, percentage, fixed, special

  // Helper to determine actual status including expired
  const getOfferStatus = (offer: Offer): string => {
    if (!offer) return 'inactive';
    const now = new Date();
    const endDate = new Date(offer.validUntil || '');
    if (endDate < now) return 'expired';
    return offer.status || 'inactive';
  };

  const filteredOffers = offers.filter(offer => {
    if (!offer) return false; // Filter out null/undefined offers
    
    // Status filter
    const offerStatus = getOfferStatus(offer);
    if (filterStatus === 'active' && offerStatus !== 'active') return false;
    if (filterStatus === 'inactive' && offerStatus !== 'inactive') return false;
    if (filterStatus === 'expired' && offerStatus !== 'expired') return false;
    
    // Type filter
    if (filterType !== 'all' && offer.discountType !== filterType) return false;
    
    // Search filter
    const title = offer.title || '';
    const description = offer.description || '';
    const search = searchTerm.toLowerCase();
    return title.toLowerCase().includes(search) || description.toLowerCase().includes(search);
  });

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDiscount = (offer: Offer): string => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}%`;
    } else if (offer.discountType === 'fixed') {
      return `₹${offer.discountValue}`;
    } else {
      return 'Special Offer';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
          >
            Create First Offer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="Search offers" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select 
                className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex items-center">
              <select 
                className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="special">Special</option>
              </select>
            </div>
            <button 
              onClick={onCreateOffer} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Create Offer
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredOffers.map(offer => (
          <div key={offer._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {offer?.title || 'Untitled Offer'}
                </h3>
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                  getOfferStatus(offer) === 'active' ? 'bg-green-100 text-green-800' :
                  getOfferStatus(offer) === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getOfferStatus(offer) === 'active' ? 'Active' :
                   getOfferStatus(offer) === 'expired' ? 'Expired' : 'Inactive'}
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
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onAssignOffer(offer)} 
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  title="Assign to Guests"
                >
                  <Users className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onDeleteOffer(offer._id)} 
                  className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100"
                  title="Delete Offer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredOffers.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No offers found matching your criteria.
          </p>
          <button 
            onClick={onCreateOffer} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
          >
            Create New Offer
          </button>
        </div>
      )}
    </div>
  );
};

export default OffersList;
