// models/charger.js
const mongoose = require('mongoose');

const chargerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
});

const Charger = mongoose.model('Charger', chargerSchema);

module.exports = Charger;
