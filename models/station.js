// models/station.js
const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: { type: String, required: true },
  description: { type: String, required: true },
  number: { type: String, required: true },
  type: {
    type: String,
    enum: ['charging_station', 'mobile_charging', 'home_charging_provider'],
    required: true,
  },
  chargers: { type: String, required: function () { return ['charging_station', 'mobile_charging'].includes(this.type); } },
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
