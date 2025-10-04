'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Wifi, Car } from 'lucide-react';

interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
  amenities: string[];
  rating: number;
  isPopular?: boolean;
}

export default function RoomCard({ 
  id, 
  name, 
  description, 
  image, 
  capacity, 
  amenities, 
  rating,
  isPopular = false
}: RoomCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white">
      <div className="relative">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
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
