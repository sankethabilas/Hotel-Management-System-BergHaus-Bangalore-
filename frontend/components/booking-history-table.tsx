'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ArrivalTimeEditor } from '@/components/ui/arrival-time-editor';
import { useToast } from '@/hooks/use-toast';
import { bookingAPI } from '@/lib/api';
import { Booking, BookingStatus } from '@/types/index';
import { 
  Calendar, 
  Clock, 
  User, 
  Bed, 
  X, 
  Edit3, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface BookingHistoryTableProps {
  bookings: Booking[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function BookingHistoryTable({ bookings, onRefresh, isLoading }: BookingHistoryTableProps) {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [arrivalTimeDialogOpen, setArrivalTimeDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      checked_in: { color: 'bg-blue-100 text-blue-800', icon: User },
      checked_out: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X },
      no_show: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canCancelBooking = (booking: Booking) => {
    const now = new Date();
    const bookingTime = new Date(booking.bookingDate);
    const hoursSinceBooking = (now.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
    
    // Allow cancellation for both pending and confirmed bookings within 24 hours
    return hoursSinceBooking <= 24 && (booking.status === 'confirmed' || booking.status === 'pending');
  };

  const getCancellationDeadline = (booking: Booking) => {
    const bookingTime = new Date(booking.bookingDate);
    const deadline = new Date(bookingTime.getTime() + 24 * 60 * 60 * 1000);
    return deadline;
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      await bookingAPI.cancelBooking(selectedBooking._id);
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
        variant: 'default',
      });
      onRefresh();
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (error: any) {
      toast({
        title: 'Cancellation Failed',
        description: error.response?.data?.message || 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateArrivalTime = async (arrivalTime: string) => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      await bookingAPI.updateArrivalTime(selectedBooking._id, arrivalTime);
      toast({
        title: 'Arrival Time Updated',
        description: 'Your arrival time has been updated successfully.',
        variant: 'default',
      });
      onRefresh();
      setArrivalTimeDialogOpen(false);
      setSelectedBooking(null);
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update arrival time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const openArrivalTimeDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setArrivalTimeDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-hms-primary" />
            <span className="text-gray-600">Loading your bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">
              You haven't made any bookings yet. Start by exploring our available rooms.
            </p>
            <Button 
              onClick={() => window.location.href = '/booking'}
              className="bg-hms-primary hover:bg-hms-primary/90 text-white"
            >
              Book a Room
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-hms-primary" />
            <span>Booking History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{booking.roomNumber}</div>
                        <div className="text-sm text-gray-600">{booking.roomType}</div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Bed className="w-3 h-3" />
                          <span>{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatDate(booking.checkInDate)}</div>
                        <div className="text-xs text-gray-500">
                          {booking.totalNights} night{booking.totalNights > 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {booking.arrivalTime ? (
                          <div className="text-sm">{booking.arrivalTime}</div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">Not specified</div>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openArrivalTimeDialog(booking)}
                            className="h-6 px-2 text-xs text-hms-primary hover:text-hms-primary/80"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(booking.status)}
                        {canCancelBooking(booking) && (
                          <div className="text-xs">
                            <CountdownTimer
                              targetDate={getCancellationDeadline(booking)}
                              className="text-orange-600"
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(booking.totalAmount || 0)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {canCancelBooking(booking) ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openCancelDialog(booking)}
                            className="h-8 px-3 text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        ) : booking.status === 'confirmed' ? (
                          <div className="text-xs text-gray-500 italic">
                            Contact hotel to cancel
                          </div>
                        ) : booking.status === 'pending' ? (
                          <div className="text-xs text-orange-500 italic">
                            Cannot cancel (24h limit passed)
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic">
                            No actions available
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Booking"
        description={`Are you sure you want to cancel this booking for ${selectedBooking?.roomNumber}? This action cannot be undone.`}
        confirmText="Yes, Cancel"
        cancelText="No, Keep Booking"
        onConfirm={handleCancelBooking}
        variant="destructive"
        isLoading={isProcessing}
      />

      {/* Arrival Time Editor Dialog */}
      <ArrivalTimeEditor
        open={arrivalTimeDialogOpen}
        onOpenChange={setArrivalTimeDialogOpen}
        currentArrivalTime={selectedBooking?.arrivalTime || ''}
        onSave={handleUpdateArrivalTime}
        isLoading={isProcessing}
      />
    </>
  );
}
