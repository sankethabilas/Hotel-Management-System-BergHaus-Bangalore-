'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, CreditCard, ArrowLeft, CheckCircle, IdCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  amenities: string[];
  pricePerNight: number;
  pricing: {
    pricePerNight: number;
    totalNights: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface BookingFormProps {
  selectedRooms: Room[];
  searchCriteria: any;
  onBack: () => void;
  onBookingSuccess: (bookingReference: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  selectedRooms,
  searchCriteria,
  onBack,
  onBookingSuccess
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestIdPassport: '',
    paymentMethod: '',
    specialRequests: ''
  });

  // Update form data when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        guestName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        guestEmail: user.email || '',
        guestPhone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.guestName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.guestEmail?.trim() || !/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.guestPhone?.trim() || !/^[+0][\d]{7,14}$/.test(formData.guestPhone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.guestIdPassport?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your ID or Passport number.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.paymentMethod) {
      toast({
        title: "Validation Error",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // For multiple rooms, create separate bookings
      const bookingPromises = selectedRooms.map(room => 
        fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: room._id,
            guestName: formData.guestName,
            guestEmail: formData.guestEmail,
            guestPhone: formData.guestPhone,
            guestIdPassport: formData.guestIdPassport,
            checkInDate: searchCriteria.checkInDate,
            checkOutDate: searchCriteria.checkOutDate,
            numberOfGuests: searchCriteria.guests,
            specialRequests: formData.specialRequests,
            paymentMethod: formData.paymentMethod
          }),
        })
      );

      const responses = await Promise.all(bookingPromises);
      const results = await Promise.all(responses.map(res => res.json()));

      // Check if all bookings were successful
      const failedBookings = results.filter(result => !result.success);
      
      if (failedBookings.length > 0) {
        toast({
          title: "Booking Failed",
          description: `Failed to book ${failedBookings.length} room(s). Please try again.`,
          variant: "destructive"
        });
        return;
      }

      // All bookings successful
      const bookingReferences = results.map(result => result.data.bookingReference);
      
      toast({
        title: "Booking Successful!",
        description: `Your booking${bookingReferences.length > 1 ? 's have' : ' has'} been confirmed.`,
      });

      // Use the first booking reference for navigation
      onBookingSuccess(bookingReferences[0]);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedRooms.reduce((total, room) => total + room.pricing.total, 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selected Rooms */}
            <div>
              <h3 className="font-semibold mb-3">Selected Rooms</h3>
              <div className="space-y-2">
                {selectedRooms.map((room) => (
                  <div key={room._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Room {room.roomNumber}</div>
                      <div className="text-sm text-gray-600">{room.roomType}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${room.pricing.total.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{room.pricing.totalNights} nights</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="font-semibold mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{new Date(searchCriteria.checkInDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{new Date(searchCriteria.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{searchCriteria.guests}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>${calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Guest Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="guestName"
                  type="text"
                  value={formData.guestName || ''}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="guestEmail"
                  type="email"
                  value={formData.guestEmail || ''}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="guestPhone"
                  type="tel"
                  value={formData.guestPhone || ''}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  className="pl-10"
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestIdPassport">ID/Passport Number *</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="guestIdPassport"
                  type="text"
                  value={formData.guestIdPassport || ''}
                  onChange={(e) => handleInputChange('guestIdPassport', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your ID or Passport number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash_on_property">Cash on Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests || ''}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
              maxLength={500}
            />
            <div className="text-sm text-gray-500">
              {(formData.specialRequests || '').length}/500 characters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Room Selection
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Processing Booking...' : `Confirm Booking - Rs ${calculateTotalPrice().toFixed(2)}`}
        </Button>
      </div>

      {/* Terms and Conditions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Terms and Conditions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Free cancellation up to 24 hours before check-in</li>
            <li>• Check-in time: 3:00 PM | Check-out time: 11:00 AM</li>
            <li>• Valid ID required at check-in</li>
            <li>• Additional charges may apply for extra services</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
