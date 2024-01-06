// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();

router.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ phone: req.body.phone });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const user = new User({
      phone: req.body.phone,
      username: req.body.username,
      carType: req.body.carType,
      password: req.body.password,
      role: req.body.role,
    });

    await user.save();
    console.log(process.env.JWT_SECRET);
    const token = jwt.sign({ phone: user.phone, role: user.role }, process.env.JWT_SECRET, {
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


router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "Authentication failed. Check your credentials and try again.",
        data: null,
      });
    }

    const token = jwt.sign({ phone: user.phone, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

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
