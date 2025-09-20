'use client';

import React from 'react';
import Image from 'next/image';
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
  Sparkles, 
  Dumbbell,
  Shield,
  UserCheck,
  Plane,
  Home,
  TreePine,
  Mountain,
  Camera,
  BookOpen,
  Baby,
  Lock,
  Clock,
  MapPin,
  Phone,
  Mail,
  Map,
  Train,
  ForkKnife
} from 'lucide-react';

const facilityCategories = [
  {
    title: "Great for your stay",
    icon: <Home className="w-6 h-6" />,
    facilities: [
      { name: "Parking", available: true },
      { name: "Balcony", available: true },
      { name: "Private bathroom", available: true },
      { name: "View", available: true },
      { name: "Terrace", available: true },
      { name: "Pets allowed", available: true },
      { name: "Shuttle service", available: true },
      { name: "Family rooms", available: true },
      { name: "Non-smoking rooms", available: true },
      { name: "Free parking", available: true }
    ]
  },
  {
    title: "Bathroom",
    icon: <Waves className="w-6 h-6" />,
    facilities: [
      { name: "Toilet paper", available: true },
      { name: "Towels", available: true },
      { name: "Private bathroom", available: true },
      { name: "Toilet", available: true },
      { name: "Free toiletries", available: true },
      { name: "Shower", available: true }
    ]
  },
  {
    title: "Bedroom",
    icon: <Users className="w-6 h-6" />,
    facilities: [
      { name: "Linen", available: true }
    ]
  },
  {
    title: "View",
    icon: <Mountain className="w-6 h-6" />,
    facilities: [
      { name: "Mountain view", available: true },
      { name: "Garden view", available: true },
      { name: "View", available: true }
    ]
  },
  {
    title: "Outdoors",
    icon: <TreePine className="w-6 h-6" />,
    facilities: [
      { name: "Outdoor furniture", available: true },
      { name: "Outdoor dining area", available: true },
      { name: "BBQ facilities", available: true, note: "Additional charge" },
      { name: "Patio", available: true },
      { name: "Balcony", available: true },
      { name: "Terrace", available: true },
      { name: "Garden", available: true }
    ]
  },
  {
    title: "Kitchen",
    icon: <Utensils className="w-6 h-6" />,
    facilities: [
      { name: "Dining table", available: true }
    ]
  },
  {
    title: "Room Amenities",
    icon: <Home className="w-6 h-6" />,
    facilities: [
      { name: "Socket near the bed", available: true },
      { name: "Clothes rack", available: true }
    ]
  },
  {
    title: "Activities",
    icon: <Camera className="w-6 h-6" />,
    facilities: [
      { name: "Bicycle rental", available: true, note: "Additional charge" },
      { name: "Cooking class", available: true, note: "Additional charge Off-site" },
      { name: "Tour or class about local culture", available: true, note: "Additional charge" },
      { name: "Hiking", available: true, note: "Additional charge" }
    ]
  },
  {
    title: "Living Area",
    icon: <Home className="w-6 h-6" />,
    facilities: [
      { name: "Dining area", available: true },
      { name: "Seating Area", available: true }
    ]
  },
  {
    title: "Food & Drink",
    icon: <Coffee className="w-6 h-6" />,
    facilities: [
      { name: "Kid-friendly buffet", available: true },
      { name: "Kid meals", available: true }
    ]
  },
  {
    title: "Services",
    icon: <UserCheck className="w-6 h-6" />,
    facilities: [
      { name: "Shuttle service", available: true, note: "Additional charge" },
      { name: "Daily housekeeping", available: true },
      { name: "Private check-in/check-out", available: true },
      { name: "Car hire", available: true },
      { name: "Ironing service", available: true, note: "Additional charge" },
      { name: "Laundry", available: true, note: "Additional charge" }
    ]
  },
  {
    title: "Entertainment and family services",
    icon: <BookOpen className="w-6 h-6" />,
    facilities: [
      { name: "Books, DVDs, or music for children", available: true }
    ]
  },
  {
    title: "Safety & security",
    icon: <Shield className="w-6 h-6" />,
    facilities: [
      { name: "CCTV in common areas", available: true },
      { name: "24-hour security", available: true },
      { name: "Safety deposit box", available: true }
    ]
  },
  {
    title: "General",
    icon: <Home className="w-6 h-6" />,
    facilities: [
      { name: "Private entrance", available: true },
      { name: "Carpeted", available: true },
      { name: "Fan", available: true },
      { name: "Family rooms", available: true },
      { name: "Non-smoking rooms", available: true }
    ]
  },
  {
    title: "Languages spoken",
    icon: <Users className="w-6 h-6" />,
    facilities: [
      { name: "English", available: true }
    ]
  }
];

const mostPopularFacilities = [
  { name: "Family rooms", icon: <Users className="w-5 h-5" /> },
  { name: "Free parking", icon: <Car className="w-5 h-5" /> },
  { name: "Non-smoking rooms", icon: <Shield className="w-5 h-5" /> },
  { name: "Breakfast", icon: <Coffee className="w-5 h-5" /> }
];

const hotelSurroundings = [
  {
    title: "What's nearby",
    icon: <Users className="w-6 h-6" />,
    locations: [
      { name: "Ella Spice Garden", distance: "5 km" },
      { name: "Demodara Nine Arch Bridge", distance: "5 km" },
      { name: "Senanayaka Childrens Park", distance: "14 km" },
      { name: "Army Volunteer Training Drill Ground", distance: "19 km" }
    ]
  },
  {
    title: "Restaurants & cafes",
    icon: <ForkKnife className="w-6 h-6" />,
    locations: [
      { name: "Restaurant • The Kitchen Garden", distance: "3.1 km" },
      { name: "Cafe/bar • Mandala Cafe & Bar", distance: "5 km" },
      { name: "Restaurant • The Barn by Starbeans", distance: "5 km" }
    ]
  },
  {
    title: "Public transport",
    icon: <Train className="w-6 h-6" />,
    locations: [
      { name: "Train • Demodara Railway Station", distance: "1.7 km" },
      { name: "Train • Ella Railway Station", distance: "4.9 km" }
    ]
  },
  {
    title: "Natural beauty",
    icon: <Mountain className="w-6 h-6" />,
    locations: [
      { name: "Peak • Little Adam's Peak", distance: "7 km" },
      { name: "Forest • Forest Reserve", distance: "13 km" }
    ]
  },
  {
    title: "Closest airports",
    icon: <Plane className="w-6 h-6" />,
    locations: [
      { name: "Mattala Rajapaksa International Airport", distance: "92 km" },
      { name: "Weerawila Airport", distance: "99 km" }
    ]
  }
];

export default function FacilitiesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Facilities of Berghaus Bungalow</h1>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Star className="w-6 h-6 fill-hms-accent text-hms-accent" />
              <span className="text-xl font-medium">Great facilities! Review score, 9.3</span>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover all the amenities and services that make your stay at Berghaus Bungalow 
              comfortable and memorable in the beautiful hills of Ella, Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Most Popular Facilities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-hms-primary mb-4">Most Popular Facilities</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mostPopularFacilities.map((facility, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                      {facility.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-hms-primary">{facility.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Facilities */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">All Facilities & Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need for a comfortable and enjoyable stay at Berghaus Bungalow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilityCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-hms-primary">{category.title}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {category.facilities.map((facility, facilityIndex) => (
                      <div key={facilityIndex} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{facility.name}</span>
                        </div>
                        {facility.note && (
                          <Badge variant="secondary" className="text-xs">
                            {facility.note}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hotel Surroundings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">Hotel Surroundings</h2>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Star className="w-6 h-6 fill-hms-accent text-hms-accent" />
              <span className="text-xl font-medium text-hms-primary">Excellent location</span>
              <Button variant="outline" className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white">
                <Map className="w-4 h-4 mr-2" />
                Show map
              </Button>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover the beautiful surroundings and nearby attractions that make Berghaus Bungalow 
              the perfect base for exploring Ella and the surrounding hill country.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelSurroundings.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-hms-primary/10 rounded-full flex items-center justify-center text-hms-primary">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-hms-primary">{category.title}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {category.locations.map((location, locationIndex) => (
                      <div key={locationIndex} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-gray-700 font-medium">{location.name}</p>
                        </div>
                        <Badge variant="secondary" className="ml-3">
                          {location.distance}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Notes */}
      <section className="py-16 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-hms-primary/5 to-hms-accent/10">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-hms-primary mb-4">Internet Access</h3>
                <p className="text-gray-600 mb-4">
                  No internet access available. Perfect for a digital detox in the beautiful hills of Ella.
                </p>
                <div className="flex items-center space-x-2 text-hms-primary">
                  <Wifi className="w-5 h-5" />
                  <span className="font-medium">Digital Detox Experience</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-hms-secondary/5 to-hms-highlight/10">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-hms-primary mb-4">Parking Information</h3>
                <p className="text-gray-600 mb-4">
                  Free private parking is possible on site (reservation is not needed).
                </p>
                <div className="flex items-center space-x-2 text-hms-primary">
                  <Car className="w-5 h-5" />
                  <span className="font-medium">Convenient & Free</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Experience All These Facilities
            </h2>
            <p className="text-xl text-blue-100">
              Book your stay at Berghaus Bungalow and enjoy all these amazing facilities 
              in the beautiful hills of Ella, Sri Lanka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-hms-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Book Your Stay
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-hms-primary px-8 py-4 text-lg font-semibold">
                View Rooms
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
