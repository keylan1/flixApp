const express = require('express'),
      morgan = require('morgan'),
      fs = require('fs'),
      uuid = require('uuid'),
      bodyParser = require('body-parser'),
      path = require('path');
const app = express();
const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(express.static('public'));
app.use(morgan('combined', {stream: logStream}));
app.use(bodyParser.json());

let users = [
  {
    userName: 'JackBNimble',
    email: 'j.nimble@madeup.com',
    favoriteMovie: ['Princess Bride']
  },

  {
    userName: 'JillTree',
    email: 'jtree@madeup.comm',
    favoriteMovie: ['Harry Potter and the Philosopher\'s Stone']
  },

  {
    userName: 'HumptyDumpty',
    email: 'humpty@allthekingsmen.com',
    favoriteMovie: ['Mulan']
  }
];

let topMovies = [
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    genre: {
      genreName: 'Fantasy',
      description: 'Stories that contain elements that are not realistic'
    },
    director: {
      name: 'Chris Columbus',
      bio: 'American film director, producer, and screenwriter',
      birth: 'September 10, 1958',
      death: '-'
    },
    description: `Harry Potter and the Philosopher's Stone" is a fantasy film based on J.K. Rowling's popular book series. The story follows Harry Potter, an orphaned boy who discovers he is a wizard and is invited to attend Hogwarts School of Witchcraft and Wizardry. Alongside his new friends Ron and Hermione, Harry uncovers dark secrets, battles magical creatures, and encounters the evil wizard Lord Voldemort. It's a captivating tale of friendship, adventure, and the beginning of Harry's journey to becoming a legendary wizard.`,
    imageURL: `https://en.wikipedia.org/wiki/Harry_Potter_and_the_Philosopher%27s_Stone_%28film%29#/media/File:Harry_Potter_and_the_Philosopher's_Stone_banner.jpg`,
    featured: true
  },

  {
    title: 'Mulan',
    genre: {
      genreName: 'Animated',
      description: 'Films in which drawings are used in a way that makes them move as if they were alive'
    },
    description: `"Mulan" is a thrilling and inspiring animated film from Disney. The story follows Mulan, a young Chinese woman who disguises herself as a man to take her father's place in the Imperial Army. With courage and determination, Mulan faces challenges and fights against the invading Huns, showcasing her bravery and resourcefulness. The film explores themes of gender identity, honor, and family while highlighting Mulan's journey of self-discovery and her quest to bring honor to her family. "Mulan" is a captivating tale of empowerment, resilience, and the importance of staying true to oneself.`,
    director: {
      name: 'Barry Cook',
      bio: 'American film director in the animation industry',
      birth: '12 August 1958',
      death: '-'
    },
    imageURL: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Movie_poster_mulan.JPG',
    featured: true
  },

  {
    title: 'The Princess Bride',
    genre: {
      genreName: 'Fantasy',
      description: 'Films that contain elements that are not realistic',
    },
    description: `"The Princess Bride" is a beloved fantasy-adventure film that combines romance, humor, and swashbuckling action. The story revolves around a young woman named Buttercup and her true love, Westley. Separated by fate, they face numerous obstacles, including a vengeful prince, a clever swordsman, and a giant with a kind heart. Filled with witty dialogue, memorable characters, and a timeless love story, "The Princess Bride" is a charming and whimsical tale that has enchanted audiences for decades.`,
    director: {
      name: 'Rob Reiner',
      bio: 'American actor and filmmaker',
      birth: 'March 6, 1947',
      death: '-'
    },
    imageURL: `https://en.wikipedia.org/wiki/The_Princess_Bride_(film)#/media/File:Princess_bride.jpg`,
    featured: true
  }
];

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
  res.json(users);
});

// Gets the data about a single movie, by title
app.get('/movies/:title', (req, res) => {
  res.json(
    topMovies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

// Gets the data about a genre, by title
app.get('/movies/genre/:name', (req, res) => {
  const {name} = req.params;
  const genre = topMovies.find((movie) => movie.genre.genreName === name);

  if (genre) {
    res.json(genre.genre);
  } else {
    res.send(`Genre ${name} not found`);
  }
});

// Gets the data about a director, by name
app.get('/movies/director/:name', (req, res) => {
  const {name} = req.params;
  const director = topMovies.find((movie) => movie.director.name === name);

  if (director) {
    res.json(director.director);
  } else {
    res.send(`Director ${name} not found`);
  }
});

// POST requests

// Adds data for a new user to our list of users.
app.post('/users', (req, res) => {
  let newUser = req.body;

  if (!newUser.userName) {
    const message = 'Missing username in request body';
    res.status(400).send(message);
  } else {
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

// Allow users to add a movie to their list of favorites
app.post('/users/:email/favorites', (req, res) => {
  const { email } = req.params;
  const { movie } = req.body;

  const user = users.find((user) => user.email === email);

  if (user) {
    user.favoriteMovie.push(movie);
    res.status(201).send(`Movie "${movie}" has been added to favorites for user with email ${email}.`);
  } else {
    res.status(404).send(`User with email ${email} not found.`);
  }
});

// PUT requests

// Allow users to update their user info (username)
app.put('/users/:email', (req, res) => {
  const { email } = req.params;
  const { newUsername, newEmail, newFavoriteMovie,  } = req.body;

  const user = users.find((user) => user.email === email);

  if (user) {
    user.userName = newUsername;
    user.email = newEmail;
    user.favoriteMovie = newFavoriteMovie;
    res.status(200).send(`Username for email ${email} has been updated to ${newUsername}.`);
  } else {
    res.status(404).send(`User with email ${email} not found.`);
  }
});

// DELETE requests

// Deletes a user from the list by email
app.delete('/users/:email', (req, res) => {
  const { email } = req.params;

  const user = users.find((user) => user.email === email);

  if (user) {
    users = users.filter((user) => user.email !== email);
    res.status(201).send(`User ${req.params.userName} with email ${email} has been deleted.`)
  } else {
    res.status(404).send(`User with email ${email} not found.`);
  }
});

// Deletes a movie from the user's favorite list by email
app.delete('/users/:email/favorites/:movie', (req, res) => {
  const { email, movie } = req.params;

  const user = users.find((user) => user.email === email);

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  if (!user.favoriteMovie.includes(movie)) {
    res.status(404).send('Movie not found in favorites');
    return;
  }

  user.favoriteMovie = user.favoriteMovie.filter((favMovie) => favMovie !== movie);

  res.status(200).send(`Movie ${movie} removed from favorites for ${user.userName}.`);
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