import React, { useState } from 'react';
import { SearchIcon, FilterIcon, TrashIcon } from 'lucide-react';

const FeedbackList = ({
  feedbacks = [],
  loading = false,
  onViewFeedback,
  onDeleteFeedback
}) => {
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, responded
  const [filterRating, setFilterRating] = useState('all'); // all, 1, 2, 3, 4, 5
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, rating-desc, rating-asc
  const [searchTerm, setSearchTerm] = useState('');
  
  let filteredFeedback = feedbacks.filter(feedback => {
    // Status filter
    if (filterStatus === 'pending' && feedback.status !== 'pending') return false;
    if (filterStatus === 'responded' && feedback.status !== 'responded') return false;
    
    // Rating filter
    if (filterRating !== 'all' && feedback.rating !== parseInt(filterRating)) return false;
    
    // Search filter
    const guestName = feedback.guestName || '';
    const comment = feedback.comment || '';
    const search = searchTerm.toLowerCase();
    if (searchTerm && !guestName.toLowerCase().includes(search) && !comment.toLowerCase().includes(search)) {
      return false;
    }
    
    return true;
  });

  // Apply sorting
  filteredFeedback = [...filteredFeedback].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'date-asc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'rating-desc') {
      return b.rating - a.rating;
    } else if (sortBy === 'rating-asc') {
      return a.rating - b.rating;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  return <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm" placeholder="Search feedback" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
              </select>
            </div>
            <div className="flex items-center">
              <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filterRating} onChange={e => setFilterRating(e.target.value)}>
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-blue"></div>
                    <span className="ml-3">Loading feedback...</span>
                  </div>
                </td>
              </tr>
            ) : filteredFeedback.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                  No feedback found. {searchTerm && 'Try adjusting your search.'}
                </td>
              </tr>
            ) : (
              filteredFeedback.map(feedback => (
                <tr key={feedback._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {feedback.guestName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {feedback.comment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(feedback.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${feedback.status === 'responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {feedback.status === 'responded' ? 'Responded' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => onViewFeedback(feedback, 'view')} 
                        className="text-blue-600 hover:text-blue-800"
                        title="View feedback"
                      >
                        View
                      </button>
                      {feedback.status === 'pending' ? (
                        <button 
                          onClick={() => onViewFeedback(feedback, 'respond')} 
                          className="text-green-600 hover:text-green-800"
                          title="Respond to feedback"
                        >
                          Respond
                        </button>
                      ) : (
                        <button 
                          onClick={() => onViewFeedback(feedback, 'edit')} 
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Edit response"
                        >
                          Edit
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteFeedback(feedback._id)} 
                        className="text-red-600 hover:text-red-800"
                        title="Delete feedback"
                      >
                        <TrashIcon className="h-4 w-4 inline" />
                      </button>
                    </div>
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
            <span className="font-medium">{filteredFeedback.length}</span> of{' '}
            <span className="font-medium">{feedbacks.length}</span> feedback
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
    </div>;
};
export default FeedbackList;
