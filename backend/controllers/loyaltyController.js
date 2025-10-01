import { Loyalty } from '../models/loyaltyModel.js'

export async function enrollGuest(req, res) {
  const { guestId, points = 0, tier = 'Silver', enrolledDate } = req.body || {}
  if (!guestId) {
    return res.status(400).json({ message: 'guestId is required' })
  }
  const existing = await Loyalty.findOne({ guestId })
  if (existing) {
    return res.status(409).json({ message: 'Guest already enrolled', loyalty: existing })
  }
  const created = await Loyalty.create({ guestId, points, tier, enrolledDate })
  res.status(201).json(created)
}

export async function getLoyaltyDetails(req, res) {
  const { guestId } = req.query
  if (!guestId) {
    return res.status(400).json({ message: 'guestId query param is required' })
  }
  const loyalty = await Loyalty.findOne({ guestId }).populate('assignedOffers')
  if (!loyalty) {
    return res.status(404).json({ message: 'Loyalty record not found' })
  }
  res.json(loyalty)
}

export async function addPoints(req, res) {
  const { guestId, points } = req.body || {}
  if (!guestId || typeof points !== 'number') {
    return res.status(400).json({ message: 'guestId and numeric points are required' })
  }
  const loyalty = await Loyalty.findOne({ guestId })
  if (!loyalty) {
    return res.status(404).json({ message: 'Loyalty record not found' })
  }
  loyalty.points = Math.max(0, loyalty.points + points)
  // Optional simple tier logic
  if (loyalty.points >= 5000) loyalty.tier = 'Platinum'
  else if (loyalty.points >= 2000) loyalty.tier = 'Gold'
  else loyalty.tier = 'Silver'
  const saved = await loyalty.save()
  res.json(saved)
}


