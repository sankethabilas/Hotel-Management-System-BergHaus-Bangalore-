import React, { useState } from 'react';

const FeedbackResponse = ({
  feedback,
  mode = 'view', // 'view', 'respond', 'edit'
  onSubmit,
  onCancel
}) => {
  const [response, setResponse] = useState(feedback.managerResponse || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(mode === 'respond' || mode === 'edit');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(feedback._id, response);
    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTitle = () => {
    if (mode === 'respond') return 'Respond to Feedback';
    if (mode === 'edit') return 'Edit Response';
    return 'View Feedback';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {getTitle()}
        </h2>
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {feedback.guestName}
              </h3>
              <p className="text-xs text-gray-500">{feedback.email}</p>
            </div>
            <span className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</span>
          </div>
          
          <div className="mt-2 flex items-center space-x-2">
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
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {feedback.category}
            </span>
          </div>
          
          <p className="mt-3 text-sm text-gray-700">{feedback.comment}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700">
              Admin Response {(mode === 'respond' || mode === 'edit') && '*'}
            </label>
            <textarea 
              name="response" 
              id="response" 
              rows={4} 
              value={response} 
              onChange={(e) => setResponse(e.target.value)} 
              disabled={mode === 'view' || submitting} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
              required={mode === 'respond' || mode === 'edit'}
              placeholder={mode === 'view' ? 'No response yet' : 'Type your response here...'}
            />
            {feedback.status === 'responded' && feedback.responseDate && (
              <p className="mt-1 text-xs text-gray-500">
                {mode === 'view' ? 'Responded' : 'Last responded'} on {formatDate(feedback.responseDate)}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Back to List
            </button>
            {(mode === 'respond' || mode === 'edit') && (
              <button 
                type="submit" 
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || !response.trim()}
              >
                {submitting ? 'Submitting...' : mode === 'edit' ? 'Update Response' : 'Submit Response'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default FeedbackResponse;
