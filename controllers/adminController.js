const Shipment = require('../models/Shipment');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Get all shipments (admin)
// @route     GET /api/admin/shipments
// @access    Private/Admin
exports.getAllShipments = async (req, res, next) => {
    try {
        // Build query
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Shipment.find(JSON.parse(queryStr));

        // Select fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Shipment.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        // Filter by date range if provided
        if (req.query.startDate && req.query.endDate) {
            query = query.where('createdAt').gte(new Date(req.query.startDate)).lte(new Date(req.query.endDate));
        }

        // Filter by tracking ID if provided
        if (req.query.trackingId) {
            query = query.where('trackingId', req.query.trackingId);
        }

        // Executing query
        const shipments = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: shipments.length,
            pagination,
            data: shipments
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update shipment status
// @route     PUT /api/admin/shipments/:id/status
// @access    Private/Admin
exports.updateShipmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return next(new ErrorResponse('Please provide a status', 400));
        }

        let shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
        }

        shipment.updatedStatus.push({ shipment: status });
        shipment.status = status;

        await shipment.save();

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Update shipment payment status
// @route     PUT /api/admin/shipments/:id/payment
// @access    Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            return next(new ErrorResponse('Please provide a payment status', 400));
        }

        let shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
        }

        shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (err) {
        next(err);
    }
};
// @desc      Update shipment amount
// @route     PUT /api/admin/shipments/:id/amount
// @access    Private/Admin
exports.updateAmount = async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (amount< 0) {
            return next(new ErrorResponse('Please provide a valid amount', 400));
        }

        let shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
        }

        shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            { amount },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Delete shipment
// @route     DELETE /api/admin/shipments/:id
// @access    Private/Admin
exports.deleteShipment = async (req, res, next) => {
    try {
        let shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
        }

        await Shipment.findByIdAndDelete(
            req.params.id,
            {}
        );

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};

// @desc      Create admin user
// @route     POST /api/admin/create
// @access    Private/Admin
exports.createAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Create admin user
        const user = await User.create({
            name,
            email,
            password,
            role: 'admin'
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};