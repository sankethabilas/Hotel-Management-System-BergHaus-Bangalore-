'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoomSearch from '@/components/RoomSearch';
import RoomSelection from '@/components/RoomSelection';
import BookingForm from '@/components/BookingForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  amenities: string[];
  pricePerNight: number;
  pricing: {
    pricePerNight: number;
    totalNights: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

type BookingStep = 'search' | 'selection' | 'booking';

export default function BookingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication when user reaches booking step
  useEffect(() => {
    if (!authLoading && currentStep === 'booking' && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your booking.",
        variant: "destructive"
      });
      // Redirect to login with return URL
      router.push(`/auth/signin?redirect=${encodeURIComponent('/booking')}`);
    }
  }, [currentStep, isAuthenticated, authLoading, router, toast]);

  const handleRoomsFound = (rooms: Room[], criteria: any) => {
    setAvailableRooms(rooms);
    setSearchCriteria(criteria);
    setCurrentStep('selection');
  };

  const handleSelectionChange = (rooms: Room[]) => {
    setSelectedRooms(rooms);
  };

  const handleProceedToBooking = (rooms: Room[]) => {
    // Check authentication before proceeding to booking step
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your booking. You will be redirected to the login page.",
        variant: "destructive"
      });
      setTimeout(() => {
        router.push(`/auth/signin?redirect=${encodeURIComponent('/booking')}`);
      }, 1500);
      return;
    }
    setSelectedRooms(rooms);
    setCurrentStep('booking');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
  };

  const handleBookingSuccess = (bookingReference: string) => {
    router.push(`/booking/confirmation?ref=${bookingReference}`);
  };

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setAvailableRooms([]);
    setSelectedRooms([]);
    setSearchCriteria(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#006bb8]">Book a Room</h1>
              <p className="text-gray-600 mt-1">Find and reserve your perfect room</p>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'search' ? 'text-[#006bb8]' : currentStep === 'selection' || currentStep === 'booking' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'search' ? 'bg-[#006bb8] text-white' : 
                  currentStep === 'selection' || currentStep === 'booking' ? 'bg-green-600 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Search</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'selection' || currentStep === 'booking' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'selection' ? 'text-[#006bb8]' : currentStep === 'booking' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'selection' ? 'bg-[#006bb8] text-white' : 
                  currentStep === 'booking' ? 'bg-green-600 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Select</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'booking' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'booking' ? 'text-[#006bb8]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'booking' ? 'bg-[#006bb8] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Book</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'search' && (
          <div className="max-w-4xl mx-auto">
            <RoomSearch 
              onRoomsFound={handleRoomsFound}
              onLoading={setIsLoading}
            />
          </div>
        )}

        {currentStep === 'selection' && (
          <div>
            <RoomSelection
              rooms={availableRooms}
              searchCriteria={searchCriteria}
              onSelectionChange={handleSelectionChange}
              onProceedToBooking={handleProceedToBooking}
            />
          </div>
        )}

        {currentStep === 'booking' && (
          <div>
            <BookingForm
              selectedRooms={selectedRooms}
              searchCriteria={searchCriteria}
              onBack={handleBackToSelection}
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006bb8]"></div>
              <span className="text-lg font-medium">Searching for available rooms...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
