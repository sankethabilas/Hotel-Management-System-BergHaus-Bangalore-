import { Router } from 'express';
import { getAllGuestsHistory, getGuestHistory } from '../controllers/guestHistoryController.js';

const router = Router();

router.get('/', getAllGuestsHistory);
router.get('/:guestId', getGuestHistory);

export default router;
