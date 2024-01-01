// routes/chargerRoutes.js
const express = require('express');
const Charger = require('../models/charger');
const passport = require('passport');
const router = express.Router();


//used middlewares
const authenticateJWT = passport.authenticate('jwt', { session: false });

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Permission denied. Admins only.' });
  }
};
////////////////////////////////////////////////////////////////////////////

// crud operations for chargers
router.post('/add', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { title, image } = req.body;
    const chargerExists = await Charger.findOne({ title: title })
    if(chargerExists){
        return res.status(400).json({ msg: 'Charger already exists' });
    }
    
    const charger = new Charger({
      title,
      image,
    });

    await charger.save();

    res.status(201).json({ message: 'Charger added successfully.', charger });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update station by ID (secured for admin users only)
router.put('/update', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const chargerId = req.body.id;
    const updatedCharger = await Station.findByIdAndUpdate(chargerId, req.body, { new: true });

    if (!updatedCharger) {
      return res.status(404).json({ message: 'Station not found.' });
    }

    res.json({ message: 'Station updated successfully.', station: updatedChager });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }r
});


router.get('/getAllChargers', async (req, res) => {
    try {
      const charger = await Charger.find();
      res.json(charger);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
