'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/simple-select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Users, Filter, RefreshCw } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/availability-calendar';
import { RoomSelection } from '@/components/room-selection';
import { availabilityAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface SearchParams {
  checkIn: string;
  checkOut: string;
  roomType: string;
  adults: number;
  children: number;
}

interface AvailabilityData {
  checkIn: string;
  checkOut: string;
  nights: number;
  totalGuests: number;
  availableRooms: any[];
  roomsByType: Record<string, any[]>;
  totalAvailable: number;
}

export default function AvailabilityPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkIn: '',
    checkOut: '',
    roomType: 'all',
    adults: 1,
    children: 0
  });
  
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchParams.checkIn || !searchParams.checkOut) {
      toast({
        title: "Missing Information",
        description: "Please select both check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(searchParams.checkIn) >= new Date(searchParams.checkOut)) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await availabilityAPI.checkAvailability({
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        roomType: searchParams.roomType === 'all' ? undefined : searchParams.roomType,
        adults: searchParams.adults,
        children: searchParams.children
      });

      if (response.success && response.data) {
        setAvailabilityData(response.data);
        setShowCalendar(false);
      } else {
        toast({
          title: "Search Failed",
          description: response.message || "Failed to search for availability",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "An error occurred while searching for availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (checkIn: string, checkOut: string) => {
    setSearchParams(prev => ({
      ...prev,
      checkIn,
      checkOut
    }));
    setShowCalendar(false);
  };

  const handleBookingSuccess = () => {
    setAvailabilityData(null);
    setSearchParams(prev => ({
      ...prev,
      checkIn: '',
      checkOut: ''
    }));
    toast({
      title: "Booking Confirmed",
      description: "Your room has been successfully booked!",
    });
  };

  const getTotalGuests = () => {
    return searchParams.adults + searchParams.children;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Find Your Perfect Room
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search for available rooms and book your stay at Berghaus Bungalow. 
            Experience luxury and comfort in the heart of nature.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Availability</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Check-in Date */}
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, checkIn: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Check-out Date */}
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, checkOut: e.target.value }))}
                  min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Room Type */}
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Select 
                  value={searchParams.roomType} 
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, roomType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Adults */}
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={searchParams.adults}
                  onChange={(e) => setSearchParams(prev => ({ 
                    ...prev, 
                    adults: Math.max(1, parseInt(e.target.value) || 1) 
                  }))}
                />
              </div>

              {/* Children */}
              <div>
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={searchParams.children}
                  onChange={(e) => setSearchParams(prev => ({ 
                    ...prev, 
                    children: Math.max(0, parseInt(e.target.value) || 0) 
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="hms-button-primary flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Availability
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>View Calendar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        {showCalendar && (
          <div className="mb-8">
            <AvailabilityCalendar
              onDateSelect={handleDateSelect}
              selectedCheckIn={searchParams.checkIn}
              selectedCheckOut={searchParams.checkOut}
              roomType={searchParams.roomType}
            />
          </div>
        )}

        {/* Search Results */}
        {availabilityData && (
          <div className="space-y-6">
            {/* Results Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Available Rooms
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(availabilityData.checkIn).toLocaleDateString()} - {new Date(availabilityData.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{availabilityData.totalGuests} guest{availabilityData.totalGuests > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{availabilityData.nights} night{availabilityData.nights > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {availabilityData.totalAvailable} room{availabilityData.totalAvailable > 1 ? 's' : ''} available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Selection */}
            <RoomSelection
              rooms={availabilityData.availableRooms}
              checkIn={availabilityData.checkIn}
              checkOut={availabilityData.checkOut}
              nights={availabilityData.nights}
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        )}

        {/* No Results Message */}
        {availabilityData && availabilityData.totalAvailable === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Rooms Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sorry, no rooms are available for the selected dates and criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowCalendar(true)}
                className="mr-2"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAvailabilityData(null)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Modify Search
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
