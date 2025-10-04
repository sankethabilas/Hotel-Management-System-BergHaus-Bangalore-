'use client';

import React, { useState } from 'react';
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
  Bed, 
  Search, 
  Plus, 
  Edit,
  User, 
  Trash2, 
  Eye, 
  Wifi, 
  Car, 
  Coffee, 
  Shield,
  Tv,
  Wind,
  Bath,
  Users,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockRooms = [
  {
    id: '1',
    number: '101',
    type: 'Deluxe Suite',
    floor: 1,
    status: 'occupied',
    guest: 'John Smith',
    checkIn: '2024-01-15T14:00:00Z',
    checkOut: '2024-01-17T11:00:00Z',
    amenities: ['WiFi', 'Mini Bar', 'Balcony', 'TV', 'AC', 'Bathroom'],
    price: 25000,
    capacity: 2,
    size: '45 sqm',
    description: 'Spacious deluxe suite with city view and modern amenities',
    maintenance: null,
    housekeeping: 'completed'
  },
  {
    id: '2',
    number: '102',
    type: 'Deluxe Suite',
    floor: 1,
    status: 'available',
    guest: null,
    checkIn: null,
    checkOut: null,
    amenities: ['WiFi', 'Mini Bar', 'Balcony', 'TV', 'AC', 'Bathroom'],
    price: 25000,
    capacity: 2,
    size: '45 sqm',
    description: 'Spacious deluxe suite with city view and modern amenities',
    maintenance: null,
    housekeeping: 'completed'
  },
  {
    id: '3',
    number: '103',
    type: 'Deluxe Suite',
    floor: 1,
    status: 'maintenance',
    guest: null,
    checkIn: null,
    checkOut: null,
    amenities: ['WiFi', 'Mini Bar', 'Balcony', 'TV', 'AC', 'Bathroom'],
    price: 25000,
    capacity: 2,
    size: '45 sqm',
    description: 'Spacious deluxe suite with city view and modern amenities',
    maintenance: {
      type: 'Plumbing',
      description: 'Bathroom faucet repair',
      startDate: '2024-01-15T09:00:00Z',
      estimatedEnd: '2024-01-16T17:00:00Z',
      assignedTo: 'Maintenance Team A'
    },
    housekeeping: 'pending'
  },
  {
    id: '4',
    number: '201',
    type: 'Standard Room',
    floor: 2,
    status: 'available',
    guest: null,
    checkIn: null,
    checkOut: null,
    amenities: ['WiFi', 'TV', 'AC', 'Bathroom'],
    price: 15000,
    capacity: 2,
    size: '30 sqm',
    description: 'Comfortable standard room with essential amenities',
    maintenance: null,
    housekeeping: 'completed'
  },
  {
    id: '5',
    number: '205',
    type: 'Standard Room',
    floor: 2,
    status: 'occupied',
    guest: 'Sarah Johnson',
    checkIn: '2024-01-15T16:00:00Z',
    checkOut: '2024-01-16T11:00:00Z',
    amenities: ['WiFi', 'TV', 'AC', 'Bathroom'],
    price: 15000,
    capacity: 2,
    size: '30 sqm',
    description: 'Comfortable standard room with essential amenities',
    maintenance: null,
    housekeeping: 'in-progress'
  },
  {
    id: '6',
    number: '301',
    type: 'Executive Suite',
    floor: 3,
    status: 'available',
    guest: null,
    checkIn: null,
    checkOut: null,
    amenities: ['WiFi', 'Mini Bar', 'Balcony', 'TV', 'AC', 'Bathroom', 'Jacuzzi', 'Kitchenette'],
    price: 35000,
    capacity: 4,
    size: '60 sqm',
    description: 'Luxurious executive suite with premium amenities',
    maintenance: null,
    housekeeping: 'completed'
  }
];

const amenityIcons = {
  'WiFi': Wifi,
  'TV': Tv,
  'AC': Wind,
  'Bathroom': Bath,
  'Mini Bar': Coffee,
  'Balcony': MapPin,
  'Jacuzzi': Shield,
  'Kitchenette': Settings,
  'Parking': Car
};

export default function RoomManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddRoom, setShowAddRoom] = useState(false);

  const filteredRooms = mockRooms.filter(room =>
    room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.guest && room.guest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'maintenance':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
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
      case 'maintenance':
        return 'Maintenance';
      case 'reserved':
        return 'Reserved';
      default:
        return 'Unknown';
    }
  };

  const getHousekeepingStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const roomStats = {
    total: mockRooms.length,
    available: mockRooms.filter(r => r.status === 'available').length,
    occupied: mockRooms.filter(r => r.status === 'occupied').length,
    maintenance: mockRooms.filter(r => r.status === 'maintenance').length
  };

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#006bb8]">Room Management</h1>
            <p className="text-gray-600">Manage hotel rooms, maintenance, and housekeeping</p>
          </div>
        </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#006bb8]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-[#006bb8]">{roomStats.total}</p>
              </div>
              <Bed className="w-8 h-8 text-[#006bb8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{roomStats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600">{roomStats.occupied}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-600">{roomStats.maintenance}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Room Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-[#006bb8]">
                    <Bed className="w-5 h-5 mr-2" />
                    All Rooms
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search rooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedRoom?.id === room.id
                          ? "border-[#006bb8] bg-[#006bb8]/5"
                          : "border-gray-200 hover:border-[#2fa0df]"
                      )}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Room {room.number}</h3>
                          <p className="text-sm text-gray-600">{room.type}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "text-white",
                            getRoomStatusColor(room.status)
                          )}
                        >
                          {getRoomStatusText(room.status)}
                        </Badge>
                      </div>
                      
                      {room.guest && (
                        <div className="mb-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-900">{room.guest}</p>
                          <p className="text-xs text-gray-600">
                            Check-out: {formatDate(room.checkOut!)}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {room.capacity}
                          </span>
                          <span className="text-gray-600">{room.size}</span>
                        </div>
                        <span className="font-semibold text-[#006bb8]">
                          LKR {room.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#006bb8]">
                  <Eye className="w-5 h-5 mr-2" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRoom ? (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Basic Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Number:</span>
                          <span className="font-medium">{selectedRoom.number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedRoom.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floor:</span>
                          <span className="font-medium">{selectedRoom.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium">{selectedRoom.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{selectedRoom.capacity} guests</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">LKR {selectedRoom.price.toLocaleString()}/night</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Current Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-white",
                              getRoomStatusColor(selectedRoom.status)
                            )}
                          >
                            {getRoomStatusText(selectedRoom.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Housekeeping:</span>
                          <Badge 
                            variant="secondary"
                            className={getHousekeepingStatusColor(selectedRoom.housekeeping)}
                          >
                            {selectedRoom.housekeeping}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information */}
                    {selectedRoom.guest && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Guest Information</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">{selectedRoom.guest}</p>
                          <p className="text-sm text-gray-600">
                            Check-in: {formatDate(selectedRoom.checkIn)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Check-out: {formatDate(selectedRoom.checkOut)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.amenities.map((amenity: string) => {
                          const Icon = amenityIcons[amenity as keyof typeof amenityIcons] || Settings;
                          return (
                            <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              {amenity}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Maintenance Information */}
                    {selectedRoom.maintenance && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Maintenance</h3>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="font-medium text-yellow-800">{selectedRoom.maintenance.type}</p>
                          <p className="text-sm text-yellow-700">{selectedRoom.maintenance.description}</p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Assigned to: {selectedRoom.maintenance.assignedTo}
                          </p>
                          <p className="text-xs text-yellow-600">
                            Est. completion: {formatDate(selectedRoom.maintenance.estimatedEnd)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" />
                        Maintenance
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a room to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-[#006bb8]">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Maintenance Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRooms.filter(room => room.maintenance).map((room) => (
                  <div key={room.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-yellow-800">Room {room.number} - {room.maintenance?.type}</h3>
                        <p className="text-sm text-yellow-700">{room.maintenance?.description}</p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Assigned to: {room.maintenance?.assignedTo} | 
                          Started: {room.maintenance?.startDate ? formatDate(room.maintenance.startDate) : 'N/A'} | 
                          Est. completion: {room.maintenance?.estimatedEnd ? formatDate(room.maintenance.estimatedEnd) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                          Update
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housekeeping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-[#006bb8]">
                <Shield className="w-5 h-5 mr-2" />
                Housekeeping Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRooms.map((room) => (
                  <div key={room.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Room {room.number}</h3>
                      <Badge 
                        variant="secondary"
                        className={getHousekeepingStatusColor(room.housekeeping)}
                      >
                        {room.housekeeping}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{room.type}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#006bb8] hover:bg-[#006bb8]/90">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
