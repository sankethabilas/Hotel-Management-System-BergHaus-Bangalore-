'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Coffee, 
  Shield, 
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  User,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface BookingData {
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  pricePerNight: number;
  totalPrice: number;
  tax: number;
  finalPrice: number;
  amenities: string[];
  description: string;
  images: string[];
}

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  idNumber: string;
  idType: 'passport' | 'national_id' | 'driving_license';
  specialRequests: string;
  arrivalTime: string;
  isMainGuest: boolean;
  isBusinessTravel: boolean;
  marketingConsent: boolean;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Sri Lanka',
    idNumber: '',
    idType: 'passport',
    specialRequests: '',
    arrivalTime: '',
    isMainGuest: true,
    isBusinessTravel: false,
    marketingConsent: false
  });
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Get booking data from URL params or localStorage
    const bookingInfo = searchParams?.get('booking');
    if (bookingInfo) {
      try {
        const parsed = JSON.parse(decodeURIComponent(bookingInfo));
        setBookingData(parsed);
      } catch (error) {
        console.error('Error parsing booking data:', error);
        toast({
          title: "Error",
          description: "Invalid booking data. Please try again.",
          variant: "destructive",
        });
        router.push('/availability');
      }
    } else {
      // Try to get from localStorage
      const stored = localStorage.getItem('bookingData');
      if (stored) {
        setBookingData(JSON.parse(stored));
      } else {
        router.push('/availability');
      }
    }
  }, [searchParams, router, toast]);

  // Auto-populate guest details when user data is available
  useEffect(() => {
    if (user) {
      setGuestDetails(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        country: user.address?.country || prev.country || 'Sri Lanka',
        idType: user.idDetails?.idType || prev.idType,
        idNumber: user.idDetails?.idNumber || prev.idNumber
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof GuestDetails, value: string | boolean) => {
    setGuestDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompleteBooking = async () => {
    if (!bookingData) return;

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'idNumber'];
    const missingFields = requiredFields.filter(field => !guestDetails[field as keyof GuestDetails]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { bookingAPI } = await import('@/lib/api');
      
      const bookingPayload = {
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children,
        guestDetails,
        specialRequests: guestDetails.specialRequests
      };
      
      console.log('Sending booking data:', bookingPayload);
      
      const response = await bookingAPI.createBooking(bookingPayload);

      if (!response.success) {
        throw new Error(response.message || 'Booking failed');
      }

      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully confirmed. You will receive a confirmation email shortly.",
      });

      // Refresh user data to get updated ID details
      await refreshUser();

      // Store booking data for success page
      const successData = {
        bookingReference: response.data?.reservation?.bookingReference,
        reservationId: response.data?.reservation?.id,
        ...response.data?.reservation
      };
      localStorage.setItem('bookingSuccessData', JSON.stringify(successData));
      
      // Clear booking data from localStorage
      localStorage.removeItem('bookingData');
      
      // Redirect to booking success page
      router.push('/booking/success');
      
    } catch (error: any) {
      console.error('Booking error:', error);
      
      let errorMessage = "There was an error processing your booking. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hms-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hms-primary text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-hms-primary">Your Selection</span>
            </div>
            <div className="w-16 h-1 bg-hms-primary"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hms-primary text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-hms-primary">Your Details</span>
            </div>
            <div className="w-16 h-1 bg-hms-primary"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hms-primary text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <span className="text-sm font-medium text-hms-primary">Complete Booking</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Information */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="h-64 bg-gradient-to-r from-hms-primary to-hms-secondary flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">HMS Hotel</h2>
                    <p className="text-white/80">Premium Accommodation</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-hms-primary">
                    <Star className="w-4 h-4 mr-1" />
                    4.8 Excellent
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">HMS Hotel</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Colombo, Sri Lanka</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-semibold">4.8</span>
                    </div>
                    <p className="text-sm text-gray-500">Excellent - 127 reviews</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center">
                    <Wifi className="w-3 h-3 mr-1" />
                    Free WiFi
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    <Car className="w-3 h-3 mr-1" />
                    Parking
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    <Coffee className="w-3 h-3 mr-1" />
                    Breakfast
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Your Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Check-in</Label>
                    <p className="font-semibold">{new Date(bookingData.checkIn).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Check-out</Label>
                    <p className="font-semibold">{new Date(bookingData.checkOut).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Length of stay</Label>
                    <p className="font-semibold">{bookingData.nights} night{bookingData.nights > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Guests</Label>
                    <p className="font-semibold">{bookingData.adults} adult{bookingData.adults > 1 ? 's' : ''}{bookingData.children > 0 ? `, ${bookingData.children} child${bookingData.children > 1 ? 'ren' : ''}` : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle>{bookingData.roomType} Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Room Number</span>
                    <span className="font-semibold">{bookingData.roomNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price per night</span>
                    <span className="font-semibold">LKR {bookingData.pricePerNight.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total nights</span>
                    <span className="font-semibold">{bookingData.nights}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">LKR {bookingData.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-semibold">LKR {bookingData.tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-hms-primary">LKR {bookingData.finalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800">Important Information</h4>
                    <ul className="text-sm text-orange-700 mt-2 space-y-1">
                      <li>• No payment required today - pay at the property</li>
                      <li>• Free cancellation up to 24 hours before check-in</li>
                      <li>• Check-in time: 2:00 PM - 10:00 PM</li>
                      <li>• Check-out time: 11:00 AM</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Guest Details Form */}
          <div className="space-y-6">
            {/* Guest Details Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Guest Details
                  </CardTitle>
                  {user && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGuestDetails(prev => ({
                          ...prev,
                          firstName: user.firstName || prev.firstName,
                          lastName: user.lastName || prev.lastName,
                          email: user.email || prev.email,
                          phone: user.phone || prev.phone,
                          country: user.address?.country || prev.country || 'Sri Lanka',
                          idType: user.idDetails?.idType || prev.idType,
                          idNumber: user.idDetails?.idNumber || prev.idNumber
                        }));
                        toast({
                          title: "Profile Data Loaded",
                          description: "Your profile information has been filled in automatically.",
                        });
                      }}
                      className="text-xs"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Fill from Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={guestDetails.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={guestDetails.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Confirmation email will be sent to this address</p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={guestDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country/Region *</Label>
                  <Select value={guestDetails.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idType">ID Type *</Label>
                  <Select value={guestDetails.idType} onValueChange={(value: 'passport' | 'national_id' | 'driving_license') => handleInputChange('idType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idNumber">ID/Passport Number *</Label>
                  <Input
                    id="idNumber"
                    value={guestDetails.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    placeholder={`Enter ${guestDetails.idType.replace('_', ' ')} number`}
                  />
                </div>

                <div>
                  <Label htmlFor="arrivalTime">Estimated Arrival Time</Label>
                  <Select value={guestDetails.arrivalTime} onValueChange={(value) => handleInputChange('arrivalTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select arrival time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                      <SelectItem value="19:00">7:00 PM</SelectItem>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                      <SelectItem value="22:00">10:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={guestDetails.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isMainGuest"
                      checked={guestDetails.isMainGuest}
                      onCheckedChange={(checked) => handleInputChange('isMainGuest', checked as boolean)}
                    />
                    <Label htmlFor="isMainGuest" className="text-sm">I am the main guest</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBusinessTravel"
                      checked={guestDetails.isBusinessTravel}
                      onCheckedChange={(checked) => handleInputChange('isBusinessTravel', checked as boolean)}
                    />
                    <Label htmlFor="isBusinessTravel" className="text-sm">This is business travel</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={guestDetails.marketingConsent}
                      onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
                    />
                    <Label htmlFor="marketingConsent" className="text-sm">I agree to receive marketing emails</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">No Payment Required Today</h4>
                    <p className="text-sm text-green-700 mt-1">
                      You'll pay directly at the property when you arrive. No credit card needed for booking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complete Booking Button */}
            <Button
              onClick={handleCompleteBooking}
              disabled={loading}
              className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white py-3 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Booking...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Complete Booking
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By completing this booking, you agree to our terms and conditions and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
