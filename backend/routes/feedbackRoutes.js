import { Router } from 'express'
import { createFeedback, getAllFeedback, addResponse } from '../controllers/feedbackController.js'

const router = Router()

router.get('/', getAllFeedback)
router.post('/', createFeedback)
router.put('/:id/response', addResponse)
router.post('/:id/response', addResponse)

export default router


