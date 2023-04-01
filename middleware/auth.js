const { passport } = require('../lib/passport');

const auth = async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!user || err) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  auth
};
