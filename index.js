const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  uuid = require('uuid'),
  bodyParser = require('body-parser'),
  path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

app.use(express.static('public'));
app.use(morgan('combined', { stream: logStream }));
app.use(bodyParser.json());
//Used to parse form data for the server
app.use(bodyParser.urlencoded({ extended: true }));

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
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// Gets the data about all users

app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((error) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get single user

app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets the data about a single movie, by title
app.get('/movies/:title', (req, res) => {
  res.json(
    dbMovies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

// Gets the data about a genre, by name
app.get('/movies/genre/:name', (req, res) => {
  const { name } = req.params;
  const genre = dbMovies.find((movie) => movie.genre.genreName === name);

  if (genre) {
    res.json(genre.genre);
  } else {
    res.send(`Genre ${name} not found`);
  }
});

// Gets the data about a director, by name
app.get('/movies/director/:name', (req, res) => {
  Movies.findOne({"Director.Name": req.params.name}, { Director: 1 }) 
.then((director) => {
  res.status(200).json(director);
})
.catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
});
});

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

app.post('/users', (req, res) => {
  //findOne checks if username already exists
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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
});

// Add a movie to their list of favorites

app.post('/users/:Username/FavoriteMovies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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

app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  ) //returns new data
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE requests

// Deletes a user from the list by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + 'was not found.');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Deletes a movie from the user's favorite list

app.delete('/users/:Username/FavoriteMovies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//error-handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
