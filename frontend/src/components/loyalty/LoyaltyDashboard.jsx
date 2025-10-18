import React, { useState } from 'react';
import { SearchIcon, FilterIcon, TrashIcon } from 'lucide-react';

const LoyaltyDashboard = ({
  members = [],
  loading = false,
  onEnrollNew,
  onDeleteMember
}) => {
  const [filter, setFilter] = useState('all'); // all, platinum, gold, silver, inactive
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member => {
    if (filter === 'inactive') return member.status === 'inactive';
    if (filter === 'platinum') return member.tier === 'Platinum' && member.status === 'active';
    if (filter === 'gold') return member.tier === 'Gold' && member.status === 'active';
    if (filter === 'silver') return member.tier === 'Silver' && member.status === 'active';
    if (filter === 'active') return member.status === 'active';
    return true;
  }).filter(member => {
    const name = member.guestName || '';
    const email = member.email || '';
    const search = searchTerm.toLowerCase();
    return name.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const activeMembers = members.filter(m => m?.status === 'active');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newMembers = members.filter(m => m?.enrolledDate && new Date(m.enrolledDate) >= thirtyDaysAgo);
  
  return <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {members.length}
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active</span>
              <span className="font-medium text-gray-900">
                {activeMembers.length}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Tier Distribution</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-600">Platinum</span>
              <span className="font-medium text-gray-900">
                {members.filter(m => m?.tier === 'Platinum').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">Gold</span>
              <span className="font-medium text-gray-900">
                {members.filter(m => m?.tier === 'Gold').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Silver</span>
              <span className="font-medium text-gray-900">
                {members.filter(m => m?.tier === 'Silver').length}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Average Points</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {members.length > 0 
              ? Math.round(members.reduce((sum, member) => sum + (member?.points || 0), 0) / members.length).toLocaleString()
              : '0'
            }
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gold h-2.5 rounded-full" style={{
                width: members.length > 0 ? `${Math.min((members.reduce((sum, m) => sum + (m?.points || 0), 0) / members.length / 10000) * 100, 100)}%` : '0%'
              }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">
            New Members (30 days)
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{newMembers.length}</p>
          <p className="mt-2 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>Recent enrollments</span>
          </p>
        </div>
      </div>
      {/* Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm" placeholder="Search members" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All Members</option>
                  <option value="active">Active Members</option>
                  <option value="inactive">Inactive Members</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </div>
              <button onClick={onEnrollNew} className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
                Enroll New
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Loading members...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    No members found. {searchTerm && 'Try adjusting your search.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {member?.guestName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member?.guestName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member?.enrolledDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member?.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' : 
                        member?.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member?.tier || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(member?.points || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {member?.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => onDeleteMember(member?.guestId)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete member"
                      >
                        <TrashIcon className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium">{filteredMembers.length}</span> of{' '}
              <span className="font-medium">{members.length}</span>{' '}
              members
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>;
};
export default LoyaltyDashboard;
