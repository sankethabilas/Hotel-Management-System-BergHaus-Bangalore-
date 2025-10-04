'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import BannerSlideshow from '@/components/BannerSlideshow';
import Footer from '@/components/footer';
import Masonry from '@/components/Masonry';
import { ShoppingCart, Clock, Star, Utensils } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/currency';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isPopular: boolean;
}

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setIsLoadingItems(true);
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Get featured items (popular or first 12 available items)
          const featured = data.data
            .filter((item: MenuItem) => item.isAvailable)
            .slice(0, 12); // Show first 12 items
          setFeaturedItems(featured);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  // Convert menu items to masonry format
  const masonryItems = featuredItems.map((item, index) => ({
    id: item._id,
    img: item.image ? `http://localhost:5000${item.image}` : '/placeholder-food.jpg',
    url: `/guest/menu/${item._id}`,
    height: 300 + (index % 3) * 100, // Varied heights for masonry effect
    title: item.name,
    price: formatCurrency(item.price)
  }));

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

      {/* Featured Food Items Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Dishes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular dishes crafted with love and the finest ingredients
            </p>
          </div>

          {isLoadingItems ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading delicious dishes...</p>
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="mb-12">
              <Masonry
                items={masonryItems}
                ease="power3.out"
                duration={0.6}
                stagger={0.05}
                animateFrom="bottom"
                scaleOnHover={true}
                hoverScale={1.05}
                blurToFocus={true}
                colorShiftOnHover={false}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes available yet</h3>
              <p className="text-gray-500">Our chefs are preparing something amazing for you!</p>
            </div>
          )}


        </div>
      </section>

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
