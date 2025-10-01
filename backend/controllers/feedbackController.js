import { Feedback } from '../models/feedbackModel.js'

export async function createFeedback(req, res) {
  const { guestName, email, comment, rating, date } = req.body || {}
  if (!guestName || !email || !comment || !rating) {
    return res.status(400).json({ message: 'guestName, email, comment, rating are required' })
  }
  const created = await Feedback.create({ guestName, email, comment, rating, date })
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
    { managerResponse: response },
    { new: true }
  )
  if (!updated) {
    return res.status(404).json({ message: 'Feedback not found' })
  }
  res.json(updated)
}


