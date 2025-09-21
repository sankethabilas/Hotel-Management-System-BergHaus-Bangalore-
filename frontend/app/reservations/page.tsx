'use client';

import React, { useState, useMemo } from 'react';
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
  Mail,
  Search,
  Filter,
  X,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  TreePine
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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('price-asc');

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
        const room = filteredAndSortedRooms.find(r => r.id === roomId) || roomTypes.find(r => r.id === roomId);
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

  // Get unique room types for filter
  const roomTypeOptions = useMemo(() => {
    const types = roomTypes.map(room => {
      if (room.name.includes('Double')) return 'Double';
      if (room.name.includes('Family')) return 'Family';
      if (room.name.includes('Single')) return 'Single';
      if (room.name.includes('Twin')) return 'Twin';
      if (room.name.includes('Suite')) return 'Suite';
      return 'Other';
    });
    return Array.from(new Set(types));
  }, []);

  // Get unique amenities for filter
  const amenityOptions = useMemo(() => {
    const allAmenities = roomTypes.flatMap(room => room.amenities);
    const uniqueAmenities = Array.from(new Set(allAmenities));
    return uniqueAmenities.slice(0, 20); // Limit to top 20 amenities
  }, []);

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    let filtered = roomTypes.filter(room => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = room.name.toLowerCase().includes(query);
        const matchesDescription = room.description.toLowerCase().includes(query);
        const matchesAmenities = room.amenities.some(amenity => 
          amenity.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDescription && !matchesAmenities) {
          return false;
        }
      }

      // Room type filter
      if (selectedRoomType) {
        const roomType = room.name.includes('Double') ? 'Double' :
                        room.name.includes('Family') ? 'Family' :
                        room.name.includes('Single') ? 'Single' :
                        room.name.includes('Twin') ? 'Twin' :
                        room.name.includes('Suite') ? 'Suite' : 'Other';
        if (roomType !== selectedRoomType) {
          return false;
        }
      }

      // Price range filter
      if (room.currentPrice < priceRange[0] || room.currentPrice > priceRange[1]) {
        return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllSelectedAmenities = selectedAmenities.every(amenity =>
          room.amenities.some(roomAmenity => 
            roomAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllSelectedAmenities) {
          return false;
        }
      }

      // Capacity filter (based on adults + children)
      const totalGuests = adults + children;
      if (room.maxPersons < totalGuests) {
        return false;
      }

      return true;
    });

    // Sort rooms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.currentPrice - b.currentPrice;
        case 'price-desc':
          return b.currentPrice - a.currentPrice;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'capacity-asc':
          return a.maxPersons - b.maxPersons;
        case 'capacity-desc':
          return b.maxPersons - a.maxPersons;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedRoomType, priceRange, selectedAmenities, sortBy, adults, children]);

  // Handle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRoomType('');
    setPriceRange([0, 20000]);
    setSelectedAmenities([]);
    setSortBy('price-asc');
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

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search rooms by name, description, or amenities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border-gray-300 focus:border-hms-primary focus:ring-hms-primary"
                />
              </div>
            </div>

            {/* Filter Toggle and Sort */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {selectedAmenities.length > 0 || selectedRoomType || priceRange[0] > 0 || priceRange[1] < 20000 ? (
                  <Badge className="bg-hms-primary text-white text-xs">{selectedAmenities.length + (selectedRoomType ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0)}</Badge>
                ) : null}
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:border-hms-primary focus:ring-hms-primary"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="capacity-asc">Capacity: Low to High</option>
                <option value="capacity-desc">Capacity: High to Low</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Room Type Filter */}
                <div>
                  <Label className="text-hms-primary font-semibold mb-3 block">Room Type</Label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-hms-primary focus:ring-hms-primary"
                  >
                    <option value="">All Room Types</option>
                    {roomTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <Label className="text-hms-primary font-semibold mb-3 block">
                    Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="500"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Popular Amenities */}
                <div className="md:col-span-2">
                  <Label className="text-hms-primary font-semibold mb-3 block">Popular Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Free WiFi', 'Mountain View', 'Balcony', 'Air Conditioning', 'TV', 'Terrace', 'Patio', 'Garden View'].map(amenity => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-hms-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{amenity}</span>
                        {selectedAmenities.includes(amenity) && <X className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {filteredAndSortedRooms.length} of {roomTypes.length} rooms
                </div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
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
            {filteredAndSortedRooms.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters to find more rooms.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
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
                    {filteredAndSortedRooms.map((room) => (
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
            )}
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
                        const room = filteredAndSortedRooms.find(r => r.id === roomId) || roomTypes.find(r => r.id === roomId);
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
