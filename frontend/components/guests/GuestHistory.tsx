'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, User, CreditCard, Bed, Calendar } from 'lucide-react';
import guestService from '@/services/guestService';

interface Feedback {
  date: string;
  rating: number;
  comment: string;
}

interface Stay {
  checkIn: string;
  checkOut: string;
  roomType?: string;
  roomNumber?: string;
  room?: string;
  roomPrice?: number;
  rate?: string;
  totalAmount?: number;
  totalSpent?: string;
}

interface PointTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  totalStays: number;
  totalSpent: number | string;
  lastStay: string;
  upcomingStay?: string;
  points: number;
  feedback?: Feedback[];
  stays?: Stay[];
  pointTransactions?: PointTransaction[];
}

interface GuestDetails {
  bookings?: Stay[];
  feedback?: Feedback[];
  pointTransactions?: PointTransaction[];
  summary?: {
    totalSpent: number;
    totalStays: number;
    lastStay: string;
    upcomingStay?: string;
  };
  loyalty?: {
    tier: string;
    points: number;
  };
}

const GuestHistory: React.FC = () => {
  const [guestData, setGuestData] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuestDetails, setSelectedGuestDetails] = useState<GuestDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [activeTab, setActiveTab] = useState<'stays' | 'feedback' | 'loyalty'>('stays');

  const mockGuestData: Guest[] = [{
    id: '1',
    name: 'Robert Davis',
    email: 'robert.davis@example.com',
    phone: '+1 (555) 123-4567',
    tier: 'Platinum',
    totalStays: 12,
    totalSpent: '$8,450',
    lastStay: '2023-08-10',
    upcomingStay: '2023-10-15',
    points: 24500,
    feedback: [{
      date: '2023-08-10',
      rating: 5,
      comment: 'Excellent service as always!'
    }, {
      date: '2023-05-22',
      rating: 4,
      comment: 'Great stay, minor issue with room service timing.'
    }],
    stays: [{
      checkIn: '2023-08-05',
      checkOut: '2023-08-10',
      room: 'Executive Suite',
      rate: '$350/night',
      totalSpent: '$1,750'
    }, {
      checkIn: '2023-05-18',
      checkOut: '2023-05-22',
      room: 'Deluxe Room',
      rate: '$250/night',
      totalSpent: '$1,000'
    }]
  }, {
    id: '2',
    name: 'Jennifer Adams',
    email: 'jennifer.adams@example.com',
    phone: '+1 (555) 987-6543',
    tier: 'Gold',
    totalStays: 8,
    totalSpent: '$5,280',
    lastStay: '2023-07-25',
    upcomingStay: '2023-11-08',
    points: 12800,
    feedback: [{
      date: '2023-07-25',
      rating: 5,
      comment: 'Loved the spa services!'
    }],
    stays: [{
      checkIn: '2023-07-20',
      checkOut: '2023-07-25',
      room: 'Deluxe Room',
      rate: '$250/night',
      totalSpent: '$1,250'
    }, {
      checkIn: '2023-03-15',
      checkOut: '2023-03-20',
      room: 'Standard Room',
      rate: '$180/night',
      totalSpent: '$900'
    }]
  }, {
    id: '3',
    name: 'Thomas Wilson',
    email: 'thomas.wilson@example.com',
    phone: '+1 (555) 456-7890',
    tier: 'Gold',
    totalStays: 6,
    totalSpent: '$3,900',
    lastStay: '2023-06-15',
    upcomingStay: '2023-11-05',
    points: 9600,
    feedback: [{
      date: '2023-06-15',
      rating: 4,
      comment: 'Very comfortable stay, great location.'
    }],
    stays: [{
      checkIn: '2023-06-10',
      checkOut: '2023-06-15',
      room: 'Deluxe Room',
      rate: '$250/night',
      totalSpent: '$1,250'
    }, {
      checkIn: '2023-01-05',
      checkOut: '2023-01-10',
      room: 'Standard Room',
      rate: '$180/night',
      totalSpent: '$900'
    }]
  }];

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (selectedGuest) {
      fetchGuestDetails(selectedGuest.id);
    }
  }, [selectedGuest]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const guests = await guestService.getAllGuestsHistory();
      setGuestData(guests);
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Failed to load guests');
      setGuestData(mockGuestData);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestDetails = async (guestId: string) => {
    try {
      setDetailsLoading(true);
      const details = await guestService.getGuestHistory(guestId);
      setSelectedGuestDetails(details);
    } catch (err) {
      console.error('Error fetching guest details:', err);
      setSelectedGuestDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredGuests = guestData
    .filter(guest => {
      if (filter === 'platinum') return guest.tier === 'Platinum';
      if (filter === 'gold') return guest.tier === 'Gold';
      if (filter === 'silver') return guest.tier === 'Silver';
      if (filter === 'bronze') return guest.tier === 'Bronze';
      return true;
    })
    .filter(guest =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
  };

  const formatCurrency = (amount: number | string): string => {
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const displayGuest = selectedGuest ? {
    ...selectedGuest,
    stays: (selectedGuestDetails?.bookings || selectedGuest.stays || []),
    feedback: (selectedGuestDetails?.feedback || selectedGuest.feedback || []),
    pointTransactions: (selectedGuestDetails?.pointTransactions || []),
    totalSpent: selectedGuestDetails?.summary?.totalSpent || selectedGuest.totalSpent || 0,
    totalStays: selectedGuestDetails?.summary?.totalStays || selectedGuest.totalStays || 0,
    lastStay: selectedGuestDetails?.summary?.lastStay || selectedGuest.lastStay,
    upcomingStay: selectedGuestDetails?.summary?.upcomingStay || selectedGuest.upcomingStay,
    tier: selectedGuestDetails?.loyalty?.tier || selectedGuest.tier || 'Bronze',
    points: selectedGuestDetails?.loyalty?.points || selectedGuest.points || 0
  } : null;

  const getTierBadgeClass = (tier: string): string => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Silver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const getTierProgress = (tier: string, points: number): number => {
    switch (tier) {
      case 'Bronze':
        return (points / 5000) * 100;
      case 'Silver':
        return (points / 10000) * 100;
      case 'Gold':
        return (points / 20000) * 100;
      default:
        return 100;
    }
  };

  const getNextTierText = (tier: string): string => {
    switch (tier) {
      case 'Bronze':
        return 'Next: Silver (5,000 points)';
      case 'Silver':
        return 'Next: Gold (10,000 points)';
      case 'Gold':
        return 'Next: Platinum (20,000 points)';
      default:
        return 'Highest tier achieved';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Guest History</h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading guests...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchGuests}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Guest List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search guests"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <select
                      className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                    >
                      <option value="all">All Tiers</option>
                      <option value="platinum">Platinum</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="bronze">Bronze</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                <ul className="divide-y divide-gray-200">
                  {filteredGuests.map(guest => (
                    <li
                      key={guest.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedGuest?.id === guest.id ? 'bg-gray-50' : ''}`}
                      onClick={() => handleGuestSelect(guest)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {guest.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {guest.name}
                            </p>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadgeClass(guest.tier)}`}>
                              {guest.tier}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{guest.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Stays: {guest.totalStays}</span>
                        <span>Spent: {formatCurrency(guest.totalSpent)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {filteredGuests.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">
                      No guests found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="lg:col-span-2">
            {displayGuest ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-lg">
                          {displayGuest.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {displayGuest.name}
                        </h2>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadgeClass(displayGuest.tier)}`}>
                            {displayGuest.tier}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {displayGuest.points.toLocaleString()} Points
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm">{displayGuest.email}</p>
                        <p className="text-sm">{displayGuest.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Total Spent</p>
                        <p className="text-sm font-medium">
                          {formatCurrency(displayGuest.totalSpent)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Total Stays</p>
                        <p className="text-sm font-medium">
                          {displayGuest.totalStays}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Last Stay</p>
                        <p className="text-sm">{formatDate(displayGuest.lastStay)}</p>
                        {displayGuest.upcomingStay && (
                          <>
                            <p className="text-xs text-gray-500 mt-1">Upcoming</p>
                            <p className="text-sm">
                              {formatDate(displayGuest.upcomingStay)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('stays')}
                      className={`py-4 px-6 text-sm font-medium ${activeTab === 'stays' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      Stay History
                    </button>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className={`py-4 px-6 text-sm font-medium ${activeTab === 'feedback' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      Feedback
                    </button>
                    <button
                      onClick={() => setActiveTab('loyalty')}
                      className={`py-4 px-6 text-sm font-medium ${activeTab === 'loyalty' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      Loyalty & Points
                    </button>
                  </nav>
                </div>
                <div className="p-6">
                  {activeTab === 'stays' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Stay History
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dates
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Room
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rate
                              </th>
                              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {displayGuest.stays.map((stay, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(stay.checkIn)} - {formatDate(stay.checkOut)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {stay.roomType || stay.room} {stay.roomNumber ? `- ${stay.roomNumber}` : ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {stay.roomPrice ? formatCurrency(stay.roomPrice) : stay.rate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                  {stay.totalAmount ? formatCurrency(stay.totalAmount) : stay.totalSpent}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeTab === 'feedback' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Feedback History
                      </h3>
                      {displayGuest.feedback.length > 0 ? (
                        <div className="space-y-4">
                          {displayGuest.feedback.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-md">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {item.date}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-gray-600">
                                {item.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No feedback available for this guest.
                        </p>
                      )}
                    </div>
                  )}
                  {activeTab === 'loyalty' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Loyalty & Points
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Current Tier</p>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadgeClass(displayGuest.tier)}`}>
                                {displayGuest.tier}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Available Points
                            </p>
                            <p className="text-lg font-semibold">
                              {displayGuest.points.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Tier Progress
                      </h4>
                      <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Current: {displayGuest.tier}</span>
                          <span>{getNextTierText(displayGuest.tier)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-yellow-500 h-2.5 rounded-full"
                            style={{ width: `${getTierProgress(displayGuest.tier, displayGuest.points)}%` }}
                          ></div>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Recent Points Activity
                      </h4>
                      {displayGuest.pointTransactions && displayGuest.pointTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Activity
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Points
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {displayGuest.pointTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(transaction.date)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    {transaction.description}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No point transaction history available.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No Guest Selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a guest from the list to view their details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestHistory;
