'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit,
  User, 
  Eye, 
  Trash2, 
  Phone, 
  Mail, 
  Bed, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  CreditCard,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockReservations = [
  {
    id: 'RES001',
    guestName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    checkIn: '2024-01-15T14:00:00Z',
    checkOut: '2024-01-17T11:00:00Z',
    roomNumber: '101',
    roomType: 'Deluxe Suite',
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 50000,
    adults: 2,
    children: 0,
    specialRequests: 'Late checkout requested',
    bookingDate: '2024-01-10T10:30:00Z',
    isVip: true,
    source: 'Direct Booking',
    notes: 'VIP guest - provide extra amenities'
  },
  {
    id: 'RES002',
    guestName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0124',
    checkIn: '2024-01-16T16:00:00Z',
    checkOut: '2024-01-18T11:00:00Z',
    roomNumber: '205',
    roomType: 'Standard Room',
    status: 'confirmed',
    paymentStatus: 'pending',
    totalAmount: 30000,
    adults: 2,
    children: 1,
    specialRequests: 'Extra bed for child',
    bookingDate: '2024-01-12T14:20:00Z',
    isVip: false,
    source: 'Booking.com',
    notes: 'Family with child - ensure child-friendly amenities'
  },
  {
    id: 'RES003',
    guestName: 'Michael Brown',
    email: 'm.brown@email.com',
    phone: '+1-555-0125',
    checkIn: '2024-01-20T12:00:00Z',
    checkOut: '2024-01-22T11:00:00Z',
    roomNumber: '302',
    roomType: 'Executive Suite',
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 70000,
    adults: 1,
    children: 0,
    specialRequests: 'Business trip - need quiet room',
    bookingDate: '2024-01-14T09:15:00Z',
    isVip: false,
    source: 'Expedia',
    notes: 'Business traveler - ensure good WiFi and workspace'
  },
  {
    id: 'RES004',
    guestName: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1-555-0126',
    checkIn: '2024-01-18T15:00:00Z',
    checkOut: '2024-01-20T11:00:00Z',
    roomNumber: '201',
    roomType: 'Standard Room',
    status: 'cancelled',
    paymentStatus: 'refunded',
    totalAmount: 30000,
    adults: 1,
    children: 0,
    specialRequests: 'Ground floor preferred',
    bookingDate: '2024-01-08T16:45:00Z',
    isVip: false,
    source: 'Direct Booking',
    notes: 'Cancelled due to travel restrictions'
  }
];

export default function ReservationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredReservations = mockReservations.filter(reservation => {
    const matchesSearch = 
      reservation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reservationStats = {
    total: mockReservations.length,
    confirmed: mockReservations.filter(r => r.status === 'confirmed').length,
    pending: mockReservations.filter(r => r.status === 'pending').length,
    cancelled: mockReservations.filter(r => r.status === 'cancelled').length
  };

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#006bb8]">Reservations</h1>
            <p className="text-gray-600">Manage hotel reservations and bookings</p>
          </div>
        </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#006bb8]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                <p className="text-2xl font-bold text-[#006bb8]">{reservationStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#006bb8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{reservationStats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{reservationStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{reservationStats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Reservations</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reservations List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-[#006bb8]">
                    <Calendar className="w-5 h-5 mr-2" />
                    Reservations
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reservations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedReservation?.id === reservation.id
                          ? "border-[#006bb8] bg-[#006bb8]/5"
                          : "border-gray-200 hover:border-[#2fa0df]"
                      )}
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#006bb8] to-[#2fa0df] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {reservation.guestName?.split(' ').map(n => n[0]).join('') || 'G'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{reservation.guestName}</h3>
                              {reservation.isVip && (
                                <Badge className="bg-[#ffc973] text-[#006bb8]">
                                  <Star className="w-3 h-3 mr-1" />
                                  VIP
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Reservation ID: {reservation.id}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)} | 
                              Room {reservation.roomNumber} - {reservation.roomType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary"
                            className={getStatusColor(reservation.status)}
                          >
                            {getStatusIcon(reservation.status)}
                            <span className="ml-1">{reservation.status}</span>
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={getPaymentStatusColor(reservation.paymentStatus)}
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {reservation.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reservation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#006bb8]">
                  <Eye className="w-5 h-5 mr-2" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReservation ? (
                  <div className="space-y-6">
                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Guest Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedReservation.guestName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedReservation.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedReservation.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VIP Status:</span>
                          <Badge className={selectedReservation.isVip ? "bg-[#ffc973] text-[#006bb8]" : "bg-gray-100 text-gray-800"}>
                            {selectedReservation.isVip ? 'VIP' : 'Standard'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Booking Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reservation ID:</span>
                          <span className="font-medium">{selectedReservation.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-medium">{formatDate(selectedReservation.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">{formatDate(selectedReservation.checkOut)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room:</span>
                          <span className="font-medium">{selectedReservation.roomNumber} - {selectedReservation.roomType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Guests:</span>
                          <span className="font-medium">{selectedReservation.adults} adults, {selectedReservation.children} children</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Source:</span>
                          <span className="font-medium">{selectedReservation.source}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium">LKR {selectedReservation.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge 
                            variant="secondary"
                            className={getPaymentStatusColor(selectedReservation.paymentStatus)}
                          >
                            {selectedReservation.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Date:</span>
                          <span className="font-medium">{formatDate(selectedReservation.bookingDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedReservation.specialRequests && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Special Requests
                        </h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedReservation.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedReservation.notes && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Notes</h3>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          {selectedReservation.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a reservation to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
