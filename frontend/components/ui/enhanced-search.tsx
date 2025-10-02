'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Users, 
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  priceRange: [number, number];
  amenities: string[];
  rating: number;
  location: string;
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
  showAdvancedFilters?: boolean;
}

const amenityOptions = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'security', label: '24/7 Security', icon: Shield },
];

export function EnhancedSearch({
  onSearch,
  onFiltersChange,
  initialFilters = {},
  className,
  showAdvancedFilters = true
}: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    priceRange: [0, 100000],
    amenities: [],
    rating: 0,
    location: '',
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await onSearch(filters);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      checkIn: '',
      checkOut: '',
      guests: 2,
      priceRange: [0, 100000],
      amenities: [],
      rating: 0,
      location: '',
    });
  };

  const toggleAmenity = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.checkIn) count++;
    if (filters.checkOut) count++;
    if (filters.guests !== 2) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.location) count++;
    return count;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchRef}
                placeholder="Search for rooms, locations, or amenities..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={filters.checkIn}
                onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                className="w-40"
                placeholder="Check-in"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={filters.checkOut}
                onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                className="w-40"
                placeholder="Check-out"
              />
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <Input
                type="number"
                min="1"
                max="10"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          {/* Filter Toggle and Active Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && showAdvancedFilters && (
            <div className="border-t pt-4 space-y-4">
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Price Range (LKR)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="w-24"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 100000])}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        filters.rating >= rating
                          ? "text-yellow-500"
                          : "text-gray-300 hover:text-yellow-400"
                      )}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  {filters.rating > 0 && (
                    <span className="text-sm text-gray-600 ml-2">
                      {filters.rating}+ stars
                    </span>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = filters.amenities.includes(amenity.id);
                    return (
                      <Button
                        key={amenity.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAmenity(amenity.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {amenity.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Tags */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.query}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('query', '')}
                  />
                </Badge>
              )}
              {filters.checkIn && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Check-in: {filters.checkIn}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('checkIn', '')}
                  />
                </Badge>
              )}
              {filters.checkOut && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Check-out: {filters.checkOut}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('checkOut', '')}
                  />
                </Badge>
              )}
              {filters.guests !== 2 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Guests: {filters.guests}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFilterChange('guests', 2)}
                  />
                </Badge>
              )}
              {filters.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {amenityOptions.find(a => a.id === amenity)?.label || amenity}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
