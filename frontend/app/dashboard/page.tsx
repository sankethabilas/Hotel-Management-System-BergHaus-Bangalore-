'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Wifi,
  Car,
  Coffee,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockGuests = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    checkIn: '2024-01-15T14:00:00Z',
    checkOut: '2024-01-17T11:00:00Z',
    roomNumber: '101',
    roomType: 'Deluxe Suite',
    status: 'checked-in',
    isVip: true,
    specialRequests: 'Late checkout requested'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0124',
    checkIn: '2024-01-15T16:00:00Z',
    checkOut: '2024-01-16T11:00:00Z',
    roomNumber: '205',
    roomType: 'Standard Room',
    status: 'checked-in',
    isVip: false,
    specialRequests: 'Extra towels needed'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'm.brown@email.com',
    phone: '+1-555-0125',
    checkIn: '2024-01-15T12:00:00Z',
    checkOut: '2024-01-15T11:00:00Z',
    roomNumber: '302',
    roomType: 'Executive Suite',
    status: 'pending-checkout',
    isVip: true,
    specialRequests: 'Airport shuttle needed'
  }
];

const mockRooms = [
  { number: '101', roomType: 'Deluxe Suite', status: 'occupied', guest: 'John Smith' },
  { number: '102', roomType: 'Deluxe Suite', status: 'available', guest: null },
  { number: '103', roomType: 'Deluxe Suite', status: 'maintenance', guest: null },
  { number: '104', roomType: 'Deluxe Suite', status: 'reserved', guest: 'Jane Doe' },
  { number: '201', roomType: 'Standard Room', status: 'available', guest: null },
  { number: '202', roomType: 'Standard Room', status: 'available', guest: null },
  { number: '203', roomType: 'Standard Room', status: 'occupied', guest: 'Bob Wilson' },
  { number: '204', roomType: 'Standard Room', status: 'reserved', guest: 'Alice Green' },
  { number: '205', roomType: 'Standard Room', status: 'occupied', guest: 'Sarah Johnson' },
  { number: '301', roomType: 'Executive Suite', status: 'available', guest: null },
  { number: '302', roomType: 'Executive Suite', status: 'occupied', guest: 'Michael Brown' },
  { number: '303', roomType: 'Executive Suite', status: 'maintenance', guest: null },
];

const mockNotifications = [
  {
    id: '1',
    type: 'vip',
    title: 'VIP Guest Arrival',
    message: 'John Smith (VIP) has arrived and is waiting for check-in',
    time: '2 minutes ago',
    priority: 'high'
  },
  {
    id: '2',
    type: 'late-checkout',
    title: 'Late Check-out Alert',
    message: 'Michael Brown in Room 302 is past check-out time',
    time: '15 minutes ago',
    priority: 'high'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Pending Payment',
    message: 'Payment pending for Room 205 - Sarah Johnson',
    time: '1 hour ago',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'maintenance',
    title: 'Maintenance Complete',
    message: 'Room 103 maintenance has been completed',
    time: '2 hours ago',
    priority: 'low'
  }
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedGuest, setSelectedGuest] = useState('');

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'maintenance':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  const getRoomStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      case 'maintenance':
        return 'Maintenance';
      case 'unknown':
        return 'Unknown';
      default:
        return 'Unknown';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vip':
        return <Star className="w-4 h-4 text-[#ffc973]" />;
      case 'late-checkout':
        return <Clock className="w-4 h-4 text-red-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-[#2fa0df]" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const { user } = useAuth();

  const getNotificationPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const stats = {
    totalGuests: mockGuests.filter(g => g.status === 'checked-in').length,
    availableRooms: mockRooms.filter(r => r.status === 'available').length,
    pendingCheckouts: mockGuests.filter(g => g.status === 'pending-checkout').length,
    lateCheckouts: 1 // Michael Brown
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#006bb8]">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search guests, rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-gradient-to-r from-[#006bb8] to-[#2fa0df] hover:from-[#006bb8]/90 hover:to-[#2fa0df]/90">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2">3</Badge>
            </Button>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#006bb8]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold text-[#006bb8]">{stats.totalGuests}</p>
              </div>
              <Users className="w-8 h-8 text-[#006bb8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-green-600">{stats.availableRooms}</p>
              </div>
              <Bed className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Check-outs</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCheckouts}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Check-outs</p>
                <p className="text-2xl font-bold text-red-600">{stats.lateCheckouts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Guests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-[#006bb8]">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#006bb8] to-[#2fa0df] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {guest.name?.split(' ').map(n => n[0]).join('') || 'G'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{guest.name || 'Unknown Guest'}</h3>
                        {guest.isVip && (
                          <Badge className="bg-[#ffc973] text-[#006bb8]">
                            <Star className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Room {guest.roomNumber || 'N/A'} - {guest.roomType || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        Check-in: {guest.checkIn ? new Date(guest.checkIn).toLocaleTimeString() : 'N/A'} | 
                        Check-out: {guest.checkOut ? new Date(guest.checkOut).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={guest.status === 'checked-in' ? 'default' : 'secondary'}
                      className={guest.status === 'checked-in' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {guest.status === 'checked-in' ? 'Checked In' : 'Pending Check-out'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Key className="w-4 h-4 mr-1" />
                      {guest.status === 'checked-in' ? 'Check-out' : 'Check-in'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-[#006bb8]">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    getNotificationPriorityColor(notification.priority)
                  )}
                >
                  <div className="flex items-start space-x-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Bed className="w-5 h-5 mr-2" />
            Room Status Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
            {mockRooms.map((room) => (
              <div
                key={room.number}
                className={cn(
                  "relative p-3 rounded-lg text-white text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                  getRoomStatusColor(room.status || 'unknown')
                )}
                title={`Room ${room.number || 'Unknown'} - ${room.roomType || 'Unknown Type'} - ${getRoomStatusText(room.status || 'unknown')}${room.guest ? ` - ${room.guest}` : ''}`}
              >
                <div className="text-sm font-semibold">{room.number || 'N/A'}</div>
                <div className="text-xs opacity-90">{room.roomType?.split(' ')[0] || 'Room'}</div>
                {room.guest && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-In/Check-Out Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Key className="w-5 h-5 mr-2" />
            Quick Check-In/Check-Out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Guest
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Booking ID, name, or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Room
              </label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {mockRooms.filter(room => room.status === 'available').map((room) => (
                    <SelectItem key={room.number} value={room.number}>
                      Room {room.number} - {room.roomType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button className="bg-gradient-to-r from-[#006bb8] to-[#2fa0df] hover:from-[#006bb8]/90 hover:to-[#2fa0df]/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Check-In
              </Button>
              <Button variant="outline" className="border-[#ffc973] text-[#006bb8] hover:bg-[#ffc973]/10">
                <XCircle className="w-4 h-4 mr-2" />
                Check-Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
