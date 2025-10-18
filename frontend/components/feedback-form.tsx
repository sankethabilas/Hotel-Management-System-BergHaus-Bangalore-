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
  CheckCircle
} from 'lucide-react';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
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

  const [images, setImages] = useState<File[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Update form data when component opens or session data changes
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

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
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error", 
        description: "Email is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return false;
    }

    const allRatings = Object.values(ratings);
    if (allRatings.some(rating => rating === 0)) {
      toast({
        title: "Validation Error",
        description: "Please provide ratings for all categories",
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

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('comments', formData.comments);
      formDataToSend.append('anonymous', formData.anonymous.toString());
      formDataToSend.append('rating', JSON.stringify(ratings));
      
      images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
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
          onClose();
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

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for sharing your feedback with Berghaus Bungalow! We truly appreciate your time.
            </p>
            <p className="text-sm text-gray-500">
              This window will close automatically...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-2xl font-bold text-gray-900">
              🏨 Share Your Experience
            </CardTitle>
            {isAutoFilled && (
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Form auto-filled from your session data
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
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
                placeholder="Tell us more about your experience..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comments.length}/2000 characters
              </p>
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
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
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
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
