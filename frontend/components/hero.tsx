'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image.png"
          alt="Luxury Hotel Interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          {/* Hotel Name */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
              Berghaus Bungalow
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-hms-accent text-hms-accent" />
              ))}
              <span className="text-xl font-medium ml-2">9.4/10 Rating</span>
            </div>
          </div>

          {/* Welcome Message */}
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
            Experience Comfort & Warmth in the Beautiful Hills of Ella, Sri Lanka
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link href="/reservations">
              <Button 
                size="lg" 
                className="bg-hms-primary hover:bg-hms-primary/90 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Book Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/rooms">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white bg-white text-hms-primary px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                View Rooms
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
