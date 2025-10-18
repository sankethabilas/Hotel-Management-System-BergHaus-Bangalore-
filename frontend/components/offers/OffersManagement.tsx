'use client';

import React, { useEffect, useState } from 'react';
import OffersList from './OffersList';
import OfferForm from './OfferForm';
import OfferAssignment from './OfferAssignment';
import offerService from '@/services/offerService';

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
  applicableDays?: string[];
  applicableRooms?: string[];
  termsConditions?: string;
  status?: string;
}

type ViewType = 'list' | 'form' | 'assign';

const OffersManagement: React.FC = () => {
  const [view, setView] = useState<ViewType>('list');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await offerService.getAllOffers();
      setOffers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to load offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (offerData: any) => {
    try {
      await offerService.createOffer(offerData);
      await fetchOffers();
      setView('list');
      setSelectedOffer(null);
      alert('Offer created successfully!');
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create offer. Please try again.');
      throw error;
    }
  };

  const handleUpdateOffer = async (id: string, offerData: any) => {
    try {
      await offerService.updateOffer(id, offerData);
      await fetchOffers();
      setView('list');
      setSelectedOffer(null);
      alert('Offer updated successfully!');
    } catch (error) {
      console.error('Error updating offer:', error);
      alert('Failed to update offer. Please try again.');
      throw error;
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await offerService.deleteOffer(id);
        await fetchOffers();
        alert('Offer deleted successfully!');
      } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Failed to delete offer. Please try again.');
      }
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setView('form');
  };

  const handleAssignOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setView('assign');
  };

  const handleSubmitAssignment = async (
    selectedGuestIds: string[],
    initiallyAssignedIds: string[]
  ) => {
    if (!selectedOffer) return;

    try {
      // Determine which guests need to be assigned and unassigned
      const toAssign = selectedGuestIds.filter(
        id => !initiallyAssignedIds.includes(id)
      );
      const toUnassign = initiallyAssignedIds.filter(
        id => !selectedGuestIds.includes(id)
      );

      // Assign new guests
      for (const guestId of toAssign) {
        await offerService.assignOfferToGuest(guestId, selectedOffer._id);
      }

      // Unassign removed guests
      for (const guestId of toUnassign) {
        await offerService.unassignOfferFromGuest(guestId, selectedOffer._id);
      }

      alert('Offer assignment updated successfully!');
      setView('list');
      setSelectedOffer(null);
    } catch (error) {
      console.error('Error updating offer assignments:', error);
      alert('Failed to update assignments. Please try again.');
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedOffer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchOffers}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <OffersList
          offers={offers}
          onEditOffer={handleEditOffer}
          onDeleteOffer={handleDeleteOffer}
          onAssignOffer={handleAssignOffer}
          onCreateOffer={() => {
            setSelectedOffer(null);
            setView('form');
          }}
        />
      )}

      {view === 'form' && (
        <OfferForm
          offer={selectedOffer}
          onSubmit={
            selectedOffer
              ? (offerData) => handleUpdateOffer(selectedOffer._id, offerData)
              : handleCreateOffer
          }
          onCancel={handleCancel}
        />
      )}

      {view === 'assign' && selectedOffer && (
        <OfferAssignment
          offer={selectedOffer}
          onSubmit={handleSubmitAssignment}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default OffersManagement;
