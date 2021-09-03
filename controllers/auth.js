const jwt = require('jsonwebtoken'); // use to generate signed token
const expressJwt = require('express-jwt'); // use for authorization check
const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandle');

exports.signup = (req, res) => {
  // console.log("req.body", req.body);
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: errorHandler(err),
      });
    }
    // Remove salt and hashed_password from the response body
    user.salt = undefined;
    user.hashed_password = undefined;

    res.json({
      user,
    });
  });
};

// 3 scenarios in signin case,
// 1. If email entered does not exist in DB -- error messaje
// 2. If email exist and password encripted is not equal to hash password in DB -- error MessageChannel
// 3. If everything succes -- json body with token and user info
exports.signin = (req, res) => {
  // Find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    // if doesn't find any email in the user schema
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist. Please signup',
      });
    }
    // If user is found, make sure the email and password match
    // Create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: 'Email and password dont match',
      });
    }

    // Generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // Persist the token as 't' in cookie with expiry date
    res.cookie('t', token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

// Clear de information from the token
exports.signout = (req, res) => {
  res.clearCookie('t');
  return res.json({ message: 'Signout success' });
};

// requireSignin middleware to protect any routes
exports.requireSignin = expressJwt({
  secret: 'jkasdjaadjaskjd',
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
});

// Middleware for user logged in
// Functionality: The user can only see it own profile information
exports.isAuth = (req, res, next) => {
  // return true or false.
  const user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }
  next();
};

// Middleware for admin
exports.isAdmin = (req, res, next) => {
  // role = 0  for regular user
  // role = 1 for admin user
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: 'Admin resource! Access denied.',
    });
  }
  next();
};
