'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Award, Activity } from 'lucide-react';
import loyaltyService from '@/services/loyaltyService';

interface PointsStatsProps {
  refreshTrigger?: number;
}

const PointsStats: React.FC<PointsStatsProps> = ({ refreshTrigger = 0 }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await loyaltyService.getPointsStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
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

  const overview = stats?.overview || {};

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Points Issued */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-green-700">Total Points Issued</div>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {overview.totalPointsIssued?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-green-600 mt-1">All-time earnings</div>
        </div>

        {/* Total Points Redeemed */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-md border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-red-700">Points Redeemed</div>
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-red-900">
            {overview.totalPointsRedeemed?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-red-600 mt-1">Total redemptions</div>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-blue-700">Points Balance</div>
            <Award className="text-blue-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {overview.currentBalance?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-blue-600 mt-1">Pending redemption</div>
        </div>

        {/* Average per Member */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-purple-700">Avg per Member</div>
            <Users className="text-purple-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {overview.avgPointsPerMember?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {overview.totalMembers || 0} total members
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-md border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-orange-700">Recent Activity</div>
            <Activity className="text-orange-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {overview.recentTransactions7Days || 0}
          </div>
          <div className="text-xs text-orange-600 mt-1">Last 7 days</div>
        </div>
      </div>

      {/* Most Active Members */}
      {stats?.mostActiveMembers && stats.mostActiveMembers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Most Active Members</h3>
          <div className="space-y-3">
            {stats.mostActiveMembers.map((member: any, index: number) => (
              <div 
                key={member.guestId || index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.guestName}</div>
                    <div className="text-sm text-gray-600">
                      {member.tier} • {member.currentPoints?.toLocaleString()} pts
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {member.transactionCount} transactions
                  </div>
                  <div className="text-xs text-gray-600">
                    ↑ {member.totalEarned?.toLocaleString()} • ↓ {member.totalRedeemed?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points by Tier */}
      {stats?.pointsByTier && stats.pointsByTier.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Points Distribution by Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.pointsByTier.map((tier: any) => (
              <div 
                key={tier._id} 
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
              >
                <div className="text-lg font-bold text-gray-900 mb-1">{tier._id}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">{tier.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Points:</span>
                    <span className="font-medium">{tier.totalPoints?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Points:</span>
                    <span className="font-medium">{Math.round(tier.avgPoints)?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsStats;
