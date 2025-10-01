import React, { useState } from 'react';
import FeedbackList from './FeedbackList';
import FeedbackForm from './FeedbackForm';
import FeedbackResponse from './FeedbackResponse';
const FeedbackManagement = () => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [view, setView] = useState('list'); // list, form, response
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Feedback Management
        </h1>
        <div className="flex space-x-3">
          <button onClick={() => {
          setView('form');
          setSelectedFeedback(null);
        }} className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
            Add New Feedback
          </button>
        </div>
      </div>
      {view === 'list' && <FeedbackList onViewFeedback={feedback => {
      setSelectedFeedback(feedback);
      setView('response');
    }} />}
      {view === 'form' && <FeedbackForm onSubmit={() => setView('list')} onCancel={() => setView('list')} />}
      {view === 'response' && selectedFeedback && <FeedbackResponse feedback={selectedFeedback} onSubmit={() => setView('list')} onCancel={() => setView('list')} />}
    </div>;
};
export default FeedbackManagement;
