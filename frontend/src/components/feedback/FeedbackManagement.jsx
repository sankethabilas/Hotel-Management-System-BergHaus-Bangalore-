import React, { useState, useEffect } from 'react';
import FeedbackList from './FeedbackList';
import FeedbackForm from './FeedbackForm';
import FeedbackResponse from './FeedbackResponse';
import { feedbackService } from '../../services/feedbackService';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [view, setView] = useState('list'); // list, form, response
  const [responseMode, setResponseMode] = useState('view'); // view, respond, edit

  // Fetch all feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (feedbackData) => {
    try {
      setLoading(true);
      setError(null);
      await feedbackService.createFeedback(feedbackData);
      await fetchFeedbacks(); // Refresh the list
      setView('list');
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error creating feedback:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async (id, feedbackData) => {
    try {
      setLoading(true);
      setError(null);
      await feedbackService.updateFeedback(id, feedbackData);
      await fetchFeedbacks(); // Refresh the list
      setView('list');
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error updating feedback:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await feedbackService.deleteFeedback(id);
      await fetchFeedbacks(); // Refresh the list
    } catch (err) {
      setError(err.message);
      console.error('Error deleting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToFeedback = async (id, responseData) => {
    try {
      setLoading(true);
      setError(null);
      // Wrap responseData in an object if it's a string
      const payload = typeof responseData === 'string' 
        ? { response: responseData } 
        : responseData;
      await feedbackService.respondToFeedback(id, payload);
      await fetchFeedbacks(); // Refresh the list
      setView('list');
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error responding to feedback:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {view === 'list' && (
        <FeedbackList 
          feedbacks={feedbacks}
          loading={loading}
          onViewFeedback={(feedback, mode) => {
            setSelectedFeedback(feedback);
            setResponseMode(mode);
            setView('response');
          }}
          onDeleteFeedback={handleDeleteFeedback}
        />
      )}
      
      {view === 'form' && (
        <FeedbackForm 
          onSubmit={handleCreateFeedback} 
          onCancel={() => setView('list')}
          loading={loading}
        />
      )}
      
      {view === 'response' && selectedFeedback && (
        <FeedbackResponse 
          feedback={selectedFeedback} 
          mode={responseMode}
          onSubmit={handleRespondToFeedback} 
          onCancel={() => setView('list')}
          loading={loading}
        />
      )}
    </div>;
};
export default FeedbackManagement;
