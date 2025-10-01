'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Wifi, Car, Coffee, Dumbbell, Waves, Bed, Users, DollarSign } from 'lucide-react';

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

interface RoomSelectionProps {
  rooms: Room[];
  searchCriteria: any;
  onSelectionChange: (selectedRooms: Room[]) => void;
  onProceedToBooking: (selectedRooms: Room[]) => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({
  rooms,
  searchCriteria,
  onSelectionChange,
  onProceedToBooking
}) => {
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);

  const handleRoomToggle = (room: Room, checked: boolean) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedRooms, room];
    } else {
      newSelection = selectedRooms.filter(r => r._id !== room._id);
    }
    setSelectedRooms(newSelection);
    onSelectionChange(newSelection);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'breakfast':
        return <Coffee className="w-4 h-4" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4" />;
      case 'pool':
        return <Waves className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoomTypeColor = (roomType: string) => {
    switch (roomType.toLowerCase()) {
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'deluxe':
        return 'bg-green-100 text-green-800';
      case 'suite':
        return 'bg-purple-100 text-purple-800';
      case 'presidential':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalPrice = () => {
    return selectedRooms.reduce((total, room) => total + room.pricing.total, 0);
  };

  if (rooms.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Bed className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Available Rooms</h3>
            <p>No rooms are available for the selected dates and criteria.</p>
            <p className="text-sm mt-2">Try adjusting your search criteria or selecting different dates.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rooms</CardTitle>
          <div className="text-sm text-gray-600">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} available for{' '}
            {new Date(searchCriteria.checkInDate).toLocaleDateString()} -{' '}
            {new Date(searchCriteria.checkOutDate).toLocaleDateString()}
            {searchCriteria.guests > 1 && ` (${searchCriteria.guests} guests)`}
          </div>
        </CardHeader>
      </Card>

      {/* Room Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <Card key={room._id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                  <Badge className={`mt-1 ${getRoomTypeColor(room.roomType)}`}>
                    {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#006bb8]">
                    ${room.pricing.pricePerNight}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Room Details */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>1 King Bed</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>${room.pricing.pricePerNight} × {room.pricing.totalNights} nights</span>
                    <span>${room.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${room.pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total</span>
                    <span>${room.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Selection Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${room._id}`}
                  checked={selectedRooms.some(r => r._id === room._id)}
                  onCheckedChange={(checked) => handleRoomToggle(room, checked as boolean)}
                />
                <Label htmlFor={`room-${room._id}`} className="text-sm">
                  Select this room
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selection Summary and Proceed Button */}
      {selectedRooms.length > 0 && (
        <Card className="sticky bottom-4 bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''} selected
                </h3>
                <div className="text-sm text-gray-600">
                  {selectedRooms.map(room => `Room ${room.roomNumber}`).join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#006bb8]">
                  ${calculateTotalPrice().toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total amount</div>
              </div>
              <Button 
                onClick={() => onProceedToBooking(selectedRooms)}
                className="ml-4"
              >
                Proceed to Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoomSelection;
