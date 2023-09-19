# FlixApp - Movie Database REST API

## Project Description

FlixApp is a RESTful API and backend for a movie database. It is built using Node.js, Express, and MongoDB. The API provides endpoints to manage user accounts, store favorite movies, search for movies, directors, genres, and actors, and update user information.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Features

- User Registration: Users can sign up and create an account to access the FlixApp API.
- User Authentication: Secure authentication mechanism to protect user data and ensure secure access to API endpoints.
- Favorite Movies: Users can store their favorite movies in their personal list for easy access.
- Movie Search: Search for movies based on title, director, genre, and actors.
- Director Search: Find movies by specific directors.
- Genre Search: Browse movies by different genres.
- Actor Search: Look up movies featuring specific actors.
- User Profile Update: Users can update their personal information, including username, password, and email.

## Technologies Used

The FlixApp REST API is built using the following technologies:

- Node.js
- Express.js
- MongoDB (Database)
- JSON Web Tokens (JWT) for authentication
- Heroku (for hosting the server)
- Mongoose (MongoDB Object Modeling)
- Body-parser (Middleware for parsing JSON)
- Morgan (Logging middleware)

## Prerequisites

- Node.js: Ensure you have Node.js installed on your machine.
- MongoDB: Set up a MongoDB database to store movie and user information.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/keylan1/flixApp.git
   ```
2. Navigate to the project directory:
   ```
   cd flixapp
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Configure the environment variables:
   - Create a `.env` file in the project root.
   - Set the following environment variables in the `.env` file:
     ```
     PORT=3000
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```
   - Replace `your_mongodb_uri` with the URI of your MongoDB database.
   - Replace `your_jwt_secret` with a secret key for JWT token generation.
5. Start the server:
   ```
   npm start
   ```

## API Endpoints

The following API endpoints are available:

- **POST /users** - Create a new user account.
- **POST /login** - Authenticate user and generate an access token.
- **GET /movies** - Get a list of all movies.
- **GET /movies/:id** - Get details of a specific movie by ID.
- **GET /directors/:name** - Get movies directed by a specific director.
- **GET /genres/:name** - Get movies belonging to a specific genre.
- **GET /actors/:name** - Get movies featuring a specific actor.
- **GET /users/:username** - Get user profile information.
- **PUT /users/:username** - Update user profile information.
- **POST /users/:username/movies/:movieId** - Add a movie to a user's favorite list.
- **DELETE /users/:username/movies/:movieId** - Remove a movie from a user's favorite list.

Please refer to the API documentation or code implementation for detailed information about request/response formats and required authentication.

## Contributing

Contributions to the FlixApp project are welcome! Feel free to open issues for bug reports or feature requests. If you'd like to contribute code, please fork the repository and submit a pull request with your changes.
