import React, { useState } from 'react';
const FeedbackForm = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    guest: '',
    email: '',
    rating: 5,
    comment: '',
    stayDate: '',
    roomNumber: ''
  });
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
  const handleSubmit = e => {
    e.preventDefault();
    console.log('Feedback submitted:', formData);
    onSubmit();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="guest" className="block text-sm font-medium text-gray-700">
              Guest Name
            </label>
            <input type="text" name="guest" id="guest" value={formData.guest} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="stayDate" className="block text-sm font-medium text-gray-700">
              Stay Date
            </label>
            <input type="date" name="stayDate" id="stayDate" value={formData.stayDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
              Room Number
            </label>
            <input type="text" name="roomNumber" id="roomNumber" value={formData.roomNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
              Rating
            </label>
            <div className="mt-1 flex items-center">
              {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setFormData(prev => ({
              ...prev,
              rating}))} className="focus:outline-none">
                  <svg className={`h-8 w-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>)}
              <span className="ml-2 text-sm text-gray-500">
                {formData.rating === 1 ? 'Poor' : formData.rating === 2 ? 'Fair' : formData.rating === 3 ? 'Good' : formData.rating === 4 ? 'Very Good' : 'Excellent'}
              </span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea name="comment" id="comment" rows={4} value={formData.comment} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Submit Feedback
          </button>
        </div>
      </form>
    </div>;
};
export default FeedbackForm;
