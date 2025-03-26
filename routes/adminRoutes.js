const express = require('express');
const {
    getAllShipments,
    updateShipmentStatus,
    updatePaymentStatus,
    createAdmin,
    updateAmount, deleteShipment, getAllUsers
} = require('../controllers/adminController');
const {protect, isAdmin} = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
router.use(isAdmin);

router.get('/shipments', getAllShipments);
router.get('/users', getAllUsers);
router.delete('/shipments/:id', deleteShipment);
router.put('/shipments/:id/status', updateShipmentStatus);
router.put('/shipments/:id/payment', updatePaymentStatus);
router.put('/shipments/:id/amount', updateAmount);
router.post('/create', createAdmin);

module.exports = router;