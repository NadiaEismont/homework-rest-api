const { ExtractJwt: ExtractJWT, Strategy: JWTStrategy } = require('passport-jwt');
const passport = require('passport');
const User = require('../models/User');

require('dotenv').config();

const params = {
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
};

passport.use(
  new JWTStrategy(params, function (payload, done) {
    User.findOne({ _id: payload.id })
      .then((fetchedUser) => {
        if (!fetchedUser) {
          return done(new Error('User not found.'));
        }

        if (!fetchedUser.token) {
          return done(new Error('Not authorized.'));
        }

        return done(null, fetchedUser);
      })
      .catch((error) => done(error));
  })
);

module.exports = { passport };
