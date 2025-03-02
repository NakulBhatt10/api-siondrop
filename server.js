const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const User = require('./user.js');
const Booking = require('./booking');

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
        const { email, password, confirmPassword } = req.body;

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
        const user = new User({ email, password });
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
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.send({ user, token });
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error });
    }
});

// Book Now Route (Protected)
app.post('/book-now', async (req, res) => {
    try {
        const { userId, date, details } = req.body;

        // Create new booking
        const booking = new Booking({ user: userId, date, details });
        await booking.save();

        res.status(201).send({ booking });
    } catch (error) {
        res.status(500).send({ message: 'Error creating booking', error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});