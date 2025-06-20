const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const taxiBookingSchema = new mongoose.Schema({
    taxiId: {
        type: String,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ['taxi', 'auto'],
        required: true
    },
    users: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    }],
    time: {
        type: Date,
        required: true
    },
    maxCapacity: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bookings', taxiBookingSchema);
