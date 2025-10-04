'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Archive,
  Loader2,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  ThumbsUp
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
  images: string[];
  anonymous: boolean;
  status: 'Pending' | 'Reviewed' | 'Responded' | 'Closed';
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  overallRating: number;
}

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Load feedback from API
  const loadFeedback = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading feedback from API...');
      const response = await fetch('http://localhost:5000/api/feedback', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const feedbackData = data.data.feedback || data.data || [];
        console.log('✅ Successfully loaded feedback:', feedbackData.length);
        setFeedback(feedbackData);
        setFilteredFeedback(feedbackData);
      } else {
        console.error('API Error:', data);
        toast({
          title: "Error",
          description: data.message || "Failed to load feedback",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter feedback based on search and filters
  useEffect(() => {
    let filtered = feedback;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.comments.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter(item => item.overallRating >= minRating);
    }

    setFilteredFeedback(filtered);
  }, [feedback, searchTerm, statusFilter, categoryFilter, ratingFilter]);

  // Load feedback on component mount
  useEffect(() => {
    loadFeedback();
  }, []);

  // Update feedback status
  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        setFeedback(prev => prev.map(item => 
          item._id === id ? { ...item, status } : item
        ));
        toast({
          title: "Status Updated",
          description: "Feedback status updated successfully",
          variant: "default"
        });
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  // Add admin response
  const addResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    try {
      setIsResponding(true);
      const response = await fetch(`http://localhost:5000/api/feedback/${selectedFeedback._id}/response`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText })
      });

      const data = await response.json();

      if (data.success) {
        setFeedback(prev => prev.map(item => 
          item._id === selectedFeedback._id 
            ? { 
                ...item, 
                adminResponse: responseText,
                status: 'Responded',
                respondedAt: new Date().toISOString()
              } 
            : item
        ));
        setResponseText('');
        setSelectedFeedback(null);
        toast({
          title: "Response Sent",
          description: "Your response has been sent to the guest",
          variant: "default"
        });
      } else {
        throw new Error(data.message || 'Failed to send response');
      }
    } catch (error: any) {
      console.error('Error sending response:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send response",
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Reviewed': return 'bg-blue-100 text-blue-800';
      case 'Responded': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Reviewed': return <Eye className="h-4 w-4" />;
      case 'Responded': return <CheckCircle className="h-4 w-4" />;
      case 'Closed': return <Archive className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render star rating
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
        <span className="ml-1 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📝 Guest Feedback Management
              </h1>
              <p className="text-gray-600">
                Manage and respond to guest feedback and ratings
              </p>
              {loading && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading feedback...
                </div>
              )}
            </div>
            <Button
              onClick={() => loadFeedback()}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedback.filter(f => f.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Responded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedback.filter(f => f.status === 'Responded').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedback.length > 0 
                      ? (feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Responded">Responded</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Front Desk">Front Desk</SelectItem>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Room Service">Room Service</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rating">Min Rating</Label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Feedback ({filteredFeedback.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading feedback...</span>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No feedback found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {feedback.length === 0 
                      ? "No feedback in the database. Try refreshing or check your connection."
                      : "No feedback matches your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  <Button 
                    onClick={() => loadFeedback()} 
                    variant="outline" 
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredFeedback.map((item) => (
                <Card 
                  key={item._id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedFeedback?._id === item._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedFeedback(item)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.anonymous ? 'Anonymous' : item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.anonymous ? 'Hidden' : item.email}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                        <Badge variant="outline">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                        <div className="flex items-center">
                          {renderStars(Math.round(item.overallRating))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Check-in:</span>
                          <span>{item.rating.checkIn}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Room Quality:</span>
                          <span>{item.rating.roomQuality}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleanliness:</span>
                          <span>{item.rating.cleanliness}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dining:</span>
                          <span>{item.rating.dining}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amenities:</span>
                          <span>{item.rating.amenities}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    {item.comments && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.comments}
                      </p>
                    )}
                    
                    {item.images && item.images.length > 0 && (
                      <div className="mt-2 flex space-x-2">
                        {item.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Feedback image ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ))}
                        {item.images.length > 3 && (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                            +{item.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Feedback Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Feedback Details
            </h2>
            
            {selectedFeedback ? (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedFeedback.anonymous ? 'Anonymous' : selectedFeedback.name}
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(selectedFeedback._id, 'Reviewed')}
                          disabled={selectedFeedback.status === 'Reviewed'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(selectedFeedback._id, 'Closed')}
                          disabled={selectedFeedback.status === 'Closed'}
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Close
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Email:</strong> {selectedFeedback.anonymous ? 'Hidden' : selectedFeedback.email}</p>
                      <p><strong>Category:</strong> {selectedFeedback.category}</p>
                      <p><strong>Date:</strong> {formatDate(selectedFeedback.createdAt)}</p>
                      <p><strong>Status:</strong> {selectedFeedback.status}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Detailed Ratings</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedFeedback.rating).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          {renderStars(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedFeedback.comments && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Comments</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {selectedFeedback.comments}
                      </p>
                    </div>
                  )}
                  
                  {selectedFeedback.images && selectedFeedback.images.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedFeedback.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Feedback image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedFeedback.adminResponse && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Admin Response</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                        {selectedFeedback.adminResponse}
                      </p>
                      {selectedFeedback.respondedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Responded on: {formatDate(selectedFeedback.respondedAt)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!selectedFeedback.adminResponse && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Respond to Guest</h4>
                      <Textarea
                        placeholder="Type your response here..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={4}
                        className="mb-3"
                      />
                      <Button
                        onClick={addResponse}
                        disabled={isResponding || !responseText.trim()}
                        className="w-full"
                      >
                        {isResponding ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Reply className="w-4 h-4 mr-2" />
                            Send Response
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a feedback item to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
