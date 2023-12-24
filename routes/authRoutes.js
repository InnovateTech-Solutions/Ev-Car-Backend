// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
require('dotenv').config();


// Register a new user
router.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    });

    await user.save();
    console.log( process.env.JWT_SECRET);
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },

    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login and generate a JWT token
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    req.login(user, { session: false }, async (err) => {
      if (err) {
        res.send(err);
      }

      // Dynamically generate a new secret key for each login session
      const secretKey = generateRandomKey();

      // Use the dynamically generated secret key to sign the JWT token
      const token = jwt.sign({ sub: user._id }, secretKey);
      return res.json({ token });
    });
  })(req, res, next);
});

module.exports = router;
