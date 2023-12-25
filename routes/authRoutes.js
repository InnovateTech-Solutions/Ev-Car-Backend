// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();


// Register a new user
router.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

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
    console.log(process.env.JWT_SECRET);
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // If the user is not found or the password is incorrect, send an authentication failed response
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'success',
        token,
        data: {
          user,
        },
      });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Send the token in the response
    return res.status(201).json({
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


module.exports = router;
