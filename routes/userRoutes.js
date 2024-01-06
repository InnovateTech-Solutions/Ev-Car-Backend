// routes/userRoutes.js
const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();

const authenticateJWT = passport.authenticate('jwt', { session: false });

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Permission denied. Admins only.' });
  }
};

/////////////////////////////////////////////////////////////////////////////////

router.put('/update', authenticateJWT, async (req, res) => {
    try {
      const authenticatedUser = req.user;
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

  router.get('/getAllUsers', authenticateJWT, isAdmin, async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/getUserDetails', authenticateJWT, (req, res) => {
    try {
      const authenticatedUser = req.user;
  
      res.status(200).json(authenticatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


//checks if user exists
router.get('/userExists/:number', async (req, res) => {
  try {
    const { number } = req.params;

    const existingUser = await User.findOne({ phone: number });
    var result = true;
    if (existingUser) {
      return res.status(400).json({result});
    }else{
      result = false;
      res.status(201).json({result});  
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
  

module.exports = router;
