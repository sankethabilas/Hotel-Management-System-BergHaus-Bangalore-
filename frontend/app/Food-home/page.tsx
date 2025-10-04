'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import BannerSlideshow from '@/components/BannerSlideshow';
import Footer from '@/components/footer';
import { ShoppingCart, Clock, Star, Utensils } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50">
      <Header />
      
      {/* Welcome Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
            style={{ 
              backgroundImage: "url('/411067124 (1).jpg')",
              transform: 'scale(1.1)' // Slightly scale up to avoid blur edge artifacts
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">Welcome to BergHaus</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Experience exceptional dining with our premium food and beverage service. 
            Order from your room or enjoy our restaurant facilities.
          </p>
          <Link
            href="/guest/menu"
            className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
          >
            <Utensils className="mr-3 h-6 w-6" />
            Order Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose BergHaus?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide an exceptional dining experience with quality food and seamless service
            </p>
          </div>

        </div>
      </section>

      {/* Banner Slideshow Section - Full Width */}
      <BannerSlideshow />

      {/* Features Section Continued */}
      <section className="py-20">
        <div className="container mx-auto px-6">

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Premium Quality</h3>
              <p className="text-gray-600">
                Fresh ingredients and expertly crafted dishes prepared by our skilled chefs
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Fast Service</h3>
              <p className="text-gray-600">
                Quick order processing and efficient delivery to your room or dining area
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Easy Ordering</h3>
              <p className="text-gray-600">
                Simple and intuitive online ordering system with real-time order tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
