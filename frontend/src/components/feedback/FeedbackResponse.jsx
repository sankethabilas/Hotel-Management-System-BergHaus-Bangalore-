import React, { useState } from 'react';
const FeedbackResponse = ({
  feedback,
  onSubmit,
  onCancel
}) => {
  const [response, setResponse] = useState(feedback.response || '');
  const handleSubmit = e => {
    e.preventDefault();
    console.log('Response submitted:', {
      feedbackId: feedback.id,
      response
    });
    onSubmit();
  };
  return <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {feedback.status === 'pending' ? 'Respond to Feedback' : 'View Feedback'}
        </h2>
      </div>
      <div className="p-6">
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {feedback.guest}
            </h3>
            <span className="text-sm text-gray-500">{feedback.date}</span>
          </div>
          <div className="mt-1 flex items-center">
            {[...Array(5)].map((_, i) => <svg key={i} className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>)}
          </div>
          <p className="mt-2 text-sm text-gray-700">{feedback.comment}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700">
              Your Response
            </label>
            <textarea name="response" id="response" rows={4} value={response} onChange={e => setResponse(e.target.value)} disabled={feedback.status === 'responded'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required={feedback.status === 'pending'} />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
              Back to List
            </button>
            {feedback.status === 'pending' && <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
                Submit Response
              </button>}
          </div>
        </form>
      </div>
    </div>;
};
export default FeedbackResponse;
