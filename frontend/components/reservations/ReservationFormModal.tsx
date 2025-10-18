"use client";

import { useState, useEffect } from 'react';
import { Reservation } from '@/services/reservationService';

interface ReservationFormModalProps {
  reservation?: Reservation | null;
  onClose: () => void;
  onSubmit: (data: Partial<Reservation>) => void;
}

export default function ReservationFormModal({
  reservation,
  onClose,
  onSubmit
}: ReservationFormModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    roomType: '',
    roomNumber: '',
    totalPrice: 0,
    paymentMethod: 'cash_on_property',
    paymentStatus: 'unpaid',
    specialRequests: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservation) {
      setFormData({
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        guestPhone: reservation.guestPhone || '',
        checkInDate: reservation.checkInDate.split('T')[0],
        checkOutDate: reservation.checkOutDate.split('T')[0],
        adults: reservation.guestCount.adults,
        children: reservation.guestCount.children,
        roomType: reservation.rooms[0]?.roomType || '',
        roomNumber: reservation.rooms[0]?.roomNumber || '',
        totalPrice: reservation.totalPrice,
        paymentMethod: reservation.paymentMethod || 'cash_on_property',
        paymentStatus: reservation.paymentStatus,
        specialRequests: reservation.specialRequests || '',
        notes: reservation.notes || ''
      });
    }
  }, [reservation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Guest email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email address';
    }

    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkIn >= checkOut) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
      
      if (checkIn <= new Date()) {
        newErrors.checkInDate = 'Check-in date must be in the future';
      }
    }

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    if (!formData.roomNumber) {
      newErrors.roomNumber = 'Room number is required';
    }

    if (formData.totalPrice <= 0) {
      newErrors.totalPrice = 'Total price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: {
          adults: formData.adults,
          children: formData.children
        },
        rooms: [{
          roomId: '', // This would be populated from room selection
          roomNumber: formData.roomNumber,
          roomType: formData.roomType
        }],
        totalPrice: formData.totalPrice,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        specialRequests: formData.specialRequests,
        notes: formData.notes
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {reservation ? 'Edit Reservation' : 'Add New Reservation'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.guestName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.guestName && (
                  <p className="mt-1 text-sm text-red-600">{errors.guestName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.guestEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.guestEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.guestEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adults *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.adults}
                  onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.children}
                  onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.checkInDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkInDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkInDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkOutDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkOutDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  value={formData.roomType}
                  onChange={(e) => handleInputChange('roomType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.roomType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Room Type</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="presidential">Presidential</option>
                </select>
                {errors.roomType && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.roomNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalPrice}
                  onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.totalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalPrice}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash_on_property">Cash on Property</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Special Requests and Notes */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Internal notes for staff..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (reservation ? 'Update Reservation' : 'Create Reservation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
