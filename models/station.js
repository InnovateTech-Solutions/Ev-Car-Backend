// models/station.js
const mongoose = require('mongoose');
const chargerSchema = require('./charger'); 

const stationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  img: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: { type: String, required: true },
  number: { type: String, required: true },
  type: {
    type: String,
    enum: ['charging_station', 'mobile_charging', 'home_charging_provider'],
    required: true,
  }, 
  features: { type: [String], default: [] },
  chargers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Charger' }],
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
