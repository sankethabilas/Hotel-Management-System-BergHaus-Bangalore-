'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';

interface Feedback {
  _id: string;
  name: string;
  email: string;
  category: string;
  rating: {
    checkIn: number;
    roomQuality: number;
    cleanliness: number;
    dining: number;
    amenities: number;
  };
  comments: string;
  anonymous: boolean;
  status: string;
  createdAt: string;
  overallRating: number;
}

const FeedbackShowcase = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviewed feedback
  const fetchReviewedFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/feedback/public?limit=5', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const feedbackData = data.data || [];
        setFeedback(feedbackData);
      } else {
        throw new Error(data.message || 'Failed to fetch feedback');
      }
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewedFeedback();
  }, []);

  // Auto-rotate feedback every 5 seconds
  useEffect(() => {
    if (feedback.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % feedback.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [feedback.length]);

  const nextFeedback = () => {
    setCurrentIndex((prev) => (prev + 1) % feedback.length);
  };

  const prevFeedback = () => {
    setCurrentIndex((prev) => (prev - 1 + feedback.length) % feedback.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Front Desk': 'bg-blue-100 text-blue-800',
      'Restaurant': 'bg-green-100 text-green-800',
      'Room Service': 'bg-purple-100 text-purple-800',
      'Facilities': 'bg-orange-100 text-orange-800',
      'Management': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading guest feedback...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Unable to load guest feedback at the moment.
                </p>
                <Button onClick={fetchReviewedFeedback} variant="outline" size="sm">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <ThumbsUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No reviewed feedback available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentFeedback = feedback[currentIndex];

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-800 font-semibold mb-4">
            <ThumbsUp className="w-4 h-4 mr-1" />
            Guest Reviews
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover why our guests love staying at Berghaus Bungalow
          </p>
        </div>

        {/* Feedback Carousel */}
        <div className="relative">
          <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Guest Info */}
                <div className="flex-shrink-0 text-center lg:text-left">
                  <Avatar className="w-16 h-16 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600">
                    <AvatarFallback className="text-white font-semibold text-lg">
                      {currentFeedback.anonymous ? 'A' : currentFeedback.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentFeedback.anonymous ? 'Anonymous Guest' : currentFeedback.name}
                    </h3>
                    
                    <Badge className={getCategoryColor(currentFeedback.category)}>
                      {currentFeedback.category}
                    </Badge>
                    
                    <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(currentFeedback.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Overall Rating */}
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.round(currentFeedback.overallRating))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {currentFeedback.overallRating}/5
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg text-gray-700 italic mb-6 relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                    <p className="pl-6">
                      {currentFeedback.comments || 'Thank you for the wonderful stay!'}
                    </p>
                  </blockquote>

                  {/* Detailed Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">Check-in</p>
                      <div className="flex justify-center">
                        {renderStars(currentFeedback.rating.checkIn)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">Room Quality</p>
                      <div className="flex justify-center">
                        {renderStars(currentFeedback.rating.roomQuality)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">Cleanliness</p>
                      <div className="flex justify-center">
                        {renderStars(currentFeedback.rating.cleanliness)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">Dining</p>
                      <div className="flex justify-center">
                        {renderStars(currentFeedback.rating.dining)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">Amenities</p>
                      <div className="flex justify-center">
                        {renderStars(currentFeedback.rating.amenities)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          {feedback.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                onClick={prevFeedback}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                onClick={nextFeedback}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {feedback.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {feedback.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {feedback.length}
              </div>
              <p className="text-gray-600">Guest Reviews</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length).toFixed(1)}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round((feedback.filter(f => f.overallRating >= 4).length / feedback.length) * 100)}%
              </div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackShowcase;
