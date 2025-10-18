'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { BookingHistoryTable } from '@/components/booking-history-table';
import { bookingAPI } from '@/lib/api';
import { Booking } from '@/types';
import { 
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ReservationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await bookingAPI.getUserBookings();
      if (response.success) {
        setBookings(response.data.bookings || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load bookings. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load bookings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-hms-primary" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-hms-primary to-hms-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">My Reservations</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Manage your bookings, view booking history, and update your arrival details.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
                <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Booking History
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your past and current bookings
              </p>
                </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={fetchBookings}
                disabled={isLoading}
                className="border-hms-primary text-hms-primary hover:bg-hms-primary hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => router.push('/booking')}
                className="bg-hms-primary hover:bg-hms-primary/90 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Cancellation Policy Notice */}
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Cancellation Policy
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You can cancel your booking within 24 hours of booking confirmation for a full refund. 
                    After 24 hours, please contact the hotel directly as cancellation charges may apply.
                  </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Booking History Table */}
          <BookingHistoryTable
            bookings={bookings}
            onRefresh={fetchBookings}
            isLoading={isLoading}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
