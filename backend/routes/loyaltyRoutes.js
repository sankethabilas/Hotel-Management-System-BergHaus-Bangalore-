import { Router } from 'express'
import { enrollGuest, getLoyaltyDetails, addPoints } from '../controllers/loyaltyController.js'

const router = Router()

router.post('/', enrollGuest)
router.get('/', getLoyaltyDetails)
router.put('/', addPoints)

export default router


