require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

console.log(process.env.CONNECT_YOU_IDIOT);

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/*mongoose.connect('mongodb://localhost:27017/myFlixAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});*/

const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: logStream }));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//CORS, allowed origins

const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://testsite.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message = `The CORS policy for this app doesn't allow acces from origin ${origin}`;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// Import and use the auth module passing the app object
const auth = require('./auth.js')(app);

const passport = require('passport');
//const { has } = require('lodash');
require('./passport.js');

// Rest of your code goes here

// GET requests

// Gets the default page
app.get('/', (req, res) => {
  res.send('Welcome to the flixApp!');
});

// Gets the documentation page
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Gets the data about all movies
app.get(
  '/movies' /*
  passport.authenticate('jwt', { session: false }),*/,
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Gets the data about all users

app.get(
  '/users' /*
  passport.authenticate('jwt', { session: false }),*/,
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get single user

app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .populate('FavoriteMovies', 'Title Description')
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Gets the data about a single movie, by title
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Gets the data about a genre, by name

app.get(
  '/movies/genre/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.name }, { Genre: 1 })
      .then((genre) => {
        res.status(200).json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Gets the data about a director, by name
app.get(
  '/movies/director/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.name }, { Director: 1 })
      .then((director) => {
        res.status(200).json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Search movies by actor name
app.get(
  '/movies/actors/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const actorName = req.params.name;

    Movies.find({ Actors: { $in: [actorName] } }, { Title: 1, Description: 1 })
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// POST requests

// Adds data for a new user to our list of users.
/* Expected JSON format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/

app.post(
  '/users',
  [
    check(
      'Username',
      'Username is required and needs to be at least 5 characters'
    ).isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non-alphanumeric characters, not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    // check for val errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    console.log(hashedPassword);
    //findOne checks if username already exists
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Add a movie to their list of favorites

app.post(
  '/users/:Username/FavoriteMovies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// PUT requests

// Allow users to update their user info, via username
/* JSON Format expected:
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/

app.put(
  '/users/:Username',
  [
    passport.authenticate('jwt', { session: false }),
    check('Username')
      .isLength({ min: 5 })
      .withMessage('Username is required')
      .isAlphanumeric()
      .withMessage(
        'Username contains non-alphanumeric characters, not allowed.'
      ),
    check('Password').not().isEmpty().withMessage('Password is required'),
    check('Email').isEmail().withMessage('Email does not appear to be valid'),
  ],
  (req, res) => {
    // Check for validation errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    console.log(hashedPassword);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // Returns new data
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// DELETE requests

// Deletes a user from the list by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(404).send(req.params.Username + 'was not found.');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Deletes a movie from the user's favorite list

app.delete(
  '/users/:Username/FavoriteMovies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//error-handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + port);
});
