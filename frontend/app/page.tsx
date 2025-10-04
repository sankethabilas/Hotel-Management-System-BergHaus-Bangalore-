'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import RoomCard from '@/components/room-card';
import { EnhancedRoomCard } from '@/components/enhanced-room-card';
import FacilityCard, { iconMap } from '@/components/facility-card';
import ReviewCarousel from '@/components/review-carousel';
import { useAuth } from '@/contexts/AuthContext';
import { roomAPI } from '@/lib/api';
import { 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Sparkles, 
  Dumbbell,
  Coffee,
  Shield,
  UserCheck,
  Plane,
  ArrowRight,
  CheckCircle,
  Mountain,
  TreePine
} from 'lucide-react';

// Sample data
const defaultRooms = [
  {
    id: '1',
    name: 'Double Room with Mountain View',
    description: 'Spacious double room with stunning mountain views, extra-large double bed, and modern amenities.',
    image: '/IMG-20250815-WA0007.jpg',
    capacity: 2,
    amenities: ['Mountain View', 'Balcony', 'Patio', 'Ensuite Bathroom', 'Flat-screen TV', 'Terrace'],
    rating: 9.4,
    isPopular: true,
    images: ['/IMG-20250815-WA0007.jpg']
  },
  {
    id: '2',
    name: 'Family Room with Mountain View',
    description: 'Perfect for families with bunk bed and large double bed, featuring mountain views and family amenities.',
    image: '/IMG-20250815-WA0008.jpg',
    capacity: 4,
    amenities: ['Mountain View', 'Bunk Bed', 'Large Double Bed', 'Family Friendly', 'Flat-screen TV', 'Terrace'],
    rating: 9.2,
    isPopular: true,
    images: ['/IMG-20250815-WA0008.jpg']
  },
  {
    id: '3',
    name: 'Double or Twin Room',
    description: 'Flexible room configuration with two futon beds, mountain views, and outdoor spaces.',
    image: '/IMG-20250815-WA0009.jpg',
    capacity: 2,
    amenities: ['Mountain View', 'Twin Beds', 'Balcony', 'Patio', 'Ensuite Bathroom', 'Terrace'],
    rating: 9.6,
    isPopular: true,
    images: ['/IMG-20250815-WA0009.jpg']
  },
  {
    id: '4',
    name: 'Single Room with Mountain View',
    description: 'Perfect for solo travelers with large double bed and all the amenities you need.',
    image: '/IMG-20250815-WA0010.jpg',
    capacity: 1,
    amenities: ['Mountain View', 'Single Occupancy', 'Large Double Bed', 'Balcony', 'Patio', 'Terrace'],
    rating: 9.0,
    images: ['/IMG-20250815-WA0010.jpg']
  }
];

const facilities = [
  {
    icon: iconMap.restaurant,
    title: 'Family Rooms',
    description: 'Comfortable family rooms with private bathrooms, balconies, and mountain views.',
    isAvailable: true
  },
  {
    icon: iconMap.parking,
    title: 'Free Parking',
    description: 'Free private parking available on site - no reservation needed.',
    isAvailable: true
  },
  {
    icon: iconMap.spa,
    title: 'Non-Smoking Rooms',
    description: 'All rooms are non-smoking for your comfort and health.',
    isAvailable: true
  },
  {
    icon: iconMap.coffee,
    title: 'Breakfast Included',
    description: 'Kid-friendly buffet with continental, vegetarian, and Asian options.',
    isAvailable: true
  },
  {
    icon: iconMap.gym,
    title: 'Bicycle Rental',
    description: 'Explore the beautiful surroundings with our bicycle rental service.',
    isAvailable: true
  },
  {
    icon: iconMap.concierge,
    title: 'Shuttle Service',
    description: 'Paid shuttle service available, including pickup from Demodara Railway Station.',
    isAvailable: true
  },
  {
    icon: iconMap.pool,
    title: 'Outdoor Spaces',
    description: 'BBQ facilities, outdoor furniture, patio, balcony, terrace, and garden access.',
    isAvailable: true
  },
  {
    icon: iconMap.wifi,
    title: 'Pets Allowed',
    description: 'Pets are welcome - charges may be applicable for your furry friends.',
    isAvailable: true
  },
  {
    icon: iconMap.restaurant,
    title: 'Mountain Views',
    description: 'Breathtaking mountain and garden views from your private balcony or terrace.',
    isAvailable: true
  },
  {
    icon: iconMap.pool,
    title: 'BBQ Facilities',
    description: 'Outdoor BBQ facilities available for a perfect evening with family and friends.',
    isAvailable: true
  },
  {
    icon: iconMap.spa,
    title: '24/7 Security',
    description: 'CCTV in common areas and 24-hour security for your peace of mind.',
    isAvailable: true
  },
  {
    icon: iconMap.concierge,
    title: 'Daily Housekeeping',
    description: 'Daily housekeeping service to keep your room clean and comfortable.',
    isAvailable: true
  }
];

const specialOffers = [
  {
    title: 'Pekoe Trail Package',
    description: 'Perfect for hikers completing the Pekoe Trail. Includes free pickup from Demodara Railway Station.',
    discount: 'FREE PICKUP',
    validUntil: 'Dec 31, 2024'
  },
  {
    title: 'Family Stay Special',
    description: 'Family rooms with mountain views, breakfast included, and access to garden areas.',
    discount: '15% OFF',
    validUntil: 'Jan 15, 2025'
  },
  {
    title: 'Extended Stay',
    description: 'Stay 3 nights or more and enjoy our beautiful hill country views and local cuisine.',
    discount: '20% OFF',
    validUntil: 'Feb 28, 2025'
  }
];

export default function HomePage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState(defaultRooms);
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Load rooms from API on component mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getAllRooms();
        if (response.success && response.data) {
          // Transform API data to match our interface
          const transformedRooms = response.data.map((room: any) => {
            // Handle images - if no images from API, use default public images
            let images = room.images || [];
            if (images.length === 0) {
              // Use default public images based on room type
              const defaultImages: { [key: string]: string[] } = {
                'Single': ['/IMG-20250815-WA0010.jpg'],
                'Double': ['/IMG-20250815-WA0007.jpg'],
                'Suite': ['/IMG-20250815-WA0008.jpg'],
                'Family': ['/IMG-20250815-WA0008.jpg']
              };
              images = defaultImages[room.roomType] || ['/IMG-20250815-WA0007.jpg'];
            }
            
            return {
              id: room._id,
              name: `${room.roomType || 'Standard'} Room - ${room.roomNumber || 'N/A'}`,
              description: room.description || `Comfortable ${(room.roomType || 'standard').toLowerCase()} room`,
              image: images[0] || '/IMG-20250815-WA0007.jpg',
              capacity: room.capacity || 1,
              amenities: room.amenities || [],
              rating: 9.0, // Default rating
              isPopular: room.status === 'available',
              images: images
            };
          });
          setRooms(transformedRooms);
        }
      } catch (error) {
        console.error('Error loading rooms:', error);
        // Keep default rooms if API fails
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleRoomImageUpdate = (updatedRoom: any) => {
    console.log('Updating room image:', updatedRoom);
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
      <Hero />

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
                  About Berghaus Bungalow
                </Badge>
                <h2 className="text-4xl font-bold text-hms-primary mb-6">
                  Where Luxury Meets Comfort
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Located in the beautiful hills of Ella, Sri Lanka, Berghaus Bungalow offers comfortable 
                  family rooms with private bathrooms, balconies, and stunning garden or mountain views. 
                  Our commitment to excellence and warm hospitality has earned us a superb 9.4/10 rating.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  From our delicious local cuisine to our peaceful outdoor spaces, every aspect of 
                  your stay is designed to provide comfort and create unforgettable memories in the heart of Sri Lanka's hill country.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-hms-primary">9.4</div>
                  <div className="text-gray-600">Guest Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-hms-primary">20+</div>
                  <div className="text-gray-600">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-hms-primary">Family</div>
                  <div className="text-gray-600">Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-hms-primary">9.2</div>
                  <div className="text-gray-600">Location Score</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/IMG-20250815-WA0011.jpg"
                  alt="Hotel Interior"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms & Suites Section */}
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
              Experience unparalleled comfort in our carefully designed rooms and suites, 
              each featuring modern amenities and elegant furnishings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
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
                    // Handle booking action
                    window.location.href = `/availability?roomId=${room.id}`;
                  }}
                  onImageUpdate={handleRoomImageUpdate}
                  showImageUpload={isAdmin}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/rooms">
              <Button 
                size="lg" 
                className="bg-hms-primary hover:bg-hms-primary/90 text-white px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-hms-primary hover:border-hms-secondary"
              >
                View All Rooms
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities & Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              Great Facilities!
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              Facilities & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review score: 9.3/10. Discover our comprehensive facilities and services designed to enhance your stay 
              and provide everything you need for a perfect accommodation experience in Ella.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <FacilityCard key={index} {...facility} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/facilities">
              <Button size="lg" className="bg-hms-primary hover:bg-hms-primary/90 text-white px-8 py-4">
                View All Facilities
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Guest Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              What Our Guests Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Read what our valued guests have to say 
              about their experiences at Berghaus Bungalow.
            </p>
          </div>

          <ReviewCarousel />
        </div>
      </section>

      {/* Hotel Surroundings Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              Excellent Location
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              Hotel Surroundings
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Perfectly located in the hills of Ella with easy access to major attractions, 
              restaurants, and transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <Mountain className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">Demodara Nine Arch Bridge</h3>
                <p className="text-sm text-gray-600">5 km away</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <Utensils className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">The Kitchen Garden</h3>
                <p className="text-sm text-gray-600">3.1 km away</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <Plane className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">Demodara Railway Station</h3>
                <p className="text-sm text-gray-600">1.7 km away</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                    <TreePine className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-hms-primary mb-2">Little Adam's Peak</h3>
                <p className="text-sm text-gray-600">7 km away</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/facilities">
              <Button size="lg" className="bg-hms-primary hover:bg-hms-primary/90 text-white px-8 py-4">
                View All Surroundings
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              Exclusive Deals
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              Special Offers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take advantage of our exclusive offers and packages designed to make your stay 
              even more memorable and affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialOffers.map((offer, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-hms-primary/5 to-hms-accent/10">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <Badge className="bg-hms-primary text-white font-bold text-lg px-4 py-2">
                      {offer.discount}
                    </Badge>
                    <h3 className="text-xl font-bold text-hms-primary">{offer.title}</h3>
                    <p className="text-gray-600">{offer.description}</p>
                    <div className="pt-4">
                      <p className="text-sm text-gray-500">Valid until: {offer.validUntil}</p>
                    </div>
                    <Link href="/reservations">
                      <Button className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Ready for an Unforgettable Stay?
            </h2>
            <p className="text-xl text-blue-100">
              Book your room today and experience the luxury and comfort that Berghaus Bungalow 
              has to offer. Our team is ready to make your stay exceptional.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/reservations">
                <Button 
                  size="lg" 
                  className="bg-white text-hms-primary hover:bg-gray-100 px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-white hover:border-gray-200"
                >
                  Book Your Stay
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-hms-primary px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-transparent hover:bg-white"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}