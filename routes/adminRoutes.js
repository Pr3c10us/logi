const express = require('express');
const {
    getAllShipments,
    updateShipmentStatus,
    updatePaymentStatus,
    createAdmin
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
router.use(isAdmin);

router.get('/shipments', getAllShipments);
router.put('/shipments/:id/status', updateShipmentStatus);
router.put('/shipments/:id/payment', updatePaymentStatus);
router.post('/create', createAdmin);

module.exports = router;