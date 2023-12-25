// routes/stationRoutes.js
const express = require('express');
const Station = require('../models/station');
const passport = require('passport');

const router = express.Router();

// Middleware for JWT authentication
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware for admin authorization
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Permission denied. Admins only.' });
  }
};

// Get all stations (secured for all users)
router.get('/stations', authenticateJWT, async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new station (secured for admin users only)
router.post('/create', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { address, coordinates, description, number, type, chargers } = req.body;

    const station = new Station({
      address,
      coordinates,
      description,
      number,
      type,
      chargers,
    });

    await station.save();

    res.status(201).json({ message: 'Station created successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
