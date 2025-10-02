import { Router } from 'express';
import { 
  getAllBookings, 
  getBookingById, 
  getGuestBookings 
} from '../controllers/bookingController.js';

const router = Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.get('/guest/:guestId', getGuestBookings);

export default router;
