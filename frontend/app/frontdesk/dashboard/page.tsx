'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Bed, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Key,
  CreditCard,
  Bell,
  TrendingUp,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Eye,
  UserCheck,
  UserX,
  IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DashboardStats {
  todaysArrivals: number;
  currentGuests: number;
  todaysDepartures: number;
  pendingPayments: number;
  roomOccupancy: {
    occupied: number;
    total: number;
    rate: string;
  };
}

interface Booking {
  _id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  numberOfGuests: number;
  createdAt: string;
}

export default function FrontdeskDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'checkin' | 'checkout' | 'view' | null;
    booking: Booking | null;
  }>({
    open: false,
    type: null,
    booking: null
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/frontdesk/dashboard/stats', {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings?limit=20&page=1', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('Dashboard bookings data:', bookingsData);
        
        if (bookingsData.success && bookingsData.data && Array.isArray(bookingsData.data.bookings)) {
          setBookings(bookingsData.data.bookings);
          console.log('Successfully loaded', bookingsData.data.bookings.length, 'bookings');
        } else if (bookingsData.success && Array.isArray(bookingsData.data)) {
          // Fallback: data might be directly in data array
          setBookings(bookingsData.data);
          console.log('Fallback: loaded', bookingsData.data.length, 'bookings');
        } else {
          console.error('Invalid bookings data structure:', bookingsData);
          toast({
            title: "Warning",
            description: "Unexpected data format from server",
            variant: "destructive",
          });
        }
      } else {
        const errorText = await bookingsResponse.text();
        console.error('Failed to fetch bookings:', bookingsResponse.status, errorText);
        toast({
          title: "Error",
          description: `Failed to load bookings: ${bookingsResponse.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: 'checkin' | 'checkout' | 'view', booking: Booking) => {
    setActionDialog({
      open: true,
      type,
      booking
    });
  };

  // Dashboard is now display-only - actions moved to check-in/checkout section

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pending', variant: 'secondary' as const },
      'confirmed': { label: 'Confirmed', variant: 'default' as const },
      'checked-in': { label: 'Checked In', variant: 'default' as const },
      'checked-out': { label: 'Checked Out', variant: 'outline' as const },
      'cancelled': { label: 'Cancelled', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={
        status === 'checked-in' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
        status === 'confirmed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''
      }>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      'unpaid': { label: 'Unpaid', variant: 'destructive' as const },
      'partial': { label: 'Partial', variant: 'secondary' as const },
      'paid': { label: 'Paid', variant: 'default' as const },
      'refunded': { label: 'Refunded', variant: 'outline' as const }
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.unpaid;
    
    return (
      <Badge variant={config.variant} className={
        paymentStatus === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
      }>
        {config.label}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter(booking =>
    booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bb8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#006bb8]">Frontdesk Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}! Here's today's overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reservations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          <Card className="border-l-4 border-l-[#006bb8]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Arrivals</p>
                  <p className="text-2xl font-bold text-[#006bb8]">{stats.todaysArrivals}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#006bb8]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Guests</p>
                  <p className="text-2xl font-bold text-green-600">{stats.currentGuests}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Departures</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.todaysDepartures}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingPayments}</p>
                </div>
                <CreditCard className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Room Occupancy</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.roomOccupancy.rate}%</p>
                  <p className="text-xs text-gray-500">{stats.roomOccupancy.occupied}/{stats.roomOccupancy.total} rooms</p>
                </div>
                <Bed className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Booking Reference</TableHead>
                  <TableHead className="min-w-[150px]">Guest Name</TableHead>
                  <TableHead className="min-w-[120px]">Room</TableHead>
                  <TableHead className="min-w-[100px]">Check-in</TableHead>
                  <TableHead className="min-w-[100px]">Check-out</TableHead>
                  <TableHead className="min-w-[80px]">Guests</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Payment</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">{booking.bookingReference}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {booking.roomNumber} ({booking.roomType})
                      </div>
                    </TableCell>
                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.numberOfGuests}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('view', booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, booking: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'checkin' && 'Check In Guest'}
              {actionDialog.type === 'checkout' && 'Check Out Guest'}
              {actionDialog.type === 'view' && 'Booking Details'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.booking && (
                <div className="space-y-2 mt-4">
                  <p><strong>Guest:</strong> {actionDialog.booking.guestName}</p>
                  <p><strong>Booking Reference:</strong> {actionDialog.booking.bookingReference}</p>
                  <p><strong>Room:</strong> {actionDialog.booking.roomNumber} ({actionDialog.booking.roomType})</p>
                  <p><strong>Check-in:</strong> {new Date(actionDialog.booking.checkInDate).toLocaleDateString()}</p>
                  <p><strong>Check-out:</strong> {new Date(actionDialog.booking.checkOutDate).toLocaleDateString()}</p>
                  <p><strong>Guests:</strong> {actionDialog.booking.numberOfGuests}</p>
                  <p><strong>Total:</strong> Rs {actionDialog.booking.totalAmount}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {/* Dashboard is display-only - no action buttons */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
