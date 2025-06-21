const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const authenticate = require('./middleware/auth.js');


const User = require('./models/user.js');
const Booking = require('./models/bookings.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('DB connected.');
});

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Check if required fields are present
        if (!email || !password || !confirmPassword) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).send({ message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(500).send({ message: 'Error creating user', error: error.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid password' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.send({ user, token });
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error });
    }
});


async function makeBooking(req, res, vehicleType) {
    const { taxiId, time } = req.body;
    if (!taxiId || !time) {
        return res.status(400).json({ message: 'taxiId and time are required' });
    }

    const capacity = vehicleType === 'auto' ? 3 : 4;
    const taken = await Booking.countDocuments({ taxiId });
    if (taken >= capacity) {
        return res.status(400).json({
            message: `Sorry—this ${vehicleType} is full.`
        });
    }

    // 1) Insert your seat
    const seat = new Booking({
        taxiId,
        vehicleType,
        users: [{
            userId: req.user._id,
            name: req.user.name,
            email: req.user.email
        }],
        time: new Date(time),
        maxCapacity: capacity
    });
    await seat.save();

    // 2) Fetch all seats, flatten users
    const seats = await Booking.find({ taxiId }).select('users -_id').lean();
    const allRiders = seats.flatMap(s => s.users);

    // 3) Return the new seat plus full rider list
    const result = seat.toObject();
    result.users = allRiders;

    res.status(201).json({ booking: result });
}

// Taxi route
app.post(
    '/book-taxi-now',
    authenticate,
    (req, res) => makeBooking(req, res, 'taxi')
);

// Auto route
app.post(
    '/book-auto-now',
    authenticate,
    (req, res) => makeBooking(req, res, 'auto')
);

app.get('/booking-history', authenticate, async (req, res) => {
    try {
        // Find all “seat” docs where this user is in the users array
        const bookings = await Booking.find({ 'users.userId': req.user._id })
            .sort({ createdAt: -1 });  // most recent first

        res.json({
            count: bookings.length,
            bookings
        });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Could not fetch booking history', error: err.message });
    }
});

app.get('/current-booking', authenticate, async (req, res) => {
    try {
        // latest seat where this user is already on board
        const booking = await Booking
            .findOne({ 'users.userId': req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        if (!booking) {
            return res.status(404).json({ message: 'No active booking' });
        }

        // you might choose to hide internal Mongo fields here
        res.json({ booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Could not fetch current booking',
            error: err.message
        });
    }
});

app.post(
    '/cancel-booking',
    authenticate,
    async (req, res) => {
        const { taxiId } = req.body;
        if (!taxiId) {
            return res.status(400).json({ message: 'taxiId is required' });
        }

        try {
            // delete only this user’s seat for that taxiId
            const removed = await Booking.findOneAndDelete({
                taxiId,
                'users.userId': req.user._id
            });

            if (!removed) {
                return res
                    .status(404)
                    .json({ message: 'No booking found to cancel' });
            }

            // fetch remaining riders for that slot
            const seats = await Booking
                .find({ taxiId })
                .select('users -_id')
                .lean();
            const allRiders = seats.flatMap(s => s.users);

            res.json({ taxiId, users: allRiders });
        } catch (err) {
            console.error('Cancel error:', err);
            res
                .status(500)
                .json({ message: 'Could not cancel booking', error: err.message });
        }
    }
);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// GET /profile
app.get(
    '/profile',
    authenticate,
    async (req, res) => {
        // req.user was loaded by authenticate()
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        });
    }
);
