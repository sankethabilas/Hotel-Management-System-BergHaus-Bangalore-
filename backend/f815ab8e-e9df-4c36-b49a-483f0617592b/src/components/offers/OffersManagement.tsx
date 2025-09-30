import React, { useState } from 'react';
import OffersList from './OffersList';
import OfferForm from './OfferForm';
import OfferAssignment from './OfferAssignment';
const OffersManagement = () => {
  const [view, setView] = useState('list'); // list, form, assign
  const [selectedOffer, setSelectedOffer] = useState(null);
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Offers & Discounts</h1>
        <div className="flex space-x-3">
          <button onClick={() => {
          setView('form');
          setSelectedOffer(null);
        }} className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
            Create New Offer
          </button>
        </div>
      </div>
      {view === 'list' && <OffersList onCreateOffer={() => {
      setView('form');
      setSelectedOffer(null);
    }} onEditOffer={offer => {
      setSelectedOffer(offer);
      setView('form');
    }} onAssignOffer={offer => {
      setSelectedOffer(offer);
      setView('assign');
    }} />}
      {view === 'form' && <OfferForm offer={selectedOffer} onSubmit={() => setView('list')} onCancel={() => setView('list')} />}
      {view === 'assign' && selectedOffer && <OfferAssignment offer={selectedOffer} onSubmit={() => setView('list')} onCancel={() => setView('list')} />}
    </div>;
};
export default OffersManagement;