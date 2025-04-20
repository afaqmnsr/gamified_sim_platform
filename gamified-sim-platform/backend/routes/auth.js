const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const nodemailer = require('nodemailer');

const JWT_SECRET = 'super_secret_key_change_me'; // put in .env in production

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'User already exists' });
        console.log('Creating user:', { name, email, password });
        if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
        const user = await User.create({ username: name, email, password });
        if (!user) return res.status(400).json({ error: 'User creation failed' });
        console.log('User created:', user);

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        const verifyLink = `http://localhost:5000/api/auth/verify-email/${token}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Verify Your Email',
            html: `<h2>Hi ${user.name}</h2><p>Please click the link to verify your email: <a href="${verifyLink}">Verify Email</a></p>`
        });

        res.json({ message: 'Verification email sent!' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.get('/verify-email/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).send('User not found');
        user.isVerified = true;
        await user.save();
        res.send('Email verified successfully! You can now log in.');
    } catch (err) {
        res.status(400).send('Invalid or expired token');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // if (!user.isVerified) {
        //     return res.status(403).json({ error: 'Please verify your email before logging in.' });
        // }

        const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'Lax',
                secure: false, // set true if using HTTPS in production
                path: '/api/auth/refresh'
            })
            .json({
                token: accessToken,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Me
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

router.post('/refresh', (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const newAccessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ token: newAccessToken });
    } catch {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

module.exports = router;
