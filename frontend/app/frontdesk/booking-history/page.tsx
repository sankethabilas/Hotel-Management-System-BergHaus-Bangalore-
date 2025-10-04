'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  History, 
  Search, 
  Eye, 
  Download, 
  Mail,
  Calendar,
  User,
  Bed,
  IndianRupee,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingHistory {
  _id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  numberOfGuests: number;
  customCharges?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function BookingHistoryPage() {
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<BookingHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [bookingHistory, searchQuery, statusFilter]);

  // Handle search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch completed bookings (checked_out status)
      const response = await fetch('/api/bookings?status=checked_out&limit=100&page=1', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Booking history data:', data);
        
        if (data.success && data.data && Array.isArray(data.data.bookings)) {
          setBookingHistory(data.data.bookings);
        } else {
          console.error('Invalid booking history data structure:', data);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch booking history:', response.status, errorText);
        toast({
          title: "Error",
          description: `Failed to load booking history: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      toast({
        title: "Error",
        description: "Failed to load booking history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = bookingHistory;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(booking =>
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by payment status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === statusFilter);
    }

    setFilteredHistory(filtered);
  };

  const handleViewDetails = (booking: BookingHistory) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };

  const downloadBill = async (booking: BookingHistory) => {
    try {
      const response = await fetch(`/api/bookings/${booking._id}/bill?format=pdf`, {
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
          a.download = `bill-${booking.bookingReference}.pdf`;
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

  const sendBillEmail = async (booking: BookingHistory) => {
    try {
      const response = await fetch(`/api/bookings/${booking._id}/bill/email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Bill sent to ${booking.guestEmail} successfully`,
        });
      } else {
        const errorData = await response.json();
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

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'paid': { label: 'Paid', variant: 'default' as const },
      'pending': { label: 'Pending', variant: 'destructive' as const },
      'failed': { label: 'Failed', variant: 'destructive' as const },
      'refunded': { label: 'Refunded', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#006bb8]">Booking History</h1>
          <p className="text-gray-600">View all completed bookings and download bills</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by guest name, booking reference, room, or email..."
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Booking History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#006bb8]">
            <div className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Completed Bookings ({filteredHistory.length})
              {searchQuery && (
                <Badge variant="secondary" className="ml-2">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#006bb8]"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Booking Ref</TableHead>
                    <TableHead className="min-w-[200px]">Guest</TableHead>
                    <TableHead className="min-w-[120px]">Room</TableHead>
                    <TableHead className="min-w-[140px]">Stay Period</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Payment</TableHead>
                    <TableHead className="min-w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((booking) => (
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
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(booking.checkInDate).toLocaleDateString()}</div>
                          <div>{new Date(booking.checkOutDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">Rs {booking.totalAmount}</div>
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBill(booking)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Bill
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendBillEmail(booking)}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
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
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No booking history found</p>
              {(searchQuery || statusFilter !== 'all') && (
                <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information for booking {selectedBooking?.bookingReference}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#006bb8] flex items-center mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Guest Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedBooking.guestName}</p>
                      <p><strong>Email:</strong> {selectedBooking.guestEmail}</p>
                      {selectedBooking.guestPhone && (
                        <p><strong>Phone:</strong> {selectedBooking.guestPhone}</p>
                      )}
                      <p><strong>Guests:</strong> {selectedBooking.numberOfGuests}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-[#006bb8] flex items-center mb-2">
                      <Bed className="w-4 h-4 mr-2" />
                      Room Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Room:</strong> {selectedBooking.roomNumber}</p>
                      <p><strong>Type:</strong> {selectedBooking.roomType}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#006bb8] flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Stay Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Check-in:</strong> {new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                      <p><strong>Check-out:</strong> {new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p>
                      <p><strong>Booking Date:</strong> {new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-[#006bb8] flex items-center mb-2">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      Payment Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Total Amount:</strong> Rs {selectedBooking.totalAmount}</p>
                      <div className="flex items-center gap-2"><strong>Payment Status:</strong> {getPaymentStatusBadge(selectedBooking.paymentStatus)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedBooking.customCharges && selectedBooking.customCharges.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#006bb8] mb-2">Additional Charges</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBooking.customCharges.map((charge, index) => (
                          <TableRow key={index}>
                            <TableCell>{charge.description}</TableCell>
                            <TableCell className="text-center">{charge.quantity}</TableCell>
                            <TableCell className="text-right">Rs {charge.unitPrice}</TableCell>
                            <TableCell className="text-right">Rs {(charge.quantity * charge.unitPrice).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => downloadBill(selectedBooking)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Bill
                </Button>
                <Button variant="outline" onClick={() => sendBillEmail(selectedBooking)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Bill
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
