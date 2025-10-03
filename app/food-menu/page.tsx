'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Utensils, 
  Coffee, 
  Wine, 
  Clock, 
  Star,
  ArrowLeft,
  ChefHat,
  Leaf,
  Flame,
  Heart
} from 'lucide-react';

// Sample menu data
const menuCategories = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    icon: Coffee,
    description: 'Start your day with our delicious breakfast options',
    items: [
      {
        id: 1,
        name: 'Traditional Sri Lankan Breakfast',
        description: 'Rice and curry with coconut sambol, fish curry, and vegetables',
        price: 1200,
        image: '/menu/breakfast-1.jpg',
        isPopular: true,
        isVegetarian: false,
        isSpicy: true
      },
      {
        id: 2,
        name: 'Continental Breakfast',
        description: 'Fresh fruits, yogurt, croissants, and coffee',
        price: 800,
        image: '/menu/breakfast-2.jpg',
        isPopular: false,
        isVegetarian: true,
        isSpicy: false
      },
      {
        id: 3,
        name: 'English Breakfast',
        description: 'Eggs, bacon, sausages, baked beans, and toast',
        price: 1000,
        image: '/menu/breakfast-3.jpg',
        isPopular: true,
        isVegetarian: false,
        isSpicy: false
      }
    ]
  },
  {
    id: 'lunch',
    title: 'Lunch',
    icon: Utensils,
    description: 'Hearty meals to fuel your afternoon adventures',
    items: [
      {
        id: 4,
        name: 'Kottu Roti',
        description: 'Chopped roti with vegetables, egg, and choice of meat',
        price: 1500,
        image: '/menu/lunch-1.jpg',
        isPopular: true,
        isVegetarian: false,
        isSpicy: true
      },
      {
        id: 5,
        name: 'Fish Curry & Rice',
        description: 'Fresh fish curry with basmati rice and accompaniments',
        price: 1800,
        image: '/menu/lunch-2.jpg',
        isPopular: true,
        isVegetarian: false,
        isSpicy: true
      },
      {
        id: 6,
        name: 'Vegetable Curry Platter',
        description: 'Assorted vegetable curries with rice and papadum',
        price: 1200,
        image: '/menu/lunch-3.jpg',
        isPopular: false,
        isVegetarian: true,
        isSpicy: false
      }
    ]
  },
  {
    id: 'dinner',
    title: 'Dinner',
    icon: Wine,
    description: 'Elegant dining experience with local and international cuisine',
    items: [
      {
        id: 7,
        name: 'Lobster Thermidor',
        description: 'Fresh lobster in creamy sauce with rice and vegetables',
        price: 3500,
        image: '/menu/dinner-1.jpg',
        isPopular: true,
        isVegetarian: false,
        isSpicy: false
      },
      {
        id: 8,
        name: 'Sri Lankan Feast',
        description: 'Traditional multi-course meal with 12 different curries',
        price: 2500,
        image: '/menu/dinner-2.jpg',
        isPopular: true,
        isVegetarian: false,
        isSpicy: true
      },
      {
        id: 9,
        name: 'Grilled Chicken',
        description: 'Herb-marinated chicken with roasted vegetables',
        price: 2000,
        image: '/menu/dinner-3.jpg',
        isPopular: false,
        isVegetarian: false,
        isSpicy: false
      }
    ]
  },
  {
    id: 'beverages',
    title: 'Beverages',
    icon: Coffee,
    description: 'Refreshing drinks and hot beverages',
    items: [
      {
        id: 10,
        name: 'Ceylon Tea',
        description: 'Premium Ceylon black tea served with milk and sugar',
        price: 300,
        image: '/menu/beverage-1.jpg',
        isPopular: true,
        isVegetarian: true,
        isSpicy: false
      },
      {
        id: 11,
        name: 'Fresh Fruit Juice',
        description: 'Seasonal fresh fruit juice (mango, pineapple, or orange)',
        price: 500,
        image: '/menu/beverage-2.jpg',
        isPopular: false,
        isVegetarian: true,
        isSpicy: false
      },
      {
        id: 12,
        name: 'King Coconut Water',
        description: 'Fresh king coconut water served in the shell',
        price: 400,
        image: '/menu/beverage-3.jpg',
        isPopular: true,
        isVegetarian: true,
        isSpicy: false
      }
    ]
  }
];

const specialOffers = [
  {
    title: 'Early Bird Breakfast',
    description: '20% off breakfast items before 8:00 AM',
    discount: '20% OFF',
    validUntil: 'Daily'
  },
  {
    title: 'Family Lunch Special',
    description: 'Free dessert with family meals (4+ people)',
    discount: 'FREE DESSERT',
    validUntil: 'Weekends'
  },
  {
    title: 'Romantic Dinner',
    description: 'Complimentary wine with dinner for two',
    discount: 'FREE WINE',
    validUntil: 'Evenings'
  }
];

export default function FoodMenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-hms-primary to-hms-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <ChefHat className="w-12 h-12 mr-4" />
              <h1 className="text-5xl font-bold">Food Menu</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Discover our exquisite culinary offerings featuring traditional Sri Lankan cuisine 
              and international favorites, prepared with fresh local ingredients.
            </p>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>7:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                <span>4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-4 bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" className="text-hms-primary hover:text-hms-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {menuCategories.map((category) => (
            <div key={category.id} className="mb-16">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <category.icon className="w-8 h-8 text-hms-primary mr-3" />
                  <h2 className="text-4xl font-bold text-hms-primary">{category.title}</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((item) => (
                  <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to a placeholder if image doesn't exist
                          e.currentTarget.src = '/placeholder-food.jpg';
                        }}
                      />
                      <div className="absolute top-4 right-4 flex flex-col space-y-2">
                        {item.isPopular && (
                          <Badge className="bg-hms-accent text-hms-primary font-semibold">
                            Popular
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          {item.isVegetarian && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Leaf className="w-3 h-3 mr-1" />
                              Veg
                            </Badge>
                          )}
                          {item.isSpicy && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              <Flame className="w-3 h-3 mr-1" />
                              Spicy
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <CardTitle className="text-xl font-bold text-hms-primary mb-2">
                        {item.name}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-hms-primary">
                          LKR {item.price.toLocaleString()}
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-hms-primary hover:bg-hms-primary/90 text-white"
                        >
                          Order Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gradient-to-br from-hms-highlight/20 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              Special Offers
            </Badge>
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              Today's Specials
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Don't miss out on our exclusive dining offers and promotions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialOffers.map((offer, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-hms-primary/5 to-hms-accent/10">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <Badge className="bg-hms-primary text-white font-bold text-lg px-4 py-2">
                      {offer.discount}
                    </Badge>
                    <h3 className="text-xl font-bold text-hms-primary">{offer.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{offer.description}</p>
                    <div className="pt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Valid: {offer.validUntil}</p>
                    </div>
                    <Button className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Ready to Experience Our Cuisine?
            </h2>
            <p className="text-xl text-blue-100">
              Book a table or order room service to enjoy our delicious meals. 
              Our chefs are ready to create an unforgettable dining experience for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-white text-hms-primary hover:bg-gray-100 px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                >
                  Book a Table
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-hms-primary px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
