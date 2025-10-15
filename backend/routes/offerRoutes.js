const express = require('express');
const router = express.Router();
const {
  createOffer,
  getAllOffers,
  updateOffer,
  deleteOffer,
  assignOfferToGuest
} = require('../controllers/offerController');

// Offer routes
router.post('/', createOffer);
router.get('/', getAllOffers);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);
router.post('/assign', assignOfferToGuest);

module.exports = router;
