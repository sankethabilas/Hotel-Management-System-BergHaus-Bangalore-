import React, { useState } from 'react';
import { SearchIcon } from 'lucide-react';

const PointsTracker = ({
  members = [],
  onUpdatePoints
}) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [transactionType, setTransactionType] = useState('earn');
  const [pointsAmount, setPointsAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !pointsAmount) {
      setError('Please select a member and enter points amount');
      return;
    }

    const member = members.find(m => m.guestId === selectedMember);
    if (!member) {
      setError('Selected member not found');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Calculate points change based on transaction type
    let pointsChange = parseInt(pointsAmount);
    if (transactionType === 'redeem' || transactionType === 'adjust-negative') {
      pointsChange = -pointsChange;
    }

    const result = await onUpdatePoints(selectedMember, pointsChange);
    
    if (result.success) {
      setSuccess(`Successfully updated points for ${member.guestName}`);
      setPointsAmount('');
      setDescription('');
      setSelectedMember('');
      setTransactionType('earn');
    } else {
      setError(result.error || 'Failed to update points');
    }
    
    setSubmitting(false);
  };

  const selectedMemberData = members.find(m => m.guestId === selectedMember);
  
  const calculateNewTier = (currentPoints, change) => {
    const newPoints = Math.max(0, currentPoints + change);
    if (newPoints >= 5000) return 'Platinum';
    if (newPoints >= 2000) return 'Gold';
    return 'Silver';
  };
  return (
    <div className="space-y-6">
      {/* Form to add points */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Update Member Points
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="guest" className="block text-sm font-medium text-gray-700 mb-1">
                Select Member *
              </label>
              <select 
                id="guest" 
                name="guest" 
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                required
                disabled={submitting}
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member._id} value={member.guestId}>
                    {member.guestName} ({member.tier} - {member.points} pts)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type *
              </label>
              <select 
                id="transactionType" 
                name="transactionType" 
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={submitting}
              >
                <option value="earn">Earn Points (+)</option>
                <option value="redeem">Redeem Points (-)</option>
                <option value="adjust-positive">Adjustment (+)</option>
                <option value="adjust-negative">Adjustment (-)</option>
              </select>
            </div>
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                Points Amount *
              </label>
              <input 
                type="number" 
                name="points" 
                id="points" 
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="Enter amount" 
                min="1" 
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input 
              type="text" 
              name="description" 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              placeholder="E.g., Room booking, Restaurant spending, etc."
              disabled={submitting}
            />
          </div>

          {/* Preview of changes */}
          {selectedMemberData && pointsAmount && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Transaction Preview</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Member:</strong> {selectedMemberData.guestName}</p>
                <p><strong>Current Points:</strong> {selectedMemberData.points}</p>
                <p><strong>Current Tier:</strong> {selectedMemberData.tier}</p>
                <p><strong>Points Change:</strong> {transactionType === 'redeem' || transactionType === 'adjust-negative' ? '-' : '+'}{pointsAmount}</p>
                <p><strong>New Points:</strong> {Math.max(0, selectedMemberData.points + (transactionType === 'redeem' || transactionType === 'adjust-negative' ? -parseInt(pointsAmount) : parseInt(pointsAmount)))}</p>
                <p><strong>New Tier:</strong> {calculateNewTier(selectedMemberData.points, transactionType === 'redeem' || transactionType === 'adjust-negative' ? -parseInt(pointsAmount) : parseInt(pointsAmount))}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => {
                setSelectedMember('');
                setPointsAmount('');
                setDescription('');
                setError(null);
                setSuccess(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Clear
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || !selectedMember || !pointsAmount}
            >
              {submitting ? 'Processing...' : 'Update Points'}
            </button>
          </div>
        </form>
      </div>

      {/* Note about transaction history */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Transaction history tracking will be added in a future update. Currently, you can update points, and the system will automatically adjust member tiers based on their point balance.
        </p>
      </div>
    </div>
  );
};

export default PointsTracker;
