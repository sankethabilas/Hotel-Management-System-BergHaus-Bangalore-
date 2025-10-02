import React, { useState } from 'react';
import { Send } from 'lucide-react';

const FeedbackForm = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    rating: 5,
    comment: '',
    category: 'Service'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          guestName: '',
          email: '',
          rating: 5,
          comment: '',
          category: 'Service'
        });
        // Close form after short delay
        setTimeout(() => {
          onCancel();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Add New Feedback
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Submit feedback on behalf of a guest
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <p className="text-sm">Feedback submitted successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
              Guest Name *
            </label>
            <input 
              type="text" 
              name="guestName" 
              id="guestName" 
              value={formData.guestName} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" 
              required 
              minLength={2}
              maxLength={100}
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" 
              required 
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select 
              name="category" 
              id="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
              required
              disabled={submitting}
            >
              <option value="Service">Service</option>
              <option value="Room">Room</option>
              <option value="Food">Food</option>
              <option value="Facilities">Facilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
              Rating *
            </label>
            <div className="mt-1 flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    rating: star
                  }))} 
                  className="focus:outline-none"
                  disabled={submitting}
                >
                  <svg className={`h-8 w-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {formData.rating === 1 ? 'Poor' : formData.rating === 2 ? 'Fair' : formData.rating === 3 ? 'Good' : formData.rating === 4 ? 'Very Good' : 'Excellent'}
              </span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comments *
            </label>
            <textarea
              id="comment"
              name="comment"
              rows="4"
              value={formData.comment}
              onChange={handleChange}
              required
              maxLength={2000}
              disabled={submitting}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Please share your experience with us..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.comment.length}/2000 characters
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>;
};
export default FeedbackForm;
