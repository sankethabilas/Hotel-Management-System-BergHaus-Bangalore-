'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const heroImages = [
  '/IMG-20250815-WA0006.jpg', // Interior
  '/IMG-20250815-WA0023.jpg', // Large area
  '/IMG-20250815-WA0027.jpg', // Exterior
  '/IMG-20250815-WA0021.jpg', // View
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image Slider */}
      {heroImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Luxury Hotel View ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
        </div>
      ))}

      {/* Slider Controls (Optional, for manual navigation) */}
      <button 
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors duration-300 hidden md:block"
      >
        <ChevronLeft size={48} />
      </button>
      <button 
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors duration-300 hidden md:block"
      >
        <ChevronRight size={48} />
      </button>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="max-w-5xl mx-auto px-4 text-center text-white">
          {/* Animated Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 animate-fade-in border border-white/20">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-hms-accent text-hms-accent" />
              ))}
            </div>
            <span className="text-sm font-medium tracking-wide">9.4/10 Excellent Rating</span>
          </div>

          {/* Hotel Name */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-slide-up tracking-tight drop-shadow-lg">
            Berghaus <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-hms-highlight">Bungalow</span>
          </h1>

          {/* Welcome Message */}
          <p className="text-xl md:text-2xl mb-10 text-gray-100 animate-slide-up animation-delay-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Your luxury sanctuary in the heart of Ella's lush hills.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up animation-delay-400">
            <Link href="/reservations">
              <Button 
                size="lg" 
                className="bg-hms-primary hover:bg-hms-primary/90 text-white px-10 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(47,160,223,0.5)] rounded-full border-2 border-transparent"
              >
                Book Your Stay
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/rooms">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-hms-primary px-10 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 rounded-full"
              >
                Discover Rooms
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-gentle text-white/80">
        <span className="text-xs uppercase tracking-widest font-light">Scroll Down</span>
        <div className="w-0.5 h-12 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
}
