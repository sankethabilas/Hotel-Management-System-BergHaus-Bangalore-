'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Users, 
  Bed, 
  Mountain, 
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const roomTypes = [
  {
    id: '1',
    name: 'Double Room with Mountain View',
    description: 'Spacious double room with stunning mountain views, extra-large double bed, and modern amenities.',
    image: '/file.svg',
    bedType: '1 extra-large double bed',
    maxPersons: 2,
    originalPrice: 13608,
    currentPrice: 10478,
    discount: 23,
    available: 1,
    amenities: [
      'Balcony', 'Garden view', 'Mountain view', 'Patio', 'Ensuite bathroom', 
      'Flat-screen TV', 'Terrace', 'Free toiletries', 'Shower', 'Safety deposit box', 
      'Toilet', 'Sofa', 'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 
      'Private entrance', 'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Upper floors accessible by stairs only', 
      'Clothes rack', 'Toilet paper', 'Books, DVDs, or music for children'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  },
  {
    id: '2',
    name: 'Family Room with Mountain View',
    description: 'Perfect for families with bunk bed and large double bed, featuring mountain views and family amenities.',
    image: '/next.svg',
    bedType: '1 bunk bed and 1 large double bed',
    maxPersons: 4,
    originalPrice: 16632,
    currentPrice: 12807,
    discount: 23,
    available: 1,
    amenities: [
      'Balcony', 'Garden view', 'Mountain view', 'Patio', 'Ensuite bathroom', 
      'Flat-screen TV', 'Terrace', 'Free toiletries', 'Shower', 'Safety deposit box', 
      'Toilet', 'Sofa', 'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 
      'Private entrance', 'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Clothes rack', 'Toilet paper', 
      'Books, DVDs, or music for children'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  },
  {
    id: '3',
    name: 'Double or Twin Room',
    description: 'Flexible room configuration with two futon beds, mountain views, and outdoor spaces.',
    image: '/vercel.svg',
    bedType: '2 futon beds',
    maxPersons: 2,
    originalPrice: 13608,
    currentPrice: 10478,
    discount: 23,
    available: 1,
    amenities: [
      'Balcony', 'Garden view', 'Mountain view', 'Patio', 'Ensuite bathroom', 
      'Terrace', 'Free toiletries', 'Shower', 'Safety deposit box', 'Toilet', 
      'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 'Private entrance', 
      'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Clothes rack', 'Toilet paper'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  },
  {
    id: '4',
    name: 'Single Room with Mountain View',
    description: 'Perfect for solo travelers with large double bed and all the amenities you need.',
    image: '/image.png',
    bedType: '1 large double bed',
    maxPersons: 1,
    originalPrice: 12247,
    currentPrice: 9432,
    discount: 23,
    available: 1,
    amenities: [
      'Mountain View', 'Single Occupancy', 'Large Double Bed', 'Balcony', 'Patio', 'Terrace',
      'Ensuite bathroom', 'Free toiletries', 'Shower', 'Safety deposit box', 'Toilet', 
      'Towels', 'Linen', 'Socket near the bed', 'Seating Area', 'Private entrance', 
      'TV', 'Fan', 'Carpeted', 'Electric kettle', 'Outdoor furniture', 
      'Outdoor dining area', 'Dining area', 'Dining table', 'Clothes rack', 'Toilet paper'
    ],
    features: ['Free breakfast for Geniuses', 'No prepayment needed', 'No credit card needed', '13% Genius discount']
  }
];

export default function RoomsPage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
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
              We Price Match
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              Our Room Types
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All our rooms feature stunning mountain views, modern amenities, and comfortable furnishings.
            </p>
          </div>

          <div className="space-y-8">
            {roomTypes.map((room) => (
              <Card key={room.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Room Image */}
                  <div className="lg:col-span-1">
                    <div className="relative h-64 lg:h-full">
                      <Image
                        src={room.image}
                        alt={room.name}
                        fill
                        className="object-cover rounded-l-lg"
                      />
                      {room.available === 1 && (
                        <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                          We have {room.available} left
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="lg:col-span-2 p-8">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-hms-primary mb-2">{room.name}</h3>
                        <p className="text-gray-600 mb-4">{room.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <Bed className="w-4 h-4" />
                            <span>{room.bedType}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Max {room.maxPersons} persons</span>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-hms-primary mb-3">Room Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 8).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {room.amenities.length > 8 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.amenities.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <div className="space-y-2">
                          {room.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl font-bold text-hms-primary">
                                {formatPrice(room.currentPrice)}
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                {formatPrice(room.originalPrice)}
                              </span>
                              <Badge className="bg-green-500 text-white">
                                {room.discount}% off
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Includes taxes and charges
                            </p>
                          </div>
                          
                          <Link href="/reservations">
                            <Button className="bg-hms-primary hover:bg-hms-primary/90 text-white px-6">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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