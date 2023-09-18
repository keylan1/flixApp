/**
 * Authentication and login route module.
 * @module auth-route
 */
const jwtSecret = 'your_jwt_secret'; //has to be same key as in JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport.js'); //local passport file

/**
 * Generates a JWT token for a user.
 * @function
 * @name generateJWTToken
 * @param {Object} user - The user object.
 * @returns {string} - The generated JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // username being encoded in JWT CHANGE THE INFO SO NOT EVERYTHING IS SHOWN
    expiresIn: '7d', //specifies token expires in 7 days
    algorithm: 'HS256', // algorithm used to "sign" or encode the values of the JWT
  });
};

/* POST login. */
/**
 * Handles the POST login route for user authentication.
 * @function
 * @name handleLoginRoute
 * @param {Object} router - The Express router object.
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
