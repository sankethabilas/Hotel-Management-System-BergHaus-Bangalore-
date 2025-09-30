import React, { useState } from 'react';
import { SearchIcon, FilterIcon } from 'lucide-react';
const feedbackData = [{
  id: 1,
  guest: 'John Smith',
  rating: 5,
  comment: 'Excellent service and beautiful rooms! The staff was very attentive and the amenities were top-notch. Will definitely return.',
  date: '2023-09-15',
  status: 'responded',
  response: "Thank you for your kind words! We're delighted to hear you enjoyed your stay with us and look forward to welcoming you back soon."
}, {
  id: 2,
  guest: 'Emma Johnson',
  rating: 4,
  comment: 'Great stay, but the breakfast could be improved. More variety would be nice.',
  date: '2023-09-14',
  status: 'pending'
}, {
  id: 3,
  guest: 'Michael Brown',
  rating: 5,
  comment: 'Absolutely loved the spa facilities! The massage was incredible and the pool area is beautiful.',
  date: '2023-09-13',
  status: 'responded',
  response: "Thank you for your feedback! We're glad you enjoyed our spa facilities and will pass your compliments to our spa team."
}, {
  id: 4,
  guest: 'Sarah Wilson',
  rating: 3,
  comment: 'Room was not as clean as expected. Found some dust on furniture and the bathroom could have been cleaner.',
  date: '2023-09-12',
  status: 'pending'
}, {
  id: 5,
  guest: 'David Thompson',
  rating: 4,
  comment: 'Comfortable bed and great location. The view from our room was spectacular!',
  date: '2023-09-11',
  status: 'responded',
  response: 'We appreciate your feedback and are happy to hear you enjoyed the comfort and views from your room!'
}, {
  id: 6,
  guest: 'Lisa Anderson',
  rating: 2,
  comment: 'Disappointed with the room service. Food was cold when it arrived and took over an hour to deliver.',
  date: '2023-09-10',
  status: 'pending'
}];
const FeedbackList = ({
  onViewFeedback
}) => {
  const [filter, setFilter] = useState('all'); // all, pending, responded
  const [searchTerm, setSearchTerm] = useState('');
  const filteredFeedback = feedbackData.filter(feedback => {
    if (filter === 'pending') return feedback.status === 'pending';
    if (filter === 'responded') return feedback.status === 'responded';
    return true;
  }).filter(feedback => feedback.guest.toLowerCase().includes(searchTerm.toLowerCase()) || feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()));
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
              <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Feedback</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
              </select>
            </div>
            <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold">
              <option>Sort by Latest</option>
              <option>Sort by Rating (High to Low)</option>
              <option>Sort by Rating (Low to High)</option>
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
            {filteredFeedback.map(feedback => <tr key={feedback.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {feedback.guest}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <svg key={i} className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {feedback.comment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {feedback.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${feedback.status === 'responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {feedback.status === 'responded' ? 'Responded' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onViewFeedback(feedback)} className="text-navy-blue hover:text-navy-blue-dark">
                    {feedback.status === 'pending' ? 'Respond' : 'View'}
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium">{filteredFeedback.length}</span> of{' '}
            <span className="font-medium">{feedbackData.length}</span> feedback
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
