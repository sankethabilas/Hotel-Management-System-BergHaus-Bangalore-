'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import { getRoomImages, getRoomPrimaryImage, getAllRoomImages, isFolderImage } from '@/lib/roomImageUtils';

interface Room {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
  amenities: string[];
  rating: number;
  isPopular?: boolean;
  images?: string[];
}

interface RoomsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample room data for the dropdown
const sampleRooms: Room[] = [
  {
    id: '1',
    name: 'Double Room with Mountain View',
    description: 'Spacious double room with stunning mountain views, extra-large double bed, and modern amenities.',
    image: getRoomPrimaryImage('Double'),
    capacity: 2,
    amenities: ['Mountain View', 'Balcony', 'Patio', 'Ensuite Bathroom', 'Flat-screen TV', 'Terrace'],
    rating: 9.4,
    isPopular: true,
    images: getAllRoomImages('Double')
  },
  {
    id: '2',
    name: 'Family Room with Mountain View',
    description: 'Perfect for families with bunk bed and large double bed, featuring mountain views and family amenities.',
    image: getRoomPrimaryImage('Family'),
    capacity: 4,
    amenities: ['Mountain View', 'Bunk Bed', 'Large Double Bed', 'Family Friendly', 'Flat-screen TV', 'Terrace'],
    rating: 9.2,
    isPopular: true,
    images: getAllRoomImages('Family')
  },
  {
    id: '3',
    name: 'Double or Twin Room',
    description: 'Flexible room configuration with two futon beds, mountain views, and outdoor spaces.',
    image: getRoomPrimaryImage('Twin'),
    capacity: 2,
    amenities: ['Mountain View', 'Twin Beds', 'Balcony', 'Patio', 'Ensuite Bathroom', 'Terrace'],
    rating: 9.6,
    isPopular: true,
    images: getAllRoomImages('Twin')
  },
  {
    id: '4',
    name: 'Single Room with Mountain View',
    description: 'Perfect for solo travelers with large double bed and all the amenities you need.',
    image: getRoomPrimaryImage('Single'),
    capacity: 1,
    amenities: ['Mountain View', 'Single Occupancy', 'Large Double Bed', 'Balcony', 'Patio', 'Terrace'],
    rating: 9.0,
    images: getAllRoomImages('Single')
  }
];

export default function RoomsDropdown({ isOpen, onClose }: RoomsDropdownProps) {
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: string]: number }>({});
  const [showNavigation, setShowNavigation] = useState<{ [key: string]: boolean }>({});

  const getCurrentImage = (room: Room) => {
    if (room.images && room.images.length > 0) {
      const safeIndex = Math.min(currentImageIndices[room.id] || 0, room.images.length - 1);
      return room.images[safeIndex];
    }
    return room.image;
  };

  const navigateImage = useCallback((roomId: string, direction: 'prev' | 'next') => {
    const room = sampleRooms.find(r => r.id === roomId);
    if (!room || !room.images || room.images.length <= 1) return;
    
    setCurrentImageIndices(prev => {
      const currentIndex = prev[roomId] || 0;
      let newIndex;
      
      if (direction === 'prev') {
        newIndex = currentIndex === 0 ? room.images!.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === room.images!.length - 1 ? 0 : currentIndex + 1;
      }
      
      return { ...prev, [roomId]: newIndex };
    });
  }, []);

  const canNavigate = (room: Room) => room.images && room.images.length > 1;

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/IMG-20250815-WA0007.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (isFolderImage(imagePath)) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/') && !imagePath.startsWith('/uploads/')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/') || imagePath.includes('uploads')) {
      return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
    }
    
    return '/IMG-20250815-WA0007.jpg';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg mt-2 z-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Our Rooms</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleRooms.map((room) => (
            <Card key={room.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className="relative">
                <div 
                  className="relative h-32 overflow-hidden"
                  onMouseEnter={() => setShowNavigation(prev => ({ ...prev, [room.id]: true }))}
                  onMouseLeave={() => setShowNavigation(prev => ({ ...prev, [room.id]: false }))}
                >
                  <Image
                    src={getImageUrl(getCurrentImage(room))}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Navigation Arrows */}
                  {canNavigate(room) && showNavigation[room.id] && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateImage(room.id, 'prev');
                        }}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateImage(room.id, 'next');
                        }}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {canNavigate(room) && (
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                      {(currentImageIndices[room.id] || 0) + 1} / {room.images!.length}
                    </div>
                  )}
                  
                  {room.isPopular && (
                    <Badge className="absolute top-1 left-1 bg-hms-accent text-hms-primary font-semibold text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm group-hover:text-hms-primary transition-colors line-clamp-1">
                    {room.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {room.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="font-medium">{room.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{room.capacity}</span>
                    </div>
                  </div>
                  
                  <Link href="/rooms">
                    <Button 
                      size="sm" 
                      className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white text-xs h-7"
                      onClick={onClose}
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/rooms">
            <Button 
              variant="outline" 
              className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
              onClick={onClose}
            >
              View All Rooms
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
