'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Bed,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock
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
}

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  status: string;
  pricePerNight: number;
  amenities: string[];
  floor: number;
  maxOccupancy: number;
}

export default function RoomAllocationPage() {
  const [unallocatedReservations, setUnallocatedReservations] = useState<Reservation[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [allocationDialog, setAllocationDialog] = useState<{
    open: boolean;
    reservation: Reservation | null;
  }>({
    open: false,
    reservation: null
  });
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch unallocated reservations (confirmed but no rooms assigned)
      const reservationsResponse = await fetch('/api/frontdesk/reservations?status=confirmed', {
        credentials: 'include'
      });
      
      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        // Filter for reservations without room allocation
        const unallocated = reservationsData.data.reservations.filter(
          (res: Reservation) => !res.rooms || res.rooms.length === 0
        );
        setUnallocatedReservations(unallocated);
      }

      // Fetch available rooms
      const roomsResponse = await fetch('/api/rooms', {
        credentials: 'include'
      });
      
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        // Filter for available rooms
        const available = roomsData.data.rooms.filter(
          (room: Room) => room.status === 'available'
        );
        setAvailableRooms(available);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load room allocation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoomsForReservation = async (reservation: Reservation) => {
    try {
      // Format dates properly for the API
      const checkInDate = new Date(reservation.checkInDate).toISOString().split('T')[0];
      const checkOutDate = new Date(reservation.checkOutDate).toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/frontdesk/available-rooms?checkIn=${checkInDate}&checkOut=${checkOutDate}`,
        {
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Available rooms for reservation:', data);
        setAvailableRooms(data.data.rooms);
      } else {
        const errorData = await response.json();
        console.error('Error fetching available rooms:', errorData);
        toast({
          title: "Error",
          description: errorData.message || "Failed to load available rooms for this reservation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load available rooms",
        variant: "destructive",
      });
    }
  };

  const handleAllocateRoom = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setAllocationDialog({
      open: true,
      reservation
    });
    setSelectedRoom('');
    
    // Fetch available rooms for this specific reservation
    fetchAvailableRoomsForReservation(reservation);
  };

  const executeAllocation = async () => {
    if (!selectedReservation || !selectedRoom) {
      toast({
        title: "Error",
        description: "Please select a room to allocate",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Allocating room:', {
        reservationId: selectedReservation._id,
        roomId: selectedRoom,
        reservation: selectedReservation
      });

      const response = await fetch('/api/frontdesk/allocate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservationId: selectedReservation._id,
          roomId: selectedRoom
        })
      });

      console.log('Allocation response status:', response.status);

      if (response.ok) {
        const successData = await response.json();
        console.log('Allocation success:', successData);
        toast({
          title: "Success",
          description: "Room allocated successfully",
        });
        
        // Refresh data
        fetchData();
        setAllocationDialog({ open: false, reservation: null });
        setSelectedRoom('');
      } else {
        const errorData = await response.json();
        console.error('Allocation error:', errorData);
        toast({
          title: "Error",
          description: errorData.message || "Failed to allocate room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      toast({
        title: "Error",
        description: "Failed to allocate room",
        variant: "destructive",
      });
    }
  };

  const getRoomStatusBadge = (status: string) => {
    const statusConfig = {
      'available': { label: 'Available', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'occupied': { label: 'Occupied', variant: 'destructive' as const },
      'maintenance': { label: 'Maintenance', variant: 'secondary' as const },
      'reserved': { label: 'Reserved', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredReservations = unallocatedReservations.filter(reservation =>
    reservation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.reservationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.guestEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bb8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room allocation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#006bb8]">Room Allocation</h1>
          <p className="text-gray-600">Assign rooms to confirmed reservations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unallocated Reservations</p>
                <p className="text-2xl font-bold text-orange-600">{unallocatedReservations.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-green-600">{availableRooms.length}</p>
              </div>
              <Bed className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Allocation Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {unallocatedReservations.length > 0 
                    ? Math.round((1 - unallocatedReservations.length / (unallocatedReservations.length + 10)) * 100)
                    : 100}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reservations by guest name, reservation ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Unallocated Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <AlertCircle className="w-5 h-5 mr-2" />
            Unallocated Reservations ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reservation ID</TableHead>
                  <TableHead>Guest Details</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Special Requests</TableHead>
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
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>In: {new Date(reservation.checkInDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Out: {new Date(reservation.checkOutDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{reservation.guestCount.adults} adults</span>
                        </div>
                        {reservation.guestCount.children > 0 && (
                          <div className="text-xs text-gray-500">
                            {reservation.guestCount.children} children
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.specialRequests ? (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {reservation.specialRequests}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleAllocateRoom(reservation)}
                        className="bg-[#006bb8] hover:bg-[#006bb8]/90"
                      >
                        <Bed className="w-4 h-4 mr-2" />
                        Allocate Room
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>All confirmed reservations have been allocated rooms</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Rooms Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Bed className="w-5 h-5 mr-2" />
            Available Rooms ({availableRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableRooms.map((room) => (
              <Card key={room._id} className="border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">Room {room.roomNumber}</h3>
                    {getRoomStatusBadge(room.status)}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><strong>Type:</strong> {room.type}</p>
                    <p><strong>Floor:</strong> {room.floor}</p>
                    <p><strong>Max Occupancy:</strong> {room.maxOccupancy}</p>
                    <p><strong>Price:</strong> ${room.pricePerNight}/night</p>
                    {room.amenities && room.amenities.length > 0 && (
                      <div>
                        <strong>Amenities:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {room.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <Dialog open={allocationDialog.open} onOpenChange={(open) => !open && setAllocationDialog({ open: false, reservation: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allocate Room</DialogTitle>
            <DialogDescription>
              {allocationDialog.reservation && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Guest Information</p>
                      <p><strong>Name:</strong> {allocationDialog.reservation.guestName}</p>
                      <p><strong>Email:</strong> {allocationDialog.reservation.guestEmail}</p>
                      <p><strong>Phone:</strong> {allocationDialog.reservation.guestPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Reservation Details</p>
                      <p><strong>ID:</strong> {allocationDialog.reservation.reservationId}</p>
                      <p><strong>Check-in:</strong> {new Date(allocationDialog.reservation.checkInDate).toLocaleDateString()}</p>
                      <p><strong>Check-out:</strong> {new Date(allocationDialog.reservation.checkOutDate).toLocaleDateString()}</p>
                      <p><strong>Guests:</strong> {allocationDialog.reservation.guestCount.adults} adults, {allocationDialog.reservation.guestCount.children} children</p>
                    </div>
                  </div>

                  {allocationDialog.reservation.specialRequests && (
                    <div>
                      <p className="font-medium">Special Requests</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{allocationDialog.reservation.specialRequests}</p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-2">Select Room</p>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an available room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room._id} value={room._id}>
                            Room {room.roomNumber} - {room.type} (Floor {room.floor}) - ${room.pricePerNight}/night
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocationDialog({ open: false, reservation: null })}>
              Cancel
            </Button>
            <Button onClick={executeAllocation} disabled={!selectedRoom}>
              Allocate Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
