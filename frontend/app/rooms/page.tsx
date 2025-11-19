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
      <section className="relative py-20 bg-gradient-to-br from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Rooms & Suites</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Choose from our comfortable rooms with stunning mountain views in the beautiful hills of Ella, Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Available Rooms */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              Accommodations
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              Rooms & Suites
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience unparalleled comfort in our carefully designed rooms and suites, each featuring modern amenities and elegant furnishings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          <div className="text-center mt-16">
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-hms-primary to-hms-secondary text-white max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Book Your Stay?</h3>
                <p className="text-blue-100 mb-6">
                  Check availability and make your reservation in just a few clicks.
                </p>
                <Link href="/reservations">
                  <Button 
                    size="lg" 
                    className="bg-white text-hms-primary hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
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