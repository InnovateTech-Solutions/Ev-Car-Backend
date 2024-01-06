// routes/favoriteRoutes.js
const express = require('express');
const Favorite = require('../models/favorite');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();

const authenticateJWT = passport.authenticate('jwt', { session: false });


// Add station to favorites
router.post('/addFavorite', authenticateJWT, async (req, res) => {
  try {
    const { stationId } = req.body;
    const userPhone = req.user.phone; 

    const user = await User.findOne({ phone: userPhone });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existingFavorite = await Favorite.findOne({ user: user._id, station: stationId });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Station is already in favorites.' });
    }

    const favorite = new Favorite({
      user: user._id,
      station: stationId,
    });

    await favorite.save();

    res.status(201).json({ message: 'Station added to favorites successfully.', favorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get user's favorite stations
router.get('/getFavorites', authenticateJWT, async (req, res) => {
  try {
    const userPhone = req.user.phone; 
    const user = await User.findOne({ phone: userPhone });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const favorites = await Favorite.find({ user: user._id }).populate('station');

    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete station from favorites
router.delete('/deleteFavorite/:favoriteId', authenticateJWT, async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const userPhone = req.user.phone;

    const user = await User.findOne({ phone: userPhone });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const favorite = await Favorite.findOne({ _id: favoriteId, user: user._id });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    await Favorite.deleteOne({ _id: favoriteId, user: user._id });

    res.json({ message: 'Favorite removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
