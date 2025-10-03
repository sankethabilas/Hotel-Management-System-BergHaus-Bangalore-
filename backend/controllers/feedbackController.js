import { Feedback } from '../models/feedbackModel.js';
import { 
  createFeedbackSubmittedNotification, 
  createLowRatingNotification 
} from '../services/notificationService.js';

export async function createFeedback(req, res) {
  const { guestId, guestName, email, comment, rating, date, category } = req.body || {}
  if (!guestName || !email || !comment || !rating) {
    return res.status(400).json({ message: 'guestName, email, comment, rating are required' })
  }
  const created = await Feedback.create({ 
    guestId, // Optional - can be null for anonymous feedback
    guestName, 
    email, 
    comment, 
    rating, 
    date,
    category: category || 'Other'
  })

  // Create notification for new feedback
  await createFeedbackSubmittedNotification(created);

  // Create additional notification if rating is low (1-2 stars)
  if (created.rating <= 2) {
    await createLowRatingNotification(created);
  }

  res.status(201).json(created)
}

export async function getAllFeedback(req, res) {
  const items = await Feedback.find().sort({ createdAt: -1 })
  res.json(items)
}

export async function addResponse(req, res) {
  const { id } = req.params
  const { response } = req.body || {}
  if (!response) {
    return res.status(400).json({ message: 'response is required' })
  }
  const updated = await Feedback.findByIdAndUpdate(
    id,
    { 
      managerResponse: response,
      responseDate: new Date()
    },
    { new: true }
  )
  if (!updated) {
    return res.status(404).json({ message: 'Feedback not found' })
  }
  res.json(updated)
}

export async function deleteFeedback(req, res) {
  const { id } = req.params
  
  try {
    const deleted = await Feedback.findByIdAndDelete(id)
    
    if (!deleted) {
      return res.status(404).json({ message: 'Feedback not found' })
    }
    
    res.json({ 
      message: 'Feedback deleted successfully',
      deletedFeedback: deleted
    })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    res.status(500).json({ 
      message: 'Failed to delete feedback',
      error: error.message 
    })
  }
}


