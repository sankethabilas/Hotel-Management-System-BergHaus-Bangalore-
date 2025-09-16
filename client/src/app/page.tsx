'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ShoppingCart, Clock, Star, Utensils } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-secondary-300">BergHaus</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Experience exceptional dining with our premium food & beverage service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/guest/menu"
                className="bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <Utensils className="mr-2 h-5 w-5" />
                View Menu
              </Link>
              <Link
                href="/admin"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>
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

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse our extensive menu and place your order in just a few clicks
          </p>
          <Link
            href="/guest/menu"
            className="bg-primary hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center text-lg"
          >
            <Utensils className="mr-3 h-6 w-6" />
            Explore Menu
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}