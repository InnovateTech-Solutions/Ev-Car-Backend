// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');  // Make sure to require passport module
const jwtStrategy = require('./passport'); // Import your passport configuration
const stationRoutes = require('./routes/stationRoutes');
const authRoutes = require('./routes/authRoutes');
const chargerRoutes = require('./routes/chargerRoutes');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(passport.initialize());

// MongoDB connection
mongoose.connect('mongodb+srv://dbuser:Afaomr2001!@cluster0.qsmru3l.mongodb.net/Ev-Car', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Passport configuration
passport.use(jwtStrategy);

// Routes
app.use('/stations', stationRoutes);
app.use('/chargers', chargerRoutes);
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
