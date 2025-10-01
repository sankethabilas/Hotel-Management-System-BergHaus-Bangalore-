'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Shield, 
  Eye,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  capacity: number;
  amenities: string[];
  rating: number;
  isPopular?: boolean;
  discount?: number;
  images?: string[];
  location?: string;
}

interface EnhancedRoomCardProps {
  room: Room;
  onSelect?: (room: Room) => void;
  onBook?: (room: Room) => void;
  showBookButton?: boolean;
  showSelectButton?: boolean;
}

export function EnhancedRoomCard({ 
  room, 
  onSelect, 
  onBook, 
  showBookButton = true,
  showSelectButton = false 
}: EnhancedRoomCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { toast } = useToast();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Room removed from your favorites" : "Room added to your favorites",
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: room.name,
        text: room.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Room link copied to clipboard",
      });
    }
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBook) {
      onBook(room);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(room);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi className="w-3 h-3" />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="w-3 h-3" />;
    if (amenityLower.includes('breakfast') || amenityLower.includes('coffee')) return <Coffee className="w-3 h-3" />;
    if (amenityLower.includes('security') || amenityLower.includes('safe')) return <Shield className="w-3 h-3" />;
    return null;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg">
      <div className="relative">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
              isImageLoading ? 'blur-sm' : 'blur-0'
            }`}
            onLoad={() => setIsImageLoading(false)}
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {room.isPopular && (
              <Badge className="bg-hms-primary text-white">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
            {room.discount && (
              <Badge variant="destructive">
                {room.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Quick view button */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                  <Eye className="w-4 h-4 mr-1" />
                  Quick View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{room.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-semibold">{room.rating}</span>
                        <span className="text-gray-500">(127 reviews)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-hms-primary">
                          LKR {room.price.toLocaleString()}
                        </div>
                        {room.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            LKR {room.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600">{room.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Up to {room.capacity} guests</span>
                      </div>
                      {room.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{room.location}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg group-hover:text-hms-primary transition-colors">
            {room.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {room.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{room.rating}</span>
            <span className="text-xs text-gray-500">(127)</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{room.capacity}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-hms-primary">
              LKR {room.price.toLocaleString()}
            </div>
            {room.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                LKR {room.originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-xs text-gray-500">per night</div>
          </div>
        </div>

        <div className="flex gap-2">
          {showSelectButton && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSelect}
            >
              Select Room
            </Button>
          )}
          {showBookButton && (
            <Button
              className="flex-1 bg-hms-primary hover:bg-hms-primary/90"
              onClick={handleBook}
            >
              Book Now
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
              {getAmenityIcon(amenity)}
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{room.amenities.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
