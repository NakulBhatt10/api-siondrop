const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Booking', bookingSchema);