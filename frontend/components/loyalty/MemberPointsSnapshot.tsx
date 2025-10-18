'use client';

import React, { useState, useEffect } from 'react';
import { User, Award, TrendingUp, TrendingDown, Calendar, History } from 'lucide-react';
import loyaltyService from '@/services/loyaltyService';

interface MemberPointsSnapshotProps {
  guestId: string | null;
}

const MemberPointsSnapshot: React.FC<MemberPointsSnapshotProps> = ({ guestId }) => {
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guestId) {
      fetchMemberData();
    } else {
      setMemberData(null);
    }
  }, [guestId]);

  const fetchMemberData = async () => {
    if (!guestId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await loyaltyService.getMemberTransactions(guestId, 5);
      setMemberData(data);
    } catch (err: any) {
      console.error('Error fetching member data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!guestId) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <User size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Select a member to view their points snapshot</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!memberData?.member) {
    return null;
  }

  const { member, transactions } = memberData;

  // Calculate totals from transactions
  const totalEarned = transactions
    .filter((t: any) => t.points > 0)
    .reduce((sum: number, t: any) => sum + t.points, 0);

  const totalRedeemed = transactions
    .filter((t: any) => t.points < 0)
    .reduce((sum: number, t: any) => sum + Math.abs(t.points), 0);

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Silver: 'bg-gray-100 text-gray-800 border-gray-300',
      Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Platinum: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTransactionIcon = (points: number) => {
    return points > 0 ? (
      <TrendingUp size={16} className="text-green-600" />
    ) : (
      <TrendingDown size={16} className="text-red-600" />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{member.guestName}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getTierColor(member.tier)}`}>
            {member.tier}
          </span>
        </div>
        <div className="text-blue-100 text-sm">Guest ID: {member.guestId}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{member.points?.toLocaleString()}</div>
          <div className="text-xs text-gray-600 mt-1">Current Balance</div>
        </div>
        <div className="text-center border-l border-r border-gray-300">
          <div className="text-2xl font-bold text-green-600">+{totalEarned?.toLocaleString()}</div>
          <div className="text-xs text-gray-600 mt-1">Total Earned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">-{totalRedeemed?.toLocaleString()}</div>
          <div className="text-xs text-gray-600 mt-1">Total Redeemed</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-gray-600" />
          <h4 className="font-semibold text-gray-900">Recent Transactions (Last 5)</h4>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((transaction: any, index: number) => (
              <div 
                key={transaction._id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getTransactionIcon(transaction.points)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Calendar size={12} />
                      {formatDate(transaction.createdAt)}
                      {transaction.performedBy && (
                        <span className="text-gray-400">
                          • by {transaction.performedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-sm font-bold ${
                    transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    → {transaction.balanceAfter?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Tier Progress (Optional Enhancement) */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Next Tier Progress</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            {member.tier === 'Silver' && (
              <div 
                className="h-full bg-gradient-to-r from-gray-400 to-yellow-400 transition-all duration-500"
                style={{ width: `${Math.min((member.points / 2000) * 100, 100)}%` }}
              ></div>
            )}
            {member.tier === 'Gold' && (
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-purple-400 transition-all duration-500"
                style={{ width: `${Math.min(((member.points - 2000) / 3000) * 100, 100)}%` }}
              ></div>
            )}
            {member.tier === 'Platinum' && (
              <div className="h-full bg-purple-500 w-full"></div>
            )}
          </div>
          <div className="text-xs font-medium text-gray-700">
            {member.tier === 'Silver' && `${Math.max(2000 - member.points, 0)} pts to Gold`}
            {member.tier === 'Gold' && `${Math.max(5000 - member.points, 0)} pts to Platinum`}
            {member.tier === 'Platinum' && '✨ Max Tier'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPointsSnapshot;
