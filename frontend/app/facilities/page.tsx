'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  CheckCircle, 
  Star, 
  Users, 
  Car, 
  Wifi, 
  Coffee, 
  Utensils, 
  Waves, 
  TreePine,
  Mountain,
  Camera,
  Shield,
  MapPin,
  Plane,
  Train,
  ForkKnife,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Consolidated Categories
const facilityCategories = [
  {
    title: "Room Features & Comfort",
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600",
    facilities: [
      { name: "Private bathroom with shower" },
      { name: "Premium linens & towels" },
      { name: "Free toiletries" },
      { name: "Private entrance" },
      { name: "Socket near the bed" },
      { name: "Clothes rack" },
      { name: "Seating area" },
      { name: "Non-smoking rooms" }
    ]
  },
  {
    title: "Outdoors & Views",
    icon: <Mountain className="w-6 h-6" />,
    color: "bg-green-50 text-green-600",
    facilities: [
      { name: "Stunning Mountain view" },
      { name: "Garden access" },
      { name: "Private Balcony" },
      { name: "Terrace & Patio" },
      { name: "Outdoor furniture" },
      { name: "Outdoor dining area" },
      { name: "BBQ facilities", note: "Additional charge" }
    ]
  },
  {
    title: "Dining & Food",
    icon: <Utensils className="w-6 h-6" />,
    color: "bg-orange-50 text-orange-600",
    facilities: [
      { name: "Breakfast included" },
      { name: "Kid-friendly buffet" },
      { name: "Dietary options available" },
      { name: "Tea/Coffee maker" },
      { name: "Dining table" },
      { name: "Room service" }
    ]
  },
  {
    title: "Services & Security",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600",
    facilities: [
      { name: "Free private parking" },
      { name: "Daily housekeeping" },
      { name: "24-hour security" },
      { name: "Car hire service" },
      { name: "Airport shuttle", note: "Paid" },
      { name: "Laundry service", note: "Paid" },
      { name: "CCTV in common areas" }
    ]
  },
  {
    title: "Activities & Experience",
    icon: <Camera className="w-6 h-6" />,
    color: "bg-yellow-50 text-yellow-600",
    facilities: [
      { name: "Cooking class", note: "Off-site" },
      { name: "Local culture tours" },
      { name: "Walking tours" },
      { name: "Hiking trails nearby" },
      { name: "Bicycle rental" },
      { name: "Digital Detox (No WiFi)" }
    ]
  },
  {
    title: "Family Friendly",
    icon: <Users className="w-6 h-6" />,
    color: "bg-pink-50 text-pink-600",
    facilities: [
      { name: "Spacious Family rooms" },
      { name: "Books, DVDs for kids" },
      { name: "Kids' outdoor play equipment" },
      { name: "Baby safety gates" },
      { name: "Board games/puzzles" }
    ]
  }
];

const hotelSurroundings = [
  {
    title: "Nearby Attractions",
    icon: <MapPin className="w-6 h-6" />,
    items: [
      { name: "Nine Arch Bridge", dist: "5 km" },
      { name: "Ella Spice Garden", dist: "5 km" },
      { name: "Little Adam's Peak", dist: "7 km" }
    ]
  },
  {
    title: "Transit",
    icon: <Train className="w-6 h-6" />,
    items: [
      { name: "Demodara Railway Station", dist: "1.7 km" },
      { name: "Ella Railway Station", dist: "4.9 km" },
      { name: "Mattala Int. Airport", dist: "92 km" }
    ]
  },
  {
    title: "Dining",
    icon: <ForkKnife className="w-6 h-6" />,
    items: [
      { name: "The Kitchen Garden", dist: "3.1 km" },
      { name: "Mandala Cafe & Bar", dist: "5 km" },
      { name: "The Barn by Starbeans", dist: "5 km" }
    ]
  }
];

export default function FacilitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/locations/nine-arch.jpg" 
            alt="Facilities Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
             <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1 flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm tracking-wide">9.6 Guest Rating for Facilities</span>
             </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-lg">
            World-Class <span className="text-hms-accent">Amenities</span>
          </h1>
          <p className="text-xl text-white/90 font-light leading-relaxed mb-10">
            From breath-taking mountain views to premium in-room comforts, explore what makes your stay at Berghaus Bungalow exceptional.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['Free Parking', 'Mountain Views', 'Excellent Breakfast', 'Digital Detox'].map((item, i) => (
              <Badge key={i} className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 text-sm backdrop-blur-sm">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilityCategories.map((category, index) => (
            <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group bg-white rounded-3xl">
              <div className={`h-2 ${category.color.split(' ')[0]} w-full`}></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${category.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-hms-primary transition-colors">{category.title}</h3>
                </div>
                
                <ul className="space-y-4">
                  {category.facilities.map((facility, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-hms-primary/60 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">{facility.name}</span>
                        {facility.note && (
                          <span className="text-xs text-hms-secondary font-semibold uppercase tracking-wider mt-0.5">{facility.note}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Surroundings Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="text-left max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Prime <span className="text-hms-primary">Location</span></h2>
              <p className="text-lg text-gray-600">
                Immerse yourself in the heart of Ella. We are comfortably situated near all major attractions while maintaining a peaceful atmosphere.
              </p>
            </div>
            <Button variant="outline" className="border-gray-200 hover:border-hms-primary hover:text-hms-primary px-6">
              View on Map
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotelSurroundings.map((section, idx) => (
              <div key={idx} className="bg-gray-50 rounded-3xl p-8 hover:bg-hms-primary/5 transition-colors duration-300 border border-transparent hover:border-hms-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-hms-primary">
                    {section.icon}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-gray-700 font-medium group-hover:text-hms-primary transition-colors">{item.name}</span>
                      <Badge variant="secondary" className="bg-white text-gray-500 shadow-sm border border-gray-100">{item.dist}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hms-primary">
           <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to experience these amenities?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Book now to secure your stay and enjoy our premium facilities and breathtaking views.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservations">
              <Button size="lg" className="bg-white text-hms-primary hover:bg-blue-50 px-12 py-6 text-xl font-bold shadow-2xl rounded-full">
                Check Availability
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
