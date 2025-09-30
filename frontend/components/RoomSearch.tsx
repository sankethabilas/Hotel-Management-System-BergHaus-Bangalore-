'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Search, Wifi, Car, Coffee, Dumbbell, Waves } from 'lucide-react';

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

interface RoomSearchProps {
  onRoomsFound: (rooms: Room[], searchCriteria: any) => void;
  onLoading: (loading: boolean) => void;
}

const RoomSearch: React.FC<RoomSearchProps> = ({ onRoomsFound, onLoading }) => {
  const { toast } = useToast();
  const [searchCriteria, setSearchCriteria] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomType: '',
    guests: 1
  });

  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    // Validate dates
    if (!searchCriteria.checkInDate || !searchCriteria.checkOutDate) {
      toast({
        title: "Validation Error",
        description: "Please select both check-in and check-out dates.",
        variant: "destructive"
      });
      return;
    }

    const checkIn = new Date(searchCriteria.checkInDate);
    const checkOut = new Date(searchCriteria.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      toast({
        title: "Invalid Date",
        description: "Check-in date cannot be in the past.",
        variant: "destructive"
      });
      return;
    }

    if (checkOut <= checkIn) {
      toast({
        title: "Invalid Date",
        description: "Check-out date must be after check-in date.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      const response = await fetch('/api/bookings/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchCriteria),
      });

      const data = await response.json();

      if (data.success) {
        onRoomsFound(data.data.availableRooms, data.data.searchCriteria);
        toast({
          title: "Search Complete",
          description: `Found ${data.data.availableRooms.length} available rooms.`,
        });
      } else {
        toast({
          title: "Search Failed",
          description: data.message || "Failed to search for rooms.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search for rooms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Available Rooms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Check-in Date */}
          <div className="space-y-2">
            <Label htmlFor="checkInDate">Check-in Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="checkInDate"
                type="date"
                value={searchCriteria.checkInDate}
                onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <Label htmlFor="checkOutDate">Check-out Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="checkOutDate"
                type="date"
                value={searchCriteria.checkOutDate}
                onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                className="pl-10"
                min={searchCriteria.checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <Select value={searchCriteria.roomType || "any"} onValueChange={(value) => handleInputChange('roomType', value === "any" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Double">Double</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">Guests</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Select value={searchCriteria.guests.toString()} onValueChange={(value) => handleInputChange('guests', parseInt(value))}>
                <SelectTrigger className="pl-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="w-full"
        >
          {isSearching ? 'Searching...' : 'Search Rooms'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoomSearch;
