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
import FeedbackShowcase from '@/components/feedback-showcase';

import { useAuth } from '@/contexts/AuthContext';
import { roomAPI } from '@/lib/api';
import { getRoomImages, getRoomPrimaryImage, getAllRoomImages, getRandomRoomImageWithSeed } from '@/lib/roomImageUtils';
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
  TreePine,
  MessageSquare
} from 'lucide-react';

// Sample data with dynamic images
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
            // Map room types to proper names
            const roomNameMap: { [key: string]: string } = {
              'Double': 'Double Room with Mountain View',
              'Family': 'Family Room with Mountain View',
              'Twin': 'Double or Twin Room',
              'Single': 'Single Room with Mountain View',
              'Suite': 'Family Room with Mountain View'
            };
            
            // Get images using our dynamic image utility
            const roomImages = getRoomImages(room.roomType, room.images);
            // Use a more dynamic approach - if no API images, use random from folder
            const primaryImage = room.images?.[0] || getRandomRoomImageWithSeed(room.roomType, parseInt(room._id.slice(-2), 16) || 0);
            
            return {
              id: room._id,
              name: roomNameMap[room.roomType] || `${room.roomType || 'Standard'} Room with Mountain View`,
              description: room.description || `Comfortable ${(room.roomType || 'standard').toLowerCase()} room`,
              image: primaryImage,
              capacity: room.capacity || 1,
              amenities: room.amenities || [],
              rating: 9.0, // Default rating
              isPopular: room.status === 'available',
              images: roomImages
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
      {/* About Section */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-hms-highlight/10 skew-x-12 transform origin-top-right"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8 animate-slide-up">
              <div>
                <Badge className="bg-hms-accent/20 text-hms-primary hover:bg-hms-accent/30 transition-colors px-4 py-1 text-sm font-semibold mb-6 rounded-full border border-hms-accent/50">
                  Welcome to Paradise
                </Badge>
                <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Where <span className="text-hms-primary">Luxury</span> Meets <span className="text-hms-secondary">Comfort</span>
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Nestled in the breathtaking hills of Ella, Berghaus Bungalow is more than just a hotel—it's your private sanctuary. 
                    Wake up to misty mountain views and unwind in our luxurious, family-friendly accommodations.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                     Rated <span className="font-bold text-hms-primary">9.4/10</span> by our guests for our exceptional hospitality and serene atmosphere.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="text-4xl font-bold text-hms-primary mb-1">9.4</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Guest Rating</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="text-4xl font-bold text-hms-primary mb-1">Ella</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Prime Location</div>
                </div>
              </div>

              <div className="pt-4">
                 <Link href="/about">
                    <Button variant="link" className="text-hms-primary text-lg font-semibold hover:translate-x-2 transition-transform p-0 h-auto">
                      Read Our Story <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                 </Link>
              </div>
            </div>
            
            {/* Image Composition */}
            <div className="relative h-[600px] hidden lg:block">
              {/* Main Large Image */}
              <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl z-10 transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/IMG-20250815-WA0011.jpg"
                  alt="Hotel Interior Main"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Secondary Overlapping Image */}
              <div className="absolute bottom-0 left-0 w-3/5 h-3/5 rounded-3xl overflow-hidden shadow-2xl z-20 border-8 border-white transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/IMG-20250815-WA0024.jpg"
                  alt="Hotel Detail"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-hms-accent/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms & Suites Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-hms-secondary/10 rounded-full blur-3xl -z-10"></div>
            <Badge className="bg-hms-primary text-white font-semibold mb-6 px-6 py-2 rounded-full shadow-lg border-2 border-white/20">
              Luxury Living
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Rooms & <span className="text-hms-secondary">Suites</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Immerse yourself in comfort with our thoughtfully designed spaces, featuring breath-taking views and premium amenities.
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
            <Badge className="bg-indigo-100 text-indigo-700 font-semibold mb-4 px-4 py-1 rounded-full">
              World Class Amenities
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Facilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for a perfect stay.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {facilities.map((facility, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-gray-50/50 hover:bg-white">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                   <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-hms-primary group-hover:bg-hms-primary group-hover:text-white transition-colors duration-300 mb-4">
                     {facility.icon}
                   </div>
                   <h3 className="font-semibold text-gray-900 group-hover:text-hms-primary transition-colors text-sm">{facility.title}</h3>
                </CardContent>
              </Card>
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

      {/* Feedback Section */}
      <section className="py-20 bg-gradient-to-r from-hms-primary to-hms-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Badge className="bg-white text-hms-primary font-semibold mb-4">
              Share Your Experience
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Help Us Improve
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your feedback is invaluable to us. Share your experience and help us create 
              even better stays for future guests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/feedback">
              <Button 
                size="lg" 
                className="bg-white text-hms-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Share Feedback
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-hms-primary px-8 py-4 text-lg font-semibold"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Guest Feedback Showcase */}
      <FeedbackShowcase />

      {/* Hotel Surroundings Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-100 text-teal-700 font-semibold mb-4 px-4 py-1 rounded-full">
              Explore Ella
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Prime Location
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Minutes away from Ella's most famous landmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="group relative h-80 overflow-hidden rounded-3xl border-0 shadow-lg cursor-pointer">
               <Image src="/IMG-20250815-WA0009.jpg" alt="Nine Arch" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <div className="absolute bottom-6 left-6 text-white">
                 <h3 className="text-xl font-bold mb-1">Nine Arch Bridge</h3>
                 <p className="text-white/80">5 km away</p>
               </div>
            </Card>

            <Card className="group relative h-80 overflow-hidden rounded-3xl border-0 shadow-lg cursor-pointer">
               <Image src="/IMG-20250815-WA0010.jpg" alt="Kitchen Garden" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <div className="absolute bottom-6 left-6 text-white">
                 <h3 className="text-xl font-bold mb-1">Kitchen Garden</h3>
                 <p className="text-white/80">3.1 km away</p>
               </div>
            </Card>

            <Card className="group relative h-80 overflow-hidden rounded-3xl border-0 shadow-lg cursor-pointer">
               <Image src="/IMG-20250815-WA0027.jpg" alt="Railway Station" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <div className="absolute bottom-6 left-6 text-white">
                 <h3 className="text-xl font-bold mb-1">Railway Station</h3>
                 <p className="text-white/80">1.7 km away</p>
               </div>
            </Card>

            <Card className="group relative h-80 overflow-hidden rounded-3xl border-0 shadow-lg cursor-pointer">
               <Image src="/IMG-20250815-WA0021.jpg" alt="Adams Peak" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <div className="absolute bottom-6 left-6 text-white">
                 <h3 className="text-xl font-bold mb-1">Little Adam's Peak</h3>
                 <p className="text-white/80">7 km away</p>
               </div>
            </Card>
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
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-hms-accent to-hms-primary"></div>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                         <Badge className="bg-hms-accent text-hms-primary font-bold text-md px-3 py-1">
                           {offer.discount}
                         </Badge>
                         <Sparkles className="w-6 h-6 text-hms-accent animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-hms-primary transition-colors">{offer.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{offer.description}</p>
                    <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-4 pt-4">
                      <p className="text-sm text-gray-400 font-medium">{offer.validUntil}</p>
                      <Link href="/reservations">
                        <Button variant="ghost" className="text-hms-primary hover:text-hms-secondary hover:bg-hms-primary/5 p-0 font-semibold">
                          Book Now <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
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