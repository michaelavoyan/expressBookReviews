const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{username: "michael.avoyan", password: "123qwe"},];

const isValid = (username)=>{
  return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });

  req.session.authorization = "Bearer " + accessToken;

  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Extract username from the session token
  const token = req.session.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: "Unauthorized. No token found." });
  }

  let username;
  try {
    const decoded = jwt.verify(token, 'access');
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book not found for the given ISBN: ${isbn}.` });
  }

  // Store or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added or updated successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
