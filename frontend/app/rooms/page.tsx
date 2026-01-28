'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EnhancedRoomCard } from '@/components/enhanced-room-card';
import { useAuth } from '@/contexts/AuthContext';
import { roomAPI } from '@/lib/api';
import { 
  getAllRoomImages, 
  getRandomRoomImageWithSeed, 
  getRoomImages, 
  getRoomPrimaryImage 
} from '@/lib/roomImageUtils';

const defaultRooms = [
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

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState(defaultRooms);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getAllRooms();
        if (response.success && response.data) {
          const transformedRooms = response.data.map((room: any) => {
            const roomNameMap: { [key: string]: string } = {
              'Double': 'Double Room with Mountain View',
              'Family': 'Family Room with Mountain View',
              'Twin': 'Double or Twin Room',
              'Single': 'Single Room with Mountain View',
              'Suite': 'Family Room with Mountain View'
            };

            const roomImages = getRoomImages(room.roomType, room.images);
            const primaryImage = room.images?.[0] || getRandomRoomImageWithSeed(room.roomType, parseInt(room._id.slice(-2), 16) || 0);

            return {
              id: room._id,
              name: roomNameMap[room.roomType] || `${room.roomType || 'Standard'} Room with Mountain View`,
              description: room.description || `Comfortable ${(room.roomType || 'standard').toLowerCase()} room`,
              image: primaryImage,
              capacity: room.capacity || 1,
              amenities: room.amenities || [],
              rating: 9.0,
              isPopular: room.status === 'available',
              images: roomImages
            };
          });
          setRooms(transformedRooms);
        }
      } catch (error) {
        console.error('Error loading rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleRoomImageUpdate = (updatedRoom: any) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === updatedRoom._id
          ? {
              ...room,
              image: updatedRoom.images && updatedRoom.images.length > 0 ? updatedRoom.images[0] : '/IMG-20250815-WA0007.jpg',
              images: updatedRoom.images || []
            }
          : room
      )
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/IMG-20250815-WA0006.jpg" 
            alt="Luxury Room" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-md mb-6 px-4 py-1 text-sm uppercase tracking-widest">
            Luxury Accommodation
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">
            Rooms & <span className="text-hms-accent">Suites</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
            Choose from our comfortable rooms with stunning mountain views in the beautiful hills of Ella, Sri Lanka.
          </p>
        </div>
      </section>

      {/* Available Rooms */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-hms-primary/5 -skew-y-3 transform origin-top-left -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Find Your Perfect <span className="text-hms-primary">Sanctuary</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-hms-primary to-hms-accent mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience unparalleled comfort in our carefully designed rooms and suites, each featuring modern amenities and elegant furnishings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-80 rounded-3xl mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              rooms.map((room) => (
                <EnhancedRoomCard
                  key={room.id}
                  room={room}
                  onBook={(room) => {
                    window.location.href = `/availability?roomId=${room.id}`;
                  }}
                  onImageUpdate={handleRoomImageUpdate}
                  showImageUpload={isAdmin}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-24">
            <Card className="border-0 shadow-2xl overflow-hidden relative max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-hms-primary to-hms-secondary opacity-95 z-0"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-hms-accent/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              
              <CardContent className="p-12 relative z-10 text-white">
                <h3 className="text-3xl font-bold mb-4">Ready to Book Your Stay?</h3>
                <p className="text-white/90 mb-8 text-lg font-light">
                  Check availability and make your reservation in just a few clicks. Your luxury escape awaits.
                </p>
                <Link href="/reservations">
                  <Button 
                    size="lg" 
                    className="bg-white text-hms-primary hover:bg-gray-50 px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full"
                  >
                    Check Availability & Book
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}