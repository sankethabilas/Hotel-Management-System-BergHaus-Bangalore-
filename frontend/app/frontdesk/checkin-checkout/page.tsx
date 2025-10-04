'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  User,
  Bed,
  Mail,
  Phone,
  Plus,
  Minus,
  IndianRupee,
  Receipt,
  Download
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
  specialRequests?: string;
  createdAt: string;
}

interface AdditionalCharge {
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export default function CheckInCheckOutPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'checkin' | 'checkout' | null;
    booking: Booking | null;
  }>({
    open: false,
    type: null,
    booking: null
  });
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    booking: Booking | null;
  }>({
    open: false,
    booking: null
  });
  const [customCharges, setCustomCharges] = useState<AdditionalCharge[]>([]);
  const [newCharge, setNewCharge] = useState<AdditionalCharge>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'other'
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [allBookings, searchQuery, statusFilter]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch all bookings
      const response = await fetch('/api/bookings?limit=100&page=1', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Check-in/check-out bookings data:', data);
        
        if (data.success && data.data && Array.isArray(data.data.bookings)) {
          setAllBookings(data.data.bookings);
          console.log('Successfully loaded', data.data.bookings.length, 'bookings for check-in/check-out');
        } else if (data.success && Array.isArray(data.data)) {
          // Fallback: data might be directly in data array
          setAllBookings(data.data);
          console.log('Fallback: loaded', data.data.length, 'bookings for check-in/check-out');
        } else {
          setAllBookings([]);
          console.error('Invalid bookings data structure:', data);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch bookings:', response.status, errorText);
        toast({
          title: "Error",
          description: `Failed to load bookings: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = allBookings;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };


  const handleAction = (type: 'checkin' | 'checkout', booking: Booking) => {
    setSelectedBooking(booking);
    setActionDialog({
      open: true,
      type,
      booking
    });
    
    // Reset additional charges for checkout
    if (type === 'checkout') {
      setAdditionalCharges([]);
    }
  };

  const addAdditionalCharge = () => {
    setAdditionalCharges([
      ...additionalCharges,
      { description: '', quantity: 1, unitPrice: 0, category: 'other' }
    ]);
  };

  const removeAdditionalCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
  };

  const updateAdditionalCharge = (index: number, field: keyof AdditionalCharge, value: any) => {
    const updated = [...additionalCharges];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCharges(updated);
  };

  const executeAction = async () => {
    if (!actionDialog.booking || !actionDialog.type) return;

    try {
      let endpoint = '';
      let body = {};

      if (actionDialog.type === 'checkin') {
        endpoint = `/api/bookings/${actionDialog.booking._id}/status`;
        body = { status: 'checked_in' };
      } else if (actionDialog.type === 'checkout') {
        endpoint = `/api/bookings/${actionDialog.booking._id}/status`;
        body = { status: 'checked_out', additionalCharges };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Guest ${actionDialog.type === 'checkin' ? 'checked in' : 'checked out'} successfully`,
        });
        
        // Refresh data
        fetchAllBookings();
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
      setActionDialog({ open: false, type: null, booking: null });
      setAdditionalCharges([]);
    }
  };

  const handlePaymentManagement = (booking: Booking) => {
    setPaymentDialog({
      open: true,
      booking
    });
    setCustomCharges([]);
    setNewCharge({
      description: '',
      quantity: 1,
      unitPrice: 0,
      category: 'other'
    });
  };

  const updatePaymentStatus = async (paymentStatus: string) => {
    if (!paymentDialog.booking) {
      console.error('No booking selected');
      return;
    }

    console.log('Updating payment status to:', paymentStatus, 'for booking:', paymentDialog.booking._id);

    try {
      const response = await fetch(`/api/bookings/${paymentDialog.booking._id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus })
      });

      console.log('Payment update response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Payment update success:', responseData);
        
        toast({
          title: "Success",
          description: `Payment status updated to ${paymentStatus}`,
        });
        
        // Update the booking in the dialog immediately
        const updatedBooking = { ...paymentDialog.booking, paymentStatus };
        setPaymentDialog(prev => ({ ...prev, booking: updatedBooking }));
        
        // Refresh the main data
        fetchAllBookings();
      } else {
        const errorData = await response.json();
        console.error('Payment update error:', errorData);
        toast({
          title: "Error",
          description: errorData.message || "Failed to update payment status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const addCustomCharge = () => {
    if (!newCharge.description || newCharge.unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all charge details",
        variant: "destructive",
      });
      return;
    }

    const charge = {
      ...newCharge,
      totalPrice: newCharge.quantity * newCharge.unitPrice
    };

    setCustomCharges(prev => [...prev, charge]);
    setNewCharge({
      description: '',
      quantity: 1,
      unitPrice: 0,
      category: 'other'
    });
  };

  const removeCustomCharge = (index: number) => {
    setCustomCharges(prev => prev.filter((_, i) => i !== index));
  };

  const saveCustomCharges = async () => {
    if (!paymentDialog.booking || customCharges.length === 0) return;

    try {
      const response = await fetch(`/api/bookings/${paymentDialog.booking._id}/charges`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ charges: customCharges })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          toast({
            title: "Success",
            description: "Custom charges added successfully",
          });
          
          // Update the booking with new total
          const updatedBooking = { 
            ...paymentDialog.booking, 
            totalAmount: data.data.newTotal,
            customCharges: data.data.booking.customCharges 
          };
          setPaymentDialog(prev => ({ ...prev, booking: updatedBooking }));
          setCustomCharges([]);
          fetchAllBookings();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          toast({
            title: "Error",
            description: "Invalid response from server",
            variant: "destructive",
          });
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message || "Failed to add custom charges",
            variant: "destructive",
          });
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          toast({
            title: "Error",
            description: `Server error: ${response.status}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error adding custom charges:', error);
      toast({
        title: "Error",
        description: "Failed to add custom charges",
        variant: "destructive",
      });
    }
  };

  const downloadBill = async () => {
    if (!paymentDialog.booking) return;

    try {
      // Download PDF bill
      const response = await fetch(`/api/bookings/${paymentDialog.booking._id}/bill?format=pdf`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (response.ok) {
        // Check if the response is actually a PDF
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await response.blob();
          console.log('PDF blob size:', blob.size);
          console.log('PDF blob type:', blob.type);
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bill-${paymentDialog.booking.bookingReference}.pdf`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          toast({
            title: "Success",
            description: "Bill downloaded successfully",
          });
        } else {
          console.error('Response is not a PDF:', contentType);
          const text = await response.text();
          console.error('Response text:', text);
          toast({
            title: "Error",
            description: "Invalid PDF response from server",
            variant: "destructive",
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to download bill:', response.status, errorText);
        toast({
          title: "Error",
          description: "Failed to download bill",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading bill:', error);
      toast({
        title: "Error",
        description: "Failed to download bill",
        variant: "destructive",
      });
    }
  };

  const sendBillEmail = async () => {
    if (!paymentDialog.booking) return;

    try {
      const response = await fetch(`/api/bookings/${paymentDialog.booking._id}/bill/email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Bill sent to ${paymentDialog.booking.guestEmail} successfully`,
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to send bill email:', response.status, errorData);
        toast({
          title: "Error",
          description: errorData.message || "Failed to send bill email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending bill email:', error);
      toast({
        title: "Error",
        description: "Failed to send bill email",
        variant: "destructive",
      });
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#006bb8]">All Bookings</h1>
        <p className="text-gray-600">View and manage all guest bookings, check-ins, and check-outs</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by guest name, booking reference, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* All Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#006bb8]">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              All Bookings ({filteredBookings.length})
            </div>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#006bb8]"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Guest</TableHead>
                    <TableHead className="min-w-[150px]">Room(s)</TableHead>
                    <TableHead className="min-w-[140px]">Dates</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Payment</TableHead>
                    <TableHead className="min-w-[250px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span>{booking.guestEmail}</span>
                          </div>
                          {booking.guestPhone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{booking.guestPhone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center space-x-1">
                          <Bed className="w-3 h-3" />
                          <span>{booking.roomNumber} ({booking.roomType})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>In: {new Date(booking.checkInDate).toLocaleDateString()}</div>
                          <div>Out: {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleAction('checkin', booking)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Check In
                            </Button>
                          )}
                          {booking.status === 'checked_in' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAction('checkout', booking)}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={booking.paymentStatus !== 'paid'}
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Check Out
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentManagement(booking)}
                              >
                                <IndianRupee className="w-4 h-4 mr-2" />
                                Payment
                              </Button>
                            </>
                          )}
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
              {(searchQuery || statusFilter !== 'all') && (
                <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, booking: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'checkin' ? 'Check In Guest' : 'Check Out Guest'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 mt-4">
                {actionDialog.booking && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-2">Guest Information</div>
                        <div><strong>Name:</strong> {actionDialog.booking.guestName}</div>
                        <div><strong>Email:</strong> {actionDialog.booking.guestEmail}</div>
                        {actionDialog.booking.guestPhone && (
                          <div><strong>Phone:</strong> {actionDialog.booking.guestPhone}</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium mb-2">Booking Details</div>
                        <div><strong>Reference:</strong> {actionDialog.booking.bookingReference}</div>
                        <div><strong>Total:</strong> Rs {actionDialog.booking.totalAmount}</div>
                        <div><strong>Guests:</strong> {actionDialog.booking.numberOfGuests}</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium mb-2">Room Details</div>
                      <div><strong>Room {actionDialog.booking.roomNumber}:</strong> {actionDialog.booking.roomType}</div>
                    </div>

                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, booking: null })}>
              Cancel
            </Button>
            <Button onClick={executeAction}>
              {actionDialog.type === 'checkin' ? 'Check In' : 'Check Out & Generate Bill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Management Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => !open && setPaymentDialog({ open: false, booking: null })}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Payment & Billing Management</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-4">
                {paymentDialog.booking && (
                  <>
                    <div><strong>Guest:</strong> {paymentDialog.booking.guestName}</div>
                    <div><strong>Booking Reference:</strong> {paymentDialog.booking.bookingReference}</div>
                    <div><strong>Room:</strong> {paymentDialog.booking.roomNumber} ({paymentDialog.booking.roomType})</div>
                    <div><strong>Current Total:</strong> Rs {paymentDialog.booking.totalAmount}</div>
                    <div><strong>Payment Status:</strong> 
                      <Badge variant={paymentDialog.booking.paymentStatus === 'paid' ? 'default' : 'destructive'} className="ml-2">
                        {paymentDialog.booking.paymentStatus}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Payment Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Status</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={() => updatePaymentStatus('pending')}
                  variant={paymentDialog.booking?.paymentStatus === 'pending' ? 'default' : 'outline'}
                  className={paymentDialog.booking?.paymentStatus === 'pending' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                >
                  Pending
                </Button>
                <Button
                  onClick={() => updatePaymentStatus('paid')}
                  variant={paymentDialog.booking?.paymentStatus === 'paid' ? 'default' : 'outline'}
                  className={paymentDialog.booking?.paymentStatus === 'paid' ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-green-50'}
                >
                  Paid
                </Button>
              </div>
            </div>

            {/* Custom Charges Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Custom Charges</h3>
              
              {/* Add New Charge Form */}
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="e.g., Minibar, Late checkout"
                    value={newCharge.description}
                    onChange={(e) => setNewCharge(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={newCharge.quantity}
                    onChange={(e) => setNewCharge(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newCharge.unitPrice}
                    onChange={(e) => setNewCharge(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newCharge.category} onValueChange={(value) => setNewCharge(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minibar">Minibar</SelectItem>
                      <SelectItem value="laundry">Laundry</SelectItem>
                      <SelectItem value="room_service">Room Service</SelectItem>
                      <SelectItem value="late_checkout">Late Checkout</SelectItem>
                      <SelectItem value="damages">Damages</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Button onClick={addCustomCharge} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Custom Charges List */}
              {customCharges.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Pending Charges:</h4>
                  {customCharges.map((charge, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{charge.description}</p>
                        <p className="text-sm text-gray-600">
                          {charge.quantity} × Rs {charge.unitPrice} = Rs {(charge.quantity * charge.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCustomCharge(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Additional Total:</span>
                    <span className="font-bold">Rs {customCharges.reduce((sum, charge) => sum + (charge.quantity * charge.unitPrice), 0).toFixed(2)}</span>
                  </div>
                  <Button onClick={saveCustomCharges} className="w-full">
                    Save Custom Charges
                  </Button>
                </div>
              )}

              {/* Custom Charges section removed - not part of current Booking model */}
            </div>

            {/* Bill Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bill Actions</h3>
              <div className="flex space-x-2">
                <Button onClick={downloadBill} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={sendBillEmail} variant="outline">
                  <Receipt className="w-4 h-4 mr-2" />
                  Email Bill
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog({ open: false, booking: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
