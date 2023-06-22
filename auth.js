const jwtSecret = 'your_jwt_secret'; //has to be same key as in JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport.js'); //local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // username being encoded in JWT
    expiresIn: '7d', //specifies token expires in 7 days
    algorithm: 'HS256', // algorithm used to "sign" or encode the values of the JWT
  });
}

/* POST login. */ 

module.exports = (router) => {
  router.post('/login', (req, res) => {
    console.log('Login request received');
    passport.authenticate('local', { session: false }, (error, user, info) => {
      console.log('Passport authentication callback');
      if (error || !user) {
        console.log('Authentication failed:', error);
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        console.log('User login callback');
        if (error) {
          console.log('Error during user login:', error);
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
