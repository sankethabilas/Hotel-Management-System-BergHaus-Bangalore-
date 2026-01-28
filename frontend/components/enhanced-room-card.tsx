'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Clock,
  Camera,
  Upload,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { roomAPI } from '@/lib/api';
import { getRoomImages, getRoomPrimaryImage, isFolderImage } from '@/lib/roomImageUtils';

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
  location?: string;
}

interface EnhancedRoomCardProps {
  room: Room;
  onSelect?: (room: Room) => void;
  onBook?: (room: Room) => void;
  onImageUpdate?: (room: Room) => void;
  showBookButton?: boolean;
  showSelectButton?: boolean;
  showImageUpload?: boolean;
  isAdmin?: boolean;
}

export function EnhancedRoomCard({ 
  room, 
  onSelect, 
  onBook, 
  onImageUpdate,
  showBookButton = true,
  showSelectButton = false,
  showImageUpload = false,
  isAdmin = false
}: EnhancedRoomCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const { toast } = useToast();

  // Define canNavigate early
  const canNavigate = room.images && room.images.length > 1;
  

  // Navigation function
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (!room.images || room.images.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? room.images!.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === room.images!.length - 1 ? 0 : prev + 1
      );
    }
  }, [room.images, canNavigate]);

  // Reset current image index when room images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [room.images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canNavigate) return;
      
      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    if (showNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showNavigation, canNavigate, navigateImage]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear the input so the same file can be selected again
    event.target.value = '';

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('Uploading image for room:', room.id, 'File:', file.name);
      
      const result = await roomAPI.uploadRoomImage(room.id, file);
      console.log('Upload result:', result);
      
      if (result.success && onImageUpdate) {
        onImageUpdate(result.data.room);
        toast({
          title: "Image Uploaded",
          description: "Room image has been updated successfully.",
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageIndex: number) => {
    try {
      const result = await roomAPI.removeRoomImage(room.id, imageIndex);
      
      if (result.success && onImageUpdate) {
        onImageUpdate(result.data.room);
        toast({
          title: "Image Removed",
          description: "Room image has been removed successfully.",
        });
        
        // Adjust current image index if needed
        if (currentImageIndex >= (room.images?.length || 1) - 1) {
          setCurrentImageIndex(Math.max(0, (room.images?.length || 1) - 2));
        }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCurrentImage = () => {
    if (room.images && room.images.length > 0) {
      // Ensure currentImageIndex is within bounds
      const safeIndex = Math.min(currentImageIndex, room.images.length - 1);
      return room.images[safeIndex];
    }
    return room.image;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/IMG-20250815-WA0007.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a folder image (from our organized folders), return as is for Next.js
    if (isFolderImage(imagePath)) {
      return imagePath;
    }
    
    // If it's a local public image (starts with /), return as is for Next.js
    if (imagePath.startsWith('/') && !imagePath.startsWith('/uploads/')) {
      return imagePath;
    }
    
    // If it's an uploaded image (from backend), construct the full URL
    if (imagePath.startsWith('/uploads/') || imagePath.includes('uploads')) {
      return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
    }
    
    // Default fallback
    return '/IMG-20250815-WA0007.jpg';
  };

  return (
    <Card className="group overflow-hidden bg-white border border-gray-100 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 rounded-3xl h-full flex flex-col">
      <div className="relative">
        <div 
          className="relative h-72 overflow-hidden"
          onMouseEnter={() => setShowNavigation(true)}
          onMouseLeave={() => setShowNavigation(false)}
        >
          <Image
            src={getImageUrl(getCurrentImage())}
            alt={room.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
              isImageLoading ? 'blur-sm' : 'blur-0'
            }`}
            onLoad={() => setIsImageLoading(false)}
            onError={(e) => {
              console.error('Image failed to load:', {
                src: getImageUrl(getCurrentImage()),
                currentImage: getCurrentImage(),
                roomImages: room.images,
                roomImage: room.image,
                error: e
              });
              setIsImageLoading(false);
            }}
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
              {currentImageIndex + 1} / {room.images!.length}
            </div>
          )}
          
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

            {/* Image upload controls for admin */}
            {showImageUpload && isAdmin && (
              <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label className={`h-8 w-8 bg-white/90 hover:bg-white rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                {room.images && room.images.length > 1 && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={() => handleRemoveImage(currentImageIndex)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Image navigation dots */}
            {room.images && room.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {room.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {room.isPopular && (
              <Badge className="bg-hms-primary text-white">
                <Star className="w-3 h-3 mr-1" />
                Popular
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
                  <div 
                    className="relative h-64 rounded-lg overflow-hidden group"
                    onMouseEnter={() => setShowNavigation(true)}
                    onMouseLeave={() => setShowNavigation(false)}
                  >
                    <Image
                      src={getImageUrl(getCurrentImage())}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Navigation Arrows in Quick View */}
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
                    
                    {/* Image Counter in Quick View */}
                    {canNavigate && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} / {room.images!.length}
                      </div>
                    )}
                    
                    {/* Image Dots in Quick View */}
                    {canNavigate && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {room.images!.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex 
                                ? 'bg-white' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-hms-accent fill-current" />
                        <span className="font-bold text-lg">{room.rating}</span>
                        <span className="text-gray-500">(127 reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Up to {room.capacity} guests</span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">{room.description}</p>
                    {room.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-hms-primary" />
                        <span className="text-sm font-medium text-gray-700">{room.location}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold mb-3 text-gray-900">Premium Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1.5 bg-hms-primary/5 text-hms-primary hover:bg-hms-primary/10 transition-colors">
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

      <CardContent className="p-6 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/50">
        <div className="space-y-4 mb-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-xl group-hover:text-hms-primary transition-colors leading-tight">
              {room.name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 shrink-0">
               <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
               <span className="text-sm font-bold text-yellow-700">{room.rating}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {room.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
             <div className="flex items-center gap-1.5">
               <Users className="w-4 h-4 text-hms-secondary" />
               <span className="font-medium">{room.capacity} Guests</span>
             </div>
             <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
             <div className="flex items-center gap-1.5">
               <Wifi className="w-4 h-4 text-hms-secondary" />
               <span className="font-medium">Free Wifi</span>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs flex items-center gap-1 border-gray-200 text-gray-600 font-normal bg-white">
                {getAmenityIcon(amenity)}
                {amenity}
              </Badge>
            ))}
            {room.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-500 bg-gray-50">
                +{room.amenities.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {showSelectButton && (
              <Button
                variant="outline"
                className="flex-1 border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white transition-colors"
                onClick={handleSelect}
              >
                Select Room
              </Button>
            )}
            {showBookButton && (
              <Button
                className="flex-1 bg-hms-primary hover:bg-hms-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={handleBook}
              >
                Book Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
