import { Router } from 'express'
import { createOffer, getAllOffers, assignOfferToGuest } from '../controllers/offerController.js'

const router = Router()

router.post('/', createOffer)
router.get('/', getAllOffers)
router.post('/assign', assignOfferToGuest)

export default router


