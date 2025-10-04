'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Pamela',
    location: 'Italy',
    rating: 5,
    comment: 'We stayed after stage 16 of pekoe trail. The owner sent a car to pick us up for free at the train station. We asked for lunch, dinner and everything was perfect!',
    date: '2 weeks ago',
    avatar: '/IMG-20250815-WA0008.jpg'
  },
  {
    id: '2',
    name: 'Kelly',
    location: 'New Zealand',
    rating: 5,
    comment: 'This was our favourite stay on the Pekoe Trail and one of the nicest places we\'ve stayed in Sri Lanka! The guesthouse is absolutely stunning, set in the hills.',
    date: '1 month ago',
    avatar: '/IMG-20250815-WA0009.jpg'
  },
  {
    id: '3',
    name: 'Georgia',
    location: 'Australia',
    rating: 5,
    comment: 'Great view from the room and bed, the bed was so comfortable! The owners were really nice and it\'s in a quiet location in the hills.',
    date: '3 weeks ago',
    avatar: '/IMG-20250815-WA0010.jpg'
  },
  {
    id: '4',
    name: 'Antoinette',
    location: 'Netherlands',
    rating: 5,
    comment: 'We had such a nice welcome by the friendly owner. She made us feel at home and gave us such good service. As well as the staff. Our stay of one night was perfect!',
    date: '1 week ago',
    avatar: '/IMG-20250815-WA0011.jpg'
  }
];

export default function ReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex];

  return (
    <div className="relative">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-hms-highlight/20 to-white">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Quote Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-hms-primary" />
              </div>
            </div>

            {/* Review Content */}
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed italic mb-6">
                "{currentReview.comment}"
              </p>

              {/* Rating */}
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(currentReview.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-hms-accent text-hms-accent" />
                ))}
              </div>

              {/* Reviewer Info */}
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-hms-primary">{currentReview.name}</h4>
                <p className="text-gray-600">{currentReview.location}</p>
                <p className="text-sm text-gray-500">{currentReview.date}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center space-x-4 pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevReview}
                className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Dots Indicator */}
              <div className="flex space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-hms-primary w-8' 
                        : 'bg-gray-300 hover:bg-hms-primary/50'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextReview}
                className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
