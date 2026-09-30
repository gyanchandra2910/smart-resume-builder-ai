const User = require('../models/User');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
};

// Signup controller
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!name?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = new User({ name: name.trim(), email: normalizedEmail, password });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Link resumes created before ownership enforcement to the existing
        // account with the same normalized email.
        await Resume.updateMany(
            { userId: { $exists: false }, email: user.email },
            { $set: { userId: user._id } }
        );

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { signup, login };
