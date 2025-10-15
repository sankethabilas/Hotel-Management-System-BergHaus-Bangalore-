'use client';

import React, { useState, useEffect } from 'react';
import FeedbackList from '@/components/feedback/FeedbackList';
import FeedbackResponse from '@/components/feedback/FeedbackResponse';
import feedbackService from '@/services/feedbackService';

interface Feedback {
  _id: string;
  guestName: string;
  email: string;
  rating: number;
  comments: string;
  category: string;
  status: string;
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [view, setView] = useState<'list' | 'response'>('list');
  const [responseMode, setResponseMode] = useState<'view' | 'respond' | 'edit'>('view');

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
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await feedbackService.deleteFeedback(id);
      await fetchFeedbacks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToFeedback = async (id: string, responseData: string | { response: string }) => {
    try {
      setLoading(true);
      setError(null);
      // Wrap responseData in an object if it's a string
      const payload = typeof responseData === 'string' 
        ? { response: responseData } 
        : responseData;
      await feedbackService.addResponse(id, payload);
      await fetchFeedbacks(); // Refresh the list
      setView('list');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error responding to feedback:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Feedback Management
        </h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm">
          <p className="text-xs">
            📝 Guests can submit feedback via the <a href="/contact" className="underline font-semibold">Contact Page</a>
          </p>
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
      
      {view === 'response' && selectedFeedback && (
        <FeedbackResponse 
          feedback={selectedFeedback} 
          mode={responseMode}
          onSubmit={handleRespondToFeedback} 
          onCancel={() => setView('list')}
          loading={loading}
        />
      )}
    </div>
  );
};

export default FeedbackManagement;
