const express = require('express'),
      morgan = require('morgan'),
      fs = require('fs'),
      path = require('path');
const app = express();
const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(express.static('public'));
app.use(morgan('combined', {stream: logStream}));

let topMovies = [
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling'
  },
  {
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien'
  },
  {
    title: 'Twilight',
    author: 'Stephanie Meyer'
  },

  {
    title: 'The Princess Bride',
    author: 'William Goldman'
  },

  {
    title: 'Jane Eyre',
    author: 'Charlotte Bronte'
  },

  {
    title: 'Persuasion',
    author: 'Jane Austen'
  },

  {
    title: 'The Emperor\'s new Groove',
    author: 'Walt Disney'
  },

  { 
    title: 'Mulan',
    author: 'Walt Disney'
  },

  {
    title: 'Enola Holmes',
    author: 'Nancy Springer'
  },

  {
    title: 'Miss Fisher\'s Murder Mysteries',
    author: 'Kerry Greenwood'
  }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the flixApp!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
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