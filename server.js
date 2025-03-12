// server.js

// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize the Express app and set the port
const app = express();
const PORT = process.env.PORT || 3000;

// Define the path to the users data file (located in the project root)
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware to parse URL-encoded data (from HTML forms) and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the /public directory (your HTML file should be here)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Helper function to read users from the JSON file.
 * If the file doesn't exist, it creates an empty array.
 */
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // If file doesn't exist, create it with an empty array
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

/**
 * Helper function to write users array to the JSON file.
 */
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Handle POST requests to the /signup endpoint.
 * Expects an email and password from the request body.
 * Appends the new user data with a timestamp to users.json.
 */
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Read existing users from file
  const users = readUsers();

  // Check if the user already exists (by email)
  if (users.find(user => user.email === email)) {
    return res.status(400).send('User already exists.');
  }

  // Create new user object with a timestamp (ISO format)
  const newUser = {
    email,
    password, // In production, be sure to hash passwords!
    timestamp: new Date().toISOString()
  };

  // Add the new user to the list and write back to the file
  users.push(newUser);
  writeUsers(users);

  res.send('Signup successful.');
});

/**
 * Handle POST requests to the /login endpoint.
 * Expects an email and password from the request body.
 * Checks credentials against users.json and responds with success or error.
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Read existing users from file
  const users = readUsers();

  // Look for a user with matching email and password
  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    res.send('Login successful.');
  } else {
    res.status(401).send('Invalid email or password.');
  }
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
