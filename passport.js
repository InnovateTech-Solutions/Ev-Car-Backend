// passport.js
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('./models/user');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findOne({ phone: payload.phone })
    console.log(user);

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});

module.exports = jwtStrategy;
