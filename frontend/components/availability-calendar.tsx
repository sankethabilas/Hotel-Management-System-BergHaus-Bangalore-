'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Users, Bed, Wifi, Car, Coffee } from 'lucide-react';
import { availabilityAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AvailabilityCalendarProps {
  onDateSelect: (checkIn: string, checkOut: string) => void;
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  roomType?: string;
}

export function AvailabilityCalendar({ 
  onDateSelect, 
  selectedCheckIn, 
  selectedCheckOut,
  roomType = 'all'
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState<string | null>(selectedCheckIn || null);
  const [tempCheckOut, setTempCheckOut] = useState<string | null>(selectedCheckOut || null);
  const { toast } = useToast();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth, currentYear, roomType]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const response = await availabilityAPI.getAvailabilityCalendar({
        roomType,
        month: currentMonth,
        year: currentYear
      });

      if (response.success && response.data) {
        setCalendarData(response.data.calendarData);
        setRooms(response.data.rooms);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatDate = (day: number) => {
    const date = new Date(currentYear, currentMonth - 1, day);
    return date.toISOString().split('T')[0];
  };

  const isDateInRange = (dateString: string) => {
    if (!tempCheckIn || !tempCheckOut) return false;
    const date = new Date(dateString);
    const checkIn = new Date(tempCheckIn);
    const checkOut = new Date(tempCheckOut);
    return date > checkIn && date < checkOut;
  };

  const isDateSelected = (dateString: string) => {
    return dateString === tempCheckIn || dateString === tempCheckOut;
  };

  const isDatePast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  const handleDateClick = (dateString: string) => {
    if (isDatePast(dateString)) return;

    if (!tempCheckIn || (tempCheckIn && tempCheckOut)) {
      // Start new selection
      setTempCheckIn(dateString);
      setTempCheckOut(null);
    } else if (tempCheckIn && !tempCheckOut) {
      // Complete selection
      if (new Date(dateString) > new Date(tempCheckIn)) {
        setTempCheckOut(dateString);
        onDateSelect(tempCheckIn, dateString);
      } else {
        // If clicked date is before check-in, make it the new check-in
        setTempCheckIn(dateString);
        setTempCheckOut(null);
      }
    }
  };

  const getDateStatus = (dateString: string) => {
    const data = calendarData[dateString];
    if (!data) return 'unknown';
    
    if (data.availableCount === 0) return 'unavailable';
    if (data.availableCount < data.totalRooms / 2) return 'limited';
    return 'available';
  };

  const getDateColor = (dateString: string) => {
    if (isDatePast(dateString)) return 'text-gray-400 bg-gray-100 dark:bg-gray-700';
    if (isDateSelected(dateString)) return 'bg-hms-primary text-white';
    if (isDateInRange(dateString)) return 'bg-hms-primary/20 text-hms-primary';
    
    const status = getDateStatus(dateString);
    switch (status) {
      case 'available':
        return 'text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30';
      case 'limited':
        return 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30';
      case 'unavailable':
        return 'text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30';
      default:
        return 'text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(day);
      const data = calendarData[dateString];
      const isPast = isDatePast(dateString);
      const isSelected = isDateSelected(dateString);
      const isInRange = isDateInRange(dateString);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(dateString)}
          disabled={isPast}
          className={`
            h-12 w-full text-sm font-medium rounded-lg transition-all duration-200
            ${getDateColor(dateString)}
            ${isPast ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${isSelected ? 'ring-2 ring-hms-primary ring-offset-2' : ''}
            ${isInRange ? 'ring-1 ring-hms-primary/50' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span>{day}</span>
            {data && !isPast && (
              <div className="flex space-x-1 mt-1">
                {data.availableCount > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                )}
                {data.availableCount === data.totalRooms && (
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                )}
              </div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Availability Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[140px] text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/20"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20"></div>
            <span>Limited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/20"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendar()}
        </div>

        {/* Selection Summary */}
        {tempCheckIn && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium mb-2">Selected Dates:</h4>
            <div className="flex items-center space-x-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Check-in:</span>
                <span className="ml-2 font-medium">
                  {new Date(tempCheckIn).toLocaleDateString()}
                </span>
              </div>
              {tempCheckOut && (
                <>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Check-out:</span>
                    <span className="ml-2 font-medium">
                      {new Date(tempCheckOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Nights:</span>
                    <span className="ml-2 font-medium">
                      {Math.ceil((new Date(tempCheckOut).getTime() - new Date(tempCheckIn).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
