import React, { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { loyaltyService } from '../../services/loyaltyService';

const EnrollmentForm = ({
  onSubmit,
  onCancel,
  enrolledMembers = []
}) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [initialPoints, setInitialPoints] = useState(0);

  // Fetch available guests on mount and when enrolled members change
  useEffect(() => {
    fetchGuests();
  }, [enrolledMembers]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loyaltyService.getAvailableGuests();
      
      // Filter out guests who are already enrolled in loyalty program
      const enrolledUserIds = enrolledMembers.map(member => member.userId?._id || member.userId);
      const availableGuests = data.filter(guest => !enrolledUserIds.includes(guest._id));
      
      setGuests(availableGuests);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) {
      setError('Please select a guest to enroll');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await onSubmit(selectedGuest._id, initialPoints);
    
    if (result.success) {
      setSelectedGuest(null);
      setInitialPoints(0);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  const filteredGuests = guests.filter(guest => {
    const firstName = guest?.firstName || '';
    const lastName = guest?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = guest?.email || '';
    const search = searchTerm.toLowerCase();
    return fullName.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  const calculateTier = (points) => {
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    return 'Silver';
  };
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Enroll New Loyalty Member
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Search and select a guest to enroll in the loyalty program
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Step 1: Search and Select Guest */}
        {!selectedGuest && (
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search for Guest
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading guests...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {searchTerm ? 'No guests found matching your search.' : 'No guests available for enrollment.'}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredGuests.map((guest) => {
                  const fullName = guest?.firstName && guest?.lastName 
                    ? `${guest.firstName} ${guest.lastName}` 
                    : (guest?.name || 'N/A');
                  
                  return (
                  <div
                    key={guest._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fullName}</p>
                        <p className="text-sm text-gray-500">{guest?.email || 'N/A'}</p>
                        {guest?.phone && <p className="text-xs text-gray-400">{guest.phone}</p>}
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuest(guest);
                        }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                );
                })}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set Initial Points */}
        {selectedGuest && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Guest</h3>
              <p className="text-sm text-blue-700">
                <strong>Name:</strong> {selectedGuest?.firstName && selectedGuest?.lastName 
                  ? `${selectedGuest.firstName} ${selectedGuest.lastName}` 
                  : (selectedGuest?.name || 'N/A')}
              </p>
              <p className="text-sm text-blue-700"><strong>Email:</strong> {selectedGuest?.email || 'N/A'}</p>
              {selectedGuest?.phone && <p className="text-sm text-blue-700"><strong>Phone:</strong> {selectedGuest.phone}</p>}
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Change Guest
              </button>
            </div>

            <div>
              <label htmlFor="initialPoints" className="block text-sm font-medium text-gray-700">
                Initial Points
              </label>
              <input
                type="number"
                id="initialPoints"
                min="0"
                step="100"
                value={initialPoints}
                onChange={(e) => setInitialPoints(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Welcome bonus points (e.g., 500 for sign-up bonus)
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tier Preview</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  calculateTier(initialPoints) === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                  calculateTier(initialPoints) === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {calculateTier(initialPoints)}
                </span>
                <span className="text-sm text-gray-600">({initialPoints} points)</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                • Silver: 0-1,999 points<br />
                • Gold: 2,000-4,999 points<br />
                • Platinum: 5,000+ points
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Enrolling...' : 'Enroll Guest'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EnrollmentForm;
