'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  createdBy: {
    username: string;
    fullName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BannerSlideshow: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length, isPaused]);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/banners');
      const data = await response.json();
      
      if (data.success && data.data) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deal': return '🔥';
      case 'promotion': return '🎉';
      case 'announcement': return '📢';
      case 'feature': return '⭐';
      default: return '🎨';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'deal': return 'from-red-500 to-orange-500';
      case 'promotion': return 'from-purple-500 to-pink-500';
      case 'announcement': return 'from-blue-500 to-indigo-500';
      case 'feature': return 'from-yellow-500 to-amber-500';
      default: return 'from-primary-600 to-primary-800';
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 animate-pulse">
        <div className="w-full h-full flex items-center justify-center px-6">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading banners...</p>
          </div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="w-full h-full flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-amber-300">BergHaus</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Experience exceptional dining with our premium food & beverage service
            </p>
            <Link
              href="/guest/menu"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center"
            >
              🍽️ Browse Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  return (
    <section 
      className="relative overflow-hidden h-96 md:h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image - Clean, no overlays */}
      <div className="absolute inset-0">
        <Image
          src={`http://localhost:5001${currentBanner.image}`}
          alt={currentBanner.title}
          fill
          className="object-cover transition-all duration-1000 ease-in-out"
          priority
        />
        {/* Light overlay only for text readability */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center px-6">
        <div className="max-w-3xl text-white">
          {/* Type Badge */}
          <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <span className="text-2xl mr-2">{getTypeIcon(currentBanner.type)}</span>
            <span className="font-medium capitalize">{currentBanner.type}</span>
          </div>

          {/* Title with Animation */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-fade-in-up">
            {currentBanner.title}
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in-up animation-delay-200">
            {currentBanner.description}
          </p>

          {/* CTA Button */}
          <Link
            href={currentBanner.buttonLink}
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-all duration-300 inline-flex items-center transform hover:scale-105 animate-fade-in-up animation-delay-400"
          >
            {currentBanner.buttonText}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {banners.length > 1 && (
        <div className="absolute top-6 right-6 bg-black bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {banners.length}
        </div>
      )}

      {/* Progress Bar */}
      {banners.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
          <div 
            className="h-full bg-white transition-all duration-75 ease-linear"
            style={{
              width: '0%',
              animation: 'progress 5s linear infinite'
            }}
          />
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default BannerSlideshow;
