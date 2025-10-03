'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  buttonText?: string;
}

// Sample banner data - in a real app, this would come from an API
const banners: Banner[] = [
  {
    id: '1',
    title: 'Special Weekend Brunch',
    description: 'Enjoy our signature brunch menu every weekend with live cooking stations',
    image: '/banner-1.jpg',
    link: '/guest/menu',
    buttonText: 'View Menu'
  },
  {
    id: '2',
    title: 'Chef\'s Special Tonight',
    description: 'Try our chef\'s recommended dish of the day with premium ingredients',
    image: '/banner-2.jpg',
    link: '/guest/menu',
    buttonText: 'Order Now'
  },
  {
    id: '3',
    title: 'Happy Hour Drinks',
    description: '50% off on selected beverages from 5 PM to 7 PM daily',
    image: '/banner-3.jpg',
    link: '/guest/menu',
    buttonText: 'Explore Drinks'
  }
];

export default function BannerSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.image}
          alt={currentBanner.title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to a placeholder if image doesn't exist
            e.currentTarget.src = '/placeholder-banner.jpg';
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {currentBanner.title}
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              {currentBanner.description}
            </p>
            {currentBanner.link && (
              <a
                href={currentBanner.link}
                className="inline-block bg-white text-gray-900 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
              >
                {currentBanner.buttonText}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
        aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isAutoPlaying ? (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-1 h-4 bg-white mr-1"></div>
            <div className="w-1 h-4 bg-white"></div>
          </div>
        ) : (
          <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
        )}
      </button>
    </div>
  );
}
