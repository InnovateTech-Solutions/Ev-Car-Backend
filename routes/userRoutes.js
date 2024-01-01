// routes/userRoutes.js
const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();

const authenticateJWT = passport.authenticate('jwt', { session: false });

router.put('/update', authenticateJWT, async (req, res) => {
    try {
      const authenticatedUser = req.user;
  
      // if (authenticatedUser.id !== req.body.id) {
      //   return res.status(403).json({ message: 'Forbidden. You can only update your own profile.' }); 
      // }
  
      if (req.body.username) {
        authenticatedUser.username = req.body.username;
      }
  
      if (req.body.carType) {
        authenticatedUser.carType = req.body.carType;
      } 
  
      await authenticatedUser.save();

      res.status(201).json(authenticatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/getUserDetails', authenticateJWT, async (req, res) => {
    try {
      const id = req.user._id;
      const user = await User.findById(id);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports = router;
