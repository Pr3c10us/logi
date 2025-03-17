const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');


const UpdatedShipmentSchema = new mongoose.Schema({
    shipment: {
        type: String,
        enum: [
            "order-received",
            "awaiting-pickup",
            "picked-up",
            "in-transit",
            "arrived-at-sorting-facility",
            "departed-from-sorting-facility",
            "out-for-delivery",
            "delivered",
            "delivery-attempted",
            "failed-delivery",
            "address-issue",
            "held-at-customs",
            "delayed",
            "damaged-in-transit",
            "return-initiated",
            "return-in-transit",
            "return-received",
            "refund-processed",
            "cancelled"
        ],
        required: true
    },
    timestamp: {type: Date, default: Date.now},
});

const ShipmentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        unique: true,
        default: () => uuidv4().substring(0, 8).toUpperCase()
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    source: {
        address: {
            type: String,
            required: [true, 'Please provide source address']
        },
        state: {
            type: String,
            required: [true, 'Please provide destination state']
        },
        city: {
            type: String,
            required: [true, 'Please provide source city']
        },
        country: {
            type: String,
            required: [true, 'Please provide source country']
        }
    },
    destination: {
        address: {
            type: String,
            required: [true, 'Please provide destination address']
        },
        state: {
            type: String,
            required: [true, 'Please provide destination state']
        },
        city: {
            type: String,
            required: [true, 'Please provide destination city']
        },
        country: {
            type: String,
            required: [true, 'Please provide destination country']
        }
    },
    packageDetails: {
        weight: {
            type: Number,
            required: [true, 'Please provide package weight']
        },
        dimensions: {
            length: {
                type: Number,
                required: [true, 'Please provide package length']
            },
            width: {
                type: Number,
                required: [true, 'Please provide package width']
            },
            height: {
                type: Number,
                required: [true, 'Please provide package height']
            }
        },
        description: String
    },
    status: {
        type: String,
        enum: [
            "order-received",
            "awaiting-pickup",
            "picked-up",
            "in-transit",
            "arrived-at-sorting-facility",
            "departed-from-sorting-facility",
            "out-for-delivery",
            "delivered",
            "delivery-attempted",
            "failed-delivery",
            "address-issue",
            "held-at-customs",
            "delayed",
            "damaged-in-transit",
            "return-initiated",
            "return-in-transit",
            "return-received",
            "refund-processed",
            "cancelled"
        ],
        default: 'order-received'
    },
    updatedStatus: [UpdatedShipmentSchema],
    paymentStatus: {
        type: String,
        enum: ['pending', 'successful'],
        default: 'pending'
    },
    shipmentType: {
        type: String,
        enum: ['standard', 'express'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on update
ShipmentSchema.pre('findOneAndUpdate', function () {
    this.set({updatedAt: Date.now()});
});

module.exports = mongoose.model('Shipment', ShipmentSchema);