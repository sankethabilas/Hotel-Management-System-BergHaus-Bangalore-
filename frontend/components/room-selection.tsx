'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bed, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Tv, 
  Wind, 
  Bath, 
  Utensils,
  Mountain,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  description: string;
  images: string[];
  nights: number;
  totalPrice: number;
  tax: number;
  finalPrice: number;
}

interface RoomSelectionProps {
  rooms: Room[];
  checkIn: string;
  checkOut: string;
  nights: number;
  onBookingSuccess: () => void;
}

export function RoomSelection({ rooms, checkIn, checkOut, nights, onBookingSuccess }: RoomSelectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0 });
  const [specialRequests, setSpecialRequests] = useState('');
  const [booking, setBooking] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'TV': <Tv className="h-4 w-4" />,
      'Air Conditioning': <Wind className="h-4 w-4" />,
      'Private Bathroom': <Bath className="h-4 w-4" />,
      'Mini Bar': <Utensils className="h-4 w-4" />,
      'Kitchenette': <Coffee className="h-4 w-4" />,
      'Balcony': <Mountain className="h-4 w-4" />,
      'Mountain View': <Mountain className="h-4 w-4" />,
      'Jacuzzi': <Bath className="h-4 w-4" />,
      'Parking': <Car className="h-4 w-4" />,
    };
    return iconMap[amenity] || <CheckCircle className="h-4 w-4" />;
  };

  const getRoomTypeColor = (roomType: string) => {
    switch (roomType) {
      case 'Single':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Double':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Suite':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleBookRoom = () => {
    if (!selectedRoom) {
      toast({
        title: "No Room Selected",
        description: "Please select a room to book",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a room",
        variant: "destructive",
      });
      return;
    }

    if (guestCount.adults + guestCount.children > selectedRoom.capacity) {
      toast({
        title: "Capacity Exceeded",
        description: `This room can only accommodate ${selectedRoom.capacity} guests`,
        variant: "destructive",
      });
      return;
    }

    // Prepare booking data
    const bookingData = {
      roomId: selectedRoom._id,
      roomNumber: selectedRoom.roomNumber,
      roomType: selectedRoom.roomType,
      checkIn,
      checkOut,
      nights,
      adults: guestCount.adults,
      children: guestCount.children,
      pricePerNight: selectedRoom.pricePerNight,
      totalPrice: selectedRoom.totalPrice,
      tax: selectedRoom.tax,
      finalPrice: selectedRoom.finalPrice,
      amenities: selectedRoom.amenities,
      description: selectedRoom.description,
      images: selectedRoom.images
    };

    // Store booking data in localStorage
    localStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Redirect to booking confirmation page
    window.location.href = '/booking/confirmation';
  };

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bed className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Rooms Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Sorry, no rooms are available for the selected dates. Please try different dates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Selection */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card 
            key={room._id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRoom?._id === room._id 
                ? 'ring-2 ring-hms-primary shadow-lg' 
                : 'hover:ring-1 hover:ring-hms-primary/50'
            }`}
            onClick={() => setSelectedRoom(room)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                  <Badge className={`mt-2 ${getRoomTypeColor(room.roomType)}`}>
                    {room.roomType}
                  </Badge>
                </div>
                {selectedRoom?._id === room._id && (
                  <CheckCircle className="h-5 w-5 text-hms-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Room Image Placeholder */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Bed className="h-8 w-8 text-gray-400" />
              </div>

              {/* Room Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>Up to {room.capacity} guests</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {room.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 4).map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-hms-primary">
                      Rs {room.finalPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {nights} night{nights > 1 ? 's' : ''} • Rs {room.pricePerNight.toLocaleString()}/night
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                    <div>Subtotal: Rs {room.totalPrice.toLocaleString()}</div>
                    <div>Tax: Rs {room.tax.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Form */}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max={selectedRoom.capacity}
                  value={guestCount.adults}
                  onChange={(e) => setGuestCount(prev => ({ 
                    ...prev, 
                    adults: Math.max(1, parseInt(e.target.value) || 1) 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max={selectedRoom.capacity - guestCount.adults}
                  value={guestCount.children}
                  onChange={(e) => setGuestCount(prev => ({ 
                    ...prev, 
                    children: Math.max(0, parseInt(e.target.value) || 0) 
                  }))}
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requests or preferences..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>Room {selectedRoom.roomNumber} ({selectedRoom.roomType})</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{new Date(checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{new Date(checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{guestCount.adults + guestCount.children} guest{guestCount.adults + guestCount.children > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per night:</span>
                  <span>Rs {selectedRoom.pricePerNight.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs {selectedRoom.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>Rs {selectedRoom.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>Rs {selectedRoom.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <Button 
              onClick={handleBookRoom}
              disabled={booking || !isAuthenticated}
              className="w-full hms-button-primary"
            >
              {booking ? 'Booking...' : 'Book Now'}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Please <a href="/auth" className="text-hms-primary hover:underline">log in</a> to book a room
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
