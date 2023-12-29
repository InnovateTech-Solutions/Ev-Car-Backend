// routes/stationRoutes.js
const express = require('express');
const Station = require('../models/station');
const passport = require('passport');
const router = express.Router();
const Charger = require('../models/charger');



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

// Get all stations
router.get('/getAll', async (req, res) => {
  try {
    const stations = await Station.find().populate('chargers');
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/create', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { title, address, coordinates, description, number, type, chargerIds } = req.body;
    
    const stationExists = await Station.findOne({ number: number });

    if(stationExists){
        return res.status(400).json({ msg: 'Station already exists' });
    }

    // Check if chargerIds array is provided
    if (!Array.isArray(chargerIds) || chargerIds.length === 0) {
      return res.status(400).json({ message: 'chargerIds must be an array with at least one ID.' });
    }

    // Validate that provided chargerIds exist
    const chargersExist = await Charger.find({ _id: { $in: chargerIds } });
    if (chargersExist.length !== chargerIds.length) {
      return res.status(400).json({ message: 'Invalid chargerIds provided.' });
    }

    // Check if the type is home_charging_provider
    if (type === 'home_charging_provider') {
      return res.status(403).json({ message: 'Permission denied. Home charging providers cannot add chargers.' });
    }

    // Create a new station with provided data
    const station = new Station({
      title,
      address,
      coordinates,
      description,
      number,
      type,
      chargers: chargerIds,
    });

    await station.save();

    res.status(201).json({ message: 'Station created successfully.', station });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // Get all stations (secured for all users)
// router.get('/getAll', async (req, res) => {
//   try {
//     const stations = await Station.find();
//     res.json(stations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Create a new station (secured for admin users only)
// router.post('/create', authenticateJWT, isAdmin, async (req, res) => {
//   try {
//     const { title, address, coordinates, description, number, type, chargers } = req.body;

//     const station = new Station({
//       title,
//       address,
//       coordinates,
//       description,
//       number,
//       type,
//       chargers,
//     });

//     await station.save();

//     res.status(201).json({ message: 'Station created successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


// Delete station by ID (secured for admin users only)
router.delete('/delete', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const stationId = req.body.id;
    const deletedStation = await Station.findByIdAndDelete(stationId);

    if (!deletedStation) {
      return res.status(404).json({ message: 'Station not found.' });
    }

    res.json({ message: 'Station deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update station by ID (secured for admin users only)
router.put('/update', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const stationId = req.body.id;
    const updatedStation = await Station.findByIdAndUpdate(stationId, req.body, { new: true });

    if (!updatedStation) {
      return res.status(404).json({ message: 'Station not found.' });
    }
    
    res.json({ message: 'Station updated successfully.', station: updatedStation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
