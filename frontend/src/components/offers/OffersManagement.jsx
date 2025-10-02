import React, { useState, useEffect } from 'react';
import OffersList from './OffersList';
import OfferForm from './OfferForm';
import OfferAssignment from './OfferAssignment';
import { offerService } from '../../services/offerService';

const OffersManagement = () => {
  const [view, setView] = useState('list'); // list, form, assign
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      fetchOffers();
    }
  }, [view]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offerService.getAllOffers();
      setOffers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (offerData) => {
    try {
      setLoading(true);
      setError(null);
      await offerService.createOffer(offerData);
      setView('list');
    } catch (err) {
      setError(err.message);
      alert('Error creating offer: ' + err.message);
      console.error('Error creating offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOffer = async (id, offerData) => {
    try {
      setLoading(true);
      setError(null);
      await offerService.updateOffer(id, offerData);
      setView('list');
    } catch (err) {
      setError(err.message);
      alert('Error updating offer: ' + err.message);
      console.error('Error updating offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await offerService.deleteOffer(id);
      fetchOffers();
    } catch (err) {
      setError(err.message);
      alert('Error deleting offer: ' + err.message);
      console.error('Error deleting offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = (offerData) => {
    if (selectedOffer) {
      handleUpdateOffer(selectedOffer._id, offerData);
    } else {
      handleCreateOffer(offerData);
    }
  };

  const handleAssignOffer = async (selectedGuestIds) => {
    try {
      setLoading(true);
      setError(null);
      // Assign offer to each selected guest
      for (const guestId of selectedGuestIds) {
        await offerService.assignOfferToGuest(guestId, selectedOffer._id);
      }
      alert(`Offer assigned to ${selectedGuestIds.length} guest(s) successfully!`);
      setView('list');
    } catch (err) {
      setError(err.message);
      alert('Error assigning offer: ' + err.message);
      console.error('Error assigning offer:', err);
    } finally {
      setLoading(false);
    }
  };

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Offers & Discounts</h1>
      </div>
      {view === 'list' && <OffersList 
        offers={offers}
        loading={loading}
        error={error}
        onCreateOffer={() => {
          setView('form');
          setSelectedOffer(null);
        }} 
        onEditOffer={offer => {
          setSelectedOffer(offer);
          setView('form');
        }} 
        onDeleteOffer={handleDeleteOffer}
        onAssignOffer={offer => {
          setSelectedOffer(offer);
          setView('assign');
        }} 
      />}
      {view === 'form' && <OfferForm offer={selectedOffer} onSubmit={handleSubmitOffer} onCancel={() => setView('list')} />}
      {view === 'assign' && selectedOffer && <OfferAssignment offer={selectedOffer} onSubmit={handleAssignOffer} onCancel={() => setView('list')} />}
    </div>;
};
export default OffersManagement;
