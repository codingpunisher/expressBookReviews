const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticated = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {

  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticated(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];
    
  if (book){
    let newReview = req.body.reviews;
    if(newReview) {
      let u = req.session.authorization.username;
        book["reviews"][u] = newReview;
    }
    books[isbn]=book;
    res.send(`Book review added`);
  }else {
    res.send('unable to add review to book ISBN: ' + isbn)
  }
    let oldRev = books[isbn].reviews;
    console.log(oldRev);
    console.log(books);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.session.authorization.username;
  let book = books[isbn];
  console.log(user);
  if (book){
    if (books[isbn].reviews[user]){
      delete books[isbn].reviews[user];
      res.send('Book review by ' + user +  ' deleted!'); 
    }else{
      res.send('Book review by ' + user +  ' does not exist...');
    }
  }else{
    res.send('Book does not exist with this ISBN');
  }
  console.log(books);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
