'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionData, getAutoFillSuggestions } from '@/lib/sessionUtils';
import { safeJsonParse, getErrorMessage } from '@/lib/safeJsonParse';
import { 
  Star, 
  Smile, 
  Frown, 
  Meh, 
  Upload, 
  X, 
  Send,
  Loader2,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

interface RatingState {
  checkIn: number;
  roomQuality: number;
  cleanliness: number;
  dining: number;
  amenities: number;
}

const StarRating = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  label: string;
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    </div>
  );
};

const SmileyRating = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  label: string;
}) => {
  const smileys = [
    { value: 1, icon: Frown, color: 'text-red-500' },
    { value: 2, icon: Frown, color: 'text-orange-500' },
    { value: 3, icon: Meh, color: 'text-yellow-500' },
    { value: 4, icon: Smile, color: 'text-green-500' },
    { value: 5, icon: Smile, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center space-x-2">
        {smileys.map(({ value: smileyValue, icon: Icon, color }) => (
          <button
            key={smileyValue}
            type="button"
            onClick={() => onChange(smileyValue)}
            className={`focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 ${
              value === smileyValue ? 'bg-blue-100' : ''
            }`}
          >
            <Icon className={`w-8 h-8 ${color}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    </div>
  );
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ratingType, setRatingType] = useState<'stars' | 'smileys'>('stars');
  
  // Get session data for auto-fill
  const sessionData = getSessionData();
  const autoFillSuggestions = getAutoFillSuggestions(sessionData);
  
  const [formData, setFormData] = useState({
    name: autoFillSuggestions.name,
    email: autoFillSuggestions.email,
    phone: autoFillSuggestions.phone,
    category: autoFillSuggestions.category,
    comments: autoFillSuggestions.comments,
    anonymous: false
  });

  const [ratings, setRatings] = useState<RatingState>({
    checkIn: 0,
    roomQuality: 0,
    cleanliness: 0,
    dining: 0,
    amenities: 0
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [images, setImages] = useState<File[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Update form data when component mounts or session data changes
  useEffect(() => {
    const currentSessionData = getSessionData();
    const currentSuggestions = getAutoFillSuggestions(currentSessionData);
    
    const hasAutoFillData = currentSuggestions.name || currentSuggestions.email || currentSuggestions.phone;
    
    setFormData(prev => ({
      ...prev,
      name: currentSuggestions.name || prev.name,
      email: currentSuggestions.email || prev.email,
      phone: currentSuggestions.phone || prev.phone,
      category: currentSuggestions.category || prev.category,
      comments: currentSuggestions.comments || prev.comments
    }));
    
    setIsAutoFilled(!!hasAutoFillData);
  }, []);

  const categories = [
    'Front Desk',
    'Restaurant', 
    'Room Service',
    'Facilities',
    'Management'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters long';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
        if (value.trim().length > 100) return 'Email must be less than 100 characters';
        return '';
      
      case 'comments':
        if (value && value.length > 2000) return 'Comments must be less than 2000 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleRatingChange = (field: keyof RatingState, value: number) => {
    setRatings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were skipped. Only images under 5MB are allowed.",
        variant: "destructive"
      });
    }
    
    setImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Name must be at least 2 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (formData.name.trim().length > 50) {
      toast({
        title: "Validation Error",
        description: "Name must be less than 50 characters",
        variant: "destructive"
      });
      return false;
    }

    // Name format validation (letters, spaces, hyphens, apostrophes only)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      toast({
        title: "Validation Error",
        description: "Name can only contain letters, spaces, hyphens, and apostrophes",
        variant: "destructive"
      });
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error", 
        description: "Email is required",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (formData.email.trim().length > 100) {
      toast({
        title: "Validation Error",
        description: "Email must be less than 100 characters",
        variant: "destructive"
      });
      return false;
    }

    // Category validation
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return false;
    }

    // Comments validation (if provided)
    if (formData.comments && formData.comments.length > 2000) {
      toast({
        title: "Validation Error",
        description: "Comments must be less than 2000 characters",
        variant: "destructive"
      });
      return false;
    }

    // Rating validation
    const allRatings = Object.values(ratings);
    if (allRatings.some(rating => rating === 0)) {
      toast({
        title: "Validation Error",
        description: "Please provide ratings for all categories",
        variant: "destructive"
      });
      return false;
    }

    // Check for minimum rating (at least 1 star for each category)
    if (allRatings.some(rating => rating < 1 || rating > 5)) {
      toast({
        title: "Validation Error",
        description: "All ratings must be between 1 and 5 stars",
        variant: "destructive"
      });
      return false;
    }

    // Image validation
    if (images.length > 5) {
      toast({
        title: "Validation Error",
        description: "You can upload a maximum of 5 images",
        variant: "destructive"
      });
      return false;
    }

    // Check individual image sizes
    const oversizedImages = images.filter(img => img.size > 5 * 1024 * 1024);
    if (oversizedImages.length > 0) {
      toast({
        title: "Validation Error",
        description: "Some images are too large. Maximum size is 5MB per image",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          category: formData.category,
          comments: formData.comments,
          anonymous: formData.anonymous,
          rating: ratings,
          images: [] // For now, we'll skip image uploads
        })
      });

      const data = await safeJsonParse(response);

      if (data.success) {
        setIsSubmitted(true);
        toast({
          title: "Thank You!",
          description: "Your feedback has been submitted successfully. We truly appreciate your time!",
          variant: "default"
        });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          const resetSessionData = getSessionData();
          const resetSuggestions = getAutoFillSuggestions(resetSessionData);
          setFormData({
            name: resetSuggestions.name,
            email: resetSuggestions.email,
            phone: resetSuggestions.phone,
            category: resetSuggestions.category,
            comments: resetSuggestions.comments,
            anonymous: false
          });
          setRatings({
            checkIn: 0,
            roomQuality: 0,
            cleanliness: 0,
            dining: 0,
            amenities: 0
          });
          setImages([]);
        }, 3000);
      } else {
        throw new Error(getErrorMessage(data) || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for sharing your feedback with Berghaus Bungalow! We truly appreciate your time.
            </p>
            <p className="text-sm text-gray-500">
              This page will redirect automatically...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏨 Share Your Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your feedback helps us improve our services and create better experiences for all our guests.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Guest Feedback Form
            </CardTitle>
            <p className="text-gray-600">
              Please take a moment to rate your experience with us
            </p>
            {isAutoFilled && (
              <p className="text-sm text-blue-600 mt-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Form auto-filled from your session data
              </p>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Type Toggle */}
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium">Rating Style:</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={ratingType === 'stars' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRatingType('stars')}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Stars
                  </Button>
                  <Button
                    type="button"
                    variant={ratingType === 'smileys' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRatingType('smileys')}
                  >
                    <Smile className="w-4 h-4 mr-1" />
                    Smileys
                  </Button>
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {ratingType === 'stars' ? (
                  <>
                    <StarRating
                      value={ratings.checkIn}
                      onChange={(value) => handleRatingChange('checkIn', value)}
                      label="Check-in Experience"
                    />
                    <StarRating
                      value={ratings.roomQuality}
                      onChange={(value) => handleRatingChange('roomQuality', value)}
                      label="Room Quality"
                    />
                    <StarRating
                      value={ratings.cleanliness}
                      onChange={(value) => handleRatingChange('cleanliness', value)}
                      label="Cleanliness"
                    />
                    <StarRating
                      value={ratings.dining}
                      onChange={(value) => handleRatingChange('dining', value)}
                      label="Dining"
                    />
                    <StarRating
                      value={ratings.amenities}
                      onChange={(value) => handleRatingChange('amenities', value)}
                      label="Amenities"
                    />
                  </>
                ) : (
                  <>
                    <SmileyRating
                      value={ratings.checkIn}
                      onChange={(value) => handleRatingChange('checkIn', value)}
                      label="Check-in Experience"
                    />
                    <SmileyRating
                      value={ratings.roomQuality}
                      onChange={(value) => handleRatingChange('roomQuality', value)}
                      label="Room Quality"
                    />
                    <SmileyRating
                      value={ratings.cleanliness}
                      onChange={(value) => handleRatingChange('cleanliness', value)}
                      label="Cleanliness"
                    />
                    <SmileyRating
                      value={ratings.dining}
                      onChange={(value) => handleRatingChange('dining', value)}
                      label="Dining"
                    />
                    <SmileyRating
                      value={ratings.amenities}
                      onChange={(value) => handleRatingChange('amenities', value)}
                      label="Amenities"
                    />
                  </>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('name', e.target.value);
                      setErrors(prev => ({ ...prev, name: error }));
                    }}
                    placeholder="Your full name"
                    required
                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('email', e.target.value);
                      setErrors(prev => ({ ...prev, email: error }));
                    }}
                    placeholder="your.email@example.com"
                    required
                    className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comments">Additional Comments or Suggestions</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('comments', e.target.value);
                    setErrors(prev => ({ ...prev, comments: error }));
                  }}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  maxLength={2000}
                  className={errors.comments ? 'border-red-500 focus:border-red-500' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.comments.length}/2000 characters
                  </p>
                  {errors.comments && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.comments}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Upload Photos (Optional)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5 images, 5MB each
                  </p>
                </div>
                
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => handleInputChange('anonymous', checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Submit anonymously (hide my name and email)
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
