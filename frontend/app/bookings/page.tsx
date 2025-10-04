'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bed, 
  Users, 
  XCircle, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { bookingAPI } from '@/lib/api';
import { BookingListSkeleton } from '@/components/ui/loading-skeleton';

interface Booking {
  id: string;
  bookingReference: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  roomType: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  guestCount: {
    adults: number;
    children: number;
  };
  specialRequests?: string;
  createdAt: string;
  roomDetails?: {
    amenities: string[];
    description: string;
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Bookings page useEffect:', { authLoading, isAuthenticated, user });
    
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to signin');
      router.push('/auth/signin');
      return;
    }

    if (isAuthenticated && user) {
      console.log('User authenticated, fetching bookings for user:', (user as any).id || (user as any)._id);
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching user bookings...');
      console.log('Current user:', user);
      console.log('User ID:', (user as any)?._id || (user as any)?.id);
      
      const response = await bookingAPI.getUserBookings();
      console.log('Bookings response:', response);
      
      if (response.success) {
        console.log('Setting bookings:', response.data?.bookings);
        setBookings(response.data?.bookings || []);
      } else {
        console.error('Bookings fetch failed:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to fetch bookings",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canCancelBooking = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const getTimeRemainingForCancellation = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const remainingHours = 24 - hoursDiff;
    
    if (remainingHours <= 0) return null;
    
    if (remainingHours < 1) {
      const minutes = Math.floor(remainingHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    } else if (remainingHours < 24) {
      const hours = Math.floor(remainingHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    }
    
    return null;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      
      const result = await bookingAPI.cancelBooking(bookingId);

      if (result.success) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        });
        
        // Refresh bookings list
        await fetchBookings();
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.message || "Failed to cancel booking",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilCheckIn = (checkIn: string) => {
    const checkInDate = new Date(checkIn);
    const today = new Date();
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your hotel reservations and view booking details
            </p>
          </div>
          <BookingListSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to sign in
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your hotel reservations and view booking details
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't made any bookings yet.
              </p>
              <Button 
                onClick={() => router.push('/availability')}
                className="bg-hms-primary hover:bg-hms-primary/90"
              >
                Book a Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const canCancel = canCancelBooking(booking.createdAt);
              const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkIn);
              const timeRemaining = getTimeRemainingForCancellation(booking.createdAt);
              
              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Bed className="w-5 h-5" />
                          Room {booking.roomNumber} - {booking.roomType}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Booking Reference: {booking.bookingReference}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                        {booking.status === 'confirmed' && daysUntilCheckIn > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {daysUntilCheckIn} day{daysUntilCheckIn > 1 ? 's' : ''} until check-in
                          </Badge>
                        )}
                        {booking.status === 'confirmed' && canCancel && timeRemaining && (
                          <Badge variant="destructive" className="text-xs">
                            {timeRemaining} to cancel
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Booking Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Guests</p>
                          <p className="font-semibold">
                            {booking.guestCount.adults} adult{booking.guestCount.adults > 1 ? 's' : ''}
                            {booking.guestCount.children > 0 && `, ${booking.guestCount.children} child${booking.guestCount.children > 1 ? 'ren' : ''}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-hms-primary">
                            LKR {booking.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Special Requests:</p>
                        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>Payment Status: <span className="font-semibold">{booking.paymentStatus}</span></p>
                        <p>Booked on: {formatDate(booking.createdAt)}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && canCancel && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </>
                            )}
                          </Button>
                        )}
                        
                        {booking.status === 'confirmed' && !canCancel && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancellation not allowed after 24 hours</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </TooltipProvider>
  );
}
