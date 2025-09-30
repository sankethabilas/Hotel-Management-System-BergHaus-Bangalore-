'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Key,
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Bed, 
  CreditCard,
  AlertTriangle,
  Star,
  MapPin,
  FileText,
  Camera,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockBookings = [
  {
    id: 'BK001',
    guestName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    checkIn: '2024-01-15T14:00:00Z',
    checkOut: '2024-01-17T11:00:00Z',
    roomNumber: '101',
    roomType: 'Deluxe Suite',
    status: 'confirmed',
    isVip: true,
    specialRequests: 'Late checkout requested',
    paymentStatus: 'paid',
    totalAmount: 45000,
    idType: 'passport',
    idNumber: 'P123456789',
    address: '123 Main St, New York, NY',
    emergencyContact: '+1-555-9999',
    preferences: ['Non-smoking', 'High floor', 'City view']
  },
  {
    id: 'BK002',
    guestName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0124',
    checkIn: '2024-01-15T16:00:00Z',
    checkOut: '2024-01-16T11:00:00Z',
    roomNumber: '205',
    roomType: 'Standard Room',
    status: 'confirmed',
    isVip: false,
    specialRequests: 'Extra towels needed',
    paymentStatus: 'pending',
    totalAmount: 25000,
    idType: 'driving_license',
    idNumber: 'DL987654321',
    address: '456 Oak Ave, Los Angeles, CA',
    emergencyContact: '+1-555-8888',
    preferences: ['Ground floor', 'Quiet room']
  }
];

const mockAvailableRooms = [
  { number: '102', type: 'Deluxe Suite', floor: '1', amenities: ['WiFi', 'Mini Bar', 'Balcony'] },
  { number: '201', type: 'Standard Room', floor: '2', amenities: ['WiFi', 'TV'] },
  { number: '202', type: 'Standard Room', floor: '2', amenities: ['WiFi', 'TV'] },
  { number: '301', type: 'Executive Suite', floor: '3', amenities: ['WiFi', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
];

export default function CheckInCheckOutPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [activeTab, setActiveTab] = useState('checkin');

  const filteredBookings = mockBookings.filter(booking =>
    booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.phone.includes(searchQuery)
  );

  const handleCheckIn = () => {
    if (selectedBooking && selectedRoom) {
      // Handle check-in logic
      console.log('Checking in:', selectedBooking.guestName, 'to room:', selectedRoom);
      // Show success message
      setSelectedBooking(null);
      setSelectedRoom('');
      setCheckInNotes('');
    }
  };

  const handleCheckOut = () => {
    if (selectedBooking) {
      // Handle check-out logic
      console.log('Checking out:', selectedBooking.guestName);
      // Show success message
      setSelectedBooking(null);
      setCheckOutNotes('');
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

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#006bb8]">Check-In / Check-Out</h1>
            <p className="text-gray-600">Manage guest arrivals and departures</p>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkin" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Check-In</span>
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center space-x-2">
            <XCircle className="w-4 h-4" />
            <span>Check-Out</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search and Booking List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#006bb8]">
                  <Search className="w-5 h-5 mr-2" />
                  Today's Arrivals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name, booking ID, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedBooking?.id === booking.id
                            ? "border-[#006bb8] bg-[#006bb8]/5"
                            : "border-gray-200 hover:border-[#2fa0df]"
                        )}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#006bb8] to-[#2fa0df] rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {booking.guestName?.split(' ').map(n => n[0]).join('') || 'G'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{booking.guestName}</h3>
                                {booking.isVip && (
                                  <Badge className="bg-[#ffc973] text-[#006bb8]">
                                    <Star className="w-3 h-3 mr-1" />
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                              <p className="text-xs text-gray-500">
                                Arrival: {formatDate(booking.checkIn)} at {formatTime(booking.checkIn)}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                            className={booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check-In Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#006bb8]">
                  <Key className="w-5 h-5 mr-2" />
                  Check-In Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBooking ? (
                  <div className="space-y-6">
                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Guest Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Name</Label>
                          <p className="font-medium">{selectedBooking.guestName}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Phone</Label>
                          <p className="font-medium">{selectedBooking.phone}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Email</Label>
                          <p className="font-medium">{selectedBooking.email}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">ID Type</Label>
                          <p className="font-medium">{selectedBooking.idType}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-gray-600">ID Number</Label>
                          <p className="font-medium">{selectedBooking.idNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Booking Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Check-In</Label>
                          <p className="font-medium">{formatDate(selectedBooking.checkIn)}</p>
                          <p className="text-xs text-gray-500">{formatTime(selectedBooking.checkIn)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Check-Out</Label>
                          <p className="font-medium">{formatDate(selectedBooking.checkOut)}</p>
                          <p className="text-xs text-gray-500">{formatTime(selectedBooking.checkOut)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Room Type</Label>
                          <p className="font-medium">{selectedBooking.roomType}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Total Amount</Label>
                          <p className="font-medium">LKR {selectedBooking.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Room Assignment */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Bed className="w-4 h-4 mr-2" />
                        Room Assignment
                      </h3>
                      <div>
                        <Label htmlFor="room-select">Assign Room</Label>
                        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select available room" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockAvailableRooms.map((room) => (
                              <SelectItem key={room.number} value={room.number}>
                                Room {room.number} - {room.type} (Floor {room.floor})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedBooking.specialRequests && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Special Requests
                        </h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedBooking.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Check-In Notes */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Check-In Notes</h3>
                      <Textarea
                        placeholder="Add any notes for check-in..."
                        value={checkInNotes}
                        onChange={(e) => setCheckInNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-[#006bb8] to-[#2fa0df] hover:from-[#006bb8]/90 hover:to-[#2fa0df]/90"
                        onClick={handleCheckIn}
                        disabled={!selectedRoom}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Check-In
                      </Button>
                      <Button variant="outline" className="border-[#ffc973] text-[#006bb8] hover:bg-[#ffc973]/10">
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a guest to begin check-in process</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checkout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Check-Out List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#006bb8]">
                  <Search className="w-5 h-5 mr-2" />
                  Today's Departures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name, room number, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedBooking?.id === booking.id
                            ? "border-[#006bb8] bg-[#006bb8]/5"
                            : "border-gray-200 hover:border-[#2fa0df]"
                        )}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#ffc973] to-[#fee3b3] rounded-full flex items-center justify-center">
                              <span className="text-[#006bb8] font-semibold text-sm">
                                {booking.guestName?.split(' ').map(n => n[0]).join('') || 'G'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{booking.guestName}</h3>
                                {booking.isVip && (
                                  <Badge className="bg-[#ffc973] text-[#006bb8]">
                                    <Star className="w-3 h-3 mr-1" />
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">Room {booking.roomNumber} - {booking.roomType}</p>
                              <p className="text-xs text-gray-500">
                                Departure: {formatDate(booking.checkOut)} at {formatTime(booking.checkOut)}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'}
                            className={booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Due'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check-Out Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#006bb8]">
                  <XCircle className="w-5 h-5 mr-2" />
                  Check-Out Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBooking ? (
                  <div className="space-y-6">
                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Guest Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Name</Label>
                          <p className="font-medium">{selectedBooking.guestName}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Room</Label>
                          <p className="font-medium">{selectedBooking.roomNumber}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Check-Out Time</Label>
                          <p className="font-medium">{formatTime(selectedBooking.checkOut)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Payment Status</Label>
                          <Badge 
                            variant={selectedBooking.paymentStatus === 'paid' ? 'default' : 'destructive'}
                            className={selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {selectedBooking.paymentStatus === 'paid' ? 'Paid' : 'Payment Due'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Bill Summary
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Room Rate (2 nights)</span>
                          <span>LKR {selectedBooking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax (10%)</span>
                          <span>LKR {(selectedBooking.totalAmount * 0.1).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Charge</span>
                          <span>LKR 0</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total Amount</span>
                          <span>LKR {(selectedBooking.totalAmount * 1.1).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Check-Out Notes */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Check-Out Notes</h3>
                      <Textarea
                        placeholder="Add any notes for check-out..."
                        value={checkOutNotes}
                        onChange={(e) => setCheckOutNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-[#ffc973] to-[#fee3b3] text-[#006bb8] hover:from-[#ffc973]/90 hover:to-[#fee3b3]/90"
                        onClick={handleCheckOut}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Complete Check-Out
                      </Button>
                      <Button variant="outline" className="border-[#006bb8] text-[#006bb8] hover:bg-[#006bb8]/10">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Process Payment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a guest to begin check-out process</p>
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
