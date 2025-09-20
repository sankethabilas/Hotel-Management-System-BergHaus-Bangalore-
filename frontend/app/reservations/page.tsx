'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Calendar,
  Users, 
  Bed, 
  Mountain, 
  Star,
  CheckCircle,
  Clock,
  CreditCard,
  Gift,
  AlertCircle,
  Minus,
  Plus,
  ArrowRight,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const roomTypes = [
  {
    id: '1',
    name: 'Double Room with Mountain View',
    description: 'Spacious double room with stunning mountain views, extra-large double bed, and modern amenities.',
    image: '/IMG-20250815-WA0007.jpg',
    bedType: '1 extra-large double bed',
    maxPersons: 2,
    originalPrice: 13608,
    currentPrice: 10478,
    discount: 23,
    available: 1,
    amenities: [
      'Balcony', 'Garden view', 'Mountain view', 'Patio', 'Ensuite bathroom', 
      'Flat-screen TV', 'Terrace', 'Free toiletries', 'Shower', 'Safety deposit box', 
      'Toilet', 'Sofa', 'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 
      'Private entrance', 'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Upper floors accessible by stairs only', 
      'Clothes rack', 'Toilet paper', 'Books, DVDs, or music for children'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  },
  {
    id: '2',
    name: 'Family Room with Mountain View',
    description: 'Perfect for families with bunk bed and large double bed, featuring mountain views and family amenities.',
    image: '/IMG-20250815-WA0008.jpg',
    bedType: '1 bunk bed and 1 large double bed',
    maxPersons: 4,
    originalPrice: 16632,
    currentPrice: 12807,
    discount: 23,
    available: 1,
    amenities: [
      'Balcony', 'Garden view', 'Mountain view', 'Patio', 'Ensuite bathroom', 
      'Flat-screen TV', 'Terrace', 'Free toiletries', 'Shower', 'Safety deposit box', 
      'Toilet', 'Sofa', 'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 
      'Private entrance', 'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Clothes rack', 'Toilet paper', 
      'Books, DVDs, or music for children'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  },
  {
    id: '3',
    name: 'Double or Twin Room',
    description: 'Flexible room configuration with two futon beds, mountain views, and outdoor spaces.',
    image: '/IMG-20250815-WA0009.jpg',
    bedType: '2 futon beds',
    maxPersons: 2,
    originalPrice: 13608,
    currentPrice: 10478,
    discount: 23,
    available: 1,
    amenities: [
      'Balcony', 'Garden view', 'Mountain view', 'Patio', 'Ensuite bathroom', 
      'Terrace', 'Free toiletries', 'Shower', 'Safety deposit box', 'Toilet', 
      'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 'Private entrance', 
      'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Clothes rack', 'Toilet paper'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  },
  {
    id: '4',
    name: 'Single Room with Mountain View',
    description: 'Perfect for solo travelers with large double bed and all the amenities you need.',
    image: '/IMG-20250815-WA0010.jpg',
    bedType: '1 large double bed',
    maxPersons: 1,
    originalPrice: 12247,
    currentPrice: 9432,
    discount: 23,
    available: 1,
    amenities: [
      'Mountain View', 'Single Occupancy', 'Large Double Bed', 'Balcony', 'Patio', 'Terrace',
      'Ensuite bathroom', 'Free toiletries', 'Shower', 'Safety deposit box', 'Toilet', 
      'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 'Private entrance', 
      'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Clothes rack', 'Toilet paper'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  }
];

export default function ReservationsPage() {
  const [selectedRooms, setSelectedRooms] = useState<{[key: string]: number}>({});
  const [checkIn, setCheckIn] = useState('2024-09-21');
  const [checkOut, setCheckOut] = useState('2024-09-22');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const updateRoomSelection = (roomId: string, change: number) => {
    setSelectedRooms(prev => ({
      ...prev,
      [roomId]: Math.max(0, (prev[roomId] || 0) + change)
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedRooms).forEach(([roomId, quantity]) => {
      if (quantity > 0) {
        const room = roomTypes.find(r => r.id === roomId);
        if (room) {
          total += room.currentPrice * quantity;
        }
      }
    });
    return total;
  };

  const getTotalNights = () => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Make a Reservation</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Book your stay at Berghaus Bungalow and experience the beauty of Ella, Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Availability Calendar & Search */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-hms-primary to-hms-secondary text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Calendar className="w-6 h-6" />
                <span>Check Availability & Book</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                <div>
                  <Label htmlFor="checkin" className="text-hms-primary font-semibold">Check-in Date</Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-2 border-hms-primary focus:border-hms-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="checkout" className="text-hms-primary font-semibold">Check-out Date</Label>
                  <Input
                    id="checkout"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-2 border-hms-primary focus:border-hms-secondary"
                  />
                </div>
                <div>
                  <Label className="text-hms-primary font-semibold">Adults</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAdults(adults + 1)}
                      className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-hms-primary font-semibold">Children</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{children}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setChildren(children + 1)}
                      className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Button 
                    size="lg" 
                    className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white px-6 py-3 font-semibold"
                  >
                    Search Rooms
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Availability Notice */}
      <section className="py-6 bg-yellow-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">
              Limited supply in Ella for your dates: 26 hotels like this are already unavailable on our site
            </p>
          </div>
        </div>
      </section>

      {/* Availability Table */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-hms-primary">Availability</h2>
              <p className="text-gray-600">Prices converted to LKR</p>
            </div>
            <Badge className="bg-hms-accent text-hms-primary font-semibold">
              We Price Match
            </Badge>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room type</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Number of guests</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Today's price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Your choices</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Select rooms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {roomTypes.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                      {/* Room Type Column */}
                      <td className="px-6 py-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-hms-primary text-lg">{room.name}</h3>
                              {room.available === 1 && (
                                <Badge className="bg-red-500 text-white text-xs mt-1">
                                  We have {room.available} left
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-1 mb-2">
                              <Bed className="w-4 h-4" />
                              <span>{room.bedType}</span>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 7).map((amenity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                            <div className="space-y-1">
                              {room.amenities.slice(7, 15).map((amenity, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span>{amenity}</span>
                                </div>
                              ))}
                              {room.amenities.length > 15 && (
                                <div className="text-xs text-gray-500">
                                  +{room.amenities.length - 15} more amenities
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Number of Guests Column */}
                      <td className="px-6 py-6 text-center">
                        <div className="flex justify-center">
                          <div className="flex space-x-1">
                            {Array.from({ length: room.maxPersons }, (_, i) => (
                              <div key={i} className="w-6 h-6 bg-hms-primary/20 rounded-full flex items-center justify-center">
                                <Users className="w-3 h-3 text-hms-primary" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Today's Price Column */}
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-hms-primary">
                              {formatPrice(room.currentPrice)}
                            </span>
                            <Badge className="bg-green-500 text-white text-xs">
                              {room.discount}% off
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Includes taxes and charges</p>
                          <Badge className="bg-hms-accent text-hms-primary text-xs">
                            Genius
                          </Badge>
                        </div>
                      </td>

                      {/* Your Choices Column */}
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">Free breakfast</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Total cost to cancel</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">No prepayment needed - pay at the property</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">No credit card needed</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">12% Genius discount applied to the price before taxes and charges</span>
                          </div>
                        </div>
                      </td>

                      {/* Select Rooms Column */}
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateRoomSelection(room.id, -1)}
                            disabled={!selectedRooms[room.id]}
                            className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white w-8 h-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {selectedRooms[room.id] || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateRoomSelection(room.id, 1)}
                            disabled={selectedRooms[room.id] >= room.available}
                            className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white w-8 h-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reservation Button */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="bg-hms-primary hover:bg-hms-primary/90 text-white px-12 py-4 text-lg font-semibold shadow-lg"
            >
              I'll reserve
            </Button>
            <p className="text-sm text-gray-600 mt-2">It only takes 2 minutes</p>
            <p className="text-sm text-gray-600">You won't be charged yet</p>
          </div>

          {/* Footer Messages */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Limited supply in Ella for your dates: 26 hotels like this are already unavailable on our site
              </span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                No credit card needed All options are bookable without a credit card.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Summary */}
      {Object.values(selectedRooms).some(count => count > 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-hms-primary to-hms-secondary text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Booking Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Reservation Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Check-in:</span>
                        <span className="font-medium">{checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-out:</span>
                        <span className="font-medium">{checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span className="font-medium">{getTotalNights()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guests:</span>
                        <span className="font-medium">{adults} adults, {children} children</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Rooms */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Selected Rooms</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedRooms).map(([roomId, quantity]) => {
                        if (quantity === 0) return null;
                        const room = roomTypes.find(r => r.id === roomId);
                        if (!room) return null;
                        return (
                          <div key={roomId} className="flex justify-between">
                            <span>{room.name} x{quantity}</span>
                            <span className="font-medium">{formatPrice(room.currentPrice * quantity)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total:</span>
                          <span>{formatPrice(calculateTotal())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <p className="text-blue-100 mb-6">
                    It only takes 2 minutes. You won't be charged yet.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-white text-hms-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                    >
                      <CreditCard className="mr-2 w-5 h-5" />
                      Complete Reservation
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white text-white hover:bg-white hover:text-hms-primary px-8 py-4 text-lg font-semibold"
                    >
                      <Gift className="mr-2 w-5 h-5" />
                      No Credit Card Needed
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-hms-primary mb-4">Need Help with Your Reservation?</h2>
            <p className="text-lg text-gray-600">Our friendly staff is here to assist you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <Phone className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">Call Us</h3>
                <p className="text-gray-600">+94 XX XXX XXXX</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">Email Us</h3>
                <p className="text-gray-600">info@berghausbungalow.com</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">Visit Us</h3>
                <p className="text-gray-600">No 80, Netherville Road, Ella, Sri Lanka</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
