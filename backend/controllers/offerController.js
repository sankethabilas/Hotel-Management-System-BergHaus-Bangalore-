import { Offer } from '../models/offerModel.js'
import { Loyalty } from '../models/loyaltyModel.js'

export async function createOffer(req, res) {
  const { title, description, discountPercentage, validUntil } = req.body || {}
  if (!title || !description || typeof discountPercentage !== 'number' || !validUntil) {
    return res.status(400).json({ message: 'title, description, discountPercentage, validUntil are required' })
  }
  const created = await Offer.create({ title, description, discountPercentage, validUntil })
  res.status(201).json(created)
}

export async function getAllOffers(req, res) {
  const offers = await Offer.find().sort({ createdAt: -1 })
  res.json(offers)
}

export async function assignOfferToGuest(req, res) {
  const { guestId, offerId } = req.body || {}
  if (!guestId || !offerId) {
    return res.status(400).json({ message: 'guestId and offerId are required' })
  }
  const offer = await Offer.findById(offerId)
  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' })
  }
  const loyalty = await Loyalty.findOne({ guestId })
  if (!loyalty) {
    return res.status(404).json({ message: 'Loyalty record not found' })
  }
  const assigned = new Set((loyalty.assignedOffers || []).map(id => String(id)))
  assigned.add(String(offer._id))
  loyalty.assignedOffers = Array.from(assigned)
  const saved = await loyalty.save()
  res.json(saved)
}


