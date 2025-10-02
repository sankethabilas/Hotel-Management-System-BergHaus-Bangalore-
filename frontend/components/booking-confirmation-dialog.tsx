'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Bed, 
  CreditCard,
  AlertCircle,
  Clock
} from 'lucide-react';

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingData: {
    roomType: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
    totalPrice: number;
    finalPrice: number;
    tax: number;
  };
  loading?: boolean;
}

export function BookingConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  bookingData,
  loading = false
}: BookingConfirmationDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Confirm Your Booking
          </DialogTitle>
          <DialogDescription>
            Please review your booking details before confirming your reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Room Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="font-semibold">{bookingData.roomType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Number</p>
                <p className="font-semibold">{bookingData.roomNumber}</p>
              </div>
            </div>
          </div>

          {/* Dates and Guests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dates
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Check-in:</span>
                  <span className="font-medium">{formatDate(bookingData.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Check-out:</span>
                  <span className="font-medium">{formatDate(bookingData.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">{bookingData.nights} night{bookingData.nights > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guests
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Adults:</span>
                  <span className="font-medium">{bookingData.adults}</span>
                </div>
                {bookingData.children > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Children:</span>
                    <span className="font-medium">{bookingData.children}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pricing Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal ({bookingData.nights} nights):</span>
                <span className="font-medium">LKR {bookingData.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax (10%):</span>
                <span className="font-medium">LKR {bookingData.tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-hms-primary">LKR {bookingData.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">Important Information</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• No payment required today - pay at the property</li>
                  <li>• Free cancellation up to 24 hours before check-in</li>
                  <li>• Check-in time: 2:00 PM - 10:00 PM</li>
                  <li>• Check-out time: 11:00 AM</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800">Cancellation Policy</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You can cancel your booking free of charge up to 24 hours before your check-in date. 
                  After this period, cancellation fees may apply.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Review Details
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto bg-hms-primary hover:bg-hms-primary/90"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
