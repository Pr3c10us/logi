const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: 'client' // Default role is client
        });

        // Send token response
        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and password', 400));
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Send token response
        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};