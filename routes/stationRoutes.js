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

router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    if (!query) {
      return res.status(400).json({ message: 'Search query parameter is required.' });
    }

    const stations = await Station.find({ title: { $regex: new RegExp(query, 'i') } }).populate('chargers');

    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// gets a list of stations by type
router.get('/getStationsByType/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!type) {
      return res.status(400).json({ message: 'Type parameter is required.' });
    }

    const validTypes = ['charging_station', 'mobile_charging', 'home_charging_provider'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid station type.' });
    }

    const stations = await Station.find({ type }).populate('chargers');

    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Gets a specific station by its ID
router.get('/getStationById/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({ message: 'Invalid station ID.' });
    // }

    const station = await Station.findById(id).populate('chargers');

    if (!station) {
      return res.status(404).json({ message: 'Station not found.' });
    }

    res.json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// gets all stations
router.get('/getAll', async (req, res) => {
  try {
    const stations = await Station.find().populate('chargers');
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create stations
router.post('/create', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { title, img, address, coordinates, description, number, type, chargerIds, features } = req.body;

    const stationExists = await Station.findOne({ number: number });

    if (stationExists) {
      return res.status(400).json({ msg: 'Station already exists' });
    }
    if (type === 'charging_station' || type === 'mobile_charging') {
      if (!Array.isArray(chargerIds) || chargerIds.length === 0) {
        return res.status(400).json({ message: 'chargerIds must be an array with at least one ID.' });
      }

      const chargersExist = await Charger.find({ _id: { $in: chargerIds } });
      if (chargersExist.length !== chargerIds.length) {
        return res.status(400).json({ message: 'Invalid chargerIds provided.' });
      }

      const station = new Station({
        title,
        img,
        address,
        coordinates,
        number,
        type,
        features: features,
        chargers: chargerIds,
      });

      await station.save();

      res.status(201).json({ message: 'Station created successfully.', station });
    }

    else if(type === 'home_charging_provider') {
       const station = new Station({
        title,
        img,
        address,
        coordinates,
        number,
        type,
        features: features,
      });

      await station.save();

      res.status(201).json({ message: 'Station created successfully.', station });

    }
    else{
      next('Provided type does not match any valid types');
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// adds chargers for a specific station
router.post('/addChargers', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { stationId, chargerIds } = req.body;

    const station = await Station.findById(stationId);
    
    if(station.type === 'home_charging_provider'){   
      return res.status(404).json({ message: 'cannot add chargers for home charging providers.' });
    }

    if (!station) {
      return res.status(404).json({ message: 'Station not found.' });
    }

    if (!Array.isArray(chargerIds) || chargerIds.length === 0) {
      return res.status(400).json({ message: 'chargerIds must be an array with at least one ID.' });
    }

    const availableChargers = await Charger.find({ _id: { $in: chargerIds } });

    const invalidChargers = chargerIds.filter(chargerId => !availableChargers.some(charger => charger.id === chargerId));
    if (invalidChargers.length > 0) {
      return res.status(404).json({ message: 'One or more chargers not found in the available chargers.' });
    }

    const chargerExists = chargerIds.filter(chargerId => station.chargers.includes(chargerId));
    if(chargerExists.length > 0){
      return res.status(400).json({ message: 'One or more chargers are already available.' });

    }
D
    station.chargers.push(...chargerIds);

    await station.save();

    res.json({ message: 'Chargers added to the station successfully.', station });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// deletes chargers for a specific station
router.post('/deleteChargers', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { stationId, chargerIds } = req.body;

    const station = await Station.findById(stationId);

    if (!station) {
      return res.status(404).json({ message: 'Station not found.' });
    }

    if (!Array.isArray(chargerIds) || chargerIds.length === 0) {
      return res.status(400).json({ message: 'chargerIds must be an array with at least one ID.' });
    }

    const invalidChargers = chargerIds.filter(chargerId => !station.chargers.includes(chargerId));
    if (invalidChargers.length > 0) {
      return res.status(404).json({ message: 'One or more chargers not found in the station.' });
    }

    station.chargers = station.chargers.filter(id => !chargerIds.includes(id.toString()));

    await station.save();

    res.json({ message: 'Chargers deleted successfully.', station });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Delete station by ID (secured for admin users only)
router.delete('/delete/:stationId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const stationId = req.params.stationId; 
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
