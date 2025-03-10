const express = require('express');
const {
    createShipment,
    getShipments,
    getShipment,
    trackShipment
} = require('../controllers/shipmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createShipment);
router.get('/', protect, getShipments);
router.get('/track/:trackingId', trackShipment);
router.get('/:id', protect, getShipment);

module.exports = router;

