'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Filter,
  Download,
  Plus,
  Bed,
  Mail,
  Phone,
  X
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Reservation {
  _id: string;
  reservationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  rooms: Array<{
    roomId: string;
    roomNumber: string;
    roomType: string;
  }>;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  guestCount: {
    adults: number;
    children: number;
  };
  specialRequests?: string;
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'checkin' | 'checkout' | 'view' | 'allocate' | null;
    reservation: Reservation | null;
  }>({
    open: false,
    type: null,
    reservation: null
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  // Handle search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      // Authentication is handled by cookies automatically
      
      console.log('Fetching reservations with params:', params.toString());
      console.log('Current URL:', window.location.href);
      console.log('Cookies:', document.cookie);
      
      const response = await fetch(`/api/frontdesk/reservations?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reservations data:', data);
        
        if (data.success && data.data && Array.isArray(data.data.reservations)) {
          setReservations(data.data.reservations);
        } else {
          console.error('Invalid data structure:', data);
          toast({
            title: "Error",
            description: "Invalid data received from server",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', errorData);
        toast({
          title: "Error",
          description: errorData.message || `Failed to load reservations (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error",
        description: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: 'checkin' | 'checkout' | 'view' | 'allocate', reservation: Reservation) => {
    setActionDialog({
      open: true,
      type,
      reservation
    });
  };

  const executeAction = async () => {
    if (!actionDialog.reservation || !actionDialog.type) return;

    try {
      let endpoint = '';
      let method = 'POST';

      switch (actionDialog.type) {
        case 'checkin':
          endpoint = `/api/frontdesk/checkin/${actionDialog.reservation._id}`;
          break;
        case 'checkout':
          endpoint = `/api/frontdesk/checkout/${actionDialog.reservation._id}`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Guest ${actionDialog.type === 'checkin' ? 'checked in' : 'checked out'} successfully`,
        });
        
        // Refresh data
        fetchReservations();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || `Failed to ${actionDialog.type}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error during ${actionDialog.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionDialog.type}`,
        variant: "destructive",
      });
    } finally {
      setActionDialog({ open: false, type: null, reservation: null });
    }
  };

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

  const filteredReservations = reservations.filter(reservation =>
    reservation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.reservationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.guestEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bb8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#006bb8]">Reservations</h1>
          <p className="text-gray-600">Manage guest reservations and bookings</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-[#006bb8] hover:bg-[#006bb8]/90">
            <Plus className="w-4 h-4 mr-2" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by guest name, reservation ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Calendar className="w-5 h-5 mr-2" />
            Reservations ({filteredReservations.length})
            {searchQuery && (
              <Badge variant="secondary" className="ml-2">
                Search: "{searchQuery}"
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Guest Details</TableHead>
                <TableHead>Room(s)</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell className="font-medium">{reservation.reservationId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.guestName}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="w-3 h-3" />
                        <span>{reservation.guestEmail}</span>
                      </div>
                      {reservation.guestPhone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{reservation.guestPhone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.rooms?.length > 0 ? (
                      reservation.rooms.map((room, index) => (
                        <div key={index} className="text-sm flex items-center space-x-1">
                          <Bed className="w-3 h-3" />
                          <span>{room.roomNumber} ({room.roomType})</span>
                        </div>
                      ))
                    ) : reservation.rooms && reservation.rooms.length > 0 ? (
                      <div className="text-sm flex items-center space-x-1">
                        <Bed className="w-3 h-3" />
                        <span>Room assigned (Legacy format)</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 text-sm">Room info unavailable</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>In: {new Date(reservation.checkInDate).toLocaleDateString()}</div>
                      <div>Out: {new Date(reservation.checkOutDate).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {reservation.guestCount.adults} adults
                      {reservation.guestCount.children > 0 && (
                        <div>{reservation.guestCount.children} children</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(reservation.paymentStatus)}</TableCell>
                  <TableCell className="font-medium">Rs {reservation.totalPrice}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('view', reservation)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {reservation.status === 'confirmed' && (
                        <>
                          {(!reservation.rooms || reservation.rooms.length === 0) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction('allocate', reservation)}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <Bed className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleAction('checkin', reservation)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {reservation.status === 'checked-in' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('checkout', reservation)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, reservation: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'checkin' && 'Check In Guest'}
              {actionDialog.type === 'checkout' && 'Check Out Guest'}
              {actionDialog.type === 'view' && 'Reservation Details'}
              {actionDialog.type === 'allocate' && 'Allocate Room'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.reservation && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Guest Information</p>
                      <p><strong>Name:</strong> {actionDialog.reservation.guestName}</p>
                      <p><strong>Email:</strong> {actionDialog.reservation.guestEmail}</p>
                      {actionDialog.reservation.guestPhone && (
                        <p><strong>Phone:</strong> {actionDialog.reservation.guestPhone}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Reservation Details</p>
                      <p><strong>ID:</strong> {actionDialog.reservation.reservationId}</p>
                      <p><strong>Status:</strong> {actionDialog.reservation.status}</p>
                      <p><strong>Total:</strong> Rs {actionDialog.reservation.totalPrice}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Stay Information</p>
                    <p><strong>Check-in:</strong> {new Date(actionDialog.reservation.checkInDate).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> {new Date(actionDialog.reservation.checkOutDate).toLocaleDateString()}</p>
                    <p><strong>Guests:</strong> {actionDialog.reservation.guestCount.adults} adults, {actionDialog.reservation.guestCount.children} children</p>
                  </div>

                  {actionDialog.reservation.rooms && actionDialog.reservation.rooms.length > 0 && (
                    <div>
                      <p className="font-medium">Allocated Rooms</p>
                      {actionDialog.reservation.rooms.map((room, index) => (
                        <p key={index}><strong>Room {room.roomNumber}:</strong> {room.roomType}</p>
                      ))}
                    </div>
                  )}

                  {actionDialog.reservation.specialRequests && (
                    <div>
                      <p className="font-medium">Special Requests</p>
                      <p>{actionDialog.reservation.specialRequests}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.type !== 'view' && actionDialog.type !== 'allocate' && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, reservation: null })}>
                Cancel
              </Button>
              <Button onClick={executeAction}>
                {actionDialog.type === 'checkin' ? 'Check In' : 'Check Out'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
