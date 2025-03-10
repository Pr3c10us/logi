const Shipment = require('../models/Shipment');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Create new shipment
// @route     POST /api/shipments
// @access    Private
exports.createShipment = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        const shipment = await Shipment.create(req.body);

        res.status(201).json({
            success: true,
            data: shipment
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get all shipments for logged in user
// @route     GET /api/shipments
// @access    Private
exports.getShipments = async (req, res, next) => {
    try {
        const shipments = await Shipment.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            count: shipments.length,
            data: shipments
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Get single shipment
// @route     GET /api/shipments/:id
// @access    Private
exports.getShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
        }

        // Make sure user owns shipment
        if (shipment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this shipment`, 403));
        }

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Track shipment by tracking ID
// @route     GET /api/shipments/track/:trackingId
// @access    Public
exports.trackShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });

        if (!shipment) {
            return next(new ErrorResponse(`Shipment not found with tracking ID of ${req.params.trackingId}`, 404));
        }

        // Return limited information for public tracking
        res.status(200).json({
            success: true,
            data: {
                id: shipment.id,
                trackingId: shipment.trackingId,
                status: shipment.status,
                payment: shipment.paymentStatus,
                source: {
                    address:shipment.source.address,
                    city: shipment.source.city,
                    state: shipment.source.state,
                    country: shipment.source.country
                },
                destination: {
                    address:shipment.destination.address,
                    city: shipment.destination.city,
                    state: shipment.destination.state,
                    country: shipment.destination.country
                },
                createdAt: shipment.createdAt,
                updatedAt: shipment.updatedAt
            }
        });
    } catch (err) {
        next(err);
    }
};