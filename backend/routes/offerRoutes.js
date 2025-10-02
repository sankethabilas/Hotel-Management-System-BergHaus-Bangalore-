import { Router } from 'express'
import { 
  createOffer, 
  getAllOffers, 
  getOfferById,
  updateOffer,
  deleteOffer,
  assignOfferToGuest 
} from '../controllers/offerController.js'

const router = Router()

router.post('/', createOffer)
router.get('/', getAllOffers)
router.post('/assign', assignOfferToGuest) // Must come before /:id routes
router.get('/:id', getOfferById)
router.put('/:id', updateOffer)
router.delete('/:id', deleteOffer)

export default router


