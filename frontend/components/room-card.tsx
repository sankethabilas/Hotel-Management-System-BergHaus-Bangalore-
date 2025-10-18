'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Wifi, Car, ChevronLeft, ChevronRight } from 'lucide-react';

interface RoomCardProps {
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

export default function RoomCard({ 
  id, 
  name, 
  description, 
  image, 
  capacity, 
  amenities, 
  rating,
  isPopular = false,
  images = []
}: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showNavigation, setShowNavigation] = React.useState(false);

  const getCurrentImage = () => {
    if (images && images.length > 0) {
      const safeIndex = Math.min(currentImageIndex, images.length - 1);
      return images[safeIndex];
    }
    return image;
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!images || images.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? images!.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const canNavigate = images && images.length > 1;
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white">
      <div className="relative">
        <div 
          className="relative h-64 overflow-hidden"
          onMouseEnter={() => setShowNavigation(true)}
          onMouseLeave={() => setShowNavigation(false)}
        >
          <Image
            src={getCurrentImage()}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Navigation Arrows */}
          {canNavigate && showNavigation && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {/* Image Counter */}
          {canNavigate && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1} / {images!.length}
            </div>
          )}
          {isPopular && (
            <Badge className="absolute top-4 left-4 bg-hms-accent text-hms-primary font-semibold">
              Most Popular
            </Badge>
          )}
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
            <Star className="w-4 h-4 fill-hms-accent text-hms-accent" />
            <span className="text-white text-sm font-medium">{rating}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Room Name */}
          <div>
            <h3 className="text-xl font-bold text-hms-primary mb-2">{name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>

          {/* Capacity */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Up to {capacity} guests</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{amenities.length - 3} more
              </Badge>
            )}
          </div>

          {/* Book Button */}
          <div className="flex justify-center pt-4 border-t">
            <Link href={`/rooms?room=${id}`}>
              <Button className="bg-hms-primary hover:bg-hms-primary/90 text-white transition-all duration-200 hover:scale-105">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
