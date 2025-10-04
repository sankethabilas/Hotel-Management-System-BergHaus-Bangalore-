'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  _id: string;
  title: string;
  description: string;
  image: string;
  type: 'deal' | 'promotion' | 'announcement' | 'feature';
  isActive: boolean;
  priority: number;
  buttonText: string;
  buttonLink: string;
  startDate: Date;
  endDate?: Date;
}

export default function BannerSlideshow() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/banners');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Filter active banners and sort by priority
          const activeBanners = data.data
            .filter((banner: Banner) => banner.isActive)
            .sort((a: Banner, b: Banner) => b.priority - a.priority);
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

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

  // Don't render if loading or no banners
  if (isLoading) {
    return (
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Welcome to BergHaus</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Experience exceptional dining with our premium food and beverage service
          </p>
          <a
            href="/guest/menu"
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            View Menu
          </a>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={`http://localhost:5000${currentBanner.image}`}
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
            {currentBanner.buttonLink && (
              <a
                href={currentBanner.buttonLink}
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
