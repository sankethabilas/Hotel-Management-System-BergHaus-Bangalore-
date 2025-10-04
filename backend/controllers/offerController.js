import { Offer } from '../models/offerModel.js'
import { Loyalty } from '../models/loyaltyModel.js'

export async function createOffer(req, res) {
  try {
    const { 
      title, 
      description, 
      discountType, 
      discountValue, 
      validFrom, 
      validUntil,
      minStay,
      maxStay,
      applicableDays,
      applicableRooms,
      termsConditions,
      status
    } = req.body || {}
    
    // Validation
    if (!title || !description || !discountType || !validFrom || !validUntil) {
      return res.status(400).json({ 
        message: 'title, description, discountType, validFrom, and validUntil are required' 
      })
    }

    // Validate discountValue for percentage and fixed types
    if (discountType !== 'special' && (typeof discountValue !== 'number' || discountValue <= 0)) {
      return res.status(400).json({ 
        message: 'discountValue must be a positive number for percentage and fixed discount types' 
      })
    }

    // Validate percentage is between 0-100
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ 
        message: 'discountValue must be between 0 and 100 for percentage type' 
      })
    }

    // Create offer
    const offerData = {
      title,
      description,
      discountType,
      validFrom,
      validUntil,
      status: status || 'active'
    }

    // Add optional fields
    if (discountType !== 'special') offerData.discountValue = discountValue
    if (minStay) offerData.minStay = minStay
    if (maxStay) offerData.maxStay = maxStay
    if (applicableDays && applicableDays.length > 0) offerData.applicableDays = applicableDays
    if (applicableRooms && applicableRooms.length > 0) offerData.applicableRooms = applicableRooms
    if (termsConditions) offerData.termsConditions = termsConditions

    const created = await Offer.create(offerData)
    res.status(201).json(created)
  } catch (error) {
    res.status(500).json({ message: 'Error creating offer', error: error.message })
  }
}

export async function getAllOffers(req, res) {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 })
    res.json(offers)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error: error.message })
  }
}

export async function getOfferById(req, res) {
  try {
    const offer = await Offer.findById(req.params.id)
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' })
    }
    res.json(offer)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offer', error: error.message })
  }
}

export async function updateOffer(req, res) {
  try {
    const { 
      title, 
      description, 
      discountType, 
      discountValue, 
      validFrom, 
      validUntil,
      minStay,
      maxStay,
      applicableDays,
      applicableRooms,
      termsConditions,
      status
    } = req.body || {}
    
    // Validation
    if (!title || !description || !discountType || !validFrom || !validUntil) {
      return res.status(400).json({ 
        message: 'title, description, discountType, validFrom, and validUntil are required' 
      })
    }

    // Validate discountValue for percentage and fixed types
    if (discountType !== 'special' && (typeof discountValue !== 'number' || discountValue <= 0)) {
      return res.status(400).json({ 
        message: 'discountValue must be a positive number for percentage and fixed discount types' 
      })
    }

    // Validate percentage is between 0-100
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ 
        message: 'discountValue must be between 0 and 100 for percentage type' 
      })
    }

    // Update offer
    const offerData = {
      title,
      description,
      discountType,
      validFrom,
      validUntil,
      status: status || 'active'
    }

    // Add optional fields
    if (discountType !== 'special') offerData.discountValue = discountValue
    if (minStay) offerData.minStay = minStay
    if (maxStay) offerData.maxStay = maxStay
    if (applicableDays && applicableDays.length > 0) offerData.applicableDays = applicableDays
    if (applicableRooms && applicableRooms.length > 0) offerData.applicableRooms = applicableRooms
    if (termsConditions) offerData.termsConditions = termsConditions

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      offerData,
      { new: true, runValidators: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Offer not found' })
    }

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer', error: error.message })
  }
}

export async function deleteOffer(req, res) {
  try {
    console.log('DELETE request for offer ID:', req.params.id)
    const deleted = await Offer.findByIdAndDelete(req.params.id)
    if (!deleted) {
      console.log('Offer not found with ID:', req.params.id)
      return res.status(404).json({ message: 'Offer not found' })
    }
    console.log('Offer deleted successfully:', deleted._id)
    res.json({ message: 'Offer deleted successfully', offer: deleted })
  } catch (error) {
    console.error('Error deleting offer:', error)
    res.status(500).json({ message: 'Error deleting offer', error: error.message })
  }
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

export async function unassignOfferFromGuest(req, res) {
  try {
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
    
    // Remove the offer from assignedOffers array
    loyalty.assignedOffers = (loyalty.assignedOffers || []).filter(
      id => String(id) !== String(offerId)
    )
    
    const saved = await loyalty.save()
    res.json(saved)
  } catch (error) {
    console.error('Error unassigning offer:', error)
    res.status(500).json({ message: 'Error unassigning offer', error: error.message })
  }
}


