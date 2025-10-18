"use client";

import { Reservation } from '@/services/reservationService';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
  onEdit: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
}

export default function ReservationDetailModal({
  reservation,
  onClose,
  onEdit,
  onCancel
}: ReservationDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'checked-in': { color: 'bg-green-100 text-green-800', label: 'Checked-in' },
      'checked-out': { color: 'bg-gray-100 text-gray-800', label: 'Checked-out' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const paymentConfig = {
      unpaid: { color: 'bg-red-100 text-red-800', label: 'Unpaid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.unpaid;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Reservation Details
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Guest Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{reservation.guestName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{reservation.guestEmail}</p>
                </div>
                {reservation.guestPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{reservation.guestPhone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Guest Count</label>
                  <p className="text-sm text-gray-900">
                    {reservation.guestCount.adults} adults, {reservation.guestCount.children} children
                  </p>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {reservation.rooms.map((room, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Room {room.roomNumber}</p>
                        <p className="text-sm text-gray-500">{room.roomType}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Dates</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-in</label>
                  <p className="text-sm text-gray-900">{formatDate(reservation.checkInDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-out</label>
                  <p className="text-sm text-gray-900">{formatDate(reservation.checkOutDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status and Payment */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Status & Payment</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-500">Reservation Status</label>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  {getPaymentStatusBadge(reservation.paymentStatus)}
                </div>
                {reservation.paymentMethod && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-sm text-gray-900 capitalize">
                      {reservation.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(reservation.totalPrice)}</p>
                </div>
                {reservation.paidAmount > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Paid Amount</label>
                    <p className="text-sm text-gray-900">{formatCurrency(reservation.paidAmount)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {reservation.specialRequests && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{reservation.specialRequests}</p>
                </div>
              </div>
            )}

            {/* Cancellation Info */}
            {reservation.status === 'cancelled' && reservation.cancellationReason && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Details</h4>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-800">{reservation.cancellationReason}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {reservation.notes && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{reservation.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">{formatDateTime(reservation.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDateTime(reservation.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Reservation ID: {reservation.reservationId}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            {reservation.status !== 'cancelled' && reservation.status !== 'checked-out' && (
              <>
                <button
                  onClick={() => {
                    onEdit(reservation);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onCancel(reservation);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
