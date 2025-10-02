import { Router } from 'express';
import { enrollGuest, getLoyaltyDetails, addPoints, getAllMembers, deleteMember } from '../controllers/loyaltyController.js';

const router = Router();

router.get('/all', getAllMembers);
router.get('/', getLoyaltyDetails);
router.post('/', enrollGuest);
router.put('/', addPoints);
router.delete('/:guestId', deleteMember);

export default router;


